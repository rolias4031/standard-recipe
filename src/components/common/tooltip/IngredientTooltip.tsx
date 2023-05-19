import React from 'react';
import { IngredientWithAllModName } from 'types/models';
import TooltipCard from './TooltipCard';

export default function IngredientTooltip({
  ingredient,
}: {
  ingredient: IngredientWithAllModName;
}) {
  const { quantity, notes, substitutes } = ingredient;
  const { unit } = ingredient.unit;
  
  const abbreviation = ingredient.unit.abbreviation
    ? `(${ingredient.unit.abbreviation})`
    : null;

  return (
    <TooltipCard>
      <div className="flex flex-col space-y-1">
        <div className="flex font-mono space-x-1">
          <span>{`${quantity} ${unit}`}</span>
          <span>{abbreviation}</span>
        </div>
        {notes ? <div className="text-concrete text-xs">{notes}</div> : null}
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
      </div>
    </TooltipCard>
  );
}
