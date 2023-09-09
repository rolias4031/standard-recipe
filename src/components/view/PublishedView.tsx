import React, { ReactNode, useState } from 'react';
import { RecipeViewProps, useGetOnlyInUseInputs } from './RecipePreview';
import IngredientsView from './IngredientsView';
import Equipment from 'pages/api/recipe/update/equipment';
import EquipmentView from './EquipmentView';
import InstructionsView from './InstructionsView';
import HamburgerIcon from 'components/common/icons/HamburgerIcon';
import { useFixedDialog } from 'components/common/dialog/hooks';
import XIcon from 'components/common/icons/XIcon';
import Link from 'next/link';

interface ControllerProps {
  children: ReactNode;
  recipeName: string;
}

function Controller({ children, recipeName }: ControllerProps) {
  // needs menu for: home button, share, etc
  // can either use ButtonWithDialog or just manually render
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
              <button className="w-full rounded-lg bg-fern p-2 font-mono text-lg text-white">
                Share
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
    <Controller recipeName={recipe.name}>
      <IngredientsView ingredients={inUseIngredients} />
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
