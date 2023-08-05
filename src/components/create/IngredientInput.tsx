import InputWithPopover from 'components/common/InputWithPopover';
import RecipeFlowInput from 'components/create/RecipeFlowInput';
import { TextInput } from 'pirate-ui';
import React, {
} from 'react';


interface IngredientInputProps {
  id: string;
  order: number;
  onRemove: (id: string) => void;
  ingredientInputs: any;
}

function IngredientInput({
  id,
  order,
  onRemove,
  ingredientInputs,
}: IngredientInputProps) {
  return (
    <RecipeFlowInput
      id={id}
      order={order}
      onRemove={onRemove}
      columnLabelComponents={
        <>
          <div className="w-72">Ingredients</div>
          <div className="w-36">Quantity</div>
          <div className="w-36">Units</div>
        </>
      }
      inputComponents={
        <>
          <TextInput
            name="name"
            value={ingredientInputs.name}
            onChange={() => console.log('change')}
            styles={{ input: 'inp-reg inp-primary w-72' }}
          />
          <input
            type="number"
            value={ingredientInputs.quantity}
            className="inp-reg inp-primary w-36"
          />
          <InputWithPopover styles={{div: 'inp-reg inp-primary w-36'}} />
        </>
      }
    />
  );
}

export default IngredientInput;
