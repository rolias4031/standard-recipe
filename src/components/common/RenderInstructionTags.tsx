import { Equipment } from '@prisma/client';
import { parseInstructionForTags } from 'lib/util-client';
import React, { ReactNode } from 'react';
import {
  FlowIngredient,
  isEquipmentType,
  isFlowIngredientType,
} from 'types/models';

interface RenderInstructionTags {
  description: string;
  tags: Array<FlowIngredient | Equipment>;
  ingredientTagComponent: (ingredient: FlowIngredient) => ReactNode;
  equipmentTagComponent: (equipment: Equipment) => ReactNode;
}

function RenderInstructionTags({
  description,
  tags,
  ingredientTagComponent,
  equipmentTagComponent,
}: RenderInstructionTags) {
  const parsedDescriptionArray = parseInstructionForTags(description, tags);
  return (
    <div>
      {parsedDescriptionArray.map((segment) => {
        if (typeof segment === 'string') return segment;
        if (isFlowIngredientType(segment)) {
          return ingredientTagComponent(segment);
        }
        if (isEquipmentType(segment)) {
          return equipmentTagComponent(segment);
        }
      })}
    </div>
  );
}

export default RenderInstructionTags;
