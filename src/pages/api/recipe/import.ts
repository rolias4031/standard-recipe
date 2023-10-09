import { getAuth } from '@clerk/nextjs/server';
import { IngredientUnit, Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { ERROR_RESPONSES } from 'lib/server/constants';
import {
  apiHandler,
  connectIngredientUnit,
  createEquipmentHolders,
  createIngredientHolders,
  createInstructionHolders,
  validateOneInput,
} from 'lib/server/util';
import { NextApiResponse } from 'next';
import OpenAI from 'openai';
import {
  ErrorPayload,
  ImportRecipeMutationBody,
  ImportRecipeMutationPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { recipeNameSchema } from 'validation/schemas';

export const config = {
  maxDuration: 30,
};

interface ImportResponse<T extends {}> {
  inputs: T[];
}

interface AiIngredient {
  name: string;
  quantity: number;
  unit: string;
  notes: string;
}

interface AiEquipment {
  name: string;
  notes: string;
}

interface AiInstruction {
  description: string;
  order: number;
}

const IMPORT_RECIPES_COMPLETION_INIT = {
  INGREDIENTS:
    "Hello, you are IngredientGPT. Your job is to parse the recipes I give you and list all the unique ingredients in it. When listing out ingredients, you should put them into a JSON object with the following structure: { inputs: [{ name: string, quantity: float, unit: string, notes: string }] }. These properties must always be present. If you cannot find one of them, use either an empty string or the number 0.\nHere are specific instructions for some of the fields. For the name, only include what is necessary for the recipe. Leave out brand names and other specifiers like 'organic' and 'all natural'.\nFor the unit, include the full, singular name of the unit. So instead of tbsp, use tablespoon. Instead of oz, use ounce.\nFor the notes, include any other information that seems relevant to the ingredient. For instance, here you can put brand names and other specifiers, like 'organic' and 'all-natural'.\nYou should only return the JSON object. If you cannot find any ingredients or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!",
  EQUIPMENT:
    'Hello, you are EquipmentGPT. Your job is to parse the recipes I give you and list all the unique equipment in it. When listing out equipment, you should put them into a JSON object with the following structure: { inputs: [{ name: string, notes: string }] }. These properties must always be present. Use an empty string if you cannot find one of them.\nHere are specific instructions for some of the fields. For the name, only include what is necessary for the recipe. Leave out brand names and other specifiers.\nFor the notes, include any other information that seems relevant to the ingredient. For instance, here you can put brand names and other specifiers that did not go in the name.\nYou should only return the JSON object. If you cannot find any equipment, or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!',
  INSTRUCTIONS:
    'Hello, you are InstructionGPT. Your job is to parse the recipes I give you and list all the unique instructions in it. When listing out instructions, you should put them into a JSON object with the following structure: { inputs: [{ description: string, order: number }] }. These properties must always be present. Use an empty string or the number 0 if you cannot find a property.\nHere are specific instructions for some of the fields. For the description, if the recipe comes with numbered instructions already, just use those. However, if the recipe has just unstructured text or very loose instructions, group them as you see fit. For the order, assign this based on the order you receive the instructions. If you cannot find any equipment, or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!',
};

const openAI = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

function ingredientsCompletion(text: string) {
  return openAI.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: IMPORT_RECIPES_COMPLETION_INIT.INGREDIENTS,
      },
      { role: 'user', content: text },
    ],
  });
}

function equipmentCompletion(text: string) {
  return openAI.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: IMPORT_RECIPES_COMPLETION_INIT.EQUIPMENT,
      },
      { role: 'user', content: text },
    ],
  });
}

function instructionCompletion(text: string) {
  return openAI.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: IMPORT_RECIPES_COMPLETION_INIT.INSTRUCTIONS,
      },
      { role: 'user', content: text },
    ],
  });
}

async function handler(
  req: StandardRecipeApiRequest<ImportRecipeMutationBody>,
  res: NextApiResponse<ImportRecipeMutationPayload | ErrorPayload>,
) {
  const { text, recipeName } = req.body;
  const session = getAuth(req);
  if (!session || !session.userId) {
    return ERROR_RESPONSES.UNAUTHORIZED(res);
  }
  // send to completion endpoint with prompt

  console.log('STARTING IMPORT');
  const [ingredientsResponse, equipmentResponse, instructionResponse] =
    await Promise.all([
      ingredientsCompletion(text),
      equipmentCompletion(text),
      instructionCompletion(text),
    ]);

  // safely extract all inputs from responses
  const aiIngredients = safeExtractInputs<AiIngredient>(ingredientsResponse);
  if ('error' in aiIngredients) {
    return ERROR_RESPONSES.BAD_IMPORT(res, aiIngredients.error, 'ingredients');
  }
  const aiEquipment = safeExtractInputs<AiEquipment>(equipmentResponse);
  if ('error' in aiEquipment) {
    return ERROR_RESPONSES.BAD_IMPORT(res, aiEquipment.error, 'equipment');
  }
  const aiInstructions = safeExtractInputs<AiInstruction>(instructionResponse);
  if ('error' in aiInstructions) {
    return ERROR_RESPONSES.BAD_IMPORT(
      res,
      aiInstructions.error,
      'instructions',
    );
  }

  const allUnits = await prisma.ingredientUnit.findMany();

  const allRecipes = await prisma.recipe.findMany({
    where: {
      authorId: session.userId,
    },
    select: {
      name: true,
    },
  });

  const isValid = validateOneInput({
    schema: recipeNameSchema(allRecipes.map((r) => r.name)),
    input: { name: recipeName },
  });
  if (!isValid) {
    return ERROR_RESPONSES.INVALID_INPUT(res, 'recipe name');
  }

  const failedImports = {
    ingredients: 0,
    equipment: 0,
    instructions: 0,
  };

  const importedRecipeId = await prisma.$transaction(
    async (tx) => {
      // create recipe
      const newRecipe = await tx.recipe.create({
        data: {
          authorId: session.userId,
          name: recipeName,
          status: 'draft',
          ingredients: {
            createMany: {
              data: createIngredientHolders(30 - aiIngredients.length),
            },
          },
          equipment: {
            createMany: {
              data: createEquipmentHolders(15 - aiEquipment.length),
            },
          },
          instructions: {
            createMany: {
              data: createInstructionHolders(30 - aiInstructions.length),
            },
          },
        },
      });

      // ingredients
      const ingredients = prepareIngredientCreateInputs(
        aiIngredients,
        allUnits,
        newRecipe.id,
      );
      for (const ing of ingredients) {
        try {
          await tx.ingredient.create({
            data: ing,
          });
        } catch (e) {
          failedImports.ingredients += 1;
        }
      }
      // equipment
      const equipment = prepareEquipmentCreateInputs(aiEquipment, newRecipe.id);
      for (const eq of equipment) {
        try {
          await tx.equipment.create({
            data: eq,
          });
        } catch (e) {
          failedImports.equipment += 1;
        }
      }
      // instructions
      const instructions = prepareInstructionCreateInputs(
        aiInstructions,
        newRecipe.id,
      );
      for (const ins of instructions) {
        try {
          await tx.instruction.create({
            data: ins,
          });
        } catch (e) {
          failedImports.instructions += 1;
        }
      }

      return newRecipe.id;
    },
    {
      timeout: 12000,
    },
  );

  console.log('FAILED IMPORTS', failedImports)

  const hasFailedImports =
    failedImports.ingredients > 0 ||
    failedImports.equipment > 0 ||
    failedImports.instructions > 0;

  return res.status(200).json({
    message: 'success',
    importedRecipeId,
    failedImports: hasFailedImports ? failedImports : undefined,
  });
}

function prepareInstructionCreateInputs(
  aiInstructions: AiInstruction[],
  recipeId: string,
) {
  const instructions: Prisma.InstructionCreateInput[] = aiInstructions.map(
    (ins, idx) => {
      return {
        recipe: {
          connect: {
            id: recipeId,
          },
        },
        description: ins.description,
        order: ins.order,
      };
    },
  );
  return instructions;
}

function prepareEquipmentCreateInputs(
  aiEquipment: AiEquipment[],
  recipeId: string,
) {
  const equipment: Prisma.EquipmentCreateInput[] = aiEquipment.map(
    (eq, idx) => {
      return {
        recipe: {
          connect: {
            id: recipeId,
          },
        },
        name: {
          connectOrCreate: {
            where: {
              name: eq.name,
            },
            create: {
              name: eq.name,
            },
          },
        },
        notes: eq.notes,
        order: idx + 1,
      };
    },
  );
  return equipment;
}

function prepareIngredientCreateInputs(
  aiIngredients: AiIngredient[],
  allUnits: IngredientUnit[],
  recipeId: string,
) {
  const ingredients: Prisma.IngredientCreateInput[] = aiIngredients.map(
    (ing, idx) => {
      const unit = allUnits.find((u) => u.unit === ing.unit);
      return {
        recipe: {
          connect: {
            id: recipeId,
          },
        },
        name: {
          connectOrCreate: {
            where: {
              name: ing.name,
            },
            create: {
              name: ing.name,
            },
          },
        },
        unit: connectIngredientUnit(unit),
        notes: ing.notes,
        quantity: ing.quantity,
        order: idx + 1,
      };
    },
  );
  return ingredients;
}

function safeExtractInputs<T extends {}>(
  completion: OpenAI.Chat.Completions.ChatCompletion,
): T[] | { error: string } {
  const json = completion.choices[0]?.message.content;
  if (!json) {
    return { error: 'error accessing message content' };
  }
  const obj = safeParseJSON<T>(json);
  if (!obj) {
    return { error: 'error parsing JSON' };
  }
  const inputs = safeAccessInputs<T>(obj);
  if (!inputs) {
    return { error: 'error accessing inputs' };
  }

  return inputs;
}

function safeParseJSON<T extends {}>(json: string): ImportResponse<T> | null {
  try {
    const obj: ImportResponse<T> = JSON.parse(json);
    return obj;
  } catch (error) {
    return null;
  }
}

function safeAccessInputs<T extends {}>(obj: ImportResponse<T>): T[] | null {
  const inputs = obj.inputs;
  if (!inputs || !Array.isArray(inputs)) {
    return null;
  }
  return inputs;
}

export default apiHandler(handler);
