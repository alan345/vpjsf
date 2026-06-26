export const SITE = {
  name: "VoilaPourquoiJeSuisFauche.fr",
  shortName: "VPJSF",
  baseline: "Le catalogue cadeaux des grands enfants",
  description:
    "Découvrez des cadeaux insolites, drôles et originaux qui feront de vous le roi de l'originalité sans vous ruiner.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  author: "Alan",
  locale: "fr_FR",
  facebook: "https://www.facebook.com/Voilapourquoijesuisfauche",
} as const;

export const PAGE_SIZE = 12;
