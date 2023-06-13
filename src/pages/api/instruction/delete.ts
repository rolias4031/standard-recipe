import { prisma } from 'lib/prismadb';
import { NextApiResponse } from 'next';
import {
  BasePayload,
  DeleteRecipeInputMutationBody,
  ErrorPayload,
  StandardRecipeApiRequest,
} from 'types/types';
import { apiHandler } from 'lib/util';

async function handler(
  req: StandardRecipeApiRequest<DeleteRecipeInputMutationBody>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const deletedInstruction = await prisma.instruction.delete({
    where: {
      id: req.body.id,
    },
  });
  console.log('deletedInstruction', deletedInstruction);

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
