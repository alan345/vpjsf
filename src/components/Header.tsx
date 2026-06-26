import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/products";
import { SITE } from "@/lib/site";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";

export const Header = async () => {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:py-4">
        <Link href="/" className="flex shrink-0 flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            VoilaPourquoiJeSuisFauché
            <span className="text-brand">.fr</span>
          </span>
          <span className="hidden text-xs text-muted sm:block">
            {SITE.baseline}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-background hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
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
