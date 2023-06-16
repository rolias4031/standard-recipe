import React, { ReactNode } from 'react';

interface RecipeViewProps {
  onExitPreviewMode: () => void;
  children: ReactNode;
}

function RecipeView({ children, onExitPreviewMode }: RecipeViewProps) {
  return (
    <div>
      <button onClick={onExitPreviewMode}>Back</button>
      {children}
    </div>
  );
}

export default RecipeView;
