import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import StageFrame from './StageFrame';
import { Equipment, Instruction } from '@prisma/client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genId,
  genInstruction,
  insertIntoPrevArray,
  isZeroLength,
  pickStyles,
  reorderDraggableInputs,
} from 'lib/util-client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import { GeneralButton } from 'pirate-ui';
import OptionalInput from 'components/common/OptionalInput';
import TrashIcon from 'components/common/icons/TrashIcon';
import CogIcon from 'components/common/icons/CogIcon';
import { IngredientWithAllModName } from 'types/models';
import TextWithTooltip from 'components/common/tooltip/TextWithTooltip';
import RenderInstructionTags from 'components/common/RenderInstructionTags';
import IngredientTooltip from 'components/common/tooltip/IngredientTooltip';

function CurrentIngredientsPanel({
  ingredients,
  instructionString,
}: {
  ingredients: IngredientWithAllModName[];
  instructionString: string;
}) {
  if (isZeroLength(ingredients)) {
    return null;
  }
  return (
    <div className="flex flex-col basis-1/2 text-concrete p-5 border rounded">
      {ingredients.map((i) => {
        return (
          <div
            key={i.id}
            className={pickStyles('flex justify-between space-x-1', [
              instructionString.includes(i.name),
              'text-fern',
            ])}
          >
            <span>{i.name}</span>
            <div className="flex justify-between space-x-1">
              <span>{i.quantity}</span>
              <span>{i.unit.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CurrentEquipmentPanel({
  equipment,
  instructionString,
}: {
  equipment: Equipment[];
  instructionString: string;
}) {
  if (isZeroLength(equipment)) {
    return null;
  }
  return (
    <div className="flex flex-col basis-1/2 text-concrete p-5 border rounded">
      {equipment.map((e) => {
        return (
          <div
            key={e.id}
            className={pickStyles('flex justify-between space-x-1', [
              instructionString.includes(e.name),
              'text-fern',
            ])}
          >
            {e.name}
          </div>
        );
      })}
    </div>
  );
}

interface InstructionsStageProps {
  instructions: Instruction[];
  ingredients: IngredientWithAllModName[];
  equipment: Equipment[];
  raiseInstructions: Dispatch<SetStateAction<Instruction[]>>;
}

function InstructionsStage({
  instructions,
  ingredients,
  equipment,
  raiseInstructions,
}: InstructionsStageProps) {
  function removeInstructionHandler(id: string) {
    raiseInstructions((prev: Instruction[]) => {
      if (prev.length === 1) return [genInstruction()];
      const newInstructions = prev.filter((i) => i.id !== id);
      return newInstructions;
    });
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
  }

  function dragEndHandler(result: DropResult) {
    if (!result.destination) return;
    raiseInstructions((prev: Instruction[]) => {
      return reorderDraggableInputs(result, prev);
    });
  }

  const instructionString = useMemo<string>(
    () => instructions.map((i) => i.description).join(''),
    [instructions],
  );

  return (
    <StageFrame
      droppableId="instructions"
      onDragEnd={dragEndHandler}
      stageInputLabels={
        <div className="w-full font-mono text-sm">Instructions</div>
      }
      stageInputComponents={instructions.map((i, idx) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          index={idx}
          optionModes={['none']}
          optionOverviewComponents={
            <>{i.optional ? <span>optional</span> : null}</>
          }
          inputComponents={(isInputFocused, setIsInputFocused) => (
            <>
              {isInputFocused ? (
                <textarea
                  autoFocus
                  name="description"
                  value={i.description}
                  className="inp-primary inp-reg resize-none w-5/6"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    updateInstructionHandler({
                      id: i.id,
                      name: e.target.name,
                      value: e.target.value,
                    });
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  rows={4}
                />
              ) : (
                <div
                  className="min-h-[30px] rounded-sm w-5/6 px-2 py-1 bg-smoke"
                  onClick={() => setIsInputFocused(true)}
                >
                  <RenderInstructionTags
                    description={i.description}
                    tags={[...ingredients, ...equipment]}
                    ingredientTagComponent={(ingredient) => (
                      <TextWithTooltip
                        key={`${ingredient.id}${genId()}`}
                        text={ingredient.name}
                        tooltipElement={
                          <IngredientTooltip ingredient={ingredient} />
                        }
                      />
                    )}
                    equipmentTagComponent={(equipment) => (
                      <TextWithTooltip
                        key={`${equipment.id}${genId()}`}
                        text={equipment.name}
                        tooltipElement={
                          <div className="max-w-[250px] p-2 text-xs rounded-md border-2 bg-white border-fern shadow-md shadow-concrete">
                            {equipment.name}
                          </div>
                        }
                      />
                    )}
                  />
                </div>
              )}
            </>
          )}
          optionalComponent={
            <OptionalInput
              id={i.id}
              curIsOptional={i.optional}
              onRaiseInput={updateInstructionHandler}
            />
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="flex flex-grow justify-between items-center fade-in"
            >
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
              <GeneralButton onClick={() => removeInstructionHandler(i.id)}>
                <TrashIcon
                  styles={{
                    icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                  }}
                />
              </GeneralButton>
            </div>
          )}
        />
      ))}
    >
      <div className="flex space-x-5 w-5/6 mx-auto">
        <CurrentIngredientsPanel
          ingredients={ingredients}
          instructionString={instructionString}
        />
        <CurrentEquipmentPanel
          equipment={equipment}
          instructionString={instructionString}
        />
      </div>
    </StageFrame>
  );
}

export default InstructionsStage;
