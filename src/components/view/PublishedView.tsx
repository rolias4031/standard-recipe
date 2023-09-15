import React, { ReactNode, useEffect, useRef, useState } from 'react';
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
import CheckIcon from 'components/common/icons/CheckIcon';
import { ModalBackdrop } from 'components/common/ModalBackdrop';

function useCopyToClipboard() {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (!isCopiedToClipboard) return;
    const id = setTimeout(() => {
      setIsCopiedToClipboard(false);
    }, 5000);
    return () => clearTimeout(id);
  }, [isCopiedToClipboard]);

  async function copyToClipboardHandler(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedToClipboard(true);
    } catch (err) {
      alert('Error in copying text: ' + err);
    }
  }

  return { isCopiedToClipboard, copyToClipboardHandler };
}

async function copyToClipboardHandler(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert('Text copied to clipboard');
  } catch (err) {
    alert('Error in copying text: ' + err);
  }
}

interface ControllerProps {
  children: ReactNode;
  recipeName: string;
  recipeId: string;
}

function Controller({ children, recipeName, recipeId }: ControllerProps) {
  // needs menu for: home button, share, etc
  // can either use ButtonWithDialog or just manually render

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
                className="flex w-full space-x-2 items-center justify-center rounded-lg bg-fern p-2 font-mono text-lg text-white"
                onClick={() => copyToClipboardHandler(createShareUrl(recipeId))}
              >
                <p className="inline">Share</p>
                {isCopiedToClipboard ? (
                  // <CheckIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                  <p className="bg-white py-1 px-2 text-sm text-fern rounded-full">
                    url copied!
                  </p>
                ) : (
                  <ClipboardIcon styles={{ icon: 'w-7 h-7 text-white' }} />
                )}
              </button>
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
