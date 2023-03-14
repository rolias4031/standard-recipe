import { ModalBackdrop } from 'pirate-ui';
import React, { useState } from 'react';
import { SessionUser } from 'types/types';
import ArrowLeftIcon from 'components/util/ArrowLeftIcon';
import { useCreateNewDraftRecipe, useGetUserDraftNames } from 'lib/hooks';

interface NewRecipeModalProps {
  user?: SessionUser | undefined;
  onCloseModal: () => void;
}

function NewRecipeModal({ user, onCloseModal }: NewRecipeModalProps) {
  const [newRecipeName, setNewRecipeName] = useState<string>('');
  const { data, status } = useGetUserDraftNames();
  const { mutate } = useCreateNewDraftRecipe();

  function newDraftRecipeHandler() {
    mutate({ newDraftRecipeMutationInputs: { name: newRecipeName } });
  }

  function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    if (!data) return
    if (data.draftNames.includes(e.target.value)) {
      console.log('INVALID');
    }
    setNewRecipeName(e.target.value);
  }

  return (
    <ModalBackdrop>
      <div className="bg-white rounded-sm p-10 w-3/4 h-5/6 flex flex-col">
        <ArrowLeftIcon
          styles={{ icon: 'w-6 h-6' }}
          onCloseModal={onCloseModal}
        />
        <p className="text-center text-gray-800 text-xl mt-10">
          First, name your new recipe.
          <br />
          This name must be unique among all your other recipes.
        </p>

        <div className="w-full my-auto">
          <input
            type="text"
            className="input-display w-full"
            placeholder="Name your recipe"
            value={newRecipeName}
            onChange={onChangeHandler}
          />
          <button
            className="text-md text-white rounded-sm bg-green-600 hover:bg-green-800 py-2 w-full"
            type="button"
            onClick={newDraftRecipeHandler}
          >
            Get Cookin
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default NewRecipeModal;
