import {
  CustomError,
  ErrorPayload,
  MutateConfig,
  NewDraftRecipeMutationInputs,
} from 'types/types';
import { createApiUrl, isErrorPayload } from './util-client';

async function mutateWithBody<T>(config: MutateConfig<T>) {
  const response = await fetch(createApiUrl(config.apiRoute), {
    method: config.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.body),
  });
  const result: T | ErrorPayload = await response.json();
  if (!response.ok && isErrorPayload(result)) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  if (!isErrorPayload(result)) {
    return result;
  }
}

export function createNewDraftRecipeMutation(
  body: NewDraftRecipeMutationInputs,
) {
  return mutateWithBody<NewDraftRecipeMutationInputs>({
    method: 'POST',
    apiRoute: 'api/recipe/new',
    body,
  });
}
