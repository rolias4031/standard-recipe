import { pickStyles } from 'lib/util-client';
import React, { useEffect, useState } from 'react';

interface CharCountProps {
  string: string;
  charLimit: number;
  styles?: {
    div?: string;
    spanOne?: string;
    spanTwo?: string;
  };
}

function CharCount({ string, charLimit, styles }: CharCountProps) {
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (string.length > charLimit) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  }, [string, charLimit]);

  const divStyle = pickStyles('text-sm font-semibold', [
    isInvalid,
    'text-red-500',
  ]);

  return (
    <div className={divStyle}>
      <span>{string.length}</span> / <span>{charLimit}</span>
    </div>
  );
}

export default CharCount;
