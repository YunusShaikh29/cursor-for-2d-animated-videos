/* eslint-disable turbo/no-undeclared-env-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("\n--- New Middleware Request ---");
  console.log("Request Path:", pathname);

  const secret = process.env.AUTH_SECRET;
  console.log(
    "AUTH_SECRET loaded:",
    secret ? `Yes, length ${secret.length}` : "No, it is MISSING!"
  );

  const cookieHeader = request.headers.get("cookie");
  console.log(
    "Cookie header received by server:",
    cookieHeader ? "Exists" : "null"
  );


  if (!secret) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const token = await getToken({ req: request, secret: secret , cookieName: "__Secure-authjs.session-token" });

  console.log("Result of getToken:", token);
  console.log("--- End of Middleware Request ---\n");

  if (!token) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/conversation", "/conversation/:path*"],
};