import { Recipe } from '@prisma/client';
import CircleCheckIcon from 'components/common/icons/CircleCheckIcon';
import CircleXIcon from 'components/common/icons/CircleXIcon';
import InputDisplayController from 'components/common/InputDisplayController';
import { useFormValidation, useSaveRecipe } from 'lib/hooks';
import { GeneralButton, RaiseInputArgs, TextInput, TextInputWithLabel } from 'pirate-ui';
import { newRecipeInfoInputsSchema } from 'validation/schemas';
import React, { useState } from 'react';

type RecipeInfoInputs = Pick<Recipe, 'name' | 'description' | 'id'>;

type ValidationKeys = 'description';

interface RecipeInfoSectionProps {
  recipe: Recipe;
}

function RecipeInfoSection({ recipe }: RecipeInfoSectionProps) {
  const { mutate, status } = useSaveRecipe()
  const { validateInputs, formValidation } = useFormValidation<ValidationKeys>([
    'description',
  ]);
  const [recipeInfoInputs, setRecipeInfoInputs] = useState<RecipeInfoInputs>({
    id: recipe.id,
    name: recipe.name,
    description: '',
  })

  function raiseRecipeInfoInput(args: RaiseInputArgs) {
    setRecipeInfoInputs((prevState: RecipeInfoInputs) => {
      const latestInputs = { ...prevState, [args.name]: args.input };
      validateInputs({
        schema: newRecipeInfoInputsSchema,
        name: args.name,
        allInputs: latestInputs,
      });
      return {
        ...prevState,
        [args.name]: args.input,
      };
    });
  }

  console.log(formValidation);

  return (
    <div className="">
      <div className="flex flex-col">
        <InputDisplayController>
          {({ isEditMode, setIsEditMode, inputRef }) => (
            <>
              <div
                className="w-1/2"
                onClick={() => setIsEditMode((prev) => !prev)}
              >
                <TextInput
                  ref={inputRef}
                  name="name"
                  styles={{
                    input: 'p-2 text-2xl w-full outline-none truncate',
                    disabled: 'disabled:text-gray-600',
                  }}
                  value={recipeInfoInputs.name}
                  onChange={raiseRecipeInfoInput}
                  isDisabled={!isEditMode}
                />
              </div>
              {isEditMode ? (
                <div className="flex items-center h-full">
                  <GeneralButton>
                    <CircleCheckIcon
                      styles={{ icon: 'w-6 h-6 text-gray-500' }}
                    />
                  </GeneralButton>
                  <GeneralButton>
                    <CircleXIcon styles={{ icon: 'w-6 h-6 text-gray-500' }} />
                  </GeneralButton>
                </div>
              ) : null}
            </>
          )}
        </InputDisplayController>
      </div>
      <div className="flex flex-col items-end my-10">
        <TextInputWithLabel
          id="new-recipe-description"
          name="description"
          placeholder="Tell us about your recipe"
          styles={{
            div: 'w-full flex flex-col space-y-1',
            label: 'text-sm text-gray-600',
            input: 'py-1 outline-none w-full text-sm border-b-2 mb-1',
            invalid: 'border-red-300',
          }}
          value={recipeInfoInputs.description}
          onChange={raiseRecipeInfoInput}
          isInvalid={formValidation.description.isInvalid}
        />
      </div>
    </div>
  );
}

export default RecipeInfoSection;
