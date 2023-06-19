import { IngredientUnit } from '@prisma/client';
import React from 'react';
import { RecipeWithFull } from 'types/models';
import InstructionsView from './InstructionsView';

interface RecipeViewProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function RecipeView({ recipe, allUnits }: RecipeViewProps) {
  return (
    <div>
      <InstructionsView
        allUnits={allUnits}
        equipment={recipe.equipment}
        instructions={recipe.instructions}
        ingredients={recipe.ingredients}
      />
    </div>
  );
}

export default RecipeView;
