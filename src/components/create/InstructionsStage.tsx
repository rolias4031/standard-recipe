import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import StageFrame from './StageFrame';
import { Instruction } from '@prisma/client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genId,
  genInstruction,
  insertIntoPrevArray,
  isZeroLength,
  pickStyles,
} from 'lib/util-client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import { GeneralButton } from 'pirate-ui';
import OptionalInput from 'components/common/OptionalInput';
import TrashIcon from 'components/common/icons/TrashIcon';
import CogIcon from 'components/common/icons/CogIcon';
import { FlowEquipment, FlowIngredient } from 'types/models';
import TextWithTooltip from 'components/common/tooltip/TextWithTooltip';
import RenderInstructionTags from 'components/common/RenderInstructionTags';
import IngredientTooltip from 'components/common/tooltip/IngredientTooltip';
import ChevronRightIcon from 'components/common/icons/ChevronRightIcon';
import { dragEndHandler } from './utils';
import EquipmentTooltip from 'components/common/tooltip/EquipmentTooltip';

function PanelCard({
  children,
  header,
}: {
  children: ReactNode;
  header: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="flex h-fit basis-1/2 flex-col rounded border p-5 text-concrete">
      <div className="mb-2 flex justify-between">
        <span className="text-lg text-abyss">{header}</span>
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <ChevronRightIcon
            styles={{
              icon: pickStyles('w-5 h-5 transition', [isOpen, 'rotate-90']),
            }}
          />
        </button>
      </div>
      {isOpen ? children : null}
    </div>
  );
}

function CurrentIngredientsPanel({
  ingredients,
  instructionString,
}: {
  ingredients: FlowIngredient[];
  instructionString: string;
}) {
  if (isZeroLength(ingredients)) {
    return null;
  }
  return (
    <PanelCard header="Ingredients">
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
              {i.unit ? (
                <>
                  <span>{i.quantity}</span>
                  <span>{i.unit.unit}</span>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </PanelCard>
  );
}

function CurrentEquipmentPanel({
  equipment,
  instructionString,
}: {
  equipment: FlowEquipment[];
  instructionString: string;
}) {
  if (isZeroLength(equipment)) {
    return null;
  }
  return (
    <PanelCard header="Equipment">
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
    </PanelCard>
  );
}

interface InstructionsStageProps {
  instructions: Instruction[];
  ingredients: FlowIngredient[];
  equipment: FlowEquipment[];
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
  
  const instructionString = useMemo<string>(
    () => instructions.map((i) => i.description).join(''),
    [instructions],
  );

  return (
    <StageFrame
      droppableId="instructions"
      onDragEnd={(result) => dragEndHandler(result, raiseInstructions)}
      stageInputLabels={
        <div className="w-full font-mono text-sm">Instructions</div>
      }
      mutationStatus=""
      stageInputComponents={instructions.map((i, idx) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          index={idx}
          optionModes={['none']}
          overviewComponents={<>{i.optional ? <span>optional</span> : null}</>}
          mainInputComponents={(isInputFocused, setIsInputFocused) => (
            <>
              {isInputFocused ? (
                <textarea
                  autoFocus
                  name="description"
                  value={i.description}
                  className="inp-primary inp-reg w-5/6 resize-none"
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
                  className="min-h-[30px] w-5/6 rounded-sm bg-smoke px-2 py-1"
                  onClick={() => setIsInputFocused(true)}
                >
                  <RenderInstructionTags
                    description={i.description}
                    tags={[...ingredients, ...equipment]}
                    ingredientTooltipComponent={(ingredient) => (
                      <TextWithTooltip
                        key={`${ingredient.id}${genId()}`}
                        text={ingredient.name}
                        tooltipElement={
                          <IngredientTooltip ingredient={ingredient} />
                        }
                      />
                    )}
                    equipmentTooltipComponent={(equipment) => (
                      <TextWithTooltip
                        key={`${equipment.id}${genId()}`}
                        text={equipment.name}
                        tooltipElement={
                          <EquipmentTooltip equipment={equipment} />
                        }
                      />
                    )}
                  />
                </div>
              )}
            </>
          )}
          auxiliaryComponents={
            <OptionalInput
              id={i.id}
              curIsOptional={i.optional}
              onRaiseInput={updateInstructionHandler}
            />
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="flex flex-grow items-center justify-between"
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
      <div className="mx-auto flex w-5/6 space-x-5">
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
