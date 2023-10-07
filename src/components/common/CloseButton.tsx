import React from 'react';
import XIcon from './icons/XIcon';

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}>
      <XIcon styles={{ icon: 'w-7 h-7 text-concrete' }} />
    </button>
  );
}

export default CloseButton;
