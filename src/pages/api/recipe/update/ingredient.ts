import { getAuth } from '@clerk/nextjs/server';
import { prisma } from 'lib/prismadb';
import { ERRORS } from 'lib/constants';
import {
  prepareSubsForUpsert,
  validateClientInputs,
  apiHandler,
} from 'lib/util';
import { NextApiResponse } from 'next';
import { newIngredientSchema } from 'validation/schemas';
import {
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { Prisma } from '@prisma/client';
import { FlowIngredient } from 'types/models';

/*
    - this route creates/updates an array of ingredients and attaches it to recipe

    - returns the old ingredient ids (from client) and new ingredient ids (from server) so that we can replace old with new. this needs to happen because inserting an ingredient doesn't sync client id and server id (can't use client id for db). So updating an ingredient after creating without refetching will create a duplicate, because client id gets sent again which db doesn't have. So, we send both back and replace with new in state.

    - this same pattern applies to equipment and instructions in the CreateRecipeFlow.
  */

function connectUnit(ingredientUnit: FlowIngredient['unit']) {
  if (ingredientUnit) {
    return {
      connect: {
        id: ingredientUnit.id,
      },
    };
  }
  return undefined;
}

function connectOrDisconnectUnit(ingredientUnit: FlowIngredient['unit']) {
  if (ingredientUnit) {
    return connectUnit(ingredientUnit);
  }
  return { disconnect: true };
}

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<FlowIngredient>>,
  res: NextApiResponse<UpdateInputMutationPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { recipeId, inputs: ingredients } = req.body;
  const ingredientIdPairs: UpdateInputMutationPayload['inputIdPairs'] = [];

  console.log('edit/ingredients ingredients', ingredients, recipeId);

  for (const ingredient of ingredients) {
    const valid = validateClientInputs([
      {
        schema: newIngredientSchema,
        inputs: ingredient,
      },
    ]);
    if (!valid) {
      continue;
    }

    // get existing substitutes
    const ingredientWithSubs = await prisma.ingredient.findUnique({
      where: {
        id: ingredient.id,
      },
      include: {
        substitutes: {
          select: {
            name: true,
          },
        },
      },
    });

    const { disconnectSubstitutes, connectOrCreateSubstitutes } =
      prepareSubsForUpsert(
        ingredientWithSubs?.substitutes.map((s) => s.name),
        ingredient.substitutes,
      );

    // upsert object to be spread into create and update objects
    const ingredientUpsertObject = {
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
      order: ingredient.order,
      quantity: ingredient.quantity,
      notes: ingredient.notes,
      optional: ingredient.optional,
    };

    // create object
    const ingredientCreateObject: Prisma.IngredientCreateInput = {
      ...ingredientUpsertObject,
      unit: connectUnit(ingredient.unit),
      substitutes: {
        connectOrCreate: connectOrCreateSubstitutes,
      },
      recipe: {
        connect: {
          id: recipeId,
        },
      },
    };

    // update object
    const ingredientUpdateObject: Prisma.IngredientUpdateInput = {
      ...ingredientUpsertObject,
      unit: connectOrDisconnectUnit(ingredient.unit),
      substitutes: {
        connectOrCreate: connectOrCreateSubstitutes,
        disconnect: disconnectSubstitutes,
      },
    };

    const newOrUpdatedIngredient = await prisma.ingredient.upsert({
      where: {
        id: ingredient.id,
      },
      update: ingredientUpdateObject,
      create: ingredientCreateObject,
      include: {
        name: true,
        unit: true,
      },
    });

    ingredientIdPairs.push({
      oldId: ingredient.id,
      newId: newOrUpdatedIngredient.id,
    });

    console.log('edit/ingredient new ingredient', newOrUpdatedIngredient);
  }

  // as you cycle through ingredients, track which didn't have matching ids. store these in an array of objs. can use these ids to erase from ingredientIdsToUpdate.

  return res.status(200).json({
    message: 'success',
    inputIdPairs: ingredientIdPairs,
  });
}

export default apiHandler(handler);
