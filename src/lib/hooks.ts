import { useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query'
import { createNewDraftRecipeMutation } from './mutations';
import { fetchUserDraftNames } from './queries';

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation})
}

export const useGetUserDraftNames = () => {
  return useQuery({ queryKey: ['user', 'drafts'], queryFn: fetchUserDraftNames })
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
