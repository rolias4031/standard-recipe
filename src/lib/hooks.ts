import { useRef, useEffect } from 'react';

export const useAutoFocusOnElement = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return { inputRef }
};
