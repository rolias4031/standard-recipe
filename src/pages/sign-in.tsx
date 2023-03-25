import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex h-screen justify-center items-center">
      <SignIn  signUpUrl='/signup'/>
    </div>
  );
}
