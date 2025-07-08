
import { PrismaClient } from "./generated/prisma/client.js";

declare global {

  var prisma: PrismaClient | undefined;
}

const prismaInstance =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? [] : ["query", "info", "warn", "error"],});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaInstance;
}

export const prisma = prismaInstance;


export * from "./generated/prisma/client.js";