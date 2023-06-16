import { IngredientUnit } from '@prisma/client';
import { parseInstructionForTags } from 'lib/util-client';
import React, { ReactNode } from 'react';
import {
  EquipmentWithAll,
  IngredientMeasurement,
  IngredientWithAll,
  InstructionTemperature,
  isEquipmentWithAllType,
  isIngredientMeasurementType,
  isIngredientWithAllType,
  isInstructionTemperatureType,
} from 'types/models';

interface SmartInstructionProps {
  description: string;
  tags: Array<IngredientWithAll | EquipmentWithAll>;
  ingredientTooltipComponent: (ingredient: IngredientWithAll) => ReactNode;
  equipmentTooltipComponent: (equipment: EquipmentWithAll) => ReactNode;
  measurementPopoverComponent: (
    measurement: IngredientMeasurement,
  ) => ReactNode;
  temperatureTooltipComponent: (
    temperature: InstructionTemperature,
  ) => ReactNode;
  allUnits: IngredientUnit[];
  unitsMap: Map<string, IngredientUnit>;
}

function SmartInstruction({
  description,
  tags,
  ingredientTooltipComponent,
  equipmentTooltipComponent,
  measurementPopoverComponent,
  temperatureTooltipComponent,
  allUnits,
  unitsMap,
}: SmartInstructionProps) {
  const parsedDescriptionArray = parseInstructionForTags(
    description,
    tags,
    allUnits,
    unitsMap,
  );
  return (
    <div>
      {parsedDescriptionArray.map((segment) => {
        console.log(segment);
        if (typeof segment === 'string') return segment;
        if (isIngredientWithAllType(segment)) {
          return ingredientTooltipComponent(segment);
        }
        if (isEquipmentWithAllType(segment)) {
          return equipmentTooltipComponent(segment);
        }
        if (isIngredientMeasurementType(segment)) {
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
