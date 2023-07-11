import React, { ReactNode } from 'react';

type PopoverCardSize = 'sm' | 'md';

const popoverCardSizes = new Map<PopoverCardSize, string>([
  ['sm', 'min-w-[100px] max-w-[250px]'],
  ['md', 'min-w-[150px] max-w-[250px]'],
]);

interface PopoverCardProps {
  size?: PopoverCardSize;
  children: ReactNode;
}

function PopoverCard({ size, children }: PopoverCardProps) {
  const sizeStyles = popoverCardSizes.get(size ? size : 'md');
  return (
    <div
      className={`${sizeStyles} rounded bg-fern text-xs text-white shadow-md shadow-concrete`}
    >
      {children}
    </div>
  );
}

export default PopoverCard;
