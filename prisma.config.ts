import "dotenv/config";
import { defineConfig } from "prisma/config";

// Le CLI Prisma (migrations, db push, seed) utilise la connexion directe.
// Prisma Postgres fournit `POSTGRES_URL` ; on retombe sur `DATABASE_URL`.
const cliConnectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: cliConnectionString,
  },
});
