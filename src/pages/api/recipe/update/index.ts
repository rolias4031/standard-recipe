import { getAuth } from '@clerk/nextjs/server';
import { ERROR_RESPONSES } from 'lib/server/constants';
import { prisma } from 'lib/prismadb';
import { apiHandler, validateOneInput } from 'lib/server/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
} from 'types/types';
import { recipeNameSchema } from 'validation/schemas';

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<string>>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return ERROR_RESPONSES.UNAUTHORIZED(res);
  }
  const { recipeId, inputs: newRecipeName } = req.body;
  console.log(recipeId, newRecipeName);

  // check existing recipe names
  const draftRecipes = await prisma.recipe.findMany({
    where: {
      authorId: session.userId,
      status: 'draft',
    },
    select: {
      name: true,
    },
  });

  const isValid = validateOneInput({
    schema: recipeNameSchema(draftRecipes.map((r) => r.name)),
    input: { name: newRecipeName },
  });

  if (!isValid) {
    return ERROR_RESPONSES.INVALID_INPUT(res, 'recipe name');
  }

  await prisma.recipe.update({
    where: {
      id: recipeId,
    },
    data: {
      name: newRecipeName,
    },
  });

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
