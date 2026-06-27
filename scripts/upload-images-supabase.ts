/**
 * Envoie les images produits (public/products/) vers Supabase Storage,
 * puis réécrit prisma/seed.ts pour pointer vers les URLs publiques Supabase.
 *
 * Pré-requis (.env) :
 *   NEXT_PUBLIC_SUPABASE_URL       (ex : https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY      (clé "service_role", côté serveur uniquement)
 *   SUPABASE_STORAGE_BUCKET        (défaut : product-images)
 *
 * Usage : npm run images:upload
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { extname } from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "product-images";

const LOCAL_DIR = "public/products";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const main = async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env"
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Créer le bucket public s'il n'existe pas encore
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error) throw error;
    console.log(`📦 Bucket "${BUCKET}" créé (public)`);
  }

  // 2. Envoyer chaque image
  const files = await readdir(LOCAL_DIR);
  let uploaded = 0;
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) continue;

    const buffer = await readFile(`${LOCAL_DIR}/${file}`);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, buffer, { contentType, upsert: true });

    if (error) {
      console.warn(`⚠️  ${file} : ${error.message}`);
      continue;
    }
    uploaded += 1;
  }
  console.log(`☁️  ${uploaded} images envoyées vers Supabase Storage`);

  // 3. Réécrire prisma/seed.ts : /products/<fichier> -> URL publique Supabase
  const publicBase = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}`;
  const seedPath = "prisma/seed.ts";
  const seed = await readFile(seedPath, "utf-8");
  const updated = seed.replace(/(["'])\/products\//g, `$1${publicBase}/`);
  await writeFile(seedPath, updated, "utf-8");

  console.log(`📝 prisma/seed.ts mis à jour (base : ${publicBase}/)`);
  console.log("➡️  Lancez ensuite : npm run db:seed");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
