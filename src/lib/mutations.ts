import { Instruction } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { FlowEquipment, FlowIngredient } from 'types/models';
import {
  BasePayload,
  CustomError,
  DeleteRecipeInputMutationBody,
  DeleteRecipeMutationBody,
  ErrorPayload,
  MutateConfig,
  CreateNewRecipeMutationPayload,
  UpdateInputMutationBody,
  CreateNewRecipeMutationBody,
  PublishRecipeMutationBody,
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
  body: CreateNewRecipeMutationBody,
): Promise<CreateNewRecipeMutationPayload> {
  return mutateWithBody<
    CreateNewRecipeMutationBody,
    CreateNewRecipeMutationPayload
  >({
    method: 'POST',
    apiRoute: 'api/recipe/new',
    body,
  });
}

export async function updateRecipeIngredientMutation(
  body: UpdateInputMutationBody<FlowIngredient[]>,
): Promise<BasePayload | ErrorPayload> {
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
  body: UpdateInputMutationBody<FlowEquipment[]>,
): Promise<BasePayload | ErrorPayload> {
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
  body: UpdateInputMutationBody<Instruction[]>,
): Promise<BasePayload | ErrorPayload> {
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

export async function updateRecipeNameMutation(
  body: UpdateInputMutationBody<string>,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/recipe/update',
    body,
  });
}

export async function deleteRecipeMutation(
  body: DeleteRecipeMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'DELETE',
    apiRoute: 'api/recipe/delete',
    body,
  });
}

export async function publishRecipeMutation(
  body: PublishRecipeMutationBody,
): Promise<BasePayload | ErrorPayload> {
  return mutateWithBody({
    method: 'POST',
    apiRoute: 'api/recipe/publish',
    body,
  });
}

export function usePublishRecipe() {
  return useMutation({ mutationFn: publishRecipeMutation });
}

export function useDeleteRecipe() {
  return useMutation({ mutationFn: deleteRecipeMutation });
}

export function useUpdateRecipeName() {
  return useMutation({ mutationFn: updateRecipeNameMutation });
}

export function useDeleteInstruction() {
  return useMutation({ mutationFn: deleteInstructionMutation });
}

export function useUpdateInstructions() {
  return useMutation({
    mutationFn: updateRecipeInstructionMutation,
  });
}

export function useUpdateIngredients() {
  return useMutation({
    mutationFn: updateRecipeIngredientMutation,
  });
}

export function useUpdateEquipment() {
  return useMutation({
    mutationFn: updateRecipeEquipmentMutation,
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
