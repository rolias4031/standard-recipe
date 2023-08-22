import React from 'react';
import { IngredientWithAll } from 'types/models';
import ViewSectionContainer from './ViewSectionContainer';
import { ItemBlock, ItemBlockDetail } from '.';

interface IngredientBlockProps {
  ingredient: IngredientWithAll;
}

function IngredientBlock({ ingredient }: IngredientBlockProps) {
  const hasDetails =
    (ingredient.notes !== null && ingredient.notes.length > 0) ||
    ingredient.substitutes.length > 0 ||
    ingredient.optional;

  return (
    <ItemBlock
      name={ingredient.name?.name ?? ''}
      suffixContent={
        <div className="flex space-x-1 font-mono">
          <div>{ingredient.quantity}</div>
          <div>{ingredient.unit?.abbreviation}</div>
        </div>
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
  );
}

interface IngredientsViewProps {
  ingredients: IngredientWithAll[];
}

function IngredientsView({ ingredients }: IngredientsViewProps) {
  const ingredientBlocks = ingredients.map((i) => (
    <IngredientBlock key={i.id} ingredient={i} />
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
