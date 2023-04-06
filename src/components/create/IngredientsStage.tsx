import { Ingredient } from '@prisma/client';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { genId, pickStyles as ps } from 'lib/util-client';
import InputWithPopover from 'components/common/InputWithPopover';
import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';
import HorizontalEllipsisIcon from 'components/common/icons/HorizontalEllipsisIcon';

function TipBox() {
  const [isTipOpen, setIsTipOpen] = useState(true);

  return (
    <div className="flex flex-col card-primary text-primary p-5 space-y-3">
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
      className="text-white text-sm bg-neutral-800 rounded flex items-center space-x-2 p-1 px-2"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <span>{sub}</span>
      {isMouseOver ? (
        <button onClick={() => onRemoveSub(sub)}>
          <XIcon styles={{ icon: 'w-4 h-4 text-red-500' }} />
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
  styles: {
    div: string;
  };
}

function AddSubstitutes({
  id,
  curSubs,
  onAddSub,
  onRemoveSub,
  styles,
}: AddSubstitutesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.div}>
      <div>
        <label className="text-sm block" htmlFor={`substitutes-${id}`}>
          Add substitutes
        </label>
        <div className="flex items-center space-x-1">
          <input
            ref={inputRef}
            type="text"
            className="w-36 inp-primary inp-sm"
            disabled={curSubs.length >= 3}
            placeholder={curSubs.length >= 3 ? 'limit reached' : ''}
          />

          <button
            type="button"
            className="btn-primary rounded-full"
            onClick={() => {
              if (!inputRef.current || inputRef.current.value === '') return;
              const newSub = inputRef.current.value;
              inputRef.current.value = '';
              onAddSub(newSub);
            }}
            disabled={curSubs.length >= 3}
          >
            <PlusIcon styles={{ icon: 'w-5 h-5 text-white' }} />
          </button>
        </div>
      </div>

      <div className="flex items-start space-x-2">
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
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-1">
          <input
            id={`optional-${id}`}
            type="checkbox"
            className="w-4 h-4 accent-neutral-800 cursor-pointer"
            checked={isOptional}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              raiseOptional(e.target.checked)
            }
          />
          <label
            className="text-sm btn-text-primary"
            htmlFor={`optional-${id}`}
          >
            Optional
          </label>
        </div>
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="w-fit text-sm btn-text-primary"
        >
          Remove
        </button>
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
      if (subExists || prev.length === 3) return prev;
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
      className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-primary w-full group"
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div className="font-mono text-sm row-start-2 col-start-1 w-6 flex items-center justify-end text-secondary group-hover:text-neutral-800 transition-colors">
        {order}
      </div>
      {order === 1 ? (
        <div className="row-start-1 col-start-2 flex items-center space-x-2 w-full text-sm text-secondary font-mono">
          <div className="w-72">Ingredient</div>
          <div className="w-36">Quantity</div>
          <div className="w-36">Units</div>
        </div>
      ) : null}
      <div className="w-full col-start-2 row-start-2">
        <div className="flex items-center space-x-2 rounded">
          <input className="w-72 inp-primary inp-reg" type="text" />
          <input
            className="w-36 inp-primary inp-reg"
            type="number"
            step="0.1"
            min="0"
          />
          <InputWithPopover
            styles={{
              div: 'w-36 inp-primary inp-reg',
            }}
          />

          <button
            type="button"
            onClick={() => setIsOptionsOpen((prev) => !prev)}
            className={'transition-all opacity-0 group-hover:opacity-100'}
          >
            <HorizontalEllipsisIcon
              styles={{
                icon: 'w-8 h-8 text-neutral-800',
              }}
            />
          </button>
        </div>
      </div>

      {isOptionsOpen ? (
        <OptionsMenu
          id={id}
          onRemove={onRemove}
          isOptional={isOptional}
          raiseOptional={setIsOptional}
          styles={{
            div: 'transition-all border bg-white border-neutral-300 row-start-3 col-start-2 rounded flex space-x-5 p-4 mt-1 h-40',
          }}
        >
          <AddSubstitutes
            id={id}
            curSubs={ingredientSubs}
            onAddSub={addSubsHandler}
            onRemoveSub={removeSubHandler}
            styles={{
              div: 'flex-col space-y-3 items-start border-l pl-5 border-neutral-300',
            }}
          />
        </OptionsMenu>
      ) : null}
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
      <div className="flex flex-col space-y-12 card-primary p-6">
        {children({ inputIds, removeInputHandler })}
        <button
          className="p-1 rounded btn-primary transition-all"
          onClick={() => setInputIds((prev: string[]) => [...prev, genId()])}
        >
          New Ingredient
        </button>
      </div>
    </>
  );
}

interface IngredientStageProps {
  ingredients: Ingredient[];
}

function IngredientsStage({ ingredients }: IngredientStageProps) {
  return (
    <div className="flex flex-col py-10 space-y-12 h-full">
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
