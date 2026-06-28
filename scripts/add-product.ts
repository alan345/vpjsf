/**
 * Ajoute un nouveau produit en base.
 *  1. Télécharge les images depuis Amazon (CDN media-amazon)
 *  2. Les envoie sur Vercel Blob (chemins stables products/<slug>-N.jpg)
 *  3. Insère / met à jour le produit en base (upsert sur le slug)
 *
 * Pré-requis (.env) :
 *   BLOB_READ_WRITE_TOKEN   (Vercel → Storage → Blob → token lecture/écriture)
 *   POSTGRES_URL            (connexion directe Prisma Postgres)
 *
 * Usage : pnpm tsx scripts/add-product.ts
 */
import "dotenv/config";
import { put } from "@vercel/blob";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const PRODUCT = {
  title: "Le parapluie katana qui vous transforme en samouraï sous la pluie",
  slug: "parapluie-katana-samourai",
  shortDescription:
    "Un parapluie en forme de katana japonais : poignée de sabre, fourreau qui se porte en bandoulière et grande toile résistante. Le cadeau geek parfait pour affronter l'averse avec classe.",
  price: undefined as string | undefined,
  // Lien Amazon canonique (le tag d'affiliation vpjsf-21 est ajouté à l'affichage)
  affiliateUrl: "https://www.amazon.fr/dp/B07TXCMYFP",
  categories: ["pour-les-grands"],
  // 1re image = image principale, les suivantes = galerie
  imageSources: [
    "https://m.media-amazon.com/images/I/81l52mnN18L._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/61wDv2ZMdqL._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/51n5-z20kAL._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/71O8Q-XV00L._AC_SL1200_.jpg",
    "https://m.media-amazon.com/images/I/61IGJH-WQhL._AC_SL1200_.jpg",
  ],
  content: `<p>Il y a les parapluies tristes qu'on oublie dans le métro… et puis il y a <strong>celui-ci</strong> : un <strong>parapluie en forme de katana</strong>, le sabre du samouraï japonais. Poignée de sabre, long fourreau à porter en bandoulière, allure de guerrier : avec lui, même une banale averse devient une scène de film d'arts martiaux.</p>

<h2>Un vrai parapluie samouraï, pas un simple gadget</h2>
<p>Sous ses airs de <strong>katana japonais</strong>, ce parapluie ninja cache une grande toile bien résistante qui vous garde parfaitement au sec. La poignée reproduit fidèlement le manche d'un sabre, et le fourreau se porte dans le dos ou à l'épaule pour avoir les mains libres jusqu'à ce que le ciel se déchaîne.</p>

<h2>Pourquoi vous allez l'adorer</h2>
<ul>
<li><strong>Design katana bluffant</strong> : poignée de sabre et fourreau réaliste, l'effet « samouraï urbain » est garanti.</li>
<li><strong>Grande toile protectrice</strong> : assez large pour vous abriter sans finir trempé jusqu'aux chaussettes.</li>
<li><strong>Porté en bandoulière</strong> : le fourreau se glisse dans le dos, comme un vrai ninja en mission anti-pluie.</li>
<li><strong>Ouverture manuelle solide</strong> : armature robuste pensée pour affronter les jours de vent.</li>
<li><strong>Le cadeau qui marque les esprits</strong> : idéal pour les fans de mangas, de Japon et de gadgets insolites.</li>
</ul>

<h2>Le verdict</h2>
<p>Pratique, original et franchement stylé, ce <strong>parapluie samouraï</strong> est l'accessoire parfait pour ne plus jamais subir la pluie en silence. Offrez-le (ou offrez-le-vous) : c'est le genre d'objet qui déclenche immanquablement la question « mais où tu as trouvé ça ?! ».</p>

<p style="text-align:center;margin-top:30px;"><a href="https://www.amazon.fr/dp/B07TXCMYFP" target="_blank" rel="nofollow noopener" style="display:inline-block;background:#FF9900;color:#111;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:18px;">Voir le prix sur Amazon</a></p>`,
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
