import React from 'react';
import { IngredientWithAll } from 'types/models';
import ViewSectionContainer from './ViewSectionContainer';
import { ItemBlock, ItemBlockDetail } from '.';
import {
  getAppropriateUnitsByProperty,
  useSortUnitsByProperty,
} from 'lib/parsing/utils';
import { IngredientUnit } from '@prisma/client';
import MeasurementDialog from 'components/common/dialog/MeasurementDialog';
import { useFixedDialog } from 'components/common/dialog/hooks';
import { ModalBackdrop } from 'components/common/ModalBackdrop';

interface IngredientBlockProps {
  ingredient: IngredientWithAll;
  propertyUnits: IngredientUnit[] | undefined;
}

function IngredientBlock({ ingredient, propertyUnits }: IngredientBlockProps) {
  const { isDialogOpen: isMeasurementDialogOpen, handleToggleDialog } =
    useFixedDialog();
  const hasDetails =
    (ingredient.notes !== null && ingredient.notes.length > 0) ||
    ingredient.substitutes.length > 0 ||
    ingredient.optional;

  return (
    <>
      <ItemBlock
        name={ingredient.name?.name ?? ''}
        suffixContent={
          <button
            className="flex space-x-1 font-mono"
            onClick={handleToggleDialog()}
          >
            <div>{ingredient.quantity}</div>
            <div>{ingredient.unit?.abbreviation}</div>
          </button>
        }
        expandedContent={
          hasDetails ? (
            <ItemBlockDetail
              notes={ingredient.notes}
              optional={ingredient.optional}
              substitutes={ingredient.substitutes.map((s) => s.name)}
            />
          ) : null
        }
        canExpand={hasDetails}
      />
      {isMeasurementDialogOpen && ingredient.unit ? (
        <ModalBackdrop
          modalRoot="modal-root"
          onClose={handleToggleDialog(false)}
          opacity="0"
        >
          <div className="fixed top-3 right-3 left-3 md:top-16 md:right-1/4 md:left-1/4">
            <MeasurementDialog
              measurement={{
                ...ingredient.unit,
                quantity: ingredient.quantity.toString(),
              }}
              propertyUnits={propertyUnits}
              onCloseDialog={handleToggleDialog(false)}
            />
          </div>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

interface IngredientsViewProps {
  ingredients: IngredientWithAll[];
  allUnits: IngredientUnit[];
}

function IngredientsView({ ingredients, allUnits }: IngredientsViewProps) {
  const unitsByProperty = useSortUnitsByProperty(allUnits);
  const ingredientBlocks = ingredients.map((i) => (
    <IngredientBlock
      key={i.id}
      ingredient={i}
      propertyUnits={getAppropriateUnitsByProperty(
        i.unit?.property,
        unitsByProperty,
      )}
    />
  ));
  return (
    <ViewSectionContainer
      title="Ingredients"
      totalItems={ingredientBlocks.length}
    >
      <div className="flex flex-col space-y-3">{ingredientBlocks}</div>
    </ViewSectionContainer>
  );
}

export default IngredientsView;
