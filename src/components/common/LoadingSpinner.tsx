import React from 'react';

type ColorOptions = 'fern' | 'white';
type SizeOptions = '4' | '6' | '8' | '10'

interface LoadingSpinnerProps {
  color?: ColorOptions;
  size?: SizeOptions;
}

const colors = new Map<ColorOptions, string>([
  ['fern', 'border-fern border-r-transparent'],
  ['white', 'border-white border-r-transparent'],
]);

const sizes = new Map<SizeOptions, string>([
  ['4', 'w-4 h-4'],
  ['6', 'w-6 h-6'],
  ['8', 'w-8 h-8'],
  ['10', 'w-10 h-10']
]);

function LoadingSpinner({ color = 'fern', size = '8' }: LoadingSpinnerProps) {
  return (
    <div
      className={`block mx-auto border-4 rounded-full border-solid border-current animate-spin ${sizes.get(
        size,
      )} ${colors.get(color)} `}
    />
  );
}

export default LoadingSpinner;
