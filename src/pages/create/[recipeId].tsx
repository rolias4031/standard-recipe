import React from 'react';
import { useRouter } from 'next/router';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import CreateRecipeFlow, { stages } from 'components/create/CreateRecipeFlow';
import PageFrame from 'components/common/PageFrame';
import { Stage } from 'types/types';

function useExtractQueryParams() {
  const router = useRouter();
  const { recipeId, stage } = router.query;
  console.log('slug', router.query);
  if (
    recipeId &&
    !Array.isArray(recipeId) &&
    stage &&
    !Array.isArray(stage) &&
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
          // <PageFrame style="mx-auto h-screen min-h-screen max-h-screen md:w-5/6 lg:w-3/4 p-4">
            <CreateRecipeFlow
              key={recipe.id + recipe.updatedAt}
              recipe={recipe}
              allUnits={allUnits}
              stage={stage}
            />
          // </PageFrame>
        )}
      </CreateRecipeDock>
    );
  }

  return <div>Error</div>;
}

export default CreateRecipePage;
