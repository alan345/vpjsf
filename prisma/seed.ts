import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Pour les Enfants", slug: "pour-les-enfants" },
  { name: "Pour les Parents", slug: "pour-les-parents" },
  { name: "Pour les Animaux", slug: "pour-les-animaux" },
  { name: "Pour les Grands", slug: "pour-les-grands" },
];

type SeedProduct = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  affiliateUrl: string;
  price?: string;
  categories: string[];
};

const products: SeedProduct[] = [
  {
    title: "Une pieuvre géante de 8 mètres qui plane dans le ciel",
    slug: "cerf-volant-pieuvre-geante",
    shortDescription:
      "Un cerf-volant pieuvre de 7,9 m, tentacules au vent et effet prisme 3D. Le roi incontesté de la plage, sans montage compliqué.",
    content: `## La star incontestée de la plage

Imaginez la scène : vous arrivez sur la plage, vous sortez **une pieuvre de presque 8 mètres** de votre sac, et soudain, tous les regards sont braqués sur vous.

Ce cerf-volant n'a besoin d'aucune armature compliquée. On le déplie, on attrape le vent, et hop : ses longues tentacules ondulent dans le ciel comme une vraie créature marine.

### Pourquoi vous allez l'adorer

- **7,9 mètres** de tentacules hypnotiques
- Effet **prisme 3D** qui change de couleur au soleil
- **Aucun montage** : il se gonfle tout seul avec le vent
- Idéal pour la plage, les grands parcs et les pique-niques

Bref, le cadeau parfait pour redevenir un enfant le temps d'un après-midi venteux.`,
    imageUrl: "https://picsum.photos/seed/pieuvre/600/820",
    affiliateUrl: "https://example.com/affiliation/cerf-volant-pieuvre",
    price: "29,90 €",
    categories: ["pour-les-enfants"],
  },
  {
    title: "Le collier croix qui cache une arme secrète (oui, vraiment)",
    slug: "collier-croix-auto-defense",
    shortDescription:
      "Une élégante croix en acier inoxydable… qui cache un mécanisme à pointe rétractable. Le bijou d'auto-défense le plus inattendu de l'année.",
    content: `## Discret le jour, rassurant la nuit

À première vue, c'est une **croix élégante en acier inoxydable**. Sobre, classe, parfaite avec n'importe quelle tenue.

Mais ce bijou cache un petit secret : un mécanisme à pointe rétractable pensé pour les situations imprévues.

### Les points forts

- Acier inoxydable **résistant et durable**
- Mécanisme discret et facile à activer
- Chaîne fournie

Un objet insolite qui ne laisse personne indifférent.`,
    imageUrl: "https://picsum.photos/seed/collier/600/760",
    affiliateUrl: "https://example.com/affiliation/collier-croix",
    price: "19,90 €",
    categories: ["pour-les-grands"],
  },
  {
    title: "I'm Fine – Le T-Shirt à l'humour (très) noir",
    slug: "tshirt-im-fine",
    shortDescription:
      "Humour noir & confort garanti. Vous en avez marre de devoir expliquer que tout va bien alors que… tout va bien (ou pas).",
    content: `## « Tout va bien », vraiment ?

Ce t-shirt **« I'm Fine »** dit tout haut ce que vous pensez tout bas. Avec son petit clin d'œil à l'humour noir, il fait sourire (ou grincer des dents) à coup sûr.

### Le détail qui tue

- Coton doux et **confortable**
- Coupe unisexe
- Le cadeau parfait pour les amateurs de second degré

Parce que rire de tout, c'est aussi une philosophie de vie.`,
    imageUrl: "https://picsum.photos/seed/tshirt/600/700",
    affiliateUrl: "https://example.com/affiliation/tshirt-im-fine",
    price: "24,90 €",
    categories: ["pour-les-grands", "pour-les-parents"],
  },
  {
    title: "Sac de couchage avec des jambes",
    slug: "sac-de-couchage-avec-jambes",
    shortDescription:
      "Qui a dit que vous ne pouviez pas être une chenille chaleureuse et avoir la mobilité d'une gazelle ?",
    content: `## La chaleur sans sacrifier la mobilité

Marre de sautiller comme un ver de terre dès qu'il faut se lever du sac de couchage ? Ce **sac de couchage à jambes** change la donne.

### Pourquoi c'est génial

- Vous pouvez **marcher** tout en restant au chaud
- Idéal pour le camping, les festivals ou le canapé
- Ultra-confortable et bien isolé

La preuve qu'on peut être au chaud ET libre de ses mouvements.`,
    imageUrl: "https://picsum.photos/seed/couchage/600/800",
    affiliateUrl: "https://example.com/affiliation/sac-couchage",
    price: "59,90 €",
    categories: ["pour-les-grands"],
  },
  {
    title: "Infuseur à thé en forme de parapluie",
    slug: "infuseur-the-parapluie",
    shortDescription:
      "Le jour où votre thé a demandé un abri contre la pluie ! Un infuseur adorable qui se suspend au bord de votre tasse.",
    content: `## Un petit abri pour vos feuilles de thé

Cet **infuseur à thé en forme de parapluie** est aussi mignon qu'utile. Sa chaînette se pose sur le bord de votre tasse, et le « parapluie » plonge dans l'eau chaude.

### Les avantages

- En **acier inoxydable** alimentaire
- Facile à remplir et à nettoyer
- Un objet déco sur votre table

Le détail rigolo qui rend la pause thé bien plus poétique.`,
    imageUrl: "https://picsum.photos/seed/infuseur/600/740",
    affiliateUrl: "https://example.com/affiliation/infuseur-the",
    price: "9,90 €",
    categories: ["pour-les-grands"],
  },
  {
    title: "Tente gonflable transparente pour un ciel étoilé",
    slug: "tente-gonflable-transparente",
    shortDescription:
      "Quand la Terre devient une tente à étoiles. Dormez à la belle étoile… à l'abri des moustiques.",
    content: `## Dormir sous les étoiles, sans les inconvénients

Vous rêvez de **dormir à la belle étoile** mais sans la rosée, les insectes et le sol dur ? Cette tente gonflable transparente est faite pour vous.

### Ce qu'on adore

- Vue **panoramique** sur le ciel
- Se gonfle en quelques minutes
- Parfaite pour les nuits romantiques ou les observations d'étoiles

Une expérience inoubliable à partager.`,
    imageUrl: "https://picsum.photos/seed/tente/600/820",
    affiliateUrl: "https://example.com/affiliation/tente-transparente",
    price: "249,00 €",
    categories: ["pour-les-enfants", "pour-les-grands"],
  },
  {
    title: "Mug Dragon Ball Z – Goku Thermoréactif",
    slug: "mug-dragonball-goku",
    shortDescription:
      "Transformez votre routine matinale en expérience épique : versez votre café chaud et Goku passe en Super Saiyan !",
    content: `## Over 9000 degrés de plaisir

Ce **mug thermoréactif Goku** est l'accessoire ultime des fans de Dragon Ball Z. À froid, Goku est tout ce qu'il y a de plus normal. Versez une boisson chaude, et il se transforme en **Super Saiyan** !

### Caractéristiques

- Effet **magique** au contact de la chaleur
- Céramique de qualité
- Le cadeau parfait pour les nostalgiques

Votre café n'aura jamais été aussi épique.`,
    imageUrl: "https://picsum.photos/seed/mug-goku/600/700",
    affiliateUrl: "https://example.com/affiliation/mug-goku",
    price: "14,90 €",
    categories: ["pour-les-enfants"],
  },
  {
    title: "Crinière de lion pour chien",
    slug: "criniere-lion-chien",
    shortDescription:
      "Transformez votre toutou en roi de la savane avec la crinière de lion royale ! Effet garanti au parc.",
    content: `## Votre chien, roi de la savane

Votre fidèle compagnon mérite bien un peu de majesté. Avec cette **crinière de lion**, il devient instantanément le roi du quartier.

### À savoir

- **Confortable** et facile à attacher
- Plusieurs tailles disponibles
- Fou rire garanti lors des balades

Attention, les selfies risquent de pleuvoir.`,
    imageUrl: "https://picsum.photos/seed/lion-chien/600/780",
    affiliateUrl: "https://example.com/affiliation/criniere-lion",
    price: "12,90 €",
    categories: ["pour-les-animaux"],
  },
  {
    title: "Pantoufles grenouilles pour vos balades au lac",
    slug: "pantoufles-grenouilles",
    shortDescription:
      "Ajoutez une touche d'amphibie à votre routine de détente à la maison avec ces pantoufles grenouilles géantes.",
    content: `## Le confort version étang

Ces **pantoufles grenouilles** sont absurdes, moelleuses et incroyablement confortables. Parfaites pour traîner à la maison ou faire rire toute la famille.

### Les plus

- Matière **ultra-douce**
- Semelle antidérapante
- Taille unique très extensible

Coassements non inclus.`,
    imageUrl: "https://picsum.photos/seed/grenouille/600/720",
    affiliateUrl: "https://example.com/affiliation/pantoufles-grenouilles",
    price: "16,90 €",
    categories: ["pour-les-enfants", "pour-les-grands"],
  },
  {
    title: "La guillotine à bagel",
    slug: "guillotine-bagel",
    shortDescription:
      "Tranchez vos bagels sans pitié ! Une expérience culinaire aussi sûre qu'hilarante.",
    content: `## Tranchez avec style (et sans drame)

Couper un bagel sans se couper le doigt relève parfois de l'exploit. La **guillotine à bagel** met fin au massacre.

### Pourquoi l'adopter

- Tranches **régulières** à chaque fois
- Sécurité optimale pour vos doigts
- Design fun sur le plan de travail

Le petit-déjeuner devient une véritable scène de théâtre.`,
    imageUrl: "https://picsum.photos/seed/bagel/600/760",
    affiliateUrl: "https://example.com/affiliation/guillotine-bagel",
    price: "21,90 €",
    categories: ["pour-les-grands"],
  },
  {
    title: "Pot de fleur visage rigolo",
    slug: "pot-de-fleur-visage",
    shortDescription:
      "Faites pousser des sourires dans votre maison ! Un pot de fleur visage où les plantes deviennent une coiffure folle.",
    content: `## Quand vos plantes prennent vie

Ce **pot de fleur en forme de visage** transforme n'importe quelle plante en coiffure délirante. Plus vos plantes poussent, plus la coupe devient folle.

### Détails

- Céramique solide
- Trou de drainage
- Parfait pour les herbes aromatiques ou les succulentes

Un sourire garanti sur le rebord de la fenêtre.`,
    imageUrl: "https://picsum.photos/seed/pot-visage/600/700",
    affiliateUrl: "https://example.com/affiliation/pot-fleur-visage",
    price: "18,90 €",
    categories: ["pour-les-enfants"],
  },
  {
    title: "Kit de golf pour les toilettes",
    slug: "kit-golf-toilette",
    shortDescription:
      "Transformez votre temps aux toilettes en une expérience de golf mémorable. Le cadeau gag par excellence.",
    content: `## Le par sur le trône

Pour celui qui a déjà tout, voici le **kit de golf toilette** : un putter miniature, une balle, un petit drapeau et un tapis de putting.

### Ce que contient le kit

- Un mini **putter**
- Deux balles
- Un tapis de putting et un drapeau

Le cadeau d'anniversaire qui fera rire toute la tablée.`,
    imageUrl: "https://picsum.photos/seed/golf-wc/600/740",
    affiliateUrl: "https://example.com/affiliation/kit-golf-toilette",
    price: "15,90 €",
    categories: ["pour-les-parents"],
  },
];

const main = async () => {
  console.log("🌱 Seed en cours...");

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
  console.log(`✅ ${categories.length} catégories`);

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        imageUrl: p.imageUrl,
        affiliateUrl: p.affiliateUrl,
        price: p.price,
      },
      create: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        content: p.content,
        imageUrl: p.imageUrl,
        affiliateUrl: p.affiliateUrl,
        price: p.price,
      },
    });

    await prisma.productCategory.deleteMany({
      where: { productId: product.id },
    });

    for (const slug of p.categories) {
      const category = await prisma.category.findUnique({ where: { slug } });
      if (category) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: category.id },
        });
      }
    }
  }
  console.log(`✅ ${products.length} produits`);
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
