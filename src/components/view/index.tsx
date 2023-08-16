import SubstitutePill from 'components/common/SubstitutePill';
import InfoCircleIcon from 'components/common/icons/InfoCircleIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import { pickStyles } from 'lib/util-client';
import React, { ReactNode, useState } from 'react';

interface ItemBlockContainerProps {
  order?: number;
  children: ReactNode;
}

export function ItemBlockContainer({ children }: ItemBlockContainerProps) {
  return <div className="flex flex-col space-y-1 pl-3">{children}</div>;
}

interface ItemBlockHeaderProps {
  name: string;
  suffixContent?: ReactNode;
  expandedContent?: ReactNode;
  canExpand: boolean;
}

export function ItemBlock({
  name,
  suffixContent,
  expandedContent,
  canExpand,
}: ItemBlockHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ItemBlockContainer>
      <div
        className={pickStyles('flex w-full justify-between', [
          !isExpanded || !canExpand,
          'border-b pb-1',
        ])}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center space-x-2">
          <span className={pickStyles([isExpanded && canExpand, 'text-fern'])}>
            {name}
          </span>
          {canExpand ? (
            <InfoCircleIcon
              styles={{
                icon: pickStyles('w-6 h-6', [
                  isExpanded && canExpand,
                  'text-fern',
                  'text-neutral-300',
                ]),
              }}
            />
          ) : null}
        </div>
        {suffixContent}
      </div>
      {isExpanded && expandedContent ? expandedContent : null}
    </ItemBlockContainer>
  );
}

interface ItemBlockDetailProps {
  notes: string | null;
  substitutes: string[];
  optional: boolean;
}

export function ItemBlockDetail({ notes, substitutes, optional }: ItemBlockDetailProps) {
  const subs = substitutes.map((s) => (
    <SubstitutePill key={s} sub={s} pillStyle="abyss" />
  ));
  return (
    <div className="flex flex-col space-y-2 rounded-lg bg-smoke p-3 text-sm">
      {optional ? <span className='italic'>optional</span> : null}
      {notes ? <div>{notes}</div> : null}
      {subs.length > 0 ? (
        <div className="flex flex-col space-y-1">
          <div className="text-concrete underline">Substitutes</div>
          <div className="flex space-x-2">{subs}</div>
        </div>
      ) : null}
    </div>
  );
}
