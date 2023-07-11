import React from 'react';
import { IngredientWithAll } from 'types/models';
import {
  DialogCard,
  DialogNotes,
  DialogOptional,
  DialogSubs,
  DialogUnit,
} from '.';

interface IngredientDialogProps {
  ingredient: IngredientWithAll;
}

function IngredientDialog({ ingredient }: IngredientDialogProps) {
  const substituteNames = ingredient.substitutes.map((s) => s.name);
  return (
    <DialogCard>
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
    </DialogCard>
  );
}

export default IngredientDialog;
