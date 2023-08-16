import { Recipe } from '@prisma/client';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';

export interface FilterConfig {
  filter: RecipeFilter;
  total: number;
}

export function useMyRecipesFilterConfig(recipes: Recipe[]): FilterConfig[] {
  return useMemo(() => {
    const published = recipes.filter((r) => r.status === 'published').length;
    const draft = recipes.filter((r) => r.status === 'draft').length;

    return [
      { filter: 'all', total: recipes.length },
      { filter: 'published', total: published },
      { filter: 'draft', total: draft },
    ];
  }, [recipes]);
}

export type RecipeFilter = 'published' | 'draft' | 'all';
export type SortMethod = 'name' | 'createdAt';
export interface RecipeSort {
  method: SortMethod;
  descending: boolean;
}

export function useFilterAndSortRecipes(recipes: Recipe[]) {
  const [recipeFilter, setRecipeFilter] = useState<RecipeFilter>('all');
  const [recipeSearchText, setRecipeSearchText] = useState('');
  const [recipeSort, setRecipeSort] = useState<RecipeSort>({
    method: 'createdAt',
    descending: false,
  });

  console.log(recipeSearchText);

  function handleSelectRecipeFilter(filter: RecipeFilter) {
    return () => setRecipeFilter(filter);
  }
  function handleUpdateSearchText(e: React.ChangeEvent<HTMLInputElement>) {
    return setRecipeSearchText(e.target.value);
  }

  function handleSelectRecipeSort(method: SortMethod) {
    return () =>
      setRecipeSort((prev: RecipeSort) => {
        if (prev.method === method) {
          return { ...prev, descending: !prev.descending };
        }
        return { method, descending: true };
      });
  }

  // apply filter
  let filteredRecipes = recipes.filter((r) => {
    if (recipeFilter === 'all') return true;
    return r.status === recipeFilter;
  });

  // apply search text
  filteredRecipes = filteredRecipes.filter((r) => {
    if (recipeSearchText.length === 0) return true;
    return r.name.toLowerCase().includes(recipeSearchText.toLowerCase());
  });

  // apply sort
  filteredRecipes = orderBy(filteredRecipes, recipeSort.method);

  filteredRecipes = !recipeSort.descending
    ? filteredRecipes.reverse()
    : filteredRecipes;

  return {
    filteredRecipes,
    recipeFilter,
    recipeSearchText,
    recipeSort,
    handleSelectRecipeFilter,
    handleUpdateSearchText,
    handleSelectRecipeSort,
  };
}
