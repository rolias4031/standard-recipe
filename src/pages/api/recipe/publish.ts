import { prisma } from 'lib/prismadb';
import { apiHandler } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  ErrorPayload,
  PublishRecipeMutationBody,
  StandardRecipeApiRequest,
} from 'types/types';

async function handler(
  req: StandardRecipeApiRequest<PublishRecipeMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId } = req.body;

  // remove unused stuff

  await prisma.recipe.update({
    where: {
      id: recipeId,
    },
    data: {
      status: {
        set: 'published',
      },
    },
  });

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
