import { IngredientUnit, Instruction } from '@prisma/client';
import React, { ReactNode, useState } from 'react';
import { FlowEquipment, FlowIngredient, RecipeWithFull } from 'types/models';
import EditController from './EditController';
import {
  useInitEditRecipeState,
  useUpdateRecipeMutations,
} from 'components/create/hooks';
import IngredientsStage from 'components/create/IngredientsStage';
import { Stage } from 'types/types';
import { checkStatusesForLoadingOrError } from 'components/create/utils';
import { CreateControllerConfig } from 'components/create/CreateController';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import EquipmentStage from 'components/create/EquipmentStage';
import InstructionsStage from 'components/create/InstructionsStage';

interface EditRecipeProps {
  recipe: RecipeWithFull;
  allUnits: IngredientUnit[];
  stage: Stage;
  forceRerender: () => void;
}

function EditRecipe({
  recipe,
  allUnits,
  stage,
  forceRerender,
}: EditRecipeProps) {
  // state
  const [isEditMode, setIsEditMode] = useState(false);

  const { ingredients, equipment, instructions } =
    useInitEditRecipeState(recipe);
  // mutations
  const {
    updateIngredientsMutation,
    updateIngredientsStatus,
    updateEquipmentMutation,
    updateEquipmentStatus,
    updateInstructionsMutation,
    updateInstructionsStatus,
  } = useUpdateRecipeMutations();

  const isAnyUpdateLoadingOrError = checkStatusesForLoadingOrError([
    updateIngredientsStatus,
    updateEquipmentStatus,
    updateInstructionsStatus,
  ]);
  // configs
  const sharedControllerConfig = {
    recipeName: recipe.name,
    recipeId: recipe.id,
    onEnterEditMode: () => setIsEditMode(true),
    onCancelEditMode: () => {
      setIsEditMode(false);
      forceRerender();
    },
    isEditMode,
    isAnyUpdateLoadingOrErrorOrTriggered: isAnyUpdateLoadingOrError,
    stage,
  };

  const firstControllerConfig: CreateControllerConfig<FlowIngredient> = {
    stageName: 'ingredients',
    stageLabel: 'Ingredients',
    inputs: ingredients.state,
    dispatchInputs: ingredients.set,
    inUseInputs: ingredients.inUse,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: updateIngredientsMutation,
    updateStatus: updateIngredientsStatus,
  };

  const secondControllerConfig: CreateControllerConfig<FlowEquipment> = {
    stageName: 'equipment',
    stageLabel: 'Equipment',
    inputs: equipment.state,
    inUseInputs: equipment.inUse,
    dispatchInputs: equipment.set,
    schema: equipmentSchema,
    updateInputsMutation: updateEquipmentMutation,
    updateStatus: updateEquipmentStatus,
  };

  const thirdControllerConfig: CreateControllerConfig<Instruction> = {
    stageName: 'instructions',
    stageLabel: 'Instructions',
    inputs: instructions.state,
    inUseInputs: instructions.inUse,
    dispatchInputs: instructions.set,
    schema: instructionSchema,
    updateInputsMutation: updateInstructionsMutation,
    updateStatus: updateInstructionsStatus,
  };

  const stageComponents = new Map<Stage, ReactNode>([
    [
      'ingredients',
      <EditController
        key={firstControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={firstControllerConfig}
      >
        <IngredientsStage
          isDisabled={!isEditMode}
          key={firstControllerConfig.stageName}
          recipeId={recipe.id}
          ingredients={ingredients.inUse}
          raiseIngredients={ingredients.set}
          allUnits={allUnits}
        />
      </EditController>,
    ],
    [
      'equipment',
      <EditController
        key={secondControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={secondControllerConfig}
      >
        <EquipmentStage
          isDisabled={!isEditMode}
          equipment={equipment.inUse}
          raiseEquipment={equipment.set}
          recipeId={recipe.id}
        />
      </EditController>,
    ],
    [
      'instructions',
      <EditController
        key={thirdControllerConfig.stageName}
        {...sharedControllerConfig}
        controllerConfig={thirdControllerConfig}
      >
        <InstructionsStage
          isDisabled={!isEditMode}
          allUnits={allUnits}
          recipeId={recipe.id}
          instructions={instructions.inUse}
          raiseInstructions={instructions.set}
        />
      </EditController>,
    ],
  ]);

  return <>{stageComponents.get(stage)}</>;
}

export default EditRecipe;
