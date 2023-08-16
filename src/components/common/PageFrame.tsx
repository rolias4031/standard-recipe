import React, { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
  style?: string;
}

function PageFrame({ children, style }: PageFrameProps) {
  const frameClassName = style ? style : '';
  return <div className={frameClassName}>{children}</div>;
}

export default PageFrame;
