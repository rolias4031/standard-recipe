import LoadingSpinner from 'components/common/LoadingSpinner';
import React from 'react';

function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner color='emerald-700' size='10' />
    </div>
  );
}

export default LoadingPage;
