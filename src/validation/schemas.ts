import { z } from 'zod';

export const newDraftRecipeSchema = z.object({
  newRecipeName: z.string().min(1).max(50),
});
