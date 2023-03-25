import { useRef, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createNewDraftRecipeMutation } from './mutations';
import { newDraftRecipeSchema } from 'validation/schemas';
import { fetchUserRecipes } from './queries';
import {
  BaseZodSchema,
  FormValidationState,
  NewDraftRecipeInputs,
  ValidationPayload,
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

  const { formValidation, validateClientInput } =
    useFormValidation<ValidationKeys>(['name']);
  const [newDraftRecipeInputs, setNewDraftRecipeInputs] =
    useState<NewDraftRecipeInputs>({
      name: '',
    });

  const formSchema = newDraftRecipeSchema(existingDraftNames);

  function raiseRecipeValues(args: RaiseInputArgs) {
    validateClientInput({
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

  function initFormValidation(keys: T[]) {
    const initState: FormValidationState<T> = {};
    keys.forEach((key: T) => {
      initState[key] = {
        isInvalid: false,
        errors: null,
      };
    });
    return initState;
  }

  const [formValidation, setFormValidation] = useState<FormValidationState<T>>(
    () => initFormValidation(keys),
  );

  function validateClientInput({
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
    if (validation && validation.success) {
      raiseValidation({
        name,
        payload: { isInvalid: false, errors: null },
      });
    } else {
      raiseValidation({
        name,
        payload: { isInvalid: true, errors: validation?.error ?? null },
      });
    }
  }

  function raiseValidation({
    name,
    payload,
  }: {
    name: string;
    payload: ValidationPayload;
  }) {
    setFormValidation((prevState: FormValidationState<T>) => {
      return {
        ...prevState,
        [name]: payload,
      };
    });
  }

  return { formValidation, validateClientInput };
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
