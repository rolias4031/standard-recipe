import { z } from 'zod';

export function newDraftRecipeSchema(existingDraftNames: string[]) {
  return z.object({
    name: z
    .string()
    .min(1, 'Must be at least 1 character long')
    .max(60, 'Must have less than 60 characters')
    .refine((val) => !existingDraftNames.includes(val), {
      message: 'Name already in use',
    }),
  })
}