/**
 * Ajoute un nouveau produit en base (bouteille de Klein en verre soufflé).
 *  1. Télécharge les images depuis Amazon (CDN media-amazon)
 *  2. Les envoie sur Vercel Blob (chemins stables products/<slug>-N.jpg)
 *  3. Insère / met à jour le produit en base (upsert sur le slug)
 *
 * Pré-requis (.env) :
 *   BLOB_READ_WRITE_TOKEN   (Vercel → Storage → Blob → token lecture/écriture)
 *   POSTGRES_URL            (connexion directe Prisma Postgres)
 *
 * Usage : pnpm tsx scripts/2026-06-29-2040_add-product-bouteille-klein.ts
 */
import "dotenv/config";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const PRODUCT = {
  title:
    "La bouteille de Klein en verre soufflé : l'objet qui n'a ni intérieur ni extérieur",
  slug: "bouteille-de-klein-en-verre",
  shortDescription:
    "Une véritable bouteille de Klein en verre soufflé à la main : une surface fascinante sans intérieur ni extérieur. Le cadeau insolite parfait pour les amoureux des maths, de la science et des objets qui font réfléchir.",
  price: "105,14 €" as string | undefined,
  // Lien Amazon canonique (le tag d'affiliation vpjsf-21 est ajouté à l'affichage)
  affiliateUrl: "https://www.amazon.fr/dp/B017UY60MK",
  categories: ["pour-les-grands"],
  // 1re image = image principale, les suivantes = galerie
  imageSources: [
    "https://m.media-amazon.com/images/I/91MIQG6CL9L._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/71BqYkJiWpL._AC_SL1280_.jpg",
    "https://m.media-amazon.com/images/I/61op5QXd05L._AC_SL1070_.jpg",
    "https://m.media-amazon.com/images/I/91EZWbqqHOL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/81bWPOKjsAL._AC_SL1500_.jpg",
  ],
  content: `<p>Vous cherchez le cadeau qui va faire tilt dans la tête de votre ami matheux ? Voici la <strong>bouteille de Klein en verre soufflé</strong> : un objet à la fois magnifique et déroutant, car il possède une propriété complètement folle… <strong>il n'a ni intérieur, ni extérieur</strong>. Oui, vous avez bien lu.</p>

<h2>C'est quoi, une bouteille de Klein ?</h2>
<p>Imaginez un ruban de Möbius qui aurait décidé de passer en trois dimensions. La <strong>bouteille de Klein</strong> est une surface mathématique fermée et sans bord : son goulot replonge à travers la paroi pour se raccorder à sa propre base. Résultat ? Une <strong>surface non orientable</strong> où « dedans » et « dehors » ne veulent plus rien dire. De quoi alimenter les conversations de fin de soirée pendant des années.</p>

<h2>Soufflée à la main, pour de vrai</h2>
<p>Chaque exemplaire est <strong>soufflé à la main par un artisan verrier</strong>, ce qui en fait une pièce unique. Transparente et élégante, elle attrape la lumière et s'expose fièrement sur un bureau, une étagère ou une bibliothèque, entre deux livres de physique et un Rubik's Cube jamais terminé.</p>

<h2>Pourquoi vous allez l'adorer</h2>
<ul>
<li><strong>Un concept qui fascine</strong> : une surface qui défie l'intuition et fait travailler les neurones.</li>
<li><strong>Verre soufflé à la main</strong> : un objet artisanal, élégant et unique.</li>
<li><strong>Le cadeau geek ultime</strong> : idéal pour les profs de maths, les étudiants en sciences et les curieux de topologie.</li>
<li><strong>Pièce de décoration</strong> : superbe sur un bureau, et redoutable pour lancer une discussion.</li>
<li><strong>Effet "waouh" garanti</strong> : peu de gens en ont déjà vu une en vrai.</li>
</ul>

<h2>Le verdict</h2>
<p>Mi-œuvre d'art, mi-énigme mathématique, la <strong>bouteille de Klein</strong> est le cadeau insolite par excellence pour celles et ceux qui aiment quand la science devient belle. Un objet qui ne sert (presque) à rien, mais qui fait réfléchir tout le monde — et c'est exactement pour ça qu'on l'adore.</p>`,
};

const CATEGORY_NAMES: Record<string, string> = {
  "pour-les-animaux": "Pour les Animaux",
  "pour-les-enfants": "Pour les Enfants",
  "pour-les-grands": "Pour les Grands",
  "pour-les-parents": "Pour les Parents",
};

const uploadImage = async (
  src: string,
  blobPath: string,
  token: string
): Promise<string> => {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Téléchargement échoué (${res.status}) pour ${src}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const { url } = await put(blobPath, buffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  return url;
};

const main = async () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN manquant dans .env (Vercel → Storage → Blob)."
    );
  }
  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL (ou DATABASE_URL) manquant dans .env.");
  }

  console.log("☁️  Envoi des images vers Vercel Blob…");
  const blobUrls: string[] = [];
  for (let i = 0; i < PRODUCT.imageSources.length; i += 1) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    const url = await uploadImage(
      PRODUCT.imageSources[i],
      `products/${PRODUCT.slug}${suffix}.jpg`,
      token
    );
    blobUrls.push(url);
    console.log(`   ✔ ${url}`);
  }

  const [imageUrl, ...images] = blobUrls;

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const data = {
    title: PRODUCT.title,
    shortDescription: PRODUCT.shortDescription,
    content: PRODUCT.content,
    imageUrl,
    images,
    affiliateUrl: PRODUCT.affiliateUrl,
    price: PRODUCT.price ?? null,
    published: true,
  };

  const product = await prisma.product.upsert({
    where: { slug: PRODUCT.slug },
    update: data,
    create: {
      ...data,
      slug: PRODUCT.slug,
      categories: {
        create: PRODUCT.categories.map((slug) => ({
          category: {
            connectOrCreate: {
              where: { slug },
              create: { slug, name: CATEGORY_NAMES[slug] ?? slug },
            },
          },
        })),
      },
    },
  });

  await prisma.$disconnect();
  console.log(`\n🗄️  Produit enregistré : ${product.title}`);
  console.log(`🔗 /produit/${product.slug}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
