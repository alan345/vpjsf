import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) return { title: "Produit introuvable" };

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.title,
      description: product.shortDescription,
      url: `${SITE.url}/produit/${product.slug}`,
      images: [{ url: product.imageUrl, alt: product.title }],
      publishedTime: product.createdAt.toISOString(),
      modifiedTime: product.updatedAt.toISOString(),
      authors: [product.author],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription,
      images: [product.imageUrl],
    },
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product).catch(() => []);
  const gallery = [product.imageUrl, ...product.images];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: gallery,
    category: product.categories.map((c) => c.category.name).join(", "),
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            price: product.price.replace(/[^0-9,.]/g, "").replace(",", "."),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: product.affiliateUrl,
          },
        }
      : {}),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: product.title,
    description: product.shortDescription,
    image: product.imageUrl,
    datePublished: product.createdAt.toISOString(),
    dateModified: product.updatedAt.toISOString(),
    author: { "@type": "Person", name: product.author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/produit/${product.slug}`,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <JsonLd data={productJsonLd} />
      <JsonLd data={articleJsonLd} />

      <nav className="mb-6 text-sm text-muted" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-brand">
          Accueil
        </Link>
        {product.categories[0] && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categorie/${product.categories[0].category.slug}`}
              className="hover:text-brand"
            >
              {product.categories[0].category.name}
            </Link>
          </>
        )}
      </nav>

      <header className="mb-6">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
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
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {product.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <span>Par {product.author}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={product.createdAt.toISOString()}>
            {formatDate(product.createdAt)}
          </time>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={1000}
          height={1000}
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          className="h-auto w-full object-cover"
        />
      </div>

      {product.images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {product.images.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <Image
                src={src}
                alt={product.title}
                width={300}
                height={300}
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-lg font-medium text-foreground/90">
        {product.shortDescription}
      </p>

      <div className="my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex-1">
          {product.price && (
            <p className="text-2xl font-extrabold text-foreground">
              {product.price}
            </p>
          )}
          <p className="text-sm text-muted">
            Disponible sur notre plateforme partenaire.
          </p>
        </div>
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
        >
          Découvrir
          <span aria-hidden="true">›</span>
        </a>
      </div>

      <div
        className="prose-article"
        dangerouslySetInnerHTML={{ __html: product.content }}
      />

      <div className="mt-8">
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-brand-dark"
        >
          Découvrir ce produit
          <span aria-hidden="true">›</span>
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
            Ça pourrait aussi vous plaire
          </h2>
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
