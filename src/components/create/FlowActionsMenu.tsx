import { stopRootDivPropagation } from 'lib/util-client';
import React from 'react';

interface FlowActionsMenuProps {
  onEnterPreviewMode: () => void;
  onOpenEditName: () => void;
  isPreviewDisabled: boolean;
}

function FlowActionsMenu({
  onEnterPreviewMode,
  onOpenEditName,
  isPreviewDisabled,
}: FlowActionsMenuProps) {
  return (
    <div className="fixed left-1/3 right-0 bottom-0 top-0 rounded-l-2xl bg-white p-10 md:left-2/3 md:p-10">
      <div className="flex flex-col items-start space-y-3 text-2xl md:text-2xl">
        <button
          className="hover:text-fern active:text-fern disabled:text-concrete"
          onClick={onOpenEditName}
        >
          Edit Name
        </button>
        <button
          className="hover:text-fern active:text-fern disabled:text-concrete"
          onClick={onEnterPreviewMode}
          disabled={isPreviewDisabled}
        >
          Preview
        </button>
        <button>Home</button>
      </div>
    </div>
  );
}

export default FlowActionsMenu;
