import React, { ReactNode, useMemo } from 'react';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import CircleCheckIcon from './icons/CircleCheckIcon';
import CircleXIcon from './icons/CircleXIcon';

export function StatusIconDisplay({
  status,
  asModal,
}: {
  status: string;
  asModal?: boolean;
}) {
  const statusDisplayConfig = useMemo(
    () =>
      new Map<string, ReactNode>([
        [
          'loading',
          <CloudArrowUpIcon
            key={1}
            styles={{ icon: 'w-6 h-6 animate-pulse-fast text-amber-500' }}
          />,
        ],
        [
          'success',
          <CircleCheckIcon key={2} styles={{ icon: 'w-6 h-6 text-fern' }} />,
        ],
        [
          'error',
          <CircleXIcon key={3} styles={{ icon: 'w-6 h-6 text-red-500' }} />,
        ],
        ['idle', null],
      ]),
    [],
  );
  return asModal ? (
    <div className="">statusDisplayConfig.get(status)</div>
  ) : (
    <div className="flex items-center text-white">
      {statusDisplayConfig.get(status)}
    </div>
  );
}
