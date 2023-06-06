import React, { ReactNode } from 'react';
import { FlowIngredient } from 'types/models';
import TooltipCard from './TooltipCard';

function renderUnits(ingredientUnit: FlowIngredient['unit'], quantity: number) {
  console.log(ingredientUnit);
  let content: ReactNode = <span>No Units</span>;
  if (!ingredientUnit) return content;
  content = (
    <>
      <span>{`${quantity} ${ingredientUnit.unit}`}</span>
      <span>{`(${ingredientUnit.abbreviation})`}</span>
    </>
  );
  return content;
}

export default function IngredientTooltip({
  ingredient,
}: {
  ingredient: FlowIngredient;
}) {
  const { quantity, notes, substitutes, optional } = ingredient;

  const unitContent = renderUnits(ingredient.unit, quantity);

  return (
    <TooltipCard>
      <div className="flex flex-col space-y-1">
        <div className="flex space-x-1 font-mono">{unitContent}</div>
        {notes ? <div className="text-xs">{notes}</div> : null}
        {substitutes.length > 0 ? (
          <div className="flex space-x-2 text-xs text-concrete">
            <span className="text-abyss">subs:</span>
            {substitutes.map((s) => (
              <span className="" key={s}>
                {s}
              </span>
            ))}
          </div>
        ) : null}
        {optional ? (
          <span className="italic text-smoke">optional</span>
        ) : null}
      </div>
    </TooltipCard>
  );
}
