import React, { useState } from 'react';
import { Recipe } from '@prisma/client';
import Link from 'next/link';
import VerticalEllipsisIcon from 'components/common/icons/VerticalEllipsisIcon';
import { useFixedDialog } from 'components/common/dialog/hooks';
import { useFilterAndSortRecipes, useMyRecipesFilterConfig } from './hooks';
import RecipeOptionMenu from './RecipeOptionMenu';
import SliderIcon from 'components/common/icons/SliderIcon';
import { pickStyles } from 'lib/util-client';
import ChevronDownIcon from 'components/common/icons/ChevronDownIcon';
import { capitalize } from 'lodash';
import { Url } from 'next/dist/shared/lib/router/router';
import { buildHomePageNavUrl } from './util';

interface MyRecipesViewProps {
  recipes: Recipe[];
}

export function MyRecipesView({ recipes }: MyRecipesViewProps) {
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false);
  const {
    filteredRecipes,
    recipeFilter,
    recipeSearchText,
    recipeSort,
    handleSelectRecipeFilter,
    handleSelectRecipeSort,
    handleUpdateSearchText,
  } = useFilterAndSortRecipes(recipes);

  const filterConfig = useMyRecipesFilterConfig(recipes);

  const recipeBlocks = filteredRecipes.map((r) => (
    <RecipeBlock key={r.id} recipe={r} />
  ));

  return (
    <>
      <div className="flex flex-col space-y-5 pb-28">
        <div className="sticky top-0 flex flex-col items-center space-y-5 bg-white p-5 shadow-md shadow-concrete">
          <div className="flex w-full items-center space-x-1 lg:w-2/3">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-lg border p-2 outline-fern lg:p-3 lg:text-lg"
              value={recipeSearchText}
              onChange={handleUpdateSearchText}
            />
            <button onClick={() => setIsFilterOptionsOpen((prev) => !prev)}>
              <SliderIcon
                styles={{
                  icon: pickStyles('w-10 h-10 md:w-12 md:h-12', [
                    isFilterOptionsOpen,
                    'text-fern',
                    'text-concrete',
                  ]),
                }}
              />
            </button>
          </div>
          {isFilterOptionsOpen ? (
            <div className="flex w-full flex-col space-y-3 lg:w-2/3">
              <div>
                <span className="font-mono text-concrete">Filter</span>
                <div className="flex items-center space-x-4 text-lg">
                  {filterConfig.map((config) => (
                    <FilterOptionPill
                      text={capitalize(config.filter)}
                      totalOptions={config.total}
                      key={config.filter}
                      onClick={handleSelectRecipeFilter(config.filter)}
                      isSelected={config.filter === recipeFilter}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="font-mono text-concrete">Sort</span>
                <div className="flex items-center space-x-4 text-lg">
                  <SortOptionPill
                    text="Created"
                    isSelected={recipeSort.method === 'createdAt'}
                    descending={!recipeSort.descending}
                    onClick={handleSelectRecipeSort('createdAt')}
                  />
                  <SortOptionPill
                    text="AZ"
                    isSelected={recipeSort.method === 'name'}
                    onClick={handleSelectRecipeSort('name')}
                    descending={recipeSort.descending}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full justify-start lg:w-2/3">
              <Link
                className="w-full lg:w-fit"
                href={buildHomePageNavUrl('create')}
                shallow
              >
                <button className="w-full rounded-full border border-fern px-3 py-2 font-mono text-fern">
                  Create New Recipe
                </button>
              </Link>
            </div>
          )}
        </div>
        <div className="mx-auto flex w-full flex-col space-y-3 px-5 lg:w-2/3">
          {recipeBlocks}
        </div>
      </div>
    </>
  );
}

function buildLinkHref(isDraftRecipe: boolean, recipeId: string): Url {
  const path = isDraftRecipe ? '/create/[recipeId]' : '/view/[recipeId]';
  return { pathname: path, query: { recipeId } };
}

interface RecipeLinkProps {
  recipe: Recipe;
}

function RecipeBlock({ recipe }: RecipeLinkProps) {
  const { isDialogOpen: isMenuOpen, handleToggleDialog: handleToggleMenu } =
    useFixedDialog();

  const date = new Date(recipe.createdAt);

  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-smoke px-3 py-2">
        <div className="flex flex-col">
          <Link
            className="text-xl lg:text-2xl"
            href={buildLinkHref(recipe.status === 'draft', recipe.id)}
          >
            {recipe.name}
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-concrete md:text-base">
              {date.toLocaleDateString()}
            </span>
            <span className="text-sm text-concrete md:text-base">
              {recipe.status}
            </span>
          </div>
        </div>
        <button onClick={handleToggleMenu()}>
          <VerticalEllipsisIcon
            styles={{
              icon: pickStyles('w-9 h-9', [
                isMenuOpen,
                'text-fern',
                'text-concrete',
              ]),
            }}
          />
        </button>
      </div>
      {isMenuOpen ? (
        <RecipeOptionMenu
          onCloseDialog={handleToggleMenu(false)}
          recipe={recipe}
        />
      ) : null}
    </>
  );
}

interface FilterOptionPillProps {
  text: string;
  totalOptions: number;
  isSelected?: boolean;
  onClick: () => void;
}

function FilterOptionPill({
  text,
  totalOptions,
  isSelected,
  onClick,
}: FilterOptionPillProps) {
  return (
    <button
      className={pickStyles(
        'flex items-center space-x-2 rounded-lg border px-2 py-0',
        [isSelected, 'border-fern text-fern'],
      )}
      onClick={onClick}
    >
      <span>{text}</span>
      <span className="">{totalOptions}</span>
    </button>
  );
}

interface SortOptionPillProps {
  text: string;
  descending: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function SortOptionPill({
  text,
  onClick,
  isSelected,
  descending,
}: SortOptionPillProps) {
  return (
    <button
      className={pickStyles(
        'flex items-center space-x-2 rounded-lg border pl-2 pr-1',
        [isSelected, 'border-fern text-fern'],
      )}
      onClick={onClick}
    >
      <span>{text}</span>
      <ChevronDownIcon
        styles={{
          icon: pickStyles('w-7 h-7', [
            !descending && isSelected,
            'rotate-180',
          ]),
        }}
      />
    </button>
  );
}
