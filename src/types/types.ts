import { NextApiRequest } from 'next';
import { z, ZodError } from 'zod';
import { Recipe } from '@prisma/client';

type ReqMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export type LockedInterface<T> = { readonly [K in keyof T]: string };

export type BaseZodSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;

export interface ValidationPayload {
  isInvalid: boolean;
  errors: ZodError | null
}

export type FormValidationState<T extends string> = {
  [key in T]?: ValidationPayload;
};

// interfaces

export interface MutateConfig<T> {
  method: ReqMethod;
  apiRoute: string;
  body: T;
}


export interface NewDraftRecipeMutationInputs {
  newDraftRecipeInputs: NewDraftRecipeInputs
}

export type NewDraftRecipeInputs = Pick<Recipe, 'name'>

// server

export interface StandardRecipeApiRequest<T>
  extends Omit<NextApiRequest, 'body'> {
  body: T;
}

export interface CustomError extends Error {
  errors: string[];
}

// queries and mutations

export interface UserRecipesQueryPayload extends BasePayload {
  recipes: Recipe[];
  recipeDraftNames: string[]
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
