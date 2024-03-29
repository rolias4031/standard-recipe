import { IngredientUnit, UnitProperty } from '@prisma/client';
import { useMemo } from 'react';
import {
  EquipmentWithAll,
  IngredientWithAll,
  InstructionMeasurement,
  InstructionTemperature,
} from 'types/models';

type markdownConfigKey = 'items' | 'measurements' | 'temperatures';

export const markdownConfig: { [key in markdownConfigKey]: [string, string] } =
  {
    items: ['<', '>'],
    measurements: ['[', ']'],
    temperatures: ['{', '}'],
  };

function splitMeasurementQuantityAndUnit(str: string) {
  const match = str.match(/[a-zA-Z]/);
  const letterIdx = match?.index;
  if (!match || !letterIdx) return null;
  const quantity = str.substring(0, letterIdx).trim();
  const unit = str.substring(letterIdx);
  return {
    quantity,
    unit,
  };
}

export function removeMarkdown(segment: string) {
  return segment.slice(1, -1);
}

function createMarkdown(string: string, config: [string, string]) {
  return config[0] + string + config[1];
}

const createRegex = {
  items: (items: string[]) => {
    return new RegExp('\\b(' + items.join('|') + ')\\b', 'gi');
  },
  measurements: (unitStrings: string[]) => {
    return new RegExp(
      '\\b\\d+(\\.\\d+)?\\s(' + unitStrings.join('|') + ')\\b',
      'gi',
    );
  },
  measurementsV2: (unitStrings: string[]) => {
    return new RegExp(
      '\\b(\\d+\\s)?(\\d+/\\d+|\\d+(\\.\\d+)?)\\s(' +
        unitStrings.join('|') +
        ')\\b',
      'gi',
    );
  },
  temperatures: () => {
    return new RegExp(/(\d+(\.\d+)?)\s?[CF]\b/g);
  },
  markdown: () => {
    return new RegExp(/(?=<)|(?<=>)|(?=\[)|(?<=\])|(?={)|(?<=})/);
  },
};

export function splitIntoMarkdownAndStrings(description: string) {
  return description.split(createRegex.markdown());
}

export const addMarkdown = {
  temperature: (description: string) => {
    const descriptionWithTemps = description.replace(
      createRegex.temperatures(),
      (match) => {
        console.log('match', match);
        return createMarkdown(match, markdownConfig.temperatures);
      },
    );
    console.log('addMarkdown.temperature', descriptionWithTemps);
    return descriptionWithTemps;
  },
  measurement: (namesToMatch: string[], description: string) => {
    // create regex with names list
    const regex = createRegex.measurementsV2(namesToMatch);
    // apply regex to each word in description.
    const descriptionWithMeasurements = description.replace(regex, (match) => {
      return createMarkdown(match, markdownConfig.measurements);
    });

    console.log('addMarkdown.measurement', descriptionWithMeasurements);
    return descriptionWithMeasurements;
  },
  item: (
    sortedItems: Array<IngredientWithAll | EquipmentWithAll>,
    description: string,
  ) => {
    const sortedItemNames = sortedItems.map((i) => i.name?.name ?? '');
    const itemsRegex = createRegex.items(sortedItemNames);
    const newDescription = description.replace(itemsRegex, (match) => {
      return createMarkdown(match, markdownConfig.items);
    });
    console.log('addMarkdown.item', newDescription);
    return newDescription;
  },
};

export const buildObject = {
  items: (
    segment: string,
    itemMap: Map<string, IngredientWithAll | EquipmentWithAll>,
  ) => {
    console.log('buildObject');
    const itemText = removeMarkdown(segment);
    const obj = itemMap.get(itemText.toLowerCase());
    console.log('buildObject', itemText, obj);
    return obj ? { ...obj, text: itemText } : segment;
  },
  measurements: (
    segment: string,
    unitMap: Map<string, IngredientUnit>,
  ): InstructionMeasurement | string => {
    // problem is that fractions are not convertible...
    // need to create a function that converts, do this in the popover
    // const [quantity, unit] = splitStringAtNumber(removeMarkdown(segment));
    const measurement = splitMeasurementQuantityAndUnit(
      removeMarkdown(segment),
    );
    if (!measurement) return segment;
    // if (!unit || !quantity) return segment;
    const { quantity, unit } = measurement;
    const obj = unitMap.get(unit.toLowerCase());
    return obj ? { ...obj, text: quantity + ' ' + unit, quantity } : segment;
  },
  temperatures: (segment: string): InstructionTemperature | string => {
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
    const aName = a.name?.name ?? '';
    const bName = b.name?.name ?? '';
    const aWordCount = aName.split(' ').length;
    const bWordCount = bName.split(' ').length;
    return bWordCount - aWordCount;
  });
}

export function buildItemMap(
  items: Array<IngredientWithAll | EquipmentWithAll>,
): Map<string, IngredientWithAll | EquipmentWithAll> {
  const itemMap = new Map();
  items.forEach((i) => {
    const itemName = i.name?.name;
    if (!itemName) return;
    itemMap.set(itemName.toLowerCase(), i);
  });
  return itemMap;
}

export function getAppropriateUnitsByProperty(
  property: UnitProperty | undefined,
  unitsByProperty: Partial<Record<UnitProperty, IngredientUnit[] | undefined>>,
) {
  if (!property) return;
  return property === 'mass' || property === 'weight'
    ? unitsByProperty['mass']?.concat(unitsByProperty['weight'] ?? [])
    : unitsByProperty[property];
}

export function useSortUnitsByProperty(allUnits: IngredientUnit[]) {
  return useMemo(() => {
    const properties = [...new Set(allUnits.map((u) => u.property))] as const;
    type PropertyKeys = (typeof properties)[number];
    let unitsByProperty: { [K in PropertyKeys]?: IngredientUnit[] } = {};

    properties.forEach((property) => {
      unitsByProperty[property] = allUnits.filter(
        (u) => u.property === property,
      );
    });

    return unitsByProperty;
  }, [allUnits]);
}

export function useUnitStrings(allUnits: IngredientUnit[]) {
  return useMemo(() => {
    const unitNames = allUnits.map((u) => u.unit);
    const unitAbbreviations = allUnits.map((u) => u.abbreviation);
    const unitPlurals = allUnits.map((u) => u.plural);
    const unitNamesAbbreviationsPlurals = unitNames
      .concat(unitAbbreviations, unitPlurals)
      .filter((u) => u !== '');
    return {
      unitNames,
      unitAbbreviations,
      unitPlurals,
      unitNamesAbbreviationsPlurals,
    };
  }, [allUnits]);
}

export function useUnitMap(allUnits: IngredientUnit[]) {
  const unitStrings = useUnitStrings(allUnits);

  const unitMap = useMemo(() => {
    const newUnitMap = new Map<string, IngredientUnit>();
    allUnits.forEach((u) => {
      newUnitMap.set(u.unit, u);
    });
    unitStrings.unitAbbreviations.forEach((a) => {
      const unit = allUnits.find((u) => u.abbreviation === a);
      if (!unit) return;
      newUnitMap.set(a, unit);
    });
    unitStrings.unitPlurals.forEach((p) => {
      const unit = allUnits.find((u) => u.plural === p);
      if (!unit) return;
      newUnitMap.set(p, unit);
    });
    return newUnitMap;
  }, [allUnits, unitStrings]);

  return { unitMap, unitStrings };
}

export function useDissectUnitStructures(allUnits: IngredientUnit[]) {
  const unitsByProperty = useSortUnitsByProperty(allUnits);
  const { unitMap, unitStrings } = useUnitMap(allUnits);

  return { unitMap, unitStrings, unitsByProperty };
}
