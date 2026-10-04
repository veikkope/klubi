"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

import { Nuoli } from "@/components/ui/nuoli";
import { cn } from "@/lib/cn";
import { normalizeSearch } from "@/lib/haku";

/**
 * Odottavien ravintoloiden haku ja kaupunkivalinta (puhelinta varten).
 *
 * Kaupunkeja on kymmeniä, joten vaakasuunnassa vieritettävä painikerivi olisi
 * hidas: kaupunkiin pääsee kolmella tavalla, joista nopein toimii aina.
 * 1. Hakukenttä ehdottaa kaupunkeja kirjoitettaessa ("kuo" → Kuopio). Haku
 *    rajaa samalla ravintoloita nimen, kaupungin, maan tai arvioijan mukaan.
 * 2. Eniten odottavat kaupungit ovat painikkeina (mahtuvat ilman vieritystä).
 * 3. "Kaupunki" avaa alhaalta nousevan paneelin: kaikki kaupungit
 *    aakkosjärjestyksessä (Suomi, sitten ulkomaat) omalla haullaan.
 *
 * Haku ja kaupunkivalinta pysyvät näkyvissä sivuston yläpalkin alla.
 * Valinta on osoitteessa (?kaupunki=…&q=…): sen voi jakaa, ja paluu
 * arvostelusta palauttaa saman näkymän. Ilman JavaScriptiä haku on GET-lomake
 * ja kaupungit linkkilistana, ja palvelin piirtää rajatun näkymän (sama
 * komponentti, alkutila osoitteesta). Kortit piirretään palvelimella (`kortti`).
 */

export type OdottavaKaupunki = {
  avain: string;
  /** Kaupungin nimi ("Tallinna"). */
  nimi: string;
  /** Maa; null tai "Suomi" = kotimaa. */
  maa: string | null;
  /** Hakemiston kaupunkisivu, jos kaupungissa on jo julkaistuja ravintoloita. */
  slug: string | null;
  julkisia: number;
  ravintolat: { id: string; /** Normalisoitu hakuteksti. */ haku: string; kortti: ReactNode }[];
};

/** Painikkeina näytettävät kaupungit (eniten odottavia); loput paneelista. */
const SUOSITUIMMAT = 3;
/** Haun kaupunkiehdotukset. */
const EHDOTUKSIA = 3;

const ulkomaa = (k: OdottavaKaupunki) => Boolean(k.maa && k.maa !== "Suomi");
const nayttonimi = (k: OdottavaKaupunki) => (ulkomaa(k) ? `${k.nimi}, ${k.maa}` : k.nimi);

function osoite(polku: string, kaupunki: string | null, q: string): string {
  const p = new URLSearchParams();
  if (kaupunki) p.set("kaupunki", kaupunki);
  if (q.trim()) p.set("q", q.trim());
  const qs = p.toString();
  return qs ? `${polku}?${qs}` : polku;
}

/** Kaikki sanat löytyvät tekstistä (normalisoituna). */
const osuu = (teksti: string, sanat: string[]) => sanat.every((s) => teksti.includes(s));
const sanoiksi = (haku: string) => normalizeSearch(haku).split(" ").filter(Boolean);

export function OdottavatHaku({
  polku,
  kaupungit,
  alkuKaupunki,
  alkuHaku,
}: {
  polku: string;
  kaupungit: OdottavaKaupunki[];
  alkuKaupunki: string | null;
  alkuHaku: string;
}) {
  const [kaupunki, setKaupunki] = useState(
    alkuKaupunki && kaupungit.some((k) => k.avain === alkuKaupunki) ? alkuKaupunki : null,
  );
  const [haku, setHaku] = useState(alkuHaku);
  const [paneeliAuki, setPaneeliAuki] = useState(false);
  const hakuRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const kaupunkiNappiRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const hakuteksti = useMemo(
    () => new Map(kaupungit.map((k) => [k.avain, normalizeSearch(`${k.nimi} ${k.maa ?? ""}`)])),
    [kaupungit],
  );
  const suosituimmat = useMemo(
    () =>
      [...kaupungit]
        .sort((a, b) => b.ravintolat.length - a.ravintolat.length || a.nimi.localeCompare(b.nimi, "fi"))
        .slice(0, SUOSITUIMMAT),
    [kaupungit],
  );
  const yhteensa = kaupungit.reduce((n, k) => n + k.ravintolat.length, 0);
  const valittu = kaupungit.find((k) => k.avain === kaupunki) ?? null;
  const valittuPainikkeena = Boolean(valittu && suosituimmat.includes(valittu));

  const sanat = sanoiksi(haku);
  const naytettavat = kaupungit
    .filter((k) => !kaupunki || k.avain === kaupunki)
    .map((k) => ({ ...k, ravintolat: k.ravintolat.filter((r) => osuu(r.haku, sanat)) }))
    .filter((k) => k.ravintolat.length > 0);
  const osumia = naytettavat.reduce((n, k) => n + k.ravintolat.length, 0);
  const rajattu = Boolean(kaupunki || sanat.length);

  // Kaupunkiehdotukset hakukentän alle (ei jo valittua).
  const ehdotukset =
    normalizeSearch(haku).length >= 2
      ? kaupungit
          .filter((k) => k.avain !== kaupunki && osuu(hakuteksti.get(k.avain) ?? "", sanat))
          .sort((a, b) => {
            // Alusta osuva ensin ("lah" → Lahti ennen Kangaslahtea), sitten eniten odottavia.
            const q = normalizeSearch(haku);
            const alku = (k: OdottavaKaupunki) => ((hakuteksti.get(k.avain) ?? "").startsWith(q) ? 0 : 1);
            return alku(a) - alku(b) || b.ravintolat.length - a.ravintolat.length;
          })
          .slice(0, EHDOTUKSIA)
      : [];

  // Osoite ajan tasalle (ei uutta historiamerkintää jokaisesta näppäilystä).
  useEffect(() => {
    const uusi = osoite(polku, kaupunki, haku);
    if (uusi !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", uusi);
    }
  }, [polku, kaupunki, haku]);

  function valitse(avain: string | null) {
    setKaupunki(avain);
    // Lista alkuun, jos käyttäjä oli vierittänyt sen ohi.
    const lista = listaRef.current;
    if (lista && lista.getBoundingClientRect().top < 0) {
      lista.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }

  function valitseEhdotus(avain: string) {
    // Kaupunki valittu: haku tyhjäksi (se oli kaupungin nimi) ja näppäimistö kiinni.
    setHaku("");
    valitse(avain);
    hakuRef.current?.blur();
  }

  const tyhjenna = () => {
    setHaku("");
    setKaupunki(null);
    hakuRef.current?.focus();
  };

  const siruLuokka = (paalla: boolean) =>
    cn(
      "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[15px] font-medium whitespace-nowrap transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      paalla
        ? "border-primary bg-primary text-on-primary"
        : "border-border-strong bg-surface text-foreground hover:border-accent active:bg-surface-strong",
    );

  const siru = (avain: string | null, nimi: string, maara: number) => {
    const paalla = kaupunki === avain;
    return (
      <Link
        key={avain ?? "kaikki"}
        href={osoite(polku, avain, haku)}
        scroll={false}
        replace
        aria-current={paalla ? "true" : undefined}
        onClick={(e) => {
          // Ilman JavaScriptiä linkki lataa rajatun sivun; muuten rajataan heti.
          e.preventDefault();
          valitse(avain);
        }}
        className={siruLuokka(paalla)}
      >
        {nimi}
        <span className={cn("text-sm tabular-nums", paalla ? "text-on-primary/80" : "text-muted-soft")}>{maara}</span>
      </Link>
    );
  };

  return (
    <div className="mt-8">
      {/* Haku ja kaupungit pysyvät näkyvissä sivuston yläpalkin alla. */}
      <div className="sticky top-[var(--header-korkeus)] z-30 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:mx-0 sm:px-0">
        <form
          role="search"
          action={polku}
          method="get"
          onSubmit={(e) => {
            // Haku rajaa jo kirjoitettaessa. Enter valitsee ainoan kaupunkiehdotuksen
            // tai sulkee puhelimen näppäimistön.
            e.preventDefault();
            if (ehdotukset.length === 1 && osumia === 0) valitseEhdotus(ehdotukset[0].avain);
            else hakuRef.current?.blur();
          }}
        >
          {kaupunki && <input type="hidden" name="kaupunki" value={kaupunki} />}
          <div className="relative">
            <label htmlFor={`${id}-haku`} className="sr-only">
              Hae ravintolaa nimellä, kaupungilla tai arvioijalla
            </label>
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-soft"
            >
              <path
                fill="currentColor"
                d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              />
            </svg>
            <input
              ref={hakuRef}
              id={`${id}-haku`}
              name="q"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={haku}
              onChange={(e) => setHaku(e.target.value)}
              placeholder="Hae nimellä tai kaupungilla"
              aria-describedby={`${id}-tulos`}
              className="h-12 w-full rounded-sm border border-border-input bg-surface pl-11 pr-12 text-base text-foreground placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {haku && (
              <button
                type="button"
                onClick={() => {
                  setHaku("");
                  hakuRef.current?.focus();
                }}
                aria-label="Tyhjennä haku"
                className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RastiKuvake />
              </button>
            )}
          </div>
        </form>

        {ehdotukset.length > 0 && (
          <ul aria-label="Kaupungit" className="mt-2 overflow-hidden rounded-sm border border-border bg-surface">
            {ehdotukset.map((k) => (
              <li key={k.avain} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => valitseEhdotus(k.avain)}
                  className="flex min-h-12 w-full items-center gap-3 px-4 text-left transition hover:bg-background active:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <PaikkaKuvake className="text-brass-text" />
                  <span className="min-w-0 flex-1 truncate text-[15px]">
                    <span className="font-semibold text-foreground">{k.nimi}</span>
                    {ulkomaa(k) && <span className="text-muted">, {k.maa}</span>}
                    <span className="sr-only">: näytä kaupungin odottavat</span>
                  </span>
                  <span className="text-sm tabular-nums text-muted-soft">{k.ravintolat.length}</span>
                  <span aria-hidden className="text-xl text-muted-soft">›</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <nav aria-label="Kaupunki" className="mt-3 flex flex-wrap gap-1.5">
          {siru(null, "Kaikki", yhteensa)}
          {/* Painikkeessa pelkkä kaupunki (lyhyt); maa näkyy listassa ja otsikossa. */}
          {suosituimmat.map((k) => siru(k.avain, k.nimi, k.ravintolat.length))}
          <button
            ref={kaupunkiNappiRef}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setPaneeliAuki(true)}
            className={siruLuokka(Boolean(valittu && !valittuPainikkeena))}
          >
            <PaikkaKuvake />
            {valittu && !valittuPainikkeena ? (
              <>
                {valittu.nimi}
                <span className="sr-only">, vaihda kaupunki</span>
              </>
            ) : (
              <>
                Kaupunki<span className="sr-only">: kaikki {kaupungit.length} kaupunkia</span>
              </>
            )}
            <svg aria-hidden viewBox="0 0 20 20" className="-mr-1 size-4">
              <path
                fill="currentColor"
                d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z"
              />
            </svg>
          </button>
        </nav>

        {/* Ilman JavaScriptiä paneeli ei aukea: kaikki kaupungit linkkeinä. */}
        <noscript>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
            {kaupungit.map((k) => (
              <li key={k.avain}>
                <a href={osoite(polku, k.avain, "")} className="text-accent underline underline-offset-4">
                  {nayttonimi(k)} ({k.ravintolat.length})
                </a>
              </li>
            ))}
          </ul>
        </noscript>
      </div>

      <KaupunkiPaneeli
        auki={paneeliAuki}
        onSulje={() => {
          setPaneeliAuki(false);
          kaupunkiNappiRef.current?.focus();
        }}
        kaupungit={kaupungit}
        hakuteksti={hakuteksti}
        valittu={kaupunki}
        yhteensa={yhteensa}
        onValitse={(avain) => {
          setPaneeliAuki(false);
          valitse(avain);
        }}
      />

      <div ref={listaRef} className="scroll-mt-[calc(var(--header-korkeus)+8rem)]">
        <p id={`${id}-tulos`} aria-live="polite" className="mt-4 text-sm text-muted">
          {rajattu
            ? osumia > 0
              ? `${osumia} ${osumia === 1 ? "ravintola" : "ravintolaa"}${naytettavat.length > 1 ? ` ${naytettavat.length} kaupungissa` : ""}`
              : "Ei osumia."
            : `${yhteensa} ravintolaa ${kaupungit.length} kaupungissa`}
        </p>

        {osumia === 0 && (
          <div className="mt-4 rounded-sm bg-surface p-6">
            <p className="text-muted">
              {ehdotukset.length > 0
                ? "Ravintolan nimellä ei löytynyt odottavia. Valitse kaupunki yllä olevasta listasta."
                : "Hakuasi vastaavia odottavia ravintoloita ei löytynyt. Tarkista kirjoitusasu tai katso kaikki."}
            </p>
            <button
              type="button"
              onClick={tyhjenna}
              className="mt-4 inline-flex min-h-11 items-center rounded-sm border border-border-strong bg-background px-5 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Näytä kaikki
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-10">
          {naytettavat.map((k) => (
            <section key={k.avain} aria-labelledby={`kaupunki-${k.avain}`} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-2">
                <h2 id={`kaupunki-${k.avain}`} className="text-2xl">
                  {nayttonimi(k)} <span className="text-lg font-normal text-muted-soft">({k.ravintolat.length})</span>
                </h2>
                {k.slug && k.julkisia > 0 && (
                  <Link
                    href={`/ravintolat?kaupunki=${encodeURIComponent(k.slug)}`}
                    className="group/linkki text-[15px] font-semibold text-accent underline decoration-1 underline-offset-[4px] hover:decoration-2"
                  >
                    Klubin arvioimat ({k.julkisia})&nbsp;<Nuoli />
                  </Link>
                )}
              </div>
              <ul className="flex flex-col gap-4">
                {k.ravintolat.map((r) => (
                  <li key={r.id}>{r.kortti}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Kaikki kaupungit alhaalta nousevassa paneelissa (`<dialog>`, puhelimella
 * alareunassa, leveällä näytöllä keskellä). Aakkosjärjestys, Suomi ensin, oma
 * haku. Esc, Sulje ja taustan napautus sulkevat; valinta sulkee ja rajaa.
 * Fokus jää paneelin sisälle (modaali), ja sulkeutuessa se palaa avaajaan.
 */
function KaupunkiPaneeli({
  auki,
  onSulje,
  kaupungit,
  hakuteksti,
  valittu,
  yhteensa,
  onValitse,
}: {
  auki: boolean;
  onSulje: () => void;
  kaupungit: OdottavaKaupunki[];
  hakuteksti: Map<string, string>;
  valittu: string | null;
  yhteensa: number;
  onValitse: (avain: string | null) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const otsikkoId = useId();
  const [suodatin, setSuodatin] = useState("");

  // Avaus ja sulku tilan mukaan; taustasivu ei vierity paneelin ollessa auki.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (auki && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      // Valittu kaupunki näkyviin listassa (fokus jää Sulje-painikkeeseen,
      // jottei puhelimen näppäimistö peitä listaa).
      dialog.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "center" });
    } else if (!auki && dialog.open) {
      dialog.close();
    }
    if (!auki) document.documentElement.style.removeProperty("overflow");
  }, [auki]);
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty("overflow");
    },
    [],
  );

  const ryhmat = useMemo(() => {
    const sanat = sanoiksi(suodatin);
    const fi = (a: OdottavaKaupunki, b: OdottavaKaupunki) =>
      a.nimi.localeCompare(b.nimi, "fi") || (a.maa ?? "").localeCompare(b.maa ?? "", "fi");
    const osuvat = kaupungit.filter((k) => osuu(hakuteksti.get(k.avain) ?? "", sanat));
    return [
      { otsikko: "Suomi", kaupungit: osuvat.filter((k) => !ulkomaa(k)).sort(fi) },
      { otsikko: "Ulkomaat", kaupungit: osuvat.filter(ulkomaa).sort(fi) },
    ].filter((r) => r.kaupungit.length > 0);
  }, [kaupungit, hakuteksti, suodatin]);

  const rivi = (avain: string | null, nimi: ReactNode, maara: number) => {
    const paalla = valittu === avain;
    return (
      <li key={avain ?? "kaikki"} className="border-b border-border last:border-b-0">
        <button
          type="button"
          aria-pressed={paalla}
          onClick={() => {
            setSuodatin("");
            onValitse(avain);
          }}
          className={cn(
            "flex min-h-13 w-full items-center gap-3 px-5 text-left text-base transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            paalla ? "bg-blue-tint" : "hover:bg-background active:bg-surface-strong",
          )}
        >
          <span className="min-w-0 flex-1 truncate">{nimi}</span>
          <span className="text-sm tabular-nums text-muted-soft">{maara}</span>
          <span aria-hidden className="grid w-5 place-items-center text-accent">
            {paalla && (
              <svg viewBox="0 0 20 20" className="size-5">
                <path
                  fill="currentColor"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                />
              </svg>
            )}
          </span>
        </button>
      </li>
    );
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={otsikkoId}
      onClose={onSulje}
      // Taustan napautus sulkee (napautus osuu itse dialogiin vain sen ulkopuolella).
      onClick={(e) => e.target === e.currentTarget && onSulje()}
      className={cn(
        "alapaneeli mx-0 mb-0 mt-auto h-[80dvh] max-h-none w-full max-w-none overflow-hidden rounded-t-xl border-0 bg-surface p-0 text-foreground",
        "backdrop:bg-black/50 sm:m-auto sm:h-[min(36rem,80dvh)] sm:w-[min(28rem,calc(100%-2rem))] sm:rounded-sm sm:shadow-panel",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-5 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id={otsikkoId} className="font-display text-xl text-heading">
              Valitse kaupunki
            </h2>
            <button
              type="button"
              onClick={onSulje}
              className="-mr-2 min-h-11 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sulje
            </button>
          </div>
          <div className="relative mt-2">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-soft"
            >
              <path
                fill="currentColor"
                d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              />
            </svg>
            <input
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Hae kaupunkia"
              value={suodatin}
              onChange={(e) => setSuodatin(e.target.value)}
              onKeyDown={(e) => {
                // Enter valitsee ainoan osuman.
                if (e.key !== "Enter") return;
                e.preventDefault();
                const osumat = ryhmat.flatMap((r) => r.kaupungit);
                if (osumat.length === 1) {
                  setSuodatin("");
                  onValitse(osumat[0].avain);
                }
              }}
              placeholder="Hae kaupunkia"
              className="h-12 w-full rounded-sm border border-border-input bg-background pl-11 pr-3 text-base text-foreground placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {!normalizeSearch(suodatin) && <ul>{rivi(null, <span className="font-semibold">Kaikki kaupungit</span>, yhteensa)}</ul>}
          {ryhmat.map((r) => (
            <section key={r.otsikko} aria-label={r.otsikko}>
              <h3 className="sticky top-0 z-10 border-b border-border bg-background px-5 py-1.5 font-sans text-[13px] font-semibold uppercase tracking-wide text-muted">
                {r.otsikko}
              </h3>
              <ul>
                {r.kaupungit.map((k) =>
                  rivi(
                    k.avain,
                    <>
                      <span className="font-medium text-foreground">{k.nimi}</span>
                      {ulkomaa(k) && <span className="text-muted">, {k.maa}</span>}
                    </>,
                    k.ravintolat.length,
                  ),
                )}
              </ul>
            </section>
          ))}
          {ryhmat.length === 0 && (
            <p aria-live="polite" className="px-5 py-6 text-muted">
              Kaupunkia ei löytynyt. Tarkista kirjoitusasu.
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}

function PaikkaKuvake({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn("size-4 shrink-0", className)}>
      <path
        fill="currentColor"
        d="M10 1.75a6.25 6.25 0 0 1 6.25 6.25c0 4.3-4.9 9.3-5.7 10.1a.78.78 0 0 1-1.1 0C8.65 17.3 3.75 12.3 3.75 8A6.25 6.25 0 0 1 10 1.75Zm0 3.75a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
      />
    </svg>
  );
}

function RastiKuvake() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-5">
      <path
        fill="currentColor"
        d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm2.8 4.2L10 9l-2.8-2.8-1 1L9 10l-2.8 2.8 1 1L10 11l2.8 2.8 1-1L11 10l2.8-2.8-1-1Z"
      />
    </svg>
  );
}
