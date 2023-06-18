import React, { ReactNode } from 'react';
import LoadingPage from './LoadingPage';

interface LoadingBufferProps {
  statuses: (string | boolean)[];
  children: ReactNode;
}

function LoadingBuffer({ statuses, children }: LoadingBufferProps) {
  const isLoading = statuses.some(
    (status) => status === true || status === 'loading',
  );

  if (isLoading) {
    return <LoadingPage />; // Replace this with your loading spinner component
  }

  return <>{children}</>;
}

export default LoadingBuffer;
