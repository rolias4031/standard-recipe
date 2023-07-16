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
  recipeName: string;
  children: ReactNode;
}

function PreviewController({
  recipeId,
  recipeName,
  children,
}: PreviewControllerProps) {
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
        <p className="whitespace-normal text-lg font-bold">{recipeName}</p>
        <button
          className="w-fit rounded-lg text-sm hover:text-fern active:text-fern"
          onClick={exitPreviewModeHandler}
        >
          <span className="">Editor</span>
        </button>
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
    <PreviewController recipeId={recipe.id} recipeName={recipe.name}>
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
