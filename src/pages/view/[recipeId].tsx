import PageFrame from 'components/common/PageFrame';
import RecipePreview from 'components/view/RecipePreview';
import ViewRecipeDock from 'components/view/ViewRecipeDock';
import { useRouter } from 'next/router';
import React from 'react';

function ViewRecipePage() {
  const router = useRouter();
  const { recipeId } = router.query;
  if (recipeId && !Array.isArray(recipeId)) {
    return (
      <PageFrame styles={{ div: 'p-5 mx-auto min-h-screen md:p-10 xl:w-5/6' }}>
        <ViewRecipeDock recipeId={recipeId}>
          {(recipe, allUnits) => (
            <RecipePreview recipe={recipe} allUnits={allUnits} />
          )}
        </ViewRecipeDock>
      </PageFrame>
    );
  }
  return null;
}

export default ViewRecipePage;
