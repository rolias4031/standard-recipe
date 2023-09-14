import React, { ReactNode, useMemo } from 'react';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import CircleCheckIcon from './icons/CircleCheckIcon';
import CircleXIcon from './icons/CircleXIcon';
import LoadingSpinner from './LoadingSpinner';
import { IconSize, iconSizeConfig } from './util';

export function StatusIconDisplay({
  status,
  size,
}: {
  status: string;
  size?: IconSize;
}) {
  const iconSize = iconSizeConfig.get(size ?? '4');
  const statusDisplayConfig = useMemo(
    () =>
      new Map<string, ReactNode>([
        ['loading', <LoadingSpinner key={1} color="fern" size={'10'} />],
        [
          'success',
          <CircleCheckIcon
            key={2}
            styles={{ icon: `${iconSize} text-fern` }}
          />,
        ],
        [
          'error',
          <CircleXIcon key={3} styles={{ icon: `${iconSize} text-red-500` }} />,
        ],
        ['idle', null],
      ]),
    [],
  );
  return <>{statusDisplayConfig.get(status)}</>;
}
