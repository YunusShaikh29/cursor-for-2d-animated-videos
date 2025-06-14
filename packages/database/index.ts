// import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "./generated/prisma/index.js"
import {PrismaClient} from "./generated/prisma/client.js"

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = new PrismaClient() || global.prisma

if(process.env.NODE_ENV !== "production") globalThis.prisma = prisma