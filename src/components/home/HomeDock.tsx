import React, { ReactNode } from 'react';
import { useGetUserRecipes } from 'lib/hooks';
import LoadingPage from 'components/common/LoadingPage';
import { UserRecipesQueryPayload } from 'types/types';

interface HomeDockProps {
  children: (data: UserRecipesQueryPayload) => ReactNode;
}

function HomeDock({ children }: HomeDockProps) {
  const { data, status } = useGetUserRecipes();
  if (data && status === 'success') {
    return <>{children(data)}</>;
  }
  if (status === 'loading') {
    return <LoadingPage />;
  }
  return null
}

export default HomeDock;
