import { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prismadb';
import { ErrorPayload, UserRecipesQueryPayload } from 'types/types';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(
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

  const recipes = await prisma.recipe.findMany({
    where: {
      authorId: session.userId,
    },
  });

  const recipeDraftNames: string[] = [];

  if (recipes.length > 0) {
    recipes.forEach((recipe) => {
      if (recipe.status === 'draft') {
        recipeDraftNames.push(recipe.name);
      }
    });
  }

  return res.status(200).json({
    message: 'success',
    recipeDraftNames,
    recipes,
  });
}
