import { Equipment, Instruction } from '@prisma/client';
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
        console.log('debounced 1', args.inputs);
        if (isZeroLength(args.inputs)) return;
        const validInputs = filterValidRecipeInputs(args.inputs, args.schema);
        if (isZeroLength(validInputs)) return;
        console.log('debounced 2', validInputs);
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
