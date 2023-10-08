import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useCreateNewDraftRecipe, useImportRecipe } from 'lib/mutations';
import { recipeNameSchema } from 'validation/schemas';
import { pickStyles, stopRootDivPropagation } from 'lib/util-client';
import { ZodIssue } from 'zod';
import LoadingSpinner from 'components/common/LoadingSpinner';
import CloseButton from 'components/common/CloseButton';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import { ImportRecipeMutationPayload } from 'types/types';
import ImportLoadingModal from './ImportLoadingModal';
import ImportRecipe from './ImportRecipe';

function useExtractQueryParams() {
  const router = useRouter();
}

interface NewRecipeInputs {
  name: string;
}

interface NewRecipeDialogProps {
  onCloseDialog: () => void;
  existingRecipeNames: string[];
}

function NewRecipeDialog({
  onCloseDialog,
  existingRecipeNames,
}: NewRecipeDialogProps) {
  const router = useRouter();
  const schema = recipeNameSchema(existingRecipeNames);
  const [isImportSelected, setIsImportSelected] = useState(false);
  const [recipeImportText, setRecipeImportText] = useState<string>('');
  const [newRecipeInputs, setNewRecipeInputs] = useState<NewRecipeInputs>({
    name: '',
  });
  const [inputValidationErrors, setInputValidationErrors] = useState<
    ZodIssue[]
  >([]);

  const { mutate: createRecipeFromScratch, status } = useCreateNewDraftRecipe();
  const { mutate: importRecipe, status: importRecipeStatus } =
    useImportRecipe();

  function pushToCreatePage(
    recipeId: string,
    failedImports?: ImportRecipeMutationPayload['failedImports'],
  ) {
    const baseParams = { recipeId, stage: 'ingredients' };
    const queryParams = failedImports
      ? {
          ...baseParams,
          failedImports: [
            failedImports.ingredients,
            failedImports.equipment,
            failedImports.instructions,
          ],
        }
      : { ...baseParams };
    router.push({
      pathname: '/create/[recipeId]/',
      query: queryParams,
    });
  }

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

  const isNameValid =
    inputValidationErrors.length === 0 && newRecipeInputs.name.length > 0;

  const canStartImport =
    isNameValid &&
    recipeImportText.length > 0 &&
    importRecipeStatus !== 'loading';

  const showLoadingModal = importRecipeStatus === 'loading';

  function importRecipeHandler() {
    if (!isNameValid) {
      return;
    }
    return importRecipe(
      {
        text: recipeImportText,
        recipeName: newRecipeInputs.name,
      },
      {
        onSuccess: (data) => {
          if ('errors' in data) return;
          pushToCreatePage(data.importedRecipeId, data.failedImports);
        },
      },
    );
  }

  function createNewRecipeHandler() {
    if (!isNameValid) {
      return;
    }
    createRecipeFromScratch(
      { name: newRecipeInputs.name },
      {
        onSuccess: (data) => {
          console.log(data.draftId);
          pushToCreatePage(data.draftId);
        },
      },
    );
  }

  return (
    <>
      {showLoadingModal ? (
        <ImportLoadingModal />
      ) : (
        <ModalBackdrop modalRoot="modal-root" onClose={onCloseDialog}>
          <div
            className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-white px-5 py-5 md:px-10 md:py-10"
            onClick={stopRootDivPropagation}
          >
            <div
              className={pickStyles('flex', [
                isImportSelected,
                'justify-between',
                'justify-end',
              ])}
            >
              {isImportSelected ? (
                <button onClick={() => setIsImportSelected(false)}>
                  <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-concrete' }} />
                </button>
              ) : null}
              <CloseButton onClick={onCloseDialog} />
            </div>
            {!isImportSelected ? (
              <>
                <div className="text-center">
                  <span className="font-mono text-xl md:text-2xl">
                    Create new recipe
                  </span>
                </div>
                <div className="my-6 flex w-full flex-col justify-end">
                  <input
                    type="text"
                    className="border-b-2 border-fern py-2 text-lg outline-none md:text-xl rounded-none"
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
                <div className="flex flex-col gap-3 md:mx-auto md:w-2/3 md:flex-row">
                  <button
                    className="w-full rounded-lg bg-indigo-500 p-3 text-xl text-white disabled:bg-concrete"
                    disabled={!isNameValid}
                    onClick={() => setIsImportSelected(true)}
                  >
                    Import with AI
                  </button>
                  <button
                    onClick={createNewRecipeHandler}
                    disabled={!isNameValid}
                    className="w-full rounded-lg bg-fern p-3 text-xl text-white disabled:bg-concrete"
                  >
                    {status === 'loading' ? (
                      <LoadingSpinner size="6" color="white" />
                    ) : (
                      'From scratch'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <ImportRecipe
                canStartImport={canStartImport}
                onImportRecipe={importRecipeHandler}
                raiseRecipeImportText={setRecipeImportText}
                recipeImportText={recipeImportText}
              />
            )}
          </div>
        </ModalBackdrop>
      )}
    </>
  );
}

export default NewRecipeDialog;
