import { isZeroLength } from 'lib/util-client';
import React from 'react';
import { IngredientWithAll } from 'types/models';
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
  ingredient: IngredientWithAll;
}) {
  const { quantity, notes, substitutes, optional } = ingredient;
  const substituteNames = substitutes.map((s) => s.name);

  return (
    <TooltipCard>
      <TooltipUnit ingredientUnit={ingredient.unit} quantity={quantity} />
      <TooltipNotes notes={notes} />
      <TooltipSubs substitutes={substituteNames} />
      <TooltipOptional optional={optional} />
      {!ingredient.unit && !notes && isZeroLength(substitutes) && !optional ? (
        <span className="italic">nothing important</span>
      ) : null}
    </TooltipCard>
  );
}
