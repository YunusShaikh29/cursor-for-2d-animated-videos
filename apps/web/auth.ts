/* eslint-disable turbo/no-undeclared-env-vars */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "database";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { JWT } from "next-auth/jwt";
import type { NextAuthConfig } from "next-auth";

// Temporarily hardcoded actual AUTH_SECRET here for debugging.
const HARDCODED_AUTH_SECRET =
  "57363e978a9bde141c9524b1799222278397266fe68b7cbcdebee57d7e2c24d8";

console.log("--- NextAuth.js Auth Config Environment Check ---");
console.log("process.env.NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("process.env.AUTH_SECRET (via env):", process.env.AUTH_SECRET); 
console.log("process.env.AUTH_GOOGLE_ID:", process.env.AUTH_GOOGLE_ID);
console.log("process.env.AUTH_TRUST_HOST:", process.env.AUTH_TRUST_HOST);
console.log("process.env.AUTH_DEBUG:", process.env.AUTH_DEBUG);
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL); 
console.log("--- End NextAuth.js Auth Config Environment Check ---");

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  secret: HARDCODED_AUTH_SECRET,
  session: { strategy: "jwt" },

  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: `__Host-authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: `authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    state: {
      name: `authjs.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    nonce: {
      name: `authjs.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub as string;
      }

      return session;
    },
  },
};

const nextAuth = NextAuth(authConfig);

export const handlers: typeof nextAuth.handlers = nextAuth.handlers;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
export const auth: typeof nextAuth.auth = nextAuth.auth;
