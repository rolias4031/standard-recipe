import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { ERRORS } from 'lib/constants';
import { prisma } from 'lib/prismadb';
import { apiHandler } from 'lib/util';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  await prisma.equipment.delete({
    where: {
      id: req.body.id,
    },
  });

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler)
