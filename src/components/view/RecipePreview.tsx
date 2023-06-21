import { IngredientUnit } from '@prisma/client';
import { useRouter } from 'next/router';
import React from 'react';
import { RecipeWithFull } from 'types/models';
import InstructionsView from './InstructionsView';

function createFlowUrl() {}

interface PreviewControllerProps {
  recipeId: string;
}

function PreviewController({ recipeId }: PreviewControllerProps) {
  const router = useRouter();

  function exitPreviewModeHandler() {
    const previousStage: number | undefined =
      window.localStorage.get('previous_stage');
    router.push({
      pathname: 'create/[recipeId]/[stage]',
      query: {
        recipeId,
        stage: previousStage ? previousStage : 1,
      },
    });
  }
  return (
    <div>
      <button className="" onClick={exitPreviewModeHandler}>
        Back To Editing
      </button>
    </div>
  );
}

interface RecipeViewProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function RecipePreview({ recipe, allUnits }: RecipeViewProps) {
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

export default RecipePreview;
