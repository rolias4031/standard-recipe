import { useRef, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createNewDraftRecipeMutation } from './mutations';
import { fetchUserRecipes } from './queries';
import { z, ZodSchema } from 'zod';
import {
  FormValidationState,
  NewRecipeValues,
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
  const [newRecipeValues, setNewRecipeValues] = useState<NewRecipeValues>({
    name: '',
  });

  const formSchemaMap = new Map<ValidationKeys, ZodSchema>([
    [
      'name',
      z
        .string()
        .min(1)
        .refine((val) => existingDraftNames.includes(val), {
          message: 'name taken',
        }),
    ],
  ]);

  function raiseRecipeValues(args: RaiseInputArgs) {
    const schema = formSchemaMap.get(args.name as ValidationKeys);
    if (schema) {
      validateClientInput(args.name, {
        schema,
        input: args.value,
      });
    }

    setNewRecipeValues((prevState: NewRecipeValues) => {
      return {
        ...prevState,
        [args.name]: args.value,
      };
    });
  }

  return { newRecipeValues, raiseRecipeValues, formValidation };
};

export function useFormValidation<T extends string>(keys: T[]) {
  function initFormValidation(keys: T[]) {
    const initState: FormValidationState<T> = {};
    keys.forEach((key: T) => {
      initState[key] = {
        isInvalid: false,
        errors: [],
      };
    });
    return initState;
  }

  const [formValidation, setFormValidation] = useState<FormValidationState<T>>(
    () => initFormValidation(keys),
  );

  function validateClientInput(
    name: string,
    {
      schema,
      input,
    }: {
      schema: ZodSchema;
      input: string;
    },
  ) {
    const validation = schema.safeParse(input);
    raiseValidation({
      name,
      payload: { isInvalid: validation.success, errors: ['errors'] },
    });
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
