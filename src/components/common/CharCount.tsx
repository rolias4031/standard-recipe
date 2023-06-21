import { pickStyles } from 'lib/util-client';
import React, { useMemo } from 'react';

interface CharCountProps {
  string: string | undefined | null;
  charLimit: number;
  styles?: {
    span: string;
  };
}

function CharCount({ string, charLimit, styles }: CharCountProps) {

  const charCount = string?.length ? string.length : 0

  const isInvalid = charCount > charLimit

  const style = pickStyles(
    [!!styles?.span, styles?.span ?? '', 'text-xs font-mono'],
    [isInvalid, 'text-red-500'],
  );

  return (
    <span className={style}>
      {charCount}/{charLimit}
    </span>
  );
}

export default CharCount;
