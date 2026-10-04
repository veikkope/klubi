"use client";

import { useEffect, useRef, useState } from "react";
import {
  esikatselukuva,
  katseluOsoite,
  tulkitseYoutube,
  upotusOsoite,
} from "@/lib/youtube";

export type YoutubeVideoData = {
  url?: string;
  otsikko?: string;
  kuvateksti?: string;
};

/**
 * YouTube-video "julkisivuna": ensin esikatselukuva ja toistopainike,
 * YouTuben soitin (~1 Mt skriptejä, evästeet) vasta painalluksesta.
 * Ilman JavaScriptiä painike on tavallinen linkki videoon YouTubessa.
 */
export function YoutubeVideo({ value }: { value: YoutubeVideoData }) {
  const [toistetaan, setToistetaan] = useState(false);
  const soitin = useRef<HTMLIFrameElement>(null);
  const video = tulkitseYoutube(value?.url);

  // Painike korvautuu soittimella: fokus soittimeen, ettei näppäimistön
  // käyttäjä putoa sivun alkuun.
  useEffect(() => {
    if (toistetaan) soitin.current?.focus();
  }, [toistetaan]);

  if (!video) return null;
  const otsikko = value.otsikko?.trim() || "YouTube-video";

  return (
    <figure className="mt-8">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-navy">
        {toistetaan ? (
          <iframe
            ref={soitin}
            src={upotusOsoite(video)}
            title={otsikko}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <a
            href={katseluOsoite(video)}
            onClick={(e) => {
              // Uusi välilehti tai muokkausnäppäimet: annetaan selaimen hoitaa.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              setToistetaan(true);
            }}
            className="group absolute inset-0 block focus-visible:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- YouTuben kuva, ei Sanityn CDN:ssä (lib/sanity-image-loader.ts) */}
            <img
              src={esikatselukuva(video.id)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4 sm:p-6">
              <span
                aria-hidden
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-lg transition-transform group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-white/70 sm:size-16"
              >
                <svg viewBox="0 0 24 24" className="ml-1 size-6 sm:size-7" fill="currentColor">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.24-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
              <span className="min-w-0 pb-1 text-left">
                <span className="sr-only">Toista video: </span>
                <span className="line-clamp-2 font-display text-lg leading-snug text-white sm:text-xl">
                  {otsikko}
                </span>
                <span className="mt-0.5 block text-sm text-white/80">YouTube</span>
              </span>
            </span>
          </a>
        )}
      </div>
      {value.kuvateksti && (
        <figcaption className="mt-2 text-sm text-muted">{value.kuvateksti}</figcaption>
      )}
    </figure>
  );
}
