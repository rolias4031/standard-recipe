import LoadingPage from 'components/common/LoadingPage';
import { useGetAppRecipesAndUsers } from 'lib/queries';
import React from 'react';
import { AppRecipesAndUsersQueryPayload } from 'types/types';

interface AdminDockProps {
  children: (data: AppRecipesAndUsersQueryPayload) => JSX.Element;
}

function AdminDock({ children }: AdminDockProps) {
  const { data, status } = useGetAppRecipesAndUsers();

  if (data && status === 'success') {
    return children(data);
  }

  if (status === 'loading') {
    return <LoadingPage />;
  }

  return <div>error</div>;
}

export default AdminDock;
