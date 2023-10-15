import { IngredientUnit } from '@prisma/client';

const LOCALHOST_BASE_URL = 'http://localhost:3000/';
const APP_DOMAIN_BASE_URL = 'https://www.standardrecipe.com/';

export const ALL_INGREDIENT_UNITS: IngredientUnit[] = [
  {
    id: 'clgfhdn9u000039u6nyz1d9ep',
    unit: 'cup',
    abbreviation: 'cup',
    plural: 'cups',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfhdn9u000239u6c2ano4pn',
    unit: 'ounce',
    abbreviation: 'oz',
    plural: 'ounces',
    description: '',
    property: 'weight',
  },
  {
    id: 'clgfhdn9v000439u6cegn8tkl',
    unit: 'fluid ounce',
    abbreviation: 'fl-oz',
    plural: 'fluid ounces',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfhdn9v000639u6sr1g2bir',
    unit: 'gallon',
    abbreviation: 'gal',
    plural: 'gallons',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfhh7la000a39u645zaxiwv',
    unit: 'milliliter',
    abbreviation: 'ml',
    plural: 'milliliters',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfhh7la000c39u65c3krger',
    unit: 'liter',
    abbreviation: 'l',
    plural: 'liters',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfl2nzu000039dgzqxaw196',
    unit: 'gram',
    abbreviation: 'g',
    plural: 'grams',
    description: '',
    property: 'mass',
  },
  {
    id: 'clgfl3iu0000239dg23x379lu',
    unit: 'kilogram',
    abbreviation: 'kg',
    plural: 'kilograms',
    description: '',
    property: 'mass',
  },
  {
    id: 'clgfl528q000439dgdqlpfeo2',
    unit: 'pint',
    abbreviation: 'pnt',
    plural: 'pints',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfl528r000639dgd59mzexl',
    unit: 'quart',
    abbreviation: 'qt',
    plural: 'quarts',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfl528r000839dg8lxgqops',
    unit: 'teaspoon',
    abbreviation: 'tsp',
    plural: 'teaspoons',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfl528r000a39dgr8grm724',
    unit: 'tablespoon',
    abbreviation: 'Tbs',
    plural: 'tablespoons',
    description: '',
    property: 'volume',
  },
  {
    id: 'clgfl5wjx000c39dg3o4hk8i2',
    unit: 'pound',
    abbreviation: 'lb',
    plural: 'pounds',
    description: '',
    property: 'weight',
  },
  {
    id: 'clgfl5wjx000e39dgflnzugox',
    unit: 'milligram',
    abbreviation: 'mg',
    plural: 'milligrams',
    description: '',
    property: 'mass',
  },
  {
    id: 'clgfl8abq000039ge5nipohtp',
    unit: 'pinch',
    abbreviation: '',
    plural: 'pinches',
    description: '',
    property: 'other',
  },
  {
    id: 'clgfl8zch000239ge3xkipylj',
    unit: 'handful',
    abbreviation: '',
    plural: 'handfuls',
    description: '',
    property: 'other',
  },
  {
    id: 'clgflcjga000439gejcl2anoo',
    unit: 'bushel',
    abbreviation: 'bu',
    plural: 'bushels',
    description: '',
    property: 'other',
  },
  {
    id: 'clgflcjga000639gec4m6i92w',
    unit: 'dollop',
    abbreviation: '',
    plural: 'dollops',
    description: '',
    property: 'other',
  },
  {
    id: 'clhqw476v000039s03rm598ah',
    unit: 'count',
    abbreviation: '',
    plural: 'counts',
    description: '',
    property: 'other',
  },
];

function createBaseUrlFromEnvironment(env: string | undefined) {
  if (env === 'production' || env === 'preview') {
    return APP_DOMAIN_BASE_URL;
  }
  return LOCALHOST_BASE_URL;
}

export const BASE_URL = createBaseUrlFromEnvironment(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
);

console.log('BASE_URL', {
  BASE_URL,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
});
