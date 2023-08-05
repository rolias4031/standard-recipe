import { Draggable } from '@hello-pangea/dnd';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { useDynamicDialog } from 'components/common/dialog/hooks';
import { pickStyles } from 'lib/util-client';
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

interface FlowInputBlockProps {
  id: string;
  order: number;
  mainInputComponent: (
    isMainInputFocused: boolean,
    setIsMainInputFocused: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
  secondaryInputComponent?: ReactNode;
  optionsComponent: ReactNode;
}

function FlowInputBlock({
  id,
  order,
  mainInputComponent,
  secondaryInputComponent,
  optionsComponent,
}: FlowInputBlockProps) {
  const {
    anchorRef,
    isDialogOpen: isOptionDialogOpen,
    dialogPosition: OptionDialogPosition,
    handleToggleDialog,
  } = useDynamicDialog<HTMLDivElement>();

  const [isMainInputFocused, setIsMainInputFocused] = useState(false);

  return (
    <>
      <Draggable key={id} draggableId={id} index={order - 1}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="flex flex-row gap-2 text-lg"
          >
            <div
              {...provided.dragHandleProps}
              className={pickStyles(
                'flex items-center rounded px-2 font-mono text-white',
                [isOptionDialogOpen, 'bg-fern', 'bg-abyss'],
              )}
              onClick={() => handleToggleDialog('open')}
              ref={anchorRef}
            >
              <span className="">{order}</span>
            </div>
            <div className="flex basis-full flex-col gap-2 md:flex-row">
              <div className="flex-grow">{mainInputComponent(isMainInputFocused, setIsMainInputFocused)}</div>
              {secondaryInputComponent ? (
                <div className="flex gap-2 md:basis-1/2">
                  {secondaryInputComponent}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Draggable>
      {isOptionDialogOpen ? (
        <ModalBackdrop
          modalRoot="modal-root"
          opacity="50"
          onClose={() => handleToggleDialog('close')}
        >
          <div
            className="fixed left-0 right-0 bottom-0"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {optionsComponent}
          </div>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

export default FlowInputBlock;
