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
  RecipeWithFull,
  FlowEquipment,
  EquipmentWithAll,
} from 'types/models';
import {
  BaseZodSchema,
  Stage,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import EquipmentStage from './EquipmentStage';
import IngredientsStage from './IngredientsStage';
import InstructionsStage from './InstructionsStage';
import { UseMutateFunction, useQueryClient } from '@tanstack/react-query';
import {
  useUpdateEquipment,
  useUpdateIngredients,
  useUpdateInstructions,
} from 'lib/mutations';
import UpdateRecipeNameModal from './UpdateRecipeNameModal';
import PencilIcon from 'components/common/icons/PencilIcon';
import { useRouter } from 'next/router';
import {
  getNextStageName,
  getPrevStageName,
  navigateToCreateStage,
} from './utils';
interface FlowControllerProps<T extends { id: string }> {
  children: ReactNode;
  stage: Stage;
  recipeName: string;
  recipeId: string;
  isMutationLoadingOrError: boolean,
  controllerConfig: ControllerConfig<T>;
}

function FlowController<T extends { id: string }>({
  children,
  stage,
  recipeName,
  recipeId,
  isMutationLoadingOrError,
  controllerConfig,
}: FlowControllerProps<T>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    stageName,
    stageLabel,
    inputs,
    dispatchInputs,
    genInput,
    schema,
    updateInputsMutation,
  } = controllerConfig;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);

  function changeStage(newStage: Stage) {
    navigateToCreateStage(router, { recipeId, stage: newStage, shallow: true });
  }

  async function nextStageHandler() {
    const curInputs = inputs;
    if (!curInputs || !schema) return;
    for (const input of curInputs) {
      const isValid = schema.safeParse(input);
      if (!isValid.success) {
        setIsError(true);
        return;
      }
    }
    setIsError(false);
    if (updateInputsMutation) {
      updateInputsMutation({ inputs, recipeId });
    }
    changeStage(getNextStageName(stage));
  }

  function prevStageHandler() {
    setIsError(false);
    if (updateInputsMutation && inputs) {
      updateInputsMutation({ inputs, recipeId });
    }
    changeStage(getPrevStageName(stage));
  }

  function createNewInputHandler() {
    if (!dispatchInputs || !genInput) return;
    dispatchInputs((prev: T[]) => {
      const newInput = genInput();
      const idExists = prev.findIndex((i) => i.id === newInput.id);
      if (idExists !== -1) return prev;
      return [...prev, newInput];
    });
  }

  function enterPreviewModeHandler() {
    if (isMutationLoadingOrError) return;
    window.localStorage.setItem('previous_stage', stage);
    router.push({
      pathname: '/view/[recipeId]',
      query: { recipeId },
    });
  }

  return (
    <>
      <div className="flex flex-grow flex-col">
        <div className="flex justify-between space-x-2">
          <div className="flex basis-1/2 flex-col">
            <div className="flex items-center space-x-4">
              <p className="text-2xl font-bold">{recipeName}</p>
              <button
                className="text-concrete hover:text-fern"
                onClick={() => setIsEditingName(true)}
              >
                <PencilIcon styles={{ icon: 'w-5 h-5 ' }} />
              </button>
            </div>
            <p className="text-lg font-light">{stageName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-xs">Tips</button>
            <button
              className="text-xs disabled:text-red-500"
              onClick={enterPreviewModeHandler}
              disabled={isMutationLoadingOrError}
            >
              Preview
            </button>
            {isMutationLoadingOrError}
          </div>
        </div>
        {children}
        <div className="w-full">
          <button
            type="button"
            className="btn-primary btn-reg ml-auto flex w-fit items-center transition-all"
            onClick={createNewInputHandler}
          >
            <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
            <span className="pr-2 pl-1 text-lg">{stageLabel}</span>
          </button>
        </div>
        <div className="fixed left-10 right-10 bottom-0 flex flex-col items-center justify-between space-y-3 border-concrete transition-all">
          {isError ? (
            <StageError
              stageName={stageName.toLowerCase()}
              dispatchIsError={setIsError}
            />
          ) : null}
          <ControlPanel>
            <button
              className="btn-reg btn-primary scale disabled:opacity-0"
              onClick={prevStageHandler}
              disabled={stage === 'ingredients'}
            >
              <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
            </button>
            {stage !== 'instructions' ? (
              <FlowProgress curStage={stage} />
            ) : (
              <button>Publish!</button>
            )}
            <button
              className="btn-reg btn-primary scale disabled:opacity-0"
              onClick={nextStageHandler}
              disabled={stage === 'instructions'}
            >
              <ArrowRightIcon styles={{ icon: 'w-7 h-7 text-white' }} />
            </button>
          </ControlPanel>
        </div>
      </div>
      {isEditingName && (
        <UpdateRecipeNameModal
          recipeId={recipeId}
          curRecipeName={recipeName}
          onCloseModal={() => setIsEditingName(false)}
        />
      )}
    </>
  );
}

function sortInputByOrder<T extends { order: number }>(inputs: T[]): T[] {
  return inputs.sort((a, b) => a.order - b.order);
}

function initIngredients(ingredients: IngredientWithAll[]): FlowIngredient[] {
  if (ingredients.length > 0) {
    const flowIngredients = ingredients.map((i) => {
      const substituteNames = i.substitutes.map((s) => s.name);
      const name = i.name.name;
      const { ingredientNameId, ingredientUnitId, ...keep } = i;
      return { ...keep, name, substitutes: substituteNames };
    });
    return sortInputByOrder(flowIngredients);
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
    return sortInputByOrder(flowEquipment);
  }
  return [genEquipment(), genEquipment()];
}

function initInstructions(instructions: Instruction[]): Instruction[] {
  if (instructions.length > 0) {
    return sortInputByOrder(instructions);
  }
  return [genInstruction(), genInstruction()];
}

function checkStatusesForLoadingOrError(statuses: string[]) {
  const isLoading = statuses.some((status) => status === 'loading');
  const isError = statuses.some((status) => status === 'error');
  return isLoading || isError;
}

interface ControllerConfig<T> {
  inputs?: T[];
  dispatchInputs?: Dispatch<SetStateAction<T[]>>;
  genInput?: () => T;
  updateInputsMutation?: UseMutateFunction<
    UpdateInputMutationPayload,
    unknown,
    UpdateInputMutationBody<T[]>,
    unknown
  >;
  schema?: BaseZodSchema;
  stageName: string;
  stageLabel: string;
}

export const stages: Stage[] = ['ingredients', 'equipment', 'instructions'];
interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
  stage: Stage;
}

function CreateRecipeFlow({ recipe, allUnits, stage }: CreateRecipeFlowProps) {
  // state
  const [ingredients, setIngredients] = useState<FlowIngredient[]>(() =>
    initIngredients(recipe.ingredients),
  );
  const [equipment, setEquipment] = useState<FlowEquipment[]>(() =>
    initEquipment(recipe.equipment),
  );
  const [instructions, setInstructions] = useState<Instruction[]>(() =>
    initInstructions(recipe.instructions),
  );
  const { mutate: updateIngredients, status: updateIngredientsStatus } =
    useUpdateIngredients(setIngredients);
  const { mutate: updateEquipment, status: updateEquipmentStatus } =
    useUpdateEquipment(setEquipment);
  const { mutate: updateInstructions, status: updateInstructionsStatus } =
    useUpdateInstructions(setInstructions);

  const isMutationLoadingOrError = checkStatusesForLoadingOrError([
    updateIngredientsStatus,
    updateEquipmentStatus,
    updateInstructionsStatus,
  ]);

  const sharedControllerConfig = {
    recipeName: recipe.name,
    recipeId: recipe.id,
    isMutationLoadingOrError,
    stage,
  };

  const firstControllerConfig: ControllerConfig<FlowIngredient> = {
    stageName: 'ingredients',
    stageLabel: 'Ingredient',
    inputs: ingredients,
    dispatchInputs: setIngredients,
    genInput: genIngredient,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: updateIngredients,
  };

  const secondControllerConfig: ControllerConfig<FlowEquipment> = {
    stageName: 'equipment',
    stageLabel: 'Equipment',
    inputs: equipment,
    dispatchInputs: setEquipment,
    genInput: genEquipment,
    schema: equipmentSchema,
    updateInputsMutation: updateEquipment,
  };

  const thirdControllerConfig: ControllerConfig<Instruction> = {
    stageName: 'instructions',
    stageLabel: 'Instruction',
    inputs: instructions,
    dispatchInputs: setInstructions,
    genInput: genInstruction,
    schema: instructionSchema,
    updateInputsMutation: updateInstructions,
  };

  const stageComponents = new Map<Stage, ReactNode>([
    [
      'ingredients',
      <FlowController
        key={recipe.id + firstControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={firstControllerConfig}
      >
        <IngredientsStage
          recipeId={recipe.id}
          ingredients={ingredients}
          raiseIngredients={setIngredients}
          allUnits={allUnits}
          updateIngredientsMutation={updateIngredients}
          updateInstructionsStatus={updateIngredientsStatus}
        />
      </FlowController>,
    ],
    [
      'equipment',
      <FlowController
        key={recipe.id + secondControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={secondControllerConfig}
      >
        <EquipmentStage
          equipment={equipment}
          raiseEquipment={setEquipment}
          recipeId={recipe.id}
          updateEquipmentMutation={updateEquipment}
          updateEquipmentStatus={updateEquipmentStatus}
        />
      </FlowController>,
    ],
    [
      'instructions',
      <FlowController
        key={recipe.id + thirdControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={thirdControllerConfig}
      >
        <InstructionsStage
          allUnits={allUnits}
          recipeId={recipe.id}
          instructions={instructions}
          ingredients={ingredients}
          equipment={equipment}
          raiseInstructions={setInstructions}
          updateInstructionsMutation={updateInstructions}
          updateInstructionsStatus={updateInstructionsStatus}
        />
      </FlowController>,
    ],
  ]);

  return <>{stageComponents.get(stage)}</>;
}

function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between border-t border-concrete bg-white p-3">
      {children}
    </div>
  );
}

function FlowProgress({ curStage }: { curStage: Stage }) {
  const dots = stages.map((i) => {
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
