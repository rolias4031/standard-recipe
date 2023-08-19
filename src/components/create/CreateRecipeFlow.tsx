import { IngredientUnit, Instruction } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';
import {
  assignInputOrderByIndex,
  genEquipment,
  genIngredient,
  genInstruction,
  isZeroLength,
  pickStyles,
} from 'lib/util-client';
import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  useState,
  useMemo,
} from 'react';
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
import { useRouter } from 'next/router';
import {
  checkStatusesForLoadingOrError,
  getNextStageName,
  getPrevStageName,
  navigateToCreateStage,
} from './utils';
import { useCreateRecipeStateAndControls } from './hooks';
import { StatusIconDisplay } from 'components/common/StatusIconDisplay';
import LightBulbIcon from 'components/common/icons/LightBulbIcon';
import FlowActionsMenu from './FlowActionsMenu';
import ButtonWithDialog from 'components/common/dialog/ButtonWithDialog';
import HamburgerIcon from 'components/common/icons/HamburgerIcon';
import ChevronRightIcon from 'components/common/icons/ChevronRightIcon';
interface FlowControllerProps<T extends { id: string }> {
  children: ReactNode;
  stage: Stage;
  recipeName: string;
  recipeId: string;
  isAnyUpdateLoadingOrErrorOrTriggered: boolean;
  controllerConfig: ControllerConfig<T>;
  extraHeaderComponent?: ReactNode;
}

function FlowController<T extends { id: string; order: number }>({
  children,
  stage,
  recipeName,
  recipeId,
  isAnyUpdateLoadingOrErrorOrTriggered,
  controllerConfig,
  extraHeaderComponent,
}: FlowControllerProps<T>) {
  const router = useRouter();
  const {
    stageName,
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
      const newUnorderedInputs = [...prev, newInput];
      return assignInputOrderByIndex(newUnorderedInputs);
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
      <div className="flex h-full flex-col">
        <div className="sticky top-0 bg-white p-4 shadow-md shadow-concrete md:px-10 md:py-6">
          <div className="w-full truncate text-lg text-concrete">
            {recipeName}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-mono text-xl text-abyss">
              {controllerConfig.stageLabel}
            </div>
            <div className="flex space-x-4 text-lg">
              <StatusIconDisplay status={updateStatus} />
              <button className="rounded bg-fern p-1">
                <LightBulbIcon styles={{ icon: 'w-7 h-7 text-white' }} />
              </button>
              <ButtonWithDialog
                styles={{
                  button: {
                    default: 'p-1 rounded bg-fern',
                    isDialogOpen: ['', ''],
                  },
                }}
                buttonContent={
                  <HamburgerIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                }
                dialogComponent={() => (
                  <FlowActionsMenu
                    areButtonsDisabled={isAnyUpdateLoadingOrErrorOrTriggered}
                    onOpenEditName={() => setIsEditingName(true)}
                    onEnterPreviewMode={enterPreviewModeHandler}
                  />
                )}
              />
            </div>
          </div>
          {extraHeaderComponent ? extraHeaderComponent : null}
        </div>
        <div className="flex-grow overflow-y-auto px-4 py-5 md:p-10">
          {children}
          <div className="h-44" />
        </div>
        <div className="fixed left-0 right-0 bottom-0 flex flex-col items-center space-y-2 transition-all">
          {isError ? (
            <StageError
              stageName={stageName.toLowerCase()}
              raiseIsError={setIsError}
            />
          ) : null}
          <div className="w-full">
            <button
              type="button"
              className="ml-auto flex w-fit items-center justify-center rounded-l-xl bg-fern px-3 py-2 text-white shadow-md shadow-abyss/50 transition-all hover:bg-jungle active:bg-jungle lg:w-32"
              onClick={createNewInputHandler}
            >
              <PlusIcon styles={{ icon: 'w-12 h-12 text-white' }} />
            </button>
          </div>
          <ControlPanel>
            <div className="flex w-full items-center justify-between md:w-5/6 lg:w-3/4">
              <button
                className="disabled:opacity-20"
                onClick={prevStageHandler}
                disabled={stage === 'ingredients'}
              >
                <ArrowLeftIcon styles={{ icon: 'w-10 h-10 text-fern' }} />
              </button>
              {stage !== 'instructions' ? (
                <FlowProgress curStage={stage} />
              ) : (
                <button>Publish!</button>
              )}
              <button
                className="disabled:opacity-20"
                onClick={nextStageHandler}
                disabled={stage === 'instructions'}
              >
                <ArrowRightIcon styles={{ icon: 'w-10 h-10 text-fern' }} />
              </button>
            </div>
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
    stageLabel: 'Ingredients',
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
    stageLabel: 'Instructions',
    inputs: instructions.state,
    dispatchInputs: instructions.set,
    genInput: genInstruction,
    schema: instructionSchema,
    updateInputsMutation: instructions.update,
    updateStatus: instructions.updateStatus,
  };

  const instructionString = useMemo<string>(
    () => instructions.state.map((i) => i.description).join(''),
    [instructions],
  );

  console.log('INSTRUCTIONS', instructions)

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
    <div className="flex w-full items-center justify-center border-t bg-white p-3">
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
  raiseIsError,
}: {
  stageName?: string;
  raiseIsError: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col rounded-lg bg-red-400 p-1 text-white">
      <button className="ml-auto" onClick={() => raiseIsError(false)}>
        <XIcon styles={{ icon: 'w-5 h-5' }} />
      </button>
      <p className="px-3 pb-3">
        {`One or more of your ${stageName} has missing or invalid info. Recheck each field for errors.
    `}
      </p>
    </div>
  );
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

export default CreateRecipeFlow;
