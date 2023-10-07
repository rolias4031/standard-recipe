import { apiHandler, createEquipmentHolders, createIngredientHolders, createInstructionHolders, validateOneInput } from 'lib/server/util';
import { NextApiResponse } from 'next';
import {
  ErrorPayload,
  CreateNewRecipeMutationPayload,
  StandardRecipeApiRequest,
  CreateNewRecipeMutationBody,
} from 'types/types';
import { Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { recipeNameSchema } from 'validation/schemas';
import { getAuth } from '@clerk/nextjs/server';
import { ERROR_RESPONSES } from 'lib/server/constants';

async function handler(
  req: StandardRecipeApiRequest<CreateNewRecipeMutationBody>,
  res: NextApiResponse<CreateNewRecipeMutationPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return ERROR_RESPONSES.UNAUTHORIZED(res);
  }

  const { name } = req.body;

  const recipe: Prisma.RecipeCreateInput = {
    name,
    authorId: session.userId,
    ingredients: {
      createMany: {
        data: createIngredientHolders(30),
      },
    },
    equipment: {
      createMany: {
        data: createEquipmentHolders(15),
      },
    },
    instructions: {
      createMany: {
        data: createInstructionHolders(25),
      },
    },
  };

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
    input: req.body,
  });
  if (!isValid) {
    return ERROR_RESPONSES.INVALID_INPUT(res, 'recipe name');
  }

  const newDraftRecipe = await prisma.recipe.create({
    data: recipe,
  });

  console.log(newDraftRecipe);

  return res.status(200).json({
    message: 'success',
    draftId: newDraftRecipe.id,
  });
}

export default apiHandler(handler);
