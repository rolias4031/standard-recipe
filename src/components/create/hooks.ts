import { UseMutateFunction } from '@tanstack/react-query';
import {
  genEquipment,
  genIngredient,
  genInstruction,
  isZeroLength,
} from 'lib/util-client';
import {debounce } from 'lodash';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  BaseZodSchema,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { filterValidRecipeInputs } from './utils';
import {
  useUpdateEquipment,
  useUpdateIngredients,
  useUpdateInstructions,
} from 'lib/mutations';
import {
  equipmentSchema,
  ingredientSchema,
  instructionSchema,
} from 'validation/schemas';
import {
  EquipmentWithAll,
  FlowEquipment,
  FlowIngredient,
  IngredientWithAll,
  RecipeWithFull,
} from 'types/models';
import { IngredientUnit, Instruction } from '@prisma/client';

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

export function useInitCreateRecipeState(recipe: RecipeWithFull) {
  const [ingredients, setIngredients] = useState<FlowIngredient[]>(() =>
    initIngredients(recipe.ingredients),
  );
  const [equipment, setEquipment] = useState<FlowEquipment[]>(() =>
    initEquipment(recipe.equipment),
  );
  const [instructions, setInstructions] = useState<Instruction[]>(() =>
    initInstructions(recipe.instructions),
  );

  return {
    ingredients: {
      state: ingredients,
      set: setIngredients,
    },
    equipment: {
      state: equipment,
      set: setEquipment,
    },
    instructions: {
      state: instructions,
      set: setInstructions,
    },
  };
}

interface DebouncedMutationArgs<T> {
  recipeId: string;
  inputs: T[];
  schema: BaseZodSchema;
}

interface UseDebounceControllerArgs<T> extends DebouncedMutationArgs<T> {
  updateInputsMutation: UseMutateFunction<
    UpdateInputMutationPayload,
    unknown,
    UpdateInputMutationBody<T[]>,
    unknown
  >;
  debounceInMs?: number;
}

export function useDebouncedUpdateRecipeMutation<T extends { id: string }>(
  config: UseDebounceControllerArgs<T>,
): { triggerDebouncedUpdate: () => void; isUpdateTriggered: boolean } {
  const {
    recipeId,
    inputs,
    schema,
    updateInputsMutation,
    debounceInMs = 1000,
  } = config;
  const [isUpdateTriggered, setIsUpdateTriggered] = useState<boolean>(false);

  function triggerDebouncedUpdate() {
    setIsUpdateTriggered(true);
  }

  function clearTriggeredUpdate() {
    setIsUpdateTriggered(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateValidInputs = useCallback(
    debounce((args: DebouncedMutationArgs<T>) => {
      clearTriggeredUpdate();
      if (isZeroLength(args.inputs)) return;
      console.log('debounced validation', args.inputs);
      const validInputs = filterValidRecipeInputs(args.inputs, args.schema);
      if (isZeroLength(validInputs)) return;
      console.log('debounced mutation', validInputs);
      updateInputsMutation({
        recipeId: args.recipeId,
        inputs: validInputs,
      });
    }, debounceInMs),
    [],
  );

  useEffect(() => {
    if (!isUpdateTriggered) return;
    debouncedUpdateValidInputs({
      recipeId,
      inputs: inputs,
      schema,
    });
    return () => {
      debouncedUpdateValidInputs.cancel();
    };
  }, [inputs, debouncedUpdateValidInputs, isUpdateTriggered, recipeId, schema]);

  return { triggerDebouncedUpdate, isUpdateTriggered };
}

interface CreateRecipeInputStateAndDispatch<T> {
  state: T[];
  set: Dispatch<SetStateAction<T[]>>;
}

interface UseCreateRecipeDebouncedMutationsArgs {
  recipeId: string;
  allUnits: IngredientUnit[];
  ingredients: CreateRecipeInputStateAndDispatch<FlowIngredient>;
  equipment: CreateRecipeInputStateAndDispatch<FlowEquipment>;
  instructions: CreateRecipeInputStateAndDispatch<Instruction>;
}

export function useDebouncedUpdateRecipeMutations({
  recipeId,
  allUnits,
  ingredients,
  equipment,
  instructions,
}: UseCreateRecipeDebouncedMutationsArgs) {
  const { mutate: updateIngredientsMutation, status: updateIngredientsStatus } =
    useUpdateIngredients(ingredients.set);
  const { mutate: updateEquipmentMutation, status: updateEquipmentStatus } =
    useUpdateEquipment(equipment.set);
  const {
    mutate: updateInstructionsMutation,
    status: updateInstructionsStatus,
  } = useUpdateInstructions(instructions.set);

  const {
    triggerDebouncedUpdate: triggerDebouncedIngredientsUpdate,
    isUpdateTriggered: isIngredientsUpdateTriggered,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: ingredients.state,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: updateIngredientsMutation,
  });

  const {
    triggerDebouncedUpdate: triggerDebouncedEquipmentUpdate,
    isUpdateTriggered: isEquipmentUpdateTriggered,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: equipment.state,
    schema: equipmentSchema,
    updateInputsMutation: updateEquipmentMutation,
  });

  const {
    triggerDebouncedUpdate: triggerDebouncedInstructionsUpdate,
    isUpdateTriggered: isInstructionsUpdateTriggered,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: instructions.state,
    schema: instructionSchema,
    updateInputsMutation: updateInstructionsMutation,
  });

  return {
    ingredientControls: {
      triggerUpdate: triggerDebouncedIngredientsUpdate,
      isUpdateTriggered: isIngredientsUpdateTriggered,
      update: updateIngredientsMutation,
      updateStatus: updateIngredientsStatus,
    },
    equipmentControls: {
      triggerUpdate: triggerDebouncedEquipmentUpdate,
      isUpdateTriggered: isEquipmentUpdateTriggered,
      update: updateEquipmentMutation,
      updateStatus: updateEquipmentStatus,
    },
    instructionControls: {
      triggerUpdate: triggerDebouncedInstructionsUpdate,
      isUpdateTriggered: isInstructionsUpdateTriggered,
      update: updateInstructionsMutation,
      updateStatus: updateInstructionsStatus,
    },
  };
}

export function useCreateRecipeStateAndControls(
  recipe: RecipeWithFull,
  allUnits: IngredientUnit[],
) {
  const { ingredients, equipment, instructions } =
    useInitCreateRecipeState(recipe);
  const { ingredientControls, equipmentControls, instructionControls } =
    useDebouncedUpdateRecipeMutations({
      recipeId: recipe.id,
      allUnits,
      ingredients,
      equipment,
      instructions,
    });

  return {
    ingredients: {
      ...ingredients,
      ...ingredientControls
    },
    equipment: {
      ...equipment,
      ...equipmentControls
    },
    instructions: {
      ...instructions,
      ...instructionControls
    }
  }
}
