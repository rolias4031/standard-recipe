import React from 'react';
import { useRouter } from 'next/router';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import CreateRecipeFlow from 'components/create/CreateRecipeFlow';

function CreateRecipePage() {
  const router = useRouter();
  const { recipeId } = router.query;

  if (recipeId && !Array.isArray(recipeId)) {
    const validRecipeId = recipeId;

    return (
      <CreateRecipeDock recipeId={validRecipeId}>
        {(recipe) => <CreateRecipeFlow recipe={recipe} />}
      </CreateRecipeDock>
    );
  }
}

export default CreateRecipePage;
