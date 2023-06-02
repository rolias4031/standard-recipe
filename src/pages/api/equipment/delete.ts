import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { ERRORS } from 'lib/constants';
import { prisma } from 'lib/prismadb';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';

export default async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  try {
    const deletedIngredient = await prisma.equipment.delete({
      where: {
        id: req.body.id,
      },
    });
    console.log('deleteEquipment', deletedIngredient);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        console.log('That Equipment does not exist');
        return res.status(200).json({
          message: 'ok',
        });
      }
    }
  }

  return res.status(200).json({
    message: 'success',
  });
}
