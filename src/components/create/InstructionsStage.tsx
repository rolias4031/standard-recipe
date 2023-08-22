import React, { Dispatch, SetStateAction } from 'react';
import StageFrame from './StageFrame';
import { IngredientUnit, Instruction } from '@prisma/client';
import {
  findRecipeInputIndexById,
  insertIntoPrevArray,
} from 'lib/util-client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import OptionalInput from 'components/common/OptionalInput';
import { FlowEquipment, FlowIngredient } from 'types/models';
import { dragEndHandler, removeDeletedInputFromStateHandler } from './utils';
import { useDeleteInstruction } from 'lib/mutations';
import CharCount from 'components/common/CharCount';
import FlowInputBlock from './FlowInputBlock';
import { OptionDialog } from './OptionDialog';
interface InstructionsStageProps {
  recipeId: string;
  instructions: Instruction[];
  ingredients: FlowIngredient[];
  equipment: FlowEquipment[];
  raiseInstructions: Dispatch<SetStateAction<Instruction[]>>;
  allUnits: IngredientUnit[];
  triggerDebouncedUpdate: () => void;
}

function InstructionsStage({
  recipeId,
  instructions,
  ingredients,
  equipment,
  raiseInstructions,
  triggerDebouncedUpdate,
}: InstructionsStageProps) {
  const { mutate: deleteInstruction, status: deleteStatus } =
    useDeleteInstruction();

  function removeInstructionHandler(id: string) {
    raiseInstructions((prev: Instruction[]) => {
      return removeDeletedInputFromStateHandler(prev, id);
    });
    deleteInstruction({ id, recipeId, replace: true });
  }

  function updateInstructionHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseInstructions((prev: Instruction[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const updatedInstruction = {
        ...prev[index],
        [name]: value,
      };
      const newInstructionArray = insertIntoPrevArray(
        prev,
        index,
        updatedInstruction,
      );
      return newInstructionArray as Instruction[];
    });
    triggerDebouncedUpdate();
  }

  const inputBlocks = instructions.map((i, idx) =>
    !i.inUse ? null : (
      <FlowInputBlock
        key={i.id}
        id={i.id}
        order={idx + 1}
        mainInputComponent={(isMainInputFocused, setIsMainInputFocused) => (
          <div className="flex w-full flex-col gap-1">
            <textarea
              name="description"
              value={i.description}
              className="inp-primary w-full resize-none p-2"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                updateInstructionHandler({
                  id: i.id,
                  name: e.target.name,
                  value: e.target.value,
                });
              }}
              onFocus={() => setIsMainInputFocused(true)}
              onBlur={() => setIsMainInputFocused(false)}
              rows={5}
            />
            {isMainInputFocused ? (
              <CharCount charLimit={250} string={i.description} />
            ) : null}
          </div>
        )}
        optionsComponent={
          <OptionDialog.Card>
            <OptionDialog.Heading
              name={i.order.toString()}
              onDeleteIngredient={() => removeInstructionHandler(i.id)}
            />
            <OptionalInput
              id={i.id}
              curIsOptional={i.optional}
              onRaiseInput={updateInstructionHandler}
            />
          </OptionDialog.Card>
        }
      />
    ),
  );

  return (
    <StageFrame
      droppableId="instructions"
      onDragEnd={(result) => {
        dragEndHandler(result, raiseInstructions);
        triggerDebouncedUpdate();
      }}
      stageInputComponents={inputBlocks}
    />
  );
}

export default InstructionsStage;
