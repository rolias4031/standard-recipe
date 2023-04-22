import {
  Equipment,
  Instruction,
  Prisma,
} from '@prisma/client';

// * objects from prisma validator

const recipeWithAll = Prisma.validator<Prisma.RecipeArgs>()({
  include: {
    ingredients: true,
    equipment: true,
    instructions: true,
  },
});

const ingredientWithAll = Prisma.validator<Prisma.IngredientArgs>()({
  include: {
    unit: true,
    name: true,
    substitutes: true,
  },
});


/*
* general type naming:
* - With(relation) = base type with relations
* - Mod(property) = base type with custom field
*/

// * full types with all relations. base types.

export type RecipeWithAll = Prisma.RecipeGetPayload<typeof recipeWithAll>;

export type IngredientWithAll = Prisma.IngredientGetPayload<
  typeof ingredientWithAll
>;

export type RecipeWithFull = RecipeWithAll & {
  ingredients: IngredientWithAll[],
  equipment: Equipment[],
  instructions: Instruction[]
}

// * derived and shallower and custom types

export interface IngredientWithAllModName extends Omit<IngredientWithAll, 'name' | 'substitutes'> {
  name: string
  substitutes: string[]
}

