import { Recipe } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from 'components/common/LoadingSpinner';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useCopyToClipboard } from 'components/common/hooks';
import ClipboardIcon from 'components/common/icons/ClipboardIcon';
import XIcon from 'components/common/icons/XIcon';
import { useDeleteRecipe } from 'lib/mutations';
import {
  createShareUrl,
  pickStyles,
  stopRootDivPropagation,
} from 'lib/util-client';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import React, { useState } from 'react';

interface RecipeOptionDialogProps {
  recipe: Recipe;
  onCloseDialog: () => void;
}

function RecipeOptionDialog({
  recipe,
  onCloseDialog,
}: RecipeOptionDialogProps) {
  const queryClient = useQueryClient();
  const { isCopiedToClipboard, copyToClipboardHandler } = useCopyToClipboard();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { mutate: deleteRecipe, status } = useDeleteRecipe();

  const isRecipePublished = recipe.status === 'published';

  async function handleConfirmDelete(deleteMessage: string) {
    if (deleteMessage !== 'delete') return;
    deleteRecipe(
      { recipeId: recipe.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['user', 'recipes']);
        },
      },
    );
  }

  const editLink: Url = {
    pathname: isRecipePublished ? '/edit/[recipeId]' : '/create/[recipeId]',
    query: { recipeId: recipe.id },
  };

  return (
    <ModalBackdrop opacity="50" modalRoot="modal-root" onClose={onCloseDialog}>
      <div
        className="fixed left-0 right-0 bottom-0 flex flex-col rounded-t-2xl bg-white px-5 py-5 font-mono text-2xl md:px-10"
        onClick={stopRootDivPropagation}
      >
        <button className="ml-auto" onClick={onCloseDialog}>
          <XIcon styles={{ icon: 'w-8 h-8 text-concrete' }} />
        </button>
        <div className="flex flex-col space-y-3">
          <div className="font-mono text-concrete">{recipe.name}</div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              href={editLink}
              className="w-full rounded-lg bg-fern py-4 text-center text-white"
            >
              Edit
            </Link>
            {isRecipePublished ? (
              <button
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-fern py-4 font-mono text-white"
                onClick={() =>
                  copyToClipboardHandler(createShareUrl(recipe.id))
                }
              >
                {isCopiedToClipboard ? (
                  <p>url copied</p>
                ) : (
                  <>
                    <p className="inline">Share</p>
                    <ClipboardIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                  </>
                )}
              </button>
            ) : null}
            <button
              className={pickStyles(
                'w-full rounded-lg bg-abyss py-2 text-white',
                [isConfirmingDelete, 'bg-red-500'],
              )}
              onClick={() => setIsConfirmingDelete(true)}
            >
              {status === 'loading' ? (
                <LoadingSpinner color="white" size="8" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
          {isConfirmingDelete ? (
            <input
              id="confirm-delete"
              className={
                'w-full rounded-lg border border-red-400 px-2 py-1 text-lg'
              }
              type="text"
              placeholder='type "delete" to confirm'
              onChange={(e) => handleConfirmDelete(e.target.value)}
            />
          ) : null}
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default RecipeOptionDialog;
