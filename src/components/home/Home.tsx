import React from 'react';
import { UserRecipesQueryPayload } from 'types/types';
import { MyRecipesView } from './MyRecipesView';
import { UserButton, UserProfile } from '@clerk/nextjs';
import Link from 'next/link';

export type HomeView = 'recipes' | 'profile';

interface HomeProps {
  homeData: UserRecipesQueryPayload;
  view: HomeView;
}

function Home({ homeData, view }: HomeProps) {
  const { recipes } = homeData;

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
  };

  return (
    <>
      <NavBar view={view} />
      {ViewConfig[view]}
      <div className="w-screen"></div>
    </>
  );
}

interface NavBarProps {
  view: string;
}

function NavBar({ view }: NavBarProps) {
  return (
    <div className="sticky top-0">
      <div className="flex items-center justify-between space-x-3 bg-fern py-3 px-5 text-lg text-white shadow-md shadow-concrete md:px-10">
        <Link
          href={{
            pathname: '/me',
            query: { view: 'recipes' },
          }}
        >
          <button>My Recipes</button>
        </Link>
        <Link
          href={{
            pathname: '/me',
            query: { view: 'profile' },
          }}
        >
          <button>Profile</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
