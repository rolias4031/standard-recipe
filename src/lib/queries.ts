import { createApiUrl, isErrorPayload } from './util-client';
import { BasePayload, CustomError, ErrorPayload, UserRecipesQueryPayload } from 'types/types'

async function fetchData<T extends BasePayload>(url: string) {
  const response = await fetch(createApiUrl(url), {
    method: 'GET'
  });
  const result: T | ErrorPayload = await response.json();
  console.log(result)
  if (!response.ok && isErrorPayload(result)) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  if (!isErrorPayload(result)) {
    return result
  }
}

export async function fetchUserRecipes() {
  return fetchData<UserRecipesQueryPayload>('api/user/recipes')
}