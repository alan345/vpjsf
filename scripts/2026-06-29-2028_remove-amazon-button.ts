/**
 * Supprime le bouton « Voir le prix sur Amazon » du contenu HTML de TOUS
 * les produits en base (le bouton est stocké dans le champ `content`).
 *
 * Le bouton est un paragraphe centré contenant un lien dont le texte
 * contient « Voir le prix sur Amazon » (avec ou sans emoji devant).
 *
 * Pré-requis (.env) :
 *   POSTGRES_URL   (connexion directe Prisma Postgres)
 *
 * Usage : pnpm tsx scripts/2026-06-29-2028_remove-amazon-button.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Paragraphe entier contenant un lien « … Voir le prix sur Amazon … ».
const BUTTON_RE =
  /\s*<p[^>]*>\s*<a\b[^>]*>[\s\S]*?Voir le prix sur Amazon[\s\S]*?<\/a>\s*<\/p>/gi;

const main = async () => {
  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL (ou DATABASE_URL) manquant dans .env.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, content: true },
  });

  let updated = 0;
  for (const p of products) {
    const newContent = p.content.replace(BUTTON_RE, "").replace(/\s+$/, "");
    if (newContent !== p.content) {
      await prisma.product.update({
        where: { id: p.id },
        data: { content: newContent },
      });
      updated += 1;
      console.log(`   ✔ ${p.slug}`);
    }
  }

  await prisma.$disconnect();
  console.log(
    `\n🗄️  Bouton « Voir le prix sur Amazon » retiré de ${updated}/${products.length} produits.`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
