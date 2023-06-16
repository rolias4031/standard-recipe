import React, { ReactNode, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import FlowInputFrame from './FlowInputFrame';

interface StageFrameProps {
  stageInputLabels: ReactNode;
  stageInputComponents: ReactNode[];
  children?: ReactNode;
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
  mutationStatus: string;
}

function StageFrame({
  stageInputComponents,
  children,
  stageInputLabels,
  droppableId,
  onDragEnd,
  mutationStatus,
}: StageFrameProps) {
  return (
    <StageFrameCard>
      {children}
      <div className="ml-auto py-2">
        <InlineStatusDisplay status={mutationStatus} />
      </div>
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
    <section className="flex h-full flex-col pt-10 pb-3">{children}</section>
  );
}

export function InlineStatusDisplay({ status }: { status: string }) {
  const statusDisplayConfig = useMemo(
    () =>
      new Map<string, ReactNode>([
        [
          'loading',
          <span className="text-fade-in" key="1">
            autosaving
          </span>,
        ],
        ['success', <span key="2">saved</span>],
        ['error', <span key="3">error</span>],
        [
          'idle',
          <span className="opacity-0" key="4">
            null
          </span>,
        ],
      ]),
    [],
  );
  return (
    <div className="text-xs text-concrete">
      {statusDisplayConfig.get(status)}
    </div>
  );
}

export default StageFrame;
