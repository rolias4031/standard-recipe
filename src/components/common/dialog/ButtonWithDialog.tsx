import React, { ReactNode } from 'react';
import { useFixedDialog } from './hooks';
import { ModalBackdrop } from '../ModalBackdrop';
import { pickStyles } from 'lib/util-client';

interface ButtonWithDialogProps {
  dialogComponent?: (
    handleToggleDialog: (open: boolean) => () => void,
  ) => ReactNode;
  buttonContent: ReactNode;
  isDisabled?: boolean;
  styles?: {
    button: {
      default: string;
      isDialogOpen?: [string, string];
    };
  };
}

function ButtonWithDialog({
  dialogComponent,
  buttonContent,
  isDisabled,
  styles,
}: ButtonWithDialogProps) {

  const { isDialogOpen, handleToggleDialog } = useFixedDialog()

  const isOpenStyle = styles?.button?.isDialogOpen ? styles.button.isDialogOpen[0] : undefined
  const isNotOpenStyle = styles?.button?.isDialogOpen ? styles.button.isDialogOpen[1] : undefined

  
  return (
    <>
      <button
        onClick={handleToggleDialog(true)}
        disabled={isDisabled}
        className={pickStyles(styles?.button.default, [
          isDialogOpen,
          isOpenStyle,
          isNotOpenStyle
        ])}
      >
        {buttonContent}
      </button>
      {isDialogOpen && dialogComponent ? (
        <ModalBackdrop
          modalRoot="modal-root"
          opacity="50"
          onClose={handleToggleDialog(false)}
        >
          {dialogComponent(handleToggleDialog)}
        </ModalBackdrop>
      ) : null}
    </>
  );
}

export default ButtonWithDialog;
