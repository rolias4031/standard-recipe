import { useAutoFocusOnElement } from 'lib/hooks';
import React, { useState } from 'react';

interface SignInModalProps {
  styles?: {
    div?: string;
  };
}

function SignInModal({ styles }: SignInModalProps) {
  const [email, setEmail] = useState<string>('');
  const { inputRef } = useAutoFocusOnElement()
  return (
    <div className={styles?.div}>
      <input
        className="text-center appearance-none focus:outline-none text-4xl p-3"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={'Enter your email'}
        ref={inputRef}
      />
      <button
        className="text-md text-white rounded-sm bg-slate-600 hover:bg-neutral-800 py-2"
        type="button"
      >
        Login with a magic link
      </button>
    </div>
  );
}

export default SignInModal;
