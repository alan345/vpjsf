import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/products";
import { SITE } from "@/lib/site";
import { FacebookIcon } from "./icons";

export const Footer = async () => {
  const categories = await getCategories().catch(() => []);

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Image
            src="/logo/voila-pourquoi-je-suis-fauche-logo.png"
            alt={SITE.name}
            width={926}
            height={397}
            className="h-10 w-auto"
          />
          <p className="mt-3 max-w-sm text-sm text-muted">{SITE.description}</p>
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Notre page Facebook"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <FacebookIcon size={18} />
            Suivez-nous sur Facebook
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            Catégories
          </h3>
          <ul className="space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categorie/${category.slug}`}
                  className="text-foreground/80 transition-colors hover:text-brand"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            À propos
          </h3>
          <p className="text-sm text-muted">
            Là où votre portefeuille peut enfin se détendre et rire un bon coup.
            Des cadeaux insolites sans vous ruiner.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name} — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
