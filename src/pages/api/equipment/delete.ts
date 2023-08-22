import { Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { apiHandler } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId, id, replace } = req.body;

  await prisma.equipment.delete({
    where: {
      id,
    },
  });

  if (replace) {
    const equipmentCreateObject: Prisma.EquipmentCreateInput = {
      inUse: false,
      order: 1,
      recipe: {
        connect: {
          id: recipeId,
        },
      },
    };
    await prisma.equipment.create({
      data: equipmentCreateObject,
    });
  }

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
