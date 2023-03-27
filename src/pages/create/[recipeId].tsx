import React from 'react';
import { useRouter } from 'next/router';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import RecipeInfoSection from 'components/create/RecipeInfoSection';

function CreateRecipePage() {
  const router = useRouter();
  const { recipeId } = router.query;

  if (recipeId && !Array.isArray(recipeId)) {
    const validRecipeId = recipeId;

    return (
      <CreateRecipeDock recipeId={validRecipeId}>
        {(recipe) => (
          <div className="bg-red-100 p-5 w-full flex flex-col h-screen">
            <RecipeInfoSection recipe={recipe} />
            <section></section>
          </div>
        )}
      </CreateRecipeDock>
    );
  }
}

export default CreateRecipePage;
