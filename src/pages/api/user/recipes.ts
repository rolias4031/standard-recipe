import { getExtendedServerSession } from 'lib/util';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prismadb';
import { Prisma } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]';
import { UserRecipesQueryPayload } from 'types/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserRecipesQueryPayload>,
) {
  const session = await getExtendedServerSession(req, res, authOptions);

  if (!session) {
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

  const recipeDraftNames: string[] = []

  recipes.forEach((recipe) => {
    if (recipe.status === 'draft') {
      recipeDraftNames.push(recipe.name)
    }
  })

  return res.status(200).json({
    message: 'success',
    recipeDraftNames,
    recipes,
  });
}
