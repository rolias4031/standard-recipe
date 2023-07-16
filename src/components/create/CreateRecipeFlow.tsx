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
import { FlowIngredient, RecipeWithFull, FlowEquipment } from 'types/models';
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
import { UseMutateFunction } from '@tanstack/react-query';
import UpdateRecipeNameModal from './UpdateRecipeNameModal';
import PencilIcon from 'components/common/icons/PencilIcon';
import { useRouter } from 'next/router';
import {
  checkStatusesForLoadingOrError,
  getNextStageName,
  getPrevStageName,
  navigateToCreateStage,
} from './utils';
import { useCreateRecipeStateAndControls } from './hooks';
import InlineStatusDisplay from 'components/common/InlineStatusDisplay';
interface FlowControllerProps<T extends { id: string }> {
  children: ReactNode;
  stage: Stage;
  recipeName: string;
  recipeId: string;
  isAnyUpdateLoadingOrErrorOrTriggered: boolean;
  controllerConfig: ControllerConfig<T>;
}

function FlowController<T extends { id: string }>({
  children,
  stage,
  recipeName,
  recipeId,
  isAnyUpdateLoadingOrErrorOrTriggered,
  controllerConfig,
}: FlowControllerProps<T>) {
  const router = useRouter();
  const {
    stageName,
    stageLabel,
    inputs,
    dispatchInputs,
    genInput,
    schema,
    updateInputsMutation,
    updateStatus,
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
    if (isAnyUpdateLoadingOrErrorOrTriggered) return;
    window.localStorage.setItem('previous_stage', stage);
    router.push({
      pathname: '/view/[recipeId]',
      query: { recipeId },
    });
  }

  return (
    <>
      <div className="flex flex-grow flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              className="text-concrete hover:text-fern"
              onClick={() => setIsEditingName(true)}
            >
              <PencilIcon styles={{ icon: 'w-5 h-5' }} />
            </button>
            <p className="text-lg font-bold">{recipeName}</p>
          </div>
          <div className="flex space-x-4">
            <InlineStatusDisplay status={updateStatus} />
            <button className="text-sm">Tips</button>
            <button
              className="rounded-lg text-sm hover:text-fern active:text-fern disabled:text-concrete"
              onClick={enterPreviewModeHandler}
              disabled={isAnyUpdateLoadingOrErrorOrTriggered}
            >
              Preview
            </button>
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
  updateStatus: string;
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

  const firstControllerConfig: ControllerConfig<FlowIngredient> = {
    stageName: 'ingredients',
    stageLabel: 'Ingredient',
    inputs: ingredients.state,
    dispatchInputs: ingredients.set,
    genInput: genIngredient,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: ingredients.update,
    updateStatus: ingredients.updateStatus,
  };

  const secondControllerConfig: ControllerConfig<FlowEquipment> = {
    stageName: 'equipment',
    stageLabel: 'Equipment',
    inputs: equipment.state,
    dispatchInputs: equipment.set,
    genInput: genEquipment,
    schema: equipmentSchema,
    updateInputsMutation: equipment.update,
    updateStatus: equipment.updateStatus,
  };

  const thirdControllerConfig: ControllerConfig<Instruction> = {
    stageName: 'instructions',
    stageLabel: 'Instruction',
    inputs: instructions.state,
    dispatchInputs: instructions.set,
    genInput: genInstruction,
    schema: instructionSchema,
    updateInputsMutation: instructions.update,
    updateStatus: instructions.updateStatus,
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
          ingredients={ingredients.state}
          raiseIngredients={ingredients.set}
          allUnits={allUnits}
          triggerDebouncedUpdate={ingredients.triggerUpdate}
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
          equipment={equipment.state}
          raiseEquipment={equipment.set}
          recipeId={recipe.id}
          triggerDebouncedUpdate={equipment.triggerUpdate}
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
          instructions={instructions.state}
          ingredients={ingredients.state}
          equipment={equipment.state}
          raiseInstructions={instructions.set}
          triggerDebouncedUpdate={instructions.triggerUpdate}
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
