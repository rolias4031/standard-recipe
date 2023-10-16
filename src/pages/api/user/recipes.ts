import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prismadb';
import { ErrorPayload, UserRecipesQueryPayload } from 'types/types';
import { getAuth } from '@clerk/nextjs/server';
import { apiHandler } from 'lib/server/util';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserRecipesQueryPayload | ErrorPayload>,
) {
  const session = getAuth(req);

  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: ['No Session Found'],
    });
  }

  const isAdminUser = session.userId === process.env.APP_ADMIN_USER_ID;

  const recipeQuery = isAdminUser
    ? undefined
    : {
        where: {
          authorId: session.userId,
        },
      };

  const recipes = await prisma.recipe.findMany(recipeQuery);

  return res.status(200).json({
    message: 'success',
    recipes,
  });
}

export default apiHandler(handler);
