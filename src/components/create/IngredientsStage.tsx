import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import {
  findRecipeInputIndexById,
  genIngredient,
  genIngredientUnit,
  insertIntoPrevArray,
  isZeroLength,
  pickStyles,
  reorderDraggableInputs,
} from 'lib/util-client';
import { DropResult } from '@hello-pangea/dnd';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import { GeneralButton } from 'pirate-ui';
import InputWithPopover from 'components/common/InputWithPopover';
import { FlowIngredient } from 'types/models';
import { IngredientUnit } from '@prisma/client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import AddSubstitutes from './AddSubstitutes';
import NotesInput from 'components/common/NotesInput';
import OptionalInput from 'components/common/OptionalInput';
import StageFrame from './StageFrame';
import CogIcon from 'components/common/icons/CogIcon';
import TrashIcon from 'components/common/icons/TrashIcon';
import { useDeleteIngredient, useUpdateRecipeIngredient } from 'lib/mutations';
import { newIngredientSchema } from 'validation/schemas';

interface IngredientStageProps {
  recipeId: string;
  ingredients: FlowIngredient[];
  raiseIngredients: Dispatch<SetStateAction<FlowIngredient[]>>;
  allUnits: IngredientUnit[];
}

function IngredientsStage({
  recipeId,
  ingredients,
  raiseIngredients,
  allUnits,
}: IngredientStageProps) {
  const client = useQueryClient();
  const { mutate: updateIngredient, status: updateStatus } =
    useUpdateRecipeIngredient();
  const { mutate: deleteIngredient, status: deleteStatus } =
    useDeleteIngredient();
  const [aggregateStatus, setAggregateStatus] = useState('idle');
  const [ingredientIdsToUpdate, setIngredientIdsToUpdate] = useState<string[]>(
    [],
  );

  console.log(ingredients);

  console.log('ingredientIdsToUpdate', ingredientIdsToUpdate);

  function pushIdToUpdateList(id: string) {
    setIngredientIdsToUpdate((prev: string[]) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }

  useEffect(() => {
    console.log('fired useEffect');
    if (ingredientIdsToUpdate.length === 0) return;
    console.log('before mutation', ingredientIdsToUpdate);
    debouncedUpdateValidIngredients(
      ingredients.filter((i) => ingredientIdsToUpdate.includes(i.id)),
    );
    return () => {
      debouncedUpdateValidIngredients.cancel();
    };
  }, [ingredients]);

  function replaceIngredientIds(idPairs: { newId: string; oldId: string }[]) {
    raiseIngredients((prev: FlowIngredient[]) => {
      let prevIng = [...prev];
      idPairs.forEach((pair) => {
        console.log('replace ids', pair);
        if (pair.newId === pair.oldId) return;
        console.log('diff');
        const index = findRecipeInputIndexById(prevIng, pair.oldId);
        if (index === -1) return;
        console.log('found', index);
        const ingredientWithNewId = { ...prevIng[index], id: pair.newId };
        prevIng = insertIntoPrevArray(
          prevIng,
          index,
          ingredientWithNewId as FlowIngredient,
        );
        console.log(prevIng);
      });
      return prevIng;
    });
  }

  function filterValidIngredients(ingredients: FlowIngredient[]) {
    const validIngredients = [];
    for (const i of ingredients) {
      const valid = newIngredientSchema.safeParse(i);
      if (valid.success) {
        validIngredients.push(i);
      }
    }
    return validIngredients;
  }

  const debouncedUpdateValidIngredients = useCallback(
    debounce((ingredients: FlowIngredient[]) => {
      console.log('other', ingredients);
      if (isZeroLength(ingredients)) return;
      const validIngredients = filterValidIngredients(ingredients);
      if (isZeroLength(validIngredients)) return;
      console.log('debouncedMutation', validIngredients);
      // mutate
      updateIngredient(
        { recipeId, ingredients },
        {
          onSuccess: (data) => {
            // clear updated ids.
            setIngredientIdsToUpdate([]);
            // swap ids
            console.log(data.ingredientIdPairs);
            replaceIngredientIds(data.ingredientIdPairs);
          },
        },
      );
    }, 3000),
    [],
  );

  function removeIngredientHandler(id: string) {
    raiseIngredients((prev: FlowIngredient[]) => {
      if (prev.length === 1) return [genIngredient()];
      const newIngredients = prev.filter((i) => i.id !== id);
      return newIngredients;
    });
    // mutate
    deleteIngredient({ id });
  }

  function addSubsHandler(newSub: string, id: string) {
    raiseIngredients((prev: FlowIngredient[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const prevSubs = prev[index]?.substitutes;
      if (!Array.isArray(prevSubs)) return prev;
      const subExists = prevSubs.find((sub) => sub === newSub);
      if (subExists || prevSubs.length === 3) return prev;
      const updatedIngredient = {
        ...prev[index],
        substitutes: [...prevSubs, newSub],
      };
      const newIngredientArray = insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as FlowIngredient,
      );
      return newIngredientArray;
    });
    pushIdToUpdateList(id);
  }

  function removeSubHandler(subToRemove: string, id: string) {
    raiseIngredients((prev: FlowIngredient[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const prevSubs = prev[index]?.substitutes;
      if (!Array.isArray(prevSubs)) return prev;
      const newSubs = prevSubs.filter((s) => s !== subToRemove);
      const updatedIngredient = {
        ...prev[index],
        substitutes: newSubs,
      };
      const newIngredientArray = insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as FlowIngredient,
      );
      return newIngredientArray;
    });
    pushIdToUpdateList(id);
  }

  function updateIngredientHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseIngredients((prev: FlowIngredient[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const updatedIngredient = {
        ...prev[index],
        [name]: value,
      };
      return insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as FlowIngredient,
      );
    });
    pushIdToUpdateList(id);
  }

  function updateUnitHandler({
    id,
    unitInput,
  }: {
    id: string;
    unitInput: string | null;
  }) {
    raiseIngredients((prev: FlowIngredient[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const newUnits =
        unitInput === 'clear'
          ? genIngredientUnit()
          : allUnits.find((u) => u.unit === unitInput);
      const updatedIngredient = {
        ...prev[index],
        unit: !unitInput ? unitInput : newUnits,
      };
      return insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as FlowIngredient,
      );
    });
    pushIdToUpdateList(id);
  }

  function cleanNameInput(value: string) {
    return value.toLowerCase();
  }

  function cleanQuantityInput(value: string) {
    return value ? parseFloat(value) : '';
  }

  function dragEndHandler(result: DropResult) {
    if (!result.destination) return;
    raiseIngredients((prev: FlowIngredient[]) => {
      return reorderDraggableInputs(result, prev);
    });
  }

  return (
    <StageFrame
      onDragEnd={dragEndHandler}
      droppableId="ingredients"
      stageInputLabels={
        <>
          <div className="col-start-1 w-72 font-mono text-sm">Ingredient</div>
          <div className="col-start-2 w-36 font-mono text-sm">Quantity</div>
          <div className="col-start-3 w-36 font-mono text-sm">Unit</div>
        </>
      }
      mutationStatus={updateStatus}
      stageInputComponents={ingredients.map((i, index) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          index={index}
          optionModes={['substitutes', 'notes']}
          mainInputComponents={() => (
            <>
              <input
                type="text"
                name="name"
                value={i.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateIngredientHandler({
                    name: e.target.name,
                    value: cleanNameInput(e.target.value),
                    id: i.id,
                  })
                }
                className="inp-reg inp-primary w-72"
                autoComplete="off"
              />
              <input
                type="number"
                name="quantity"
                value={i.quantity}
                min="0"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateIngredientHandler({
                    id: i.id,
                    name: e.target.name,
                    value: cleanQuantityInput(e.target.value),
                  })
                }
                className="inp-reg inp-primary w-36 disabled:text-concrete"
                disabled={!i.unit}
              />
              <InputWithPopover
                options={allUnits.map((u) => u.unit)}
                name="unit"
                curValue={i.unit && i.unit.unit}
                onRaiseInput={({ value }) => {
                  updateUnitHandler({
                    id: i.id,
                    unitInput: value,
                  });
                }}
                styles={{
                  button: {
                    root: 'inp-reg focus:outline-fern rounded-sm w-36 flex disabled:text-concrete',
                    isToggled: ['bg-fern text-white', 'bg-smoke'],
                  },
                }}
              />
            </>
          )}
          auxiliaryComponents={
            <>
              <OptionalInput
                id={i.id}
                curIsOptional={i.optional}
                onRaiseInput={updateIngredientHandler}
              />
              <div className="flex items-center space-x-1">
                <input
                  id={`no units-${i.id}`}
                  name="unit"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-fern"
                  checked={i.unit === null}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateUnitHandler({
                      id: i.id,
                      unitInput: e.target.checked ? null : 'clear',
                    });
                    if (!e.target.checked) return;
                    updateIngredientHandler({
                      id: i.id,
                      name: 'quantity',
                      value: 0,
                    });
                  }}
                />
                <label
                  htmlFor={`no units-${i.id}`}
                  className="cursor-pointer text-xs"
                >
                  No Units
                </label>
              </div>
            </>
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="fade-in flex flex-grow items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <GeneralButton
                  onClick={() =>
                    setOptionMode((prev: string | null) =>
                      prev === null && optionModes[0] ? optionModes[0] : null,
                    )
                  }
                >
                  <CogIcon
                    styles={{
                      icon: pickStyles('w-6 h-6 transition-colors', [
                        !optionMode,
                        'text-concrete hover:text-fern',
                        'text-fern',
                      ]),
                    }}
                  />
                </GeneralButton>
              </div>
              <GeneralButton
                onClick={() => removeIngredientHandler(i.id)}
                styles={{ button: 'h-fit' }}
              >
                <TrashIcon
                  styles={{
                    icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                  }}
                />
              </GeneralButton>
            </div>
          )}
          overviewComponents={
            <>
              {i.optional ? <span>optional</span> : null}
              {!isZeroLength(i.notes) ? <span>notes</span> : null}
              {!isZeroLength(i.substitutes) ? <span>subs</span> : null}
            </>
          }
          optionInputComponents={(optionMode) => (
            <>
              {optionMode === 'substitutes' ? (
                <AddSubstitutes
                  id={i.id}
                  curSubs={i.substitutes}
                  onAddSub={addSubsHandler}
                  onRemoveSub={removeSubHandler}
                  styles={{
                    div: 'flex space-x-4 items-center',
                  }}
                />
              ) : null}
              {optionMode === 'notes' ? (
                <NotesInput
                  id={i.id}
                  curNotes={i.notes}
                  onRaiseNotes={updateIngredientHandler}
                />
              ) : null}
            </>
          )}
        />
      ))}
    />
  );
}

export default IngredientsStage;
