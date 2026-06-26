"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    router.push(query ? `/recherche?q=${encodeURIComponent(query)}` : "/");
  };

  return (
    <form onSubmit={handleSubmit} className="relative" role="search">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher un cadeau…"
        aria-label="Rechercher un produit"
        className="w-full rounded-full border border-border bg-background py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:border-brand sm:w-56"
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:text-brand"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
};
