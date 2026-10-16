"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/cn";
import {
  desimaali,
  jaot,
  kuukausiLyhyt,
  kuukausiPitka,
  type Kausi,
  type Piste,
} from "@/lib/sijoitushistoria";

/**
 * Sijoitushistorian viivakuvaaja (FIFA-ranking). Piirretään SVG:nä, joten
 * palvelin renderöi valmiin kuvaajan ilman JavaScriptiä; selaimessa se
 * mitoittuu säiliön leveyteen (tekstit pysyvät oikean kokoisina) ja saa
 * aikavälin rajauksen, osoittimen ja näppäimistöselauksen.
 *
 * Pystyakseli on käänteinen: pienempi sija on parempi ja näkyy ylempänä.
 * Taustan raidat ovat valmentajakausia. Data on myös taulukkona sivulla,
 * joten osoitin vain täydentää (docs/decisions/002).
 */

type Rajaus = "kaikki" | "10" | "5";

const RAJAUKSET: { value: Rajaus; label: string; vuotta: number | null }[] = [
  { value: "kaikki", label: "Kaikki", vuotta: null },
  { value: "10", label: "10 vuotta", vuotta: 10 },
  { value: "5", label: "5 vuotta", vuotta: 5 },
];

const OLETUSLEVEYS = 960;

interface Props {
  pisteet: Piste[];
  kaudet: Kausi[];
  keskiarvo: number;
  /** Ryhmän nimi ruudunlukijalle, esim. "Huuhkajien FIFA-ranking". */
  nimi: string;
}

/** Tekstin arvioitu leveys pikseleinä (11 px fontti). Riittää päättämään, mahtuuko nimi. */
function tekstinLeveys(teksti: string): number {
  return teksti.length * 6.4;
}

export function SijoitusKaavio({ pisteet, kaudet, keskiarvo, nimi }: Props) {
  const kehys = useRef<HTMLDivElement>(null);
  const [leveys, setLeveys] = useState(OLETUSLEVEYS);
  const [rajaus, setRajaus] = useState<Rajaus>("kaikki");
  const [aktiivinen, setAktiivinen] = useState<number | null>(null);
  const [ilmoitus, setIlmoitus] = useState("");
  const ohjeId = useId();

  useEffect(() => {
    const el = kehys.current;
    if (!el) return;
    const havaitsija = new ResizeObserver(([entry]) => {
      const uusi = Math.round(entry.contentRect.width);
      if (uusi > 0) setLeveys(uusi);
    });
    havaitsija.observe(el);
    return () => havaitsija.disconnect();
  }, []);

  const viimeinen = pisteet[pisteet.length - 1];
  const kuukausiaYhteensa = viimeinen.indeksi - pisteet[0].indeksi + 1;
  const tarjolla = RAJAUKSET.filter((r) => r.vuotta === null || r.vuotta * 12 < kuukausiaYhteensa);

  const nakyvat = useMemo(() => {
    const vuotta = RAJAUKSET.find((r) => r.value === rajaus)?.vuotta;
    if (!vuotta) return pisteet;
    const raja = viimeinen.indeksi - vuotta * 12 + 1;
    return pisteet.filter((p) => p.indeksi >= raja);
  }, [pisteet, rajaus, viimeinen.indeksi]);

  const kapea = leveys < 640;
  const korkeus = kapea ? 300 : 400;
  const reuna = { ylä: 30, oikea: kapea ? 34 : 44, ala: 30, vasen: 36 };
  const piirtoLeveys = Math.max(1, leveys - reuna.vasen - reuna.oikea);
  const piirtoKorkeus = korkeus - reuna.ylä - reuna.ala;

  const ensimmainen = nakyvat[0];
  const xVali = Math.max(1, viimeinen.indeksi - ensimmainen.indeksi);
  const x = (indeksi: number) => reuna.vasen + ((indeksi - ensimmainen.indeksi) / xVali) * piirtoLeveys;

  const sijat = nakyvat.map((p) => p.sija);
  const ylin = Math.max(1, Math.floor((Math.min(...sijat, keskiarvo) - 4) / 10) * 10);
  const alin = Math.ceil((Math.max(...sijat, keskiarvo) + 4) / 10) * 10;
  const y = (sija: number) => reuna.ylä + ((sija - ylin) / Math.max(1, alin - ylin)) * piirtoKorkeus;

  const yJaot = jaot(ylin, alin, piirtoKorkeus / 40);

  // Vuosijaot tammikuuhun: tiheys sen mukaan, montako vuosilukua mahtuu.
  const vuosia = xVali / 12;
  const vuosiAskel = [1, 2, 5, 10].find((a) => (piirtoLeveys / Math.max(1, vuosia)) * a >= 52) ?? 10;
  const ensimmainenVuosi = Math.floor(ensimmainen.indeksi / 12);
  const xJaot: number[] = [];
  for (let v = Math.ceil(ensimmainenVuosi / vuosiAskel) * vuosiAskel; v * 12 <= viimeinen.indeksi; v += vuosiAskel) {
    if (v * 12 >= ensimmainen.indeksi) xJaot.push(v);
  }

  // Valmentajakaudet näkyvälle välille: raita alkaa kauden ensimmäisestä
  // listasta ja päättyy seuraavan kauden ensimmäiseen (vaihtokuukausi on raja).
  const raidat = kaudet
    .map((kausi, i) => {
      const alku = pisteet[kausi.ensimmainen].indeksi;
      const seuraava = kaudet[i + 1];
      const loppu = seuraava ? pisteet[seuraava.ensimmainen].indeksi : viimeinen.indeksi;
      return { kausi, i, alku: Math.max(alku, ensimmainen.indeksi), loppu };
    })
    // Rajattuna alkuun jäävät vain kaudet, jotka ulottuvat näkyvälle välille.
    // Raidan väri seuraa kauden järjestystä koko historiassa, ei rajausta.
    .filter((r) => r.loppu >= ensimmainen.indeksi)
    .map((r) => ({ ...r, x0: x(r.alku), x1: x(Math.max(r.loppu, r.alku)) }));

  const polku = nakyvat
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.indeksi).toFixed(1)},${y(p.sija).toFixed(1)}`)
    .join("");

  // Näkyvän välin paras ja heikoin (aikaisin, jos sama sija toistuu).
  const paras = nakyvat.reduce((a, p) => (p.sija < a.sija ? p : a), nakyvat[0]);
  const heikoin = nakyvat.reduce((a, p) => (p.sija > a.sija ? p : a), nakyvat[0]);

  const valittu = aktiivinen !== null ? nakyvat[Math.min(aktiivinen, nakyvat.length - 1)] : null;

  function lahin(clientX: number): number {
    const el = kehys.current;
    if (!el) return nakyvat.length - 1;
    const rx = clientX - el.getBoundingClientRect().left;
    const indeksi = ensimmainen.indeksi + ((rx - reuna.vasen) / piirtoLeveys) * xVali;
    let paras = 0;
    for (let i = 1; i < nakyvat.length; i += 1) {
      if (Math.abs(nakyvat[i].indeksi - indeksi) < Math.abs(nakyvat[paras].indeksi - indeksi)) paras = i;
    }
    return paras;
  }

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    setAktiivinen(lahin(event.clientX));
  }

  function siirry(uusi: number) {
    const i = Math.max(0, Math.min(nakyvat.length - 1, uusi));
    setAktiivinen(i);
    const p = nakyvat[i];
    setIlmoitus(`${kuukausiPitka(p.kuukausi)}: sija ${p.sija}${p.valmentaja ? `, valmentaja ${p.valmentaja}` : ""}.`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nyt = aktiivinen ?? nakyvat.length - 1;
    // Vuosi kalenterissa, ei 12 riviä: FIFA jätti joitain kuukausia väliin.
    const vuodenPaasta = (suunta: 1 | -1) => {
      const kohde = nakyvat[nyt].indeksi + 12 * suunta;
      const i = nakyvat.findIndex((p) => p.indeksi >= kohde);
      if (suunta === 1) return i === -1 ? nakyvat.length - 1 : i;
      return i === -1 ? nyt : nakyvat[i].indeksi > kohde ? Math.max(0, i - 1) : i;
    };
    const askeleet: Record<string, number> = {
      ArrowLeft: nyt - 1,
      ArrowRight: nyt + 1,
      PageDown: vuodenPaasta(-1),
      PageUp: vuodenPaasta(1),
      Home: 0,
      End: nakyvat.length - 1,
    };
    if (!(event.key in askeleet)) return;
    event.preventDefault();
    siirry(askeleet[event.key]);
  }

  function valitseRajaus(uusi: Rajaus) {
    setRajaus(uusi);
    setAktiivinen(null);
  }

  const merkinta = (p: Piste, teksti: string, ylapuolelle: boolean) => {
    const px = x(p.indeksi);
    const py = y(p.sija);
    const loppuun = px > leveys - reuna.oikea - 110;
    return (
      <g key={`${teksti}-${p.kuukausi}`}>
        <circle cx={px} cy={py} r={4} className="fill-navy stroke-surface" strokeWidth={2} />
        <text
          x={loppuun ? px - 8 : px + 8}
          y={ylapuolelle ? py - 8 : py + 16}
          textAnchor={loppuun ? "end" : "start"}
          className="fill-foreground stroke-surface text-[12px] font-medium [paint-order:stroke]"
          strokeWidth={4}
          strokeLinejoin="round"
        >
          {teksti}
        </text>
      </g>
    );
  };

  return (
    <div>
      {tarjolla.length > 1 && (
        <div role="group" aria-label="Kuvaajan aikaväli" className="mb-3 flex flex-wrap gap-2">
          {tarjolla.map((r) => (
            <button
              key={r.value}
              type="button"
              aria-pressed={rajaus === r.value}
              onClick={() => valitseRajaus(r.value)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                rajaus === r.value
                  ? "border-navy bg-navy text-on-chrome"
                  : "border-border-strong bg-surface text-foreground hover:bg-surface-strong",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={kehys}
        tabIndex={0}
        role="group"
        aria-label={`${nimi}, kuvaaja`}
        aria-describedby={ohjeId}
        onKeyDown={onKeyDown}
        onBlur={() => setAktiivinen(null)}
        className="relative rounded-2xl border border-border bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <p id={ohjeId} className="sr-only">
          Selaa kuukausia nuolinäppäimillä vasemmalle ja oikealle, vuoden kerrallaan Page Up ja Page Down, alkuun ja
          loppuun Home ja End. Samat tiedot ovat taulukkona kuvaajan alla.
        </p>
        <svg
          width={leveys}
          height={korkeus}
          viewBox={`0 0 ${leveys} ${korkeus}`}
          aria-hidden="true"
          className="block h-auto w-full max-w-full touch-pan-y select-none"
        >
          {/* Valmentajakaudet: vuorottelevat raidat ja nimi, jos se mahtuu. */}
          {raidat.map(({ kausi, i, x0, x1 }) => {
            const nimiMahtuu = x1 - x0 >= tekstinLeveys(kausi.valmentaja) + 8;
            return (
              <g key={`${kausi.valmentaja}-${kausi.alku}`}>
                {i % 2 === 1 && (
                  <rect x={x0} y={reuna.ylä} width={Math.max(0, x1 - x0)} height={piirtoKorkeus} className="fill-surface-strong" />
                )}
                {nimiMahtuu && (
                  <text x={(x0 + x1) / 2} y={reuna.ylä - 10} textAnchor="middle" className="fill-muted-soft text-[11px]">
                    {kausi.valmentaja}
                  </text>
                )}
              </g>
            );
          })}

          {/* Pystyakseli: sijat, ruudukko hiusviivoin. */}
          {yJaot.map((s) => (
            <g key={`y${s}`}>
              <line x1={reuna.vasen} x2={leveys - reuna.oikea} y1={y(s)} y2={y(s)} className="stroke-border-strong" strokeWidth={1} opacity={0.6} />
              <text x={reuna.vasen - 8} y={y(s) + 4} textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                {s}
              </text>
            </g>
          ))}

          {/* Vaaka-akseli: vuodet. */}
          {xJaot.map((v) => (
            <text key={`x${v}`} x={x(v * 12)} y={korkeus - 10} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">
              {v}
            </text>
          ))}

          {/* Keskiarvo koko historiasta. */}
          <line
            x1={reuna.vasen}
            x2={leveys - reuna.oikea}
            y1={y(keskiarvo)}
            y2={y(keskiarvo)}
            className="stroke-brass"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          {/* Nimi oikeaan reunaan: alussa viiva kulkee usein keskiarvon kohdalla.
              Kapealla nimi peittäisi viivan, joten sen kertoo kuvateksti. */}
          {!kapea && (
            <text
              x={leveys - reuna.oikea - 6}
              y={y(keskiarvo) - 6}
              textAnchor="end"
              strokeWidth={4}
              strokeLinejoin="round"
              className="fill-brass-text stroke-surface text-[11px] font-medium [paint-order:stroke]"
            >
              Keskiarvo {desimaali(keskiarvo)}
            </text>
          )}

          <path d={polku} fill="none" className="stroke-navy" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Paras on ylhäällä, joten nimi sen yläpuolelle; heikoin alhaalla, nimi alle. */}
          {merkinta(paras, `Paras ${paras.sija} (${kuukausiLyhyt(paras.kuukausi)})`, true)}
          {heikoin !== paras && merkinta(heikoin, `Heikoin ${heikoin.sija} (${kuukausiLyhyt(heikoin.kuukausi)})`, false)}

          {/* Uusin lista: arvo viivan päässä. */}
          <circle cx={x(viimeinen.indeksi)} cy={y(viimeinen.sija)} r={4} className="fill-navy stroke-surface" strokeWidth={2} />
          <text
            x={x(viimeinen.indeksi) + 8}
            y={y(viimeinen.sija) + 4}
            className="fill-foreground text-[13px] font-semibold tabular-nums"
          >
            {viimeinen.sija}
          </text>

          {valittu && (
            <g pointerEvents="none">
              <line
                x1={x(valittu.indeksi)}
                x2={x(valittu.indeksi)}
                y1={reuna.ylä}
                y2={reuna.ylä + piirtoKorkeus}
                className="stroke-muted"
                strokeWidth={1}
              />
              <circle cx={x(valittu.indeksi)} cy={y(valittu.sija)} r={5} className="fill-navy stroke-surface" strokeWidth={2} />
            </g>
          )}

          {/* Osoittimen alue: koko piirtoalue, lähin kuukausi valitaan. */}
          <rect
            x={reuna.vasen}
            y={reuna.ylä}
            width={piirtoLeveys}
            height={piirtoKorkeus}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerDown={onPointerMove}
            // Kosketuksessa pointerleave tulee heti napautuksen jälkeen: tieto jää näkyviin.
            onPointerLeave={(event) => {
              if (event.pointerType !== "touch") setAktiivinen(null);
            }}
          />
        </svg>

        {valittu && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-[var(--shadow-panel)]"
            style={
              x(valittu.indeksi) > leveys / 2
                ? { right: leveys - x(valittu.indeksi) + 12 }
                : { left: x(valittu.indeksi) + 12 }
            }
          >
            <p className="font-semibold text-foreground tabular-nums">Sija {valittu.sija}</p>
            <p className="text-muted">{kuukausiPitka(valittu.kuukausi)}</p>
            {valittu.valmentaja && <p className="text-muted">{valittu.valmentaja}</p>}
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {ilmoitus}
        </p>
      </div>
    </div>
  );
}
