import React, { ReactNode } from 'react';
import LoadingPage from './LoadingPage';

interface StatusRouterProps {
  statuses: string[];
  children?: ReactNode;
}

function StatusRouter({ statuses, children }: StatusRouterProps) {
  const isLoading = statuses.some((status) => status === 'loading');

  const isError = statuses.some((status) => status === 'error');

  if (isLoading && !isError) {
    return <LoadingPage />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return null;
}

export default StatusRouter;
