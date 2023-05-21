import React from 'react';
import { useRouter } from 'next/router';
import { TextInput, GeneralButton } from 'pirate-ui';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import { useNewRecipeModalForm } from 'lib/hooks';
import { useCreateNewDraftRecipe } from 'lib/mutations';
import LoadingSpinner from 'components/common/LoadingSpinner';

interface NewRecipeModalProps {
  onCloseModal: () => void;
  recipeDraftNames: string[];
}

function NewRecipeModal({
  onCloseModal,
  recipeDraftNames,
}: NewRecipeModalProps) {
  const router = useRouter();

  const { newDraftRecipeInputs, raiseRecipeInputs, formValidation } =
    useNewRecipeModalForm(recipeDraftNames);

  const { mutate, status } = useCreateNewDraftRecipe();
  function newDraftRecipeHandler() {
    mutate(
      { newDraftRecipeInputs },
      {
        onSuccess: (data) => {
          console.log(data.draftId);
          router.push({
            pathname: '/create/[recipeId]',
            query: { recipeId: data.draftId },
          });
        },
      },
    );
  }

  console.log(formValidation);

  return (
    <ModalBackdrop>
      <div className="bg-white rounded-sm p-10 w-3/4 h-5/6 flex flex-col">
        <GeneralButton onClick={onCloseModal}>
          <ArrowLeftIcon styles={{ icon: 'w-6 h-6' }} />
        </GeneralButton>

        <div className="h-1/4 text-center text-xl mt-10">
          First, name your new recipe.
          <br />
          This name must be unique among all your other recipes.
        </div>

        <div className="w-full h-1/4 flex flex-col justify-end">
          <TextInput
            name="name"
            placeholder="Name your new recipe"
            styles={{
              input: 'input-display w-full caret-black rounded',
              invalid: '',
            }}
            value={newDraftRecipeInputs.name}
            onChange={raiseRecipeInputs}
            isInvalid={formValidation.name?.isInvalid}
          />
          <GeneralButton
            styles={{
              button:
                'text-md text-white rounded-sm bg-fern hover:bg-jungle py-2 w-full disabled:bg-concrete',
            }}
            onClick={newDraftRecipeHandler}
            disabled={formValidation.form.isInvalid}
          >
            {status !== 'loading' ? (
              'Create'
            ) : (
              <LoadingSpinner color="white" size="6" />
            )}
          </GeneralButton>
        </div>
        <div className="text-red-500 h-1/4 flex flex-col justify-center items-center">
          {formValidation.name.error
            ? formValidation.name.error.map((e) => {
                return <div key={e}>{e}</div>;
              })
            : null}
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default NewRecipeModal;
