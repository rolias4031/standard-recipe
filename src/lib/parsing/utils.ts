import { IngredientUnit } from '@prisma/client';
import { useMemo } from 'react';
import {
  EquipmentWithAll,
  IngredientWithAll,
  InstructionMeasurement,
  InstructionTemperature,
} from 'types/models';

type markdownConfigKey = 'item' | 'measurement' | 'temperature';

export const markdownConfig: { [key in markdownConfigKey]: [string, string] } =
  {
    item: ['<', '>'],
    measurement: ['[', ']'],
    temperature: ['{', '}'],
  };

export function removeMarkdown(segment: string) {
  return segment.slice(1, -1);
}

function createMarkdown(string: string, config: [string, string]) {
  return config[0] + string + config[1];
}

const splitByMarkdownRegex = /(?=<)|(?<=>)|(?=\[)|(?<=\])|(?={)|(?<=})/;

const temperatureRegex = /(\d+(\.\d+)?)[ ]?[CF]/g;

export function createMeasurementRegex(namesToMatch: string[]) {
  return new RegExp(
    '\\b\\d+(\\.\\d+)?\\s(' + namesToMatch.join('|') + ')s?\\b',
    'gi',
  );
}

export function createItemRegex(item: string) {
  return new RegExp(`(?<![<\\w])${item}(?![>\\w])`, 'g');
}

export function splitIntoMarkdownAndStrings(description: string) {
  return description.split(splitByMarkdownRegex);
}

export const addMarkdown = {
  temperature: (description: string) => {
    const descriptionWithTemps = description.replace(
      temperatureRegex,
      (match) => {
        console.log('match', match);
        return createMarkdown(match, markdownConfig.temperature);
      },
    );
    console.log('addMarkdown.temperature', descriptionWithTemps);
    return descriptionWithTemps;
  },
  measurement: (namesToMatch: string[], description: string) => {
    // create regex with names list
    const regex = createMeasurementRegex(namesToMatch);
    // apply regex to each word in description.
    const descriptionWithMeasurements = description.replace(regex, (match) => {
      return createMarkdown(match, markdownConfig.measurement);
    });

    console.log('addMarkdown.measurement', descriptionWithMeasurements);
    return descriptionWithMeasurements;
  },
  item: (
    sortedItems: Array<IngredientWithAll | EquipmentWithAll>,
    description: string,
  ) => {
    let newDescription = description;
    sortedItems.forEach((item) => {
      const itemRegex = createItemRegex(item.name.name);
      newDescription = description.replace(itemRegex, (match) =>
        createMarkdown(match, markdownConfig.item),
      );
    });
    console.log('addMarkdown.item', newDescription);
    return newDescription;
  },
};

export const buildObject = {
  item: (
    segment: string,
    itemMap: Map<string, IngredientWithAll | EquipmentWithAll>,
  ) => {
    const obj = itemMap.get(removeMarkdown(segment));
    return obj ? obj : segment;
  },
  measurement: (
    segment: string,
    unitMap: Map<string, IngredientUnit>,
  ): InstructionMeasurement | string => {
    const [quantity, unit] = removeMarkdown(segment).split(' ');
    if (!unit || !quantity) return segment;
    const obj = unitMap.get(unit);
    return obj ? { text: quantity + ' ' + unit, quantity, ...obj } : segment;
  },
  temperature: (segment: string): InstructionTemperature | string => {
    const temperature = segment.slice(1, -2);
    const unit = segment[segment.length - 2];
    if (!temperature || !unit) return segment;
    return { text: `${temperature}°${unit}`, temperature, unit };
  },
};

export function sortItemsInDescending(
  tags: Array<IngredientWithAll | EquipmentWithAll>,
) {
  return tags.sort((a, b) => {
    const aWords = a.name.name.split(' ').length;
    const bWords = b.name.name.split(' ').length;
    return bWords - aWords;
  });
}

export function buildItemMap(
  items: Array<IngredientWithAll | EquipmentWithAll>,
): Map<string, IngredientWithAll | EquipmentWithAll> {
  const itemMap = new Map();
  items.forEach((i) => {
    itemMap.set(i.name.name, i);
  });
  return itemMap;
}

type SmartInstructionSegment = Array<
  | string
  | IngredientWithAll
  | EquipmentWithAll
  | InstructionMeasurement
  | InstructionTemperature
>;

export function useUnitStructures(allUnits: IngredientUnit[]) {
  return useMemo(() => {
    const unitNames = allUnits.map((u) => u.unit);
    const unitAbbreviations = allUnits.map((u) => u.abbreviation);
    const unitPlurals = allUnits.map((u) => u.plural);
    const unitMap = new Map<string, IngredientUnit>();
    allUnits.forEach((u) => {
      unitMap.set(u.unit, u);
    });
    unitAbbreviations.forEach((a) => {
      const unit = allUnits.find((u) => u.abbreviation === a);
      if (!unit) return;
      unitMap.set(a, unit);
    });
    unitPlurals.forEach((p) => {
      const unit = allUnits.find((u) => u.plural === p);
      if (!unit) return;
      unitMap.set(p, unit);
    });

    const unitNamesAndAbbreviations = unitNames.concat(unitAbbreviations);

    return { unitMap, unitNamesAndAbbreviations };
  }, [allUnits]);
}
