import { Draggable } from '@hello-pangea/dnd';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import {
  useDialogWithCustomParam,
  useFixedDialog,
} from 'components/common/dialog/hooks';
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
  optionsComponent: (handleToggleDialog: () => void) => ReactNode;
  isDisabled?: boolean;
}

function FlowInputBlock({
  id,
  order,
  mainInputComponent,
  secondaryInputComponent,
  optionsComponent,
  isDisabled,
}: FlowInputBlockProps) {
  const {
    router,
    isDialogOpen: isOptionDialogOpen,
    handleToggleDialog,
  } = useDialogWithCustomParam(`${order}-options`);

  const [isMainInputFocused, setIsMainInputFocused] = useState(false);

  return (
    <>
      <Draggable
        key={id}
        draggableId={id}
        index={order - 1}
        isDragDisabled={isDisabled}
      >
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
              onClick={() => {
                if (isDisabled) return;
                return handleToggleDialog(true)();
              }}
            >
              <span className="">{order}</span>
            </div>
            <div className="flex basis-full flex-col gap-2 md:flex-row">
              <div className="flex-grow">
                {mainInputComponent(isMainInputFocused, setIsMainInputFocused)}
              </div>
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
          onClose={handleToggleDialog(false)}
        >
          <div
            className="fixed left-0 right-0 bottom-0"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {optionsComponent(handleToggleDialog(false))}
          </div>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

export default FlowInputBlock;
