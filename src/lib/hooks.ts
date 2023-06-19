import { useRef, useEffect, useState } from 'react';
import { recipeNameSchema } from 'validation/schemas';
import {
  BaseZodSchema,
  FormValidationState,
  NewDraftRecipeInputs,
} from 'types/types';
import { RaiseInputArgs } from 'pirate-ui';
import { ZodError } from 'zod';

export const useNewRecipeModalForm = (existingDraftNames: string[]) => {
  type ValidationKeys = 'name';

  const { formValidation, validateInputs } = useFormValidation<ValidationKeys>([
    'name',
  ]);

  const [newDraftRecipeInputs, setNewDraftRecipeInputs] =
    useState<NewDraftRecipeInputs>({
      name: '',
    });

  const formSchema = recipeNameSchema(existingDraftNames);

  function raiseRecipeInputs(args: RaiseInputArgs) {
    setNewDraftRecipeInputs((prevState: NewDraftRecipeInputs) => {
      const latestInputs = { ...prevState, [args.name]: args.value };
      validateInputs({
        name: args.name,
        schema: formSchema,
        allInputs: latestInputs,
      });
      return {
        ...prevState,
        [args.name]: args.value,
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
        error: undefined,
      };
    });

    initState.form = { isInvalid: true, error: undefined };
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
    setFormValidation((prevState) => {
      console.log(formValidation, allInputs);
      if (!formValidation.success && formValidation.error instanceof ZodError) {
        const formErrors = formValidation.error.format();
        const inputIsInvalid = name in formErrors;
        const newState: FormValidationState<T> = {
          ...prevState,
          [name]: {
            isInvalid: inputIsInvalid,
            error: inputIsInvalid ? formErrors[name]?._errors : undefined,
          },
          form: { isInvalid: !formValidation.success, error: undefined },
        };
        return newState;
      }
      return {
        ...prevState,
        [name]: { isInvalid: false, error: undefined },
        form: { isInvalid: false },
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

export const useFocusOnElement = (condition: boolean) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current && condition) {
      inputRef.current.focus();
    }
  }, [condition]);

  return { inputRef };
};
