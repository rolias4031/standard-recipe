import ButtonWithConfirm from 'components/common/ButtonWithConfirm';
import NotesInput, { NotesInputProps } from 'components/common/NotesInput';
import CheckIcon from 'components/common/icons/CheckIcon';
import TrashIcon from 'components/common/icons/TrashIcon';
import { ReactNode } from 'react';
import AddSubstitutes, { AddSubstitutesProps, SubTag } from './AddSubstitutes';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col space-y-3 bg-white rounded-t-2xl p-5 md:p-10">
      {children}
    </div>
  );
}

export function Heading({
  name,
  onDeleteIngredient,
}: {
  name: string;
  onDeleteIngredient: () => void;
}) {
  return (
    <div className="flex items-center justify-between my-1">
      <span className="font-mono text-2xl text-concrete">{name}</span>
      <ButtonWithConfirm
        confirmComponent={
          <button className="" onClick={onDeleteIngredient}>
            <CheckIcon styles={{ icon: 'w-7 h-7 text-fern' }} />
          </button>
        }
      >
        <TrashIcon styles={{ icon: 'w-7 h-7' }} />
      </ButtonWithConfirm>
    </div>
  );
}

export function Notes(props: NotesInputProps) {
  return (
    <div>
      <span className="text-lg">Notes</span>
      <NotesInput {...props} />
    </div>
  );
}

interface SubstitutesProps extends AddSubstitutesProps {
  onRemoveSub: (subValue: string, id: string) => void;
}

export function Substitutes(props: SubstitutesProps) {
  return (
    <div>
      <span className="text-lg">Substitutes</span>
      <div className="flex flex-col space-y-3">
        <AddSubstitutes
          {...props}
          styles={{ div: 'flex items-center md:w-1/2 space-x-1' }}
        />
        <div className="flex flex-wrap items-center gap-3">
          {props.curSubs.map((s) => (
            <SubTag
              key={`${props.id}${s}`}
              sub={s}
              onRemoveSub={() => props.onRemoveSub(s, props.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const OptionDialog = {
  Card,
  Heading,
  Notes,
  Substitutes,
};
