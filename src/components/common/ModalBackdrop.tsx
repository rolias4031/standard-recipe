import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
interface ModalBackdropProps {
  children: ReactNode;
  opacity?: string;
  onClose?: () => void;
  modalRoot?: string;
}

export function ModalBackdrop({
  children,
  onClose,
  opacity,
  modalRoot,
}: ModalBackdropProps) {
  const opacityValue = opacity ? opacity : '0.5';
  const root = modalRoot ? document.getElementById(modalRoot) : undefined;

  const modal = (
    <div
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onClose) {
          onClose();
        }
        e.stopPropagation();
      }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `rgba(0, 0, 0, ${opacityValue})`,
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );

  return root ? createPortal(modal, root) : modal;
}
