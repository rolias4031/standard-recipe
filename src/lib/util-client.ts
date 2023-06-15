import { IngredientUnit, Instruction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  FlowEquipment,
  FlowIngredient,
  IngredientMeasurement,
  InstructionTemperature,
} from 'types/models';
import { ErrorPayload } from 'types/types';

function sortTagsInDescending(tags: Array<FlowIngredient | FlowEquipment>) {
  return tags.sort((a, b) => {
    const aWords = a.name.split(' ').length;
    const bWords = b.name.split(' ').length;

    return bWords - aWords;
  });
}

const ogsplit = /(?=<)|(?<=>)/;

function createMeasurementRegex(namesToMatch: string[]) {
  return new RegExp(
    '\\b\\d+(\\.\\d+)?\\s(' + namesToMatch.join('|') + ')s?\\b',
    'gi',
  );
}

function createTagRegex(tagName: string) {
  return new RegExp(`(?<![<\\w])${tagName}(?![>\\w])`, 'g');
}

const temperatureRegex = /(\d+(\.\d+)?)[ ]?[CF]/g;

function parseInstructionForTemps(description: string) {
  const descriptionWithTemps = description.replace(
    temperatureRegex,
    (match) => {
      console.log('match', match);
      return '{' + match + '}';
    },
  );
  console.log('TEMPS', descriptionWithTemps);
  return descriptionWithTemps;
}

export function parseInstructionForFigures(
  namesToMatch: string[],
  description: string,
) {
  // create regex with names list
  const regex = createMeasurementRegex(namesToMatch);
  // apply regex to each word in description.
  const descriptionWithMeasurements = description.replace(regex, (match) => {
    return '[' + match + ']';
  });

  console.log('descriptionWithMeas', descriptionWithMeasurements);
  return descriptionWithMeasurements;
}

export function parseInstructionForTags(
  description: string,
  tags: Array<FlowIngredient | FlowEquipment>,
  allUnits: IngredientUnit[],
  unitsMap: Map<string, IngredientUnit>,
): Array<
  | string
  | FlowIngredient
  | FlowEquipment
  | IngredientMeasurement
  | InstructionTemperature
> {
  const unitNamesAndAbbs = [
    ...allUnits.map((u) => u.unit),
    ...allUnits.map((u) => u.abbreviation),
  ];
  // sort tags by number of words in name - largest go first otherwise small will break large.
  const sortedTags = sortTagsInDescending(tags);
  // create a hashmaps for quick lookup
  const tagMap = new Map();
  tags.forEach((tag) => {
    tagMap.set(tag.name, tag);
  });
  // replace input tags <markdown>
  let descripWithInputTags = description;
  sortedTags.forEach((tag) => {
    const regex = createTagRegex(tag.name);
    descripWithInputTags = descripWithInputTags.replace(regex, `<${tag.name}>`);
  });
  // apply regex for units here
  const descripWithFigures = parseInstructionForFigures(
    unitNamesAndAbbs,
    descripWithInputTags,
  );

  const descripWithTemps = parseInstructionForTemps(descripWithFigures);

  console.log(descripWithTemps);

  // console.log('descriptionWithMarkdown', descriptionWithMarkdown);
  // split into array separated by markdown and regular text
  const splitDescription = descripWithTemps.split(
    /(?=<)|(?<=>)|(?=\[)|(?<=\])|(?={)|(?<=})/,
  );

  // go over array and replace markdown with tagObject or measurementObj
  const parsed = splitDescription.map((segment) => {
    if (segment.startsWith('<')) {
      // markdown for input tag
      const tagObj = tagMap.get(segment.slice(1, -1));
      return tagObj ? tagObj : segment;
    }
    if (segment.startsWith('[')) {
      // markdown for measurement
      const [quantity, text] = segment.slice(1, -1).split(' ');
      if (!text) return;
      const unitObj = unitsMap.get(text);
      return { segment: { quantity, text }, ...unitObj };
    }
    if (segment.startsWith('{')) {
      const temp = segment.slice(1, -2);
      const unit = segment[segment.length - 2];
      const text = `${temp}°${unit}`;
      console.log(segment.length - 2);
      return { text, temperature: temp, unit };
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
    plural: '',
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
    order: 1,
    notes: '',
  };
}

export function genEquipment(): FlowEquipment {
  return {
    id: genId(),
    name: '',
    optional: false,
    notes: '',
    order: 1,
    substitutes: [],
    recipeId: '',
  };
}

export function genInstruction(): Instruction {
  return {
    id: genId(),
    description: '',
    order: 1,
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
