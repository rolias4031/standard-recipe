import {
  EquipmentWithAll,
  InstructionMeasurement,
  IngredientWithAll,
  InstructionTemperature,
} from 'types/models';
import {
  addMarkdown,
  buildItemMap,
  buildObject,
  markdownConfig,
  sortItemsInDescending,
  splitIntoMarkdownAndStrings,
} from './utils';
import { IngredientUnit } from '@prisma/client';
import { useMemo } from 'react';

interface UseBuildSmartInstructionArrayArgs {
  description: string;
  items: Array<IngredientWithAll | EquipmentWithAll>;
  unitStringsForRegex: string[];
  unitMap: Map<string, IngredientUnit>;
}

export function useBuildSmartInstructionArray({
  description,
  items,
  unitStringsForRegex,
  unitMap,
}: UseBuildSmartInstructionArrayArgs): Array<
  | string
  | IngredientWithAll
  | EquipmentWithAll
  | InstructionMeasurement
  | InstructionTemperature
> {
  return useMemo(() => {
    console.log('items', items);
    // sort items by number of words in name - largest go first otherwise small will break large.
    const sortedItems = sortItemsInDescending(items);

    // markdown items, measurements, then temperatures
    let withMarkdown = description;
    withMarkdown = addMarkdown.item(sortedItems, withMarkdown);
    withMarkdown = addMarkdown.measurement(unitStringsForRegex, withMarkdown);
    withMarkdown = addMarkdown.temperature(withMarkdown);

    // split into array by markdown and plain strings
    const descriptionArray = splitIntoMarkdownAndStrings(withMarkdown);

    // go over array and replace markdown with full objects
    // detect by markdown opening char and replace from itemMap
    const itemMap = buildItemMap(items);
    return descriptionArray.map((segment) => {
      if (segment.startsWith(markdownConfig.item[0])) {
        return buildObject.item(segment, itemMap);
      }
      if (segment.startsWith(markdownConfig.measurement[0])) {
        return buildObject.measurement(segment, unitMap);
      }
      if (segment.startsWith(markdownConfig.temperature[0])) {
        return buildObject.temperature(segment);
      }
      return segment;
    });
  }, [description, items, unitMap, unitStringsForRegex]);
}
