"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { ravintolaAvain } from "@/lib/ravintolan-nimi";
import type { RavintolaOption, TuoreArvostelu, UusiEhdotus } from "@/sanity/lib/queries/ravintolat";
import {
  REVIEW_FIELD_LABELS,
  normalizeSearch,
  reviewErrorId,
  reviewFieldId,
  type ReviewField,
  type ReviewValues,
} from "./form-state";
import { FieldMessages, fieldClass, labelClass, RequiredMark } from "./form-ui";

/**
 * Ravintolan valinta: oma vaiheensa arvostelussa (review-form.tsx).
 *
 * Hakukenttä on vaiheen ylälaidassa ja osumat heti sen alla, joten puhelimen
 * näppäimistö ei peitä niitä. "Lisää uusi ravintola" on aina hakukentän alla.
 * Ennen kirjoittamista näytetään ensin viimeksi arvostellut ravintolat (uusin
 * ensin, myös hyväksymättömät lähetykset): kun klubilaiset syövät yhdessä,
 * ensimmäisen arvostelu nostaa ravintolan muiden listan kärkeen. Mukana myös
 * klubilaisten ehdottamat uudet ravintolat: valinta täyttää uuden ravintolan
 * tiedot samoiksi, jolloin hyväksyntä luo yhden ravintolan. Haku löytää
 * ehdotukset myös (ensimmäisinä osumina), joten nimellä hakeva klubilainen ei
 * päädy lisäämään samaa ravintolaa uudestaan. Sen alla
 * toista klubilaista arvioijaa odottavat (kahden klubilaisen sääntö, docs/21);
 * arvostelijan itse jo arvioimat jätetään niistä pois.
 * Ravintolan napautus valitsee sen ja vie seuraavaan vaiheeseen.
 *
 * Haku noudattaa WAI-ARIA 1.2 combobox-mallia: nuolinäppäimet liikkuvat
 * osumissa ja Enter valitsee. Osumien määrä kerrotaan ruudunlukijalle. Nimi ja
 * kaupunki haetaan ilman ääkkösiä ja välimerkkejä ("hameenlinna" löytää
 * "Hämeenlinnan"), ja jokaisen sanan pitää löytyä nimestä tai kaupungista
 * ("pizza lahti").
 *
 * Uuden ravintolan sihteeri luo hyväksyessään arvostelun (Studion toiminto
 * "Hyväksy ja luo ravintola").
 */

const MAX_RESULTS = 30;
const MAX_ODOTTAVAT = 30;
/** Haun osumat klubilaisten uusista ehdotuksista (ennen hakemiston osumia). */
const MAX_EHDOTUSOSUMAT = 3;

/** Valinnan tila arvostelulle: hakemistosta valittu, uusi ehdotus tai ei mitään. */
export type RavintolaValinta = "valittu" | "uusi" | null;

type Indexed = { r: RavintolaOption; name: string; city: string };

/** Listan rivi: hakemiston ravintola tai klubilaisen ehdottama uusi ravintola. */
type Vaihtoehto = {
  avain: string;
  nimi: string;
  kaupunki: string | null;
  r?: RavintolaOption;
  uusi?: UusiEhdotus;
  /** Lisärivi: "arvioitu tänään · Elias", "arvioinut Jukka" … */
  lisa: string | null;
};

/** Merkki kerrallaan taitettu teksti korostusta varten: pituus säilyy. */
function fold(value: string): string {
  return Array.from(value, (ch) =>
    ch.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fi-FI").charAt(0) || ch,
  ).join("");
}

function search(index: Indexed[], query: string): RavintolaOption[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  const words = q.split(" ");
  return index
    .filter(({ name, city }) => words.every((w) => name.includes(w) || city.includes(w)))
    .map((item) => {
      const rank = item.name.startsWith(q)
        ? 0
        : item.name.split(" ").some((part) => part.startsWith(words[0]))
          ? 1
          : 2;
      return { item, rank };
    })
    .sort((a, b) => a.rank - b.rank || a.item.r.name.localeCompare(b.item.r.name, "fi"))
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item.r);
}

function Highlight({ text, query }: { text: string; query: string }) {
  // Jokaisen hakusanan ensimmäinen osuma lihavoidaan ("pizz lahti").
  const folded = fold(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const word of fold(query).split(/[^\p{L}\p{N}]+/u).filter(Boolean)) {
    const at = folded.indexOf(word);
    if (at >= 0) marks.fill(true, at, at + word.length);
  }
  const parts: { text: string; mark: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts.at(-1);
    if (last && last.mark === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], mark: marks[i] });
  }
  return (
    <>
      {parts.map((p, i) =>
        p.mark ? (
          <mark key={i} className="bg-transparent font-semibold text-heading">
            {p.text}
          </mark>
        ) : (
          p.text
        ),
      )}
    </>
  );
}

/** "Pekka" / "Pekka ja Matti" / "Pekka, Matti ja Jari". */
function luettelo(nimet: string[]): string {
  if (nimet.length <= 1) return nimet.join("");
  return `${nimet.slice(0, -1).join(", ")} ja ${nimet.at(-1)}`;
}

/** Odottavan ravintolan arvioineet: "arvioinut Pekka" (tai null). */
function arvioineet(r: RavintolaOption): string | null {
  const nimet = [...new Set((r.odottaa ?? []).map((a) => a.nimi).filter((n): n is string => Boolean(n)))];
  return nimet.length ? `arvioinut ${luettelo(nimet)}` : null;
}

const helsinginPaiva = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" });

/** Lähetysaika suhteessa tähän päivään: "tänään", "eilen", "3 pv sitten", "12.9.2026". */
function milloin(iso: string, nyt = new Date()): string {
  const aika = new Date(iso);
  const ero = Math.round(
    (Date.parse(helsinginPaiva.format(nyt)) - Date.parse(helsinginPaiva.format(aika))) / 86_400_000,
  );
  if (ero <= 0) return "tänään";
  if (ero === 1) return "eilen";
  if (ero < 7) return `${ero} pv sitten`;
  const [v, k, p] = helsinginPaiva.format(aika).split("-").map(Number);
  return `${p}.${k}.${v}`;
}

/** Viimeksi arvostellun ravintolan lisärivi: "arvioitu tänään · Elias". */
function tuoreTeksti(t: TuoreArvostelu, klubilainenId?: string): string {
  const aika = milloin(t.aika);
  if (klubilainenId && t.arvioija === klubilainenId) return `arvioit ${aika}`;
  return t.nimi ? `arvioitu ${aika} · ${t.nimi}` : `arvioitu ${aika}`;
}

/** Klubilaisen uuden ravintolan ehdotus listan riviksi. */
function ehdotusRivi(t: TuoreArvostelu, klubilainenId?: string): Vaihtoehto {
  const u = t.uusi!;
  return {
    avain: `uusi:${ravintolaAvain(u.nimi, u.kaupunki)}`,
    nimi: u.nimi,
    kaupunki: u.maa && u.maa !== "Suomi" ? `${u.kaupunki}, ${u.maa}` : u.kaupunki,
    uusi: u,
    lisa: `uusi, odottaa hyväksyntää · ${tuoreTeksti(t, klubilainenId)}`,
  };
}

/** Hakutuloksen lisärivi odottavalle ravintolalle. */
function odottaaTeksti(r: RavintolaOption): string | null {
  if (!r.odottaa) return null;
  const kuka = arvioineet(r);
  return kuka ? `Odottaa toista arvioijaa · ${kuka}` : "Odottaa arvioijia";
}

export function RestaurantPicker({
  restaurants,
  tuoreet,
  ehdotukset,
  values,
  errors,
  klubilainenId,
  onChange,
  onValittu,
}: {
  restaurants: RavintolaOption[];
  /** Viimeksi arvostellut, uusin ensin. */
  tuoreet: TuoreArvostelu[];
  /** Klubilaisten odottavat uuden ravintolan ehdotukset (haku). */
  ehdotukset: TuoreArvostelu[];
  /** Alkuarvot (luonnos tai ?ravintola=). */
  values: ReviewValues;
  errors: Partial<Record<ReviewField, string>>;
  /** Arvostelijana valittu klubilainen: hänen jo arvioimansa pois odottavista. */
  klubilainenId?: string;
  onChange: (valinta: RavintolaValinta, nimi: string | null) => void;
  /** Ravintola napautettu: seuraavaan vaiheeseen. */
  onValittu: () => void;
}) {
  const [uusi, setUusi] = useState(values.uusi === "1");
  const [selected, setSelected] = useState<RavintolaOption | undefined>(() =>
    restaurants.find((r) => r._id === values.ravintola),
  );
  const [query, setQuery] = useState("");
  // Uuden ravintolan kenttien esitäyttö: haun tekstistä tai toisen klubilaisen ehdotuksesta.
  const [prefill, setPrefill] = useState<(UusiEhdotus & { ehdotuksesta: boolean }) | null>(() => {
    // Luonnoksesta palattaessa: jos uusi ravintola on sama kuin jokin
    // klubilaisen ehdotus, näytetään se valittuna ehdotuksena eikä täyttölomakkeena.
    if (values.uusi !== "1" || !values.uusiNimi || !values.uusiKaupunki) return null;
    const avain = ravintolaAvain(values.uusiNimi, values.uusiKaupunki);
    const sama = ehdotukset.find((t) => t.uusi && ravintolaAvain(t.uusi.nimi, t.uusi.kaupunki) === avain)?.uusi;
    return sama ? { ...sama, ehdotuksesta: true } : null;
  });
  const [active, setActive] = useState(-1);
  const listId = useId();

  const index = useMemo<Indexed[]>(
    () =>
      restaurants.map((r) => ({
        r,
        name: normalizeSearch(r.name),
        city: normalizeSearch(r.city ?? ""),
      })),
    [restaurants],
  );
  const results = useMemo(() => search(index, query), [index, query]);
  // Viimeksi arvioidut: hakemiston ravintolat ja klubilaisten uudet ehdotukset.
  const viimeisimmat = useMemo<Vaihtoehto[]>(() => {
    const ravintolat = new Map(restaurants.map((r) => [r._id, r]));
    return tuoreet.flatMap((t): Vaihtoehto[] => {
      if (t.ravintola) {
        const r = ravintolat.get(t.ravintola);
        return r ? [{ avain: r._id, nimi: r.name, kaupunki: r.city ?? null, r, lisa: tuoreTeksti(t, klubilainenId) }] : [];
      }
      return t.uusi ? [ehdotusRivi(t, klubilainenId)] : [];
    });
  }, [restaurants, tuoreet, klubilainenId]);
  // Haun osumat ehdotuksista: nimi, kaupunki tai maa.
  const ehdotusIndeksi = useMemo(
    () =>
      ehdotukset.flatMap((t) =>
        t.uusi ? [{ t, haku: normalizeSearch(`${t.uusi.nimi} ${t.uusi.kaupunki} ${t.uusi.maa ?? ""}`) }] : [],
      ),
    [ehdotukset],
  );
  const ehdotusOsumat = useMemo(() => {
    const sanat = normalizeSearch(query).split(" ").filter(Boolean);
    if (!sanat.length) return [];
    return ehdotusIndeksi
      .filter(({ haku }) => sanat.every((s) => haku.includes(s)))
      .slice(0, MAX_EHDOTUSOSUMAT)
      .map(({ t }) => ehdotusRivi(t, klubilainenId));
  }, [ehdotusIndeksi, query, klubilainenId]);
  const odottavat = useMemo(
    () =>
      restaurants
        // Viimeksi arvioiduissa jo näkyvät eivät toistu.
        .filter((r) => !tuoreet.some((t) => t.ravintola === r._id))
        .filter((r) => r.odottaa && !r.odottaa.some((a) => a.arvioija === klubilainenId))
        .sort(
          (a, b) =>
            (b.tuorein ?? "").localeCompare(a.tuorein ?? "") || a.name.localeCompare(b.name, "fi"),
        )
        .slice(0, MAX_ODOTTAVAT),
    [restaurants, tuoreet, klubilainenId],
  );
  // Tunnetut kaupungit: "pizzeria roma lahti" → nimi "pizzeria roma", kaupunki "Lahti".
  const cities = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants) if (r.city) map.set(normalizeSearch(r.city), r.city);
    return map;
  }, [restaurants]);

  function splitQuery(q: string): { nimi: string; kaupunki: string } {
    const words = q.trim().split(/\s+/);
    for (let n = Math.min(3, words.length - 1); n >= 1; n--) {
      const city = cities.get(normalizeSearch(words.slice(-n).join(" ")));
      if (city) return { nimi: words.slice(0, -n).join(" "), kaupunki: city };
    }
    return { nimi: q.trim(), kaupunki: "" };
  }

  /** Hakemiston ravintola listan riviksi. */
  const rivi = (r: RavintolaOption, lisa: string | null): Vaihtoehto => ({
    avain: r._id,
    nimi: r.name,
    kaupunki: r.city ?? null,
    r,
    lisa,
  });
  const omaArvio = (r: RavintolaOption) =>
    Boolean(klubilainenId && r.odottaa?.some((a) => a.arvioija === klubilainenId));

  const searching = query.trim() !== "";
  // Ilman hakua: viimeksi arvioidut ensin, sitten odottavat (yhtenäinen numerointi
  // nuolinäppäimille).
  const ryhmat: { otsikko: string; rivit: Vaihtoehto[] }[] = searching
    ? [
        {
          otsikko: "Hakutulokset",
          // Ehdotukset ensin: nimellä hakeva löytää saman illan uuden ravintolan.
          rivit: [
            ...ehdotusOsumat,
            ...results.map((r) => rivi(r, omaArvio(r) ? "Olet jo arvioinut" : odottaaTeksti(r))),
          ],
        },
      ]
    : [
        { otsikko: "Viimeksi arvioidut", rivit: viimeisimmat },
        {
          otsikko: "Toista arvioijaa odottavat",
          rivit: odottavat.map((r) => rivi(r, arvioineet(r))),
        },
      ].filter((g) => g.rivit.length > 0);
  const options = ryhmat.flatMap((g) => g.rivit);
  const optionId = (i: number) => `${listId}-vaihtoehto-${i}`;
  const valittuAvain = uusi
    ? prefill?.ehdotuksesta
      ? `uusi:${ravintolaAvain(prefill.nimi, prefill.kaupunki)}`
      : null
    : (selected?._id ?? null);

  function select(r: RavintolaOption) {
    setSelected(r);
    setUusi(false);
    setQuery("");
    setActive(-1);
    onChange("valittu", r.name);
    onValittu();
  }

  /** Toisen klubilaisen ehdottama uusi ravintola: samat tiedot, jotta hyväksyntä yhdistää ne. */
  function selectEhdotus(u: UusiEhdotus) {
    setPrefill({ ...u, ehdotuksesta: true });
    setUusi(true);
    setQuery("");
    setActive(-1);
    onChange("uusi", u.nimi);
    onValittu();
  }

  function valitse(v: Vaihtoehto) {
    if (v.r) select(v.r);
    else if (v.uusi) selectEhdotus(v.uusi);
  }

  function addNew() {
    setPrefill({ ...splitQuery(query), ehdotuksesta: false });
    setUusi(true);
    onChange("uusi", null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (options.length ? (i + 1) % options.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
        break;
      case "Enter": {
        // Enter valitsee osuman eikä lähetä lomaketta.
        e.preventDefault();
        const v = options[active >= 0 ? active : 0];
        if (v && (active >= 0 || searching)) valitse(v);
        break;
      }
      case "Escape":
        if (query) {
          e.preventDefault();
          setQuery("");
          setActive(-1);
        }
        break;
    }
  }

  const error = errors.ravintola;
  const hintId = `${reviewFieldId("ravintola")}-ohje`;

  // Ehdotuksesta valittu korvaa luonnoksen arvot; haun teksti vain tyhjät kentät.
  const uudenArvot: ReviewValues = !prefill
    ? values
    : prefill.ehdotuksesta
      ? { ...values, uusiNimi: prefill.nimi, uusiKaupunki: prefill.kaupunki, uusiMaa: prefill.maa || values.uusiMaa }
      : values.uusiNimi
        ? values
        : { ...values, uusiNimi: prefill.nimi, uusiKaupunki: values.uusiKaupunki || prefill.kaupunki };

  // Valittu ehdotus näytetään korttina (kuten hakemiston ravintola), ja sen
  // tiedot lähtevät piilokentissä; täyttölomake vain itse lisätylle.
  const ehdotusValittu = uusi && prefill?.ehdotuksesta ? prefill : null;
  const kortti = ehdotusValittu
    ? {
        nimi: ehdotusValittu.nimi,
        paikka: ehdotusValittu.maa && ehdotusValittu.maa !== "Suomi"
          ? `${ehdotusValittu.kaupunki}, ${ehdotusValittu.maa}`
          : ehdotusValittu.kaupunki,
        lisa: "uusi, odottaa hyväksyntää",
      }
    : !uusi && selected
      ? { nimi: selected.name, paikka: selected.city ?? null, lisa: null }
      : null;

  return (
    <div className="flex flex-col">
      {/* Palvelimelle menevät arvot. */}
      <input type="hidden" name="ravintola" value={!uusi ? (selected?._id ?? "") : ""} />
      <input type="hidden" name="uusi" value={uusi ? "1" : ""} />
      {ehdotusValittu && (
        <>
          <input type="hidden" name="uusiNimi" value={ehdotusValittu.nimi} />
          <input type="hidden" name="uusiKaupunki" value={ehdotusValittu.kaupunki} />
          <input type="hidden" name="uusiMaa" value={ehdotusValittu.maa || "Suomi"} />
        </>
      )}

      {uusi && !ehdotusValittu ? (
        <NewRestaurantFields
          // Uusi esitäyttö (kentät ovat hallitsemattomia): piirretään alusta.
          key={prefill ? `${prefill.ehdotuksesta}:${prefill.nimi}|${prefill.kaupunki}` : "luonnos"}
          values={uudenArvot}
          errors={errors}
          // Ehdotuksesta valittaessa siirrytään heti arvosanoihin: ei näppäimistöä.
          kohdista={!prefill?.ehdotuksesta}
          onCancel={() => {
            setUusi(false);
            setPrefill(null);
            onChange(selected ? "valittu" : null, selected?.name ?? null);
          }}
        />
      ) : (
        <>
          {kortti && (
            <div className="mb-4 flex items-center gap-3 rounded-sm border border-border border-l-[3px] border-l-brass bg-surface px-4 py-3">
              <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-brass-text">
                <path
                  fill="currentColor"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                />
              </svg>
              <p className="min-w-0 text-[15px]">
                <span className="text-muted">Valittuna </span>
                <strong className="font-semibold text-heading">{kortti.nimi}</strong>
                {kortti.paikka && <span className="text-muted">, {kortti.paikka}</span>}
                {kortti.lisa && <span className="block text-sm text-muted">{kortti.lisa}</span>}
              </p>
            </div>
          )}

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id={reviewFieldId("ravintola")}
              type="search"
              role="combobox"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Hae ravintolaa nimellä tai kaupungilla"
              aria-autocomplete="list"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-activedescendant={active >= 0 && options[active] ? optionId(active) : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={[hintId, error ? reviewErrorId("ravintola") : ""].filter(Boolean).join(" ")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder="Ravintolan nimi tai kaupunki"
              className={cn(fieldClass, "h-12 bg-surface pl-11")}
            />
          </div>
          <p id={hintId} className="sr-only">
            Kirjoita nimi tai kaupunki ja valitse ravintola listasta.
          </p>
          <FieldMessages field="ravintola" error={error} />
          <button
            type="button"
            onClick={addNew}
            className="mt-1 flex min-h-12 w-full items-center gap-2 rounded-sm px-1 text-left text-[15px] font-semibold text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden className="text-xl leading-none">+</span>
            <span className="min-w-0 truncate">
              {searching ? `Lisää uusi ravintola "${query.trim()}"` : "Lisää uusi ravintola"}
            </span>
          </button>

          <p aria-live="polite" className={searching ? "mt-2 text-[13px] font-semibold uppercase tracking-wide text-muted" : "sr-only"}>
            {searching
              ? results.length + ehdotusOsumat.length > 0
                ? `${results.length + ehdotusOsumat.length}${results.length === MAX_RESULTS ? "+" : ""} osumaa`
                : "Ei osumia"
              : ""}
          </p>
          {searching && results.length + ehdotusOsumat.length === 0 && (
            <p className="mt-1 text-[15px] text-muted">Tarkista kirjoitusasu tai lisää uusi ravintola.</p>
          )}
          <div id={listId} role="listbox" aria-label={searching ? "Hakutulokset" : "Ehdotetut ravintolat"}>
            {ryhmat.map((g, gi) => {
              const alku = ryhmat.slice(0, gi).reduce((n, x) => n + x.rivit.length, 0);
              const otsikkoId = `${listId}-ryhma-${gi}`;
              return (
                <div key={g.otsikko} className="mt-3">
                  {!searching && (
                    <p
                      id={otsikkoId}
                      role="presentation"
                      className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted"
                    >
                      {g.otsikko}
                    </p>
                  )}
                  <ul
                    role="group"
                    aria-labelledby={searching ? undefined : otsikkoId}
                    aria-label={searching ? g.otsikko : undefined}
                    className="overflow-hidden rounded-sm border border-border bg-surface"
                  >
                    {g.rivit.map((v, j) => {
                      const i = alku + j;
                      const korostettu = i === active || v.avain === valittuAvain;
                      return (
                        <li
                          key={v.avain}
                          id={optionId(i)}
                          role="option"
                          aria-selected={korostettu}
                          onClick={() => valitse(v)}
                          className={cn(
                            "flex min-h-14 cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0",
                            // Valittu korostuu (näkyy hetken ennen siirtymää seuraavaan vaiheeseen).
                            korostettu ? "bg-brass-tint" : "hover:bg-background active:bg-surface-strong",
                          )}
                        >
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="text-[15px] font-semibold text-foreground">
                              <Highlight text={v.nimi} query={query} />
                            </span>
                            {(v.kaupunki || v.lisa) && (
                              <span className="text-sm text-muted">
                                {v.kaupunki && <Highlight text={v.kaupunki} query={query} />}
                                {v.kaupunki && v.lisa && " · "}
                                {v.lisa}
                              </span>
                            )}
                          </span>
                          <span aria-hidden className="text-xl text-muted-soft">›</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn("size-5 shrink-0 text-muted-soft", className)}>
      <path
        fill="currentColor"
        d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      />
    </svg>
  );
}

function NewRestaurantFields({
  values,
  errors,
  kohdista = true,
  onCancel,
}: {
  values: ReviewValues;
  errors: Partial<Record<ReviewField, string>>;
  /** Fokus ensimmäiseen täytettävään kenttään (ei, kun tiedot tulivat ehdotuksesta). */
  kohdista?: boolean;
  onCancel: () => void;
}) {
  const text = (field: keyof ReviewValues & ReviewField, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = true) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={reviewFieldId(field)} className={labelClass}>
        {REVIEW_FIELD_LABELS[field]}
        {required ? <RequiredMark /> : <span className="font-normal text-muted"> (valinnainen)</span>}
      </label>
      <input
        id={reviewFieldId(field)}
        name={field}
        type="text"
        required={required}
        defaultValue={values[field]}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? reviewErrorId(field) : undefined}
        className={fieldClass}
        {...props}
      />
      <FieldMessages field={field} error={errors[field]} />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 rounded-sm border border-border border-l-[3px] border-l-brass bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-heading">Uusi ravintola</p>
          <p className="mt-1 text-sm text-muted">
            Lisäämme ravintolan hakemistoon, kun hyväksymme arvostelusi.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Takaisin hakuun
        </button>
      </div>
      {/* Fokus ensimmäiseen täytettävään kenttään (hakukenttä poistui näkyvistä). */}
      {text("uusiNimi", { maxLength: 100, autoFocus: kohdista && (!values.uusiNimi || Boolean(values.uusiKaupunki)) })}
      {text("uusiKaupunki", { maxLength: 60, autoComplete: "address-level2", autoFocus: kohdista && Boolean(values.uusiNimi) && !values.uusiKaupunki })}
      {/* Maa (oletus Suomi) ja osoite harvoin tarpeen: piilossa, ellei niissä ole virhettä.
          Suljetun details-elementin kentät lähtevät lomakkeella normaalisti. */}
      <details open={Boolean(errors.uusiMaa || errors.uusiLisatieto) || undefined} className="group">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold text-accent">
          <span aria-hidden className="transition group-open:rotate-90">›</span>
          Maa ja osoite
          <span className="font-normal text-muted">(valinnainen, maa oletuksena Suomi)</span>
        </summary>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {text("uusiMaa", { maxLength: 60, autoComplete: "country-name" })}
          {text("uusiLisatieto", { maxLength: 200, placeholder: "Esim. Aleksanterinkatu 10 tai www.ravintola.fi" }, false)}
        </div>
      </details>
    </div>
  );
}
