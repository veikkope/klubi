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

/**
 * Seurahistoria pystysuorana aikajanana: pallo, vuodet ja seura samalla rivillä.
 *
 * Pallo ja viiva ovat omassa sarakkeessaan, joka venyy rivin korkuiseksi, joten
 * pallo on aina rivin pystykeskellä eikä pikselisiirtojen varassa. Jokainen rivi
 * piirtää oman viivanpätkänsä: ensimmäisellä viiva alkaa pallosta ja viimeisellä
 * päättyy palloon, joten viiva ei jatku janan ohi. Pallon ympärillä on sivun
 * taustan värinen rengas, joka erottaa sen viivasta.
 */
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
            className="group grid min-h-11 grid-cols-[0.75rem_6.5rem_minmax(0,1fr)] items-center gap-x-4"
          >
            <span aria-hidden className="relative flex h-full items-center justify-center self-stretch">
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong group-first:top-1/2 group-last:bottom-1/2" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background" />
            </span>
            <span className="text-sm leading-6 tabular-nums text-muted">{seuraVuodet(seura) ?? "—"}</span>
            <span className="py-2 leading-6 font-medium text-foreground">{seura.seura}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
