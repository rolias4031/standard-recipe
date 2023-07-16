import {
  FloatingFocusManager,
  autoUpdate,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  flip,
} from '@floating-ui/react';
import { pickStyles } from 'lib/util-client';
import React, { ReactNode, useState } from 'react';

interface ButtonWithPopoverProps {
  children: ReactNode;
  buttonText: string;
  isDisabled: boolean;
  styles?: {
    button: {
      default: string;
      isOpen: [string, string];
    };
  };
}

function ButtonWithPopover({
  children,
  buttonText,
  styles,
  isDisabled,
}: ButtonWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'right-start',
    middleware: [shift(), flip()],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        disabled={isDisabled}
        className={pickStyles(styles?.button.default, [
          isOpen,
          styles ? styles.button.isOpen[0] : '',
          styles ? styles.button.isOpen[1] : '',
        ])}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {buttonText}
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}

export default ButtonWithPopover;
