import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCategories } from "@/lib/products";
import { SITE } from "@/lib/site";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { FacebookIcon, ChevronDownIcon } from "./icons";

export const Header = async () => {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={`${SITE.name} — Accueil`}
        >
          <Image
            src="/logo/voila-pourquoi-je-suis-fauche-logo.png"
            alt={SITE.name}
            width={400}
            height={171}
            priority
            sizes="(min-width: 640px) 103px, 84px"
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-background hover:text-brand"
          >
            Accueil
          </Link>

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors group-hover:bg-background group-hover:text-brand"
              aria-haspopup="true"
            >
              Catégories
              <ChevronDownIcon className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 min-w-56 translate-y-1 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categorie/${category.slug}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-background hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Notre page Facebook"
            className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-background hover:text-[#1877F2]"
          >
            <FacebookIcon />
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Notre page Facebook"
            className="rounded-full p-2 text-foreground/70 transition-colors hover:text-[#1877F2] lg:hidden"
          >
            <FacebookIcon />
          </a>
          <MobileMenu categories={categories} />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 sm:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
};
