import { Recipe } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from 'components/common/LoadingSpinner';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useDeleteRecipe } from 'lib/mutations';
import { pickStyles, stopRootDivPropagation } from 'lib/util-client';
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { mutate: deleteRecipe, status } = useDeleteRecipe();

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

  return (
    <ModalBackdrop opacity="50" modalRoot="modal-root" onClose={onCloseDialog}>
      <div
        className="fixed left-0 right-0 bottom-0"
        onClick={stopRootDivPropagation}
      >
        <div className="flex flex-col space-y-3 rounded-t-2xl bg-white px-5 py-10 text-2xl md:px-10">
          <div className="font-mono text-concrete">{recipe.name}</div>
          <div className="flex flex-col gap-3 md:flex-row">
            {recipe.status === 'published' ? (
              <Link
                href={{
                  pathname: '/edit/[recipeId]',
                  query: { recipeId: recipe.id },
                }}
                className="w-full text-center rounded-lg bg-abyss py-4 text-white"
              >
                Edit
              </Link>
            ) : null}
            <button className="w-full rounded-lg bg-abyss py-4 text-white">
              Share
            </button>
            <button
              className={pickStyles(
                'w-full rounded-lg bg-concrete py-2 text-white',
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
