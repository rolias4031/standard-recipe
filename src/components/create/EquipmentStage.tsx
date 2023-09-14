import OptionalInput from 'components/common/OptionalInput';
import { findRecipeInputIndexById, insertIntoPrevArray } from 'lib/util-client';
import React, { Dispatch, SetStateAction } from 'react';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import StageFrame from './StageFrame';
import { useDeleteEquipment } from 'lib/mutations';
import {
  addSubHandler,
  dragEndHandler,
  removeDeletedInputFromStateHandler,
  removeSubHandler,
} from './utils';
import { FlowEquipment } from 'types/models';
import FlowInputBlock from './FlowInputBlock';
import { OptionDialog } from './OptionDialog';
import { StageSharedProps } from './IngredientsStage';

function cleanEquipmentInput(value: string) {
  return value.toLowerCase();
}

interface EquipmentStageProps extends StageSharedProps {
  equipment: FlowEquipment[];
  raiseEquipment: Dispatch<SetStateAction<FlowEquipment[]>>;
}

function EquipmentStage({
  equipment,
  raiseEquipment,
  recipeId,
  triggerDebouncedUpdate,
  isDisabled,
}: EquipmentStageProps) {
  function triggerUpdateIfProvided() {
    if (!triggerDebouncedUpdate) return;
    triggerDebouncedUpdate();
  }
  const { mutate: deleteEquipment, status: deleteStatus } =
    useDeleteEquipment();

  function deleteEquipmentHandler(id: string) {
    raiseEquipment((prev: FlowEquipment[]) => {
      return removeDeletedInputFromStateHandler(prev, id);
    });
    deleteEquipment({ id, recipeId, replace: true });
  }

  function updateEquipmentHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseEquipment((prev: FlowEquipment[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const updatedEquipment = {
        ...prev[index],
        [name]: value,
      };
      const newIngredientsArray = insertIntoPrevArray(
        prev,
        index,
        updatedEquipment,
      );
      return newIngredientsArray as FlowEquipment[];
    });
    triggerUpdateIfProvided();
  }

  function addEquipmentSubHandler(subValue: string, id: string) {
    addSubHandler({ subValue, id, raiseInput: raiseEquipment });
    triggerUpdateIfProvided();
  }

  function removeEquipmentSubHandler(subValue: string, id: string) {
    removeSubHandler({ subValue, id, raiseInput: raiseEquipment });
    triggerUpdateIfProvided();
  }

  return (
    <StageFrame
      onDragEnd={(result) => {
        dragEndHandler(result, raiseEquipment);
        triggerUpdateIfProvided();
      }}
      droppableId="equipment"
      stageInputComponents={equipment.map((e, index) =>
        !e.inUse ? null : (
          <FlowInputBlock
            key={e.id}
            id={e.id}
            order={index + 1}
            isDisabled={isDisabled}
            mainInputComponent={() => (
              <input
                disabled={isDisabled}
                type="text"
                name="name"
                value={e.name}
                className="inp-reg inp-primary w-full disabled:text-concrete md:w-2/3"
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  updateEquipmentHandler({
                    id: e.id,
                    name: ev.target.name,
                    value: cleanEquipmentInput(ev.target.value),
                  })
                }
                autoComplete="off"
              />
            )}
            optionsComponent={
              <OptionDialog.Card>
                <OptionDialog.Heading
                  name={e.name}
                  onDeleteIngredient={() => deleteEquipmentHandler(e.id)}
                />
                <div className="flex space-x-5 text-lg">
                  <OptionalInput
                    id={e.id}
                    curIsOptional={e.optional}
                    onRaiseInput={updateEquipmentHandler}
                  />
                </div>
                <OptionDialog.Substitutes
                  id={e.id}
                  curSubs={e.substitutes}
                  onAddSub={addEquipmentSubHandler}
                  onRemoveSub={removeEquipmentSubHandler}
                />
                <OptionDialog.Notes
                  curNotes={e.notes}
                  id={e.id}
                  onRaiseNotes={updateEquipmentHandler}
                />
              </OptionDialog.Card>
            }
          />
        ),
      )}
    />
  );
}

export default EquipmentStage;
