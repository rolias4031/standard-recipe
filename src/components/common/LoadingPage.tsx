import LoadingSpinner from 'components/common/LoadingSpinner';
import React from 'react';

function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner color='green' size='10' />
    </div>
  );
}

export default LoadingPage;
