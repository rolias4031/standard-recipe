import React, { ReactNode } from 'react';
import { RecipeViewProps, useGetOnlyInUseInputs } from './RecipePreview';
import IngredientsView from './IngredientsView';
import EquipmentView from './EquipmentView';
import InstructionsView from './InstructionsView';
import HamburgerIcon from 'components/common/icons/HamburgerIcon';
import { useFixedDialog } from 'components/common/dialog/hooks';
import XIcon from 'components/common/icons/XIcon';
import Link from 'next/link';
import { createShareUrl } from 'lib/util-client';
import ClipboardIcon from 'components/common/icons/ClipboardIcon';
import { useCopyToClipboard } from 'components/common/hooks';

interface ControllerProps {
  children: ReactNode;
  recipeName: string;
  recipeId: string;
}

function Controller({ children, recipeName, recipeId }: ControllerProps) {
  const { isCopiedToClipboard, copyToClipboardHandler } = useCopyToClipboard();

  const { isDialogOpen, handleToggleDialog } = useFixedDialog();
  return (
    <>
      <div className="mb-28">
        <div className="sticky top-0 z-10 mb-1 flex flex-col space-y-3 bg-white px-3 py-3 shadow-md shadow-concrete md:px-16">
          <div className="flex items-center justify-between text-fern">
            <div className="text-lg text-concrete">{recipeName}</div>
            <button className="" onClick={handleToggleDialog()}>
              {isDialogOpen ? (
                <XIcon styles={{ icon: 'w-10 h-10 text-fern' }} />
              ) : (
                <HamburgerIcon styles={{ icon: 'w-10 h-10 text-fern' }} />
              )}
            </button>
          </div>
          {isDialogOpen ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <button
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-fern py-2 font-mono text-lg text-white"
                onClick={() => copyToClipboardHandler(createShareUrl(recipeId))}
              >
                {isCopiedToClipboard ? (
                  <p className="">
                    url copied
                  </p>
                ) : (
                  <>
                    <p className="inline">Share</p>
                    <ClipboardIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                  </>
                )}
              </button>{' '}
              <Link
                className="w-full rounded-lg bg-fern p-2 text-center font-mono text-lg text-white"
                href={'/me'}
              >
                Home
              </Link>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col space-y-3 px-3 py-2 md:px-16">
          {children}
        </div>
      </div>
    </>
  );
}

interface PublishedViewProps extends RecipeViewProps {
  isNewlyPublished?: string;
}

function PublishedView({
  recipe,
  allUnits,
  isNewlyPublished,
}: PublishedViewProps) {
  const { inUseEquipment, inUseIngredients, inUseInstructions } =
    useGetOnlyInUseInputs(recipe);

  return (
    <Controller recipeName={recipe.name} recipeId={recipe.id}>
      <IngredientsView ingredients={inUseIngredients} allUnits={allUnits} />
      <EquipmentView equipment={inUseEquipment} />
      <InstructionsView
        allUnits={allUnits}
        equipment={inUseEquipment}
        ingredients={inUseIngredients}
        instructions={inUseInstructions}
      />
    </Controller>
  );
}

export default PublishedView;
