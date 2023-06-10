import { Instruction, Prisma } from '@prisma/client';

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

const equipmentWithAll = Prisma.validator<Prisma.EquipmentArgs>()({
  include: {
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

export type EquipmentWithAll = Prisma.EquipmentGetPayload<
  typeof equipmentWithAll
>;

export interface RecipeGeneralInfo {
  name: string;
  description: RecipeWithAll['description'];
}

export type RecipeWithFull = RecipeWithAll & {
  ingredients: IngredientWithAll[];
  equipment: EquipmentWithAll[];
  instructions: Instruction[];
};

// * derived and shallower and custom types

export interface FlowIngredient
  extends Omit<
    IngredientWithAll,
    'name' | 'substitutes' | 'ingredientNameId' | 'ingredientUnitId'
  > {
  name: string;
  substitutes: string[];
}

export interface FlowEquipment
  extends Omit<EquipmentWithAll, 'name' | 'substitutes' | 'equipmentNameId'> {
  name: string;
  substitutes: string[];
}

// * typeguard functions is<Type>Type

export function isFlowIngredientType(obj: any): obj is FlowIngredient {
  return 'unit' in obj && typeof obj.name === 'string';
}

export function isFlowEquipmentType(obj: any): obj is FlowEquipment {
  return (
    'name' in obj &&
    !('unit' in obj) &&
    !('description' in obj) &&
    !('quantity' in obj)
  );
}
