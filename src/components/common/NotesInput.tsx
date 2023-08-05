import React from 'react';
import { UpdateRecipeInputHandlerArgs } from 'types/types';
import CharCount from './CharCount';

const placeholder =
  'Put important details about your ingredients here. How ripe should the fruit be? What brands have you found work best? What mistakes should people avoid? Why do you like this ingredient?';

export interface NotesInputProps {
  id: string;
  curNotes: string | null;
  onRaiseNotes: ({ id, name, value }: UpdateRecipeInputHandlerArgs) => void;
}

function NotesInput({ id, curNotes, onRaiseNotes }: NotesInputProps) {
  return (
    <div className="">
      <textarea
        name="notes"
        className="inp-primary text-lg w-full resize-none p-3 placeholder-concrete"
        placeholder={placeholder}
        value={curNotes ?? ''}
        rows={5}
        autoFocus
        draggable={false}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onRaiseNotes({
            id,
            name: e.target.name,
            value: e.target.value,
          });
        }}
      />
      <div className="flex justify-end">
        <CharCount charLimit={250} string={curNotes} />
      </div>
    </div>
  );
}

export default NotesInput;
