import { IngredientUnit } from '@prisma/client';
import { useBuildSmartInstructionArray } from 'lib/parsing';
import React, { ReactNode, useMemo } from 'react';
import {
  EquipmentWithAll,
  InstructionMeasurement,
  IngredientWithAll,
  InstructionTemperature,
  isEquipmentWithAllType,
  isInstructionMeasurementType,
  isIngredientWithAllType,
  isInstructionTemperatureType,
} from 'types/models';

interface SmartInstructionProps {
  description: string;
  items: Array<IngredientWithAll | EquipmentWithAll>;
  ingredientTooltipComponent: (ingredient: IngredientWithAll) => ReactNode;
  equipmentTooltipComponent: (equipment: EquipmentWithAll) => ReactNode;
  measurementPopoverComponent: (
    measurement: InstructionMeasurement,
  ) => ReactNode;
  temperatureTooltipComponent: (
    temperature: InstructionTemperature,
  ) => ReactNode;
  unitNamesAndAbbreviations: string[];
  unitMap: Map<string, IngredientUnit>;
}

function SmartInstruction({
  description,
  items,
  ingredientTooltipComponent,
  equipmentTooltipComponent,
  measurementPopoverComponent,
  temperatureTooltipComponent,
  unitNamesAndAbbreviations,
  unitMap,
}: SmartInstructionProps) {
  const smartInstructionsArray = useBuildSmartInstructionArray(
    description,
    items,
    unitNamesAndAbbreviations,
    unitMap,
  );

  return (
    <div>
      {smartInstructionsArray.map((segment) => {
        console.log('Segment', segment);
        if (typeof segment === 'string') return segment;
        if (isIngredientWithAllType(segment)) {
          return ingredientTooltipComponent(segment);
        }
        if (isEquipmentWithAllType(segment)) {
          return equipmentTooltipComponent(segment);
        }
        if (isInstructionMeasurementType(segment)) {
          return measurementPopoverComponent(segment);
        }
        if (isInstructionTemperatureType(segment)) {
          return temperatureTooltipComponent(segment);
        }
      })}
    </div>
  );
}

export default SmartInstruction;
