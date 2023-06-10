import { isZeroLength } from 'lib/util-client';
import React from 'react';
import { FlowEquipment } from 'types/models';
import { TooltipCard, TooltipNotes, TooltipOptional, TooltipSubs } from '.';

interface EquipmentTooltipProps {
  equipment: FlowEquipment;
}

function EquipmentTooltip({ equipment }: EquipmentTooltipProps) {
  const { notes, optional, substitutes } = equipment;

  return (
    <TooltipCard>
      <TooltipNotes notes={notes} />
      <TooltipSubs substitutes={substitutes} />
      <TooltipOptional optional={optional} />
      {!notes && !optional && isZeroLength(substitutes) ? (
        <span className="italic">nothing important</span>
      ) : null}
    </TooltipCard>
  );
}

export default EquipmentTooltip;
