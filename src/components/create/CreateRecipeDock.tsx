import LoadingPage from 'components/common/LoadingPage';
import { useGetRecipeById } from 'lib/queries';
import React, { ReactNode } from 'react';
import { RecipeWithFull } from 'types/models';

interface CreateRecipeDockProps {
  recipeId: string;
  children: (data: RecipeWithFull) => ReactNode
}

function CreateRecipeDock({ recipeId, children }: CreateRecipeDockProps) {
  const { data, status } = useGetRecipeById(recipeId);
  if (data && status === 'success') {
    return <>{children(data.recipe)}</>
  }
  if (status === 'loading') {
    return <LoadingPage />
  }
  return null;
}

export default CreateRecipeDock;
