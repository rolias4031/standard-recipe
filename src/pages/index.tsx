import { GeneralButton } from 'pirate-ui';
import NavBar from 'components/common/NavBar';
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
          <NavBar styles={{ div: 'flex items-center border-b py-4' }} />
          <div className="my-5">
            <GeneralButton
              onClick={() => setIsNewRecipeModalOpen(true)}
              styles={{
                button:
                  'btn-primary btn-reg',
              }}
            >
              New Recipe
            </GeneralButton>
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
