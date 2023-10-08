import { UseMutateFunction } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import {
  BasePayload,
  BaseZodSchema,
  Stage,
  UpdateInputMutationBody,
} from 'types/types';
import { createOneInUseInput, navigateToStage } from './utils';
import { StatusIconDisplay } from 'components/common/StatusIconDisplay';
import ButtonWithDialog from 'components/common/dialog/ButtonWithDialog';
import LightBulbIcon from 'components/common/icons/LightBulbIcon';
import { TipDialog } from './TipDialog';
import HamburgerIcon from 'components/common/icons/HamburgerIcon';
import CreateActionsMenu from './CreateActionsMenu';
import { pickStyles, stopRootDivPropagation } from 'lib/util-client';
import XIcon from 'components/common/icons/XIcon';
import PlusIcon from 'components/common/icons/PlusIcon';
import UpdateRecipeNameModal from './UpdateRecipeNameModal';
import CheckIcon from 'components/common/icons/CheckIcon';
import { ModalBackdrop } from 'components/common/ModalBackdrop';
import { usePublishRecipe } from 'lib/mutations';
import { StageTab } from 'components/edit/EditController';
import { useFixedDialog } from 'components/common/dialog/hooks';
import { isStringType } from 'types/util';
import FailedImportsModal from './FailedImportsModal';

function useExtractQueryParams() {
  const router = useRouter();
  const { failedImports } = router.query;
  if (Array.isArray(failedImports) && !isStringType(failedImports)) {
    return { router, failedImports };
  }
  return { router, failedImports: undefined };
}

export function useControllerModalStates() {
  const {
    isDialogOpen: isEditingNameDialogOpen,
    handleToggleDialog: handleToggleEditNameDialog,
  } = useFixedDialog();
  const {
    isDialogOpen: isPublishDialogOpen,
    handleToggleDialog: handleTogglePublishDialog,
  } = useFixedDialog();
  return {
    isEditingNameDialogOpen,
    handleToggleEditNameDialog,
    isPublishDialogOpen,
    handleTogglePublishDialog,
  };
}

export interface CreateControllerConfig<T> {
  inputs?: T[];
  inUseInputs?: T[];
  dispatchInputs?: Dispatch<SetStateAction<T[]>>;
  updateInputsMutation?: UseMutateFunction<
    BasePayload,
    unknown,
    UpdateInputMutationBody<T[]>,
    unknown
  >;
  cancelTriggeredUpdate?: () => void;
  updateStatus: string;
  schema?: BaseZodSchema;
  stageName: string;
  stageLabel: string;
}

export interface CreateControllerProps<T extends { id: string }> {
  children: ReactNode;
  stage: Stage;
  recipeName: string;
  recipeId: string;
  isAnyUpdateLoadingOrErrorOrTriggered: boolean;
  controllerConfig: CreateControllerConfig<T>;
  extraHeaderComponent?: ReactNode;
}

export default function CreateController<
  T extends { id: string; order: number; inUse: boolean },
>({
  children,
  stage,
  recipeName,
  recipeId,
  isAnyUpdateLoadingOrErrorOrTriggered,
  controllerConfig,
  extraHeaderComponent,
}: CreateControllerProps<T>) {
  const { router, failedImports } = useExtractQueryParams();

  const {
    stageName,
    inUseInputs,
    dispatchInputs,
    schema,
    updateInputsMutation,
    updateStatus,
    cancelTriggeredUpdate,
  } = controllerConfig;

  const {
    isEditingNameDialogOpen,
    handleToggleEditNameDialog,
    isPublishDialogOpen,
    handleTogglePublishDialog,
  } = useControllerModalStates();

  const [isError, setIsError] = useState<boolean>(false);

  function changeStageHandler(newStage: Stage) {
    return () => {
      if (!inUseInputs || !schema) return;
      if (cancelTriggeredUpdate) {
        console.log('CANCELED');
        cancelTriggeredUpdate();
      }
      for (const input of inUseInputs) {
        const isValid = schema.safeParse(input);
        if (!isValid.success) {
          setIsError(true);
          return;
        }
      }
      setIsError(false);
      if (updateInputsMutation) {
        console.log('MUTATION FIRED');
        updateInputsMutation({ inputs: inUseInputs, recipeId });
      }
      navigateToStage(router, { recipeId, stage: newStage, shallow: true });
    };
  }

  function createNewInputHandler() {
    if (!dispatchInputs) return;
    dispatchInputs((prev: T[]) => {
      return createOneInUseInput(prev);
    });
  }

  function enterPreviewModeHandler() {
    if (isAnyUpdateLoadingOrErrorOrTriggered) return;
    window.localStorage.setItem('previous_stage', stage);
    router.push({
      pathname: '/view/[recipeId]',
      query: { recipeId },
    });
  }

  return (
    <>
      <ControllerContainer>
        <div className="sticky top-0 z-10 bg-white px-4 pt-4 shadow-md shadow-neutral-600 md:px-10 md:pt-6">
          <div className="flex items-center">
            <div className="flex-1 truncate text-lg text-concrete">
              {recipeName}
            </div>
            <div className="flex space-x-4 text-lg">
              {failedImports ? (
                <ButtonWithDialog
                  styles={{
                    button: {
                      default:
                        'px-2 bg-indigo-500 text-white font-mono text-sm rounded-lg',
                    },
                  }}
                  buttonContent={'failed imports'}
                  dialogComponent={(handleToggleDialog) => (
                    <FailedImportsModal
                      onToggleDialog={handleToggleDialog(false)}
                      failedImports={failedImports}
                    />
                  )}
                />
              ) : null}
              <ButtonWithDialog
                styles={{
                  button: {
                    default: 'p-1 rounded-lg bg-fern',
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
                styles={{
                  button: {
                    default: 'p-1 rounded-lg bg-fern',
                  },
                }}
                buttonContent={
                  <HamburgerIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                }
                dialogComponent={() => (
                  <CreateActionsMenu
                    areButtonsDisabled={isAnyUpdateLoadingOrErrorOrTriggered}
                    onOpenEditName={handleToggleEditNameDialog(true)}
                    onEnterPreviewMode={enterPreviewModeHandler}
                  />
                )}
              />
            </div>
          </div>
          {extraHeaderComponent ? extraHeaderComponent : null}
          <div className="flex items-center justify-between pt-3">
            <StageTab
              onChangeStage={changeStageHandler('ingredients')}
              curStage={stage}
              stage="ingredients"
            />
            <StageTab
              onChangeStage={changeStageHandler('equipment')}
              curStage={stage}
              stage="equipment"
            />
            <StageTab
              onChangeStage={changeStageHandler('instructions')}
              curStage={stage}
              stage="instructions"
            />
          </div>
        </div>
        <StageContentContainer>{children}</StageContentContainer>
        <ControllerFooter>
          {isError ? (
            <div className="w-full p-3">
              <StageError
                stageName={stageName.toLowerCase()}
                raiseIsError={setIsError}
              />
            </div>
          ) : null}
          <div
            className={pickStyles('flex w-full items-end pb-5', [
              stage === 'instructions',
              'justify-between',
              'justify-end',
            ])}
          >
            {stage === 'instructions' ? (
              <button
                disabled={isAnyUpdateLoadingOrErrorOrTriggered}
                className="flex items-center space-x-2 rounded-r-lg bg-fern p-4 font-mono text-lg text-white shadow-md shadow-abyss/50 disabled:bg-smoke"
                onClick={handleTogglePublishDialog(true)}
              >
                <span>Publish</span>
                <CheckIcon styles={{ icon: 'w-7 h-7 text-white' }} />
              </button>
            ) : null}
            <div className="flex flex-col items-center space-y-2">
              <StatusIconDisplay status={updateStatus} size="10" />
              <button
                type="button"
                className="flex w-fit items-center justify-center rounded-l-lg bg-fern p-4 shadow-md shadow-abyss/50"
                onClick={createNewInputHandler}
              >
                <PlusIcon styles={{ icon: 'w-12 h-12 text-white' }} />
              </button>
            </div>
          </div>
        </ControllerFooter>
      </ControllerContainer>
      {isEditingNameDialogOpen ? (
        <UpdateRecipeNameModal
          recipeId={recipeId}
          curRecipeName={recipeName}
          onCloseModal={handleToggleEditNameDialog(false)}
        />
      ) : null}
      {isPublishDialogOpen ? (
        <PublishModal
          recipeId={recipeId}
          onClose={handleTogglePublishDialog(false)}
        />
      ) : null}
    </>
  );
}

export function ControllerContainer({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col">{children}</div>;
}

export function AddNewInputButton({
  onAddNewInput,
}: {
  onAddNewInput: () => void;
}) {
  return (
    <button
      type="button"
      className="ml-auto flex w-fit items-center justify-center rounded-l-xl bg-fern px-3 py-2 text-white shadow-md shadow-abyss/50 transition-all hover:bg-jungle active:bg-jungle lg:w-32"
      onClick={onAddNewInput}
    >
      <PlusIcon styles={{ icon: 'w-12 h-12 text-white' }} />
    </button>
  );
}

export function ControllerFooter({ children }: { children: ReactNode }) {
  return <div className="fixed left-0 right-0 bottom-0">{children}</div>;
}

export function StageContentContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex-grow overflow-y-auto px-4 py-5 md:p-10">
      {children}
      <div className="h-52" />
    </div>
  );
}

interface ControllerHeaderPanelProps {
  recipeName: string;
  stageLabel: string;
  extraHeaderComponent?: ReactNode;
  children: ReactNode;
}

export function ControllerHeader({
  recipeName,
  stageLabel,
  extraHeaderComponent,
  children,
}: ControllerHeaderPanelProps) {
  return (
    <div className="sticky top-0 bg-white p-4 shadow-md shadow-concrete md:px-10 md:py-6">
      <div className="w-full truncate text-lg text-concrete">{recipeName}</div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-xl text-abyss">{stageLabel}</div>
        {children}
      </div>
      {extraHeaderComponent ? extraHeaderComponent : null}
    </div>
  );
}

function StageError({
  stageName,
  raiseIsError,
}: {
  stageName?: string;
  raiseIsError: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col rounded-lg bg-red-400 p-1 text-white">
      <button className="ml-auto" onClick={() => raiseIsError(false)}>
        <XIcon styles={{ icon: 'w-5 h-5' }} />
      </button>
      <p className="px-3 pb-3">
        {`One or more of your ${stageName} has missing or invalid info. Recheck each field for errors.
    `}
      </p>
    </div>
  );
}

interface PublishModalProps {
  onClose: () => void;
  recipeId: string;
}

function PublishModal({ onClose, recipeId }: PublishModalProps) {
  const { mutate, status } = usePublishRecipe();
  const router = useRouter();
  function handlePublishRecipe() {
    mutate(
      { recipeId },
      {
        onSuccess: () => {
          const viewUrl = `/view/[recipeId]`;
          router.push({
            pathname: viewUrl,
            query: { recipeId, new: 'true' },
          });
        },
      },
    );
  }
  return (
    <ModalBackdrop modalRoot="modal-root" onClose={onClose}>
      <div
        className="fixed left-0 right-0 bottom-0 rounded-t-2xl bg-white p-5"
        onClick={stopRootDivPropagation}
      >
        <div className="mb-10 flex flex-col space-y-4 text-xl">
          <h1 className="text-center font-mono text-3xl">Wait!</h1>
          <p className="text-center">
            {"Have you taken advantage of Standard Recipe's best features?"}
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <button
            className="rounded-lg bg-smoke py-5 px-2 text-2xl"
            onClick={onClose}
          >
            <div className="text-center">
              <span>No, view our </span>
              <span className="">
                tips{' '}
                <LightBulbIcon
                  styles={{
                    icon: 'w-8 h-8 bg-fern text-white inline p-1 rounded',
                  }}
                />
              </span>
              <span> before publishing</span>
            </div>
          </button>
          <button
            className="rounded-lg bg-fern py-5 px-2 text-2xl text-white"
            onClick={handlePublishRecipe}
          >
            {'Yes, publish my recipe!'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
