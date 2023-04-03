import { z } from 'zod';

const VALIDATION_ERRORS = {
  MIN: (length: number) => {
    return `Must have at least ${length} ${
      length === 1 ? 'character' : 'characters'
    }`;
  },
  MAX: (length: number) => {
    return `Must have less than ${length} characters`;
  },
};

export function newDraftRecipeSchema(existingDraftNames: string[]) {
  return z.object({
    name: z
      .string()
      .min(1, VALIDATION_ERRORS.MIN(1))
      .max(60, VALIDATION_ERRORS.MAX(60))
      .refine((val) => !existingDraftNames.includes(val), {
        message: 'Name already in use',
      }),
  });
}

export const newRecipeInfoInputsSchema = z.object({
  description: z
    .string()
    .min(1, VALIDATION_ERRORS.MIN(1))
    .max(100, VALIDATION_ERRORS.MAX(200)),
});
