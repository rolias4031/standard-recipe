import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppError,
  useCreateNewDraftRecipe,
  useImportRecipe,
} from 'lib/mutations';
import { recipeNameSchema } from 'validation/schemas';
import { ZodIssue } from 'zod';
import LoadingSpinner from 'components/common/LoadingSpinner';
import { ImportRecipeMutationPayload, CustomError } from 'types/types';
import ImportLoadingModal from './ImportLoadingModal';
import ImportRecipe from './ImportRecipe';

interface NewRecipeInputs {
  name: string;
}

interface NewRecipeDialogProps {
  existingRecipeNames: string[];
}

function NewRecipeDialog({ existingRecipeNames }: NewRecipeDialogProps) {
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
  const {
    mutate: importRecipe,
    status: importRecipeStatus,
    error: importError,
  } = useImportRecipe();

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
      <div className="mx-auto p-5 lg:w-2/3">
        {!isImportSelected ? (
          <>
            <div className="pt-5 text-center">
              <span className="font-mono text-xl md:text-2xl">
                Create new recipe
              </span>
            </div>
            <div className="my-6 flex w-full flex-col justify-end">
              <input
                type="text"
                className="rounded-none border-b-2 border-fern py-2 text-lg outline-none md:text-xl"
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
                className="w-full rounded-lg bg-indigo-500 p-3 text-xl text-white disabled:bg-smoke"
                disabled={!isNameValid}
                onClick={() => setIsImportSelected(true)}
              >
                Import with AI
              </button>
              <button
                onClick={createNewRecipeHandler}
                disabled={!isNameValid}
                className="w-full rounded-lg bg-fern p-3 text-xl text-white disabled:bg-smoke"
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
            onGoBack={() => setIsImportSelected(false)}
            canStartImport={canStartImport}
            onImportRecipe={importRecipeHandler}
            raiseRecipeImportText={setRecipeImportText}
            recipeImportText={recipeImportText}
          />
        )}
      </div>
      {showLoadingModal ? <ImportLoadingModal /> : null}
      {status === 'error' && importError instanceof AppError ? (
        <div>{importError.errors[0]}</div>
      ) : null}
    </>
  );
}

export default NewRecipeDialog;
