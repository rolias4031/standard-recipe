import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  findIngredientIndexById,
  genIngredient,
  genIngredientUnit,
  insertIntoPrevArray,
  pickStyles,
} from 'lib/util-client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import { TextInput } from 'pirate-ui';
import InputWithPopover from 'components/common/InputWithPopover';
import { IngredientWithAllModName } from 'types/models';
import { IngredientUnit } from '@prisma/client';
import { UpdateIngredientHandlerArgs } from 'types/types';

function TipBox() {
  const [isTipOpen, setIsTipOpen] = useState(true);

  return (
    <div
      className={pickStyles(
        'flex flex-col card-primary text-neutral-800 space-y-3 transition-all',
        [isTipOpen, 'p-5 card-primary', 'p-5'],
      )}
    >
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
                <s className="">organic, all-natural,</s>
                {' '}
                <span className="text-emerald-700 font-semibold">
                  sliced fuji apples
                </span>
              </span>
              <span>
                <s>Whole Foods</s>
                {' '}
                <span className="text-emerald-700 font-semibold">
                  olive oil
                </span>
              </span>
              <span>
                <s>grass-fed</s>
                {' '}
                <span className="text-emerald-700 font-semibold">
                  85% ground beef
                </span>
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

  console.log(ingredients);

  function updateIngredientHandler({
    ingredientId,
    inputName,
    inputValue,
  }: UpdateIngredientHandlerArgs) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findIngredientIndexById(prev, ingredientId);
      if (index !== -1) {
        const updatedIngredient = {
          ...prev[index],
          [inputName]: inputValue,
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
    ingredientId,
    unitInput,
  }: {
    ingredientId: string;
    unitInput: string;
  }) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findIngredientIndexById(prev, ingredientId);
      if (index === -1) return prev;
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
    <div className="flex flex-col pt-10 pb-3 space-y-10 h-full">
      <TipBox />
      <div className="flex flex-col space-y-3 card-primary p-6">
        {ingredients.map((i, index) => (
          <RecipeFlowInput
            key={i.id}
            id={i.id}
            curSubs={i.substitutes}
            curOptional={i.optional}
            curNotes={i.notes}
            order={index + 1}
            onRemove={removeIngredientHandler}
            raiseIngredients={raiseIngredients}
            onRaiseInput={updateIngredientHandler}
            columnLabelComponents={
              <>
                <div className="w-72">Ingredients</div>
                <div className="w-36">Quantity</div>
                <div className="w-36">Units</div>
              </>
            }
            inputComponents={
              <>
                <TextInput
                  name="name"
                  value={i.name}
                  onChange={({ input, name }) =>
                    updateIngredientHandler({
                      inputName: name,
                      inputValue: input,
                      ingredientId: i.id,
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
                      ingredientId: i.id,
                      inputName: e.target.name,
                      inputValue: e.target.value,
                    })
                  }
                  className="inp-reg inp-primary w-36"
                />
                <InputWithPopover
                  options={allUnits.map((u) => u.unit)}
                  name="unit"
                  curValue={i.unit.unit === '' ? 'Select' : i.unit.unit}
                  onRaiseInput={({ input, name }) =>
                    updateUnitsHandler({
                      ingredientId: i.id,
                      unitInput: input,
                    })
                  }
                  styles={{
                    button: {
                      root: 'inp-reg focus:outline-emerald-700 rounded-sm w-36 flex',
                      isToggled: ['bg-emerald-700 text-white', 'bg-smoke'],
                    },
                  }}
                />
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default IngredientsStage;
