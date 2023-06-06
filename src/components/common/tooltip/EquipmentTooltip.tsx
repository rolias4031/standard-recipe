import React from 'react';
import { FlowEquipment } from 'types/models';
import TooltipCard from './TooltipCard';

interface EquipmentTooltipProps {
  equipment: FlowEquipment;
}

function EquipmentTooltip({ equipment }: EquipmentTooltipProps) {
  const { notes, optional } = equipment;
  return (
    <TooltipCard>
      <div className="flex flex-col space-y-1">
        {notes ? <div className="text-xs">{notes}</div> : null}
        {optional ? (
          <span className="italic text-smoke">optional</span>
        ) : null}
      </div>
    </TooltipCard>
  );
}

export default EquipmentTooltip;
