import React from 'react';
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import { Dispatch, ReactNode, SetStateAction } from 'react';

const outerGridDiv =
  'group grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-1 py-0';

const row1col1styles =
  'col-start-1 flex w-6 items-center justify-end font-mono text-sm text-concrete transition-colors group-hover:text-abyss';

const row1col2styles = 'col-start-2 flex w-full items-stretch space-x-2';
const row2col1styles =
  'fade-in col-start-2 row-start-2 flex flex-col space-y-2';

const row2col2styles = 'mt-1 flex items-center space-x-3 text-sm';

interface FlowInputFrameProps {
  row1col1?: ReactNode;
  row1col2: ReactNode;
  row2col2?: ReactNode;
  row3col2?: ReactNode;
  innerRef?: (element?: HTMLElement | null | undefined) => void;
  draggableProps?: DraggableProvidedDraggableProps | null;
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
      className="flex flex-col"
      onMouseEnter={() => (raiseIsMouseIn ? raiseIsMouseIn(true) : null)}
      onMouseLeave={() => (raiseIsMouseIn ? raiseIsMouseIn(false) : null)}
    >
      <div className='flex'>
        <div {...dragHandleProps} className="">
          {row1col1 ?? null}
        </div>
        <div className="flex flex-col">{row1col2}</div>
        {row2col2 ? (
          <div className={row2col1styles}>
            <div className={row2col2styles}>{row2col2}</div>
            {row3col2}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FlowInputFrame;
