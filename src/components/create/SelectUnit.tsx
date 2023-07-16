import { IngredientUnit } from '@prisma/client';
import XIcon from 'components/common/icons/XIcon';
import ButtonWithPopover from 'components/common/popover/ButtonWithPopover';
import React, { useState } from 'react';

interface UnitOptionProps {
  name: string;
  onClick?: () => void;
}

function UnitOption({ name, onClick }: UnitOptionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-1 px-2 text-left transition-colors hover:bg-neutral-100"
    >
      {name}
    </button>
  );
}

interface SelectUnitProps {
  unitOptions: string[];
  curUnit: string | null;
  onSelectUnit: ({ value }: { value: string }) => void;
}

function SelectUnit({ curUnit, onSelectUnit, unitOptions }: SelectUnitProps) {
  const [searchText, setSearchText] = useState('');
  const filteredOptions =
    searchText.length > 0
      ? unitOptions.filter((o) =>
          o.toLowerCase().includes(searchText.toLowerCase()),
        )
      : unitOptions;
  const content = filteredOptions.map((u) => {
    return (
      <UnitOption key={u} name={u} onClick={() => onSelectUnit({ value: u })} />
    );
  });
  return (
    <ButtonWithPopover
      buttonText={curUnit ? curUnit : 'Select'}
      isDisabled={curUnit === null}
      styles={{
        button: {
          default:
            'inp-reg focus:outline-fern rounded w-36 flex disabled:text-concrete',
          isOpen: ['bg-fern text-white', 'bg-smoke'],
        },
      }}
    >
      <div>
        <div className="flex w-36 flex-col items-center rounded border border-fern bg-white text-sm shadow-md shadow-concrete">
          <div className="flex items-center border-fern bg-fern p-1">
            <input
              autoFocus
              placeholder="search"
              autoComplete="false"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              className="w-full appearance-none bg-transparent px-1 text-white placeholder-white outline-none"
            />
            <button name="clear">
              <XIcon styles={{ icon: 'w-4 h-4 text-white' }} />
            </button>
          </div>
          <div className="flex max-h-64 w-full flex-col items-center overflow-auto">
            {content.length === 0 ? (
              <UnitOption name={'No Matches'} />
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </ButtonWithPopover>
  );
}

export default SelectUnit;
