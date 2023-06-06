import React, { ReactNode } from 'react';
interface TooltipCardProps {
  children: ReactNode;
}
function TooltipCard({ children }: TooltipCardProps) {
  return (
    <div className="max-w-[250px] p-2 text-xs rounded-md border-2 bg-fern border-fern shadow-md shadow-concrete text-white">
      {children}
    </div>
  );
}

export default TooltipCard;
