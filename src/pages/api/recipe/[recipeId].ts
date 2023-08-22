import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prismadb';
import { ErrorPayload, RecipeQueryPayload } from 'types/types';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS, ERROR_RESPONSES } from 'lib/server/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecipeQueryPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return ERROR_RESPONSES.UNAUTHORIZED(res);
  }

  const { recipeId } = req.query;
  console.log(recipeId);

  if (!recipeId || Array.isArray(recipeId)) {
    return res.status(500).json({
      message: 'failure',
      errors: ['Missing or invalid recipeId'],
    });
  }

  const recipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      ingredients: {
        include: {
          name: true,
          unit: true,
          substitutes: true,
        },
      },
      equipment: {
        include: {
          name: true,
          substitutes: true,
        },
      },
      instructions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!recipe) {
    return res.status(400).json({
      message: 'failure',
      errors: [ERRORS.NOT_FOUND('Recipe')],
    });
  }

  return res.status(200).json({
    message: 'success',
    recipe,
  });
}
