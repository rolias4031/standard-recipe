import React, { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
  styles?: {
    div: string;
  };
}

function PageFrame({ children, styles }: PageFrameProps) {
  return (
    <div id="page-root" className={styles?.div}>
      {children}
    </div>
  );
}

PageFrame.defaultProps = {
  styles: {
    div: 'p-5 mx-auto min-h-screen md:w-5/6 md:p-10',
  },
};

export default PageFrame;
