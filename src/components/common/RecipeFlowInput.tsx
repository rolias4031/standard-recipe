import {
  findIngredientIndexById,
  insertIntoPrevArray,
  pickStyles,
} from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { IngredientWithAllModName } from 'types/models';
import { UpdateIngredientHandlerArgs } from 'types/types';
import CogIcon from './icons/CogIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import XIcon from './icons/XIcon';

interface SubTagProps {
  sub: string;
  onRemoveSub: (subToRemove: string) => void;
}

function SubTag({ sub, onRemoveSub }: SubTagProps) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  return (
    <div
      key={sub}
      className="text-abyss text-sm border border-abyss rounded-full flex items-center space-x-2 py-1 px-2"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <span>{sub}</span>
      {isMouseOver ? (
        <button onClick={() => onRemoveSub(sub)}>
          <XIcon styles={{ icon: 'w-4 h-4 text-fern' }} />
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
      <div className="flex items-center space-x-1">
        <input
          ref={inputRef}
          type="text"
          className="w-48 inp-primary inp-reg"
          disabled={curSubs.length >= 3}
          placeholder={
            curSubs.length >= 3 ? 'limit reached' : 'Add Substitutes'
          }
          autoFocus
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
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
        </button>
      </div>

      <div className="flex items-start space-x-2">
        {curSubs.map((s) => (
          <SubTag key={s} sub={s} onRemoveSub={onRemoveSub} />
        ))}
      </div>
    </div>
  );
}

interface RecipeFlowInputProps {
  id: string;
  order: number;
  onRemove: (id: string) => void;
  columnLabelComponents: ReactNode;
  inputComponents: ReactNode;
  onRaiseInput: ({
    ingredientId,
    inputName,
    inputValue,
  }: UpdateIngredientHandlerArgs) => void;
  raiseIngredients: Dispatch<SetStateAction<IngredientWithAllModName[]>>;
  curSubs: string[];
  curNotes: string;
  curOptional: boolean;
}

function RecipeFlowInput({
  id,
  order,
  onRemove,
  columnLabelComponents,
  inputComponents,
  raiseIngredients,
  onRaiseInput,
  curSubs,
  curNotes,
  curOptional,
}: RecipeFlowInputProps) {
  const [optionMode, setOptionMode] = useState<string | null>(null);
  const [isMouseIn, setIsMouseIn] = useState(false);

  function addSubsHandler(newSub: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findIngredientIndexById(prev, id);
      if (index === -1) return prev;
      const prevSubs = prev[index]?.substitutes;
      if (!Array.isArray(prevSubs)) return prev;
      const subExists = prevSubs.find((sub) => sub === newSub);
      if (subExists || prev.length === 3) return prev;
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

  function removeSubHandler(subToRemove: string) {
    raiseIngredients((prev: IngredientWithAllModName[]) => {
      const index = findIngredientIndexById(prev, id);
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

  return (
    <div
      id={id}
      className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 w-full group py-0"
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div className="font-mono text-sm row-start-2 col-start-1 w-6 flex items-center justify-end text-concrete transition-colors group-hover:text-abyss">
        {order}
      </div>
      {order === 1 ? (
        <div className="row-start-1 col-start-2 flex items-center space-x-2 w-full text-sm font-mono">
          {columnLabelComponents}
        </div>
      ) : null}
      <div className="w-full col-start-2 row-start-2 flex items-stretch space-x-2">
        {inputComponents}
        {isMouseIn || optionMode ? (
          <div key="1" className="flex flex-grow justify-between fade-in">
            <GeneralButton
              onClick={() =>
                setOptionMode((prev: string | null) =>
                  prev === null ? 'subs' : null,
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
            <GeneralButton onClick={() => onRemove(id)}>
              <TrashIcon
                styles={{
                  icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                }}
              />
            </GeneralButton>
          </div>
        ) : (
          <div
            key="2"
            className="flex items-center flex-grow justify-end space-x-4 text-xs text-concrete fade-in"
          >
            {curOptional ? <div>optional</div> : null}
            {curSubs.length > 0 ? <div>subs</div> : null}
            {curNotes.length > 0 ? <div>notes</div> : null}
          </div>
        )}
      </div>
      {optionMode !== null ? (
        <div className="flex flex-col space-y-2 row-start-3 col-start-2 fade-in">
          <div className="flex items-center space-x-3 text-sm mt-1">
            <button
              type="button"
              className={pickStyles('btn-sm btn-inverted', [
                optionMode === 'subs',
                'text-white bg-fern',
              ])}
              onClick={() => setOptionMode('subs')}
            >
              Substitutes
            </button>
            <button
              type="button"
              className={pickStyles('btn-sm btn-inverted', [
                optionMode === 'notes',
                'text-white bg-fern',
              ])}
              onClick={() => setOptionMode('notes')}
            >
              Notes
            </button>
            <div className="flex items-center space-x-1">
              <input
                id={`optional-${id}`}
                name="optional"
                type="checkbox"
                className="w-4 h-4 accent-fern cursor-pointer"
                checked={curOptional}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onRaiseInput({
                    ingredientId: id,
                    inputName: e.target.name,
                    inputValue: e.target.checked,
                  });
                }}
              />
              <label
                htmlFor={`optional-${id}`}
                className="text-xs cursor-pointer"
              >
                Optional
              </label>
            </div>
          </div>
          {optionMode === 'subs' ? (
            <AddSubstitutes
              id={id}
              curSubs={curSubs}
              onAddSub={addSubsHandler}
              onRemoveSub={removeSubHandler}
              styles={{
                div: 'flex space-x-4 items-center',
              }}
            />
          ) : null}
          {optionMode === 'notes' ? (
            <textarea
              name="notes"
              className="p-3 inp-primary resize-none w-full placeholder-concrete"
              placeholder="Put important details about your ingredients here. How ripe should the fruit be? What brands have you found work best? What mistakes should people avoid? Why do you like this ingredient?"
              value={curNotes}
              rows={5}
              autoFocus
              draggable={false}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onRaiseInput({
                  ingredientId: id,
                  inputName: e.target.name,
                  inputValue: e.target.value,
                });
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeFlowInput;
