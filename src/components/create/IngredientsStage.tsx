import { Ingredient } from '@prisma/client';
import React, {
  ReactElement,
  SetStateAction,
  useState,
} from 'react';
import { genId } from 'lib/util-client';
import InputWithPopover from 'components/common/InputWithPopover';
import TrashIcon from 'components/common/icons/TrashIcon';

function TipBox({
  isTipOpen,
  onToggle,
}: {
  isTipOpen: boolean;
  onToggle: React.Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col bg-gray-50 text-gray-500 p-3 rounded-lg text-sm my-5 space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Tips</p>
        <button
          onClick={() => onToggle((prev) => !prev)}
          type="button"
          className="hover:text-black"
        >
          {isTipOpen ? 'hide' : 'show'}
        </button>
      </div>
      {isTipOpen ? (
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-2">
            <p>
              {
                'Name your ingredients as simply as possible—only include what the recipe depends on'
              }
            </p>
            <div className="ml-10 flex flex-col space-y-1">
              <span>
                <s>organic, all-natural,</s>
                <span className="text-green-600"> sliced fuji apples</span>
              </span>
              <span>
                <s>Whole Foods</s>
                <span className="text-green-600"> olive oil</span>
              </span>
              <span>
                <s>grass-fed</s>
                <span className="text-green-600"> 85% ground beef</span>
              </span>
            </div>
          </div>
          <p>
            {
              "Ingredients get sorted automatically, so don't worry about the order"
            }
          </p>
          <p>
            {
              "Start typing an ingredient name for autocomplete. If it's not there, that means you're the first to type it!"
            }
          </p>
          <p>{'Substitutes have their own section'}</p>
        </div>
      ) : null}
    </div>
  );
}

interface IngredientInputProps {
  id: string;
  onRemove: () => void;
}

function IngredientInput({ id, onRemove }: IngredientInputProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMouseIn, setIsMouseIn] = useState(false);

  return (
    <div
      id={id}
      className="flex flex-col space-y-2"
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div className="flex space-x-3">
        <input
          className="border focus:border-gray-800 outline-none p-1 px-2 rounded"
          type="text"
        />
        <input
          className="w-28 border focus:border-gray-800 outline-none p-1 px-2 rounded"
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
        <div className="border border-gray-800 rounded flex flex-col p-2">
          <button onClick={onRemove}>
            <TrashIcon styles={{ icon: 'w-5 h-5 text-black' }} />
          </button>
          <div>
            <input id={`optional-${id}`} type="checkbox" />
            <label htmlFor={`optional-${id}`}>optional</label>
          </div>
          <div>
            <label htmlFor={`substitutes-${id}`}>Add Substitutes</label>
            <input type="text" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface IngredientStageProps {
  ingredients: Ingredient[];
}

function IngredientsStage({ ingredients }: IngredientStageProps) {
  function newIngredientInput(id: string): ReactElement<IngredientInputProps> {
    return (
      <IngredientInput
        key={id}
        id={id}
        onRemove={() => modFormsHandler(id, 'subtract')}
      />
    );
  }
  const [isTipOpen, setIsTipOpen] = useState(true);
  const [ingredientInputs, setIngredientInputs] = useState<
    ReactElement<IngredientInputProps>[]
  >(() => [newIngredientInput('firstId')]);

  function modFormsHandler(inputId: string, op: 'add' | 'subtract'): void {
    setIngredientInputs((prev: ReactElement<IngredientInputProps>[]) => {
      let newInputs = [...prev];
      if (op === 'add') {
        newInputs = [...prev, newIngredientInput(genId())];
      } else if (op === 'subtract' && prev.length > 1) {
        const deleteThis = prev.find((input) => input.props.id === inputId);
        if (deleteThis) {
          newInputs.splice(prev.indexOf(deleteThis), 1);
        }
      } else if (op === 'subtract' && prev.length === 1) {
        newInputs = [newIngredientInput(genId())];
      }
      return newInputs;
    });
  }
  return (
    <div className="m-10 flex flex-col space-y-10">
      <TipBox isTipOpen={isTipOpen} onToggle={setIsTipOpen} />
      {ingredientInputs}
      <button
        onClick={() =>
          setIngredientInputs((prev: ReactElement<IngredientInputProps>[]) => [
            ...prev,
            newIngredientInput(genId()),
          ])
        }
      >
        add
      </button>
    </div>
  );
}

export default IngredientsStage;
