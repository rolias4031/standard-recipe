import LoadingSpinner from 'components/common/LoadingSpinner';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import React from 'react';

function ImportLoadingModal() {
  return (
    <ModalBackdrop modalRoot="modal-root">
      <div className="flex flex-col items-center space-y-5 rounded-2xl bg-white p-10 m-3">
        <h1 className="font-mono text-2xl text-concrete">IMPORTING</h1>
        <LoadingSpinner size="10" />
        <p className="text-2xl text-center">Stay here! This could take a few seconds</p>
      </div>
    </ModalBackdrop>
  );
}

export default ImportLoadingModal;
