import React, { ReactNode, useRef, useState } from 'react';
import { ModalBackdrop } from '../ModalBackdrop';
import { useDynamicDialog } from './hooks';

const dialogPositionConfig = {
  top: 'top-3 md:top-10',
  bottom: 'bottom-3 md:bottom-10',
};

interface TextWithDialogProps {
  text: string;
  dialogContent: (onCloseDialog: () => void) => ReactNode;
  styles?: {
    text: string;
  };
  disabled?: boolean;
}

function TextWithDialog({
  text,
  dialogContent,
  styles,
  disabled,
}: TextWithDialogProps) {
  const { isDialogOpen, handleToggleDialog, dialogPosition, anchorRef } =
    useDynamicDialog<HTMLSpanElement>();

  const dialogPositionStyle = dialogPositionConfig[dialogPosition];

  return (
    <>
      <span
        className={disabled ? undefined : styles?.text}
        onClick={handleToggleDialog(true)}
        ref={anchorRef}
      >
        {text}
      </span>
      {isDialogOpen && !disabled ? (
        <ModalBackdrop
          modalRoot="modal-root"
          opacity="0"
          onClose={handleToggleDialog(false)}
        >
          <div className={`fixed left-3 right-3 md:left-1/4 md:right-1/4 ${dialogPositionStyle}`}>
            {dialogContent(handleToggleDialog(false))}
          </div>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

TextWithDialog.defaultProps = {
  styles: {
    text: 'text-fern',
  },
};

export default TextWithDialog;
