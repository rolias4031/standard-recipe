import { getExtendedServerSession } from 'lib/util';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prismadb';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getExtendedServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: 'No Session Found',
    });
  }

  const drafts = await prisma.recipe.findMany({
    where: {
      AND: {
        authorId: {
          equals: session.userId,
        },
        status: {
          equals: 'draft',
        },
      },
    },
  });

  const draftNames = drafts.map((draft) => draft.name);

  console.log(draftNames);

  return res.status(200).json({
    message: 'success',
    draftNames
  });
}
