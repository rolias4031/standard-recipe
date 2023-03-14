import { BaseZodSchema } from 'types/types';
import { z } from 'zod';
import { baseUrl } from './constants';

export function createApiUrl(route: string): string {
  return `${baseUrl}${route}`;
}