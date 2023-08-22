import { prisma } from 'lib/prismadb';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { apiHandler } from 'lib/util';
import { Prisma } from '@prisma/client';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { id, recipeId, replace } = req.body;

  await prisma.ingredient.delete({
    where: {
      id: req.body.id,
    },
  });

  if (replace) {
    const ingredientCreateObject: Prisma.IngredientCreateInput = {
      recipe: {
        connect: {
          id: recipeId,
        },
      },
      inUse: false,
      order: 1,
    };

    await prisma.ingredient.create({
      data: ingredientCreateObject,
    });
  }

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
