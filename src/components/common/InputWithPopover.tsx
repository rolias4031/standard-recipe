import { genId, pickStyles } from 'lib/util-client';
import { RaiseInputArgs } from 'pirate-ui';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import XIcon from './icons/XIcon';

interface PopoverOptionProps {
  name: string;
  parentInputName?: string;
  onClick?: ({ value, name }: RaiseInputArgs) => void;
  raiseIsOpen?: Dispatch<SetStateAction<boolean>>;
}

function PopoverOption({
  name,
  onClick,
  parentInputName,
  raiseIsOpen,
}: PopoverOptionProps) {
  return (
    <button
      name={name}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (raiseIsOpen && onClick && parentInputName) {
          console.log(e.currentTarget.name);
          onClick({ value: e.currentTarget.name, name: '' });
          raiseIsOpen(false);
        }
      }}
      className="px-2 p-1 w-full text-left hover:bg-neutral-100 transition-colors"
    >
      {name}
    </button>
  );
}

interface InputWithPopoverProps {
  name: string;
  curValue: string;
  onRaiseInput: ({ value, name }: RaiseInputArgs) => void;
  options: string[];
  styles: {
    button: {
      root: string;
      isToggled: [string, string];
    };
  };
}

function InputWithPopover({
  name,
  curValue,
  onRaiseInput,
  options,
  styles,
}: InputWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
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
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node) &&
      popoverRef.current &&
      !popoverRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const filteredOptions =
    searchText.length > 0
      ? options.filter((o) =>
          o.toLowerCase().includes(searchText.toLowerCase()),
        )
      : options;

  const content = filteredOptions.map((i) => (
    <PopoverOption
      key={i}
      name={i}
      raiseIsOpen={setIsOpen}
      onClick={onRaiseInput}
      parentInputName={name}
    />
  ));

  return (
    <>
      <button
        className={pickStyles(styles.button.root, [
          isOpen,
          styles.button.isToggled[0],
          styles.button.isToggled[1],
        ])}
        ref={buttonRef}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <span>{curValue === '' ? 'Select' : curValue}</span>
      </button>
      {isOpen && buttonRef.current
        ? createPortal(
            <div
              className="flex flex-col items-center border border-fern rounded-sm bg-white text-sm w-36 shadow-md shadow-concrete"
              style={{
                position: 'absolute',
                top:
                  buttonRef.current.getBoundingClientRect().top +
                  window.scrollY,
                left:
                  buttonRef.current.getBoundingClientRect().right +
                  window.scrollX +
                  8,
              }}
              ref={popoverRef}
            >
              <div className="flex items-center border-fern bg-fern p-1">
                <input
                  autoFocus
                  placeholder="search"
                  autoComplete="false"
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchText(e.target.value)
                  }
                  className="w-full text-white px-1 bg-transparent appearance-none outline-none placeholder-white"
                />
                <button
                  name="clear"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    onRaiseInput({ value: e.currentTarget.name, name: '' });
                    setSearchText('');
                  }}
                >
                  <XIcon styles={{ icon: 'w-4 h-4 text-white' }} />
                </button>
              </div>

              <div className="flex flex-col w-full items-center max-h-64 overflow-auto">
                {content.length === 0 ? (
                  <PopoverOption name={'No Matches'} />
                ) : (
                  content
                )}
              </div>
            </div>,
            document.body,
            genId(),
          )
        : null}
    </>
  );
}

export default InputWithPopover;
