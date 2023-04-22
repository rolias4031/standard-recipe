import PlusIcon from 'components/common/icons/PlusIcon';
import XIcon from 'components/common/icons/XIcon';
import React, { useRef, useState } from 'react';

interface SubTagProps {
  sub: string;
  onRemoveSub: () => void;
}

function SubTag({ sub, onRemoveSub }: SubTagProps) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  return (
    <div
      key={sub}
      className="text-abyss text-sm border border-abyss rounded-full flex items-center space-x-2 py-1 px-2"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <span>{sub}</span>
      {isMouseOver ? (
        <button onClick={() => onRemoveSub()}>
          <XIcon styles={{ icon: 'w-4 h-4 text-fern' }} />
        </button>
      ) : null}
    </div>
  );
}

interface AddSubstitutesProps {
  id: string;
  curSubs: string[];
  onAddSub: (newSub: string, id: string) => void;
  onRemoveSub: (subToRemove: string, id: string) => void;
  styles: {
    div: string;
  };
}

function AddSubstitutes({
  id,
  curSubs,
  onAddSub,
  onRemoveSub,
  styles,
}: AddSubstitutesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.div}>
      <div className="flex items-center space-x-1">
        <input
          ref={inputRef}
          type="text"
          className="w-48 inp-primary inp-reg"
          disabled={curSubs.length >= 3}
          placeholder={
            curSubs.length >= 3 ? 'limit reached' : 'Add Substitutes'
          }
          autoFocus
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
          disabled={curSubs.length >= 3}
        >
          <PlusIcon styles={{ icon: 'w-6 h-6 text-white' }} />
        </button>
      </div>

      <div className="flex items-start space-x-2">
        {curSubs.map((s) => (
          <SubTag
            key={`${id}${s}`}
            sub={s}
            onRemoveSub={() => onRemoveSub(s, id)}
          />
        ))}
      </div>
    </div>
  );
}

export default AddSubstitutes;
