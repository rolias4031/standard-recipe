import { useQueryClient } from '@tanstack/react-query';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useUpdateRecipeName } from 'lib/mutations';
import { pickStyles, stopRootDivPropagation } from 'lib/util-client';
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
        },
      },
    );
  }

  return (
    <ModalBackdrop modalRoot="modal-root" onClose={onCloseModal}>
      <div
        className="fixed left-0 right-0 bottom-0 top-52 flex flex-col space-y-10 rounded-t-2xl bg-white p-5 md:p-10"
        onClick={stopRootDivPropagation}
      >
        <span className="mx-auto text-concrete">Update Recipe Name</span>
        <input
          autoFocus
          name="name"
          className="border-b-4 border-fern text-lg outline-none lg:text-2xl"
          value={newRecipeName}
          onChange={changeNameHandler}
        />
        <div className="flex justify-between">
          <button
            className="rounded-lg bg-concrete px-2 py-1 text-2xl text-white"
            onClick={onCloseModal}
          >
            Cancel
          </button>
          <button
            className={pickStyles(
              'rounded-lg bg-fern px-2 py-1 text-2xl text-white',
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
