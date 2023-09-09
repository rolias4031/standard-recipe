import React from 'react';
import { useRouter } from 'next/router';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import CreateRecipeFlow, { stages } from 'components/create/CreateRecipeFlow';
import { Stage } from 'types/types';
import { isStringType } from 'types/util';

function useExtractQueryParams() {
  const router = useRouter();
  const { recipeId, stage = 'ingredients' } = router.query;
  console.log('slug', router.query);
  if (
    isStringType(recipeId) &&
    isStringType(stage) &&
    stages.includes(stage as Stage)
  ) {
    const castedStage = stage as Stage;
    return { recipeId, stage: castedStage };
  }
  return { recipeId: undefined, stage: undefined };
}

function CreateRecipePage() {
  const { recipeId, stage } = useExtractQueryParams();

  if (recipeId && stage) {
    console.log(recipeId);
    return (
      <CreateRecipeDock recipeId={recipeId}>
        {(recipe, allUnits) => (
          <CreateRecipeFlow
            key={recipe.id + recipe.updatedAt}
            recipe={recipe}
            allUnits={allUnits}
            stage={stage}
          />
        )}
      </CreateRecipeDock>
    );
  }

  return <div>Error</div>;
}

export default CreateRecipePage;
