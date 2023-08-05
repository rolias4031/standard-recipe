import React, { ReactNode, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

interface StageFrameProps {
  stageInputComponents: ReactNode[];
  children?: ReactNode;
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
}

function StageFrame({
  stageInputComponents,
  children,
  droppableId,
  onDragEnd,
}: StageFrameProps) {
  return (
    <StageFrameCard>
      {children}
      <div className="flex flex-col space-y-1 rounded-lg">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={droppableId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col space-y-5"
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
    <section className="flex flex-col space-y-5">{children}</section>
  );
}

export default StageFrame;
