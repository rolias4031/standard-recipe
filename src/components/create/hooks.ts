import { UseMutateFunction } from '@tanstack/react-query';
import { isZeroLength } from 'lib/util-client';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';
import {
  BaseZodSchema,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { filterValidRecipeInputs } from './utils';

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

export function useDebouncedAutosave<T extends { id: string }>(
  config: UseDebounceControllerArgs<T>,
): { triggerAutosave: () => void } {
  const {
    recipeId,
    inputs,
    schema,
    updateInputsMutation,
    debounceInMs = 1000,
  } = config;
  const [isAutosaveTriggered, setIsAutosaveTriggered] =
    useState<boolean>(false);

  function triggerAutosave() {
    setIsAutosaveTriggered(true);
  }

  function clearAutosave() {
    setIsAutosaveTriggered(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateValidInputs = useCallback(
    debounce((args: DebouncedMutationArgs<T>) => {
      clearAutosave();
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
    console.log('fired useEffect');
    if (!isAutosaveTriggered) return;
    debouncedUpdateValidInputs({
      recipeId,
      inputs: inputs,
      schema,
    });
    return () => {
      debouncedUpdateValidInputs.cancel();
    };
  }, [
    inputs,
    debouncedUpdateValidInputs,
    isAutosaveTriggered,
    recipeId,
    schema,
  ]);

  return { triggerAutosave };
}
