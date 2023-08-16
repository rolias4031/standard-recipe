import React, { ReactNode } from 'react';
import { useGetUserRecipes } from 'lib/queries';
import LoadingPage from 'components/common/LoadingPage';
import { UserRecipesQueryPayload } from 'types/types';

interface HomeDockProps {
  children: (data: UserRecipesQueryPayload) => ReactNode;
}

function HomeDock({ children }: HomeDockProps) {
  const { data: homeData, status } = useGetUserRecipes();
  if (homeData && status === 'success') {
    return <>{children(homeData)}</>;
  }
  if (status === 'loading') {
    return <LoadingPage />;
  }
  return null
}

export default HomeDock;
