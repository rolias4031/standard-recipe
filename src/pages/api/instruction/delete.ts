import { prisma } from 'lib/prismadb';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { apiHandler } from 'lib/server/util';
import { Prisma } from '@prisma/client';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { id, recipeId, replace } = req.body;

  await prisma.instruction.delete({
    where: {
      id: req.body.id,
    },
  });

  if (replace) {
    const instructionsCreateObject: Prisma.InstructionCreateInput = {
      inUse: false,
      order: 1,
      description: '',
      recipe: {
        connect: {
          id: recipeId,
        },
      },
    };
    await prisma.instruction.create({
      data: instructionsCreateObject,
    });
  }

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
