import React, { Dispatch, SetStateAction } from 'react';
import StageFrame from './StageFrame';
import { Instruction } from '@prisma/client';
import RecipeFlowInput from 'components/common/RecipeFlowInput';
import {
  findRecipeInputIndexById,
  genInstruction,
  insertIntoPrevArray,
  pickStyles,
} from 'lib/util-client';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import { GeneralButton } from 'pirate-ui';
import OptionalInput from 'components/common/OptionalInput';
import TrashIcon from 'components/common/icons/TrashIcon';
import CogIcon from 'components/common/icons/CogIcon';

interface InstructionsStageProps {
  instructions: Instruction[];
  raiseInstructions: Dispatch<SetStateAction<Instruction[]>>;
}

function InstructionsStage({
  instructions,
  raiseInstructions,
}: InstructionsStageProps) {
  function removeInstructionHandler(id: string) {
    raiseInstructions((prev: Instruction[]) => {
      if (prev.length === 1) return [genInstruction()];
      const newInstructions = prev.filter((i) => i.id !== id);
      return newInstructions;
    });
  }

  function updateInstructionHandler({
    id,
    name,
    value,
  }: UpdateRecipeInputHandlerArgs) {
    raiseInstructions((prev: Instruction[]) => {
      const index = findRecipeInputIndexById(prev, id);
      if (index === -1) return prev;
      const updatedInstruction = {
        ...prev[index],
        [name]: value,
      };
      const newInstructionArray = insertIntoPrevArray(
        prev,
        index,
        updatedInstruction,
      );
      return newInstructionArray as Instruction[];
    });
  }

  return (
    <StageFrame
      inputComponents={instructions.map((i, idx) => (
        <RecipeFlowInput
          key={i.id}
          id={i.id}
          order={idx + 1}
          optionModes={['none']}
          optionOverviewComponents={
            <>{i.optional ? <span>optional</span> : null}</>
          }
          inputLabelComponents={
            <>
              <div className="w-full">Instruction</div>
            </>
          }
          inputComponents={(isInputFocused, setIsInputFocused) => (
            <>
              {isInputFocused ? (
                <textarea
                  autoFocus
                  name="description"
                  value={i.description}
                  className="inp-primary inp-reg resize-none w-5/6"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    updateInstructionHandler({
                      id: i.id,
                      name: e.target.name,
                      value: e.target.value,
                    });
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  rows={4}
                />
              ) : (
                <div
                  className="h-20 rounded-sm w-5/6 bg-smoke"
                  onClick={() => setIsInputFocused(true)}
                >
                  {i.description}
                </div>
              )}
            </>
          )}
          optionalComponent={
            <OptionalInput
              id={i.id}
              curIsOptional={i.optional}
              onRaiseInput={updateInstructionHandler}
            />
          }
          optionBarComponent={({ optionMode, setOptionMode, optionModes }) => (
            <div
              key="1"
              className="flex flex-grow justify-between items-center fade-in"
            >
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
              <GeneralButton onClick={() => removeInstructionHandler(i.id)}>
                <TrashIcon
                  styles={{
                    icon: 'w-6 h-6 transition-colors text-concrete hover:text-red-500',
                  }}
                />
              </GeneralButton>
            </div>
          )}
        />
      ))}
    />
  );
}

export default InstructionsStage;
