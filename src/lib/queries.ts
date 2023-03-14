import { createApiUrl } from './util-client';
import { CustomError, ErrorResponse, UserDraftNamesPayload } from 'types/types'

function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return typeof obj === 'object' && obj !== null && 'errors' in obj;
}

async function fetchData<T>(url: string) {
  const response = await fetch(createApiUrl(url), {
    method: 'GET'
  });
  const result: T | ErrorResponse = await response.json();
  console.log(result);
  if (!response.ok && isErrorResponse(result)) {
    const error = new Error() as CustomError;
    error.errors = result.errors;
    throw error;
  }
  return result as T;
}

export async function fetchUserDraftNames() {
  return fetchData<UserDraftNamesPayload>('api/user/drafts')
}