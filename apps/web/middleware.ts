// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import getToken directly from next-auth/jwt or @auth/core/jwt
// Try @auth/core/jwt first as you seem to be using Auth.js v5 beta
// import { getToken } from '@auth/core/jwt'; // <-- Use this import
import { getToken } from 'next-auth/jwt';

// This middleware will run for all paths defined in the matcher config below.
// Inside, we manually check for the session token.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the AUTH_SECRET from environment variables. Required to verify the JWT.
  const secret = process.env.AUTH_SECRET;
  // Basic check - more robust error handling needed in production if missing
  if (!secret) {
      console.error("AUTH_SECRET is not set in middleware environment.");
      // In dev, maybe allow to proceed to see errors, in prod, return 500 or redirect
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Use getToken to read and verify the session JWT from the request cookies.
  // getToken is designed to work in Edge environments and doesn't rely on the
  // database adapter or Node.js specifics from auth.ts
  const token = await getToken({ req: request, secret: secret });

  // Log token presence for debugging (optional)
  console.log(`Middleware check for ${pathname}: Token found?`, !!token);

  // If there is no valid token, the user is not authenticated.
  if (!token) {
    console.log(`Redirecting unauthenticated user from ${pathname} to signin.`);
    // Redirect to the sign-in page.
    // Include a callbackUrl query parameter so Auth.js knows where to send
    // the user back after a successful sign-in.
    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);

    // Return the redirect response
    return NextResponse.redirect(signInUrl);
  }

  // If a token exists, the user is authenticated. Allow the request to proceed.
  console.log(`Authenticated user accessing ${pathname}. Proceeding.`);
  return NextResponse.next();
}

// Configure the matcher. This tells Next.js *when* to execute the `middleware` function above.
export const config = {
    matcher: [
        // Match any path segment after /conversation/
        // "/conversation/:path*",

        // To be absolutely sure, also match the base /conversation path itself
        // if you might land there.
        "/conversation",
        "/conversation/:path*",

        // Or use the App Router directory matching pattern, often more reliable:
        // "/conversation/(.*)",

        // Let's use the combined string array for clarity:
        '/conversation', // Matches /conversation
        '/conversation/:path*', // Matches /conversation/* and /conversation/**/*

        // Add any other paths that need authentication check here.
        // e.g., '/dashboard', '/settings', etc.
    ],
};

// REMOVE the line 'export { auth as middleware } from "@/auth";'
// You are now exporting a custom middleware function instead.
