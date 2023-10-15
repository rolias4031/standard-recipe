import { Prisma } from '@prisma/client';
import { ALL_INGREDIENT_UNITS } from 'lib/constants';
import { prisma } from 'lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const ingredientUnitsForCreation: Prisma.IngredientUnitCreateManyInput[] =
    ALL_INGREDIENT_UNITS.map((u): Prisma.IngredientUnitCreateManyInput => {
      const { id, ...propertiesToCopy } = u;
      return { ...propertiesToCopy };
    });

  const newUnits = await prisma.ingredientUnit.createMany({
    data: ingredientUnitsForCreation,
  });

  console.log('NEW UNITS', newUnits);

  return res.status(201).json({
    message: 'success',
  });
}
