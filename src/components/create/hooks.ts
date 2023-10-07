import { UseMutateFunction } from '@tanstack/react-query';
import { isZeroLength } from 'lib/util-client';
import { debounce } from 'lodash';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  BasePayload,
  BaseZodSchema,
  Stage,
  UpdateInputMutationBody,
} from 'types/types';
import {
  assignInputOrderByIndex,
  createOneInUseInput,
  filterInUseInputs,
  filterValidRecipeInputs,
  splitInputsByInUse,
  stages,
} from './utils';
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
import { useRouter } from 'next/router';
import { isStringType } from 'types/util';

function sortInputByOrder<T extends { order: number }>(inputs: T[]): T[] {
  return inputs.sort((a, b) => a.order - b.order);
}

function initIngredients(ingredients: IngredientWithAll[]): FlowIngredient[] {
  // convert all to Flow types
  const convertedIngredients = ingredients.map((i) => {
    const substituteNames = i.substitutes.map((s) => s.name);
    const name = i.name ? i.name.name : '';
    const { ingredientNameId, ingredientUnitId, ...keep } = i;
    return { ...keep, name, substitutes: substituteNames };
  });
  // separate into inUse vs notInUse
  const { notInUse, inUse } = splitInputsByInUse(convertedIngredients);
  // order the inUse and put first
  const sortedAndOrdered = sortInputByOrder(inUse).concat(notInUse);
  if (!sortedAndOrdered[0]?.inUse) {
    return createOneInUseInput(sortedAndOrdered);
  }
  return sortedAndOrdered;
}

function initEquipment(equipment: EquipmentWithAll[]): FlowEquipment[] {
  const convertedEquipment = equipment.map((e) => {
    const substituteNames = e.substitutes.map((s) => s.name);
    const name = e.name ? e.name.name : '';
    const { equipmentNameId, ...keep } = e;
    return { ...keep, name, substitutes: substituteNames };
  });
  const { inUse, notInUse } = splitInputsByInUse(convertedEquipment);
  const sortedAndOrdered = sortInputByOrder(inUse).concat(notInUse);
  if (!sortedAndOrdered[0]?.inUse) {
    return createOneInUseInput(sortedAndOrdered);
  }
  return sortedAndOrdered;
}

function initInstructions(instructions: Instruction[]): Instruction[] {
  const { inUse, notInUse } = splitInputsByInUse(instructions);
  const sortedAndOrdered = sortInputByOrder(inUse).concat(notInUse);
  if (!sortedAndOrdered[0]?.inUse) {
    return createOneInUseInput(sortedAndOrdered);
  }
  return sortedAndOrdered;
}

export function useInitEditRecipeState(recipe: RecipeWithFull) {
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
      inUse: filterInUseInputs(ingredients),
    },
    equipment: {
      state: equipment,
      set: setEquipment,
      inUse: filterInUseInputs(equipment),
    },
    instructions: {
      state: instructions,
      set: setInstructions,
      inUse: filterInUseInputs(instructions),
    },
  };
}

export function useUpdateRecipeMutations() {
  const { mutate: updateIngredientsMutation, status: updateIngredientsStatus } =
    useUpdateIngredients();
  const { mutate: updateEquipmentMutation, status: updateEquipmentStatus } =
    useUpdateEquipment();
  const {
    mutate: updateInstructionsMutation,
    status: updateInstructionsStatus,
  } = useUpdateInstructions();

  return {
    updateIngredientsMutation,
    updateIngredientsStatus,
    updateEquipmentMutation,
    updateEquipmentStatus,
    updateInstructionsMutation,
    updateInstructionsStatus,
  };
}

interface DebouncedMutationArgs<T> {
  recipeId: string;
  inputs: T[];
  schema: BaseZodSchema;
}

interface UseDebounceControllerArgs<T> extends DebouncedMutationArgs<T> {
  updateInputsMutation: UseMutateFunction<
    BasePayload,
    unknown,
    UpdateInputMutationBody<T[]>,
    unknown
  >;
  debounceInMs?: number;
}

export function useDebouncedUpdateRecipeMutation<
  T extends { id: string; order: number },
>(
  config: UseDebounceControllerArgs<T>,
): {
  triggerDebouncedUpdate: () => void;
  isUpdateTriggered: boolean;
  cancelTriggeredUpdate: () => void;
} {
  const {
    recipeId,
    inputs,
    schema,
    updateInputsMutation,
    debounceInMs = 5000,
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
      const validInputs = filterValidRecipeInputs(args.inputs, args.schema);
      if (isZeroLength(validInputs)) return;
      console.log('DEBOUNCED FIRED', validInputs);
      updateInputsMutation({
        recipeId: args.recipeId,
        inputs: validInputs,
      });
    }, debounceInMs),
    [],
  );

  useEffect(() => {
    if (!isUpdateTriggered) return;
    console.log('DEBOUNCED INPUTS', inputs);
    debouncedUpdateValidInputs({
      recipeId,
      inputs: inputs,
      schema,
    });
    return () => {
      debouncedUpdateValidInputs.cancel();
    };
  }, [inputs, debouncedUpdateValidInputs, isUpdateTriggered, recipeId, schema]);

  return {
    triggerDebouncedUpdate,
    isUpdateTriggered,
    cancelTriggeredUpdate: clearTriggeredUpdate,
  };
}

interface CreateRecipeInputStateAndDispatch<T> {
  inUse: T[];
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
    useUpdateIngredients();
  const { mutate: updateEquipmentMutation, status: updateEquipmentStatus } =
    useUpdateEquipment();
  const {
    mutate: updateInstructionsMutation,
    status: updateInstructionsStatus,
  } = useUpdateInstructions();

  const {
    triggerDebouncedUpdate: triggerDebouncedIngredientsUpdate,
    isUpdateTriggered: isIngredientsUpdateTriggered,
    cancelTriggeredUpdate: cancelTriggeredIngredientsUpdate,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: ingredients.inUse,
    schema: ingredientSchema(allUnits.map((u) => u.id)),
    updateInputsMutation: updateIngredientsMutation,
  });

  const {
    triggerDebouncedUpdate: triggerDebouncedEquipmentUpdate,
    isUpdateTriggered: isEquipmentUpdateTriggered,
    cancelTriggeredUpdate: cancelTriggeredEquipmentUpdate,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: equipment.inUse,
    schema: equipmentSchema,
    updateInputsMutation: updateEquipmentMutation,
  });

  const {
    triggerDebouncedUpdate: triggerDebouncedInstructionsUpdate,
    isUpdateTriggered: isInstructionsUpdateTriggered,
    cancelTriggeredUpdate: cancelTriggeredInstructionsUpdate,
  } = useDebouncedUpdateRecipeMutation({
    recipeId,
    inputs: instructions.inUse,
    schema: instructionSchema,
    updateInputsMutation: updateInstructionsMutation,
  });

  return {
    ingredientControls: {
      triggerUpdate: triggerDebouncedIngredientsUpdate,
      isUpdateTriggered: isIngredientsUpdateTriggered,
      cancelTriggeredUpdate: cancelTriggeredIngredientsUpdate,
      update: updateIngredientsMutation,
      updateStatus: updateIngredientsStatus,
    },
    equipmentControls: {
      triggerUpdate: triggerDebouncedEquipmentUpdate,
      isUpdateTriggered: isEquipmentUpdateTriggered,
      cancelTriggeredUpdate: cancelTriggeredEquipmentUpdate,
      update: updateEquipmentMutation,
      updateStatus: updateEquipmentStatus,
    },
    instructionControls: {
      triggerUpdate: triggerDebouncedInstructionsUpdate,
      isUpdateTriggered: isInstructionsUpdateTriggered,
      cancelTriggeredUpdate: cancelTriggeredInstructionsUpdate,
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
    useInitEditRecipeState(recipe);

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
      ...ingredientControls,
    },
    equipment: {
      ...equipment,
      ...equipmentControls,
    },
    instructions: {
      ...instructions,
      ...instructionControls,
    },
  };
}

export function useExtractCreatePageQueryParams() {
  const router = useRouter();
  const { recipeId, stage = 'ingredients' } = router.query;
  console.log('slug', router.query);
  if (
    isStringType(recipeId) &&
    isStringType(stage) &&
    stages.includes(stage as Stage)
  ) {
    return { recipeId, stage: stage as Stage };
  }
  return { recipeId: undefined, stage: undefined };
}
