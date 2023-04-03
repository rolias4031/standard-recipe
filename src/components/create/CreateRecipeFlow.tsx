import { Recipe } from '@prisma/client';
import ArrowLeftIcon from 'components/common/icons/ArrowLeftIcon';
import ArrowRightIcon from 'components/common/icons/ArrowRightIcon';
import { GeneralButton } from 'pirate-ui';
import React, { ReactNode, useState } from 'react';
import IngredientsStage from './IngredientsStage';

function FlowProgress({ curStage }: { curStage: number }) {
  const dots = [1, 2, 3].map((i) => {
    return (
      <div
        key={i}
        className={`w-2 h-2 rounded-full border border-green-600 ${
          i === curStage && 'bg-green-600'
        }`}
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
    <div className="p-10">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold font-serif">
          {stageConfig.get(stage)?.name}
        </div>
        <GeneralButton
          styles={{
            button:
              'px-2 py-1 rounded-sm bg-green-600 font-semibold text-sm text-white',
          }}
          onClick={onSave}
        >
          Save
        </GeneralButton>
      </div>
      {children(stage)}
      <div className="flex justify-between items-center">
        <GeneralButton
          styles={{
            button: 'bg-green-600 rounded-full p-1',
          }}
          onClick={prevStageHandler}
        >
          <ArrowLeftIcon styles={{ icon: 'w-7 h-7 text-white' }} />
        </GeneralButton>
        <FlowProgress curStage={stage} />
        <GeneralButton
          styles={{
            button: 'bg-green-600 rounded-full p-1',
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
