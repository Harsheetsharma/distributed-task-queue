// shared/prisma.ts
// import { PrismaClient } from "../../node_modules/.prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;
