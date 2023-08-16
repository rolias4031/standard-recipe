import React, { useMemo, useState } from 'react';
import { IngredientUnit, Recipe } from '@prisma/client';
import Link from 'next/link';
import VerticalEllipsisIcon from 'components/common/icons/VerticalEllipsisIcon';
import { useFixedDialog } from 'components/common/dialog/hooks';
import { useFilterAndSortRecipes, useMyRecipesFilterConfig } from './hooks';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import RecipeOptionDialog from './RecipeOptionDialog';
import SliderIcon from 'components/common/icons/SliderIcon';
import { pickStyles } from 'lib/util-client';
import ChevronDownIcon from 'components/common/icons/ChevronDownIcon';
import { capitalize } from 'lodash';
import PlusIcon from 'components/common/icons/PlusIcon';
import NewRecipeDialog from './NewRecipeDialog';

interface MyRecipesViewProps {
  recipes: Recipe[];
}

export function MyRecipesView({ recipes }: MyRecipesViewProps) {
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false);
  const [isNewRecipeDialogOpen, setIsNewRecipeDialogOpen] = useState(false);

  const existingRecipeNames = useMemo(
    () => recipes.map((r) => r.name),
    [recipes],
  );

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
      <div className="flex flex-col space-y-5 pb-28 md:space-y-6">
        <div className="sticky top-0 flex flex-col space-y-3 bg-white px-5 py-5 shadow-md shadow-concrete md:px-10">
          <div className="flex items-center space-x-1">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-lg border px-2 py-2"
              value={recipeSearchText}
              onChange={handleUpdateSearchText}
            />
            <button onClick={() => setIsFilterOptionsOpen((prev) => !prev)}>
              <SliderIcon
                styles={{
                  icon: pickStyles('w-10 h-10', [
                    isFilterOptionsOpen,
                    'text-fern',
                    'text-concrete',
                  ]),
                }}
              />
            </button>
          </div>
          {isFilterOptionsOpen ? (
            <div className="flex flex-col space-y-3">
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
          ) : null}
        </div>
        <div className="flex flex-col space-y-3 px-5 md:px-16">
          {recipeBlocks}
        </div>
        <div className="fixed bottom-5 right-0">
          <button
            className="flex items-center rounded-l-xl bg-fern px-4 py-3 opacity-90 shadow-md shadow-neutral-600 hover:opacity-100 active:opacity-100"
            onClick={() => setIsNewRecipeDialogOpen(true)}
          >
            <PlusIcon
              styles={{ icon: 'w-10 h-10 text-white md:w-12 md:h-12' }}
            />
          </button>
        </div>
      </div>
      {isNewRecipeDialogOpen ? (
        <NewRecipeDialog
          onCloseModal={() => setIsNewRecipeDialogOpen(false)}
          existingRecipeNames={existingRecipeNames}
        />
      ) : null}
    </>
  );
}

interface RecipeLinkProps {
  recipe: Recipe;
}

function RecipeBlock({ recipe }: RecipeLinkProps) {
  const { isDialogOpen, handleToggleDialog } = useFixedDialog();

  const date = new Date(recipe.createdAt);
  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-smoke px-3 py-2">
        <div className="flex flex-col">
          <Link
            className="text-xl"
            href={{
              pathname: '/view/[recipeId]',
              query: { recipeId: recipe.id },
            }}
          >
            {recipe.name}
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-concrete">
              {date.toLocaleDateString()}
            </span>
            <span className="text-sm text-concrete">{recipe.status}</span>
          </div>
        </div>
        <button onClick={handleToggleDialog(true)}>
          <VerticalEllipsisIcon styles={{ icon: 'w-8 h-8 text-concrete' }} />
        </button>
      </div>
      {isDialogOpen ? (
        <ModalBackdrop
          opacity="50"
          modalRoot="modal-root"
          onClose={handleToggleDialog(false)}
        >
          <RecipeOptionDialog recipe={recipe} />
        </ModalBackdrop>
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
