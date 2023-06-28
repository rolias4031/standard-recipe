import { TooltipCard } from 'components/common/tooltip';
import React from 'react';
import { InstructionMeasurement } from 'types/models';

interface MeasurementPopoverProps {
  measurement: InstructionMeasurement;
}

function MeasurementPopover({ measurement }: MeasurementPopoverProps) {
  return (
    <TooltipCard>
      <div>{measurement.text}</div>
    </TooltipCard>
  );
}

export default MeasurementPopover;
