import { Instruction, Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { apiHandler, validateOneInput } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
} from 'types/types';
import { instructionSchema } from 'validation/schemas';

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<Instruction[]>>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId, inputs: instructions } = req.body;

  for (const instruction of instructions) {
    const isValid = validateOneInput({
      schema: instructionSchema,
      input: instruction,
    });
    if (!isValid) continue;

    const instructionUpdateObject: Prisma.InstructionUpdateInput = {
      optional: instruction.optional,
      description: instruction.description,
      order: instruction.order,
      inUse: instruction.inUse,
    };

    await prisma.instruction.update({
      where: {
        id: instruction.id,
      },
      data: instructionUpdateObject,
    });

    return res.status(201).json({
      message: 'success',
    });
  }
}

export default apiHandler(handler);
