import { NextApiRequest } from 'next';
import { DefaultUser, Session } from 'next-auth';
import { z } from 'zod';
import { Prisma, Recipe } from '@prisma/client';

type ReqMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export type LockedInterface<T> = { readonly [K in keyof T]: string };

export interface SessionUser extends Omit<DefaultUser, 'id'> {}

export type BaseZodSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;

// interfaces

export interface MutateConfig<T> {
  method: ReqMethod;
  apiRoute: string;
  body: T;
}

export interface NewDraftRecipeMutationInputs {
  newDraftRecipeMutationInputs: {
    name: string;
  };
}

// server

export interface ExtendedSession extends Session {
  userId?: string;
}

export interface StandardRecipeApiRequest<T>
  extends Omit<NextApiRequest, 'body'> {
  body: T;
}

export interface CustomError extends Error {
  errors: string[];
}

// queries and mutations

export interface UserRecipesQueryPayload extends BasePayload {
  recipes?: Recipe[];
  recipeDraftNames?: string[]
}

export type UserRecipesQuery = Prisma.RecipeGetPayload<{
  select: { name: true };
}>;

export interface BasePayload {
  message: string;
  errors?: string[];
}
