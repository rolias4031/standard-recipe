import { IngredientUnit } from '@prisma/client';
import StatusRouter from 'components/common/StatusRouter';
import { useGetExampleRecipeViewData } from 'lib/queries';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';

interface RecipeExampleDockProps {
  children: (recipe: RecipeWithFull, allUnits: IngredientUnit[]) => ReactNode;
}

export default function ExampleRecipeDock({
  children,
}: RecipeExampleDockProps) {
  const { exampleRecipeQuery, unitsQuery } = useGetExampleRecipeViewData();

  if (exampleRecipeQuery.data && unitsQuery.data) {
    return (
      <>{children(exampleRecipeQuery.data.recipe, unitsQuery.data.units)}</>
    );
  }

  return (
    <StatusRouter statuses={[exampleRecipeQuery.status, unitsQuery.status]} />
  );
}
