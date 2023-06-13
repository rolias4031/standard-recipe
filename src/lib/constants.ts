export const ERRORS = {
  INVALID_INPUT: 'invalid input',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: (item = 'item') => {
    return `${item.toLowerCase()} not found`;
  },
  DOES_NOT_EXIST: (item = 'item') => {
    return `that ${item.toLowerCase()} does not exist`;
  },
  UKNOWN_SERVER: 'unknown server error',
};
