import React, { ReactNode, useState } from 'react';
import { useExtractCreatePageQueryParams } from 'components/create/hooks';
import CreateRecipeDock from 'components/create/CreateRecipeDock';
import EditRecipe from 'components/edit/EditRecipe';
import { genId } from 'lib/util-client';

interface UseForceRerenderOutputs {
  renderKey: string;
  forceRerender: () => void;
}

function useForceRerender(): UseForceRerenderOutputs {
  const [renderKey, setRenderKey] = useState(() => genId());
  function forceRerender() {
    setRenderKey(genId());
  }

  return { renderKey, forceRerender };
}

function ComponentRerenderControl({
  children,
}: {
  children: (args: UseForceRerenderOutputs) => ReactNode;
}) {
  const args = useForceRerender();
  return <>{children(args)}</>;
}

function EditRecipePage() {
  const { recipeId, stage } = useExtractCreatePageQueryParams();
  if (recipeId && stage) {
    return (
      <>
        <CreateRecipeDock recipeId={recipeId}>
          {({ recipe, allUnits }) => (
            <ComponentRerenderControl>
              {({ renderKey, forceRerender }) => (
                <EditRecipe
                  key={renderKey}
                  forceRerender={forceRerender}
                  recipe={recipe}
                  allUnits={allUnits}
                  stage={stage}
                />
              )}
            </ComponentRerenderControl>
          )}
        </CreateRecipeDock>
      </>
    );
  }
  return null;
}

export default EditRecipePage;
