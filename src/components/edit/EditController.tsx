import { useQueryClient } from '@tanstack/react-query';
import { StatusIconDisplay } from 'components/common/StatusIconDisplay';
import ButtonWithDialog from 'components/common/dialog/ButtonWithDialog';
import { useFixedDialog } from 'components/common/dialog/hooks';
import HamburgerIcon from 'components/common/icons/HamburgerIcon';
import LightBulbIcon from 'components/common/icons/LightBulbIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import {
  ControllerContainer,
  ControllerFooter,
  CreateControllerProps,
  StageContentContainer,
} from 'components/create/CreateController';
import FlowActionsMenu from 'components/create/CreateActionsMenu';
import { TipDialog } from 'components/create/TipDialog';
import UpdateRecipeNameModal from 'components/create/UpdateRecipeNameModal';
import { createOneInUseInput, navigateToStage } from 'components/create/utils';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Stage } from 'types/types';

interface EditControllerProps<
  T extends { id: string; order: number; inUse: boolean },
> extends CreateControllerProps<T> {
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  isEditMode: boolean;
}

export function EditController<
  T extends { id: string; order: number; inUse: boolean },
>({
  children,
  controllerConfig,
  isAnyUpdateLoadingOrErrorOrTriggered,
  recipeId,
  recipeName,
  stage,
  extraHeaderComponent,
  isEditMode,
  onEnterEditMode,
  onCancelEditMode,
}: EditControllerProps<T>) {
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const {
    stageLabel,
    updateStatus,
    dispatchInputs,
    inUseInputs,
    schema,
    updateInputsMutation,
  } = controllerConfig;
  const { isDialogOpen: isEditNameDialogOpen, handleToggleDialog } =
    useFixedDialog();
  const queryClient = useQueryClient();

  async function saveUpdatesHandler() {
    if (!inUseInputs || !schema) return;
    for (const input of inUseInputs) {
      const isValid = schema.safeParse(input);
      if (!isValid.success) {
        setIsError(true);
        return;
      }
    }
    setIsError(false);
    if (updateInputsMutation) {
      updateInputsMutation(
        { inputs: inUseInputs, recipeId },
        {
          onSuccess: () => {
            queryClient.refetchQueries(['recipe']);
          },
        },
      );
    }
  }
  function changeStageHandler(newStage: Stage) {
    return () =>
      navigateToStage(router, {
        recipeId,
        stage: newStage,
        shallow: true,
      });
  }

  function createNewInputHandler() {
    if (!dispatchInputs) return;
    dispatchInputs((prev: T[]) => {
      return createOneInUseInput(prev);
    });
  }

  return (
    <>
      <ControllerContainer>
        <div className="sticky top-0 z-10 bg-white px-4 pt-4 shadow-md shadow-neutral-600 md:px-10 md:pt-6">
          <div className="flex items-center">
            <div className="w-full truncate text-lg text-concrete">
              {recipeName}
            </div>
            <div className="flex space-x-4 text-lg">
              <ButtonWithDialog
                dialogParamName="tips"
                styles={{
                  button: {
                    default: 'p-1 rounded-lg bg-fern',
                    isDialogOpen: ['', ''],
                  },
                }}
                buttonContent={
                  <LightBulbIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                }
                dialogComponent={(handleToggleDialog) => (
                  <TipDialog onClose={handleToggleDialog(false)} />
                )}
              />
              <ButtonWithDialog
                dialogParamName="menu"
                styles={{
                  button: {
                    default: 'p-1 rounded-lg bg-fern',
                    isDialogOpen: ['', ''],
                  },
                }}
                buttonContent={
                  <HamburgerIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                }
                dialogComponent={() => (
                  <FlowActionsMenu
                    areButtonsDisabled={isAnyUpdateLoadingOrErrorOrTriggered}
                    onOpenEditName={handleToggleDialog(true)}
                    recipeId={recipeId}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3">
            <StageTab
              onChangeStage={changeStageHandler('ingredients')}
              curStage={stage}
              stage="ingredients"
              isDisabled={isEditMode}
            />
            <StageTab
              onChangeStage={changeStageHandler('equipment')}
              curStage={stage}
              stage="equipment"
              isDisabled={isEditMode}
            />
            <StageTab
              onChangeStage={changeStageHandler('instructions')}
              curStage={stage}
              stage="instructions"
              isDisabled={isEditMode}
            />
          </div>
          {extraHeaderComponent ? extraHeaderComponent : null}
        </div>
        <StageContentContainer>{children}</StageContentContainer>
        <ControllerFooter>
          <div className="flex w-full items-end justify-between space-x-5 pb-5 font-mono text-xl text-white md:pb-10">
            {isEditMode ? (
              <div className="flex items-center space-x-2">
                <button
                  className="rounded-r-lg border-b border-t border-r bg-abyss p-4 shadow-md shadow-abyss/50"
                  onClick={onCancelEditMode}
                >
                  Cancel
                </button>
                <span className="">
                  <StatusIconDisplay status={updateStatus} size="10" />
                </span>
              </div>
            ) : (
              <button
                className="rounded-r-lg border-b border-t border-r bg-fern p-4 shadow-md shadow-abyss/50"
                onClick={onEnterEditMode}
              >
                Edit
              </button>
            )}
            {isEditMode ? (
              <div className="rounded-l-lg border-l border-t border-b bg-fern shadow-md shadow-abyss/50">
                <button
                  type="button"
                  className="flex w-fit items-center justify-center border-b p-4"
                  onClick={createNewInputHandler}
                >
                  <PlusIcon styles={{ icon: 'w-12 h-12 text-white' }} />
                </button>
                <button className="w-full p-4" onClick={saveUpdatesHandler}>
                  Save
                </button>
              </div>
            ) : null}
          </div>
        </ControllerFooter>
      </ControllerContainer>
      {isEditNameDialogOpen ? (
        <UpdateRecipeNameModal
          curRecipeName={recipeName}
          onCloseModal={handleToggleDialog(false)}
          recipeId={recipeId}
        />
      ) : null}
    </>
  );
}

export function StageTab({
  stage,
  curStage,
  onChangeStage,
  isDisabled,
}: {
  stage: Stage;
  curStage: Stage;
  onChangeStage: () => void;
  isDisabled?: boolean;
}) {
  const styles = curStage === stage ? 'bg-abyss text-white' : 'text-concrete';
  return (
    <button
      disabled={isDisabled}
      onClick={onChangeStage}
      className={`${styles} basis-1/3 rounded-t-lg py-3 font-mono text-sm md:text-lg`}
    >
      {stage}
    </button>
  );
}

export default EditController;
