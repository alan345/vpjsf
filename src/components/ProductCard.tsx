import Image from "next/image";
import Link from "next/link";
import type { ProductWithCategories } from "@/lib/products";
import { formatDate } from "@/lib/format";
import { withAffiliateTag } from "@/lib/site";

export const ProductCard = ({
  product,
}: {
  product: ProductWithCategories;
}) => {
  const href = `/produit/${product.slug}`;

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={href} aria-label={product.title}>
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={600}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-auto w-full bg-background object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
        <a
          href={withAffiliateTag(product.affiliateUrl)}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
        >
          Découvrir
          <span aria-hidden="true">›</span>
        </a>
      </div>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
          {product.categories.map(({ category }) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-brand hover:underline"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <h2 className="text-lg font-bold leading-snug">
          <Link href={href} className="hover:text-brand">
            {product.title}
          </Link>
        </h2>

        <Link href={href} className="mt-2 block">
          <p className="text-sm text-muted">{product.shortDescription}</p>
        </Link>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span>{product.author}</span>
          <time dateTime={product.createdAt.toISOString()}>
            {formatDate(product.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
};
