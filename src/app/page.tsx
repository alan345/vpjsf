import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { products, totalPages, page: resolvedPage } = await getProducts({
    page: currentPage,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Le catalogue cadeaux des grands enfants
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
          {SITE.description}
        </p>
      </section>

      <ProductGrid products={products} />

      <Pagination
        page={resolvedPage}
        totalPages={totalPages}
        basePath="/"
      />
    </div>
  );
}
