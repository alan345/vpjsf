import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProducts,
} from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const generateMetadata = async ({
  params,
}: CategoryPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);

  if (!category) return { title: "Catégorie introuvable" };

  const title = `${category.name} – Idées cadeaux`;
  const description =
    category.description ??
    `Découvrez notre sélection de cadeaux insolites dans la catégorie « ${category.name} ».`;

  return {
    title,
    description,
    alternates: { canonical: `/categorie/${category.slug}` },
    openGraph: {
      title: `${title} – ${SITE.name}`,
      description,
      url: `${SITE.url}/categorie/${category.slug}`,
    },
  };
};

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const currentPage = Number(page) || 1;
  const { products, totalPages, page: resolvedPage } = await getProducts({
    page: currentPage,
    categorySlug: slug,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav className="mb-4 text-sm text-muted" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-brand">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 text-muted">
          Nos meilleures idées cadeaux dans cette catégorie.
        </p>
      </header>

      <ProductGrid products={products} />

      <Pagination
        page={resolvedPage}
        totalPages={totalPages}
        basePath={`/categorie/${slug}`}
      />
    </div>
  );
}
