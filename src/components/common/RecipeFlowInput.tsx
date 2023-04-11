import { pickStyles } from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';
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
}

function RecipeFlowInput({
  id,
  order,
  onRemove,
  columnLabelComponents,
  inputComponents,
}: RecipeFlowInputProps) {
  const [optionMode, setOptionMode] = useState<string | null>(null);
  const [isMouseIn, setIsMouseIn] = useState(false);

  const [isOptional, setIsOptional] = useState(false);
  const [subs, setSubs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  function addSubsHandler(newSub: string) {
    setSubs((prev: string[]) => {
      const subExists = prev.find((sub) => sub === newSub);
      if (subExists || prev.length === 3) return prev;
      return [...prev, newSub];
    });
  }

  function removeSubHandler(subToRemove: string) {
    setSubs((prev: string[]) => {
      const newSubs = [...prev].filter((s) => s !== subToRemove);
      return newSubs;
    });
  }

  return (
    <div
      id={id}
      className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-primary w-full group py-0"
      onMouseEnter={() => setIsMouseIn(true)}
      onMouseLeave={() => setIsMouseIn(false)}
    >
      <div className="font-mono text-sm row-start-2 col-start-1 w-6 flex items-center justify-end text-secondary group-hover:text-neutral-800 transition-colors">
        {order}
      </div>
      {order === 1 ? (
        <div className="row-start-1 col-start-2 flex items-center space-x-2 w-full text-sm text-secondary font-mono">
          {columnLabelComponents}
        </div>
      ) : null}
      <div className="w-full col-start-2 row-start-2 flex items-center space-x-2">
        {inputComponents}
        {isMouseIn || optionMode ? (
          <div key="1" className="flex flex-grow justify-between fade-in">
            <GeneralButton
              styles={{ button: '' }}
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
                    'text-secondary hover:text-neutral-800',
                    'text-primary',
                  ]),
                }}
              />
            </GeneralButton>
            <GeneralButton onClick={() => onRemove(id)}>
              <TrashIcon
                styles={{
                  icon: 'w-6 h-6 transition-colors text-secondary hover:text-red-500',
                }}
              />
            </GeneralButton>
          </div>
        ) : (
          <div
            key="2"
            className="flex items-center flex-grow justify-end space-x-4 text-xs text-neutral-400 fade-in"
          >
            {isOptional ? <div>optional</div> : null}
            {subs.length > 0 ? <div>subs</div> : null}
            {notes.length > 0 ? <div>notes</div> : null}
          </div>
        )}
      </div>
      {optionMode !== null ? (
        <div className="flex flex-col space-y-2 row-start-3 col-start-2 fade-in">
          <div className="flex items-center space-x-2 text-sm mt-1">
            <button
              className={pickStyles(
                'text-xs p-1 rounded transition-colors hover:bg-neutral-800 hover:text-white',
                [
                  optionMode === 'subs',
                  'text-white bg-neutral-800',
                  'text-neutral-800',
                ],
              )}
              onClick={() => setOptionMode('subs')}
            >
              Substitutes
            </button>
            <button
              className={pickStyles(
                'text-xs p-1 rounded transition-colors hover:bg-neutral-800 hover:text-white',
                [
                  optionMode === 'notes',
                  'text-white bg-neutral-800',
                  'text-neutral-800',
                ],
              )}
              onClick={() => setOptionMode('notes')}
            >
              Notes
            </button>
          </div>
          {optionMode === 'subs' ? (
            <AddSubstitutes
              id={id}
              curSubs={subs}
              onAddSub={addSubsHandler}
              onRemoveSub={removeSubHandler}
              styles={{
                div: 'flex space-x-4 items-center',
              }}
            />
          ) : null}
          {optionMode === 'notes' ? (
            <textarea
              className="p-3 inp-primary resize-none w-full placeholder-neutral-400 "
              placeholder="Put important details about your ingredients here. How ripe should the fruit be? What brands have you found work best? What mistakes should people avoid? Why do you like this ingredient?"
              value={notes}
              rows={5}
              autoFocus
              draggable={false}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeFlowInput;
