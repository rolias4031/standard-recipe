import React from 'react';

type PillStyle = 'white' | 'abyss';

const pillStyleConfig = new Map<string, string>([
  ['white', 'border-white text-white'],
  ['abyss', 'border-abyss text-abyss'],
]);

interface SubstitutePillProps {
  sub: string;
  pillStyle?: PillStyle;
}

function SubstitutePill({ sub, pillStyle }: SubstitutePillProps) {
  const style = `rounded-full p-1 px-2 border ${pillStyleConfig.get(
    pillStyle ?? 'white',
  )}`;
  return <span className={style}>{sub}</span>;
}

export default SubstitutePill;
