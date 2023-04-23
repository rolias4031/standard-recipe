import NotesInput from 'components/common/NotesInput';
import OptionalInput from 'components/common/OptionalInput';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genEquipment,
  insertIntoPrevArray,
  isZeroLength,
  pickStyles,
  reorderDraggableInputs,
} from 'lib/util-client';
import { GeneralButton, TextInput } from 'pirate-ui';
import React, { Dispatch, SetStateAction } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import StageFrame from './StageFrame';
import { Equipment } from '@prisma/client';
import CogIcon from 'components/common/icons/CogIcon';
import TrashIcon from 'components/common/icons/TrashIcon';

interface EquipmentStageProps {
  equipment: Equipment[];
  raiseEquipment: Dispatch<SetStateAction<Equipment[]>>;
}

function EquipmentStage({ equipment, raiseEquipment }: EquipmentStageProps) {
  function removeEquipmentHandler(id: string) {
    raiseEquipment((prev: Equipment[]) => {
      if (prev.length === 1) return [genEquipment()];
      const newEquipment = prev.filter((i) => i.id !== id);
      return newEquipment;
    });
  }
  function updateEquipmentHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseEquipment((prev: Equipment[]) => {
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
      return newIngredientsArray as Equipment[];
    });
  }

  function dragEndHandler(result: DropResult) {
    if (!result.destination) return;
    raiseEquipment((prev: Equipment[]) => {
      return reorderDraggableInputs(result, prev);
    });
  }

  return (
    <StageFrame
      onDragEnd={dragEndHandler}
      droppableId="equipment"
      inputComponents={equipment.map((e, index) => (
        <RecipeFlowInput
          key={e.id}
          id={e.id}
          index={index}
          optionModes={['notes']}
          inputLabelComponents={
            <>
              <div className="w-80">Equipment</div>
            </>
          }
          inputComponents={() => (
            <TextInput
              name="name"
              value={e.name}
              onChange={({ value, name }) => {
                updateEquipmentHandler({ id: e.id, name, value });
              }}
              styles={{
                input: 'inp-reg inp-primary w-[350px]',
              }}
            />
          )}
          optionalComponent={
            <OptionalInput
              id={e.id}
              curIsOptional={e.optional}
              onRaiseInput={updateEquipmentHandler}
            />
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="flex flex-grow justify-between items-center fade-in"
            >
              <div className="flex items-center space-x-2">
                <GeneralButton
                  onClick={() =>
                    setOptionMode((prev: string | null) =>
                      prev === null && optionModes[0] ? optionModes[0] : null,
                    )
                  }
                >
                  <CogIcon
                    styles={{
                      icon: pickStyles('w-6 h-6 transition-colors', [
                        !optionMode,
                        'text-concrete hover:text-fern',
                        'text-fern',
                      ]),
                    }}
                  />
                </GeneralButton>
              </div>
              <GeneralButton
                onClick={() => removeEquipmentHandler(e.id)}
                styles={{ button: 'h-fit' }}
              >
                <TrashIcon
                  styles={{
                    icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                  }}
                />
              </GeneralButton>
            </div>
          )}
          optionOverviewComponents={
            <>
              {e.optional ? <span>optional</span> : null}
              {!isZeroLength(e.notes) ? <span>notes</span> : null}
            </>
          }
          optionInputComponents={(optionMode) => (
            <>
              {optionMode === 'notes' ? (
                <NotesInput
                  id={e.id}
                  curNotes={e.notes}
                  onRaiseNotes={updateEquipmentHandler}
                />
              ) : null}
            </>
          )}
        />
      ))}
    />
  );
}

export default EquipmentStage;
