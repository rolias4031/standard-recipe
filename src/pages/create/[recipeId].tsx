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
          div: 'p-5 mx-auto min-h-screen flex md:p-10 xl:w-5/6',
        }}
      >
        <CreateRecipeDock recipeId={validRecipeId}>
          {(recipe) => <CreateRecipeFlow recipe={recipe} />}
        </CreateRecipeDock>
      </PageFrame>
    );
  }
}

export default CreateRecipePage;
