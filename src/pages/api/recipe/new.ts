import { validateClientInputs } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  ErrorPayload,
  NewDraftRecipeMutationInputs,
  NewDraftRecipeMutationPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { Prisma } from '@prisma/client';
import prisma from 'lib/prismadb';
import { newDraftRecipeSchema } from 'validation/schemas';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS } from 'lib/constants';

export default async function handler(
  req: StandardRecipeApiRequest<NewDraftRecipeMutationInputs>,
  res: NextApiResponse<NewDraftRecipeMutationPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { newDraftRecipeInputs } = req.body;

  const recipe: Prisma.RecipeCreateInput = {
    name: newDraftRecipeInputs.name,
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

  const valid = validateClientInputs([
    {
      schema: newDraftRecipeSchema(draftRecipes.map((r) => r.name)),
      inputs: recipe,
    },
  ]);
  if (!valid) {
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
