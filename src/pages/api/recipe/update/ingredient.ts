import { prisma } from 'lib/prismadb';
import { prepareSubsForUpsert, validateOneInput, apiHandler, connectIngredientUnit } from 'lib/server/util';
import { NextApiResponse } from 'next';
import { ingredientSchema } from 'validation/schemas';
import {
  BasePayload,
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
} from 'types/types';
import { Prisma } from '@prisma/client';
import { FlowIngredient } from 'types/models';
import { assignInputOrderByIndex } from 'components/create/utils';

/*
    - this route creates/updates an array of ingredients and attaches it to recipe

    - returns the old ingredient ids (from client) and new ingredient ids (from server) so that we can replace old with new. this needs to happen because inserting an ingredient doesn't sync client id and server id (can't use client id for db). So updating an ingredient after creating without refetching will create a duplicate, because client id gets sent again which db doesn't have. So, we send both back and replace with new in state.

    - this same pattern applies to equipment and instructions in the CreateRecipeFlow.
  */



function connectOrDisconnectUnit(ingredientUnit: FlowIngredient['unit']) {
  if (ingredientUnit) {
    return connectIngredientUnit(ingredientUnit);
  }
  return { disconnect: true };
}

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<FlowIngredient[]>>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId, inputs: ingredients } = req.body;

  const reorderedIngredients = assignInputOrderByIndex(ingredients);

  const allUnits = await prisma.ingredientUnit.findMany({
    select: {
      id: true,
    },
  });
  const allUnitIds = allUnits.map((u) => u.id);

  const allIngredientsWithSubs = await prisma.ingredient.findMany({
    where: {
      recipeId,
      AND: {
        inUse: {
          equals: true,
        },
      },
    },
    include: {
      substitutes: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(allIngredientsWithSubs);

  for (const ingredient of reorderedIngredients) {
    const isValid = validateOneInput({
      schema: ingredientSchema(allUnitIds),
      input: ingredient,
    });

    if (!isValid) {
      continue;
    }

    const ingredientWithSubs = allIngredientsWithSubs.find(
      (i) => ingredient.id === i.id,
    );

    const { disconnectSubstitutes, connectOrCreateSubstitutes } =
      prepareSubsForUpsert(
        ingredientWithSubs?.substitutes.map((s) => s.name),
        ingredient.substitutes,
      );

    // prep each ingredient
    const ingredientUpdateObject: Prisma.IngredientUpdateInput = {
      inUse: ingredient.inUse,
      notes: ingredient.notes,
      optional: ingredient.optional,
      order: ingredient.order,
      quantity: ingredient.quantity,
      substitutes: {
        connectOrCreate: connectOrCreateSubstitutes,
        disconnect: disconnectSubstitutes,
      },
      unit: connectOrDisconnectUnit(ingredient.unit),
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
    };

    await prisma.ingredient.update({
      where: {
        id: ingredient.id,
      },
      data: ingredientUpdateObject,
    });
  }

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
