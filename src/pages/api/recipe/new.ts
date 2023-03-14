import { getExtendedServerSession, validateClientInputs } from 'lib/util';
import { NextApiResponse } from 'next';
import { NewDraftRecipeMutationInputs, StandardRecipeApiRequest } from 'types/types';
import prisma from 'lib/prismadb';
import { authOptions } from '../auth/[...nextauth]';
import { newDraftRecipeSchema } from 'validation/schemas';

export default async function handler(
  req: StandardRecipeApiRequest<NewDraftRecipeMutationInputs>,
  res: NextApiResponse,
) {
  const session = await getExtendedServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: 'No Session Found',
    });
  }

  const { newDraftRecipeMutationInputs } = req.body

  const valid = validateClientInputs([
    { schema: newDraftRecipeSchema, inputs: newDraftRecipeMutationInputs },
  ]);
  if (!valid) {
    return res.status(403).json({
      message: 'invalid',
      errors: 'invalid inputs',
    });
  }

  const newDraftRecipe = await prisma.user.update({
    where: {
      id: session.userId,
    },
    data: {
      recipes: {
        create: {
          name: newDraftRecipeMutationInputs.name,
        },
      },
    },
    include: {
      recipes: true,
    },
  });

  console.log(newDraftRecipe);

  return res.status(200).json({
    message: 'success',
  });
}
