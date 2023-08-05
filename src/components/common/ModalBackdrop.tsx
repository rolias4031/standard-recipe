import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

const OpacityConfig = new Map<string, string>([
  ['50', 'bg-opacity-50'],
  ['0', 'bg-opacity-50'],
]);
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
  const opacityValue = OpacityConfig.get(opacity ?? '50');
  const root = modalRoot ? document.getElementById(modalRoot) : undefined;

  const modal = (
    <div
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (onClose) {
          onClose();
        }
        e.stopPropagation();
      }}
      className={`fixed top-0 right-0 left-0 bottom-0 z-20 flex items-center justify-center bg-black ${opacityValue}`}
    >
      {children}
    </div>
  );

  return root ? createPortal(modal, root) : modal;
}
