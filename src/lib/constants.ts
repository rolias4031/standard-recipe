export const ERRORS = {
  INVALID_INPUT: 'Invalid Input',
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: (item: string) => {
    return `${item} Not Found`;
  },
};
