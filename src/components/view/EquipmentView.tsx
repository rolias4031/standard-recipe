import React from 'react';
import ViewSectionContainer from './ViewSectionContainer';
import { EquipmentWithAll } from 'types/models';
import { ItemBlock, ItemBlockDetail } from '.';

interface EquipmentBlockProps {
  equipment: EquipmentWithAll;
}

function EquipmentBlock({ equipment }: EquipmentBlockProps) {
  const hasDetails =
    (equipment.notes !== null && equipment.notes.length > 0) ||
    equipment.substitutes.length > 0 ||
    equipment.optional;

  return (
    <ItemBlock
      name={equipment.name?.name ?? ''}
      canExpand={hasDetails}
      expandedContent={
        hasDetails ? (
          <ItemBlockDetail
            notes={equipment.notes}
            substitutes={equipment.substitutes.map((s) => s.name)}
            optional={equipment.optional}
          />
        ) : null
      }
    />
  );
}

interface EquipmentViewProps {
  equipment: EquipmentWithAll[];
}

function EquipmentView({ equipment }: EquipmentViewProps) {
  const equipmentBlocks = equipment.map((e) => (
    <EquipmentBlock key={e.id} equipment={e} />
  ));
  return (
    <ViewSectionContainer totalItems={equipment.length} title="Equipment">
      <div className="flex flex-col space-y-2">{equipmentBlocks}</div>
    </ViewSectionContainer>
  );
}

export default EquipmentView;
