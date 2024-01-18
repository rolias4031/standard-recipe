import { DropResult } from '@hello-pangea/dnd';
import { findRecipeInputIndexById, insertIntoPrevArray } from 'lib/util-client';
import { Dispatch, SetStateAction } from 'react';
import { BaseZodSchema, Stage } from 'types/types';
import { NextRouter } from 'next/router';

export const stages: Stage[] = ['ingredients', 'equipment', 'instructions'];

export function checkStatusesForLoadingOrError(statuses: string[]) {
  const isLoading = statuses.some((status) => status === 'loading');
  const isError = statuses.some((status) => status === 'error');
  return isLoading || isError;
}

export function navigateToStage(
  router: NextRouter,
  {
    recipeId,
    stage,
    shallow,
    isEditMode,
  }: {
    recipeId: string;
    stage: Stage;
    shallow?: boolean;
    isEditMode?: boolean;
  },
) {
  return router.push(
    {
      pathname: `/${isEditMode ? 'edit' : 'create'}/[recipeId]`,
      query: { recipeId, stage },
    },
    undefined,
    { shallow: shallow },
  );
}

export function getNextStageName(curStage: Stage) {
  const curIndex = stages.indexOf(curStage);
  let nextStage: Stage = curStage;
  if (curIndex === 2) return nextStage;
  if (curIndex >= 0 && curIndex !== 2) {
    nextStage = stages[curIndex + 1] || curStage;
    return nextStage;
  }
  return nextStage;
}

export function getPrevStageName(curStage: Stage) {
  const curIndex = stages.indexOf(curStage);
  let nextStage: Stage = curStage;
  if (curIndex === 0) return nextStage;
  if (curIndex > 0) {
    nextStage = stages[curIndex - 1] || curStage;
    return nextStage;
  }
  return nextStage;
}

interface SubHandlerArgs<T> {
  subValue: string;
  id: string;
  raiseInput: Dispatch<SetStateAction<T[]>>;
}

export function addSubHandler<T extends { id: string; substitutes: string[] }>({
  subValue,
  id,
  raiseInput,
}: SubHandlerArgs<T>) {
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

export function createOneInUseInput<T extends { id: string; inUse: boolean }>(
  inputs: T[],
) {
  const idx = inputs.findIndex((i) => !i.inUse);
  if (idx === -1) return inputs;
  const updatedInputs = [...inputs];
  const holder = updatedInputs[idx];
  if (!holder) return inputs;
  updatedInputs[idx] = { ...holder, inUse: true };
  return updatedInputs;
}

export function assignInputOrderByIndex<T extends { order: number }>(
  inputs: T[],
) {
  return inputs.map((i, idx) => {
    return { ...i, order: idx + 1 };
  });
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

export function filterInUseInputs<T extends { id: string; inUse: boolean }>(
  inputs: T[],
) {
  return inputs.filter((i) => i.inUse);
}

export function splitInputsByInUse<T extends { id: string; inUse: boolean }>(
  inputs: T[],
) {
  const notInUse: T[] = [];
  const inUse: T[] = [];
  inputs.forEach((i) => {
    if (!i.inUse) notInUse.push(i);
    else inUse.push(i);
  });
  return { inUse, notInUse };
}

export function reorderDraggableInputs<T extends { inUse: boolean }>(
  result: DropResult,
  inputs: T[],
) {
  const newInputs = [...inputs];
  const [movedInput] = newInputs.splice(result.source.index, 1);
  if (
    result.destination?.index === null ||
    result.destination?.index === undefined ||
    !movedInput
  ) {
    return inputs;
  }
  newInputs.splice(result.destination?.index, 0, movedInput);
  return newInputs;
}

export function dragEndHandler<
  T extends { id: string; inUse: boolean; order: number },
>(result: DropResult, dispatchInputs: Dispatch<SetStateAction<T[]>>) {
  if (!result.destination) return;
  dispatchInputs((prev: T[]) => {
    const { inUse, notInUse } = splitInputsByInUse([...prev]);
    const reorderedInputs = reorderDraggableInputs(result, inUse);
    return assignInputOrderByIndex(reorderedInputs).concat(notInUse);
  });
}

export function removeDeletedInputFromStateHandler<
  T extends { id: string; inUse: boolean; order: number },
>(inputs: T[], idToDelete: string) {
  const newInputs = [...inputs];
  const filteredInputs = newInputs.filter((i) => i.id !== idToDelete);
  const { inUse, notInUse } = splitInputsByInUse(filteredInputs);
  return assignInputOrderByIndex(inUse).concat(notInUse);
}
