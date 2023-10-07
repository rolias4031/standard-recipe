import React, { ReactNode, useState } from 'react';

interface ButtonWithConfirmProps {
  isDisabled?: boolean;
  children: ReactNode;
  styles?: {
    button: string;
  };
  confirmComponent: ReactNode;
}

function ButtonWithConfirm({
  children,
  styles,
  confirmComponent,
  isDisabled,
}: ButtonWithConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <div className="flex space-x-2">
      <button
        disabled={isDisabled}
        className={styles?.button}
        onClick={() => setIsConfirming((prev) => !prev)}
      >
        {children}
      </button>
      {isConfirming ? confirmComponent : null}
    </div>
  );
}

export default ButtonWithConfirm;
