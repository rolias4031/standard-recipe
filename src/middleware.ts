import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*'];

function isPublicPath(path: string) {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))),
  );
}

const adminPaths = ['/admin*'];

function isAdminPath(path: string) {
  return adminPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))),
  );
}

function isAdminUser(userId: string) {
  return userId === process.env.APP_ADMIN_USER_ID;
}

export default withClerkMiddleware((request: NextRequest) => {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request);
  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // check if admin path and user
  if (isAdminPath(request.nextUrl.pathname) && !isAdminUser(userId)) {
    // redirect to previous path
    const redirectUrl = new URL('/me', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // continue to authenticated path
  return NextResponse.next();
});

export const config = {
  matcher: '/((?!_next/image|_next/static|favicon.ico).*)',
};
