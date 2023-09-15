import React, { useMemo } from 'react';
import { EquipmentWithAll } from 'types/models';
import {
  CloseDialog,
  DialogCard,
  DialogHeader,
  DialogNotes,
  DialogOptional,
  DialogProps,
  DialogSubs,
} from '.';

interface EquipmentDialogProps extends DialogProps {
  equipment: EquipmentWithAll;
}

function EquipmentDialog({ equipment, onCloseDialog }: EquipmentDialogProps) {
  const names = useMemo(
    () => equipment.substitutes.map((s) => s.name),
    [equipment.substitutes],
  );
  return (
    <DialogCard>
      <DialogHeader>{equipment.name?.name}</DialogHeader>
      <div className="flex flex-col space-y-2">
        <DialogOptional optional={equipment.optional} />
        <DialogNotes notes={equipment.notes} />
        <DialogSubs substitutes={names} />
      </div>
      {onCloseDialog ? <CloseDialog onCloseDialog={onCloseDialog} /> : null}
    </DialogCard>
  );
}

export default EquipmentDialog;
