import { z } from 'zod';



export function newDraftRecipeSchema(existingDraftNames: string[]) {
  return z.object({
    name: z
    .string()
    .min(1, 'Must be at least 1 character long')
    .max(50, 'Must have less than 50 characters')
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