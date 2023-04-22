import { pickStyles } from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import CogIcon from './icons/CogIcon';
import TrashIcon from './icons/TrashIcon';

interface OptionBarComponentProps {
  optionMode: OptionMode | null;
  setOptionMode: Dispatch<SetStateAction<OptionMode | null>>;
  optionModes: OptionMode[];
}

type OptionMode = 'substitutes' | 'notes' | 'none';

interface RecipeFlowInputProps {
  id: string;
  order: number;
  optionModes: OptionMode[];
  optionBarComponent: ({
    optionMode,
    setOptionMode,
    optionModes,
  }: OptionBarComponentProps) => ReactNode;
  optionOverviewComponents: ReactNode;
  optionalComponent: ReactNode;
  inputLabelComponents: ReactNode;
  inputComponents: (
    isInputFocused: boolean,
    setIsInputFocused: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
  optionInputComponents?: (optionMode: OptionMode) => ReactNode;
}

function RecipeFlowInput({
  id,
  order,
  optionModes,
  optionalComponent,
  inputLabelComponents,
  inputComponents,
  optionBarComponent,
  optionInputComponents,
  optionOverviewComponents,
}: RecipeFlowInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
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
        {inputComponents(isInputFocused, setIsInputFocused)}
        {isMouseIn || optionMode ? (
          <>{optionBarComponent({ optionMode, setOptionMode, optionModes })}</>
        ) : (
          <div
            key="2"
            className="flex items-center flex-grow justify-end space-x-4 text-xs text-concrete fade-in"
          >
            {optionOverviewComponents}
          </div>
        )}
      </div>
      {optionMode !== null ? (
        <div className="flex flex-col space-y-2 row-start-3 col-start-2 fade-in">
          <div className="flex items-center space-x-3 text-sm mt-1">
            {optionModes.map((o) =>
              o !== 'none' ? (
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
              ) : null,
            )}
            {optionalComponent}
          </div>
          {optionInputComponents ? optionInputComponents(optionMode) : null}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeFlowInput;
