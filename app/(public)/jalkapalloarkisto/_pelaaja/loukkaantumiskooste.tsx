import type { LoukkaantumisYhteenveto } from "@/lib/loukkaantumiset";

import { Avainluvut } from "./avainluvut";

/**
 * Loukkaantumistaulukon yhteenveto taulukon yläpuolelle (docs/20): tunnusluvut,
 * vammat vuosittain pylväinä ja vammat kehonosittain. Tarkka data on taulukossa
 * heti alla, joten kaavio on visuaalinen tiivistelmä eikä ainoa tiedon lähde.
 */
export function Loukkaantumiskooste({ yhteenveto }: { yhteenveto: LoukkaantumisYhteenveto }) {
  const { maara, ensimmainenVuosi, viimeisinVuosi, vuosittain, ryhmittain, pahimmatVuodet, pahinMaara } = yhteenveto;
  const yleisin = ryhmittain[0];

  return (
    <div className="flex flex-col gap-12">
      <Avainluvut
        luvut={[
          { arvo: String(maara), selite: "kirjattua vammaa tai sairautta" },
          { arvo: `${ensimmainenVuosi}–${viimeisinVuosi}`, selite: "vuosina" },
          ...(yleisin ? [{ arvo: String(yleisin.maara), selite: `yleisin: ${yleisin.nimi.toLowerCase()}` }] : []),
          {
            arvo: String(pahinMaara),
            selite: `eniten vuonna ${pahimmatVuodet.join(", ")}`,
          },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <VuosiKaavio vuosittain={vuosittain} pahinMaara={pahinMaara} />
        <Ryhmat ryhmittain={ryhmittain} />
      </div>
    </div>
  );
}

/**
 * Akselin vuosiotsikot: ensimmäinen, viimeinen ja tasaviisivuotiset. Reunojen
 * lähellä olevat tasavuodet jätetään pois, etteivät otsikot osu päällekkäin
 * kapealla näytöllä (1987 ja 1990).
 */
function naytaVuosi(vuosi: number, i: number, n: number): boolean {
  return i === 0 || i === n - 1 || (vuosi % 5 === 0 && i >= 5 && i <= n - 6);
}

function VuosiKaavio({ vuosittain, pahinMaara }: { vuosittain: { vuosi: number; maara: number }[]; pahinMaara: number }) {
  const otsikkoId = "loukkaantumiset-vuosittain";
  const kuvaus =
    "Pylväskaavio loukkaantumisista vuosittain. " +
    vuosittain
      .filter((v) => v.maara > 0)
      .map((v) => `${v.vuosi}: ${v.maara}`)
      .join(", ") +
    ".";

  return (
    <section aria-labelledby={otsikkoId}>
      <h2 id={otsikkoId} className="font-display text-xl text-heading sm:text-2xl">
        Vammat vuosittain
      </h2>
      <div role="img" aria-label={kuvaus} className="mt-6">
        <div className="relative flex h-48 items-end gap-[2px] border-b border-border-strong">
          {/* Kevyt apuviiva suurimman arvon kohdalla. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <span aria-hidden className="absolute -top-2.5 right-0 bg-background pl-1 text-xs tabular-nums text-muted">
            {pahinMaara}
          </span>
          {vuosittain.map((v) => (
            <div key={v.vuosi} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
              {v.maara > 0 && (
                <div
                  className="w-full max-w-5 rounded-t-[4px] bg-accent transition-colors group-hover:bg-accent-hover"
                  style={{ height: `${(v.maara / pahinMaara) * 100}%` }}
                />
              )}
              {/* Hover-arvo: tarkka luku ja vuosi. */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-sm bg-heading px-2 py-1 text-xs tabular-nums text-background group-hover:block"
              >
                {v.vuosi}: {v.maara}
              </span>
            </div>
          ))}
        </div>
        <div aria-hidden className="mt-2 flex gap-[2px]">
          {vuosittain.map((v, i) => (
            <div key={v.vuosi} className="relative h-4 min-w-0 flex-1">
              {naytaVuosi(v.vuosi, i, vuosittain.length) && (
                <span className="absolute left-1/2 -translate-x-1/2 text-xs tabular-nums text-muted">{v.vuosi}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ryhmat({ ryhmittain }: { ryhmittain: { nimi: string; maara: number }[] }) {
  const suurin = Math.max(...ryhmittain.map((r) => r.maara));
  return (
    <section aria-labelledby="loukkaantumiset-ryhmittain">
      <h2 id="loukkaantumiset-ryhmittain" className="font-display text-xl text-heading sm:text-2xl">
        Vammat kehonosittain
      </h2>
      <ul className="mt-6 flex flex-col gap-3">
        {ryhmittain.map((r) => (
          <li key={r.nimi} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
            <span className="text-foreground">{r.nimi}</span>
            <span aria-hidden className="h-2.5 rounded-r-[4px] bg-accent" style={{ width: `${(r.maara / suurin) * 100}%` }} />
            <span className="text-right tabular-nums text-muted">{r.maara}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
