import "dotenv/config";
import { defineConfig } from "prisma/config";

// Le CLI Prisma (migrations, db push, seed) doit utiliser une connexion DIRECTE.
// Avec Supabase : DIRECT_URL = connexion directe (port 5432),
// DATABASE_URL = connexion "pooler" (Supavisor, port 6543) utilisée au runtime.
// On retombe sur DATABASE_URL si DIRECT_URL n'est pas défini (ex. Render).
const cliConnectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

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
