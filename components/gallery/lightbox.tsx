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

/**
 * Kuvien suurennusnäkymä.
 *
 * Saavutettavuusvaatimukset, jotka ohjaavat toteutusta:
 *  - `role="dialog"` + `aria-modal="true"` kertoo ruudunlukijalle että muu
 *    sivu on tavoittamattomissa
 *  - Esc sulkee, ← ja → selaavat
 *  - Tab kiertää dialogin sisällä, ei karkaa taustalle
 *  - Fokus siirtyy auetessa dialogiin ja palautuu sulkiessa avaajanappiin
 *    (palautus tehdään `AlbumGrid`:ssä, joka tietää avaajan)
 *  - Kaikki napit ovat vähintään 44 × 44 px
 */

type Props = {
  images: AlbumImage[];
  /** Avoinna olevan kuvan indeksi, tai null kun suljettu. */
  index: number | null;
  albumTitle?: string;
  onClose: () => void;
  onChange: (index: number) => void;
};

const navButtonClass =
  "absolute inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25";

export function Lightbox({
  images,
  index,
  albumTitle,
  onClose,
  onChange,
}: Props) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const isOpen = index !== null;

  // Lukitse taustan vieritys kun dialogi on auki.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (index === null) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChange((index - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onChange((index + 1) % images.length);
      }
    },
    [index, images.length, onChange, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Fokus dialogiin heti auetessa.
  useEffect(() => {
    if (isOpen) closeBtnRef.current?.focus();
  }, [isOpen]);

  /** Tab kiertää dialogin sisällä. */
  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !overlayRef.current) return;
    // `[tabindex="-1"]` rajataan pois: taustaklikkausnappi ei saa olla
    // Tab-kierrossa mukana, muuten fokus katoaa näkymättömään elementtiin.
    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!isOpen || index === null || typeof document === "undefined") return null;

  const current = images[index];
  const builder = urlForImage(current);
  const src = builder ? builder.width(1800).fit("max").url() : "";
  const heading = albumTitle
    ? `${albumTitle} — kuva ${index + 1}/${images.length}`
    : `Kuva ${index + 1}/${images.length}`;

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
          {heading}
        </p>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Sulje kuvanäkymä"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/15"
        >
          <X aria-hidden size={22} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 sm:px-20">
        {/* Taustaklikkaus sulkee. Nappina, jotta se ei ole näppäimistölle
            näkymätön interaktio — Esc tekee saman. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />

        {src && (
          <Image
            key={src}
            src={src}
            alt={
              current.alt?.trim() ||
              current.caption?.trim() ||
              `${albumTitle ?? "Albumi"}, kuva ${index + 1}/${images.length}`
            }
            width={1800}
            height={1200}
            sizes="100vw"
            priority
            className="relative h-auto max-h-[78vh] w-auto max-w-full select-none object-contain"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                onChange((index - 1 + images.length) % images.length)
              }
              aria-label="Edellinen kuva"
              className={`${navButtonClass} left-2 sm:left-6`}
            >
              <ChevronLeft aria-hidden size={26} />
            </button>
            <button
              type="button"
              onClick={() => onChange((index + 1) % images.length)}
              aria-label="Seuraava kuva"
              className={`${navButtonClass} right-2 sm:right-6`}
            >
              <ChevronRight aria-hidden size={26} />
            </button>
          </>
        )}
      </div>

      {(current.caption || current.alt) && (
        <p className="mx-auto max-w-3xl px-6 pb-6 pt-3 text-center text-sm text-white/80">
          {current.caption || current.alt}
        </p>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
