import { IngredientUnit } from '@prisma/client';
import {
  EquipmentWithAll,
  IngredientWithAllModName,
  InstructionWithAll,
} from 'types/models';
import { ErrorPayload } from 'types/types';

export function genIngredientUnit(): IngredientUnit {
  return {
    id: '',
    unit: '',
    abbreviation: '',
    description: '',
    property: 'mass',
  };
}

export function genIngredient(): IngredientWithAllModName {
  return {
    id: genId(),
    recipeId: '',
    name: '',
    unit: genIngredientUnit(),
    ingredientNameId: '',
    quantity: 0,
    ingredientUnitId: '',
    substitutes: [],
    instructionLinks: [],
    optional: false,
    notes: '',
  };
}

export function genEquipment(): EquipmentWithAll {
  return {
    id: genId(),
    name: '',
    optional: false,
    notes: '',
    instructionLinks: [],
    recipeId: '',
  };
}

export function genInstruction(): InstructionWithAll {
  return {
    id: genId(),
    description: '',
    order: 0,
    optional: false,
    equipmentLinks: [],
    ingredientLinks: [],
    recipeId: '',
  };
}

export function findIngredientIndexById<T extends { id: string }>(
  prev: T[],
  id: string,
) {
  return prev.findIndex((i) => i.id === id);
}

export function insertIntoPrevArray(
  prev: IngredientWithAllModName[],
  index: number,
  updatedIngredient: IngredientWithAllModName,
) {
  return [...prev.slice(0, index), updatedIngredient, ...prev.slice(index + 1)];
}

export function createApiUrl(route: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_URL}${route}`;
}

export function isErrorPayload(obj: any): obj is ErrorPayload {
  return obj && typeof obj.message === 'string' && Array.isArray(obj.errors);
}

export function genId() {
  return (Math.random() + Math.random()).toString();
}

type InputArray = [boolean, string, string?];
type Input = InputArray | string;

export function pickStyles(...inputItems: Input[]): string {
  let combinedStringArray: string[] = [];

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
    }
  });

  const classString = combinedStringArray.join(' ');

  return classString;
}
