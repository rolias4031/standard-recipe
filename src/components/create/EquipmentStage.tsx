import NotesInput from 'components/common/NotesInput';
import OptionalInput from 'components/common/OptionalInput';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genEquipment,
  insertIntoPrevArray,
} from 'lib/util-client';
import { TextInput } from 'pirate-ui';
import React, { Dispatch, SetStateAction } from 'react';
import { EquipmentWithAll } from 'types/models';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import StageInputContainer from './StageInputContainer';

interface EquipmentStageProps {
  equipment: EquipmentWithAll[];
  raiseEquipment: Dispatch<SetStateAction<EquipmentWithAll[]>>;
}

function EquipmentStage({ equipment, raiseEquipment }: EquipmentStageProps) {
  function removeEquipmentHandler(id: string) {
    raiseEquipment((prev: EquipmentWithAll[]) => {
      if (prev.length === 1) return [genEquipment()];
      const newIngredients = prev.filter((i) => i.id !== id);
      return newIngredients;
    });
  }
  function updateEquipmentHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseEquipment((prev: EquipmentWithAll[]) => {
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
      return newIngredientsArray as EquipmentWithAll[];
    });
  }

  return (
    <div className="flex flex-col pt-10 pb-3 space-y-10 h-full">
      <StageInputContainer>
        {equipment.map((e, index) => (
          <RecipeFlowInput
            key={e.id}
            id={e.id}
            order={index + 1}
            optionModes={['notes']}
            onRemoveInput={(id) => removeEquipmentHandler(id)}
            inputLabelComponents={
              <>
                <div className="w-80">Equipment</div>
              </>
            }
            inputComponents={
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
            }
            optionalComponent={
              <OptionalInput
                id={e.id}
                curIsOptional={e.optional}
                onRaiseInput={updateEquipmentHandler}
              />
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
      </StageInputContainer>
    </div>
  );
}

export default EquipmentStage;
