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

const sharedSchemas = {
  name: z.string().min(1).max(100),
  order: z.number().gte(1),
  optional: z.boolean(),
  substitutes: z.array(z.string().min(1)),
  notes: z.string().max(250).nullable(),
};

export function ingredientUnitSchema(allowedUnitIds: string[]) {
  return z.object({
    id: z.string().refine((val) => allowedUnitIds.includes(val)),
    unit: z.string().min(1),
    abbreviation: z.string(),
    description: z.string(),
    property: z.string(),
  });
}

export function ingredientSchema(allowedUnitIds: string[]) {
  return z.object({
    name: sharedSchemas.name,
    quantity: z.number().gte(0),
    unit: ingredientUnitSchema(allowedUnitIds).nullable(),
    optional: sharedSchemas.optional,
    notes: sharedSchemas.notes,
    order: sharedSchemas.order,
    substitutes: sharedSchemas.substitutes
  });
}

export const equipmentSchema = z.object({
  name: sharedSchemas.name,
  notes: sharedSchemas.notes,
  substitutes: sharedSchemas.substitutes,
  order: sharedSchemas.order,
  optional: sharedSchemas.optional,
});

export const instructionSchema = z.object({
  order: sharedSchemas.order,
  description: z.string().max(500),
  optional: sharedSchemas.optional,
});

export const newRecipeGeneralInfoSchema = z.object({
  description: z.string().max(500),
});

export function recipeNameSchema(existingDraftNames: string[]) {
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
