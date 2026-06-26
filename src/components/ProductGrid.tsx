import type { ProductWithCategories } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({
  products,
}: {
  products: ProductWithCategories[];
}) => {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
        <p className="text-lg font-semibold">Aucun produit trouvé</p>
        <p className="mt-1 text-sm text-muted">
          Essayez une autre recherche ou explorez nos catégories.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
