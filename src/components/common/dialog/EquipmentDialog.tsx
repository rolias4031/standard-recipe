import React, { useMemo } from 'react';
import { EquipmentWithAll } from 'types/models';
import { DialogCard, DialogNotes, DialogSubs } from '.';

interface EquipmentDialogProps {
  equipment: EquipmentWithAll;
}

function EquipmentDialog({ equipment }: EquipmentDialogProps) {
  const names = useMemo(
    () => equipment.substitutes.map((s) => s.name),
    [equipment.substitutes],
  );
  return (
    <DialogCard>
      <div className="flex flex-col space-y-2">
        <DialogNotes notes={equipment.notes} />
        <DialogSubs substitutes={names} />
      </div>
    </DialogCard>
  );
}

export default EquipmentDialog;
