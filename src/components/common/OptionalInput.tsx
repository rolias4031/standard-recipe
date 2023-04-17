import React from 'react';
import { UpdateRecipeInputHandlerArgs } from 'types/types';

interface OptionalInputProps {
  id: string;
  curIsOptional: boolean;
  onRaiseInput: ({id, name, value}: UpdateRecipeInputHandlerArgs) => void
}

function OptionalInput({id, curIsOptional, onRaiseInput}: OptionalInputProps) {
  return (
    <div className="flex items-center space-x-1">
      <input
        id={`optional-${id}`}
        name="optional"
        type="checkbox"
        className="w-4 h-4 accent-fern cursor-pointer"
        checked={curIsOptional}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onRaiseInput({
            id: id,
            name: e.target.name,
            value: e.target.checked,
          });
        }}
      />
      <label htmlFor={`optional-${id}`} className="text-xs cursor-pointer">
        Optional
      </label>
    </div>
  );
}

export default OptionalInput;
