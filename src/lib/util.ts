import { AuthOptions, getServerSession } from 'next-auth';
import prisma from 'lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ExtendedSession, BaseZodSchema } from 'types/types';

export function validateClientInputs(
  schemaInputPairs: {
    schema: BaseZodSchema;
    inputs: Record<string, string>;
  }[],
): boolean {
  const errors: string[] = [];
  for (const pair of schemaInputPairs) {
    const validation = pair.schema.safeParse(pair.inputs);
    if (!validation.success) {
      return false;
    }
  }
  return true;
}

export async function getExtendedServerSession(
  req: NextApiRequest,
  res: NextApiResponse,
  authOptions: AuthOptions,
): Promise<ExtendedSession | null> {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      return { ...session, userId: user.id };
    }
  }

  return null;
}
