import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import React, { ReactNode, useState } from 'react';

interface TextWithPopoverProps {
  text: string;
  popover: ({ onClosePopover }: { onClosePopover: () => void }) => ReactNode;
  disabled?: boolean;
}

function TextWithPopover({ text, popover, disabled }: TextWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  function onClosePopover() {
    setIsOpen(false);
  }
  return (
    <>
      {!disabled ? (
        <button
          className="underline"
          ref={refs.setReference}
          {...getReferenceProps()}
        >
          {text}
        </button>
      ) : (
        <span>{text}</span>
      )}
      {isOpen ? (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {popover({ onClosePopover })}
          </div>
        </FloatingFocusManager>
      ) : null}
    </>
  );
}

export default TextWithPopover;
