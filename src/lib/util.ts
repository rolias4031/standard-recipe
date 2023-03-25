
import { BaseZodSchema } from 'types/types';

export function validateClientInputs(
  schemaInputPairs: {
    schema: BaseZodSchema;
    inputs: Record<string, any>;
  }[],
): boolean {
  for (const pair of schemaInputPairs) {
    const validation = pair.schema.safeParse(pair.inputs);
    if (!validation.success) {
      return false;
    }
  }
  return true;
}
