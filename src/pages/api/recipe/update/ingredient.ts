import { getAuth } from '@clerk/nextjs/server';
import prisma from 'lib/prismadb';
import { ERRORS } from 'lib/constants';
import { validateClientInputs } from 'lib/util';
import { NextApiResponse } from 'next';
import { newIngredientSchema } from 'validation/schemas';
import {
  BasePayload,
  ErrorPayload,
  UpdateRecipeIngredientMutationBody,
  StandardRecipeApiRequest,
} from 'types/types';
import { Prisma } from '@prisma/client';

export default async function handler(
  req: StandardRecipeApiRequest<UpdateRecipeIngredientMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { recipeId, ingredient } = req.body;

  console.log('edit/ingredients', ingredient, recipeId);

  const success = validateClientInputs([
    {
      schema: newIngredientSchema,
      inputs: ingredient,
    },
  ]);

  console.log(!success);
  if (!success) {
    return res.status(400).json({
      message: 'failure',
      errors: [ERRORS.INVALID_INPUT],
    });
  }

  // * overview
  // this route needs to attach an ingredient to a recipe.
  // this means you have to create an ingredient and connect it to the recipe.
  // in creating the ingredient, you need to c/c the name, and connect the selected unit.
  // * steps:
  // check if ingredient exists. Do this by checking if id has CLIENT prepended. C/U
  // check if name exists. C/U actually dont need, can just create or connect.

  const ingredientCreateObject: Prisma.IngredientCreateInput = {
    name: {
      connectOrCreate: {
        where: {
          name: ingredient.name,
        },
        create: {
          name: ingredient.name,
        },
      },
    },
    unit: {
      connect: {
        id: ingredient.unit.id,
      },
    },
    substitutes: {
      connectOrCreate: ingredient.substitutes.map((s) => ({
        where: { name: s },
        create: { name: s },
      })),
    },
    quantity: ingredient.quantity,
    notes: ingredient.notes,
    optional: ingredient.optional,
    recipe: {
      connect: {
        id: recipeId,
      },
    },
  };

  const ingredientUpdateObject: Prisma.IngredientUpdateInput = {
    ...ingredientCreateObject,
  };

  const newOrUpdatedIngredient = await prisma.ingredient.upsert({
    where: {
      id: ingredient.id,
    },
    update: ingredientUpdateObject,
    create: ingredientCreateObject,
  });

  console.log('edit/ingredient', newOrUpdatedIngredient);

  return res.status(200).json({
    message: 'success',
  });
}
