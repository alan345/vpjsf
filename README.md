# VoilaPourquoiJeSuisFauché.fr

Catalogue de cadeaux insolites (affiliation). Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 (PostgreSQL).

## Fonctionnalités

- Page d'accueil avec liste de produits en **mode masonry** + **pagination**
- Produits classés par **catégories** (`/categorie/[slug]`)
- **Recherche** (`/recherche?q=...`)
- **Pages produit** type article de blog (`/produit/[slug]`), avec contenu HTML
- Bouton **« Découvrir »** vers la plateforme d'affiliation (`rel="nofollow sponsored"`)
- **SEO** : métadonnées Open Graph, `sitemap.xml`, `robots.txt`, données structurées JSON-LD (Product + Article)
- Backend assuré par Next.js (pas de serveur séparé)

## Prérequis

- Node.js 22+
- Une base [Prisma Postgres](https://www.prisma.io/postgres)

## Configuration

1. Copier les variables d'environnement :

```bash

cp .env.example .env
```

2. Renseigner dans `.env` (valeurs fournies par Prisma Postgres) :
   - `POSTGRES_URL` : connexion **directe** (TCP) — utilisée par l'app (adaptateur `pg`) et le CLI Prisma.
   - `PRISMA_DATABASE_URL` : connexion Accelerate (`prisma+postgres://`) — optionnelle.
   - `NEXT_PUBLIC_SITE_URL` : URL publique du site.

3. Installer les dépendances :

```bash
npm install
```

4. Créer le schéma en base et générer le client :

```bash
npm run db:push
```

5. Insérer les produits :

```bash
npm run db:seed
```

Les images produits sont servies localement depuis `public/products/` (versionnées dans le dépôt).

## Déploiement (Vercel + Prisma Postgres)

Le dépôt contient un blueprint `vercel.json` (framework Next.js, région `cdg1` / Paris).

1. **Prisma Postgres** : créer une base, récupérer `POSTGRES_URL` (directe) et `PRISMA_DATABASE_URL` (Accelerate).
2. Préparer la base **une seule fois** depuis votre machine (`.env` pointant sur Prisma Postgres) :

```bash
npm run db:push && npm run db:seed
```

3. **Vercel** : importer le dépôt GitHub, puis définir les variables d'environnement :
   `POSTGRES_URL`, `PRISMA_DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`.
4. Déployer. Le build (`prisma generate && next build`) ne touche pas la base (pages rendues dynamiquement).

## Développement

```bash
npm run dev
```

Le site est disponible sur http://localhost:3000.

## Scripts utiles

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Serveur de développement                       |
| `npm run build`     | Build de production (`prisma generate` inclus) |
| `npm run start`     | Serveur de production                          |
| `npm run db:push`   | Synchronise le schéma Prisma avec la base      |
| `npm run db:seed`   | Insère les produits                            |
| `npm run db:studio` | Ouvre Prisma Studio                            |

## Ajouter des produits

Les produits s'ajoutent **directement en base de données** (table `products`, liée à `categories` via `product_categories`). Le champ `content` contient du **HTML** rendu sur la page produit. Pour les images, déposez le fichier dans `public/products/` et renseignez `imageUrl` (ex. `/products/mon-image.jpg`).
