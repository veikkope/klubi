import type { PelaajaSeura } from "@/sanity/lib/queries/arkisto-laajennus";

/** Ura aikajärjestyksessä: ensimmäinen seura ensin, vuodettomat loppuun. */
export function jarjestaSeurat(seurat: PelaajaSeura[]): PelaajaSeura[] {
  return [...seurat].sort((a, b) => {
    const aStart = a.alkuvuosi ?? Number.POSITIVE_INFINITY;
    const bStart = b.alkuvuosi ?? Number.POSITIVE_INFINITY;
    return aStart - bStart || (a.loppuvuosi ?? aStart) - (b.loppuvuosi ?? bStart);
  });
}

/** "1992–1999", "2015–" tai "2015" riippuen siitä mitä vuosia on tiedossa. */
export function seuraVuodet(seura: PelaajaSeura): string | null {
  const { alkuvuosi, loppuvuosi } = seura;
  if (alkuvuosi != null && loppuvuosi != null) {
    return alkuvuosi === loppuvuosi ? `${alkuvuosi}` : `${alkuvuosi}–${loppuvuosi}`;
  }
  if (alkuvuosi != null) return `${alkuvuosi}–`;
  if (loppuvuosi != null) return `–${loppuvuosi}`;
  return null;
}

/** Seurahistoria pystysuorana aikajanana: vuodet vasemmalla, seura oikealla. */
export function UranAikajana({ seurat, otsikkoId }: { seurat: PelaajaSeura[]; otsikkoId: string }) {
  if (seurat.length === 0) return null;
  return (
    <section aria-labelledby={otsikkoId}>
      <h2 id={otsikkoId} className="font-display text-2xl text-foreground sm:text-3xl">
        Seurat
      </h2>
      <ol className="mt-6">
        {jarjestaSeurat(seurat).map((seura, index) => (
          <li
            key={seura._key ?? `${seura.seura}-${index}`}
            className="relative grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-l-2 border-border py-2.5 pl-5"
          >
            <span aria-hidden className="absolute -left-[7px] top-[1.15rem] h-3 w-3 rounded-full border-2 border-surface bg-accent" />
            <span className="text-sm tabular-nums text-muted">{seuraVuodet(seura) ?? "—"}</span>
            <span className="font-medium text-foreground">{seura.seura}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
