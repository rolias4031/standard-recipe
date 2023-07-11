import { IngredientUnit } from '@prisma/client';
import { ReactNode, useMemo } from 'react';
import SubstitutePill from '../SubstitutePill';
import { isZeroLength } from 'lib/util-client';

type DialogCardColor = 'fern' | 'indigo';

const dialogCardColorConfig = new Map<DialogCardColor, string>([
  ['fern', 'bg-fern'],
  ['indigo', 'bg-indigo-500'],
]);

interface DialogCardProps {
  children: ReactNode;
  color?: DialogCardColor;
}

export function DialogCard({ children, color }: DialogCardProps) {
  const cardColor = dialogCardColorConfig.get(color ?? 'fern');
  return (
    <div
      className={`rounded-lg p-4 text-xs ${cardColor} text-white shadow-lg shadow-neutral-500`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogUnit({
  ingredientUnit,
  quantity,
}: {
  ingredientUnit: IngredientUnit | null;
  quantity: number;
}) {
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

export function DialogNotes({ notes }: { notes: string | null }) {
  return notes ? <div className="">{notes}</div> : null;
}

export function DialogSubs({ substitutes }: { substitutes: string[] }) {
  let content = null;

  const subs = useMemo(
    () =>
      substitutes.map((s) => (
        <SubstitutePill key={s} sub={s} pillStyle="white" />
      )),
    [substitutes],
  );

  if (!isZeroLength(substitutes)) {
    content = (
      <div className="flex flex-col space-y-1">
        <span className="underline">Substitutes</span>
        <div className="flex space-x-2">{subs}</div>
      </div>
    );
  }

  return content;
}

export function DialogOptional({ optional }: { optional: boolean }) {
  return optional ? (
    <span className="text-xs italic text-smoke">optional</span>
  ) : null;
}
