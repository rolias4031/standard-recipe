import { pickStyles } from 'lib/util-client';
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import FlowInputFrame from 'components/create/FlowInputFrame';

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
  optionOverviewComponents: ReactNode;
  optionalComponent: ReactNode;
  inputComponents: (
    isInputFocused: boolean,
    setIsInputFocused: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
  optionInputComponents?: (optionMode: OptionMode) => ReactNode;
}

function RecipeFlowInput({
  id,
  index,
  optionModes,
  optionalComponent,
  inputComponents,
  optionBarComponent,
  optionInputComponents,
  optionOverviewComponents,
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
          'text-white bg-fern',
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
        <FlowInputFrame
          draggableProps={provided.draggableProps}
          dragHandleProps={provided.dragHandleProps}
          innerRef={provided.innerRef}
          raiseIsMouseIn={setIsMouseIn}
          row1col1={index + 1}
          row1col2={
            <>
              {inputComponents(isInputFocused, setIsInputFocused)}
              {isMouseIn || optionMode ? (
                optionBarComponent({
                  optionMode,
                  setOptionMode,
                  optionModes,
                })
              ) : (
                <div
                  key="2"
                  className="flex items-center flex-grow justify-end space-x-4 text-xs text-concrete fade-in"
                >
                  {optionOverviewComponents}
                </div>
              )}
            </>
          }
          row2col2={
            optionMode !== null ? (
              <>
                {optionButtons}
                {optionalComponent}
              </>
            ) : null
          }
          row3col2={
            optionInputComponents && optionMode
              ? optionInputComponents(optionMode)
              : null
          }
        />
      )}
    </Draggable>
  );
}

export default RecipeFlowInput;
