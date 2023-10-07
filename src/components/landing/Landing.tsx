import { SignInButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

/*

0. sign up link top right

1. Standard Recipe catch phrase and description

1a. sign up or sign in link

2. before after of recipe. "go from this...". Live, clickable example of SR recipe

2a. sign up or sign in link
*/

function ExampleRecipe() {
  return <div></div>;
}

function RecipeExamplePanel() {
  return <div></div>;
}

function Landing() {
  const { userId } = useAuth();
  const btnUrl = userId ? '/me' : '/signin';
  return (
    <div className="p-5">
      <div className="sticky top-0 flex justify-end backdrop-blur-sm">
        <Link
          href={btnUrl}
          className="rounded-lg bg-fern px-3 py-2 text-lg text-white shadow-md shadow-concrete"
        >
          {userId ? 'My Recipes' : 'Sign Up'}
        </Link>
      </div>
      <div className="flex flex-col space-y-2 p-5 text-center">
        <h1 className="text-4xl text-fern">
          Standard Recipe <span className="font-mono text-concrete">Beta</span>
        </h1>
        <p className="text-lg text-concrete">
          The ultimate way to create, share, and use recipes online
        </p>
      </div>
      <RecipeExamplePanel />
    </div>
  );
}

export default Landing;
