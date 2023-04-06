import { Recipe } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import { pickStyles } from 'lib/util-client';
import { GeneralButton } from 'pirate-ui';
import React, { ReactNode, useState } from 'react';
import IngredientsStage from './IngredientsStage';

function FlowProgress({ curStage }: { curStage: number }) {
  const dots = [1, 2, 3].map((i) => {
    return (
      <div
        key={i}
        className={pickStyles(
          'h-3 w-3 rounded-full border-2 border-neutral-800',
          [i === curStage, 'bg-neutral-800'],
        )}
      ></div>
    );
  });
  return <div className="flex space-x-1 items-center">{dots}</div>;
}

interface StageConfig {
  name: string;
}

const stageConfig = new Map<number, StageConfig>([
  [1, { name: 'Ingredients' }],
  [2, { name: 'Equipment' }],
  [3, { name: 'Instructions' }],
  [4, { name: 'Finishing Touches' }],
]);

interface FlowControllerProps {
  children: (stage: number) => ReactNode;
  onSave: () => void;
}

function FlowController({ children, onSave }: FlowControllerProps) {
  const [stage, setStage] = useState<number>(1);

  function nextStageHandler() {
    setStage((prev: number) => {
      if (prev === 4) return prev;
      if (prev >= 1) return prev + 1;
      return prev;
    });
  }

  function prevStageHandler() {
    setStage((prev: number) => {
      if (prev === 1) return prev;
      if (prev > 1) return prev - 1;
      return prev;
    });
  }

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex justify-between items-center">
        <div className="text-2xl text-primary font-bold">
          {stageConfig.get(stage)?.name}
        </div>
        <GeneralButton
          styles={{
            button:
              'btn-reg btn-primary',
          }}
          onClick={onSave}
        >
          Save
        </GeneralButton>
      </div>
      {children(stage)}
      <div className="flex justify-between items-center mt-auto">
        <GeneralButton
          styles={{
            button: 'btn-circle btn-primary scale',
          }}
          onClick={prevStageHandler}
        >
          <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
        <FlowProgress curStage={stage} />
        <GeneralButton
          styles={{
            button: 'btn-circle btn-primary scale',
          }}
          onClick={nextStageHandler}
        >
          <ArrowRightIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
      </div>
    </div>
  );
}

type FlowStage = 1 | 2 | 3 | 4;

interface CreateRecipeFlowProps {
  recipe: Recipe;
}

function CreateRecipeFlow({ recipe }: CreateRecipeFlowProps) {
  // state and mutations

  return (
    <FlowController onSave={() => {}}>
      {(stage) => (
        <>
          {stage === 1 ? <IngredientsStage /> : null}
          {stage === 2 ? <div>Equipment</div> : null}
          {stage === 3 ? <div>Instructions</div> : null}
        </>
      )}
    </FlowController>
  );
}

export default CreateRecipeFlow;
