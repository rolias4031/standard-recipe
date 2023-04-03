import { Recipe } from '@prisma/client';
import LoadingPage from 'components/common/LoadingPage';
import { useGetRecipeById } from 'lib/hooks';
import React, { ReactNode } from 'react';

interface CreateRecipeDockProps {
  recipeId: string;
  children: (data: Recipe) => ReactNode
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
