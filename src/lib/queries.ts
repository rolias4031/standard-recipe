import {
  AppError,
  createApiUrl,
  isErrorPayload,
  newUnknownServerError,
} from './util-client';
import {
  AllUnitsQueryPayload,
  AppRecipesAndUsersQueryPayload,
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
export function useGetUserRecipes() {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes });
}

async function fetchRecipeById(recipeId: string) {
  return fetchData<RecipeQueryPayload>(`api/recipe/${recipeId}`);
}
export function useGetRecipeById(recipeId: string) {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => fetchRecipeById(recipeId),
    enabled: recipeId ? true : false,
  });
}

async function fetchAllUnits() {
  return fetchData<AllUnitsQueryPayload>('api/ingredient_units/all');
}

export function useGetAllUnits() {
  return useQuery({
    queryKey: ['all units'],
    queryFn: fetchAllUnits,
  });
}

async function fetchAppRecipesAndUsers() {
  return fetchData<AppRecipesAndUsersQueryPayload>('api/admin');
}
export function useGetAppRecipesAndUsers() {
  return useQuery({ queryKey: ['admin'], queryFn: fetchAppRecipesAndUsers });
}

export function useGetRecipeViewData(recipeId: string) {
  const recipeQuery = useGetRecipeById(recipeId);
  const unitsQuery = useGetAllUnits();
  return { recipeQuery, unitsQuery };
}
