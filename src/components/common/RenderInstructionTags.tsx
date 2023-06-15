import { IngredientUnit } from '@prisma/client';
import { parseInstructionForTags } from 'lib/util-client';
import React, { ReactNode } from 'react';
import {
  FlowEquipment,
  FlowIngredient,
  IngredientMeasurement,
  InstructionTemperature,
  isFlowEquipmentType,
  isFlowIngredientType,
  isIngredientMeasurementType,
  isInstructionTemperatureType,
} from 'types/models';

interface RenderInstructionTags {
  description: string;
  tags: Array<FlowIngredient | FlowEquipment>;
  ingredientTooltipComponent: (ingredient: FlowIngredient) => ReactNode;
  equipmentTooltipComponent: (equipment: FlowEquipment) => ReactNode;
  measurementPopoverComponent: (
    measurement: IngredientMeasurement,
  ) => ReactNode;
  temperatureTooltipComponent: (
    temperature: InstructionTemperature,
  ) => ReactNode;
  allUnits: IngredientUnit[];
  unitsMap: Map<string, IngredientUnit>;
}

function RenderInstructionTags({
  description,
  tags,
  ingredientTooltipComponent,
  equipmentTooltipComponent,
  measurementPopoverComponent,
  temperatureTooltipComponent,
  allUnits,
  unitsMap,
}: RenderInstructionTags) {
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
        if (isFlowIngredientType(segment)) {
          return ingredientTooltipComponent(segment);
        }
        if (isFlowEquipmentType(segment)) {
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

export default RenderInstructionTags;
