/**
 * Ajoute un nouveau produit en base (humidificateur anti-gravité) PUIS
 * publie automatiquement le produit sur la page Facebook.
 *
 *  1. Télécharge les images depuis Amazon (CDN media-amazon)
 *  2. Les envoie sur Vercel Blob (chemins stables products/<slug>-N.jpg)
 *  3. Insère / met à jour le produit en base (upsert sur le slug)
 *  4. Publie un post (photo + légende + lien) sur la page Facebook
 *
 * Pré-requis (.env) :
 *   BLOB_READ_WRITE_TOKEN        (Vercel → Storage → Blob)
 *   POSTGRES_URL                 (connexion directe Prisma Postgres)
 *   FACEBOOK_PAGE_ID
 *   FACEBOOK_PAGE_ACCESS_TOKEN   (token de PAGE, idéalement permanent)
 *   NEXT_PUBLIC_SITE_URL         (optionnel ; sinon domaine de prod par défaut)
 *
 * Usage : pnpm tsx scripts/2026-06-30-1738_add-product-humidificateur-anti-gravite.ts
 */
import "dotenv/config";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const GRAPH = "https://graph.facebook.com/v21.0";
const DEFAULT_SITE_URL = "https://www.voilapourquoijesuisfauche.fr";

const PRODUCT = {
  title:
    "L'humidificateur anti-gravité dont les gouttes d'eau défient la pesanteur",
  slug: "humidificateur-anti-gravite",
  shortDescription:
    "Un humidificateur d'air design dont les gouttelettes d'eau semblent remonter à contre-courant, comme en apesanteur. Brume froide, lumières LED et effet hypnotique garanti : le gadget déco le plus relaxant de votre salon.",
  price: "54,76 €" as string | undefined,
  // Lien Amazon canonique (le tag d'affiliation vpjsf-21 est ajouté à l'affichage)
  affiliateUrl: "https://www.amazon.fr/dp/B0CFXWSM4D",
  categories: ["pour-les-grands"],
  // 1re image = image principale, les suivantes = galerie
  imageSources: [
    "https://m.media-amazon.com/images/I/61+O4KL79ZL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/71sfGac1XkL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/618f5FrBxiL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/71I9xHsxnfL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/61hz-Pf4xHL._AC_SL1500_.jpg",
  ],
  content: `<p>Préparez-vous à frotter les yeux : avec cet <strong>humidificateur d'air anti-gravité</strong>, les gouttelettes d'eau semblent <strong>remonter vers le ciel</strong> au lieu de tomber. Non, vous n'avez pas trop forcé sur l'apéro : c'est juste de la physique (et un petit tour de magie visuel) posé sur votre table de salon.</p>

<h2>Des gouttes d'eau qui défient la pesanteur</h2>
<p>Grâce à un jeu de lumières LED stroboscopiques synchronisées, les <strong>gouttelettes d'eau anti-gravité</strong> donnent l'illusion de flotter, de monter, voire de s'arrêter en plein vol. C'est hypnotique, c'est apaisant, et c'est surtout le genre d'objet devant lequel vos invités vont rester scotchés pendant dix bonnes minutes.</p>

<h2>Un humidificateur (qui fait vraiment son boulot)</h2>
<p>Au-delà du spectacle, ce petit <strong>humidificateur à brume froide</strong> de 580 ml diffuse une fine vapeur qui assainit l'air sec de vos pièces. Idéal en hiver avec le chauffage, ou simplement pour respirer un peu mieux pendant que vous hypnotisez le chat.</p>

<h2>Pourquoi vous allez l'adorer</h2>
<ul>
<li><strong>Effet anti-gravité bluffant</strong> : les gouttes semblent remonter, défiant les lois de la physique.</li>
<li><strong>Brume froide 580 ml</strong> : il humidifie l'air pour de vrai, pas juste pour la frime.</li>
<li><strong>Lumières LED colorées</strong> : ambiance lounge garantie, parfaite en veilleuse le soir.</li>
<li><strong>Objet déco hypnotique</strong> : le genre de gadget qui lance toutes les conversations.</li>
<li><strong>Cadeau insolite</strong> : idéal pour les amateurs de gadgets, de déco moderne et de trucs « mais comment c'est possible ?! ».</li>
</ul>

<h2>Le verdict</h2>
<p>Mi-objet déco, mi-illusion d'optique, cet <strong>humidificateur anti-gravité</strong> est le compagnon parfait des soirées chill et des bureaux qui veulent en jeter. Utile, beau et carrément fascinant : difficile de lui résister.</p>`,
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

const buildFacebookMessage = (link: string): string =>
  [
    `🤯 ${PRODUCT.title}`,
    "",
    PRODUCT.shortDescription,
    "",
    `👉 À découvrir ici : ${link}`,
    "",
    "#VoilaPourquoiJeSuisFauche #CadeauInsolite #IdéeCadeau #Gadget #AntiGravité",
  ].join("\n");

const publishToFacebook = async (imageUrl: string, slug: string) => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    console.warn(
      "⚠️  FACEBOOK_PAGE_ID / FACEBOOK_PAGE_ACCESS_TOKEN absents : publication Facebook ignorée."
    );
    return;
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  ).replace(/\/$/, "");
  const link = `${siteUrl}/produit/${slug}`;

  const body = new URLSearchParams({
    url: imageUrl,
    caption: buildFacebookMessage(link),
    access_token: token,
  });

  const res = await fetch(`${GRAPH}/${pageId}/photos`, {
    method: "POST",
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Publication Facebook échouée : ${JSON.stringify(json)}`);
  }

  const postId = json.post_id ?? json.id;
  console.log(`📣 Post Facebook publié : https://www.facebook.com/${postId}`);
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

  console.log("\n📣 Publication sur Facebook…");
  await publishToFacebook(imageUrl, product.slug);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
