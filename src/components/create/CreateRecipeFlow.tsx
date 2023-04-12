import { IngredientName, IngredientUnits } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import { genId, pickStyles } from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { Dispatch, SetStateAction, ReactNode, useState } from 'react';
import {
  EquipmentWithAll,
  IngredientWithAll,
  IngredientWithAllModName,
  InstructionWithAll,
  RecipeWithFull,
} from 'types/models';
import IngredientsStage from './IngredientsStage';

function genIngredientUnits(): IngredientUnits {
  return {
    id: '',
    units: '',
    description: '',
  };
}

function genIngredient(): IngredientWithAllModName {
  return {
    id: genId(),
    recipeId: '',
    name: '',
    units: genIngredientUnits(),
    ingredientNameId: '',
    quantity: 0,
    ingredientUnitsId: '',
    substitutes: [],
    instructionLinks: [],
    optional: false,
    notes: '',
  };
}

function genEquipment(): EquipmentWithAll {
  return {
    id: genId(),
    name: '',
    optional: false,
    notes: '',
    instructionLinks: [],
    recipeId: '',
  };
}

function genInstruction(): InstructionWithAll {
  return {
    id: genId(),
    description: '',
    order: 0,
    optional: false,
    equipmentLinks: [],
    ingredientLinks: [],
    recipeId: '',
  };
}

function FlowProgress({ curStage }: { curStage: number }) {
  const dots = [1, 2, 3].map((i) => {
    return (
      <div
        key={i}
        className={pickStyles('h-3 w-3 rounded-full border-2 border-white', [
          i === curStage,
          'bg-white',
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
          <p className="text-lg text-secondary font-light">{recipeName}</p>
          <p className="text-2xl text-primary font-bold">
            {stageConfig.get(stage)?.name}
          </p>
        </div>
        <GeneralButton
          styles={{
            button: 'btn-reg btn-primary',
          }}
          onClick={onSave}
        >
          Save
        </GeneralButton>
      </div>
      {children(stage)}
      <div className="w-full">
        <button
          type="button"
          className="ml-auto p-1 rounded flex items-center w-fit btn-primary transition-all"
          onClick={createNewInputHandler}
        >
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
          <span className="pr-2 pl-1 text-lg">
            {stageConfig.get(stage)?.label}
          </span>
        </button>
      </div>
      <div className="flex bg-neutral-800 p-1 rounded-full justify-between items-center fixed bottom-6 left-32 right-32 shadow-lg shadow-neutral-600 transition-all">
        <GeneralButton
          styles={{
            button: 'btn-circle btn-primary scale',
          }}
          onClick={prevStageHandler}
        >
          <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
        <FlowProgress curStage={stage} />
        <GeneralButton
          styles={{
            button: 'btn-circle btn-primary scale',
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
      const flatSubs = i.substitutes.map((s) => s.name)
      return {...i, name: i.name.name, substitutes: flatSubs }
    });
    return ingredientsWithFlatName
  }
  return [genIngredient(), genIngredient()];
}

type ClientInput =
  | Dispatch<SetStateAction<IngredientWithAllModName[]>>
  | Dispatch<SetStateAction<EquipmentWithAll[]>>
  | Dispatch<SetStateAction<InstructionWithAll[]>>;
interface StageConfig {
  dispatch: ClientInput;
  genInput: () => IngredientWithAllModName | EquipmentWithAll | InstructionWithAll;
  name: string;
  label: string;
}
interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
}

function CreateRecipeFlow({ recipe }: CreateRecipeFlowProps) {
  
  // state and mutations
  const [ingredients, setIngredients] = useState<IngredientWithAllModName[]>(() =>
    initIngredients(recipe.ingredients),
  );
  const [equipment, setEquipment] = useState<EquipmentWithAll[]>([]);
  const [instructions, setInstructions] = useState<InstructionWithAll[]>([]);
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
              />
            ) : null}
            {stage === 2 ? <div>Equipment</div> : null}
            {stage === 3 ? <div>Instructions</div> : null}
          </>
        )}
      </FlowController>
    </>
  );
}

export default CreateRecipeFlow;
