import { TooltipCard } from 'components/common/tooltip';
import React from 'react';
import { IngredientMeasurement } from 'types/models';

interface MeasurementPopoverProps {
  measurement: IngredientMeasurement;
}

function MeasurementPopover({ measurement }: MeasurementPopoverProps) {
  return (
    <TooltipCard>
      <div>{measurement.segment.quantity + measurement.segment.text}</div>
    </TooltipCard>
  );
}

export default MeasurementPopover;
