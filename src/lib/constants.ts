export const ERRORS = {
  INVALID_INPUT: 'invalid input',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: (item: string) => {
    return `${item.toLowerCase()} not found`;
  },
  UKNOWN_SERVER: 'unknown server error',
};
