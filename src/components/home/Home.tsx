import React, { useMemo } from 'react';
import { UserRecipesQueryPayload } from 'types/types';
import { MyRecipesView } from './MyRecipesView';
import { SignOutButton, UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import NewRecipeDialog from './NewRecipeDialog';
import { buildHomePageNavUrl } from './util';

export type HomeView = 'recipes' | 'profile';

interface HomeProps {
  homeData: UserRecipesQueryPayload;
  view: HomeView;
}

function Home({ homeData, view }: HomeProps) {
  const { recipes } = homeData;
  const existingRecipeNames = useMemo(
    () => recipes.map((r) => r.name),
    [recipes],
  );

  const ViewConfig = {
    recipes: <MyRecipesView recipes={recipes} />,
    profile: (
      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full flex justify-center relative -z-10 py-5',
          },
        }}
      />
    ),
    create: <NewRecipeDialog existingRecipeNames={existingRecipeNames} />,
  };

  return (
    <>
      <NavBar view={view} />
      {ViewConfig[view]}
    </>
  );
}

interface NavBarProps {
  view: string;
}

function NavBar({ view }: NavBarProps) {
  return (
    <div className="sticky top-0 flex justify-center bg-fern py-3 px-5 text-lg text-white shadow-md shadow-concrete">
      <div className="flex w-full items-center justify-between space-x-3 lg:w-2/3">
        <Link href={buildHomePageNavUrl('recipes')} shallow>
          <button>My Recipes</button>
        </Link>
        <div className="flex space-x-5">
          <Link href={buildHomePageNavUrl('profile')} shallow>
            <button>Profile</button>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export default Home;
