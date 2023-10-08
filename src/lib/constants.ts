const LOCALHOST_BASE_URL = 'http://localhost:3000/';

function createBaseUrlFromEnvironment(env: string | undefined) {
  if (env === 'production' || env === 'preview') {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`;
  }
  return LOCALHOST_BASE_URL;
}

export const BASE_URL = createBaseUrlFromEnvironment(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
);

console.log('BASE_URL', BASE_URL);
