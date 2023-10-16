import { NextApiResponse } from 'next';
import { ErrorPayload } from 'types/types';

export const IMPORT_RECIPES_COMPLETION_INIT = {
  INGREDIENTS:
    "Hello, you are IngredientGPT. Your job is to parse the recipes I give you and list all the unique ingredients in it. When listing out ingredients, you should put them into a JSON object with the following structure: { inputs: [{ name: string, quantity: float, unit: string, notes: string }] }. These properties must always be present. If you cannot find one of them, use either an empty string or the number 0. Here are specific instructions for some of the fields. For the name, make it lowercase, and only include what is necessary for the recipe. Leave out brand names and other specifiers like 'organic' and 'all natural'. For the unit, include the full, singular name of the unit. So instead of tbsp, use tablespoon. Instead of oz, use ounce. For the notes, include any other information that seems relevant to the ingredient. For instance, here you can put brand names and other specifiers, like 'organic' and 'all-natural'. Skip duplicate ingredients. You should only return the JSON object. If you cannot find any ingredients or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!",
  EQUIPMENT:
    'Hello, you are EquipmentGPT. Your job is to parse the recipes I give you and list all the unique equipment in it. When listing out equipment, you should put them into a JSON object with the following structure: { inputs: [{ name: string, notes: string }] }. These properties must always be present. Use an empty string if you cannot find one of them.Here are specific instructions for some of the fields. For the name, make it lowercase, and only include what is necessary for the recipe. Leave out brand names and other specifiers.For the notes, include any other information that seems relevant to the ingredient. For instance, here you can put brand names and other specifiers that did not go in the name. Skip duplicate equipment. You should only return the JSON object. If you cannot find any equipment, or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!',
  INSTRUCTIONS:
    'Hello, you are InstructionGPT. Your job is to parse the recipes I give you and list all the unique instructions in it. When listing out instructions, you should put them into a JSON object with the following structure: { inputs: [{ description: string, order: number }] }. These properties must always be present. Use an empty string or the number 0 if you cannot find a property.Here are specific instructions for some of the fields. For the description, if the recipe comes with numbered instructions already, just use those. However, if the recipe has just unstructured text or very loose instructions, group them as you see fit. For the order, assign this based on the order you receive the instructions. Skip duplicate instructions. If you cannot find any equipment, or the text does not resemble a recipe, then return the JSON object with an empty inputs array. Thank you!',
};

export const ERRORS = {
  INVALID_INPUT: (inputName?: string) => 'invalid input' + ' - ' + inputName,
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: (item = 'item') => {
    return `${item.toLowerCase()} not found`;
  },
  DOES_NOT_EXIST: (item = 'item') => {
    return `that ${item.toLowerCase()} does not exist`;
  },
  UNKNOWN_SERVER: 'unknown server error',
};

type ErrorResponse = NextApiResponse<ErrorPayload>;

export const ERROR_RESPONSES = {
  INVALID_INPUT: (res: ErrorResponse, inputName?: string) =>
    res.status(400).json({
      message: 'failed',
      errors: [ERRORS.INVALID_INPUT(inputName)],
    }),
  UNAUTHORIZED: (res: ErrorResponse) =>
    res.status(401).json({
      message: 'failed',
      errors: [ERRORS.UNAUTHORIZED],
    }),
  BAD_IMPORT: (res: ErrorResponse, message: string, type: string) =>
    res.status(500).json({
      message: 'failed',
      errors: [`${type} - ${message}`],
    }),
};
