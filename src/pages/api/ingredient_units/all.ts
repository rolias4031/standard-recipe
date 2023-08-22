import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'lib/prismadb';
import { AllUnitsQueryPayload, ErrorPayload } from 'types/types';
import { getAuth } from '@clerk/nextjs/server';
import { ERRORS } from 'lib/server/constants';
import { apiHandler } from 'lib/util';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllUnitsQueryPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const units = await prisma.ingredientUnit.findMany();

  return res.status(200).json({
    units,
    message: 'success',
  });
}

export default apiHandler(handler);
