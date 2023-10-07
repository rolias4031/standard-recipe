import XIcon from 'components/common/icons/XIcon';
import React from 'react';

function hasFailedImport(input?: string) {
  return input ? parseInt(input) > 0 : false;
}

interface FailedImportsModalProps {
  failedImports: string[];
  onToggleDialog: () => void;
}

function FailedImportsModal({
  failedImports,
  onToggleDialog,
}: FailedImportsModalProps) {
  const [ingredients, equipment, instructions] = failedImports;

  return (
    <div className="mx-3 flex w-full flex-col items-center space-y-4 rounded-xl bg-white p-5 md:w-1/2 md:p-10">
      <div className="text-center font-mono text-xl font-bold text-indigo-500">
        Import Success
      </div>
      <div className="text-center">
        {
          "However, some imports didn't make it. Revisit these sections before publishing."
        }
      </div>
      <div className="flex w-full flex-col space-y-2 font-mono text-lg">
        {hasFailedImport(ingredients) ? (
          <div className="flex justify-between">
            <span>Ingredients</span>
            <span>{ingredients} failed</span>
          </div>
        ) : null}
        {hasFailedImport(equipment) ? (
          <div className="flex justify-between">
            <span>Equipment</span>
            <span>{equipment} failed</span>
          </div>
        ) : null}
        {hasFailedImport(instructions) ? (
          <div className="flex justify-between">
            <span>Instructions</span>
            <span>{instructions} failed</span>
          </div>
        ) : null}
      </div>
      <button
        className="float-right font-mono text-concrete"
        onClick={onToggleDialog}
      >
        close
      </button>
    </div>
  );
}

export default FailedImportsModal;
