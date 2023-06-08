import { NextApiResponse } from 'next';
import {
  BaseZodSchema,
  ErrorPayload,
  StandardRecipeApiHandler,
  StandardRecipeApiRequest,
} from 'types/types';
import { ERRORS } from './constants';

export function apiHandler<T, K>(handler: StandardRecipeApiHandler<T, K>) {
  return async function (
    req: StandardRecipeApiRequest<T>,
    res: NextApiResponse<K | ErrorPayload>,
  ) {
    try {
      await handler(req, res);
    } catch (error) {
      console.log('ERROR HANDLER', error);
      return res.status(500).json({
        errors: [ERRORS.UKNOWN_SERVER],
        message: 'failure',
      });
    }
  };
}

export function prepareSubsForUpsert(
  existingSubstitutes: string[] | undefined,
  newSubstitutes: string[],
) {
  // subs to add
  const connectOrCreateSubstitutes = newSubstitutes.map((s) => ({
    where: { name: s },
    create: { name: s },
  }));

  // subs to disconnect, existing minus to add
  let disconnectSubstitutes: { name: string }[] = [];
  if (existingSubstitutes) {
    disconnectSubstitutes = existingSubstitutes
      .filter((sub) => !newSubstitutes.includes(sub))
      .map((s) => ({ name: s }));
  }

  return { connectOrCreateSubstitutes, disconnectSubstitutes };
}

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
