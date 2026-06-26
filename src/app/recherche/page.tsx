import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const { q } = await searchParams;
  return {
    title: q ? `Recherche : ${q}` : "Recherche",
    description: q
      ? `Résultats de recherche pour « ${q} ».`
      : "Recherchez un cadeau insolite.",
    robots: { index: false, follow: true },
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";
  const currentPage = Number(page) || 1;

  const { products, total, totalPages, page: resolvedPage } = await getProducts({
    page: currentPage,
    query,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Recherche
        </h1>
        {query ? (
          <p className="mt-2 text-muted">
            {total} résultat{total > 1 ? "s" : ""} pour «{" "}
            <span className="font-semibold text-foreground">{query}</span> »
          </p>
        ) : (
          <p className="mt-2 text-muted">
            Saisissez un mot-clé dans la barre de recherche.
          </p>
        )}
      </header>

      <ProductGrid products={products} />

      <Pagination
        page={resolvedPage}
        totalPages={totalPages}
        basePath="/recherche"
        query={{ q: query }}
      />
    </div>
  );
}
