import React, { ReactNode, useRef, useState } from 'react';
import { ModalBackdrop } from '../ModalBackdrop';

const dialogPositionConfig = {
  'top': 'top-5',
  'bottom': 'bottom-5'
}

interface TextWithDialogProps {
  text: string;
  dialogContent: ReactNode;
  styles?: {
    text: string;
  };
  disabled?: boolean;
}

function TextWithDialog({ text, dialogContent, styles }: TextWithDialogProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom'>('top');

  const dialogPositionStyle = dialogPositionConfig[dialogPosition]

  const handleOpenDialog = () => {
    const textElem = textRef.current;
    if (textElem) {
      const rect = textElem.getBoundingClientRect();
      if (rect.top > window.innerHeight / 2) {
        setDialogPosition('top');
      } else {
        setDialogPosition('bottom');
      }
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <span className={styles?.text} onClick={handleOpenDialog} ref={textRef}>
        {text}
      </span>
      {isDialogOpen ? (
        <ModalBackdrop
          modalRoot="modal-root"
          opacity="0"
          onClose={() => setIsDialogOpen(false)}
        >
          <div className={`fixed left-5 right-5 ${dialogPositionStyle}`}>
            {dialogContent}
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
