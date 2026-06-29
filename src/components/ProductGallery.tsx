"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "./icons";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasMultiple = images.length > 1;
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);

  const goTo = useCallback(
    (next: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const count = images.length;
        return (next + count) % count;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goTo((openIndex ?? 0) + 1);
      if (e.key === "ArrowLeft") goTo((openIndex ?? 0) - 1);
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, openIndex, goTo, close]);

  const [mainImage, ...thumbnails] = images;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          aria-label={`Agrandir l'image de ${title}`}
          className="block w-full cursor-zoom-in"
        >
          <Image
            src={mainImage}
            alt={title}
            width={1000}
            height={1000}
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </button>
      </div>

      {thumbnails.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {thumbnails.map((src, i) => (
            <button
              type="button"
              key={src}
              onClick={() => setOpenIndex(i + 1)}
              aria-label={`Voir l'image ${i + 2} de ${title}`}
              className="overflow-hidden rounded-xl border border-border bg-surface cursor-pointer transition-transform hover:scale-[1.03]"
            >
              <Image
                src={src}
                alt={`${title} – image ${i + 2}`}
                width={300}
                height={300}
                className="h-auto w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie d'images de ${title}`}
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <CloseIcon />
          </button>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo((openIndex ?? 0) - 1);
              }}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6 sm:p-3"
            >
              <ChevronLeftIcon size={28} />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[80vh] w-full max-w-4xl items-center justify-center"
          >
            <Image
              src={images[openIndex ?? 0]}
              alt={`${title} – image ${(openIndex ?? 0) + 1}`}
              width={1200}
              height={1200}
              sizes="(max-width: 896px) 100vw, 896px"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo((openIndex ?? 0) + 1);
              }}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6 sm:p-3"
            >
              <ChevronRightIcon size={28} />
            </button>
          )}

          {hasMultiple && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-4 flex max-w-full items-center gap-2 overflow-x-auto px-2"
            >
              {images.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Aller à l'image ${i + 1}`}
                  aria-current={i === openIndex}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-opacity ${
                    i === openIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <p className="mt-3 text-sm text-white/70">
            {(openIndex ?? 0) + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
};
