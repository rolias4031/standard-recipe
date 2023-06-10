/* eslint-disable @typescript-eslint/no-unused-vars */
import { IngredientUnit, Instruction } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';
import {
  genEquipment,
  genIngredient,
  genInstruction,
  pickStyles,
} from 'lib/util-client';
import React, { Dispatch, SetStateAction, ReactNode, useState } from 'react';
import {
  IngredientWithAll,
  FlowIngredient,
  RecipeGeneralInfo,
  RecipeWithFull,
  FlowEquipment,
  EquipmentWithAll,
} from 'types/models';
import { BaseZodSchema } from 'types/types';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import EquipmentStage from './EquipmentStage';
import InfoStage from './InfoStage';
import IngredientsStage from './IngredientsStage';
import InstructionsStage from './InstructionsStage';

interface FlowControllerProps {
  children: ReactNode;
  stage: number;
  setStage: Dispatch<SetStateAction<number>>;
  recipeName: string;
  stageConfig?: StageConfig;
}

function FlowController({
  children,
  setStage,
  stage,
  recipeName,
  stageConfig,
}: FlowControllerProps) {
  const [isError, setIsError] = useState<boolean>(false);
  function nextStageHandler() {
    const curInputs = stageConfig?.inputs;
    if (!curInputs) return;
    for (const input of curInputs) {
      const schema = stageConfig.schema;
      if (!schema) return;
      const valid = schema.safeParse(input);
      if (!valid.success) {
        setIsError(true);
        return;
      }
    }
    setIsError(false);
    setStage((prev: number) => {
      if (prev === 4) return prev;
      if (prev >= 1) return prev + 1;
      return prev;
    });
  }

  function prevStageHandler() {
    setIsError(false);
    setStage((prev: number) => {
      if (prev === 1) return prev;
      if (prev > 1) return prev - 1;
      return prev;
    });
  }

  function createNewInputHandler() {
    const dispatch = stageConfig?.dispatch;
    const genInput = stageConfig?.genInput;
    if (!dispatch || !genInput) return;
    dispatch((prev: any[]) => {
      const newInput = genInput();
      const idExists = prev.findIndex((i) => i.id === newInput.id);
      if (idExists !== -1) return prev;
      return [...prev, newInput];
    });
  }

  return (
    <div className="flex flex-grow flex-col">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-end space-x-2">
          <p className="text-lg font-light">{recipeName}</p>
          <p className="text-2xl font-bold">{stageConfig?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-xs">tips</button>
        </div>
      </div>
      {children}
      {stage !== 4 ? (
        <div className="w-full">
          <button
            type="button"
            className="btn-primary btn-reg ml-auto flex w-fit items-center transition-all"
            onClick={createNewInputHandler}
          >
            <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
            <span className="pr-2 pl-1 text-lg">{stageConfig?.label}</span>
          </button>
        </div>
      ) : null}
      <div className="fixed left-10 right-10 bottom-0 flex flex-col items-center justify-between space-y-3 border-concrete transition-all">
        {isError ? (
          <StageError
            stageName={stageConfig?.name.toLowerCase()}
            dispatchIsError={setIsError}
          />
        ) : null}
        <ControlPanel>
          <button
            className="btn-reg btn-primary scale disabled:opacity-0"
            onClick={prevStageHandler}
            disabled={stage === 1}
          >
            <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
          </button>
          {stage !== 4 ? (
            <FlowProgress curStage={stage} />
          ) : (
            <button>Publish!</button>
          )}
          <button
            className="btn-reg btn-primary scale disabled:opacity-0"
            onClick={nextStageHandler}
            disabled={stage === 4}
          >
            <ArrowRightIcon styles={{ icon: 'w-7 h-7 text-white' }} />
          </button>
        </ControlPanel>
      </div>
    </div>
  );
}

function initIngredients(ingredients: IngredientWithAll[]): FlowIngredient[] {
  if (ingredients.length > 0) {
    const flowIngredient = ingredients.map((i) => {
      const substituteNames = i.substitutes.map((s) => s.name);
      const name = i.name.name;
      const { ingredientNameId, ingredientUnitId, ...keep } = i;
      return { ...keep, name, substitutes: substituteNames };
    });
    return flowIngredient;
  }
  return [genIngredient(), genIngredient()];
}

function initEquipment(equipment: EquipmentWithAll[]): FlowEquipment[] {
  if (equipment.length > 0) {
    const flowEquipment = equipment.map((e) => {
      const substituteNames = e.substitutes.map((s) => s.name);
      const name = e.name.name;
      const { equipmentNameId, ...keep } = e;
      return { ...keep, name, substitutes: substituteNames };
    });
    return flowEquipment;
  }
  return [genEquipment(), genEquipment()];
}

function initInstructions(instructions: Instruction[]): Instruction[] {
  if (instructions.length > 0) {
    return instructions;
  }
  return [genInstruction(), genInstruction()];
}

function initGeneralInfo(recipe: RecipeWithFull): RecipeGeneralInfo {
  return { name: recipe.name, description: recipe.description };
}

type StageDispatchFunction =
  | Dispatch<SetStateAction<FlowIngredient[]>>
  | Dispatch<SetStateAction<FlowEquipment[]>>
  | Dispatch<SetStateAction<Instruction[]>>;

interface StageConfig {
  component: ReactNode;
  inputs?: FlowIngredient[] | FlowEquipment[] | Instruction[];
  dispatch?: StageDispatchFunction;
  genInput?: () => FlowIngredient | FlowEquipment | Instruction;
  schema?: BaseZodSchema;
  name: string;
  label: string;
}

interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function CreateRecipeFlow({ recipe, allUnits }: CreateRecipeFlowProps) {
  // state
  const [stage, setStage] = useState<number>(1);

  const [ingredients, setIngredients] = useState<FlowIngredient[]>(() =>
    initIngredients(recipe.ingredients),
  );
  const [equipment, setEquipment] = useState<FlowEquipment[]>(() =>
    initEquipment(recipe.equipment),
  );
  const [instructions, setInstructions] = useState<Instruction[]>(() =>
    initInstructions(recipe.instructions),
  );
  const [generalInfo, setGeneralInfo] = useState<RecipeGeneralInfo>(() =>
    initGeneralInfo(recipe),
  );

  const stageConfig = new Map<number, StageConfig>([
    [
      1,
      {
        component: (
          <IngredientsStage
            recipeId={recipe.id}
            ingredients={ingredients}
            raiseIngredients={setIngredients}
            allUnits={allUnits}
          />
        ),
        name: 'Ingredients',
        inputs: ingredients,
        dispatch: setIngredients,
        genInput: genIngredient,
        schema: ingredientSchema(allUnits.map((u) => u.id)),
        label: 'Ingredient',
      },
    ],
    [
      2,
      {
        component: (
          <EquipmentStage
            equipment={equipment}
            raiseEquipment={setEquipment}
            recipeId={recipe.id}
          />
        ),
        name: 'Equipment',
        inputs: equipment,
        dispatch: setEquipment,
        genInput: genEquipment,
        schema: equipmentSchema,
        label: 'Equipment',
      },
    ],
    [
      3,
      {
        component: (
          <InstructionsStage
            instructions={instructions}
            ingredients={ingredients}
            equipment={equipment}
            raiseInstructions={setInstructions}
          />
        ),
        name: 'Instructions',
        inputs: instructions,
        dispatch: setInstructions,
        genInput: genInstruction,
        schema: instructionSchema,
        label: 'Instruction',
      },
    ],
    [
      4,
      {
        component: (
          <InfoStage
            generalInfo={generalInfo}
            raiseGeneralInfo={setGeneralInfo}
          />
        ),
        name: 'Info',
        label: 'Info',
      },
    ],
  ]);

  return (
    <>
      <FlowController
        key={recipe.id}
        recipeName={recipe.name}
        stageConfig={stageConfig.get(stage)}
        setStage={setStage}
        stage={stage}
      >
        {stageConfig.get(stage)?.component}
      </FlowController>
    </>
  );
}

function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <div className="border-concerete flex w-full items-center justify-between border-t bg-white p-3">
      {children}
    </div>
  );
}

function FlowProgress({ curStage }: { curStage: number }) {
  const dots = [1, 2, 3].map((i) => {
    return (
      <div
        key={i}
        className={pickStyles('h-3 w-3 rounded-full border-2 border-fern', [
          i === curStage,
          'bg-fern',
        ])}
      />
    );
  });
  return <div className="flex items-center space-x-1">{dots}</div>;
}

function StageError({
  stageName,
  dispatchIsError,
}: {
  stageName?: string;
  dispatchIsError: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col rounded-sm bg-red-400 p-1 text-white">
      <button className="ml-auto" onClick={() => dispatchIsError(false)}>
        <XIcon styles={{ icon: 'w-4 h-4' }} />
      </button>
      <p className="px-3 pb-3">
        {`One or more of your ${stageName} has missing or invalid info. Recheck each field for errors.
    `}
      </p>
    </div>
  );
}

export default CreateRecipeFlow;
