import { useFocusOnElement } from 'lib/hooks';
import React, { ReactNode, SetStateAction, useState } from 'react';

interface ChildrenProps {
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<SetStateAction<boolean>>;
  inputRef: React.Ref<HTMLInputElement>;
}

interface InputDisplayControllerProps {
  children: ({
    isEditMode,
    setIsEditMode,
    inputRef,
  }: ChildrenProps) => ReactNode;
}

function InputDisplayController({ children }: InputDisplayControllerProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { inputRef } = useFocusOnElement(isEditMode);
  return <>{children({ isEditMode, setIsEditMode, inputRef })}</>;
}

export default InputDisplayController;
