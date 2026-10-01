import type { PelaajaSaavutus } from "@/sanity/lib/queries/arkisto-laajennus";

const RYHMAT = [
  { arvo: "seurajoukkueet", otsikko: "Seurajoukkueissa" },
  { arvo: "maajoukkue", otsikko: "Maajoukkueessa" },
  { arvo: "henkilokohtaiset", otsikko: "Henkilökohtaiset palkinnot" },
] as const;

/** Saavutukset ryhmittäin: nimi ja vuodet omilla riveillään, ei tekstipötkönä. */
export function Saavutukset({ saavutukset, otsikkoId }: { saavutukset: PelaajaSaavutus[]; otsikkoId: string }) {
  const ryhmat = RYHMAT.map((r) => ({
    ...r,
    rivit: saavutukset.filter((s) => (s.ryhma ?? "seurajoukkueet") === r.arvo && s.nimi?.trim()),
  })).filter((r) => r.rivit.length > 0);
  if (ryhmat.length === 0) return null;

  return (
    <section aria-labelledby={otsikkoId}>
      <h2 id={otsikkoId} className="font-display text-2xl text-foreground sm:text-3xl">
        Saavutukset
      </h2>
      <div className="mt-6 flex flex-col gap-8">
        {ryhmat.map((ryhma) => (
          <div key={ryhma.arvo}>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">{ryhma.otsikko}</h3>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {ryhma.rivit.map((s) => (
                <li key={s._key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="text-foreground">{s.nimi}</span>
                  {s.vuodet && <span className="text-sm tabular-nums text-muted sm:text-right">{s.vuodet}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
