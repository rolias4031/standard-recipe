import { ToggleStylesInputArray, pickStyles } from 'lib/util-client';
import React, { ReactNode } from 'react';

interface BaseButtonProps {
  text?: string;
  isToggled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
}

function BaseButton({ text, isToggled, onClick, children }: BaseButtonProps) {
  const toggleStyles: ToggleStylesInputArray | null = isToggled ? [isToggled, 'bg-fern'] : null;

  return (
    <button
      className={pickStyles('rounded-sm px-2 py-1 text-sm', toggleStyles)}
      onClick={onClick}
    >
      {text}
      {children}
    </button>
  );
}

export default BaseButton;
