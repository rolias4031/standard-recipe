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
      className={`rounded-xl p-4 border border-white ${cardColor} text-white shadow-lg shadow-neutral-500`}
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
    <span className="font-mono italic text-smoke">optional</span>
  ) : null;
}

interface DialogConversionProps {
  unit: string;
  abbreviation?: string;
  quantity: string;
}

export function DialogConversionList({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-dashed divide-white">{children}</ul>;
}

export function DialogConversionItem({
  unit,
  abbreviation,
  quantity,
}: DialogConversionProps) {
  return (
    <li
      key={unit}
      className="flex w-full justify-between py-2 px-2 font-mono first:pt-0 last:pb-0"
    >
      <div className="flex space-x-2">
        <span>{unit}</span>
        {abbreviation ? <span>{`(${abbreviation})`}</span> : null}
      </div>
      <span>{quantity}</span>
    </li>
  );
}
