import { IngredientUnit } from '@prisma/client';
import StatusRouter from 'components/common/StatusRouter';
import { useGetRecipeViewData } from 'lib/queries';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';

interface ViewRecipeDockProps {
  recipeId: string;
  children: (recipe: RecipeWithFull, allUnits: IngredientUnit[]) => ReactNode;
}

export default function ViewRecipeDock({
  recipeId,
  children,
}: ViewRecipeDockProps) {
  const { recipeQuery, unitsQuery } = useGetRecipeViewData(recipeId);

  if (recipeQuery.data && unitsQuery.data) {
    return <>{children(recipeQuery.data.recipe, unitsQuery.data.units)}</>;
  }

  return <StatusRouter statuses={[recipeQuery.status, unitsQuery.status]} />;
}
