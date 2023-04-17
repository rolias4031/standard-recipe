import React from 'react';
import { UpdateRecipeInputHandlerArgs } from 'types/types';

interface NotesInputProps {
  id: string
  curNotes: string;
  onRaiseNotes: ({ id, name, value }: UpdateRecipeInputHandlerArgs) => void;
}

function NotesInput({id, curNotes, onRaiseNotes }: NotesInputProps) {
  return (
    <textarea
      name="notes"
      className="p-3 inp-primary resize-none w-full placeholder-concrete"
      placeholder="Put important details about your ingredients here. How ripe should the fruit be? What brands have you found work best? What mistakes should people avoid? Why do you like this ingredient?"
      value={curNotes}
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
  );
}

export default NotesInput;
