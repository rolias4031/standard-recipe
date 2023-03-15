import { createApiUrl } from './util-client';
import { BasePayload, CustomError, UserRecipesQueryPayload } from 'types/types'

async function fetchData<T extends BasePayload>(url: string) {
  const response = await fetch(createApiUrl(url), {
    method: 'GET'
  });
  const result: T = await response.json();
  console.log(result);
  if (!response.ok && result.errors) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  return result;
}

export async function fetchUserRecipes() {
  return fetchData<UserRecipesQueryPayload>('api/user/recipes')
}