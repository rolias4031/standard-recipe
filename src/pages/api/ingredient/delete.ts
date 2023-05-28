import { getAuth } from '@clerk/nextjs/server';
import prisma from 'lib/prismadb';
import { ERRORS } from 'lib/constants';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteIngredientMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { Prisma } from '@prisma/client';

export default async function handler(
  req: StandardRecipeApiRequest<DeleteIngredientMutationBody>,
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
    const deletedIngredient = await prisma.ingredient.delete({
      where: {
        id: req.body.id,
      },
    });
    console.log('deletedIngredient', deletedIngredient);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        console.log('That Ingredient does not exist');
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
