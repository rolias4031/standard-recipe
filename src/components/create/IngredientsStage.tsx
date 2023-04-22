import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  findRecipeInputIndexById,
  genIngredient,
  genIngredientUnit,
  insertIntoPrevArray,
  isZeroLength,
  pickStyles,
} from 'lib/util-client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import { GeneralButton, TextInput } from 'pirate-ui';
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

function TipBox() {
  const [isTipOpen, setIsTipOpen] = useState(true);

  return (
    <div className="flex flex-col border-y space-y-3 transition-all">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Tips</p>
        <button
          onClick={() => setIsTipOpen((prev) => !prev)}
          type="button"
          className="btn-text-primary"
        >
          {isTipOpen ? 'hide' : 'show'}
        </button>
      </div>
      {isTipOpen ? (
        <div className="flex flex-col space-y-5">
          <div className="">
            <p>
              {
                '1. Be simple. Name your ingredients only by what the recipe depends on'
              }
            </p>
            <div className="ml-16 flex flex-col mt-2 space-y-1">
              <span>
                <s className="">organic, all-natural,</s>{' '}
                <span className="text-fern font-semibold">
                  sliced fuji apples
                </span>
              </span>
              <span>
                <s>Whole Foods</s>{' '}
                <span className="text-fern font-semibold">olive oil</span>
              </span>
              <span>
                <s>grass-fed</s>{' '}
                <span className="text-fern font-semibold">85% ground beef</span>
              </span>
            </div>
          </div>
          <p>
            {
              '2. Add substitutes, mark an ingredient as optional, and more from the options tab'
            }
          </p>

          <p>
            {
              "3. Start typing an ingredient name for autocomplete. If it's not there, that means you're the first to type it!"
            }
          </p>
          <p>
            {
              "4. Ingredients get sorted automatically, so don't worry about the order"
            }
          </p>
        </div>
      ) : null}
    </div>
  );
}

interface IngredientStageProps {
  ingredients: IngredientWithAllModName[];
  raiseIngredients: Dispatch<SetStateAction<IngredientWithAllModName[]>>;
  allUnits: IngredientUnit[];
}

function IngredientsStage({
  ingredients,
  raiseIngredients,
  allUnits,
}: IngredientStageProps) {
  function removeIngredientHandler(id: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      if (prev.length === 1) return [genIngredient()];
      const newIngredients = prev.filter((i) => i.id !== id);
      return newIngredients;
    });
  }

  function addSubsHandler(newSub: string, id: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      console.log('addSubs', prev, newSub, id);
      const index = findRecipeInputIndexById(prev, id);
      console.log('addSubs', index);
      if (index === -1) return prev;
      const prevSubs = prev[index]?.substitutes;
      console.log(prevSubs);
      if (!Array.isArray(prevSubs)) return prev;
      console.log('passed');
      const subExists = prevSubs.find((sub) => sub === newSub);
      console.log(subExists, prevSubs.length);
      if (subExists || prevSubs.length === 3) return prev;
      console.log('passed 2');
      const updatedIngredient = {
        ...prev[index],
        substitutes: [...prevSubs, newSub],
      };
      const newIngredientArray = insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as IngredientWithAllModName,
      );
      console.log(updatedIngredient)
      console.log(newIngredientArray);;
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
      if (index !== -1) {
        const updatedIngredient = {
          ...prev[index],
          [name]: value,
        };
        const newIngredientsArray = insertIntoPrevArray(
          prev,
          index,
          updatedIngredient as IngredientWithAllModName,
        );
        return newIngredientsArray;
      }
      return prev;
    });
  }

  function updateUnitsHandler({
    id,
    unitInput,
  }: {
    id: string;
    unitInput: string;
  }) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      console.log('unitInput', unitInput);
      const newUnits =
        unitInput === 'clear'
          ? genIngredientUnit()
          : allUnits.find((u) => u.unit === unitInput);
      const updatedIngredient = {
        ...prev[index],
        unit: newUnits,
      };
      const newIngredientsArray = insertIntoPrevArray(
        prev,
        index,
        updatedIngredient as IngredientWithAllModName,
      );

      return newIngredientsArray;
    });
  }

  return (
    <StageFrame
      inputComponents={ingredients.map((i, index) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          order={index + 1}
          optionModes={['substitutes', 'notes']}
          inputLabelComponents={
            <>
              <div className="w-72">Ingredient</div>
              <div className="w-36">Quantity</div>
              <div className="w-36">Units</div>
            </>
          }
          inputComponents={() => (
            <>
              <TextInput
                name="name"
                value={i.name}
                onChange={({ value, name }) =>
                  updateIngredientHandler({
                    name,
                    value,
                    id: i.id,
                  })
                }
                styles={{ input: 'inp-reg inp-primary w-72' }}
              />
              <input
                type="number"
                name="quantity"
                value={i.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateIngredientHandler({
                    id: i.id,
                    name: e.target.name,
                    value: e.target.value,
                  })
                }
                className="inp-reg inp-primary w-36"
              />
              <InputWithPopover
                options={allUnits.map((u) => u.unit)}
                name="unit"
                curValue={i.unit.unit === '' ? 'Select' : i.unit.unit}
                onRaiseInput={({ value, name }) => {
                  console.log(value, name);
                  updateUnitsHandler({
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
              className="flex flex-grow justify-between items-center fade-in"
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
