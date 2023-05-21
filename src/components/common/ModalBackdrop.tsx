import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
interface ModalBackdropProps {
  children: ReactNode;
}

export function ModalBackdrop({ children }: ModalBackdropProps) {
  const modalRoot = document.getElementById('modal-root');
  return modalRoot
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
          }}
        >
          {children}
        </div>,
        modalRoot,
      )
    : null;
}
