import React, { ReactNode } from 'react';

function InputsContainer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col space-y-3 border-y p-7">{children}</div>;
}

function StageFrame({ inputComponents }: { inputComponents: ReactNode[] }) {
  return (
    <section className="flex flex-col pt-10 pb-3 space-y-10 h-full">
      <InputsContainer>{inputComponents}</InputsContainer>
    </section>
  );
}

export default StageFrame;
