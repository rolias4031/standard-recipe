import React, { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
  styles: {
    div: string;
  };
}

function PageFrame({ children, styles }: PageFrameProps) {
  return <div className={styles.div}>{children}</div>;
}

export default PageFrame;
