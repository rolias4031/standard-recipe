import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { badExampleRecipe } from './util';
import IngredientsView from 'components/view/IngredientsView';
import EquipmentView from 'components/view/EquipmentView';
import InstructionsView from 'components/view/InstructionsView';
import {
  RecipeViewProps,
  useGetOnlyInUseInputs,
} from 'components/view/RecipePreview';
import ExampleRecipeDock from './ExampleRecipeDock';

/*

0. sign up link top right

1. Standard Recipe catch phrase and description

1a. sign up or sign in link

2. before after of recipe. "go from this...". Live, clickable example of SR recipe

2a. sign up or sign in link
*/

function BadExampleRecipe() {
  const badIngredients = badExampleRecipe.ingredients.map((i) => {
    return <p key={i}>{i}</p>;
  });
  const badInstructions = badExampleRecipe.instructions.map((i, idx) => {
    return (
      <p key={i}>
        {idx + 1}. {i}
      </p>
    );
  });
  return (
    <div className="mx-auto flex flex-col gap-3">
      <p>Beef Wellington</p>
      Ingredients
      <div>{badIngredients}</div>
      Instructions
      <div> {badInstructions}</div>
    </div>
  );
}

function StandardRecipeExample({ recipe, allUnits }: RecipeViewProps) {
  const { inUseEquipment, inUseIngredients, inUseInstructions } =
    useGetOnlyInUseInputs(recipe);

  return (
    <div className="flex flex-col space-y-2 rounded-lg border border-indigo-500 p-5">
      <IngredientsView ingredients={inUseIngredients} allUnits={allUnits} />
      <EquipmentView equipment={inUseEquipment} />
      <InstructionsView
        instructions={inUseInstructions}
        equipment={inUseEquipment}
        ingredients={inUseIngredients}
        allUnits={allUnits}
      />
    </div>
  );
}

function RecipeExamplePanel() {
  return (
    <div className="mb-28 flex flex-col items-center">
      <div className="flex w-5/6 flex-col gap-5 lg:w-2/3 xl:w-1/2">
        <div className="text-center text-xl">
          Transform your hard-to-read, cumbersome, unhelpful recipes...
        </div>
        <div className="h-96 overflow-y-auto rounded-lg border p-5">
          <BadExampleRecipe />
        </div>
        <div className="text-center text-2xl font-bold text-indigo-500">
          {
            'Into easy-to-read recipe pages packed with smart features (try me!)'
          }
        </div>
        <ExampleRecipeDock>
          {(recipe, allUnits) => (
            <StandardRecipeExample recipe={recipe} allUnits={allUnits} />
          )}
        </ExampleRecipeDock>
      </div>
    </div>
  );
}

function Landing() {
  const { userId } = useAuth();
  const btnUrl = userId ? '/me' : '/signin';
  return (
    <div className="p-5">
      <div className="sticky top-2 flex justify-end">
        <Link
          href={btnUrl}
          className="rounded-lg bg-fern px-3 py-2 text-lg text-white shadow-md shadow-concrete"
        >
          {userId ? 'My Recipes' : 'Sign Up'}
        </Link>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col space-y-2 p-5 text-center">
          <h1 className="text-4xl text-fern">
            Standard Recipe{' '}
            <span className="font-mono text-concrete">Beta</span>
          </h1>
          <p className="text-lg text-concrete">
            The ultimate way to create, share, and use recipes online
          </p>
        </div>
        <RecipeExamplePanel />
      </div>
    </div>
  );
}

export default Landing;
