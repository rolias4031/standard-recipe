import NotesInput from 'components/common/NotesInput';
import OptionalInput from 'components/common/OptionalInput';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genEquipment,
  insertIntoPrevArray,
  isClientId,
  isZeroLength,
  pickStyles,
} from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { Dispatch, SetStateAction } from 'react';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import StageFrame from './StageFrame';
import CogIcon from 'components/common/icons/CogIcon';
import TrashIcon from 'components/common/icons/TrashIcon';
import { useDeleteEquipment, useUpdateRecipeEquipment } from 'lib/mutations';
import { newEquipmentSchema } from 'validation/schemas';
import { dragEndHandler, useDebouncedAutosave } from './utils';
import { FlowEquipment } from 'types/models';

function cleanEquipmentInput(value: string) {
  return value.toLowerCase();
}

interface EquipmentStageProps {
  equipment: FlowEquipment[];
  raiseEquipment: Dispatch<SetStateAction<FlowEquipment[]>>;
  recipeId: string;
}

function EquipmentStage({
  equipment,
  raiseEquipment,
  recipeId,
}: EquipmentStageProps) {
  const { mutate: updateEquipment, status: updateStatus } =
    useUpdateRecipeEquipment();
  const { mutate: deleteEquipment, status: deleteStatus } =
    useDeleteEquipment();

  const { pushIdToUpdateList } = useDebouncedAutosave({
    recipeId,
    inputs: equipment,
    dispatchInputs: raiseEquipment,
    schema: newEquipmentSchema,
    updateInputsMutation: updateEquipment,
  });

  function removeEquipmentHandler(id: string) {
    raiseEquipment((prev: FlowEquipment[]) => {
      if (prev.length === 1) return [genEquipment()];
      return prev.filter((i) => i.id !== id);
    });
    if (isClientId(id)) return;
    deleteEquipment({ id });
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
    pushIdToUpdateList(id);
  }

  return (
    <StageFrame
      stageInputLabels={
        <>
          <div className="w-full font-mono text-sm">Equipment</div>
        </>
      }
      mutationStatus={updateStatus}
      onDragEnd={(result) => dragEndHandler(result, raiseEquipment)}
      droppableId="equipment"
      stageInputComponents={equipment.map((e, index) => (
        <RecipeFlowInput
          key={e.id}
          id={e.id}
          index={index}
          optionModes={['notes']}
          mainInputComponents={() => (
            <input
              type="text"
              name="name"
              value={e.name}
              className="inp-reg inp-primary w-[350px]"
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
          auxiliaryComponents={
            <OptionalInput
              id={e.id}
              curIsOptional={e.optional}
              onRaiseInput={updateEquipmentHandler}
            />
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="fade-in flex flex-grow items-center justify-between"
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
          overviewComponents={
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
