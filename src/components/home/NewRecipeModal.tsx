import React, { useState } from 'react';
import { ModalBackdrop, TextInput } from 'pirate-ui';
import ArrowLeftIcon from 'components/common/ArrowLeftIcon';
import { useCreateNewDraftRecipe, useNewRecipeModalForm } from 'lib/hooks';
import FormErrors from 'components/common/FormErrors';

interface NewRecipeModalProps {
  onCloseModal: () => void;
  recipeDraftNames: string[];
}

function NewRecipeModal({
  onCloseModal,
  recipeDraftNames,
}: NewRecipeModalProps) {
  const { newDraftRecipeInputs, raiseRecipeInputs, formValidation } =
    useNewRecipeModalForm(recipeDraftNames);

  const { mutate } = useCreateNewDraftRecipe();
  function newDraftRecipeHandler() {
    mutate({ newDraftRecipeInputs });
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
          <TextInput
            name="name"
            placeholder="Name your new recipe"
            styles={{
              input: 'input-display w-full caret-black rounded',
              invalid: '',
            }}
            curInput={newDraftRecipeInputs.name}
            raiseInput={raiseRecipeInputs}
            isInvalid={formValidation.name?.isInvalid}
          />
          <button
            className="text-md text-white rounded-sm bg-green-600 hover:bg-green-800 py-2 w-full"
            type="button"
            onClick={newDraftRecipeHandler}
            disabled={formValidation.form?.isInvalid}
          >
            Get Cookin
          </button>
          <FormErrors validation={formValidation} />
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default NewRecipeModal;
