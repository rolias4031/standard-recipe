import React, { ReactNode, useEffect, useState } from 'react';

interface ButtonWithConfirmProps {
  children: ReactNode;
  styles?: {
    button: string;
  };
  confirmComponent: ReactNode
}

function ButtonWithConfirm({
  children,
  styles,
  confirmComponent
}: ButtonWithConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <div className="flex space-x-2">
      <button
        className={styles?.button}
        onClick={() => setIsConfirming((prev) => !prev)}
      >
        {children}
      </button>
      {isConfirming ? (
        confirmComponent
      ) : null}
    </div>
  );
}

export default ButtonWithConfirm;
