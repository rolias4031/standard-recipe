import {
  CustomError,
  ErrorPayload,
  MutateConfig,
  NewDraftRecipeMutationInputs,
  NewDraftRecipeMutationPayload,
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
