import { baseUrl } from './constants';

export function createApiUrl(route: string): string {
  return `${baseUrl}${route}`;
}