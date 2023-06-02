import { IngredientUnit, Instruction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DropResult } from '@hello-pangea/dnd';
import { FlowEquipment, FlowIngredient } from 'types/models';
import { ErrorPayload } from 'types/types';

function sortTagsInDescending(tags: Array<FlowIngredient | FlowEquipment>) {
  return tags.sort((a, b) => {
    const aWords = a.name.split(' ').length;
    const bWords = b.name.split(' ').length;

    return bWords - aWords;
  });
}

export function parseInstructionForTags(
  description: string,
  tags: Array<FlowIngredient | FlowEquipment>,
): Array<string | FlowIngredient | FlowEquipment> {
  // sort tags by number of words in name
  const sortedTags = sortTagsInDescending(tags);
  // create a hashmap for quick lookup
  const tagMap = new Map();
  tags.forEach((tag) => {
    tagMap.set(tag.name, tag);
  });
  // replace with <markdown>
  let descriptionWithMarkdown = description;
  sortedTags.forEach((tag) => {
    const regex = new RegExp(`(?<![<\\w])${tag.name}(?![>\\w])`, 'g');
    descriptionWithMarkdown = descriptionWithMarkdown.replace(
      regex,
      `<${tag.name}>`,
    );
  });

  console.log('descriptionWithMarkdown', descriptionWithMarkdown);
  // split into array separated by markdown and regular text
  const splitDescription = descriptionWithMarkdown.split(/(?=<)|(?<=>)/);
  console.log('parseInstructionsForTags', splitDescription);

  // go over array and replace markdown with tagObject
  const parsed = splitDescription.map((segment) => {
    if (segment[0] === '<') {
      const tagObj = tagMap.get(segment.slice(1, -1));
      return tagObj ? tagObj : segment;
    }
    return segment;
  });

  return parsed;
}

export function isZeroLength(val: string | any[] | null) {
  return val ? val.length === 0 : true;
}

export function genId() {
  return 'CLIENT-' + uuidv4();
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
    property: 'mass',
  };
}

export function genIngredient(): FlowIngredient {
  return {
    id: genId(),
    recipeId: '',
    name: '',
    unit: genIngredientUnit(),
    quantity: 0,
    substitutes: [],
    optional: false,
    notes: '',
  };
}

export function genEquipment(): FlowEquipment {
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
