import convert, { Unit } from 'convert-units';
import { IngredientUnit } from '@prisma/client';
import { sortBy } from 'lodash';
import React from 'react';
import { InstructionMeasurement } from 'types/models';
import { DialogCard } from '.';

function formatConversion(num: number): string {
  return num % 1 !== 0 ? num.toFixed(2) : num.toLocaleString('en-US');
}

interface ConvertedMeasurement {
  quantity: string;
  unit: string;
  abbreviation: string;
}

function useConvertMeasurement(
  measurement: InstructionMeasurement,
  propertyUnits: IngredientUnit[] | undefined,
): ConvertedMeasurement[] {
  if (!propertyUnits || measurement.property === 'other') return [];
  const unfilteredConversions: ConvertedMeasurement[] = [];
  propertyUnits.forEach((u) => {
    try {
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

interface MeasurementDialogProps {
  measurement: InstructionMeasurement;
  propertyUnits: IngredientUnit[] | undefined;
  onClosePopover?: () => void;
}

function MeasurementDialog({
  measurement,
  propertyUnits,
  onClosePopover,
}: MeasurementDialogProps) {
  const conversions = useConvertMeasurement(measurement, propertyUnits);
  return (
    <DialogCard color="indigo">
      <ul className="divide-y divide-dashed divide-white">
        {conversions ? (
          conversions?.map((c) => (
            <li
              key={c.unit}
              className="flex w-full justify-between py-2 px-2 font-mono first:pt-0 last:pb-0"
            >
              <div className="flex space-x-2">
                <span>{c.unit}</span>
                <span>{`(${c.abbreviation})`}</span>
              </div>
              <span>{c.quantity}</span>
            </li>
          ))
        ) : (
          <span>No Conversions!</span>
        )}
      </ul>
    </DialogCard>
  );
}

export default MeasurementDialog;
