import { IngredientUnit, Instruction } from '@prisma/client';
import { isZeroLength, pickStyles } from 'lib/util-client';
import React, { ReactNode, useState, useMemo } from 'react';
import { FlowIngredient, RecipeWithFull, FlowEquipment } from 'types/models';
import { Stage } from 'types/types';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import EquipmentStage from './EquipmentStage';
import IngredientsStage from './IngredientsStage';
import InstructionsStage from './InstructionsStage';
import { checkStatusesForLoadingOrError } from './utils';
import { useCreateRecipeStateAndControls } from './hooks';
import ChevronRightIcon from 'components/common/icons/ChevronRightIcon';
import CreateController, { CreateControllerConfig } from './CreateController';
interface CreateRecipeProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
  stage: Stage;
}

function CreateRecipeFlow({ recipe, allUnits, stage }: CreateRecipeProps) {
  const { ingredients, equipment, instructions } =
    useCreateRecipeStateAndControls(recipe, allUnits);

  const isAnyUpdateLoadingOrError = checkStatusesForLoadingOrError([
    ingredients.updateStatus,
    equipment.updateStatus,
    instructions.updateStatus,
  ]);

  const isAnyUpdateTriggered =
    ingredients.isUpdateTriggered ||
    equipment.isUpdateTriggered ||
    instructions.isUpdateTriggered;

  const sharedControllerConfig = {
    recipeName: recipe.name,
    recipeId: recipe.id,
    isAnyUpdateLoadingOrErrorOrTriggered:
      isAnyUpdateLoadingOrError || isAnyUpdateTriggered,
    stage,
  };

  const firstControllerConfig: CreateControllerConfig<FlowIngredient> = {
    stageName: 'ingredients',
    stageLabel: 'Ingredients',
    inputs: ingredients.state,
    dispatchInputs: ingredients.set,
    inUseInputs: ingredients.inUse,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: ingredients.update,
    updateStatus: ingredients.updateStatus,
    cancelTriggeredUpdate: ingredients.cancelTriggeredUpdate,
  };

  const secondControllerConfig: CreateControllerConfig<FlowEquipment> = {
    stageName: 'equipment',
    stageLabel: 'Equipment',
    inputs: equipment.state,
    inUseInputs: equipment.inUse,
    dispatchInputs: equipment.set,
    schema: equipmentSchema,
    updateInputsMutation: equipment.update,
    updateStatus: equipment.updateStatus,
    cancelTriggeredUpdate: equipment.cancelTriggeredUpdate,
  };

  const thirdControllerConfig: CreateControllerConfig<Instruction> = {
    stageName: 'instructions',
    stageLabel: 'Instructions',
    inputs: instructions.state,
    inUseInputs: instructions.inUse,
    dispatchInputs: instructions.set,
    schema: instructionSchema,
    updateInputsMutation: instructions.update,
    updateStatus: instructions.updateStatus,
    cancelTriggeredUpdate: instructions.cancelTriggeredUpdate,
  };

  const instructionString = useMemo<string>(
    () => instructions.state.map((i) => i.description).join(''),
    [instructions],
  );

  const stageComponents = new Map<Stage, ReactNode>([
    [
      'ingredients',
      <CreateController
        key={recipe.id + firstControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={firstControllerConfig}
      >
        <IngredientsStage
          recipeId={recipe.id}
          ingredients={ingredients.inUse}
          raiseIngredients={ingredients.set}
          allUnits={allUnits}
          triggerDebouncedUpdate={ingredients.triggerUpdate}
        />
      </CreateController>,
    ],
    [
      'equipment',
      <CreateController
        key={recipe.id + secondControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={secondControllerConfig}
      >
        <EquipmentStage
          equipment={equipment.inUse}
          raiseEquipment={equipment.set}
          recipeId={recipe.id}
          triggerDebouncedUpdate={equipment.triggerUpdate}
        />
      </CreateController>,
    ],
    [
      'instructions',
      <CreateController
        key={recipe.id + thirdControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={thirdControllerConfig}
        extraHeaderComponent={
          <div className="mt-2 flex flex-col gap-2 md:flex-row">
            <CurrentIngredientsPanel
              ingredients={ingredients.state}
              instructionString={instructionString}
            />
            <CurrentEquipmentPanel
              equipment={equipment.state}
              instructionString={instructionString}
            />
          </div>
        }
      >
        <InstructionsStage
          allUnits={allUnits}
          recipeId={recipe.id}
          instructions={instructions.inUse}
          raiseInstructions={instructions.set}
          triggerDebouncedUpdate={instructions.triggerUpdate}
        />
      </CreateController>,
    ],
  ]);

  return <>{stageComponents.get(stage)}</>;
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
    <div className="flex h-fit flex-col rounded-lg border py-2 px-3 text-concrete md:basis-1/2">
      <div className="flex items-center justify-between">
        <span className="text-lg text-abyss">{header}</span>
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <ChevronRightIcon
            styles={{
              icon: pickStyles('w-9 h-9 text-abyss transition', [
                isOpen,
                'rotate-90',
              ]),
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
            <div className="flex justify-between space-x-1 font-mono">
              {i.unit ? (
                <>
                  <span>{i.quantity}</span>
                  <span>{i.unit.unit}</span>
                  {i.unit.abbreviation ? (
                    <span>{`(${i.unit.abbreviation})`}</span>
                  ) : null}
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

export default CreateRecipeFlow;
