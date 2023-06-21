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
      <PageFrame
        styles={{
          div: 'p-5 mx-auto min-h-screen md:p-10 xl:w-5/6',
        }}
      >
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
        <div className="h-72" />
      </PageFrame>
    );
  }

  return <div>Error</div>;
}

export default CreateRecipePage;
