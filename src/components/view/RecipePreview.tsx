import { IngredientUnit } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';
import InstructionsView from './InstructionsView';
import { navigateToCreateStage } from 'components/create/utils';
import { Stage } from 'types/types';
import IngredientsView from './IngredientsView';
import EquipmentView from './EquipmentView';

const defaultExitStage = 'ingredients';

interface PreviewControllerProps {
  recipeId: string;
  children: ReactNode;
}

function PreviewController({ recipeId, children }: PreviewControllerProps) {
  const router = useRouter();

  function exitPreviewModeHandler() {
    const previousStage: string | null =
      window.localStorage.getItem('previous_stage');
    navigateToCreateStage(router, {
      recipeId,
      stage: (previousStage as Stage) ?? defaultExitStage,
    });
  }
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex justify-between">
        <button className="w-fit" onClick={exitPreviewModeHandler}>
          Back To Editing
        </button>
        <span>Preview</span>
      </div>
      <div className="flex flex-col space-y-5">{children}</div>
    </div>
  );
}

interface RecipeViewProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function RecipePreview({ recipe, allUnits }: RecipeViewProps) {
  return (
    <PreviewController recipeId={recipe.id}>
      <IngredientsView ingredients={recipe.ingredients} />
      <EquipmentView equipment={recipe.equipment} />
      <InstructionsView
        allUnits={allUnits}
        equipment={recipe.equipment}
        instructions={recipe.instructions}
        ingredients={recipe.ingredients}
      />
    </PreviewController>
  );
}

export default RecipePreview;
