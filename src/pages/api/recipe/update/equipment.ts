import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { ERRORS } from 'lib/constants';
import { prisma } from 'lib/prismadb';
import { validateClientInputs } from 'lib/util';
import { NextApiResponse } from 'next';
import { FlowEquipment } from 'types/models';
import {
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
  UpdateInputMutationPayload,
} from 'types/types';
import { newEquipmentSchema } from 'validation/schemas';

export default async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<FlowEquipment>>,
  res: NextApiResponse<UpdateInputMutationPayload | ErrorPayload>,
) {
  const session = getAuth(req);
  if (!session || !session.userId) {
    return res.status(401).json({
      message: 'unauthorized',
      errors: [ERRORS.UNAUTHORIZED],
    });
  }

  const { recipeId, inputs: allEquipment } = req.body;

  const equipmentIdPairs: UpdateInputMutationPayload['inputIdPairs'] = [];

  console.log('update/equipment', allEquipment);

  for (const equipment of allEquipment) {
    const valid = validateClientInputs([
      { schema: newEquipmentSchema, inputs: equipment },
    ]);
    if (!valid) {
      continue;
    }

    const equipmentUpsertObject = {
      name: {
        connectOrCreate: {
          where: {
            name: equipment.name,
          },
          create: {
            name: equipment.name,
          },
        },
      },
      notes: equipment.notes,
      optional: equipment.optional,
    };

    const equipmentCreateObject: Prisma.EquipmentCreateInput = {
      ...equipmentUpsertObject,
      recipe: {
        connect: {
          id: recipeId,
        },
      },
    };

    const equipmentUpateObject: Prisma.EquipmentUpdateInput = {
      ...equipmentUpsertObject,
    };

    const newOrUpdatedEquipment = await prisma.equipment.upsert({
      where: {
        id: equipment.id,
      },
      update: equipmentUpateObject,
      create: equipmentCreateObject,
    });

    equipmentIdPairs.push({
      oldId: equipment.id,
      newId: newOrUpdatedEquipment.id,
    });
  }

  return res.status(200).json({
    message: 'success',
    inputIdPairs: equipmentIdPairs,
  });
}
