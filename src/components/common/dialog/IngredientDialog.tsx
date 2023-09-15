import React from 'react';
import { IngredientWithAll } from 'types/models';
import {
  CloseDialog,
  DialogCard,
  DialogHeader,
  DialogNotes,
  DialogOptional,
  DialogProps,
  DialogSubs,
  DialogUnit,
} from '.';

interface IngredientDialogProps extends DialogProps {
  ingredient: IngredientWithAll;
}

function IngredientDialog({
  ingredient,
  onCloseDialog,
}: IngredientDialogProps) {
  const substituteNames = ingredient.substitutes.map((s) => s.name);
  return (
    <DialogCard>
      <DialogHeader>{ingredient.name?.name}</DialogHeader>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <DialogUnit
            ingredientUnit={ingredient.unit}
            quantity={ingredient.quantity}
          />
          <DialogOptional optional={ingredient.optional} />
        </div>
        <DialogNotes notes={ingredient.notes} />
        <DialogSubs substitutes={substituteNames} />
      </div>
      {onCloseDialog ? <CloseDialog onCloseDialog={onCloseDialog} /> : null}
    </DialogCard>
  );
}

export default IngredientDialog;
