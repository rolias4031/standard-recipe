import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { ERRORS } from 'lib/server/constants';
import { prisma } from 'lib/prismadb';
import { apiHandler, prepareSubsForUpsert, validateOneInput } from 'lib/util';
import { NextApiResponse } from 'next';
import { FlowEquipment } from 'types/models';
import {
  BasePayload,
  ErrorPayload,
  StandardRecipeApiRequest,
  UpdateInputMutationBody,
} from 'types/types';
import { equipmentSchema } from 'validation/schemas';

async function handler(
  req: StandardRecipeApiRequest<UpdateInputMutationBody<FlowEquipment[]>>,
  res: NextApiResponse<BasePayload | ErrorPayload>,
) {
  const { recipeId, inputs: allEquipment } = req.body;

  for (const equipment of allEquipment) {
    const isValid = validateOneInput({
      schema: equipmentSchema,
      input: equipment,
    });
    if (!isValid) continue;

    // get existing equipment substitutes
    const equipmentWithSubs = await prisma.equipment.findUnique({
      where: {
        id: equipment.id,
      },
      include: {
        substitutes: {
          select: {
            name: true,
          },
        },
      },
    });

    const { disconnectSubstitutes, connectOrCreateSubstitutes } =
      prepareSubsForUpsert(
        equipmentWithSubs?.substitutes.map((s) => s.name),
        equipment.substitutes,
      );

    const equipmentUpdateObject: Prisma.EquipmentUpdateInput = {
      inUse: equipment.inUse,
      order: equipment.order,
      notes: equipment.notes,
      optional: equipment.optional,
      substitutes: {
        connectOrCreate: connectOrCreateSubstitutes,
        disconnect: disconnectSubstitutes,
      },
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
    };

    await prisma.equipment.update({
      where: {
        id: equipment.id,
      },
      data: equipmentUpdateObject,
    });
  }

  return res.status(200).json({
    message: 'success',
  });
}

export default apiHandler(handler);
