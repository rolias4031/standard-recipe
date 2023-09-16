import { useEffect, useState } from 'react';

export function useCopyToClipboard() {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (!isCopiedToClipboard) return;
    const id = setTimeout(() => {
      setIsCopiedToClipboard(false);
    }, 5000);
    return () => clearTimeout(id);
  }, [isCopiedToClipboard]);

  async function copyToClipboardHandler(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedToClipboard(true);
    } catch (err) {
      alert('Error in copying text: ' + err);
    }
  }

  return { isCopiedToClipboard, copyToClipboardHandler };
}
