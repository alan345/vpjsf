/**
 * Script ponctuel : convertit l'export WordPress (WXR) en `prisma/seed.ts`
 * et télécharge les images dans `public/products/`.
 *
 * Usage : npx tsx scripts/import-wxr.ts <chemin-vers-export.xml>
 */
import { XMLParser } from "fast-xml-parser";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname } from "node:path";

const XML_PATH =
  process.argv[2] ??
  "/Users/alan/Downloads/voilapourquoijesuisfauchefr.WordPress.2026-06-26.xml";

const IMAGES_DIR = "public/products";
const PUBLIC_PREFIX = "/products";

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
});

type SeedCategory = { name: string; slug: string };
type SeedProduct = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  images: string[];
  affiliateUrl: string;
  author: string;
  createdAt: string;
  categories: string[];
};

const cleanContent = (raw: string): string =>
  raw
    .replace(/<!--\s*\/?wp:[^>]*?-->/g, "") // commentaires de blocs Gutenberg
    .replace(/\sclass="[^"]*"/g, "") // classes WP inutiles côté front
    .replace(/\ssrcset="[^"]*"/g, "")
    .replace(/\ssizes="[^"]*"/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const toPlainText = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&rsquo;/g, "'")
    .replace(/&laquo;|&raquo;|&#171;|&#187;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const buildShortDescription = (html: string): string => {
  const text = toPlainText(html).replace(/^Description\s*:\s*/i, "");
  if (text.length <= 180) return text;
  const truncated = text.slice(0, 180);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : 180)}…`;
};

const extFromUrl = (url: string): string => {
  const ext = extname(new URL(url).pathname).toLowerCase();
  return ext && ext.length <= 5 ? ext : ".jpg";
};

const downloadImage = async (url: string, fileName: string): Promise<void> => {
  const dest = `${IMAGES_DIR}/${fileName}`;
  if (existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buffer);
};

const main = async () => {
  const xml = await readFile(XML_PATH, "utf-8");
  const doc = parser.parse(xml);
  const items = asArray(doc.rss.channel.item);

  // Carte id d'attachement -> URL de l'image d'origine
  const attachmentUrlById = new Map<string, string>();
  for (const item of items) {
    if (item["wp:post_type"] === "attachment" && item["wp:attachment_url"]) {
      attachmentUrlById.set(
        String(item["wp:post_id"]),
        String(item["wp:attachment_url"])
      );
    }
  }

  await mkdir(IMAGES_DIR, { recursive: true });

  const categoriesMap = new Map<string, string>(); // slug -> name
  const products: SeedProduct[] = [];

  const posts = items.filter(
    (item) => item["wp:post_type"] === "post" && item["wp:status"] === "publish"
  );

  for (const post of posts) {
    const slug = String(post["wp:post_name"]);
    const title = String(post.title ?? "").trim();
    if (!slug || !title) continue;

    const meta = asArray(post["wp:postmeta"]);
    const metaValue = (key: string): string | undefined => {
      const found = meta.find((m) => m["wp:meta_key"] === key);
      return found ? String(found["wp:meta_value"]) : undefined;
    };

    const affiliateUrl = metaValue("external_link");
    const thumbnailId = metaValue("_thumbnail_id");

    if (!affiliateUrl) {
      console.warn(`⚠️  ${slug} : pas de lien d'affiliation, ignoré`);
      continue;
    }

    // Catégories
    const cats = asArray(post.category)
      .filter((c) => c["@_domain"] === "category")
      .map((c) => ({
        slug: String(c["@_nicename"]),
        name: String(c["#text"] ?? c).trim(),
      }));
    for (const c of cats) categoriesMap.set(c.slug, c.name);

    // Contenu
    let content = cleanContent(String(post["content:encoded"] ?? ""));

    // Image principale (featured)
    let imageUrl = "";
    const originalFeatured = thumbnailId
      ? attachmentUrlById.get(thumbnailId)
      : undefined;
    if (originalFeatured) {
      const fileName = `${slug}${extFromUrl(originalFeatured)}`;
      try {
        await downloadImage(originalFeatured, fileName);
        imageUrl = `${PUBLIC_PREFIX}/${fileName}`;
      } catch (e) {
        console.warn(`⚠️  image principale ${slug} : ${(e as Error).message}`);
      }
    }

    // Images inline dans le contenu -> téléchargées et réécrites en local
    const inlineUrls = [
      ...content.matchAll(/<img[^>]+src="([^"]+)"/g),
    ].map((m) => m[1]);

    const galleryImages: string[] = [];
    let inlineIndex = 0;
    for (const original of inlineUrls) {
      inlineIndex += 1;
      try {
        const fileName = `${slug}-${inlineIndex}${extFromUrl(original)}`;
        await downloadImage(original, fileName);
        const localPath = `${PUBLIC_PREFIX}/${fileName}`;
        content = content.split(original).join(localPath);
        galleryImages.push(localPath);
      } catch (e) {
        console.warn(`⚠️  image inline ${slug} : ${(e as Error).message}`);
      }
    }

    // Si pas d'image principale, on retombe sur la première image inline
    if (!imageUrl && galleryImages.length > 0) imageUrl = galleryImages[0];
    if (!imageUrl) {
      console.warn(`⚠️  ${slug} : aucune image, ignoré`);
      continue;
    }

    products.push({
      title,
      slug,
      shortDescription: buildShortDescription(content),
      content,
      imageUrl,
      images: [],
      affiliateUrl,
      author: String(post["dc:creator"] ?? "Alan"),
      createdAt: new Date(
        `${String(post["wp:post_date_gmt"]).replace(" ", "T")}Z`
      ).toISOString(),
      categories: cats.map((c) => c.slug),
    });
  }

  // Tri par date décroissante (plus récent en premier)
  products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const categories: SeedCategory[] = [...categoriesMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  await writeSeedFile(categories, products);

  console.log(`✅ ${categories.length} catégories, ${products.length} produits`);
  console.log(`✅ Images enregistrées dans ${IMAGES_DIR}/`);
  console.log("✅ prisma/seed.ts régénéré");
};

const writeSeedFile = async (
  categories: SeedCategory[],
  products: SeedProduct[]
) => {
  const file = `import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ⚠️ Fichier généré automatiquement depuis l'export WordPress
// via \`npx tsx scripts/import-wxr.ts\`. Les images sont dans public/products/.

const categories = ${JSON.stringify(categories, null, 2)};

type SeedProduct = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  images: string[];
  affiliateUrl: string;
  author: string;
  createdAt: string;
  categories: string[];
};

const products: SeedProduct[] = ${JSON.stringify(products, null, 2)};

const main = async () => {
  console.log("🌱 Seed en cours...");

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
  console.log(\`✅ \${categories.length} catégories\`);

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        imageUrl: p.imageUrl,
        images: p.images,
        affiliateUrl: p.affiliateUrl,
        author: p.author,
        createdAt: new Date(p.createdAt),
      },
      create: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        content: p.content,
        imageUrl: p.imageUrl,
        images: p.images,
        affiliateUrl: p.affiliateUrl,
        author: p.author,
        createdAt: new Date(p.createdAt),
      },
    });

    await prisma.productCategory.deleteMany({ where: { productId: product.id } });

    for (const slug of p.categories) {
      const category = await prisma.category.findUnique({ where: { slug } });
      if (category) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: category.id },
        });
      }
    }
  }
  console.log(\`✅ \${products.length} produits\`);
  console.log("🎉 Seed terminé !");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  await writeFile("prisma/seed.ts", file, "utf-8");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
