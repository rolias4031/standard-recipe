import React, { ReactNode } from 'react';
import { useDialogWithCustomParam, useFixedDialog } from './hooks';
import { ModalBackdrop } from '../ModalBackdrop';
import { pickStyles } from 'lib/util-client';
import { useRouter } from 'next/router';
import { isStringType } from 'types/util';

function useExtractCustomDialogParamName(customParam: string) {
  const router = useRouter();
  console.log('Query', router.query);
  const dialogParam = router.query[customParam];
  if (isStringType(dialogParam) && !Array.isArray(dialogParam)) {
    return { router, dialogParam };
  }
  return { router, dialogParam: undefined };
}

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
  dialogParamName: string;
}

function ButtonWithDialog({
  dialogComponent,
  buttonContent,
  isDisabled,
  styles,
  dialogParamName,
}: ButtonWithDialogProps) {
  
  const { router, isDialogOpen, handleToggleDialog } =
    useDialogWithCustomParam(dialogParamName);

  const isOpenStyle = styles?.button?.isDialogOpen
    ? styles.button.isDialogOpen[0]
    : undefined;
  const isNotOpenStyle = styles?.button?.isDialogOpen
    ? styles.button.isDialogOpen[1]
    : undefined;

  return (
    <>
      <button
        onClick={handleToggleDialog(true)}
        disabled={isDisabled}
        className={pickStyles(styles?.button.default, [
          isDialogOpen,
          isOpenStyle,
          isNotOpenStyle,
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
