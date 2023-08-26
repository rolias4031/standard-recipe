import { IngredientUnit } from '@prisma/client';
import { useBuildSmartInstructionArray } from 'lib/parsing';
import React, { ReactNode } from 'react';
import {
  EquipmentWithAll,
  InstructionMeasurement,
  IngredientWithAll,
  InstructionTemperature,
  isInstructionMeasurementType,
  isInstructionTemperatureType,
  IngredientForSmartInstruction,
  EquipmentForSmartInstruction,
  isIngredientForSmartInstructionType,
  isEquipmentForSmartInstructionType,
} from 'types/models';

interface SmartInstructionWrapperProps {
  children: ReactNode;
}

export function SmartInstructionWrapper({
  children,
}: SmartInstructionWrapperProps) {
  return <div className="w-full rounded-lg bg-smoke p-3">{children}</div>;
}

interface SmartInstructionProps {
  description: string;
  items: Array<IngredientWithAll | EquipmentWithAll>;
  ingredientTooltipComponent: (
    ingredient: IngredientForSmartInstruction,
  ) => ReactNode;
  equipmentTooltipComponent: (equipment: EquipmentForSmartInstruction) => ReactNode;
  measurementPopoverComponent: (
    measurement: InstructionMeasurement,
  ) => ReactNode;
  temperatureTooltipComponent: (
    temperature: InstructionTemperature,
  ) => ReactNode;
  unitStringsForRegex: string[];
  unitMap: Map<string, IngredientUnit>;
}

function SmartInstruction({
  description,
  items,
  ingredientTooltipComponent,
  equipmentTooltipComponent,
  measurementPopoverComponent,
  temperatureTooltipComponent,
  unitStringsForRegex,
  unitMap,
}: SmartInstructionProps) {
  const smartInstructionsArray = useBuildSmartInstructionArray({
    description,
    items,
    unitStringsForRegex,
    unitMap,
  });

  return (
    <>
      {smartInstructionsArray.map((segment) => {
        console.log('Segment', segment);
        if (typeof segment === 'string') return segment;
        if (isIngredientForSmartInstructionType(segment)) {
          return ingredientTooltipComponent(segment);
        }
        if (isEquipmentForSmartInstructionType(segment)) {
          return equipmentTooltipComponent(segment);
        }
        if (isInstructionMeasurementType(segment)) {
          return measurementPopoverComponent(segment);
        }
        if (isInstructionTemperatureType(segment)) {
          return temperatureTooltipComponent(segment);
        }
      })}
    </>
  );
}

export default SmartInstruction;
