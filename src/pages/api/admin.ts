import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prismadb';
import { ERROR_RESPONSES } from 'lib/server/constants';
import { apiHandler } from 'lib/server/util';
import { NextApiRequest, NextApiResponse } from 'next';
import { AppRecipesAndUsersQueryPayload, ErrorPayload } from 'types/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppRecipesAndUsersQueryPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (
    !session ||
    !session.userId ||
    session.userId !== process.env.APP_ADMIN_USER_ID
  ) {
    return ERROR_RESPONSES.UNAUTHORIZED(res);
  }

  const appRecipes = await prisma.recipe.findMany();
  const appUsers = await clerkClient.users.getUserList();

  return res.status(200).json({
    appRecipes,
    appUsers,
    message: 'success',
  });
}

export default apiHandler(handler);
