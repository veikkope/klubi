import { FileText } from "lucide-react";

import { liitteenTiedot, tiedostonOsoite, type LiitteenTiedosto } from "@/lib/liite";

export type LiiteData = {
  otsikko?: string | null;
  /** GROQ `runko`: `tiedosto.asset->{ url, originalFilename, extension, size }`. */
  liitetiedosto?: LiitteenTiedosto | null;
};

/**
 * Tekstin liite (docs/24 askel 6, skeema sanity/schemas/objects/liite.ts):
 * linkki tiedostoon, jonka perässä tyyppi ja koko, esim. "Vuosikokouskutsu
 * 2027 (PDF, 240 kt)".
 *
 * Koko teksti on linkin sisällä, joten linkin nimi kertoo myös tiedoston
 * tyypin (WCAG 2.4.4). PDF avautuu selaimessa, Word ja Excel ladataan
 * alkuperäisellä nimellä (`tiedostonOsoite`). Ei `target`-attribuuttia eikä
 * `download`-attribuuttia (ristiorigin: selain ohittaisi sen).
 */
export function LiiteKortti({ otsikko, liitetiedosto }: LiiteData) {
  const href = tiedostonOsoite(liitetiedosto);
  if (!href) return null;
  const nimi = otsikko?.trim() || liitetiedosto?.originalFilename || "Liite";
  const tiedot = liitteenTiedot(liitetiedosto);

  return (
    <p className="mt-6">
      <a
        href={href}
        className="group inline-flex min-h-11 max-w-full items-center gap-3 rounded-lg border border-border-strong bg-surface px-4 py-3 text-foreground no-underline transition hover:border-accent"
      >
        <FileText aria-hidden className="size-5 shrink-0 text-accent" />
        <span className="min-w-0">
          <span className="font-semibold text-accent underline decoration-1 underline-offset-4 group-hover:decoration-2">
            {nimi}
          </span>
          {tiedot && <span className="text-sm text-muted"> ({tiedot})</span>}
        </span>
      </a>
    </p>
  );
}
