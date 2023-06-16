import { isZeroLength } from 'lib/util-client';
import React from 'react';
import { EquipmentWithAll } from 'types/models';
import { TooltipCard, TooltipNotes, TooltipOptional, TooltipSubs } from '.';

interface EquipmentTooltipProps {
  equipment: EquipmentWithAll;
}

function EquipmentTooltip({ equipment }: EquipmentTooltipProps) {
  const { notes, optional, substitutes } = equipment;
  const substituteNames = substitutes.map((s) => s.name);

  return (
    <TooltipCard>
      <TooltipNotes notes={notes} />
      <TooltipSubs substitutes={substituteNames} />
      <TooltipOptional optional={optional} />
      {!notes && !optional && isZeroLength(substitutes) ? (
        <span className="italic">nothing important</span>
      ) : null}
    </TooltipCard>
  );
}

export default EquipmentTooltip;
