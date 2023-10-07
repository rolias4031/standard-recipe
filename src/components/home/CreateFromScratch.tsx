import React, { ReactNode } from 'react';
import { ZodIssue } from 'zod';

interface CreateFromScratchProps {
  newRecipeName: string;
  onUpdateRecipeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputValidationErrors: ZodIssue[]
  isNameValid: boolean
  modeButtons: ReactNode
}

function CreateFromScratch({newRecipeName, onUpdateRecipeName, inputValidationErrors, isNameValid, modeButtons}: CreateFromScratchProps) {
  return (
    <>
      <div className="text-center">
        <span className="font-mono text-xl md:text-2xl">Create new recipe</span>
      </div>
      <div className="my-6 flex w-full flex-col justify-end">
        <input
          type="text"
          className="border-b-2 border-fern py-2 text-lg outline-none md:text-xl"
          value={newRecipeName}
          onChange={onUpdateRecipeName}
          placeholder="Your Recipe Name"
        />
      </div>
      <div className="mb-6 flex flex-col items-center justify-center font-mono text-red-500">
        {inputValidationErrors.length === 0
          ? null
          : inputValidationErrors.map((e) => e.message)}
      </div>
      {modeButtons}
    </>
  );
}

export default CreateFromScratch;
