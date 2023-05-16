import { Equipment, IngredientUnit, Instruction } from '@prisma/client';
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
  IngredientWithAllModName,
  RecipeWithFull,
} from 'types/models';
import { BaseZodSchema } from 'types/types';
import {
  newEquipmentSchema,
  newIngredientSchema,
  newInstructionSchema,
} from 'validation/schemas';
import EquipmentStage from './EquipmentStage';
import IngredientsStage from './IngredientsStage';
import InstructionsStage from './InstructionsStage';

function FlowProgress({ curStage }: { curStage: number }) {
  const dots = [1, 2, 3].map((i) => {
    return (
      <div
        key={i}
        className={pickStyles('h-3 w-3 rounded-full border-2 border-fern', [
          i === curStage,
          'bg-fern',
        ])}
      ></div>
    );
  });
  return <div className="flex space-x-1 items-center">{dots}</div>;
}

interface FlowControllerProps {
  children: ReactNode;
  onSave: () => void;
  stage: number;
  setStage: Dispatch<SetStateAction<number>>;
  recipeName: string;
  stageConfig?: StageConfig;
}

function FlowController({
  children,
  onSave,
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
      const valid = stageConfig?.schema.safeParse(input);
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
    <div className="flex flex-col flex-grow">
      <div className="flex justify-between items-center space-x-2">
        <div className="flex items-end space-x-2">
          <p className="text-lg font-light">{recipeName}</p>
          <p className="text-2xl font-bold">{stageConfig?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-xs">tips</button>
          <button className="btn-reg btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
      {children}
      <div className="w-full">
        <button
          type="button"
          className="ml-auto flex items-center w-fit btn-primary btn-reg transition-all"
          onClick={createNewInputHandler}
        >
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
          <span className="pr-2 pl-1 text-lg">{stageConfig?.label}</span>
        </button>
      </div>
      <div className="flex flex-col space-y-3 border-concrete bg-white left-10 right-10 justify-between items-center fixed bottom-0 transition-all">
        {isError ? (
          <div className="flex flex-col p-1 bg-red-400 text-white rounded-sm">
            <button className="ml-auto" onClick={() => setIsError(false)}>
              <XIcon styles={{ icon: 'w-4 h-4' }} />
            </button>
            <p className="px-3 pb-3">
              {`One or more of your ${stageConfig?.name.toLowerCase()} has missing or invalid info. Recheck each field for errors.
              `}
            </p>
          </div>
        ) : null}
        <div className="flex w-full border-t border-concerete bg-white p-3 justify-between items-center">
          <button
            className="btn-reg btn-primary scale"
            onClick={prevStageHandler}
          >
            <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
          </button>
          <FlowProgress curStage={stage} />
          <button
            className="btn-reg btn-primary scale"
            onClick={nextStageHandler}
          >
            <ArrowRightIcon styles={{ icon: 'w-7 h-7 text-white' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function initIngredients(
  ingredients: IngredientWithAll[],
): IngredientWithAllModName[] {
  if (ingredients.length > 0) {
    const ingredientsWithFlatName = ingredients.map((i) => {
      const flatSubs = i.substitutes.map((s) => s.name);
      return { ...i, name: i.name.name, substitutes: flatSubs };
    });
    return ingredientsWithFlatName;
  }
  return [genIngredient(), genIngredient()];
}

function initEquipment(equipment: Equipment[]): Equipment[] {
  if (equipment.length > 0) {
    return equipment;
  }
  return [genEquipment(), genEquipment()];
}

function initInstructions(instructions: Instruction[]): Instruction[] {
  if (instructions.length > 0) {
    return instructions;
  }
  return [genInstruction(), genInstruction()];
}

type StageDispatchFunction =
  | Dispatch<SetStateAction<IngredientWithAllModName[]>>
  | Dispatch<SetStateAction<Equipment[]>>
  | Dispatch<SetStateAction<Instruction[]>>;
interface StageConfig {
  inputs: IngredientWithAllModName[] | Equipment[] | Instruction[];
  dispatch: StageDispatchFunction;
  genInput: () => IngredientWithAllModName | Equipment | Instruction;
  schema: BaseZodSchema;
  name: string;
  label: string;
}

interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function CreateRecipeFlow({ recipe, allUnits }: CreateRecipeFlowProps) {
  const [stage, setStage] = useState<number>(1);
  // state and mutations
  const [ingredients, setIngredients] = useState<IngredientWithAllModName[]>(
    () => initIngredients(recipe.ingredients),
  );
  const [equipment, setEquipment] = useState<Equipment[]>(() =>
    initEquipment(recipe.equipment),
  );
  const [instructions, setInstructions] = useState<Instruction[]>(() =>
    initInstructions(recipe.instructions),
  );

  const stageConfig = new Map<number, StageConfig>([
    [
      1,
      {
        name: 'Ingredients',
        inputs: ingredients,
        dispatch: setIngredients,
        genInput: genIngredient,
        schema: newIngredientSchema,
        label: 'Ingredient',
      },
    ],
    [
      2,
      {
        name: 'Equipment',
        inputs: equipment,
        dispatch: setEquipment,
        genInput: genEquipment,
        schema: newEquipmentSchema,
        label: 'Equipment',
      },
    ],
    [
      3,
      {
        name: 'Instructions',
        inputs: instructions,
        dispatch: setInstructions,
        genInput: genInstruction,
        schema: newInstructionSchema,
        label: 'Instruction',
      },
    ],
  ]);

  return (
    <>
      <FlowController
        onSave={() => {}}
        recipeName={recipe.name}
        stageConfig={stageConfig.get(stage)}
        setStage={setStage}
        stage={stage}
      >
        {stage === 1 ? (
          <IngredientsStage
            ingredients={ingredients}
            raiseIngredients={setIngredients}
            allUnits={allUnits}
          />
        ) : null}
        {stage === 2 ? (
          <EquipmentStage equipment={equipment} raiseEquipment={setEquipment} />
        ) : null}
        {stage === 3 ? (
          <InstructionsStage
            instructions={instructions}
            ingredients={ingredients}
            equipment={equipment}
            raiseInstructions={setInstructions}
          />
        ) : null}
      </FlowController>
    </>
  );
}

export default CreateRecipeFlow;
