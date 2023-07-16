import ChevronRightIcon from 'components/common/icons/ChevronRightIcon';
import { pickStyles } from 'lib/util-client';
import React, { ReactNode, useState } from 'react';

interface ViewSectionContainerProps {
  title: string;
  totalItems: number;
  children: ReactNode;
}

function ViewSectionContainer({
  title,
  totalItems,
  children,
}: ViewSectionContainerProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">{title}</span>
          <div className="flex justify-center rounded-md bg-smoke px-2 font-mono text-sm">
            <div className="text-black">{totalItems}</div>
          </div>
        </div>
        <button onClick={() => setIsSectionOpen((prev) => !prev)}>
          <ChevronRightIcon
            styles={{
              icon: pickStyles('w-5 h-5 transition', [
                isSectionOpen,
                'rotate-90',
              ]),
            }}
          />
        </button>
      </div>
      {isSectionOpen ? children : null}
    </div>
  );
}

export default ViewSectionContainer;
