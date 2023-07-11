import { useQueryClient } from '@tanstack/react-query';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useUpdateRecipeName } from 'lib/mutations';
import { pickStyles } from 'lib/util-client';
import React, { useState } from 'react';

interface UpdateRecipeNameModalProps {
  recipeId: string;
  curRecipeName: string;
  onCloseModal: () => void;
}

function UpdateRecipeNameModal({
  recipeId,
  curRecipeName,
  onCloseModal,
}: UpdateRecipeNameModalProps) {
  const queryClient = useQueryClient();
  const [newRecipeName, setNewRecipeName] = useState<string>(curRecipeName);

  const { mutate: updateRecipeName, status } = useUpdateRecipeName();

  function changeNameHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setNewRecipeName(e.target.value);
  }

  function saveRecipeNameHandler() {
    updateRecipeName(
      { inputs: newRecipeName, recipeId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['recipe']);
          onCloseModal();
        },
      },
    );
  }

  return (
    <ModalBackdrop modalRoot="modal-root">
      <div className="flex w-1/2 flex-col justify-between space-y-6 rounded-lg bg-white p-5">
        <span className="mx-auto text-concrete">Update Recipe Name</span>
        <input
          autoFocus
          name="name"
          className="border-b-4 border-fern text-2xl font-bold outline-none"
          value={newRecipeName}
          onChange={changeNameHandler}
        />
        <div className="flex justify-between">
          <button
            className="rounded-lg bg-concrete px-2 py-1 text-sm text-white"
            onClick={onCloseModal}
          >
            Cancel
          </button>
          <button
            className={pickStyles(
              'rounded-lg bg-fern px-2 py-1 text-sm text-white',
              [status === 'loading', 'animate-pulse-fast'],
            )}
            onClick={saveRecipeNameHandler}
            disabled={status === 'loading'}
          >
            Save
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default UpdateRecipeNameModal;
