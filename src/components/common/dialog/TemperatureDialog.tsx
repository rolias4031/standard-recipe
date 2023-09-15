import React from 'react';
import convert, { Unit } from 'convert-units';
import {
  CloseDialog,
  DialogCard,
  DialogConversionItem,
  DialogConversionList,
  DialogHeader,
  DialogProps,
} from '.';
import { InstructionTemperature } from 'types/models';
import { formatConversion } from './MeasurementDialog';

type TemperatureUnit = 'C' | 'F' | 'K' | 'R';

const conversionUnits: { unit: TemperatureUnit; name: string }[] = [
  { unit: 'C', name: 'celsius' },
  { unit: 'F', name: 'fahrenheit' },
  { unit: 'K', name: 'kelvin' },
  { unit: 'R', name: 'rankine' },
];

interface ConvertedTemperature {
  temperature: string;
  unit: TemperatureUnit;
  name: string;
}

function useConvertTemperature(temperature: number, unit: string) {
  const unfilteredConversions: ConvertedTemperature[] = [];
  conversionUnits.forEach((u) => {
    try {
      const convertedTemperature = convert(temperature)
        .from(unit as Unit)
        .to(u.unit);
      unfilteredConversions.push({
        temperature: formatConversion(convertedTemperature),
        unit: u.unit,
        name: u.name,
      });
    } catch (e) {
      console.log(e);
      return;
    }
  });
  return unfilteredConversions.filter((c) => c.unit !== unit);
}

interface TemperatureDialogProps extends DialogProps {
  temperature: Omit<InstructionTemperature, 'text'>;
}

function TemperatureDialog({
  temperature,
  onCloseDialog,
}: TemperatureDialogProps) {
  const convertedTemperatures = useConvertTemperature(
    temperature.temperature,
    temperature.unit,
  );
  return (
    <DialogCard color="indigo">
      <DialogHeader>
        {temperature.temperature} {temperature.unit}
      </DialogHeader>
      <DialogConversionList>
        {convertedTemperatures.map((c) => {
          return (
            <DialogConversionItem
              key={c.unit}
              quantity={c.temperature}
              unit={c.name}
              abbreviation={c.unit}
            />
          );
        })}
      </DialogConversionList>
      {onCloseDialog ? <CloseDialog onCloseDialog={onCloseDialog} /> : null}
    </DialogCard>
  );
}

export default TemperatureDialog;
