import { DropResult } from '@hello-pangea/dnd';
import { findRecipeInputIndexById, insertIntoPrevArray } from 'lib/util-client';
import { Dispatch, SetStateAction } from 'react';
import { BaseZodSchema, InputIdPairs, Stage } from 'types/types';
import { stages } from './CreateRecipeFlow';
import { NextRouter } from 'next/router';

export function checkStatusesForLoadingOrError(statuses: string[]) {
  const isLoading = statuses.some((status) => status === 'loading');
  const isError = statuses.some((status) => status === 'error');
  return isLoading || isError;
}

export function navigateToCreateStage(
  router: NextRouter,
  {
    recipeId,
    stage,
    shallow,
  }: { recipeId: string; stage: Stage; shallow?: boolean },
) {
  return router.push(
    {
      pathname: '/create/[recipeId]/',
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
