import { useMutation } from '@tanstack/react-query';
import {
  CustomError,
  ErrorPayload,
  MutateConfig,
  NewDraftRecipeMutationInputs,
  NewDraftRecipeMutationPayload,
  UpdateRecipeIngredientMutationBody,
  UpdateRecipeIngredientMutationPayload,
} from 'types/types';
import { createApiUrl, isErrorPayload } from './util-client';

async function mutateWithBody<T, K>(config: MutateConfig<T>) {
  const response = await fetch(createApiUrl(config.apiRoute), {
    method: config.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.body),
  });
  const result: K | ErrorPayload = await response.json();
  if (!response.ok && isErrorPayload(result)) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  console.log('mutateWithBody', result);
  return result as K;
}

export async function createNewDraftRecipeMutation(
  body: NewDraftRecipeMutationInputs,
): Promise<NewDraftRecipeMutationPayload> {
  return mutateWithBody<
    NewDraftRecipeMutationInputs,
    NewDraftRecipeMutationPayload
  >({
    method: 'POST',
    apiRoute: 'api/recipe/new',
    body,
  });
}

export async function updateRecipeIngredientMutation(
  body: UpdateRecipeIngredientMutationBody,
): Promise<UpdateRecipeIngredientMutationPayload> {
  return mutateWithBody<
    UpdateRecipeIngredientMutationBody,
    UpdateRecipeIngredientMutationPayload
  >({
    method: 'POST',
    apiRoute: 'api/recipe/update/ingredient',
    body,
  });
}

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation });
};

export const useUpdateRecipeIngredient = () => {
  return useMutation({ mutationFn: updateRecipeIngredientMutation });
};
