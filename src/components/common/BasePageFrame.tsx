import React, { ReactNode } from 'react';

function BasePageFrame({ children }: { children: ReactNode }) {
  return <div className="">{children}</div>;
}

export default BasePageFrame;
