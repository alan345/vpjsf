/**
 * Génère les favicons à partir du logo principal.
 * Usage : npx tsx scripts/make-favicon.ts
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const LOGO = "public/logo/voila-pourquoi-je-suis-fauche-logo.png";

// Place le logo (format large) sur un carré blanc avec une petite marge.
const squarePng = async (size: number): Promise<Buffer> => {
  const padding = Math.round(size * 0.12);
  const inner = size - padding * 2;

  const logo = await sharp(LOGO)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
};

const main = async () => {
  // Icône principale (Next génère les <link> à partir de app/icon.png)
  await writeFile("src/app/icon.png", await squarePng(512));
  // Icône Apple (écran d'accueil iOS)
  await writeFile("src/app/apple-icon.png", await squarePng(180));
  // favicon.ico multi-résolutions (16/32/48)
  const icoSizes = await Promise.all([16, 32, 48].map((s) => squarePng(s)));
  await writeFile("src/app/favicon.ico", await pngToIco(icoSizes));

  console.log("✅ Favicons générés : icon.png, apple-icon.png, favicon.ico");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
