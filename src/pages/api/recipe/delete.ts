import { prisma } from 'lib/prismadb';
import { apiHandler } from 'lib/server/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId } = req.body;

  console.log('RECIPE ID', recipeId)

  await prisma.recipe.delete({
    where: {
      id: recipeId,
    },
  });

  res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
