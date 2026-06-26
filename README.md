# VoilaPourquoiJeSuisFauché.fr

Catalogue de cadeaux insolites (affiliation). Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 (PostgreSQL).

## Fonctionnalités

- Page d'accueil avec liste de produits en **mode masonry** + **pagination**
- Produits classés par **catégories** (`/categorie/[slug]`)
- **Recherche** (`/recherche?q=...`)
- **Pages produit** type article de blog (`/produit/[slug]`), avec contenu en Markdown
- Bouton **« Découvrir »** vers la plateforme d'affiliation (`rel="nofollow sponsored"`)
- **SEO** : métadonnées Open Graph, `sitemap.xml`, `robots.txt`, données structurées JSON-LD (Product + Article)
- Backend assuré par Next.js (pas de serveur séparé)

## Prérequis

- Node.js 22+
- PostgreSQL

## Configuration

1. Copier les variables d'environnement :

```bash
cp .env.example .env
```

2. Renseigner `DATABASE_URL` (connexion PostgreSQL) et `NEXT_PUBLIC_SITE_URL` dans `.env`.

3. Installer les dépendances :

```bash
npm install
```

4. Créer le schéma en base et générer le client :

```bash
npm run db:push
```

5. (Optionnel) Insérer des produits d'exemple :

```bash
npm run db:seed
```

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
| `npm run db:seed`  | Insère les produits d'exemple                 |
| `npm run db:studio`| Ouvre Prisma Studio                           |

## Ajouter des produits

Les produits s'ajoutent **directement en base de données** (table `products`, liée à `categories` via `product_categories`). Le champ `content` accepte du **Markdown** (titres, listes, gras, liens), rendu sur la page produit.
