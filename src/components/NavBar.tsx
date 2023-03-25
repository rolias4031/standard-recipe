import React from 'react';
import { UserButton } from '@clerk/nextjs';
import StandardRecipeLogo from './display/StandardRecipeLogo';

interface NavBarProps {
  styles: {
    div: string;
  };
}

function NavBar({ styles }: NavBarProps) {
  return (
    <div className={styles.div}>
      <StandardRecipeLogo styles={{ div: 'flex-1' }} />
      <div className="flex space-x-5 text-xs items-center">
        <UserButton />
      </div>
    </div>
  );
}

export default NavBar;
