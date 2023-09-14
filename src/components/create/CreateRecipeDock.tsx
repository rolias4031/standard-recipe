import { IngredientUnit } from '@prisma/client';
import StatusRouter from 'components/common/StatusRouter';
import { useGetAllUnits, useGetRecipeById } from 'lib/queries';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';

interface CreateRecipeDockProps {
  recipeId: string;
  children: ({
    recipe,
    allUnits,
  }: {
    recipe: RecipeWithFull;
    allUnits: IngredientUnit[];
  }) => ReactNode;
}

function CreateRecipeDock({ recipeId, children }: CreateRecipeDockProps) {
  const { data: recipeData, status: recipeStatus } = useGetRecipeById(recipeId);
  const { data: unitsData, status: unitsStatus } = useGetAllUnits();

  if (recipeData && unitsData) {
    return (
      <>{children({ recipe: recipeData.recipe, allUnits: unitsData.units })}</>
    );
  }

  return <StatusRouter statuses={[recipeStatus, unitsStatus]} />;
}

export default CreateRecipeDock;
