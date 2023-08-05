import React, { ReactNode } from 'react';
import { useDynamicDialog } from './hooks';
import { ModalBackdrop } from '../ModalBackdrop';
import { pickStyles } from 'lib/util-client';

interface ButtonWithDialogProps {
  dialogComponent: (
    handleToggleDialog: (command: 'open' | 'close') => void,
  ) => ReactNode;
  buttonContent: ReactNode;
  isDisabled?: boolean;
  styles?: {
    button: {
      default: string;
      isDialogOpen: [string, string];
    };
  };
}

function ButtonWithDialog({
  dialogComponent,
  buttonContent,
  isDisabled,
  styles,
}: ButtonWithDialogProps) {
  const { anchorRef, dialogPosition, handleToggleDialog, isDialogOpen } =
    useDynamicDialog<HTMLButtonElement>();
  return (
    <>
      <button
        ref={anchorRef}
        onClick={() => handleToggleDialog('open')}
        disabled={isDisabled}
        className={pickStyles(styles?.button.default, [
          isDialogOpen,
          styles ? styles.button.isDialogOpen[0] : '',
          styles ? styles.button.isDialogOpen[1] : '',
        ])}
      >
        {buttonContent}
      </button>
      {isDialogOpen ? (
        <ModalBackdrop
          modalRoot="modal-root"
          opacity="50"
          onClose={() => handleToggleDialog('close')}
        >
          {dialogComponent(handleToggleDialog)}
        </ModalBackdrop>
      ) : null}
    </>
  );
}

export default ButtonWithDialog;
