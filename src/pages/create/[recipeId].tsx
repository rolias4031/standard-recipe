import React from 'react';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import CreateRecipeFlow from 'components/create/CreateRecipeFlow';
import { useExtractCreatePageQueryParams } from 'components/create/hooks';

function CreateRecipePage() {
  const { recipeId, stage, } = useExtractCreatePageQueryParams();

  if (recipeId && stage) {
    return (
      <CreateRecipeDock recipeId={recipeId}>
        {({ recipe, allUnits }) => (
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
