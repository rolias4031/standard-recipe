import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';
import {
  BaseZodSchema,
  ErrorPayload,
  StandardRecipeApiHandler,
  StandardRecipeApiRequest,
} from 'types/types';
import { ERRORS } from './server/constants';

function errorHandler(res: NextApiResponse<ErrorPayload>, error: unknown) {
  console.log(error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return res.status(200).json({
        errors: [ERRORS.DOES_NOT_EXIST()],
        message: 'failure',
      });
    }
  }
  return res.status(500).json({
    errors: [ERRORS.UKNOWN_SERVER],
    message: 'failure',
  });
}

export function apiHandler<T, K>(handler: StandardRecipeApiHandler<T, K>) {
  return async function (
    req: StandardRecipeApiRequest<T>,
    res: NextApiResponse<K | ErrorPayload>,
  ) {
    try {
      await handler(req, res);
    } catch (error) {
      return errorHandler(res, error);
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

export function validateManyInputs(
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

export function validateOneInput({
  schema,
  input,
}: {
  schema: BaseZodSchema;
  input: Record<string, any>;
}): boolean {
  const isValid = schema.safeParse(input);
  return isValid.success;
}
