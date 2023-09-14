import { IngredientUnit } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ErrorPayload } from 'types/types';

export function capitalizeString(input: string): string {
  if (!input || typeof input !== 'string' || input.length === 0) {
    return '';
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function isZeroLength(val: string | any[] | null) {
  return val ? val.length === 0 : true;
}

export function genId() {
  return uuidv4();
}

export function isClientId(id: string) {
  return id.startsWith('CLIENT-');
}

export function genIngredientUnit(): IngredientUnit {
  return {
    id: '',
    unit: '',
    abbreviation: '',
    description: '',
    plural: '',
    property: 'mass',
  };
}

export function findRecipeInputIndexById<T extends { id: string }>(
  prev: T[],
  id: string,
) {
  return prev.findIndex((i) => i.id === id);
}

export function insertIntoPrevArray<T>(
  prev: T[],
  index: number,
  updatedIngredient: T,
) {
  return [...prev.slice(0, index), updatedIngredient, ...prev.slice(index + 1)];
}

export function createApiUrl(route: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL}${route}`;
}

export function isErrorPayload(obj: any): obj is ErrorPayload {
  return obj && typeof obj.message === 'string' && Array.isArray(obj.errors);
}

export type ToggleStylesInputArray = [boolean | undefined, string, string?];
type Input = ToggleStylesInputArray | string;

export function pickStyles(
  ...inputItems: (Input | null | undefined)[]
): string {
  const combinedStringArray: string[] = [];

  inputItems.forEach((inputItem) => {
    if (Array.isArray(inputItem)) {
      const [condition, trueString, falseString] = inputItem;

      if (condition) {
        combinedStringArray.push(trueString);
      } else if (falseString !== undefined) {
        combinedStringArray.push(falseString);
      }
    } else if (typeof inputItem === 'string') {
      combinedStringArray.push(inputItem);
    } else if (inputItem === null) {
      return;
    }
  });

  const classString = combinedStringArray.join(' ');

  return classString;
}

export function stopRootDivPropagation(e: React.MouseEvent<HTMLDivElement>) {
  e.stopPropagation();
}
