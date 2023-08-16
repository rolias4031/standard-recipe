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
    <>
      <div className="sticky top-0 z-10 flex w-full flex-col gap-2 bg-fern px-3 py-3 text-center shadow-md shadow-concrete md:flex-row md:items-center md:justify-center md:px-10">
        <span className="text-white">
          This is a preview. Some features will only be shown after publishing
        </span>
        <button
          className="rounded-lg bg-white px-2 py-1 text-fern active:bg-jungle"
          onClick={exitPreviewModeHandler}
        >
          Back to Editor
        </button>
      </div>
      <div className="flex flex-col space-y-3 p-4 md:px-10 md:py-6">
        <p className="whitespace-normal text-lg text-concrete">{recipeName}</p>
        <div className="flex flex-col space-y-5 text-lg">{children}</div>
      </div>
    </>
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
