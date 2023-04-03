import { ErrorPayload } from 'types/types';

export function createApiUrl(route: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL}${route}`;
}

export function isErrorPayload(obj: any): obj is ErrorPayload {
  return obj && typeof obj.message === 'string' && Array.isArray(obj.errors);
}

export function genId() {
  return (Math.random() + Math.random()).toString();
}