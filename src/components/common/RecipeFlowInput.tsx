import {
  pickStyles,
} from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, {
  ReactNode,
  useState,
} from 'react';
import CogIcon from './icons/CogIcon';
import TrashIcon from './icons/TrashIcon';

type OptionMode = 'substitutes' | 'notes';

interface RecipeFlowInputProps<T> {
  id: string;
  order: number;
  onRemoveInput: (id: string) => void;
  optionModes: OptionMode[];
  optionalComponent: ReactNode;
  inputLabelComponents: ReactNode;
  inputComponents: ReactNode;
  optionInputComponents: (optionMode: OptionMode) => ReactNode;
}

function RecipeFlowInput<T extends { id: string }>({
  id,
  order,
  optionModes,
  onRemoveInput,
  optionalComponent,
  inputLabelComponents,
  inputComponents,
  optionInputComponents,
}: RecipeFlowInputProps<T>) {
  const [optionMode, setOptionMode] = useState<OptionMode | null>(null);
  const [isMouseIn, setIsMouseIn] = useState(false);

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
          {inputLabelComponents}
        </div>
      ) : null}
      <div className="w-full col-start-2 row-start-2 flex items-stretch space-x-2">
        {inputComponents}
        {isMouseIn || optionMode ? (
          <div key="1" className="flex flex-grow justify-between fade-in">
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
            <GeneralButton onClick={() => onRemoveInput(id)}>
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
            {/* {curOptional ? <div>optional</div> : null}
            {curSubs && curSubs.length > 0 ? <div>subs</div> : null}
            {curNotes.length > 0 ? <div>notes</div> : null} */}
          </div>
        )}
      </div>
      {optionMode !== null ? (
        <div className="flex flex-col space-y-2 row-start-3 col-start-2 fade-in">
          <div className="flex items-center space-x-3 text-sm mt-1">
            {optionModes.map((o) => (
              <button
                key={o}
                type="button"
                className={pickStyles('btn-sm btn-inverted', [
                  optionMode === o,
                  'text-white bg-fern',
                ])}
                onClick={() => setOptionMode(o)}
              >
                {o}
              </button>
            ))}
            {optionalComponent}
          </div>
          {optionInputComponents(optionMode)}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeFlowInput;
