import { stopRootDivPropagation } from 'lib/util-client';
import React, { useState } from 'react';
import XIcon from '../icons/XIcon';

function fractionToFloat(input: string): number | null {
  const fractionRegex = /(?:(\d+)\s+)?(\d+)\/(\d+)/;

  const match = input.match(fractionRegex);
  if (match) {
    const wholePart = match[1] ? parseInt(match[1], 10) : 0;

    if (!match[2] || !match[3]) {
      return null;
    }

    const numerator = parseInt(match[2], 10);
    const denominator = parseInt(match[3], 10);
    const fractionValue = numerator / denominator;
    const floatValue = wholePart + fractionValue;
    return Math.round(floatValue * 100) / 100;
  }

  return null;
}

interface ConvertFractionDialogProps {
  onClose: () => void;
}

function ConvertFractionDialog({ onClose }: ConvertFractionDialogProps) {
  const [fractionString, setFractionString] = useState('');
  const convertedFraction = fractionToFloat(fractionString);
  return (
    <div
      className="flex h-full w-full flex-col space-y-3 bg-white p-5 md:px-10 lg:h-5/6 lg:w-1/2 lg:rounded-2xl"
      onClick={stopRootDivPropagation}
    >
      <div className="flex justify-end">
        <button onClick={onClose}>
          <XIcon styles={{ icon: 'w-8 h-8 text-concrete' }} />
        </button>
      </div>
      <div className="flex w-full flex-col space-y-1">
        <span className="text-lg">Fraction to convert</span>
        <input
          type="text"
          className="rounded-lg border p-2 text-2xl outline-fern"
          value={fractionString}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFractionString(e.target.value)
          }
        />
      </div>
      {convertedFraction ? (
        <div className="flex flex-col space-y-1">
          <span className="text-lg">Decimal</span>
          <span className="rounded-lg bg-smoke p-2 font-mono text-2xl">
            {convertedFraction}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default ConvertFractionDialog;
