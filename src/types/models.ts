import {
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
    instructionLinks: true,
    substitutes: true,
  },
});

const equipmentWithAll = Prisma.validator<Prisma.EquipmentArgs>()({
  include: {
    instructionLinks: true,
  },
});

const instructionWithAll = Prisma.validator<Prisma.InstructionArgs>()({
  include: {
    ingredientLinks: true,
    equipmentLinks: true,
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

export type EquipmentWithAll = Prisma.EquipmentGetPayload<
  typeof equipmentWithAll
>;

export type InstructionWithAll = Prisma.InstructionGetPayload<
  typeof instructionWithAll
>;

export type RecipeWithFull = RecipeWithAll & {
  ingredients: IngredientWithAll[],
  equipment: EquipmentWithAll[],
  instructions: InstructionWithAll[]
}

// * derived and shallower and custom types

export interface IngredientWithAllModName extends Omit<IngredientWithAll, 'name' | 'substitutes'> {
  name: string
  substitutes: string[]
}

