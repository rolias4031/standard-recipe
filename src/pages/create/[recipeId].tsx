import React from 'react';
import { useRouter } from 'next/router';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import CreateRecipeFlow from 'components/create/CreateRecipeFlow';
import PageFrame from 'components/common/PageFrame';

function CreateRecipePage() {
  const router = useRouter();
  const { recipeId } = router.query;

  if (recipeId && !Array.isArray(recipeId)) {
    const validRecipeId = recipeId;

    return (
      <PageFrame
        styles={{
          div: 'p-5 mx-auto min-h-screen md:p-10 xl:w-5/6',
        }}
      >
        <CreateRecipeDock recipeId={validRecipeId}>
          {(recipe, allUnits) => (
            <CreateRecipeFlow
              key={recipe.id + recipe.updatedAt}
              recipe={recipe}
              allUnits={allUnits}
            />
          )}
        </CreateRecipeDock>
        <div className="h-72" />
      </PageFrame>
    );
  }
}

export default CreateRecipePage;
