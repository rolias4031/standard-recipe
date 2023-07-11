import React, { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
  styles: {
    div: string;
  };
}

function PageFrame({ children, styles }: PageFrameProps) {
  return (
    <div id="page-root" className={styles.div}>
      {children}
    </div>
  );
}

export default PageFrame;
