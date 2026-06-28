import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Postgres : connexion directe (TCP) utilisée par l'adaptateur `pg`.
// `POSTGRES_URL` est fourni par Prisma Postgres ; on retombe sur `DATABASE_URL`.
const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
