import { genId } from 'lib/util-client';
import { RaiseInputArgs } from 'pirate-ui';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface PopoverButtonProps {
  name: string;
  parentInputName?: string;
  onClick?: ({ input, name }: RaiseInputArgs) => void;
  raiseIsOpen?: Dispatch<SetStateAction<boolean>>;
}

function PopoverButton({ name, onClick, parentInputName, raiseIsOpen }: PopoverButtonProps) {
  return (
    <button
      name={name}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (raiseIsOpen && onClick && parentInputName) {
          onClick({input: e.currentTarget.name, name: parentInputName});
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
  name: string;
  curValue: string;
  onRaiseInput: ({ input, name }: RaiseInputArgs) => void;
  styles: {
    div: string;
  };
}

function InputWithPopover({
  name,
  curValue,
  onRaiseInput,
  styles,
}: InputWithPopoverProps) {
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
    o.toLowerCase().includes(curValue.toLowerCase()),
  );

  const content = filteredOptions.map((i) => (
    <PopoverButton key={i} name={i} raiseIsOpen={setIsOpen} onClick={onRaiseInput} parentInputName={name}/>
  ));

  return (
    <>
      <input
        name={name}
        ref={inputRef}
        value={curValue}
        onFocus={() => setIsOpen(true)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onRaiseInput({ input: e.target.value, name: e.target.name })
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
              <button
                name={name}
                className="w-full flex justify-end bg-neutral-800"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  onRaiseInput({ input: '', name: e.currentTarget.name });
                  inputRef.current?.focus();
                }}
              >
                <div>
                  <span className='text-xs text-white mr-1'>clear</span>
                </div>
              </button>
              {content.length === 0 ? (
                <PopoverButton name={'No Matches'}  />
              ) : (
                content
              )}
            </div>,
            document.body,
            genId(),
          )
        : null}
    </>
  );
}

export default InputWithPopover;
