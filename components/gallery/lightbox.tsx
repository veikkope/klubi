"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal, preload } from "react-dom";
import Image, { getImageProps } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { assetDimensions } from "@/components/sanity-image";
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
 *  - Kuvan vaihtuminen luetaan ruudunlukijalle (otsikko on `aria-live`)
 *
 * Kosketusnäytöllä kuvaa vaihdetaan pyyhkäisemällä: kuva seuraa sormea, ja
 * riittävän pitkä vaakaveto vaihtaa kuvan. Edellinen ja seuraava kuva
 * ladataan valmiiksi, joten selatessa ei näy tyhjää.
 */

/** Katselukuvan enimmäisleveys CDN:ltä. */
const KATSELU_MAX = 1800;
/** Näin monta pikseliä vaakaan, niin veto vaihtaa kuvan. */
const PYYHKAISY_KYNNYS = 50;

/** Katselukuvan osoite ja mitat. Mitat assetista, jotta kuvan tila varataan oikein. */
function katselukuva(image: AlbumImage): { src: string; width: number; height: number } | null {
  const builder = urlForImage(image);
  if (!builder) return null;
  const alkuperainen = assetDimensions(image);
  const width = Math.min(KATSELU_MAX, alkuperainen?.width ?? KATSELU_MAX);
  const height = alkuperainen
    ? Math.round((alkuperainen.height / alkuperainen.width) * width)
    : Math.round(width / 1.5);
  return { src: builder.width(width).fit("max").url(), width, height };
}

/**
 * Esilataa kuvan samalla srcsetillä kuin katselunäkymän `<Image>`, jolloin
 * selain valitsee saman koon ja käyttää ladattua tiedostoa.
 */
function esilataa(image: AlbumImage | undefined) {
  const kuva = image && katselukuva(image);
  if (!kuva) return;
  const { props } = getImageProps({ ...kuva, alt: "", sizes: "100vw" });
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}

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

  // Naapurikuvat valmiiksi, molempiin suuntiin (selaus kiertää).
  useEffect(() => {
    if (index === null || images.length < 2) return;
    esilataa(images[(index + 1) % images.length]);
    esilataa(images[(index - 1 + images.length) % images.length]);
  }, [index, images]);

  const edellinen = useCallback(() => {
    if (index !== null) onChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onChange]);
  const seuraava = useCallback(() => {
    if (index !== null) onChange((index + 1) % images.length);
  }, [index, images.length, onChange]);

  const pyyhkaisy = usePyyhkaisy({
    kaytossa: images.length > 1,
    vasemmalle: seuraava,
    oikealle: edellinen,
  });

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
  const kuva = katselukuva(current);
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
        <p id={titleId} aria-live="polite" className="text-sm text-white/80">
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

      <div
        className="relative flex flex-1 touch-pan-y touch-pinch-zoom items-center justify-center overflow-hidden px-2 sm:px-20"
        {...pyyhkaisy.kasittelijat}
      >
        {/* Taustaklikkaus sulkee. Nappina, jotta se ei ole näppäimistölle
            näkymätön interaktio — Esc tekee saman. Pyyhkäisyn päättävä
            kosketus ei sulje. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            if (!pyyhkaisy.juuriPyyhkaisty()) onClose();
          }}
          className="absolute inset-0 cursor-default"
        />

        {kuva && (
          <Image
            key={kuva.src}
            src={kuva.src}
            alt={
              current.alt?.trim() ||
              current.caption?.trim() ||
              `${albumTitle ?? "Albumi"}, kuva ${index + 1}/${images.length}`
            }
            width={kuva.width}
            height={kuva.height}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            draggable={false}
            // Hallitseva väri näkyy kuvan paikalla, kunnes kuva on ladattu.
            style={{
              backgroundColor: current.vari ?? undefined,
              translate: pyyhkaisy.siirto ? `${pyyhkaisy.siirto}px 0` : undefined,
            }}
            className={`relative h-auto max-h-[78dvh] w-auto max-w-full select-none object-contain ${
              pyyhkaisy.vetaa ? "" : "transition-[translate] duration-200 ease-out"
            }`}
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={edellinen}
              aria-label="Edellinen kuva"
              className={`${navButtonClass} left-2 sm:left-6`}
            >
              <ChevronLeft aria-hidden size={26} />
            </button>
            <button
              type="button"
              onClick={seuraava}
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

/**
 * Vaakapyyhkäisy kosketusnäytöllä (Pointer Events, ei kirjastoa).
 *
 * - Suunta lukitaan ensimmäisen 8 px:n liikkeen perusteella. Pystyveto jää
 *   selaimelle (`touch-action: pan-y`), jolloin se ei vaihda kuvaa vahingossa.
 * - Vaakavedossa kuva seuraa sormea. Kun veto päättyy, vähintään
 *   `PYYHKAISY_KYNNYS` vaihtaa kuvan, muuten kuva palaa paikalleen.
 * - Hiirellä ei vedetä: tietokoneella on napit ja nuolinäppäimet.
 */
function usePyyhkaisy({
  kaytossa,
  vasemmalle,
  oikealle,
}: {
  kaytossa: boolean;
  /** Veto vasemmalle = seuraava kuva. */
  vasemmalle: () => void;
  /** Veto oikealle = edellinen kuva. */
  oikealle: () => void;
}) {
  const alku = useRef<{ x: number; y: number; id: number } | null>(null);
  const suunta = useRef<"vaaka" | "pysty" | null>(null);
  const pyyhkaistyHetki = useRef(0);
  const [siirto, setSiirto] = useState(0);
  const [vetaa, setVetaa] = useState(false);

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (!kaytossa || e.pointerType === "mouse" || !e.isPrimary) return;
    alku.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    suunta.current = null;
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const a = alku.current;
    if (!a || e.pointerId !== a.id) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    if (!suunta.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      suunta.current = Math.abs(dx) > Math.abs(dy) ? "vaaka" : "pysty";
      if (suunta.current === "vaaka") {
        e.currentTarget.setPointerCapture(e.pointerId);
        setVetaa(true);
      }
    }
    if (suunta.current === "vaaka") setSiirto(dx);
  }

  function lopeta(e: ReactPointerEvent<HTMLElement>, peruttu: boolean) {
    const a = alku.current;
    if (!a || e.pointerId !== a.id) return;
    alku.current = null;
    if (suunta.current === "vaaka") {
      pyyhkaistyHetki.current = e.timeStamp;
      const dx = e.clientX - a.x;
      if (!peruttu && Math.abs(dx) >= PYYHKAISY_KYNNYS) {
        if (dx < 0) vasemmalle();
        else oikealle();
      }
    }
    suunta.current = null;
    setVetaa(false);
    setSiirto(0);
  }

  return {
    /** Kuvan vaakasiirto pikseleinä vedon aikana. */
    siirto,
    /** Veto käynnissä: kuva seuraa sormea ilman siirtymäanimaatiota. */
    vetaa,
    /** Tuliko klikkaus pyyhkäisyn päätteeksi (ei tulkita taustaklikkaukseksi)? */
    juuriPyyhkaisty: () => performance.now() - pyyhkaistyHetki.current < 400,
    kasittelijat: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: ReactPointerEvent<HTMLElement>) => lopeta(e, false),
      onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => lopeta(e, true),
    },
  };
}
