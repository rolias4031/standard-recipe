import { NextApiRequest } from 'next';
import { z } from 'zod';
import { Equipment, IngredientUnit, Instruction, Recipe } from '@prisma/client';
import {
  IngredientWithAllModName,
  RecipeWithAll,
  RecipeWithFull,
} from './models';

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

export interface StandardRecipeApiRequest<T>
  extends Omit<NextApiRequest, 'body'> {
  body: T;
}

export interface CustomError extends Error {
  errors: string[];
}

// queries and mutations

export interface AllUnitsQueryPayload extends BasePayload {
  units: IngredientUnit[];
}

export interface UpdateRecipeIngredientMutationBody {
  recipeId: Recipe['id'];
  ingredient: IngredientWithAllModName;
}

export interface NewDraftRecipeMutationInputs {
  newDraftRecipeInputs: NewDraftRecipeInputs;
}
export interface RecipeQueryPayload extends BasePayload {
  recipe: RecipeWithFull;
}

export interface UserRecipesQueryPayload extends BasePayload {
  recipes: Recipe[];
  recipeDraftNames: string[];
}

export interface NewDraftRecipeMutationPayload extends BasePayload {
  draftId: string;
}

export interface BasePayload {
  message: string;
}

export interface ErrorPayload {
  message: string;
  errors: string[];
}
