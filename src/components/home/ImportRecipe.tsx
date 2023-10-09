import ButtonWithDialog from 'components/common/dialog/ButtonWithDialog';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import React, { Dispatch, SetStateAction } from 'react';

interface ImportRecipeDialogProps {
  recipeImportText: string;
  raiseRecipeImportText: Dispatch<SetStateAction<string>>;
  onImportRecipe: () => void;
  canStartImport: boolean;
  onGoBack: () => void;
}

function ImportRecipe({
  recipeImportText,
  raiseRecipeImportText,
  onImportRecipe,
  canStartImport,
  onGoBack
}: ImportRecipeDialogProps) {
  return (
    <div className="flex flex-col space-y-4">
      <button className='w-fit' onClick={onGoBack}>
        <ArrowLeftIcon styles={{ icon: 'w-9 h-9 text-concrete' }} />
      </button>
      <div className="text-center">
        <h1 className="font-mono text-xl md:text-2xl">Import with AI</h1>
      </div>
      <div className="flex flex-col space-y-2 text-center">
        <span>
          {
            'Copy and paste your recipe below. AI will break it up into three sections: ingredients, equipment, and instructions.'
          }
        </span>
      </div>
      <div className="flex flex-col space-y-4">
        <textarea
          onChange={(e) => raiseRecipeImportText(e.currentTarget.value)}
          value={recipeImportText}
          className="resize-none appearance-none rounded-lg bg-smoke p-3 outline-2 outline-indigo-500"
          rows={15}
          placeholder="Tips: the cleaner the text, the better. Avoid pasting text that isn't part of the recipe. Fix typos, punctuation, and grammar mistakes. "
        />
        <div className="flex justify-between">
          <button
            className="rounded-lg bg-concrete p-4 font-mono text-white"
            onClick={() => raiseRecipeImportText('')}
          >
            clear
          </button>
          <div>
            <ButtonWithDialog
              isDisabled={!canStartImport}
              styles={{
                button: {
                  default:
                    'rounded-lg bg-indigo-500 p-4 font-mono text-white disabled:cursor-not-allowed disabled:bg-concrete',
                },
              }}
              buttonContent={'import'}
              dialogComponent={(toggleDialog) => (
                <div className="fixed left-3 right-3 rounded-2xl bg-white p-5 md:left-1/4 md:right-1/4 md:p-10">
                  <div className="flex flex-col space-y-4">
                    <h1 className="text-center font-mono text-lg text-concrete">
                      Before importing...
                    </h1>
                    <p>
                      {
                        "Check your recipe text for spelling, grammar, and structure. If you can't read it, neither can the AI"
                      }
                    </p>
                    <button
                      className="w-full rounded-lg border border-concrete p-3"
                      onClick={toggleDialog(false)}
                    >
                      Continue editing
                    </button>
                    <button
                      className="w-full rounded-lg bg-indigo-500 p-3 text-white"
                      onClick={() => {
                        onImportRecipe();
                        toggleDialog(false);
                      }}
                    >
                      All done, import!
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportRecipe;
