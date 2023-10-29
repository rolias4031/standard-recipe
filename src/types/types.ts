import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { Equipment, IngredientUnit, Instruction, Recipe } from '@prisma/client';
import { FlowIngredient, RecipeWithFull } from './models';
import { User } from '@clerk/nextjs/dist/api';

export type Stage = 'ingredients' | 'equipment' | 'instructions';

type ReqMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export type LockedInterface<T> = { readonly [K in keyof T]: string };

export type BaseZodSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;

export interface ValidationPayload {
  isInvalid: boolean;
  error: string[] | undefined;
}

export type FormValidationState<T extends string> = {
  [key in T | 'form']: ValidationPayload;
};

export type InputIdPairs = { oldId: string; newId: string }[];

export type AllRecipeInputs = FlowIngredient[] | Equipment[] | Instruction[];

// interfaces
export interface MutateConfig<T> {
  method: ReqMethod;
  apiRoute: string;
  body: T;
}
export interface UpdateRecipeInputHandlerArgs {
  id: string;
  name: string;
  value: string | number | boolean;
}

export type NewDraftRecipeInputs = Pick<Recipe, 'name'>;

export type SaveRecipeInputs = Pick<Recipe, 'description' | 'id'>;

// server

export type StandardRecipeApiHandler<T, K> = (
  req: StandardRecipeApiRequest<T>,
  res: NextApiResponse<K | ErrorPayload>,
) => unknown | Promise<unknown>;

export interface StandardRecipeApiRequest<T>
  extends Omit<NextApiRequest, 'body'> {
  body: T;
}

export interface CustomError extends Error {
  errors: string[];
}

// queries and mutations

export interface ImportRecipeMutationBody {
  text: string;
  recipeName: string;
}

export interface ImportRecipeMutationPayload extends BasePayload {
  importedRecipeId: string;
  failedImports?: {
    ingredients: number;
    equipment: number;
    instructions: number;
  };
}

export interface PublishRecipeMutationBody {
  recipeId: Recipe['id'];
}

export interface DeleteRecipeMutationBody {
  recipeId: Recipe['id'];
}

export interface UpdateInputMutationBody<T> {
  recipeId: Recipe['id'];
  inputs: T;
}

export interface AllUnitsQueryPayload extends BasePayload {
  units: IngredientUnit[];
}

export interface DeleteRecipeInputMutationBody {
  replace?: boolean;
  recipeId: string;
  id: string;
}

export interface CreateNewRecipeMutationBody {
  name: string;
}
export interface RecipeQueryPayload extends BasePayload {
  recipe: RecipeWithFull;
}

export interface UserRecipesQueryPayload extends BasePayload {
  recipes: Recipe[];
}

export interface AppRecipesAndUsersQueryPayload extends BasePayload {
  appRecipes: Recipe[];
  appUsers: User[];
}

export interface CreateNewRecipeMutationPayload extends BasePayload {
  draftId: string;
}

export interface CreateNewInputMutationPayload extends BasePayload {
  inputIdPairs: InputIdPairs;
}

export interface BasePayload {
  message: string;
  timestamp?: string;
}

export interface ErrorPayload {
  message: string;
  errors: string[];
}
