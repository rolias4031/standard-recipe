import React from 'react';
import { SignUp } from '@clerk/nextjs';


export default function SignInPage() {
  return (
    <div className="flex h-screen justify-center items-center">
      <SignUp signInUrl='/sign-in'/>
    </div>
  );
}
