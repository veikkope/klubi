import { Card, CardArrow, CardEyebrow, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import {
  jaot,
  kuukausiLyhyt,
  kuukausiPitka,
  tunnusluvut,
  viimeisetVuodet,
  type Piste,
} from "@/lib/sijoitushistoria";

import { Muutos } from "./sijoitushistoria";

/**
 * FIFA-rankingin nosto muille sivuille (Huuhkajat, etusivun arkistolohko):
 * nykyinen sija, muutos edelliseen listaan ja pieni käyrä viimeisiltä
 * vuosilta. Lasketaan samasta taulukosta kuin FIFA-ranking-sivu, joten nosto
 * päivittyy, kun sihteeri lisää rivin (docs/decisions/002).
 *
 * Koko kortti on linkki FIFA-ranking-sivulle (Card: linkki otsikossa).
 * Käyrä on koriste (aria-hidden): samat luvut ovat tekstinä kortissa.
 */

const VUOTTA = 5;

/**
 * Pieni käyrä: viiva SVG:nä kiinteällä korkeudella (venyy leveyteen,
 * non-scaling-stroke pitää viivan 2 px:nä), vuodet ja päätepiste HTML:nä
 * prosenttikoordinaateilla, jotta teksti ei skaalaudu kuvan mukana.
 */
function Kayra({ pisteet }: { pisteet: Piste[] }) {
  const ensimmainen = pisteet[0];
  const viimeinen = pisteet[pisteet.length - 1];
  const sijat = pisteet.map((p) => p.sija);
  const ylin = Math.max(1, Math.min(...sijat) - 3);
  const alin = Math.max(...sijat) + 3;
  // Prosentit 0–100; oikealle jää tilaa päätepisteelle.
  const x = (i: number) => ((i - ensimmainen.indeksi) / Math.max(1, viimeinen.indeksi - ensimmainen.indeksi)) * 97;
  const y = (s: number) => ((s - ylin) / Math.max(1, alin - ylin)) * 100;
  const polku = pisteet.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.indeksi).toFixed(2)},${y(p.sija).toFixed(2)}`).join("");
  const vuodet = jaot(ensimmainen.indeksi / 12, viimeinen.indeksi / 12, 3).filter(
    (v) => v * 12 >= ensimmainen.indeksi && v * 12 <= viimeinen.indeksi,
  );

  return (
    <div aria-hidden="true">
      <div className="relative h-24 border-b border-border-strong">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path
            d={polku}
            fill="none"
            className="stroke-navy"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy ring-2 ring-surface"
          style={{ left: `${x(viimeinen.indeksi)}%`, top: `${y(viimeinen.sija)}%` }}
        />
      </div>
      <div className="relative mt-1 h-5 text-xs tabular-nums text-muted">
        {vuodet.map((v) => (
          <span key={v} className="absolute -translate-x-1/2" style={{ left: `${x(v * 12)}%` }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FifaNosto({
  pisteet,
  href = "/jalkapalloarkisto/fifa-ranking",
  otsikkotaso = "h2",
  className,
}: {
  pisteet: Piste[];
  href?: string;
  otsikkotaso?: "h2" | "h3";
  className?: string;
}) {
  const luvut = tunnusluvut(pisteet);
  const jakso = viimeisetVuodet(pisteet, VUOTTA);
  if (!luvut || jakso.length < 2) return null;
  const jaksonParas = Math.min(...jakso.map((p) => p.sija));
  const jaksonHeikoin = Math.max(...jakso.map((p) => p.sija));

  return (
    <Card href={href} className={cn("grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center", className)}>
      <div>
        <CardEyebrow>FIFA-ranking · {kuukausiPitka(luvut.nykyinen.kuukausi)}</CardEyebrow>
        <CardTitle as={otsikkotaso} className="mt-2">
          Huuhkajien FIFA-sijoitus
        </CardTitle>
        {/* Hero-luku: sans, ei display-fonttia (dataviz). */}
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-6xl font-semibold leading-none text-heading">{luvut.nykyinen.sija}.</span>
          <span className="text-lg text-muted">sija</span>
        </p>
        <Muutos nyt={luvut.nykyinen} ennen={luvut.edellinen} />
        <CardArrow label="Koko ranking ja historia" />
      </div>
      <div>
        <Kayra pisteet={jakso} />
        <p className="mt-2 text-sm text-muted">
          {VUOTTA} vuotta ({kuukausiLyhyt(jakso[0].kuukausi)}–{kuukausiLyhyt(luvut.nykyinen.kuukausi)}): paras sija{" "}
          {jaksonParas}, heikoin {jaksonHeikoin}. Pienempi sija on parempi.
        </p>
      </div>
    </Card>
  );
}
