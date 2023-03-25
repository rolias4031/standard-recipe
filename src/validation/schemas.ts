import { z } from 'zod';

export function newDraftRecipeSchema(existingDraftNames: string[]) {
  return z.object({
    name: z
    .string()
    .min(1)
    .refine((val) => !existingDraftNames.includes(val), {
      message: 'Name already in use',
    }),
  })
}

// const newDraftRecipeSchema = z.object({
//   name: z
//     .string()
//     .min(1)
//     .refine((val) => !existingDraftNames.includes(val), {
//       message: 'Name already in use',
//     }),
// });