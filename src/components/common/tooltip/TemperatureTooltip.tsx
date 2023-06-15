import React from 'react';
import { InstructionTemperature } from 'types/models';
import { TooltipCard } from '.';

function convertTemp(temperature: string, unit: string) {
  const temp = parseInt(temperature);
  let convertedTemp = temperature + unit;
  if (unit === 'F') {
    const newTemp = Math.round((temp - 32) * (5 / 9));
    convertedTemp = `${newTemp}C`;
  }
  if (unit === 'C') {
    const newTemp = Math.round(temp * (9 / 5) + 32);
    convertedTemp = `${newTemp}F`;
  }
  return convertedTemp;
}

interface TemperatureTooltipProps {
  temp: InstructionTemperature;
}

function TemperatureTooltip({ temp }: TemperatureTooltipProps) {
  const convertedTemp = convertTemp(temp.temperature, temp.unit);
  return (
    <TooltipCard>
      <div>{convertedTemp}</div>
    </TooltipCard>
  );
}

export default TemperatureTooltip;
