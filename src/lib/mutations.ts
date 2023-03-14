import { CustomError, MutateConfig, NewDraftRecipeMutationInputs } from 'types/types';
import { createApiUrl } from './util-client';



async function mutateWithBody<T>(config: MutateConfig<T>) {
  const response = await fetch(createApiUrl(config.apiRoute), {
    method: config.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.body),
  });
  const result = await response.json();
  console.log(result);
  if (!response.ok || !(response.status in { 200: null, 201: null })) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  return result;
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
