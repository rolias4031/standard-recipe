import { Equipment, IngredientUnit, Instruction } from '@prisma/client';
import { DropResult } from '@hello-pangea/dnd';
import { IngredientWithAllModName } from 'types/models';
import { ErrorPayload } from 'types/types';

export function reorderDraggableInputs<T>(result: DropResult, prev: T[]) {
  const newInputs = [...prev];

  const [movedInput] = newInputs.splice(result.source.index, 1);
  if (
    result.destination?.index === null ||
    result.destination?.index === undefined ||
    !movedInput
  )
    return prev;
  newInputs.splice(result.destination?.index, 0, movedInput);
  return newInputs;
}

export function isZeroLength(val: string | any[] | null) {
  return val ? val.length === 0 : true;
}

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
    optional: false,
    notes: '',
  };
}

export function genEquipment(): Equipment {
  return {
    id: genId(),
    name: '',
    optional: false,
    notes: '',
    recipeId: '',
  };
}

export function genInstruction(): Instruction {
  return {
    id: genId(),
    description: '',
    order: 0,
    optional: false,
    recipeId: '',
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

export function genId() {
  return (Math.random() + Math.random()).toString();
}

type InputArray = [boolean, string, string?];
type Input = InputArray | string;

export function pickStyles(...inputItems: Input[]): string {
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
    }
  });

  const classString = combinedStringArray.join(' ');

  return classString;
}
