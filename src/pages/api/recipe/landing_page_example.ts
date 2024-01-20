import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prismadb';
import { ErrorPayload, RecipeQueryPayload } from 'types/types';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS, ERROR_RESPONSES } from 'lib/server/constants';
import { apiHandler } from 'lib/server/util';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecipeQueryPayload | ErrorPayload>,
) {
  const exampleRecipe = await prisma.recipe.findFirst({
    where: {
      name: 'Beef Wellington',
      AND: {
        authorId: process.env.APP_ADMIN_USER_ID,
      },
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

  if (!exampleRecipe) {
    return res.status(400).json({
      message: 'failure',
      errors: [ERRORS.NOT_FOUND('Recipe')],
    });
  }

  return res.status(200).json({
    message: 'success',
    recipe: exampleRecipe,
  });
}

export default apiHandler(handler);
