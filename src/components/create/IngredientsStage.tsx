import { Ingredient } from '@prisma/client';
import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { genId } from 'lib/util-client';
import InputWithPopover from 'components/common/InputWithPopover';
import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';

function TipBox() {
  const [isTipOpen, setIsTipOpen] = useState(true);

  return (
    <div className="flex flex-col bg-gray-50 border-gray-300 text-gray-800 p-3 border rounded-lg space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Tips</p>
        <button
          onClick={() => setIsTipOpen((prev) => !prev)}
          type="button"
          className="hover:text-black"
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
                <span className="text-emerald-700 font-semibold">
                  {' '}
                  sliced fuji apples
                </span>
              </span>
              <span>
                <s>Whole Foods</s>
                <span className="text-emerald-700 font-semibold">
                  {' '}
                  olive oil
                </span>
              </span>
              <span>
                <s>grass-fed</s>
                <span className="text-emerald-700 font-semibold">
                  {' '}
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

interface SubTagProps {
  sub: string;
  onRemoveSub: (subToRemove: string) => void;
}

function SubTag({ sub, onRemoveSub }: SubTagProps) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  return (
    <div
      key={sub}
      className="text-white text-sm bg-emerald-700 rounded flex items-center space-x-2 p-1 px-2"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <span>{sub}</span>
      {isMouseOver ? (
        <button onClick={() => onRemoveSub(sub)}>
          <XIcon styles={{ icon: 'w-4 h-4 text-white' }} />
        </button>
      ) : null}
    </div>
  );
}

interface AddSubstitutesProps {
  id: string;
  curSubs: string[];
  onAddSub: (newSub: string) => void;
  onRemoveSub: (subToRemove: string) => void;
}

function AddSubstitutes({
  id,
  curSubs,
  onAddSub,
  onRemoveSub,
}: AddSubstitutesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-start">
      <label className="text-sm block" htmlFor={`substitutes-${id}`}>
        Add substitutes
      </label>
      <div className="flex items-center space-x-1">
        <input
          ref={inputRef}
          type="text"
          className="text-gray-800 border border-gray-300 rounded outline-none text-xs p-1 focus:border-gray-800"
        />

        <button
          type="button"
          className="bg-emerald-700 rounded-full"
          onClick={() => {
            if (!inputRef.current || inputRef.current.value === '') return;
            const newSub = inputRef.current.value;
            inputRef.current.value = '';
            onAddSub(newSub);
          }}
        >
          <PlusIcon styles={{ icon: 'w-5 h-5 text-white' }} />
        </button>
      </div>
      <div className="flex items-start space-x-2 mt-2">
        {curSubs.map((s) => (
          <SubTag key={s} sub={s} onRemoveSub={onRemoveSub} />
        ))}
      </div>
    </div>
  );
}

interface OptionsMenuProps {
  id: string;
  onRemove: (id: string) => void;
  raiseOptional: Dispatch<SetStateAction<boolean>>;
  isOptional: boolean;
  children: ReactNode;
  styles: {
    div: string;
  };
}

function OptionsMenu({
  id,
  onRemove,
  raiseOptional,
  isOptional,
  children,
  styles,
}: OptionsMenuProps) {
  return (
    <div className={styles.div}>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="w-fit text-sm"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={() => console.log('duplicate')}
          className="w-fit text-sm"
        >
          Duplicate
        </button>
      </div>
      <div className="flex items-center space-x-1">
        <input
          id={`optional-${id}`}
          type="checkbox"
          className="w-4 h-4 accent-gray-800"
          checked={isOptional}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            raiseOptional(e.target.checked)
          }
        />
        <label className="text-sm" htmlFor={`optional-${id}`}>
          Optional
        </label>
      </div>
      {children}
    </div>
  );
}

interface IngredientInputProps {
  id: string;
  order: number;
  onRemove: (id: string) => void;
}

function IngredientInput({ id, order, onRemove }: IngredientInputProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMouseIn, setIsMouseIn] = useState(false);

  const [ingredientSubs, setIngredientSubs] = useState<string[]>([]);
  const [isOptional, setIsOptional] = useState(false);

  function addSubsHandler(newSub: string) {
    setIngredientSubs((prev: string[]) => {
      const subExists = prev.find((sub) => sub === newSub);
      if (subExists) return prev;
      return [...prev, newSub];
    });
  }

  function removeSubHandler(subToRemove: string) {
    setIngredientSubs((prev: string[]) => {
      const newSubs = [...prev].filter((s) => s !== subToRemove);
      return newSubs;
    });
  }

  return (
    <div
      id={id}
      className="flex items-center bg-blue-100 text-gray-800 w-full"
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div className="font-mono text-gray-300 w-8 bg-red-100">{order}</div>
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center space-x-2">
          <input
            className="w-56 border focus:border-gray-800 border-gray-300 outline-none p-1 px-2 rounded"
            type="text"
          />
          <input
            className="w-32 border focus:border-gray-800 border-gray-300 outline-none p-1 px-2 rounded"
            type="number"
            step="0.1"
            min="0"
          />
          <InputWithPopover />
          {isMouseIn || isOptionsOpen ? (
            <button
              className={`text-sm  ${
                isOptionsOpen ? 'text-gray-800' : 'text-gray-300'
              }`}
              onClick={() => setIsOptionsOpen((prev) => !prev)}
            >
              options
            </button>
          ) : null}
        </div>
        {isOptionsOpen ? (
          <OptionsMenu
            id={id}
            onRemove={onRemove}
            isOptional={isOptional}
            raiseOptional={setIsOptional}
            styles={{
              div: 'border border-gray-800 rounded flex flex-col space-y-3 p-3',
            }}
          >
            <AddSubstitutes
              id={id}
              curSubs={ingredientSubs}
              onAddSub={addSubsHandler}
              onRemoveSub={removeSubHandler}
            />
          </OptionsMenu>
        ) : null}
      </div>
    </div>
  );
}

interface InputsControllerProps {
  children: ({
    inputIds,
    removeInputHandler,
  }: {
    inputIds: string[];
    removeInputHandler: (id: string) => void;
  }) => ReactNode;
}

function InputsController({ children }: InputsControllerProps) {
  const [inputIds, setInputIds] = useState(['firstId']);

  function removeInputHandler(id: string) {
    setInputIds((prev: string[]) => {
      if (prev.length === 1) {
        return [genId()];
      }
      return prev.filter((i) => i !== id);
    });
  }

  return (
    <>
      {children({ inputIds, removeInputHandler })}
      <button
        className="bg-gray-300 hover:bg-emerald-700 text-white p-1 rounded"
        onClick={() => setInputIds((prev: string[]) => [...prev, genId()])}
      >
        New Ingredient
      </button>
    </>
  );
}

interface IngredientStageProps {
  ingredients: Ingredient[];
}

function IngredientsStage({ ingredients }: IngredientStageProps) {
  return (
    <div className="m-10 flex flex-col space-y-16">
      <TipBox />
      <InputsController>
        {({ inputIds, removeInputHandler }) => (

          <div className="flex flex-col space-y-5">
            {inputIds.map((id, index) => (
              <IngredientInput
                key={id}
                order={index + 1}
                id={id}
                onRemove={removeInputHandler}
              />
            ))}
          </div>
        )}
      </InputsController>
    </div>
  );
}

export default IngredientsStage;
