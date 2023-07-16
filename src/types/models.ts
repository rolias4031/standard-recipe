import { IngredientUnit, Instruction, Prisma } from '@prisma/client';

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
  id: string;
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

export interface InstructionMeasurement extends IngredientUnit {
  text: string;
  quantity: number;
}

export interface InstructionTemperature {
  text: string;
  temperature: number;
  unit: string;
}

// * typeguard functions is<Type>Type

export function isInstructionTemperatureType(
  obj: any,
): obj is InstructionTemperature {
  return 'temperature' in obj && 'unit' in obj;
}

export function isInstructionMeasurementType(
  obj: any,
): obj is InstructionMeasurement {
  console.log(obj);
  return (
    'text' in obj &&
    'quantity' in obj &&
    'abbreviation' in obj &&
    'plural' in obj
  );
}

export function isIngredientWithAllType(obj: any): obj is IngredientWithAll {
  return 'unit' in obj && 'quantity' in obj && 'name' in obj;
}

export function isEquipmentWithAllType(obj: any): obj is EquipmentWithAll {
  return (
    'name' in obj &&
    !('unit' in obj) &&
    !('description' in obj) &&
    !('quantity' in obj)
  );
}
