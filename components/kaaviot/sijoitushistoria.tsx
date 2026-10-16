import type { ReactNode } from "react";

import { StatTable, type StatColumn, type StatRow } from "@/components/ui/stat-table";
import { cn } from "@/lib/cn";
import {
  desimaali,
  kuukausiLyhyt,
  kuukausiPitka,
  tunnusluvut,
  valmentajakaudet,
  yhteenveto,
  type Piste,
} from "@/lib/sijoitushistoria";

import { SijoitusKaavio } from "./sijoituskaavio";

/**
 * Sijoitushistoria tilastotaulukon yläpuolella: tunnusluvut, kuvaaja ja
 * valmentajittainen yhteenveto. Kaikki lasketaan taulukon riveistä, joten
 * sihteerin ei tarvitse päivittää lukuja tekstiin (docs/decisions/002).
 */

function Tunnusluku({ otsikko, arvo, selite, children }: { otsikko: string; arvo: string; selite: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <dt className="text-sm text-muted">{otsikko}</dt>
      <dd className="mt-1">
        <span className="block text-3xl font-semibold leading-none text-heading sm:text-4xl">{arvo}</span>
        <span className="mt-2 block text-sm text-muted">{selite}</span>
        {children}
      </dd>
    </div>
  );
}

function Muutos({ nyt, ennen }: { nyt: Piste; ennen: Piste | null }) {
  if (!ennen) return null;
  const ero = ennen.sija - nyt.sija;
  const vertailu = `edellisestä listasta (${kuukausiLyhyt(ennen.kuukausi)})`;
  if (ero === 0) return <span className="mt-1 block text-sm text-muted">Ei muutosta {vertailu}</span>;
  const nousu = ero > 0;
  const maara = Math.abs(ero);
  return (
    <span className={cn("mt-1 block text-sm font-medium", nousu ? "text-success" : "text-danger")}>
      <span aria-hidden="true">{nousu ? "▲ " : "▼ "}</span>
      {nousu ? "Nousua" : "Laskua"} {maara} {maara === 1 ? "sija" : "sijaa"} {vertailu}
    </span>
  );
}

const KAUSI_SARAKKEET: StatColumn[] = [
  { key: "valmentaja", label: "Päävalmentaja", type: "text" },
  { key: "kausi", label: "Kausi rankingissa", type: "text" },
  { key: "listoja", label: "Listoja", type: "number" },
  { key: "keskiarvo", label: "Keskiarvo", type: "text" },
  { key: "paras", label: "Paras", type: "number" },
  { key: "heikoin", label: "Heikoin", type: "number" },
];

export function Sijoitushistoria({
  pisteet,
  nimi,
  otsikkotaso,
  className,
}: {
  pisteet: Piste[];
  /** Tilaston otsikko: kuvaajan ja taulukoiden nimi ruudunlukijalle. */
  nimi: string;
  /** Väliotsikon taso: yhtä syvemmällä kuin tilaston otsikko. */
  otsikkotaso: 2 | 3 | 4;
  className?: string;
}) {
  const luvut = tunnusluvut(pisteet);
  if (!luvut || pisteet.length < 2) return null;
  const kaudet = valmentajakaudet(pisteet);
  const Otsikko = `h${otsikkotaso}` as const;

  const kausiRivit: StatRow[] = [...kaudet].reverse().map((k) => ({
    cells: [
      { key: "valmentaja", value: k.valmentaja },
      { key: "kausi", value: k.alku === k.loppu ? kuukausiLyhyt(k.alku) : `${kuukausiLyhyt(k.alku)}–${kuukausiLyhyt(k.loppu)}` },
      { key: "listoja", value: String(k.listoja) },
      { key: "keskiarvo", value: desimaali(k.keskiarvo) },
      { key: "paras", value: String(k.paras) },
      { key: "heikoin", value: String(k.heikoin) },
    ],
  }));

  const valmentaja = (p: Piste) => (p.valmentaja ? ` · ${p.valmentaja}` : "");

  return (
    <div className={className}>
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tunnusluku otsikko="Sija nyt" arvo={String(luvut.nykyinen.sija)} selite={kuukausiPitka(luvut.nykyinen.kuukausi)}>
          <Muutos nyt={luvut.nykyinen} ennen={luvut.edellinen} />
        </Tunnusluku>
        <Tunnusluku
          otsikko="Paras sija"
          arvo={String(luvut.paras.sija)}
          selite={`${kuukausiPitka(luvut.paras.kuukausi)}${valmentaja(luvut.paras)}`}
        />
        <Tunnusluku
          otsikko="Heikoin sija"
          arvo={String(luvut.heikoin.sija)}
          selite={`${kuukausiPitka(luvut.heikoin.kuukausi)}${valmentaja(luvut.heikoin)}`}
        />
        <Tunnusluku
          otsikko="Keskiarvo"
          arvo={desimaali(luvut.keskiarvo)}
          selite={`${pisteet.length} listaa vuodesta ${pisteet[0].kuukausi.slice(0, 4)}`}
        />
      </dl>

      <figure className="mt-8">
        <SijoitusKaavio pisteet={pisteet} kaudet={kaudet} keskiarvo={luvut.keskiarvo} nimi={nimi} />
        <figcaption className="mt-3 text-sm text-muted">
          Pienempi sija on parempi, joten nousu kuvaajassa on nousua rankingissa. Taustan raidat ovat päävalmentajien
          kausia, ja katkoviiva on koko historian keskiarvo {desimaali(luvut.keskiarvo)}. <span className="sr-only">{yhteenveto(pisteet, nimi)}</span>
        </figcaption>
      </figure>

      {kaudet.length > 0 && (
        <section className="mt-10">
          <Otsikko className="font-display text-xl leading-tight text-foreground">Päävalmentajittain</Otsikko>
          <StatTable
            className="mt-4"
            caption={`${nimi} päävalmentajittain`}
            columns={KAUSI_SARAKKEET}
            rows={kausiRivit}
          />
        </section>
      )}
    </div>
  );
}
