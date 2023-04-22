import CogIcon from 'components/common/icons/CogIcon';
import TrashIcon from 'components/common/icons/TrashIcon';
import { pickStyles } from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

type OptionMode = 'substitutes' | 'notes';

interface RecipeFlowInstructionInputProps {
  id: string;
  order: number;
  onRemoveInput: (id: string) => void;
  optionalComponent: ReactNode;
  inputLabelComponents: ReactNode;
  inputComponents: (
    isFocused: boolean,
    setFocused: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
  optionInputComponents?: (optionMode: OptionMode) => ReactNode;
}

function RecipeFlowInstructionInput({
  id,
  order,
  onRemoveInput,
  optionalComponent,
  inputLabelComponents,
  inputComponents,
  optionInputComponents,
}: RecipeFlowInstructionInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
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
        {isMouseIn ? (
          <div key="1" className="flex flex-col flex-grow justify-between items-end fade-in">
            {optionalComponent}
            <GeneralButton onClick={() => onRemoveInput(id)}>
              <TrashIcon
                styles={{
                  icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                }}
              />
            </GeneralButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeFlowInstructionInput;
