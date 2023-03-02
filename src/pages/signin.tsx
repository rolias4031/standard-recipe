import React from 'react';
import { useSession } from 'next-auth/react';
import Redirect from 'components/util/Redirect';
import SignInModal from 'components/auth/SignInModal';

export default function SignIn() {
  const session = useSession();
  return session.status === 'authenticated' ? (
    <Redirect path="/" />
  ) : (
    <div className="flex lg:w-3/4 w-5/6 mx-auto h-screen">
      <SignInModal styles={{ div: 'flex flex-col my-auto w-full' }} />
    </div>
  );
}
