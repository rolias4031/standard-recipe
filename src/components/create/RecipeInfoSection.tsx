import { Recipe } from '@prisma/client';
import CircleCheckIcon from 'components/common/icons/CircleCheckIcon';
import PencilIcon from 'components/common/icons/PencilIcon';
import InputDisplayController from 'components/common/InputDisplayController';
import { GeneralButton, RaiseInputArgs, TextInput } from 'pirate-ui';
import React, { useState } from 'react';

type RecipeInfoInputs = Pick<Recipe, 'name' | 'description'>;

interface RecipeInfoSectionProps {
  recipe: Recipe;
}

function RecipeInfoSection({ recipe }: RecipeInfoSectionProps) {
  const [recipeInfoInputs, setRecipeInfoInputs] = useState<RecipeInfoInputs>({
    name: recipe.name,
    description: '',
  });

  function raiseRecipeInfoInput(args: RaiseInputArgs) {
    setRecipeInfoInputs((prevState: RecipeInfoInputs) => {
      return {
        ...prevState,
        [args.name]: args.input,
      };
    });
  }

  return (
    <section className="bg-blue-100 flex items-center">
      <InputDisplayController>
        {({ isEditMode, setIsEditMode, inputRef }) => {
          console.log(isEditMode);
          return (
            <>
              <div className="" onClick={() => setIsEditMode((prev) => !prev)}>
                <TextInput
                  ref={inputRef}
                  name="name"
                  styles={{
                    input: 'p-2 text-xl w-fit outline-none',
                    disabled: 'disabled:text-gray-600',
                  }}
                  curInput={recipeInfoInputs.name}
                  raiseInput={raiseRecipeInfoInput}
                  isDisabled={!isEditMode}
                />
              </div>
              {isEditMode ? (
                <div>
                  <CircleCheckIcon size='4' />
                </div>
              ) : null}
            </>
          );

          // <GeneralButton onClick={() => setIsEditMode((prev) => !prev)}>
          //   {isEditMode ? 'Save' : <PencilIcon size="4" />}
          // </GeneralButton>
        }}
      </InputDisplayController>
    </section>
  );
}

export default RecipeInfoSection;
