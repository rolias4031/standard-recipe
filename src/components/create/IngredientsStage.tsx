import React, { Dispatch, SetStateAction } from 'react';
import { findRecipeInputIndexById, insertIntoPrevArray } from 'lib/util-client';
import { FlowIngredient } from 'types/models';
import { IngredientUnit } from '@prisma/client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import OptionalInput from 'components/common/OptionalInput';
import StageFrame from './StageFrame';
import { useDeleteIngredient } from 'lib/mutations';
import {
  addSubHandler,
  removeDeletedInputFromStateHandler,
  removeSubHandler,
} from './utils';
import { dragEndHandler } from './utils';
import SelectUnit from './SelectUnit';
import FlowInputBlock from './FlowInputBlock';
import { OptionDialog } from './OptionDialog';

function cleanNameInput(value: string) {
  return value.toLowerCase();
}

function cleanQuantityInput(value: string) {
  return value ? parseFloat(value) : '';
}

export interface StageSharedProps {
  isDisabled?: boolean;
  recipeId: string;
  triggerDebouncedUpdate?: () => void;
}

interface IngredientStageProps extends StageSharedProps {
  ingredients: FlowIngredient[];
  raiseIngredients: Dispatch<SetStateAction<FlowIngredient[]>>;
  allUnits: IngredientUnit[];
}

function IngredientsStage({
  recipeId,
  ingredients,
  raiseIngredients,
  allUnits,
  triggerDebouncedUpdate,
  isDisabled,
}: IngredientStageProps) {
  function triggerUpdateIfProvided() {
    if (!triggerDebouncedUpdate) return;
    triggerDebouncedUpdate();
  }

  const { mutate: deleteIngredient, status: deleteStatus } =
    useDeleteIngredient();

  function addIngredientSubHandler(subValue: string, id: string) {
    addSubHandler({ subValue, id, raiseInput: raiseIngredients });
    triggerUpdateIfProvided;
  }

  function removeIngredientSubHandler(subValue: string, id: string) {
    removeSubHandler({ subValue, id, raiseInput: raiseIngredients });
    triggerUpdateIfProvided;
  }

  function deleteIngredientHandler(id: string) {
    raiseIngredients((prev: FlowIngredient[]) => {
      return removeDeletedInputFromStateHandler(prev, id);
    });
    deleteIngredient({ id, recipeId, replace: true });
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
    triggerUpdateIfProvided();
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
          ? null
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
    triggerUpdateIfProvided();
  }

  return (
    <>
      <StageFrame
        onDragEnd={(result) => {
          dragEndHandler(result, raiseIngredients);
          triggerUpdateIfProvided();
        }}
        droppableId="ingredients"
        stageInputComponents={ingredients.map((i, index) => {
          return !i.inUse ? null : (
            <FlowInputBlock
              id={i.id}
              key={i.id}
              order={index + 1}
              isDisabled={isDisabled}
              mainInputComponent={() => (
                <input
                  disabled={isDisabled}
                  type="text"
                  className="w-full rounded bg-smoke px-2 py-1 focus:bg-white focus:outline-fern disabled:text-concrete"
                  value={i.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateIngredientHandler({
                      value: cleanNameInput(e.target.value),
                      id: i.id,
                      name: 'name',
                    })
                  }
                />
              )}
              secondaryInputComponent={
                <>
                  <input
                    disabled={isDisabled}
                    type="number"
                    className="w-1/2 rounded bg-smoke px-2 py-1 font-mono focus:bg-white focus:outline-fern disabled:text-concrete"
                    value={i.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateIngredientHandler({
                        value: cleanQuantityInput(e.target.value),
                        id: i.id,
                        name: 'quantity',
                      })
                    }
                  />
                  <SelectUnit
                    idForDialogParam={(index + 1).toString()}
                    isDisabled={isDisabled}
                    curUnit={i.unit ? i.unit.unit : null}
                    onSelectUnit={({ value }) =>
                      updateUnitHandler({ id: i.id, unitInput: value })
                    }
                    unitOptions={allUnits}
                    ingredientName={i.name}
                  />
                </>
              }
              optionsComponent={(handleToggleDialog) => (
                <>
                  <OptionDialog.Card>
                    <OptionDialog.CloseButton onClose={handleToggleDialog} />
                    <OptionDialog.Heading
                      name={i.name}
                      onDeleteIngredient={() => deleteIngredientHandler(i.id)}
                    />
                    <div className="flex space-x-5 text-lg">
                      <OptionalInput
                        id={i.id}
                        curIsOptional={i.optional}
                        onRaiseInput={updateIngredientHandler}
                      />
                      <div className="flex items-center space-x-1">
                        <input
                          id={`no-units-${i.id}`}
                          name="unit"
                          type="checkbox"
                          className="h-6 w-6 cursor-pointer accent-fern"
                          checked={i.unit === null}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
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
                          className="cursor-pointer"
                        >
                          No Units
                        </label>
                      </div>
                    </div>
                    <OptionDialog.Substitutes
                      id={i.id}
                      curSubs={i.substitutes}
                      onAddSub={addIngredientSubHandler}
                      onRemoveSub={removeIngredientSubHandler}
                    />
                    <OptionDialog.Notes
                      curNotes={i.notes}
                      id={i.id}
                      onRaiseNotes={updateIngredientHandler}
                    />
                  </OptionDialog.Card>
                </>
              )}
            />
          );
        })}
      />
      {isDisabled ? (
        <div
          className="absolute top-0 bottom-0 cursor-not-allowed bg-abyss bg-smoke/40"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
    </>
  );
}

export default IngredientsStage;
