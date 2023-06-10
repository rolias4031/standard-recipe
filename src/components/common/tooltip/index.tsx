import { IngredientUnit } from '@prisma/client';
import { isZeroLength } from 'lib/util-client';
import React, { ReactNode, useMemo } from 'react';
interface TooltipCardProps {
  children: ReactNode;
}
export function TooltipCard({ children }: TooltipCardProps) {
  return (
    <div className="max-w-[250px] min-w-[150px] p-2 text-xs rounded-md border-2 bg-fern border-fern shadow-md shadow-concrete text-white flex flex-col space-y-2">
      {children}
    </div>
  );
}

interface TooltipNotesProps {
  notes: string | null;
}

export function TooltipNotes({ notes }: TooltipNotesProps) {
  return notes ? <div className="text-xs">{notes}</div> : null;
}

interface TooltipUnitProps {
  ingredientUnit: IngredientUnit | null;
  quantity: number;
}

export function TooltipUnit({ ingredientUnit, quantity }: TooltipUnitProps) {
  let content = null;
  if (ingredientUnit) {
    content = (
      <div className="flex space-x-1 font-mono">
        <span>{`${quantity} ${ingredientUnit.unit}`}</span>
        <span>{`(${ingredientUnit.abbreviation})`}</span>
      </div>
    );
  }
  return content;
}

interface TooltipSubsProps {
  substitutes: string[];
}

export function TooltipSubs({ substitutes }: TooltipSubsProps) {
  let content = null;

  if (!isZeroLength(substitutes)) {
    const subs = useMemo(
      () =>
        substitutes.map((s) => (
          <span className="" key={s}>
            {s}
          </span>
        )),
      [substitutes],
    );
    content = (
      <div className="flex flex-col">
        <span className="underline">Substitutes</span>
        <div className="flex flex-col">{subs}</div>
      </div>
    );
  }

  return content;
}

interface TooltipOptionalProps {
  optional: boolean;
}
export function TooltipOptional({ optional }: TooltipOptionalProps) {
  return optional ? <span className="italic text-smoke">optional</span> : null;
}