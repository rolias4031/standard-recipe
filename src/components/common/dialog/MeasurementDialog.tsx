import convert, { Unit } from 'convert-units';
import { IngredientUnit } from '@prisma/client';
import { sortBy } from 'lodash';
import React from 'react';
import { InstructionMeasurement } from 'types/models';
import {
  CloseDialog,
  DialogCard,
  DialogConversionItem,
  DialogConversionList,
  DialogHeader,
  DialogProps,
} from '.';
import XIcon from '../icons/XIcon';

export function formatConversion(num: number): string {
  console.log(num);
  return num % 1 !== 0 ? num.toFixed(2) : num.toLocaleString('en-US');
}
interface ConvertedMeasurement {
  quantity: string;
  unit: string;
  abbreviation: string;
}

function useConvertMeasurement(
  measurement: Omit<InstructionMeasurement, 'text'>,
  propertyUnits: IngredientUnit[] | undefined,
): ConvertedMeasurement[] {
  if (!propertyUnits || measurement.property === 'other') return [];
  const unfilteredConversions: ConvertedMeasurement[] = [];
  propertyUnits.forEach((u) => {
    try {
      console.log('quantity', measurement.quantity);
      const convertedQuantity = convert(measurement.quantity)
        .from(measurement.abbreviation as Unit)
        .to(u.abbreviation as Unit);
      unfilteredConversions.push({
        quantity: formatConversion(convertedQuantity),
        unit: u.unit,
        abbreviation: u.abbreviation,
      });
    } catch (e) {
      console.log(e);
      return;
    }
  });

  const filteredAndSortedConversions = sortBy(
    unfilteredConversions.filter((c) => {
      return c.unit !== measurement.unit;
    }),
    'unit',
  );
  return filteredAndSortedConversions;
}

interface MeasurementDialogProps extends DialogProps {
  measurement: Omit<InstructionMeasurement, 'text'>;
  propertyUnits: IngredientUnit[] | undefined;
}

function MeasurementDialog({
  measurement,
  propertyUnits,
  onCloseDialog,
}: MeasurementDialogProps) {
  const conversions = useConvertMeasurement(measurement, propertyUnits);
  return (
    <DialogCard color="indigo">
      <DialogHeader>
        {measurement.quantity} {measurement.unit}
      </DialogHeader>
      <DialogConversionList>
        {conversions.map((c) => {
          return (
            <DialogConversionItem
              key={c.unit}
              quantity={c.quantity}
              unit={c.unit}
              abbreviation={c.abbreviation}
            />
          );
        })}
      </DialogConversionList>
      {onCloseDialog ? <CloseDialog onCloseDialog={onCloseDialog} /> : null}
    </DialogCard>
  );
}

export default MeasurementDialog;
