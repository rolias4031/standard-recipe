import React, { ReactNode, useRef, useState } from 'react';
import {
  useFloating,
  useInteractions,
  useHover,
  offset,
  FloatingArrow,
  arrow,
} from '@floating-ui/react';

interface TextWithTooltip {
  text: string;
  tooltipElement: ReactNode;
}

function TextWithTooltip({ text, tooltipElement }: TextWithTooltip) {
  const [isOpen, setIsOpen] = useState(false);

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'top',
    middleware: [offset(7), arrow({ element: arrowRef })],
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
  return (
    <>
      <span
        className="text-fern"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {text}
      </span>
      {isOpen ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
        >
          {tooltipElement}
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className="fill-fern"
          />
        </div>
      ) : null}
    </>
  );
}

export default TextWithTooltip;
