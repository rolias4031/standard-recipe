import CharCount from 'components/common/CharCount';
import React, { Dispatch, SetStateAction } from 'react';
import { RecipeGeneralInfo } from 'types/models';
import { StageFrameCard } from './StageFrame';

interface InfoStageProps {
  generalInfo: RecipeGeneralInfo;
  raiseGeneralInfo: Dispatch<SetStateAction<RecipeGeneralInfo>>;
}

function InfoStage({ generalInfo, raiseGeneralInfo }: InfoStageProps) {
  function updateInfoHandler() {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      raiseGeneralInfo((prev: RecipeGeneralInfo) => {
        return { ...prev, [e.target.name]: e.target.value };
      });
  }

  return (
    <StageFrameCard>
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          name="name"
          className="text-2xl outline-none"
          value={generalInfo.name}
          onChange={updateInfoHandler()}
        />
        <div className="flex flex-col">
          <label htmlFor="recipe-description">Description</label>
          <textarea
            id="recipe-description"
            name="description"
            className="inp-reg inp-primary"
            placeholder=""
            rows={5}
            value={generalInfo.description ?? ''}
            onChange={updateInfoHandler()}
          />
          <CharCount string={generalInfo.description ?? ''} charLimit={250} />
        </div>
      </div>
    </StageFrameCard>
  );
}

export default InfoStage;
