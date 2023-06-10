import { parseInstructionForTags } from 'lib/util-client';
import React, { ReactNode } from 'react';
import {
  FlowEquipment,
  FlowIngredient,
  isFlowEquipmentType,
  isFlowIngredientType,
} from 'types/models';

interface RenderInstructionTags {
  description: string;
  tags: Array<FlowIngredient | FlowEquipment>;
  ingredientTooltipComponent: (ingredient: FlowIngredient) => ReactNode;
  equipmentTooltipComponent: (equipment: FlowEquipment) => ReactNode;
}

function RenderInstructionTags({
  description,
  tags,
  ingredientTooltipComponent,
  equipmentTooltipComponent,
}: RenderInstructionTags) {
  const parsedDescriptionArray = parseInstructionForTags(description, tags);
  return (
    <div>
      {parsedDescriptionArray.map((segment) => {
        console.log(segment);
        if (typeof segment === 'string') return segment;
        if (isFlowIngredientType(segment)) {
          return ingredientTooltipComponent(segment);
        }
        if (isFlowEquipmentType(segment)) {
          return equipmentTooltipComponent(segment);
        }
      })}
    </div>
  );
}

export default RenderInstructionTags;
