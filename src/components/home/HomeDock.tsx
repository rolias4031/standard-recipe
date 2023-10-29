import React, { ReactNode } from 'react';
import { useGetUserRecipes } from 'lib/queries';
import LoadingPage from 'components/common/LoadingPage';
import { UserRecipesQueryPayload } from 'types/types';

interface HomeDockProps {
  children: (data: UserRecipesQueryPayload) => JSX.Element;
}

function HomeDock({ children }: HomeDockProps) {
  const { data: homeData, status, error } = useGetUserRecipes();
  console.log({ error });
  if (homeData && status === 'success') {
    return children(homeData);
  }
  if (status === 'loading') {
    return <LoadingPage />;
  }
  return <div>error</div>;
}

export default HomeDock;
