import { validateClientInputs } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  ErrorPayload,
  SaveRecipeMutationInputs,
  StandardRecipeApiRequest,
} from 'types/types';
import { Prisma } from '@prisma/client';
import prisma from 'lib/prismadb';
import { newRecipeInfoInputsSchema } from 'validation/schemas';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS } from 'lib/constants';

export default async function handler(
  req: StandardRecipeApiRequest<SaveRecipeMutationInputs>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { saveRecipeMutationInputs } = req.body;
  const { id } = req.body.saveRecipeMutationInputs

  const recipeDataToUpdate: Prisma.RecipeUpdateInput = {
    description: saveRecipeMutationInputs.description,
  };

  const valid = validateClientInputs([
    { schema: newRecipeInfoInputsSchema, inputs: saveRecipeMutationInputs },
  ]);
  if (!valid) {
    return res.status(400).json({
      message: 'failure',
      errors: [ERRORS.INVALID_INPUT],
    });
  }

  const newDraftRecipe = await prisma.recipe.update({
    where: {
      id,
    },
    data: recipeDataToUpdate
  });

  console.log(newDraftRecipe);

  return res.status(200).json({
    message: 'success',
  });
}
