import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';
import { ErrorPayload, Stage } from 'types/types';

export const ERRORS = {
  INVALID_INPUT: (inputName?: string) => 'invalid input' + ' - ' + inputName,
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: (item = 'item') => {
    return `${item.toLowerCase()} not found`;
  },
  DOES_NOT_EXIST: (item = 'item') => {
    return `that ${item.toLowerCase()} does not exist`;
  },
  UNKNOWN_SERVER: 'unknown server error',
};

type ErrorResponse = NextApiResponse<ErrorPayload>;

export const ERROR_RESPONSES = {
  INVALID_INPUT: (res: ErrorResponse, inputName?: string) =>
    res.status(400).json({
      message: 'failed',
      errors: [ERRORS.INVALID_INPUT(inputName)],
    }),
  UNAUTHORIZED: (res: ErrorResponse) =>
    res.status(401).json({
      message: 'failed',
      errors: [ERRORS.UNAUTHORIZED],
    }),
  BAD_IMPORT: (res: ErrorResponse, message: string, type: string) =>
    res.status(500).json({
      message: 'failed',
      errors: [`${type} - ${message}`],
    }),
};
