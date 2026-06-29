/**
 * Ajoute un nouveau produit en base (briquet solaire SOLAR BROTHER).
 *  1. Télécharge les images depuis Amazon (CDN media-amazon)
 *  2. Les envoie sur Vercel Blob (chemins stables products/<slug>-N.jpg)
 *  3. Insère / met à jour le produit en base (upsert sur le slug)
 *
 * Pré-requis (.env) :
 *   BLOB_READ_WRITE_TOKEN   (Vercel → Storage → Blob → token lecture/écriture)
 *   POSTGRES_URL            (connexion directe Prisma Postgres)
 *
 * Usage : pnpm tsx scripts/2026-06-27-2128_add-product-briquet-solaire.ts
 */
import "dotenv/config";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const PRODUCT = {
  title: "Le briquet solaire qui allume vos feux avec un simple rayon de soleil",
  slug: "briquet-solaire-ecologique",
  shortDescription:
    "Un briquet solaire écologique et sans gaz : ses miroirs concentrent les rayons du soleil pour allumer cigarette, bougie ou feu de camp. Le gadget écolo breveté qui ne tombe jamais en panne d'essence.",
  price: "15,00 €" as string | undefined,
  // Lien Amazon canonique (le tag d'affiliation vpjsf-21 est ajouté à l'affichage)
  affiliateUrl: "https://www.amazon.fr/dp/B01ES54F2G",
  categories: ["pour-les-grands"],
  // 1re image = image principale, les suivantes = galerie
  imageSources: [
    "https://m.media-amazon.com/images/I/51I07eNbAdL._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/61lKXCSFL4L._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/51fQ5gp8suL._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/612T2jdrliL._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/71SD3SmhgsL._AC_SL1500_.jpg",
  ],
  content: `<p>Vous avez déjà cherché un briquet qui marche pile au moment où il est vide ? Oubliez le plastique jetable et le « clic-clic » qui s'éternise : voici le <strong>briquet solaire</strong> de SOLAR BROTHER, un petit boîtier malin qui transforme la lumière du soleil en flamme. Oui, vous allez littéralement <strong>allumer votre feu avec un rayon de soleil</strong>, comme un aventurier (mais sans les ampoules aux mains).</p>

<h2>Comment marche ce briquet solaire écologique ?</h2>
<p>À l'intérieur du boîtier, des <strong>miroirs paraboliques</strong> concentrent les rayons du soleil en un point ultra-chaud. Vous y présentez le bout de votre cigarette, une mèche, une feuille sèche ou un morceau d'amadou… et ça s'enflamme. Pas de gaz, pas d'essence, pas de pile : juste du soleil. C'est un <strong>allume-feu solaire breveté en France</strong>, et franchement, l'effet « waouh » est garanti autour du barbecue.</p>

<h2>Pourquoi vous allez l'adorer</h2>
<ul>
<li><strong>Zéro gaz, zéro recharge</strong> : tant qu'il y a du soleil, il fonctionne. Fini les briquets jetables qui finissent à la poubelle.</li>
<li><strong>Écologique et économique</strong> : il remplace une montagne de briquets plastiques et ne coûte rien à « recharger ».</li>
<li><strong>Ultra-léger et nomade</strong> : il se glisse dans une poche, idéal en rando, en camping ou au bivouac.</li>
<li><strong>Le gadget qui fait parler</strong> : allumer son feu avec le soleil, c'est le genre de tour qui impressionne toujours la galerie.</li>
<li><strong>Cadeau écolo original</strong> : parfait pour les fumeurs, les campeurs, les survivalistes du dimanche et les amoureux de la nature.</li>
</ul>

<h2>Le petit mode d'emploi (soyons honnêtes)</h2>
<p>Magie solaire oblige, il lui faut du <strong>vrai soleil</strong> pour donner le meilleur de lui-même : par grand beau temps, l'allumage est rapide&nbsp;; par ciel gris, mieux vaut garder un plan B sous le coude. Un peu de patience les premiers essais, et vous deviendrez vite incollable sur l'art d'allumer un feu avec l'astre du jour.</p>

<h2>Le verdict</h2>
<p>Malin, écolo et terriblement satisfaisant à utiliser, ce <strong>briquet solaire</strong> est le cadeau insolite qui réconcilie gadget et bonne conscience. Un objet qu'on garde des années… et qui ne vous lâchera jamais en plein apéro faute d'essence.</p>

<p style="text-align:center;margin-top:30px;"><a href="https://www.amazon.fr/dp/B01ES54F2G" target="_blank" rel="nofollow noopener" style="display:inline-block;background:#FF9900;color:#111;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:18px;">Voir le prix sur Amazon</a></p>`,
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
