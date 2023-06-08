import { DropResult } from '@hello-pangea/dnd';
import { UseMutateFunction } from '@tanstack/react-query';
import {
  findRecipeInputIndexById,
  insertIntoPrevArray,
  isZeroLength,
} from 'lib/util-client';
import debounce from 'lodash.debounce';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  BaseZodSchema,
  InputIdPairs,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';

interface UseDebounceControllerArgs<T extends { id: string }> {
  recipeId: string;
  inputs: T[];
  dispatchInputs: Dispatch<SetStateAction<T[]>>;
  schema: BaseZodSchema;
  updateInputsMutation: UseMutateFunction<
    UpdateInputMutationPayload,
    unknown,
    UpdateInputMutationBody<T>,
    unknown
  >;
}

interface SubHandlerArgs<T> {
  subValue: string;
  id: string;
  raiseInput: Dispatch<SetStateAction<T[]>>;
}

export function addSubHandler<
  T extends { id: string; substitutes: string[] },
>({ subValue, id, raiseInput }: SubHandlerArgs<T>) {
  raiseInput((prev: T[]) => {
    const index = findRecipeInputIndexById(prev, id);
    if (index === -1) return prev;
    const prevSubs = prev[index]?.substitutes;
    if (!Array.isArray(prevSubs)) return prev;
    const subExists = prevSubs.find((sub) => sub === subValue);
    if (subExists || prevSubs.length === 3) return prev;
    const updatedIngredient = {
      ...prev[index],
      substitutes: [...prevSubs, subValue],
    };
    const newIngredientArray = insertIntoPrevArray(
      prev,
      index,
      updatedIngredient as T,
    );
    return newIngredientArray;
  });
}

export function removeSubHandler<
  T extends { id: string; substitutes: string[] },
>({ subValue, id, raiseInput }: SubHandlerArgs<T>) {
  raiseInput((prev: T[]) => {
    const index = findRecipeInputIndexById(prev, id);
    if (index === -1) return prev;
    const prevSubs = prev[index]?.substitutes;
    if (!Array.isArray(prevSubs)) return prev;
    const newSubs = prevSubs.filter((s) => s !== subValue);
    const updatedIngredient = {
      ...prev[index],
      substitutes: newSubs,
    };
    const newIngredientArray = insertIntoPrevArray(
      prev,
      index,
      updatedIngredient as T,
    );
    return newIngredientArray;
  });
}

export function useDebouncedAutosave<T extends { id: string }>(
  config: UseDebounceControllerArgs<T>,
): { pushIdToUpdateList: (id: string) => void } {
  const { recipeId, inputs, dispatchInputs, schema, updateInputsMutation } =
    config;
  const [inputIdsToUpdate, setInputIdsToUpdate] = useState<string[]>([]);

  function pushIdToUpdateList(id: string) {
    setInputIdsToUpdate((prev: string[]) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }

  const debouncedUpdateValidInputs = useCallback(
    debounce(
      (args: Omit<UseDebounceControllerArgs<T>, 'updateInputsMutation'>) => {
        if (isZeroLength(args.inputs)) return;
        console.log('debounced validation', args.inputs);
        const validInputs = filterValidRecipeInputs(args.inputs, args.schema);
        if (isZeroLength(validInputs)) return;
        console.log('debounced mutation', validInputs);
        updateInputsMutation(
          { recipeId: args.recipeId, inputs: validInputs },
          {
            onSuccess: (data) => {
              setInputIdsToUpdate([]);
              replaceRecipeInputIds(data.inputIdPairs, args.dispatchInputs);
            },
          },
        );
      },
      3000,
    ),
    [],
  );

  useEffect(() => {
    console.log('fired useEffect');
    if (inputIdsToUpdate.length === 0) return;
    console.log('before mutation', inputIdsToUpdate);
    const inputsToUpdate = inputs.filter((i) =>
      inputIdsToUpdate.includes(i.id),
    );
    console.log('after filter', inputsToUpdate);
    debouncedUpdateValidInputs({
      recipeId,
      inputs: inputsToUpdate,
      dispatchInputs,
      schema,
    });
    return () => {
      debouncedUpdateValidInputs.cancel();
    };
  }, [inputs]);

  return { pushIdToUpdateList };
}

export function filterValidRecipeInputs<T extends { id: string }>(
  inputs: T[],
  schema: BaseZodSchema,
) {
  const validInputs = [];
  for (const i of inputs) {
    const valid = schema.safeParse(i);
    if (valid.success) {
      validInputs.push(i);
    }
  }
  return validInputs;
}

export function replaceRecipeInputIds<T extends { id: string }>(
  idPairs: InputIdPairs,
  raiseInput: Dispatch<SetStateAction<T[]>>,
) {
  raiseInput((prev: T[]) => {
    let prevIng = [...prev];
    idPairs.forEach((pair) => {
      if (pair.newId === pair.oldId) return;
      const index = findRecipeInputIndexById(prevIng, pair.oldId);
      if (index === -1) return;
      const ingredientWithNewId = { ...prevIng[index], id: pair.newId };
      prevIng = insertIntoPrevArray(prevIng, index, ingredientWithNewId as T);
      console.log(prevIng);
    });
    return prevIng;
  });
}

export function reorderDraggableInputs<T>(result: DropResult, prev: T[]) {
  const newInputs = [...prev];

  const [movedInput] = newInputs.splice(result.source.index, 1);
  if (
    result.destination?.index === null ||
    result.destination?.index === undefined ||
    !movedInput
  ) {
    return prev;
  }
  newInputs.splice(result.destination?.index, 0, movedInput);
  return newInputs;
}

export function dragEndHandler<T extends { id: string }>(
  result: DropResult,
  dispatchInputs: Dispatch<SetStateAction<T[]>>,
) {
  if (!result.destination) return;
  dispatchInputs((prev: T[]) => {
    const reorderedInputs = reorderDraggableInputs(result, prev);
    return reorderedInputs.map((input, index) => {
      return { ...input, order: index + 1 };
    });
  });
}
