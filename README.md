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
- [pnpm](https://pnpm.io) (gestionnaire de paquets)
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
pnpm install
```

4. Créer le schéma en base et générer le client :

```bash
pnpm db:push
```

5. Insérer les produits :

```bash
pnpm db:seed
```

Les images produits sont servies localement depuis `public/products/` (versionnées dans le dépôt).

## Déploiement (Vercel + Prisma Postgres)

Le dépôt contient un blueprint `vercel.json` (framework Next.js, région `cdg1` / Paris).

1. **Prisma Postgres** : créer une base, récupérer `POSTGRES_URL` (directe) et `PRISMA_DATABASE_URL` (Accelerate).
2. Préparer la base **une seule fois** depuis votre machine (`.env` pointant sur Prisma Postgres) :

```bash
pnpm db:push && pnpm db:seed
```

3. **Vercel** : importer le dépôt GitHub, puis définir les variables d'environnement :
   `POSTGRES_URL`, `PRISMA_DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`.
4. Déployer. Le build (`prisma generate && next build`) ne touche pas la base (pages rendues dynamiquement).

## Développement

```bash
pnpm dev
```

Le site est disponible sur http://localhost:3000.

## Scripts utiles

| Script           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Serveur de développement                       |
| `pnpm build`     | Build de production (`prisma generate` inclus) |
| `pnpm start`     | Serveur de production                          |
| `pnpm db:push`   | Synchronise le schéma Prisma avec la base      |
| `pnpm db:seed`   | Insère les produits                            |
| `pnpm db:studio` | Ouvre Prisma Studio                            |

## Ajouter des produits

Les produits s'ajoutent **directement en base de données** (table `products`, liée à `categories` via `product_categories`). Le champ `content` contient du **HTML** rendu sur la page produit. Les images sont hébergées sur **Vercel Blob** ; envoyez votre fichier (dashboard Vercel → Storage → Blob, ou `put()` du SDK) et collez l'URL publique dans `imageUrl`.

Pour migrer les images locales `public/products/` vers Vercel Blob et mettre à jour la base :

```bash
pnpm images:blob
```

https://developers.facebook.com/tools/explorer/

https://developers.facebook.com/tools/debug/accesstoken
