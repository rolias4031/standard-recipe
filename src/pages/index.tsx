import { GeneralButton } from 'pirate-ui';
import PageGuard from 'components/auth/PageGuard';
import NavBar from 'components/NavBar';
import { useState } from 'react';
import NewRecipeModal from 'components/CreateRecipe/NewRecipeModal';

export default function Home() {
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] =
    useState<boolean>(false);
  function closeModal() {
    setIsNewRecipeModalOpen(false);
  }
  return (
    <PageGuard redirectPath="/signin">
      {(session) => (
        <div className="mx-10">
          <NavBar
            styles={{ div: 'flex items-center border-b py-4' }}
            session={session}
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
              <NewRecipeModal user={session?.user} onCloseModal={closeModal} />
            ) : null}
          </div>
        </div>
      )}
    </PageGuard>
  );
}
