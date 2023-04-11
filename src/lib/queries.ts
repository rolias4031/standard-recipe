import { createApiUrl, isErrorPayload } from './util-client';
import { BasePayload, CustomError, ErrorPayload, RecipeQueryPayload, UserRecipesQueryPayload } from 'types/types'
import { useQuery } from '@tanstack/react-query';

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

export async function fetchRecipeById(recipeId: string) {
  return fetchData<RecipeQueryPayload>(`api/recipe/${recipeId}`)
}


export const useGetUserRecipes = () => {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes });
};

export const useGetRecipeById = (recipeId: string) => {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => fetchRecipeById(recipeId),
    enabled: recipeId ? true : false,
  });
};