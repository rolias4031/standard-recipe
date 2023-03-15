import { useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query'
import { createNewDraftRecipeMutation } from './mutations';
import { fetchUserRecipes } from './queries';

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation})
}

export const useGetUserRecipes = () => {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes })
}

export const useAutoFocusOnElement = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return { inputRef }
};
