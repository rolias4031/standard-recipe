import { IngredientUnit } from '@prisma/client';
import ButtonWithDialog from 'components/common/dialog/ButtonWithDialog';
import XIcon from 'components/common/icons/XIcon';
import { pickStyles } from 'lib/util-client';
import React, { useState } from 'react';

interface UnitOptionProps {
  name: string;
  abbreviation: string;
  onClick?: () => void;
  isCurUnit: boolean;
}

function UnitOption({
  name,
  abbreviation,
  onClick,
  isCurUnit,
}: UnitOptionProps) {
  return (
    <button
      onClick={onClick}
      className={pickStyles(
        'flex w-full space-x-2 rounded py-2 px-2 text-left transition-colors hover:bg-smoke active:bg-smoke',
        [isCurUnit, 'bg-smoke'],
      )}
    >
      <span>{name}</span>
      {abbreviation ? <span>{`(${abbreviation})`}</span> : null}
    </button>
  );
}

interface SelectUnitProps {
  unitOptions: IngredientUnit[];
  curUnit: string | null;
  onSelectUnit: ({ value }: { value: string }) => void;
  ingredientName: string;
  isDisabled?: boolean;
  idForDialogParam: string;
}

function SelectUnit({
  curUnit,
  onSelectUnit,
  unitOptions,
  ingredientName,
  isDisabled,
  idForDialogParam
}: SelectUnitProps) {
  const [searchText, setSearchText] = useState('');
  const filteredOptions =
    searchText.length > 0
      ? unitOptions.filter(
          (u) =>
            u.unit.toLowerCase().includes(searchText.toLowerCase()) ||
            u.abbreviation.toLowerCase().includes(searchText.toLowerCase()),
        )
      : unitOptions;
  return (
    <ButtonWithDialog
      dialogParamName={`${idForDialogParam}-unit`}
      isDisabled={isDisabled}
      buttonContent={curUnit ? curUnit : 'No Unit'}
      styles={{
        button: {
          default:
            'px-2 py-1 focus:outline-fern rounded w-1/2 disabled:text-concrete',
          isDialogOpen: ['bg-fern text-white', 'bg-smoke'],
        },
      }}
      dialogComponent={(handleToggleDialog) => (
        <div
          className="fixed bottom-0 top-0 left-1/3 right-0 flex flex-col space-y-2 rounded-l-2xl bg-white p-5 text-lg md:left-1/2 md:p-10"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          <div className="font-mono text-xl text-concrete">
            {ingredientName}
          </div>
          <div className="flex items-center border-b-2 border-fern py-2">
            <input
              autoFocus
              placeholder="Search"
              autoComplete="false"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              className="w-full appearance-none bg-transparent outline-none"
            />
            <button name="clear" onClick={() => setSearchText('')}>
              <XIcon styles={{ icon: 'w-6 h-6' }} />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-auto">
            {filteredOptions.map((u) => (
              <UnitOption
                isCurUnit={u.unit === curUnit}
                name={u.unit}
                abbreviation={u.abbreviation}
                key={u.id}
                onClick={() => {
                  onSelectUnit({ value: u.unit });
                  handleToggleDialog(false)();
                }}
              />
            ))}
          </div>
        </div>
      )}
    />
  );
}

export default SelectUnit;
