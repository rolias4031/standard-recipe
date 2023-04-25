import React, { ReactNode } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import FlowInputFrame from './FlowInputFrame';

function InputsContainer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col space-y-3 border-y p-7">{children}</div>;
}

function InputLabelsRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 w-full group py-0">
      <div className="col-start-1 w-6" />
      <div className="flex col-start-2 space-x-2 font-mono text-sm">
        {children}
      </div>
    </div>
  );
}

interface StageFrameProps {
  stageInputLabels: ReactNode;
  stageInputComponents: ReactNode[];
  children?: ReactNode;
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
}

function StageFrame({
  stageInputComponents,
  children,
  stageInputLabels,
  droppableId,
  onDragEnd,
}: StageFrameProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <section className="flex flex-col pt-10 pb-3 space-y-5 h-full">
        {children}
        <div className="flex flex-col border-y space-y-1 px-5 py-10">
          <FlowInputFrame row1col2={stageInputLabels} />
          <Droppable droppableId={droppableId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col space-y-3"
              >
                {stageInputComponents}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </section>
    </DragDropContext>
  );
}

export default StageFrame;
