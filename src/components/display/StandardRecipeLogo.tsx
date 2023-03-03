import React from 'react';

interface StandardRecipeLogoProps {
  styles?: {
    h1?: string;
    div?: string
  };
}

function StandardRecipeLogo({
  styles,
}: StandardRecipeLogoProps) {
  return (
    <div className={styles?.div}>
      <h1 className={`text-lg font-semibold ${styles?.h1}`}>Standard Recipe</h1>
    </div>
  );
}



export default StandardRecipeLogo;
