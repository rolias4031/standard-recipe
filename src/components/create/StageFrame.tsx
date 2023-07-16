import React, { ReactNode, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import FlowInputFrame from './FlowInputFrame';

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
    <StageFrameCard>
      {children}
      <div className="flex flex-col space-y-1 rounded-lg border px-5 py-10">
        <FlowInputFrame row1col2={stageInputLabels} />
        <DragDropContext onDragEnd={onDragEnd}>
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
        </DragDropContext>
      </div>
    </StageFrameCard>
  );
}

export function StageFrameCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full flex-col pt-10 pb-3 space-y-5">{children}</section>
  );
}

export default StageFrame;
