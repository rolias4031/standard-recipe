import { Equipment, IngredientUnit, Instruction } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import {
  genEquipment,
  genIngredient,
  genInstruction,
  pickStyles,
} from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { Dispatch, SetStateAction, ReactNode, useState } from 'react';
import {
  IngredientWithAll,
  IngredientWithAllModName,
  RecipeWithFull,
} from 'types/models';
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
  children: (stage: number) => ReactNode;
  onSave: () => void;
  recipeName: string;
  stageConfig: Map<number, StageConfig>;
}

function FlowController({
  children,
  onSave,
  recipeName,
  stageConfig,
}: FlowControllerProps) {
  const [stage, setStage] = useState<number>(1);

  function nextStageHandler() {
    setStage((prev: number) => {
      if (prev === 4) return prev;
      if (prev >= 1) return prev + 1;
      return prev;
    });
  }

  function prevStageHandler() {
    setStage((prev: number) => {
      if (prev === 1) return prev;
      if (prev > 1) return prev - 1;
      return prev;
    });
  }

  function createNewInputHandler() {
    const dispatch = stageConfig.get(stage)?.dispatch;
    const genInput = stageConfig.get(stage)?.genInput;
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
          <p className="text-2xl font-bold">{stageConfig.get(stage)?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <GeneralButton
            styles={{
              button: 'text-xs',
            }}
          >
            tips
          </GeneralButton>
          <GeneralButton
            styles={{
              button: 'btn-reg btn-primary',
            }}
            onClick={onSave}
          >
            Save
          </GeneralButton>
        </div>
      </div>
      {children(stage)}
      <div className="w-full">
        <button
          type="button"
          className="ml-auto flex items-center w-fit btn-primary btn-reg transition-all"
          onClick={createNewInputHandler}
        >
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
          <span className="pr-2 pl-1 text-lg">
            {stageConfig.get(stage)?.label}
          </span>
        </button>
      </div>
      <div className="flex border-t border-concrete bg-white p-3 left-10 right-10 justify-between items-center fixed bottom-0 transition-all">
        <GeneralButton
          styles={{
            button: 'btn-reg btn-primary scale',
          }}
          onClick={prevStageHandler}
        >
          <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
        <FlowProgress curStage={stage} />
        <GeneralButton
          styles={{
            button: 'btn-reg btn-primary scale',
          }}
          onClick={nextStageHandler}
        >
          <ArrowRightIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
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

type ClientInput =
  | Dispatch<SetStateAction<IngredientWithAllModName[]>>
  | Dispatch<SetStateAction<Equipment[]>>
  | Dispatch<SetStateAction<Instruction[]>>;
interface StageConfig {
  dispatch: ClientInput;
  genInput: () => IngredientWithAllModName | Equipment | Instruction;
  name: string;
  label: string;
}
interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function CreateRecipeFlow({ recipe, allUnits }: CreateRecipeFlowProps) {

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
  const [info, setInfo] = useState();

  const stageConfig = new Map<number, StageConfig>([
    [
      1,
      {
        name: 'Ingredients',
        dispatch: setIngredients,
        genInput: genIngredient,
        label: 'Ingredient',
      },
    ],
    [
      2,
      {
        name: 'Equipment',
        dispatch: setEquipment,
        genInput: genEquipment,
        label: 'Equipment',
      },
    ],
    [
      3,
      {
        name: 'Instructions',
        dispatch: setInstructions,
        genInput: genInstruction,
        label: 'Instruction',
      },
    ],
  ]);

  return (
    <>
      <FlowController
        onSave={() => {}}
        recipeName={recipe.name}
        stageConfig={stageConfig}
      >
        {(stage) => (
          <>
            {stage === 1 ? (
              <IngredientsStage
                ingredients={ingredients}
                raiseIngredients={setIngredients}
                allUnits={allUnits}
              />
            ) : null}
            {stage === 2 ? (
              <EquipmentStage
                equipment={equipment}
                raiseEquipment={setEquipment}
              />
            ) : null}
            {stage === 3 ? (
              <InstructionsStage
                instructions={instructions}
                raiseInstructions={setInstructions}
              />
            ) : null}
          </>
        )}
      </FlowController>
    </>
  );
}

export default CreateRecipeFlow;
