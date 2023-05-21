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

export const unitSchema = z.object({
  id: z.string(),
  unit: z.string().min(1),
  abbreviation: z.string(),
  description: z.string(),
  property: z.string(),
});

export const newIngredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().gt(0),
  unit: unitSchema,
  optional: z.boolean(),
  notes: z.string().max(250).nullable(),
  substitutes: z.array(z.string()),
});

export const newEquipmentSchema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().max(250).nullable(),
  optional: z.boolean(),
});

export const newInstructionSchema = z.object({
  order: z.number(),
  description: z.string().max(500),
  optional: z.boolean(),
});

export const newRecipeGeneralInfoSchema = z.object({
  description: z.string().max(500),
});

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
