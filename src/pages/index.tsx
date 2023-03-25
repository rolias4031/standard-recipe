import { GeneralButton } from 'pirate-ui';
import NavBar from 'components/NavBar';
import { useState } from 'react';
import NewRecipeModal from 'components/home/NewRecipeModal';
import HomeDock from 'components/home/HomeDock';

export default function Home() {
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] =
    useState<boolean>(false);

  function closeModal() {
    setIsNewRecipeModalOpen(false);
  }

  return (
    <HomeDock>
      {(data) => (
        <div className="mx-10">
          <NavBar
            styles={{ div: 'flex items-center border-b py-4' }}
          />
          <div className="my-5">
            <GeneralButton
              name="newRecipe"
              id="create-new-recipe"
              onClick={() => setIsNewRecipeModalOpen(true)}
              styles={{
                button:
                  'bg-green-600 text-white text-lg px-2 py-1 rounded-sm hover:bg-green-700',
              }}
            />
            {isNewRecipeModalOpen ? (
              <NewRecipeModal
                recipeDraftNames={data.recipeDraftNames ?? []}
                onCloseModal={closeModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </HomeDock>
  );
}
