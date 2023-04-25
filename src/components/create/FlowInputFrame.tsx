import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { Dispatch, ReactNode, SetStateAction } from 'react';

interface FlowInputFrameProps {
  row1col1?: ReactNode;
  row1col2: ReactNode;
  row2col2?: ReactNode;
  row3col2?: ReactNode;
  innerRef?: (element?: HTMLElement | null | undefined) => void;
  draggableProps?: DraggableProvidedDraggableProps | null
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  raiseIsMouseIn?: Dispatch<SetStateAction<boolean>>;
}

function FlowInputFrame({
  row1col1,
  row1col2,
  row2col2,
  row3col2,
  innerRef,
  raiseIsMouseIn,
  draggableProps,
  dragHandleProps,
}: FlowInputFrameProps) {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 w-full group py-0"
      onMouseEnter={() => (raiseIsMouseIn ? raiseIsMouseIn(true) : null)}
      onMouseLeave={() => (raiseIsMouseIn ? raiseIsMouseIn(false) : null)}
    >
      <div
        {...dragHandleProps}
        className="font-mono text-sm col-start-1 w-6 flex items-center justify-end text-concrete transition-colors group-hover:text-abyss"
      >
        {row1col1 ?? null}
      </div>

      <div className="w-full col-start-2 flex items-stretch space-x-2">
        {row1col2}
      </div>
      {row2col2 ? (
        <div className="flex flex-col space-y-2 row-start-2 col-start-2 fade-in">
          <div className="flex items-center space-x-3 text-sm mt-1">
            {row2col2}
          </div>
          {row3col2}
        </div>
      ) : null}
    </div>
  );
}

export default FlowInputFrame;
