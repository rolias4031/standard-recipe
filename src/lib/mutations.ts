import { Instruction } from '@prisma/client';
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
import { Dispatch, SetStateAction } from 'react';
import { replaceRecipeInputIds } from 'components/create/utils';

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

export async function deleteIngredientMutation(
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

export async function deleteEquipmentMutation(
  body: DeleteRecipeInputMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'DELETE',
    apiRoute: 'api/equipment/delete',
    body,
  });
}

export async function updateRecipeInstructionMutation(
  body: UpdateInputMutationBody<Instruction>,
): Promise<UpdateInputMutationPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/recipe/update/instruction',
    body,
  });
}

export async function deleteInstructionMutation(
  body: DeleteRecipeInputMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'DELETE',
    apiRoute: 'api/instruction/delete',
    body,
  });
}

export function useDeleteInstruction() {
  return useMutation({ mutationFn: deleteInstructionMutation });
}

export function useUpdateInstructions(
  dispatchInstructions: Dispatch<SetStateAction<Instruction[]>>,
) {
  return useMutation({
    mutationFn: updateRecipeInstructionMutation,
    onSuccess: (data) => {
      replaceRecipeInputIds(data.inputIdPairs, dispatchInstructions);
    },
  });
}

export function useUpdateIngredients(
  dispatchIngredients: Dispatch<SetStateAction<FlowIngredient[]>>,
) {
  return useMutation({
    mutationFn: updateRecipeIngredientMutation,
    onSuccess: (data) => {
      replaceRecipeInputIds(data.inputIdPairs, dispatchIngredients);
    },
  });
}

export function useUpdateEquipment(
  dispatchEquipment: Dispatch<SetStateAction<FlowEquipment[]>>,
) {
  return useMutation({
    mutationFn: updateRecipeEquipmentMutation,
    onSuccess: (data) => {
      replaceRecipeInputIds(data.inputIdPairs, dispatchEquipment);
    },
  });
}

export function useDeleteEquipment() {
  return useMutation({ mutationFn: deleteEquipmentMutation });
}

export function useDeleteIngredient() {
  return useMutation({ mutationFn: deleteIngredientMutation });
}

export function useCreateNewDraftRecipe() {
  return useMutation({ mutationFn: createNewDraftRecipeMutation });
}
