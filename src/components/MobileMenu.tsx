"use client";

import Link from "next/link";
import { useState } from "react";

type Category = { id: string; name: string; slug: string };

export const MobileMenu = ({ categories }: { categories: Category[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="rounded-full p-2 text-foreground transition-colors hover:bg-background"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          ) : (
            <>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <nav className="fixed right-0 top-0 z-50 flex h-full w-72 max-w-[80%] flex-col gap-1 border-l border-border bg-surface p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold">Catégories</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-1 hover:bg-background"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorie/${category.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-background hover:text-brand"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
};
