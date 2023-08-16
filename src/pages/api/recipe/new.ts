import { validateOneInput } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  ErrorPayload,
  CreateNewRecipeMutationPayload,
  StandardRecipeApiRequest,
  CreateNewRecipeMutationBody,
} from 'types/types';
import { Prisma } from '@prisma/client';
import { prisma } from 'lib/prismadb';
import { recipeNameSchema } from 'validation/schemas';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS } from 'lib/constants';

export default async function handler(
  req: StandardRecipeApiRequest<CreateNewRecipeMutationBody>,
  res: NextApiResponse<CreateNewRecipeMutationPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { name } = req.body;

  const recipe: Prisma.RecipeCreateInput = {
    name,
    authorId: session.userId,
  };

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
    input: req.body,
  });
  if (!isValid) {
    return res.status(400).json({
      message: 'failure',
      errors: [ERRORS.INVALID_INPUT],
    });
  }

  const newDraftRecipe = await prisma.recipe.create({
    data: recipe,
  });

  console.log(newDraftRecipe);

  return res.status(200).json({
    message: 'success',
    draftId: newDraftRecipe.id,
  });
}
