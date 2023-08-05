import { pickStyles } from 'lib/util-client';
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

import { Draggable } from '@hello-pangea/dnd';

interface OptionBarComponentProps {
  optionMode: OptionMode | null;
  setOptionMode: Dispatch<SetStateAction<OptionMode | null>>;
  optionModes: OptionMode[];
}

type OptionMode = 'substitutes' | 'notes' | 'none';

interface RecipeFlowInputProps {
  id: string;
  index: number;
  optionModes: OptionMode[];
  optionBarComponent: ({
    optionMode,
    setOptionMode,
    optionModes,
  }: OptionBarComponentProps) => ReactNode;
  overviewComponents: ReactNode;
  auxiliaryComponents: ReactNode;
  mainInputComponents: (
    isInputFocused: boolean,
    setIsInputFocused: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
  optionInputComponents?: (optionMode: OptionMode) => ReactNode;
}

function RecipeFlowInput({
  id,
  index,
  optionModes,
  auxiliaryComponents,
  mainInputComponents,
  optionBarComponent,
  optionInputComponents,
  overviewComponents,
}: RecipeFlowInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [optionMode, setOptionMode] = useState<OptionMode | null>(null);
  const [isMouseIn, setIsMouseIn] = useState(false);

  const optionButtons = optionModes.map((o) =>
    o !== 'none' ? (
      <button
        key={o}
        type="button"
        className={pickStyles('btn-sm btn-inverted', [
          optionMode === o,
          'bg-fern text-white',
        ])}
        onClick={() => setOptionMode(o)}
      >
        {o}
      </button>
    ) : null,
  );

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <div
          className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2"
        >
          <div className="flex space-x-2 md:w-3/4">
            <div className="flex items-center rounded bg-fern px-2 font-mono text-sm text-white">
              <span>{index + 1}</span>
            </div>
            <input type="text" className="w-full rounded bg-smoke px-2 py-1" />
          </div>
          <div className="flex space-x-2">
            <input type="number" className="w-1/3 rounded bg-smoke px-2 py-1" />
            <input type="number" className="w-2/3 rounded bg-smoke px-2 py-1" />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default RecipeFlowInput;
