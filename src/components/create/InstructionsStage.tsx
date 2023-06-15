import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import StageFrame from './StageFrame';
import { IngredientUnit, Instruction } from '@prisma/client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genId,
  genInstruction,
  insertIntoPrevArray,
  isClientId,
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
import { dragEndHandler, useDebouncedAutosave } from './utils';
import EquipmentTooltip from 'components/common/tooltip/EquipmentTooltip';
import { useDeleteInstruction, useUpdateInstruction } from 'lib/mutations';
import { instructionSchema } from 'validation/schemas';
import TemperatureTooltip from 'components/common/tooltip/TemperatureTooltip';
import TextWithPopover from 'components/popover/TextWithPopover';
import MeasurementPopover from 'components/popover/MeasurementPopover';

function createUnitMap(allUnits: IngredientUnit[]) {
  const unitAbbreviations = allUnits.map((u) => u.abbreviation);
  const unitPlurals = allUnits.map((u) => u.plural);
  const unitsMap = new Map<string, IngredientUnit>();
  allUnits.forEach((u) => {
    unitsMap.set(u.unit, u);
  });
  unitAbbreviations.forEach((a) => {
    const unit = allUnits.find((u) => u.abbreviation === a);
    if (!unit) return;
    unitsMap.set(a, unit);
  });
  unitPlurals.forEach((p) => {
    const unit = allUnits.find((u) => u.plural === p);
    if (!unit) return;
    unitsMap.set(p, unit);
  });

  console.log('unitsMap', unitsMap);

  return unitsMap;
}

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
  recipeId: string;
  instructions: Instruction[];
  ingredients: FlowIngredient[];
  equipment: FlowEquipment[];
  raiseInstructions: Dispatch<SetStateAction<Instruction[]>>;
  allUnits: IngredientUnit[];
}

function InstructionsStage({
  recipeId,
  instructions,
  ingredients,
  equipment,
  raiseInstructions,
  allUnits,
}: InstructionsStageProps) {
  const { mutate: updateInstruction, status: updateStatus } =
    useUpdateInstruction();
  const { mutate: deleteInstruction, status: deleteStatus } =
    useDeleteInstruction();

  const unitsMap = useMemo(() => createUnitMap(allUnits), [allUnits]);

  const { triggerAutosave } = useDebouncedAutosave({
    dispatchInputs: raiseInstructions,
    inputs: instructions,
    recipeId,
    schema: instructionSchema,
    updateInputsMutation: updateInstruction,
  });

  function removeInstructionHandler(id: string) {
    raiseInstructions((prev: Instruction[]) => {
      if (prev.length === 1) return [genInstruction()];
      const newInstructions = prev.filter((i) => i.id !== id);
      return newInstructions;
    });
    if (isClientId(id)) return;
    deleteInstruction({ id });
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
    triggerAutosave();
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
      mutationStatus={updateStatus}
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
                    allUnits={allUnits}
                    unitsMap={unitsMap}
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
                    measurementPopoverComponent={(measurement) => (
                      <TextWithPopover
                        key={genId()}
                        text={
                          measurement.segment.quantity +
                          measurement.segment.text
                        }
                        tooltip={
                          <MeasurementPopover measurement={measurement} />
                        }
                      />
                    )}
                    temperatureTooltipComponent={(temp) => (
                      <TextWithTooltip
                        key={temp.temperature + temp.unit}
                        text={temp.text}
                        styles={{ text: 'font-semibold' }}
                        tooltipElement={<TemperatureTooltip temp={temp} />}
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
