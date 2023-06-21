import { IngredientUnit } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';
import InstructionsView from './InstructionsView';
import { navigateToCreateStage } from 'components/create/utils';
import { Stage } from 'types/types';

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
      stage: previousStage as Stage ?? 'ingredients',
    });
  }
  return (
    <div>
      <button className="" onClick={exitPreviewModeHandler}>
        Back To Editing
      </button>
      {children}
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
