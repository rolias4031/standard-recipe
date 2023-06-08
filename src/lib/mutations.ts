import { useMutation } from '@tanstack/react-query';
import { FlowEquipment, FlowIngredient } from 'types/models';
import {
  BasePayload,
  CustomError,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  MutateConfig,
  NewDraftRecipeMutationInputs,
  NewDraftRecipeMutationPayload,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { createApiUrl, isErrorPayload } from './util-client';

async function mutateWithBody<T, K>(config: MutateConfig<T>) {
  const response = await fetch(createApiUrl(config.apiRoute), {
    method: config.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.body),
  });
  // you get that doctype error when the server responds with unhandled error, and then response.json() doesn't get json.
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
  body: UpdateInputMutationBody<FlowIngredient>,
): Promise<UpdateInputMutationPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/recipe/update/ingredient',
    body,
  });
}

export async function deleteRecipeIngredientMutation(
  body: DeleteRecipeInputMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'DELETE',
    apiRoute: 'api/ingredient/delete',
    body,
  });
}

export async function updateRecipeEquipmentMutation(
  body: UpdateInputMutationBody<FlowEquipment>,
): Promise<UpdateInputMutationPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/recipe/update/equipment',
    body,
  });
}

export async function deleteRecipeEquipmentMutation(
  body: DeleteRecipeInputMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/equipment/delete',
    body,
  });
}

export const useDeleteEquipment = () => {
  return useMutation({ mutationFn: deleteRecipeEquipmentMutation });
};

export const useDeleteIngredient = () => {
  return useMutation({ mutationFn: deleteRecipeIngredientMutation });
};

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation });
};

export const useUpdateRecipeIngredient = () => {
  return useMutation({ mutationFn: updateRecipeIngredientMutation });
};

export const useUpdateRecipeEquipment = () => {
  return useMutation({ mutationFn: updateRecipeEquipmentMutation });
};
