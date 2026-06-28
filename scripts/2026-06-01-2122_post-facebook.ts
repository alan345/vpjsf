/**
 * Publie un produit sur la page Facebook (post photo + légende + lien).
 *
 * Pré-requis (.env) :
 *   FACEBOOK_PAGE_ID
 *   FACEBOOK_PAGE_ACCESS_TOKEN   (token de PAGE, idéalement permanent)
 *   POSTGRES_URL                 (pour lire le produit en base)
 *   NEXT_PUBLIC_SITE_URL         (optionnel ; sinon domaine de prod par défaut)
 *
 * Usage :
 *   pnpm tsx scripts/post-facebook.ts [slug]
 *   (slug par défaut : parapluie-katana-samourai)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const GRAPH = "https://graph.facebook.com/v21.0";
const DEFAULT_SLUG = "parapluie-katana-samourai";
const DEFAULT_SITE_URL = "https://www.voilapourquoijesuisfauche.fr";

const buildMessage = (
  title: string,
  shortDescription: string,
  link: string
): string =>
  [
    `⚔️🌂 ${title}`,
    "",
    shortDescription,
    "",
    `👉 À découvrir ici : ${link}`,
    "",
    "#VoilaPourquoiJeSuisFauche #CadeauInsolite #IdéeCadeau #Katana #Samouraï",
  ].join("\n");

const main = async () => {
  const slug = process.argv[2] ?? DEFAULT_SLUG;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error(
      "FACEBOOK_PAGE_ID et FACEBOOK_PAGE_ACCESS_TOKEN requis dans .env."
    );
  }

  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL (ou DATABASE_URL) manquant dans .env.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    select: { title: true, shortDescription: true, imageUrl: true, slug: true },
  });
  await prisma.$disconnect();

  if (!product) {
    throw new Error(`Produit introuvable pour le slug « ${slug} ».`);
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  ).replace(/\/$/, "");
  const link = `${siteUrl}/produit/${product.slug}`;
  const message = buildMessage(product.title, product.shortDescription, link);

  // Post photo : l'image s'affiche en grand, la légende contient le lien.
  const body = new URLSearchParams({
    url: product.imageUrl,
    caption: message,
    access_token: token,
  });

  const res = await fetch(`${GRAPH}/${pageId}/photos`, {
    method: "POST",
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Publication échouée : ${JSON.stringify(json)}`);
  }

  const postId = json.post_id ?? json.id;
  console.log("✅ Post publié sur Facebook !");
  console.log(`📄 Produit : ${product.title}`);
  console.log(`🆔 Post    : ${postId}`);
  console.log(`🔗 Lien    : https://www.facebook.com/${postId}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
