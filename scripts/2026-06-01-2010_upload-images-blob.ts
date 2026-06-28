/**
 * Envoie les images de public/products/ vers Vercel Blob,
 * puis met à jour la base (imageUrl + images inline du contenu)
 * et réécrit prisma/seed.ts avec les nouvelles URLs.
 *
 * Pré-requis (.env) :
 *   BLOB_READ_WRITE_TOKEN   (Vercel → Storage → Blob → token de lecture/écriture)
 *   POSTGRES_URL            (connexion directe Prisma Postgres)
 *
 * Usage : pnpm images:blob
 */
import "dotenv/config";
import { put } from "@vercel/blob";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const LOCAL_DIR = "public/products";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const main = async () => {
  if (!TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN manquant dans .env (Vercel → Storage → Blob)."
    );
  }
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL (ou DATABASE_URL) manquant dans .env.");
  }

  // 1. Upload de chaque image (chemin stable, sans suffixe aléatoire)
  const files = await readdir(LOCAL_DIR);
  let base = "";
  let uploaded = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) continue;

    const buffer = await readFile(`${LOCAL_DIR}/${file}`);
    const { url } = await put(`products/${file}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: TOKEN,
    });

    // Base = URL publique du store, sans le chemin "products/<file>"
    if (!base) base = url.slice(0, url.length - `products/${file}`.length);
    uploaded += 1;
  }

  if (!base) throw new Error("Aucune image à envoyer dans public/products/.");
  const newPrefix = `${base}products/`; // remplace "/products/"
  console.log(`☁️  ${uploaded} images envoyées vers Vercel Blob`);
  console.log(`🔗 Base : ${newPrefix}`);

  // 2. Mise à jour de la base de données
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany();
  let updated = 0;
  for (const p of products) {
    const imageUrl = p.imageUrl.replaceAll("/products/", newPrefix);
    const content = p.content.replaceAll("/products/", newPrefix);
    const images = p.images.map((i) => i.replaceAll("/products/", newPrefix));

    if (
      imageUrl !== p.imageUrl ||
      content !== p.content ||
      images.join() !== p.images.join()
    ) {
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl, content, images },
      });
      updated += 1;
    }
  }
  await prisma.$disconnect();
  console.log(`🗄️  ${updated} produits mis à jour en base`);

  // 3. Réécriture de prisma/seed.ts (pour les futurs seeds)
  const seedPath = "prisma/seed.ts";
  const seed = await readFile(seedPath, "utf-8");
  const newSeed = seed.replace(/(["'])\/products\//g, `$1${newPrefix}`);
  await writeFile(seedPath, newSeed, "utf-8");
  console.log("📝 prisma/seed.ts mis à jour");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
