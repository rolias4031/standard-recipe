import { stopRootDivPropagation } from 'lib/util-client';
import { useRouter } from 'next/router';
import React from 'react';

interface CreateActionsMenuProps {
  onEnterPreviewMode?: () => void;
  onOpenEditName: () => void;
  areButtonsDisabled: boolean;
  recipeId?: string;
}

function CreateActionsMenu({
  onEnterPreviewMode,
  onOpenEditName,
  areButtonsDisabled,
  recipeId,
}: CreateActionsMenuProps) {
  const router = useRouter();
  return (
    <div
      className="fixed left-1/3 right-0 bottom-0 top-0 rounded-l-2xl bg-white p-10 md:left-2/3 md:p-10"
      onClick={stopRootDivPropagation}
    >
      <div className="flex flex-col items-start space-y-3 text-2xl md:text-2xl">
        <button
          disabled={areButtonsDisabled}
          className="hover:text-fern active:text-fern disabled:text-concrete"
          onClick={onOpenEditName}
        >
          Edit Name
        </button>
        {onEnterPreviewMode ? (
          <button
            className="hover:text-fern active:text-fern disabled:text-concrete"
            onClick={onEnterPreviewMode}
            disabled={areButtonsDisabled}
          >
            Preview
          </button>
        ) : (
          <button
            className="hover:text-fern active:text-fern disabled:text-concrete"
            onClick={() =>
              router.push({ pathname: '/view/[recipeId]', query: { recipeId } })
            }
            disabled={areButtonsDisabled}
          >
            View
          </button>
        )}
        <button
          disabled={areButtonsDisabled}
          className="hover:text-fern active:text-fern disabled:text-concrete"
          onClick={() => {
            router.push({
              pathname: '/me',
              query: { view: 'recipes' },
            });
          }}
        >
          Home
        </button>
        {areButtonsDisabled ? (
          <span className="font-mono text-sm text-concrete">
            saving, just a sec...
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default CreateActionsMenu;
