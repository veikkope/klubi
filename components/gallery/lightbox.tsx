"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { urlForImage } from "@/sanity/lib/image";
import type { AlbumImage } from "@/lib/types";

type Props = {
  images: AlbumImage[];
  /** Avoinna olevan kuvan indeksi, tai null kun suljettu. */
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ images, index, onClose, onChange }: Props) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const isOpen = index !== null;

  // Lukitse body-scroll kun auki
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Globaalit näppäimet (ESC, nuolet)
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || index === null) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onChange((index - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onChange((index + 1) % images.length);
      }
    },
    [isOpen, index, images.length, onChange, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Anna fokus close-napille auetessa
  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Yksinkertainen focus trap — Tab kierrätetään dialogin sisällä
  function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !overlayRef.current) return;
    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!isOpen || index === null || typeof document === "undefined") return null;

  const current = images[index];
  const builder = urlForImage(current);
  const src = builder ? builder.width(1800).fit("max").url() : "";

  const overlay = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={trapFocus}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p id={titleId} className="text-sm text-white/80">
          {index + 1} / {images.length}
        </p>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Sulje kuvanäkymä"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X aria-hidden size={22} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-2 sm:px-12"
        onClick={(e) => {
          // Klikkaus tyhjälle alueelle sulkee
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {src && (
          <Image
            key={src}
            src={src}
            alt={current.alt ?? ""}
            width={1800}
            height={1200}
            sizes="100vw"
            className="max-h-[80vh] w-auto select-none object-contain"
            priority
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange((index - 1 + images.length) % images.length)}
              aria-label="Edellinen kuva"
              className="absolute left-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft aria-hidden size={26} />
            </button>
            <button
              type="button"
              onClick={() => onChange((index + 1) % images.length)}
              aria-label="Seuraava kuva"
              className="absolute right-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight aria-hidden size={26} />
            </button>
          </>
        )}
      </div>

      {current.caption && (
        <p className="mx-auto max-w-3xl px-6 pb-6 pt-2 text-center text-sm text-white/80">
          {current.caption}
        </p>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
