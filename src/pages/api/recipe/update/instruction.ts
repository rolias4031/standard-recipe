import { Instruction, Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { apiHandler, validateOneInput } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { instructionSchema } from 'validation/schemas';

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<Instruction[]>>,
  res: NextApiResponse<UpdateInputMutationPayload>,
) {
  const { recipeId, inputs: instructions } = req.body;
  const instructionIdPairs: UpdateInputMutationPayload['inputIdPairs'] = [];

  for (const instruction of instructions) {
    console.log('instruction', instruction, recipeId);
    const isValid = validateOneInput({
      schema: instructionSchema,
      input: instruction,
    });
    if (!isValid) continue;

    const instructionUpsertObject = {
      optional: instruction.optional,
      description: instruction.description,
      order: instruction.order,
    };

    const instructionCreateObject: Prisma.InstructionCreateInput = {
      ...instructionUpsertObject,
      recipe: {
        connect: {
          id: recipeId,
        },
      },
    };

    const instructionUpdateObject: Prisma.InstructionUpdateInput = {
      ...instructionUpsertObject,
    };

    const newOrUpdateInstruction = await prisma.instruction.upsert({
      where: {
        id: instruction.id,
      },
      create: instructionCreateObject,
      update: instructionUpdateObject,
    });

    instructionIdPairs.push({
      newId: newOrUpdateInstruction.id,
      oldId: instruction.id,
    });
  }

  return res.status(201).json({
    inputIdPairs: instructionIdPairs,
    message: 'success',
  });
}

export default apiHandler(handler);
