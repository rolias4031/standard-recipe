import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
import { IngredientWithAllModName } from 'types/models';
import { IngredientUnit } from '@prisma/client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import AddSubstitutes from './AddSubstitutes';
import NotesInput from 'components/common/NotesInput';
import OptionalInput from 'components/common/OptionalInput';
import StageFrame from './StageFrame';
import CogIcon from 'components/common/icons/CogIcon';
import TrashIcon from 'components/common/icons/TrashIcon';
import { useUpdateRecipeIngredient } from 'lib/mutations';
import { newIngredientSchema } from 'validation/schemas';

interface IngredientStageProps {
  recipeId: string;
  ingredients: IngredientWithAllModName[];
  raiseIngredients: Dispatch<SetStateAction<IngredientWithAllModName[]>>;
  allUnits: IngredientUnit[];
}

function IngredientsStage({
  recipeId,
  ingredients,
  raiseIngredients,
  allUnits,
}: IngredientStageProps) {
  const { mutate: updateIngredient, status } = useUpdateRecipeIngredient();
  const [ingredientIdToUpdate, setIngredientIdToUpdate] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!ingredientIdToUpdate) return;

    debouncedValidateAndUpdate(
      ingredients.find((i) => i.id === ingredientIdToUpdate),
    );
    return () => {
      debouncedValidateAndUpdate.cancel();
    };
  }, [ingredientIdToUpdate, ingredients]);

  const debouncedValidateAndUpdate = useCallback(
    debounce((ingredient: IngredientWithAllModName | undefined) => {
      console.log('other', ingredient);
      if (!ingredient) return;
      const valid = newIngredientSchema.safeParse(ingredient);
      if (!valid.success) return;
      console.log('debouncedMutation', valid);
      // mutate
      updateIngredient({ recipeId, ingredient });
    }, 2000),
    [],
  );

  function removeIngredientHandler(id: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      if (prev.length === 1) return [genIngredient()];
      const newIngredients = prev.filter((i) => i.id !== id);
      return newIngredients;
    });
  }

  function addSubsHandler(newSub: string, id: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
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
        updatedIngredient as IngredientWithAllModName,
      );
      return newIngredientArray;
    });
  }

  function removeSubHandler(subToRemove: string, id: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
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
        updatedIngredient as IngredientWithAllModName,
      );
      return newIngredientArray;
    });
  }

  function updateIngredientHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const updatedIngredient = {
        ...prev[index],
        [name]: value,
      };
      return insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as IngredientWithAllModName,
      );
    });
    setIngredientIdToUpdate(id);
  }

  function updateUnitHandler({
    id,
    unitInput,
  }: {
    id: string;
    unitInput: string;
  }) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const newUnits =
        unitInput === 'clear'
          ? genIngredientUnit()
          : allUnits.find((u) => u.unit === unitInput);
      const updatedIngredient = {
        ...prev[index],
        unit: newUnits,
      };
      return insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as IngredientWithAllModName,
      );
    });
    setIngredientIdToUpdate(id);
  }

  function cleanNameInput(value: string) {
    return value.toLowerCase();
  }

  function cleanQuantityInput(value: string) {
    return value ? parseFloat(value) : '';
  }

  function dragEndHandler(result: DropResult) {
    if (!result.destination) return;
    raiseIngredients((prev: IngredientWithAllModName[]) => {
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
      stageInputComponents={ingredients.map((i, index) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          index={index}
          optionModes={['substitutes', 'notes']}
          inputComponents={() => (
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
                className="inp-reg inp-primary w-36"
              />
              <InputWithPopover
                options={allUnits.map((u) => u.unit)}
                name="unit"
                curValue={i.unit.unit === '' ? 'Select' : i.unit.unit}
                onRaiseInput={({ value }) => {
                  updateUnitHandler({
                    id: i.id,
                    unitInput: value,
                  });
                }}
                styles={{
                  button: {
                    root: 'inp-reg focus:outline-fern rounded-sm w-36 flex',
                    isToggled: ['bg-fern text-white', 'bg-smoke'],
                  },
                }}
              />
            </>
          )}
          optionalComponent={
            <OptionalInput
              id={i.id}
              curIsOptional={i.optional}
              onRaiseInput={updateIngredientHandler}
            />
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
          optionOverviewComponents={
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
