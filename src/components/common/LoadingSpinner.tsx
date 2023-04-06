import React from 'react';

const fancy = (
  <div className="items-center justify-center rounded-full w-14 h-14 bg-gradient-to-tr from-indigo-500 to-pink-500">
    <div className="h-9 w-9 rounded-full bg-neutral-200"></div>
  </div>
);

type ColorOptions = 'emerald-700' | 'white';
type SizeOptions = '4' | '6' | '8' | '10'

interface LoadingSpinnerProps {
  color?: ColorOptions;
  size?: SizeOptions;
}

const colors = new Map<ColorOptions, string>([
  ['emerald-700', 'border-emerald-700 border-r-transparent'],
  ['white', 'border-white border-r-transparent'],
]);

const sizes = new Map<SizeOptions, string>([
  ['4', 'w-4 h-4'],
  ['6', 'w-6 h-6'],
  ['8', 'w-8 h-8'],
  ['10', 'w-10 h-10']
]);

function LoadingSpinner({ color = 'emerald-700', size = '8' }: LoadingSpinnerProps) {
  return (
    <div
      className={`block mx-auto border-4 rounded-full border-solid border-current animate-spin ${sizes.get(
        size,
      )} ${colors.get(color)} `}
    />
  );
}

export default LoadingSpinner;
