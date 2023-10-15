import {
  AppError,
  createApiUrl,
  isErrorPayload,
  newUnknownServerError,
} from './util-client';
import {
  AllUnitsQueryPayload,
  BasePayload,
  ErrorPayload,
  RecipeQueryPayload,
  UserRecipesQueryPayload,
} from 'types/types';
import { useQuery } from '@tanstack/react-query';

async function fetchData<T extends BasePayload>(url: string) {
  const response = await fetch(createApiUrl(url), {
    method: 'GET',
  });
  let result: T | ErrorPayload;
  try {
    result = await response.json();
  } catch (error) {
    throw newUnknownServerError();
  }
  if (!response.ok && isErrorPayload(result)) {
    throw new AppError(result.message, result.errors);
  }
  if (!isErrorPayload(result)) {
    return result;
  }
}

async function fetchUserRecipes() {
  return fetchData<UserRecipesQueryPayload>('api/user/recipes');
}

async function fetchRecipeById(recipeId: string) {
  return fetchData<RecipeQueryPayload>(`api/recipe/${recipeId}`);
}

async function fetchAllUnits() {
  return fetchData<AllUnitsQueryPayload>('api/ingredient_units/all');
}

export function useGetUserRecipes() {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes });
}

export function useGetRecipeById(recipeId: string) {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => fetchRecipeById(recipeId),
    enabled: recipeId ? true : false,
  });
}

export function useGetAllUnits() {
  return useQuery({
    queryKey: ['all units'],
    queryFn: fetchAllUnits,
  });
}

export function useGetRecipeViewData(recipeId: string) {
  const recipeQuery = useGetRecipeById(recipeId);
  const unitsQuery = useGetAllUnits();
  return { recipeQuery, unitsQuery };
}
