import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';
import React, { ReactNode, useRef } from 'react';

export interface SubTagProps {
  sub: string;
  onRemoveSub: () => void;
}

export function SubTag({ sub, onRemoveSub }: SubTagProps) {
  return (
    <span
      key={sub}
      className="flex w-fit items-center space-x-2 rounded-full border border-abyss py-1 px-2 text-abyss"
    >
      <span>{sub}</span>
      <button onClick={() => onRemoveSub()}>
        <XIcon styles={{ icon: 'w-5 h-5 text-fern' }} />
      </button>
    </span>
  );
}

export interface AddSubstitutesProps {
  id: string;
  curSubs: string[];
  onAddSub: (newSub: string, id: string) => void;
  styles?: {
    div: string;
  };
}

function AddSubstitutes({
  id,
  curSubs,
  onAddSub,
  styles,
}: AddSubstitutesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMaxSubs = curSubs.length >= 3
  return (
    <>
      <div className={styles?.div}>
        <input
          ref={inputRef}
          type="text"
          className="inp-primary inp-reg w-full"
          disabled={isMaxSubs}
          placeholder={isMaxSubs ? 'limit reached' : 'Add Substitutes'}
        />
        <button
          type="button"
          className="btn-primary rounded-full"
          onClick={() => {
            if (!inputRef.current || inputRef.current.value === '') return;
            const newSub = inputRef.current.value;
            inputRef.current.value = '';
            onAddSub(newSub, id);
          }}
          disabled={isMaxSubs}
        >
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
        </button>
      </div>
    </>
  );
}

export default AddSubstitutes;
