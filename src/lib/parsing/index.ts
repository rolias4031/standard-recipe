import {
  EquipmentWithAll,
  InstructionMeasurement,
  IngredientWithAll,
  InstructionTemperature,
  IngredientForSmartInstruction,
  EquipmentForSmartInstruction,
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

/*
! guide

* item
- matches all occurrences of the exact ingredient and equipment names.
- case insensitive.
- rigatoni pasta matches: Rigatoni pasta, Rigatoni Pasta, even RiGaToNi PaStA.
- cast iron pan matches: all capitalization variations of that string.

* temperature
- matches any float or integer followed by either C or F, with an optional space in between
- 400C/F 550 C/F

* measurement
- matches any float or integer followed by a measurement name, plural, or abbreviation, case insensitive.
- 5 Ounces, 5 ounces, 5 ounce, 5 oz, 5 OZ.
*/

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
  | IngredientForSmartInstruction
  | EquipmentForSmartInstruction
  | InstructionMeasurement
  | InstructionTemperature
> {
  return useMemo(() => {
    console.log('items', items);
    console.log('unitStringsForRegex', unitStringsForRegex);

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
    console.log('itemMap', itemMap);
    return descriptionArray.map((segment) => {
      if (segment.startsWith(markdownConfig.items[0])) {
        return buildObject.items(segment, itemMap);
      }
      if (segment.startsWith(markdownConfig.measurements[0])) {
        return buildObject.measurements(segment, unitMap);
      }
      if (segment.startsWith(markdownConfig.temperatures[0])) {
        return buildObject.temperatures(segment);
      }
      return segment;
    });
  }, [description, items, unitMap, unitStringsForRegex]);
}
