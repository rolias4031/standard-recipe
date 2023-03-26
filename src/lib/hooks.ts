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
import { ZodError } from 'zod';

export const useCreateNewDraftRecipe = () => {
  return useMutation({ mutationFn: createNewDraftRecipeMutation });
};

export const useGetUserRecipes = () => {
  return useQuery({ queryKey: ['user', 'recipes'], queryFn: fetchUserRecipes });
};

export const useNewRecipeModalForm = (existingDraftNames: string[]) => {
  type ValidationKeys = 'name';

  const { formValidation, validateInputs } =
    useFormValidation<ValidationKeys>(['name']);

  const [newDraftRecipeInputs, setNewDraftRecipeInputs] =
    useState<NewDraftRecipeInputs>({
      name: '',
    });

  const formSchema = newDraftRecipeSchema(existingDraftNames);

  function raiseRecipeInputs(args: RaiseInputArgs) {
    setNewDraftRecipeInputs((prevState: NewDraftRecipeInputs) => {
      const latestInputs = { ...prevState, [args.name]: args.input };
      validateInputs({
        name: args.name,
        schema: formSchema,
        allInputs: latestInputs,
      });
      return {
        ...prevState,
        [args.name]: args.input,
      };
    });
  }

  return {
    newDraftRecipeInputs,
    raiseRecipeInputs,
    formValidation,
  };
};

export function useFormValidation<T extends string>(keys: T[]) {
  // takes array of keys to init formValidation
  // return state containing validation and function to validate input

  function initFormValidation(keys: T[]): FormValidationState<T> {
    const initState = {} as FormValidationState<T>;
    keys.forEach((key: T) => {
      initState[key] = {
        isInvalid: false,
        error: [],
      };
    });

    initState.form = { isInvalid: false, error: [] };
    return initState;
  }

  const [formValidation, setFormValidation] = useState<FormValidationState<T>>(
    () => initFormValidation(keys),
  );

  function validateInputs({
    schema,
    name,
    allInputs,
  }: {
    schema: BaseZodSchema;
    name: string;
    allInputs: Record<string, string | number>;
  }) {
    const formValidation = schema.safeParse(allInputs);
    console.log('formValidation', formValidation);
    setFormValidation((prevState) => {
      if (!formValidation.success && formValidation.error instanceof ZodError) {
        const formErrors = formValidation.error.format();
        const inputIsInvalid = name in formErrors;
        const newState: FormValidationState<T> = {
          ...prevState,
          [name]: {
            isInvalid: inputIsInvalid,
            error: inputIsInvalid ? formErrors[name]?._errors : [],
          },
          form: { isInvalid: !formValidation.success, error: [] },
        } 
        return newState
      }
      return {
        ...prevState,
        [name]: { isInvalid: false, error: [] },
        form: { isInvalid: false, error: [] },
      };
    });
  }

  return { formValidation, validateInputs };
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
