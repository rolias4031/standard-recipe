import PageFrame from 'components/common/PageFrame';
import PublishedView from 'components/view/PublishedView';
import RecipePreview from 'components/view/RecipePreview';
import ViewModeRouter from 'components/view/ViewModeRouter';
import ViewRecipeDock from 'components/view/ViewRecipeDock';
import { useRouter } from 'next/router';
import React from 'react';

function ViewRecipePage() {
  const router = useRouter();
  const { recipeId } = router.query;
  if (recipeId && !Array.isArray(recipeId)) {
    return (
      <ViewRecipeDock recipeId={recipeId}>
        {(recipe, allUnits) => (
          <ViewModeRouter
            status={recipe.status}
            draftView={<RecipePreview recipe={recipe} allUnits={allUnits} />}
            publishedView={<PublishedView />}
          />
        )}
      </ViewRecipeDock>
    );
  }
  return null;
}

export default ViewRecipePage;
