import { genId } from 'lib/util-client';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import XIcon from './icons/XIcon';

interface PopoverButtonProps {
  name: string;
  raiseText?: Dispatch<SetStateAction<string>>;
  raiseIsOpen?: Dispatch<SetStateAction<boolean>>;
}

function PopoverButton({ name, raiseText, raiseIsOpen }: PopoverButtonProps) {
  return (
    <button
      name={name}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (raiseIsOpen && raiseText) {
          raiseText(name);
          raiseIsOpen(false);
        }
      }}
      className="px-2 p-1 w-full text-left hover:bg-neutral-200 transition-colors"
    >
      {name}
    </button>
  );
}

interface InputWithPopoverProps {
  styles: {
    div: string;
  };
}

function InputWithPopover({ styles }: InputWithPopoverProps) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target as Node) &&
      popoverRef.current &&
      !popoverRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const options = ['Cups', 'Ounces', 'Grams', 'Pounds', 'Kilograms'];

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(text.toLowerCase()),
  );

  const content = filteredOptions.map((i) => (
    <PopoverButton
      key={i}
      name={i}
      raiseIsOpen={setIsOpen}
      raiseText={setText}
    />
  ));

  return (
    <>
      <input
        ref={inputRef}
        value={text}
        onFocus={() => setIsOpen(true)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setText(e.target.value)
        }
        className={styles.div}
      />
      {isOpen && inputRef.current
        ? createPortal(
            <div
              className="flex flex-col items-center border border-neutral-800 rounded bg-white ml-2 text-sm w-28 shadow-md shadow-neutral-600/50"
              style={{
                position: 'absolute',
                top:
                  inputRef.current.getBoundingClientRect().top + window.scrollY,
                left:
                  inputRef.current.getBoundingClientRect().right +
                  window.scrollX,
              }}
              ref={popoverRef}
            >
              <button className="w-full flex justify-end bg-neutral-800">
                <div
                  onClick={() => {
                    setText('');
                    inputRef.current?.focus();
                  }}
                >
                  <XIcon styles={{ icon: 'w-4 h-4 text-white' }} />
                </div>
              </button>
              {content.length === 0 ? <PopoverButton name={'No Matches'} /> : content}
            </div>,
            document.body,
            genId(),
          )
        : null}
    </>
  );
}

export default InputWithPopover;
