import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export function useDialogWithCustomParam(customParamName: string) {
  const router = useRouter();
  console.log('Query', router.query);
  const dialogParam = router.query[customParamName];

  function handleToggleDialog(isOpen: boolean) {
    const previousParams = { ...router.query };
    delete previousParams[customParamName];
    const newQueryParams = isOpen
      ? { ...previousParams, [customParamName]: 'true' }
      : previousParams;
    return () => {
      router.push({ query: newQueryParams }, undefined, { shallow: true });
    };
  }

  const isDialogOpen = dialogParam === 'true';

  return { router, isDialogOpen, handleToggleDialog };
}

export function useDynamicDialog<T extends HTMLElement>() {
  const anchorRef = useRef<T>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom'>('top');

  const handleToggleDialog = (isOpen: boolean) => {
    return () => {
      const textElem = anchorRef.current;
      if (textElem && isOpen) {
        const rect = textElem.getBoundingClientRect();
        if (rect.top > window.innerHeight / 2) {
          setDialogPosition('top');
        } else {
          setDialogPosition('bottom');
        }
        setIsDialogOpen(true);
      }
      if (textElem && !isOpen) {
        setIsDialogOpen(false);
      }
    };
  };

  return { handleToggleDialog, dialogPosition, anchorRef, isDialogOpen };
}

export function useFixedDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  function handleToggleDialog(isOpen?: boolean) {
    return () =>
      setIsDialogOpen((prev) => {
        if (isOpen === undefined) {
          return !prev;
        }
        return isOpen;
      });
  }

  return { isDialogOpen, handleToggleDialog };
}
