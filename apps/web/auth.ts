/* eslint-disable turbo/no-undeclared-env-vars */

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import {prisma} from "@repo/database/index"
import { PrismaAdapter } from "@auth/prisma-adapter"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET})
  ],
  secret: process.env.AUTH_SECRET,
  session: {strategy: "jwt"}
})