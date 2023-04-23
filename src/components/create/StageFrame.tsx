import React, { ReactNode } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

function InputsContainer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col space-y-3 border-y p-7">{children}</div>;
}

interface StageFrameProps {
  inputComponents: ReactNode[];
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
}

function StageFrame({
  inputComponents,
  droppableId,
  onDragEnd,
}: StageFrameProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <section className="flex flex-col pt-10 pb-3 space-y-10 h-full">
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col space-y-3 border-y p-7"
            >
              {inputComponents}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </section>
    </DragDropContext>
  );
}

export default StageFrame;
