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
- Un projet [Supabase](https://supabase.com) (PostgreSQL + Storage)

## Configuration

1. Copier les variables d'environnement :

```bash
cp .env.example .env
```

2. Renseigner dans `.env` (toutes ces valeurs sont dans le dashboard Supabase → Project Settings) :
   - `DATABASE_URL` : connexion **pooler** (Supavisor, port `6543`, `?pgbouncer=true`) — utilisée au runtime.
   - `DIRECT_URL` : connexion **directe** (port `5432`) — utilisée par le CLI Prisma (migrations/seed).
   - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` : pour le stockage des images.
   - `NEXT_PUBLIC_SITE_URL` : URL publique du site.

3. Installer les dépendances :

```bash
npm install
```

4. Créer le schéma en base et générer le client :

```bash
npm run db:push
```

5. Envoyer les images vers Supabase Storage (crée le bucket public et réécrit `prisma/seed.ts` avec les URLs Supabase) :

```bash
npm run images:upload
```

6. Insérer les produits :

```bash
npm run db:seed
```

## Déploiement (Vercel + Supabase)

Le dépôt contient un blueprint `vercel.json` (framework Next.js, région `cdg1` / Paris).

1. **Supabase** : créer un projet, récupérer les chaînes de connexion (`DATABASE_URL` pooler + `DIRECT_URL` directe) et les clés.
2. Préparer la base et les images **une seule fois** depuis votre machine (`.env` pointant sur Supabase) :

```bash
npm run db:push && npm run images:upload && npm run db:seed
```

3. **Vercel** : importer le dépôt GitHub, puis définir les variables d'environnement du projet :
   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `NEXT_PUBLIC_SITE_URL`.
4. Déployer. Le build (`prisma generate && next build`) ne touche pas la base (pages rendues dynamiquement).

## Développement

```bash
npm run dev
```

Le site est disponible sur http://localhost:3000.

## Scripts utiles

| Script             | Description                                   |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Serveur de développement                      |
| `npm run build`    | Build de production (`prisma generate` inclus)|
| `npm run start`    | Serveur de production                         |
| `npm run db:push`  | Synchronise le schéma Prisma avec la base     |
| `npm run db:seed`  | Insère les produits                           |
| `npm run db:studio`| Ouvre Prisma Studio                           |
| `npm run images:upload` | Envoie `public/products/` vers Supabase Storage |

## Ajouter des produits

Les produits s'ajoutent **directement en base de données** (table `products`, liée à `categories` via `product_categories`). Le champ `content` contient du **HTML** rendu sur la page produit. Pour les images, déposez-les dans le bucket Supabase `product-images` et collez l'URL publique dans `imageUrl`.
