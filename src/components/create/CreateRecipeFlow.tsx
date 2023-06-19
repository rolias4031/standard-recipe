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
import {
  BaseZodSchema,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import EquipmentStage from './EquipmentStage';
import InfoStage from './InfoStage';
import IngredientsStage from './IngredientsStage';
import InstructionsStage from './InstructionsStage';
import InstructionsView from 'components/view/InstructionsView';
import RecipeView from 'components/view/RecipeView';
import { UseMutateFunction, useQueryClient } from '@tanstack/react-query';
import {
  useUpdateEquipment,
  useUpdateIngredients,
  useUpdateInstructions,
} from 'lib/mutations';
import BaseButton from 'components/common/BaseButton';
import UpdateRecipeNameModal from './UpdateRecipeNameModal';
import PencilIcon from 'components/common/icons/PencilIcon';
import StatusRouter from 'components/common/StatusRouter';

interface FlowControllerProps<T extends { id: string }> {
  children: ReactNode;
  stage: number;
  dispatchStage: Dispatch<SetStateAction<number>>;
  dispatchPreviewMode: Dispatch<SetStateAction<boolean>>;
  recipeName: string;
  recipeId: string;
  controllerConfig: ControllerConfig<T>;
}

function FlowController<T extends { id: string }>({
  children,
  dispatchPreviewMode,
  dispatchStage,
  stage,
  recipeName,
  recipeId,
  controllerConfig,
}: FlowControllerProps<T>) {
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
    dispatchStage((prev: number) => {
      if (prev === 4) return prev;
      if (prev >= 1) return prev + 1;
      return prev;
    });
  }

  function prevStageHandler() {
    setIsError(false);
    if (updateInputsMutation && inputs) {
      updateInputsMutation({ inputs, recipeId });
    }
    dispatchStage((prev: number) => {
      if (prev === 1) return prev;
      if (prev > 1) return prev - 1;
      return prev;
    });
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
    if (!inputs || !updateInputsMutation) return;
    updateInputsMutation(
      { inputs, recipeId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['recipe']);
        },
      },
    );
    dispatchPreviewMode(true);
  }

  return (
    <>
      <div className="flex flex-grow flex-col">
        <div className="flex justify-between space-x-2">
          <div className="flex basis-1/2 flex-col">
            <div className="flex space-x-4 items-center">
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
            <button className="text-xs" onClick={enterPreviewModeHandler}>
              Preview
            </button>
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
              <span className="pr-2 pl-1 text-lg">{stageLabel}</span>
            </button>
          </div>
        ) : null}
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

function initGeneralInfo(recipe: RecipeWithFull): RecipeGeneralInfo {
  return { id: recipe.id, name: recipe.name, description: recipe.description };
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

interface CreateRecipeFlowProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
}

function CreateRecipeFlow({ recipe, allUnits }: CreateRecipeFlowProps) {
  // state
  const [stage, setStage] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState(false);
  const client = useQueryClient();

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

  const { mutate: updateIngredients, status: updateIngredientsStatus } =
    useUpdateIngredients(setIngredients);
  const { mutate: updateEquipment, status: updateEquipmentStatus } =
    useUpdateEquipment(setEquipment);
  const { mutate: updateInstructions, status: updateInstructionsStatus } =
    useUpdateInstructions(setInstructions);

  const sharedControllerConfig = {
    recipeName: generalInfo.name,
    recipeId: recipe.id,
    dispatchPreviewMode: setPreviewMode,
    dispatchStage: setStage,
    stage: stage,
  };

  const firstControllerConfig: ControllerConfig<FlowIngredient> = {
    stageName: 'Ingredients',
    stageLabel: 'Ingredient',
    inputs: ingredients,
    dispatchInputs: setIngredients,
    genInput: genIngredient,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: updateIngredients,
  };

  const secondControllerConfig: ControllerConfig<FlowEquipment> = {
    stageName: 'Equipment',
    stageLabel: 'Equipment',
    inputs: equipment,
    dispatchInputs: setEquipment,
    genInput: genEquipment,
    schema: equipmentSchema,
    updateInputsMutation: updateEquipment,
  };

  const thirdControllerConfig: ControllerConfig<Instruction> = {
    stageName: 'Instructions',
    stageLabel: 'Instruction',
    inputs: instructions,
    dispatchInputs: setInstructions,
    genInput: genInstruction,
    schema: instructionSchema,
    updateInputsMutation: updateInstructions,
  };

  const fourthControllerConfig: ControllerConfig<RecipeGeneralInfo> = {
    stageName: 'Info',
    stageLabel: 'Info',
  };

  const stageComponents = new Map<number, ReactNode>([
    [
      1,
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
      2,
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
      3,
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
    [
      4,
      <FlowController
        key={recipe.id + fourthControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={fourthControllerConfig}
      >
        <InfoStage
          generalInfo={generalInfo}
          raiseGeneralInfo={setGeneralInfo}
        />
      </FlowController>,
    ],
  ]);

  return (
    <>
      {!previewMode ? (
        stageComponents.get(stage)
      ) : (
        <StatusRouter
          statuses={[
            updateIngredientsStatus,
            updateEquipmentStatus,
            updateInstructionsStatus,
          ]}
        >
          <RecipeView onExitPreviewMode={() => setPreviewMode(false)}>
            <InstructionsView
              instructions={recipe.instructions}
              ingredients={recipe.ingredients}
              equipment={recipe.equipment}
              allUnits={allUnits}
            />
          </RecipeView>
        </StatusRouter>
      )}
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
