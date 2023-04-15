import React, { useEffect, useState } from 'react';

interface CharCountProps {
  string: string;
  charLimit: number;
  styles?: {
    div?: string,
    spanOne?: string,
    spanTwo?: string,
  }
}

function CharCount({ string, charLimit, styles }: CharCountProps) {
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    if (string.length > charLimit) {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }, [string, charLimit])

  const divStyle = `${styles?.div} ${isInvalid ? 'text-red-500' : 'text-abyss'} text-sm font-semibold`

  return (
    <div className={divStyle}>
      <span className={isInvalid ? 'text-red-500' : ''}>{string.length}</span> / <span className={styles?.spanTwo}>{charLimit}</span>
    </div>
  );
}

export default CharCount;
