import React from 'react';
import convert, { Unit } from 'convert-units';
import { DialogCard, DialogConversionItem, DialogConversionList } from '.';
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
        name: u.name
      });
    } catch (e) {
      console.log(e);
      return;
    }
  });
  return unfilteredConversions.filter((c) => c.unit !== unit);
}

type TemperatureDialogProps = Omit<InstructionTemperature, 'text'>;

function TemperatureDialog({ temperature, unit }: TemperatureDialogProps) {
  const convertedTemperatures = useConvertTemperature(temperature, unit);
  return (
    <DialogCard color="indigo">
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
    </DialogCard>
  );
}

export default TemperatureDialog;
