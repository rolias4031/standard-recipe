export function buildHomePageNavUrl(view: string) {
  return {
    pathname: 'me',
    query: { view },
  };
}
