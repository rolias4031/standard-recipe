import { ModalBackdrop } from 'pirate-ui';
import React, { useState } from 'react';
import { SessionUser } from 'types/types';

interface NewRecipeModalProps {
  user?: SessionUser | undefined;
}

function NewRecipeModal({ user }: NewRecipeModalProps) {
  const [newRecipeName, setNewRecipeName] = useState<string>('');
  return (
    <ModalBackdrop>
      <div className="bg-white rounded-sm p-5 w-3/4 h-5/6 flex flex-col">
        <p className="text-center text-gray-800 text-xl">
          First, name your new recipe.
          <br />
          This name must be unique among all your other recipes.
        </p>
        <div className="w-full my-auto">
          <input
            type="text"
            className="input-display block w-full"
            placeholder="Name your recipe"
            value={newRecipeName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRecipeName(e.target.value)
            }
          />
          <button
            className="text-md text-white rounded-sm bg-green-600 hover:bg-green-800 py-2 w-full"
            type="button"
            onClick={() => {}}
          >
            Get Cookin
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

export default NewRecipeModal;
