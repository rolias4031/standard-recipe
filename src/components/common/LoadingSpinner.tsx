import React from 'react';
import { IconSize, iconSizeConfig } from './util';

export type ColorOptions = 'fern' | 'white';

export const colors = new Map<ColorOptions, string>([
  ['fern', 'border-fern border-r-transparent'],
  ['white', 'border-white border-r-transparent'],
]);
interface LoadingSpinnerProps {
  color?: ColorOptions;
  size?: IconSize;
}

function LoadingSpinner({ color = 'fern', size = '8' }: LoadingSpinnerProps) {
  return (
    <div
      className={`mx-auto block animate-spin rounded-full border-4 border-solid border-current ${iconSizeConfig.get(
        size,
      )} ${colors.get(color)} `}
    />
  );
}

export default LoadingSpinner;
