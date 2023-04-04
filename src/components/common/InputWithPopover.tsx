import { genId } from 'lib/util-client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import XIcon from './icons/XIcon';

interface InputWithPopoverProps {
  styles: {
    div: string
  }
}

function InputWithPopover({styles}: InputWithPopoverProps) {
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
    <button
      key={i}
      name={i}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        console.log(i);
        setText(i);
        setIsOpen(false);
      }}
      className="px-2 p-1 rounded-sm w-full text-left hover:bg-gray-200"
    >
      {i}
    </button>
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
              className="flex flex-col items-center border border-gray-800 rounded bg-white ml-2 text-sm w-24"
              style={{
                position: 'absolute',
                top: inputRef.current.getBoundingClientRect().top,
                left: inputRef.current.getBoundingClientRect().right,
              }}
              ref={popoverRef}
            >
              <button className="w-full flex justify-end bg-gray-800">
                <div
                  onClick={() => {
                    setText('');
                    inputRef.current?.focus()
                  }}
                >
                  <XIcon styles={{ icon: 'w-4 h-4 text-white' }} />
                </div>
              </button>
              {content}
            </div>,
            document.body,
            genId()
          )
        : null}
    </>
  );
}

export default InputWithPopover