import { useRef, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createNewDraftRecipeMutation } from './mutations';
import { newDraftRecipeSchema } from 'validation/schemas';
import { fetchUserRecipes } from './queries';
import {
  BaseZodSchema,
  FormValidationState,
  NewDraftRecipeInputs,
} from 'types/types';
import { RaiseInputArgs } from 'pirate-ui';

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation });
};

export const useGetUserRecipes = () => {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes });
};

export const useNewRecipeModalForm = (existingDraftNames: string[]) => {
  type ValidationKeys = 'name';

  const { formValidation, validateSingleInput } =
    useFormValidation<ValidationKeys>(['name']);
  const [newDraftRecipeInputs, setNewDraftRecipeInputs] =
    useState<NewDraftRecipeInputs>({
      name: '',
    });

  const formSchema = newDraftRecipeSchema(existingDraftNames);

  function raiseRecipeValues(args: RaiseInputArgs) {
    validateSingleInput({
      name: args.name,
      schema: formSchema,
      input: args.input,
    });
    setNewDraftRecipeInputs((prevState: NewDraftRecipeInputs) => {
      return {
        ...prevState,
        [args.name]: args.input,
      };
    });
  }

  return { newDraftRecipeInputs, raiseRecipeValues, formValidation };
};

export function useFormValidation<T extends string>(keys: T[]) {
  // takes array of keys to init formValidation
  // return state containing validation and function to validate input

  function initFormValidation(keys: T[]): FormValidationState<T> {
    const initState = {} as FormValidationState<T>
    keys.forEach((key: T) => {
      initState[key] = {
        isInvalid: false,
        error: undefined,
      };
    });

    initState.form = { isInvalid: false, error: undefined }
    return initState;
  }

  const [formValidation, setFormValidation] = useState<FormValidationState<T>>(
    () => initFormValidation(keys),
  );

  function validateSingleInput({
    schema,
    name,
    input,
  }: {
    schema: BaseZodSchema;
    name: string;
    input: string;
  }) {
    const validation = schema.shape[name]?.safeParse(input);
    console.log(validation);
    setFormValidation((prevState: FormValidationState<T>) => {
      if (!validation) return prevState;
      const isInvalid = !validation.success;
      const error = !validation.success && validation.error;
      return {
        ...prevState,
        [name]: { isInvalid, error },
      };
    });
  }

  function validateAllInputs() {
    console.log('hi');

  }

  return { formValidation, validateSingleInput };
}

export const useAutoFocusOnElement = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return { inputRef };
};
