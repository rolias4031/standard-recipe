const LOCALHOST_BASE_URL = 'http://localhost:3000/';
const APP_DOMAIN_BASE_URL = 'https://standardrecipe.com/';

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
