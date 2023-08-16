import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useCreateNewDraftRecipe } from 'lib/mutations';
import { recipeNameSchema } from 'validation/schemas';
import { stopRootDivPropagation } from 'lib/util-client';
import { ZodIssue } from 'zod';
import LoadingSpinner from 'components/common/LoadingSpinner';

interface NewRecipeInputs {
  name: string;
}

interface NewRecipeDialogProps {
  onCloseModal: () => void;
  existingRecipeNames: string[];
}

function NewRecipeDialog({
  onCloseModal,
  existingRecipeNames,
}: NewRecipeDialogProps) {
  const schema = recipeNameSchema(existingRecipeNames);

  const [newRecipeInputs, setNewRecipeInputs] = useState<NewRecipeInputs>({
    name: '',
  });
  const [inputValidationErrors, setInputValidationErrors] = useState<
    ZodIssue[]
  >([]);

  function handleUpdateRecipeInputs(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
    setNewRecipeInputs((prev) => {
      return { ...prev, name: e.target.value };
    });
    const validation = schema.safeParse({ name: e.target.value });
    console.log(validation);
    setInputValidationErrors((prev: ZodIssue[]) => {
      if (!validation.success) {
        return validation.error.issues;
      }
      return [];
    });
  }

  const router = useRouter();

  const { mutate, status } = useCreateNewDraftRecipe();
  function createNewRecipeHandler() {
    mutate(
      { name: newRecipeInputs.name },
      {
        onSuccess: (data) => {
          console.log(data.draftId);
          router.push({
            pathname: '/create/[recipeId]/',
            query: { recipeId: data.draftId, stage: 'ingredients' },
          });
        },
      },
    );
  }

  return (
    <ModalBackdrop modalRoot="modal-root" onClose={onCloseModal}>
      <div
        className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-white px-5 py-10 md:px-10"
        onClick={stopRootDivPropagation}
      >
        <div className="text-center">
          <span className="font-mono text-xl">Create new recipe</span>
        </div>
        <div className="my-6 flex w-full flex-col justify-end">
          <input
            type="text"
            className="border-b-2 border-fern py-2 outline-none"
            value={newRecipeInputs.name}
            onChange={handleUpdateRecipeInputs}
            placeholder="Your Recipe Name"
          />
        </div>
        <div className="mb-6 flex flex-col items-center justify-center font-mono text-red-500">
          {inputValidationErrors.length === 0
            ? null
            : inputValidationErrors.map((e) => e.message)}
        </div>
        <button
          onClick={createNewRecipeHandler}
          disabled={inputValidationErrors.length !== 0}
          className="w-full rounded-lg bg-fern p-3 text-xl text-white disabled:bg-concrete"
        >
          {status === 'loading' ? (
            <LoadingSpinner size="6" color="white" />
          ) : (
            'Create'
          )}
        </button>
      </div>
    </ModalBackdrop>
  );
}

export default NewRecipeDialog;
