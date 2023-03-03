import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import React from 'react';
import StandardRecipeLogo from './display/StandardRecipeLogo';
import LoadingSpinner from './util/LoadingSpinner';

interface NavBarProps {
  session: Session
}

function NavBar({ session }: NavBarProps) {
  return (
    <div className="flex items-center border-b mx-10 py-4">
      <StandardRecipeLogo styles={{ div: 'flex-1' }} />
      <div className="flex space-x-5 text-xs items-center">
        <div>{session?.user?.email}</div>
        <button onClick={() => signOut()} type="button" className="bg-black rounded-sm text-white px-2 py-1">Sign Out</button>
      </div>
    </div>
  );
}

export default NavBar;
