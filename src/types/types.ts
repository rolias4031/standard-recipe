import { NextApiRequest } from 'next';
import { DefaultUser, Session } from 'next-auth';
import { z } from 'zod';

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

export interface UserDraftNamesPayload extends BaseApiPayload {
  draftNames: string[];
}

export interface BaseApiPayload {
  message: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  status: RecipeStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
}

export interface ErrorResponse {
  errors: string[];
  message: string;
}

export enum RecipeStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}
