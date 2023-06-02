import { Equipment } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { FlowEquipment, FlowIngredient } from 'types/models';
import {
  BasePayload,
  CustomError,
  DeleteIngredientMutationBody,
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

export async function deleteIngredientMutation(
  body: DeleteIngredientMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody<
    DeleteIngredientMutationBody,
    BasePayload | ErrorPayload
  >({ method: 'DELETE', apiRoute: 'api/ingredient/delete', body });
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

export const useDeleteIngredient = () => {
  return useMutation({ mutationFn: deleteIngredientMutation });
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
