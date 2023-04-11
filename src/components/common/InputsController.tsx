import { genId } from 'lib/util-client';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { ClientIngredient } from 'types/models';

function createNewIngredient(): ClientIngredient {
  return {
    name: '',
    quantity: 0,
    units: '',
    substitutes: [],
    optional: false,
    notes: '',
    id: genId()
  }
}

interface InputsControllerProps {
  raiseInput: Dispatch<SetStateAction<any[]>>
  children: ReactNode;
}

function InputsController({
  raiseInput,
  children,
}: InputsControllerProps) {

  function createNewInputHandler() {
    raiseInput((prev: any[]) => {
      const newIngredient = createNewIngredient()
      const idExists = prev.findIndex((i) => i.id === newIngredient.id)
      if (idExists !== -1) return prev
      return [...prev, newIngredient]
    })
  }
  return (
    <>
      <div className="flex flex-col space-y-12 card-primary p-6">
        {children}
        <button
          className="p-1 rounded btn-primary transition-all"
          onClick={createNewInputHandler}
        >
          New Ingredient
        </button>
      </div>
    </>
  );
}

export default InputsController;
