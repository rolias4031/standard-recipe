import { isZeroLength } from 'lib/util-client';
import React from 'react';
import { FlowIngredient } from 'types/models';
import {
  TooltipCard,
  TooltipNotes,
  TooltipOptional,
  TooltipSubs,
  TooltipUnit,
} from '.';

export default function IngredientTooltip({
  ingredient,
}: {
  ingredient: FlowIngredient;
}) {
  const { quantity, notes, substitutes, optional } = ingredient;

  return (
    <TooltipCard>
      <TooltipUnit ingredientUnit={ingredient.unit} quantity={quantity} />
      <TooltipNotes notes={notes} />
      <TooltipSubs substitutes={substitutes} />
      <TooltipOptional optional={optional} />
      {!ingredient.unit && !notes && isZeroLength(substitutes) && !optional ? (
        <span className="italic">nothing important</span>
      ) : null}
    </TooltipCard>
  );
}
