/**
 * Muuntaa jäsennetyn klubi- ja runkosisällön Sanity-tuontitiedostoksi
 * (docs/12-sisaltomigraatio.md §3, agentti M6).
 *
 * Ajo:    npx tsx scripts/import-klubi.ts            → NDJSON + coverage
 *         npx tsx scripts/import-klubi.ts --verify   → vertaa development-datasetia NDJSONiin
 * Lähde:  data/normalized/klubi.json   (npx tsx scripts/parse-klubi.ts)
 * Tulos:  data/migration-klubi.ndjson
 *         data/coverage-klubi.tsv
 *
 * Tuonti Sanityyn (AINA development, ei production):
 *   npx sanity dataset import data/migration-klubi.ndjson development --replace
 *
 * Tämä on ohut CMS-kohtainen adapteri kuten `import-ravintolat.ts`: kaikki
 * jäsennys on tehty parserissa, täällä vain rakennetaan Sanityn muodot
 * (Portable Text, _key:t, viittaukset, kuva-assetit).
 *
 * Toistettavuus: `_id`:t ovat deterministisiä (`<tyyppi>-<slug>`, singletonit
 * tyyppinsä nimellä kuten `sanity/structure.ts` odottaa), `_key`:t lasketaan
 * dokumentin id:stä ja polusta, eikä tiedostoon kirjoiteta aikaleimoja → kaksi
 * peräkkäistä ajoa tuottavat tavulleen saman tiedoston.
 *
 * Kuu / Loiste / Salud eivät ole tässä tiedostossa: niiden kohde on
 * ravintolamigraation dokumentti, jonka `--replace` tuhoaisi. Valmis data on
 * `data/normalized/klubi-ravintola-arviot.json` (integraatio patchaa).
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { KlubiData, KuvaRef, Lohko, Taulukko, Toiminta, Sivu } from "./parse-klubi";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "data", "normalized", "klubi.json");
const OUT = join(ROOT, "data", "migration-klubi.ndjson");
const COVERAGE = join(ROOT, "data", "coverage-klubi.tsv");
const IMAGES_DIR = join(ROOT, "data", "images");
const DATASET = "development";

type Doc = Record<string, unknown> & { _id: string; _type: string };

/** Deterministinen, lyhyt avain: sama dokumentti + polku → sama avain. */
function key(docId: string, path: string): string {
  return createHash("sha1").update(`${docId}|${path}`).digest("hex").slice(0, 12);
}

function asset(file: string): string {
  return `image@${pathToFileURL(join(IMAGES_DIR, file)).href}`;
}

function image(k: KuvaRef, docId: string, path: string, withKey = true) {
  return {
    _type: "imageWithAlt",
    ...(withKey ? { _key: key(docId, path) } : {}),
    _sanityAsset: asset(k.file),
    alt: k.alt,
    ...(k.caption ? { caption: k.caption } : {}),
  };
}

function portableText(blocks: Lohko[] | undefined, docId: string, field: string) {
  if (!blocks || blocks.length === 0) return undefined;
  return blocks.map((b, i) => {
    const path = `${field}[${i}]`;
    if (b.tyyppi === "kuva") return image(b.kuva, docId, path);
    const markDefs: { _type: "link"; _key: string; href: string }[] = [];
    const children = b.runs.map((r, j) => {
      const marks: string[] = [...(r.marks ?? [])];
      if (r.href) {
        let def = markDefs.find((m) => m.href === r.href);
        if (!def) {
          def = { _type: "link", _key: key(docId, `${path}.link.${markDefs.length}`), href: r.href };
          markDefs.push(def);
        }
        marks.push(def._key);
      }
      return { _type: "span", _key: key(docId, `${path}.span.${j}`), text: r.text, marks };
    });
    return {
      _type: "block",
      _key: key(docId, path),
      style: b.tyyli ?? "normal",
      markDefs,
      children,
      ...(b.lista ? { listItem: b.lista, level: 1 } : {}),
    };
  });
}

const slugField = (current: string) => ({ _type: "slug", current });
const ref = (id: string, k: string) => ({ _type: "reference", _ref: id, _key: k });

function tilastoId(slug: string): string {
  return `jalkapalloTilasto-${slug}`;
}

/** Poistaa `undefined`-kentät, jotta JSON on siisti ja tyhjät kentät jäävät pois. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

function tilastoDoc(t: Taulukko): Doc {
  const _id = tilastoId(t.slug);
  return clean({
    _id,
    _type: "jalkapalloTilasto",
    title: t.otsikko,
    slug: slugField(t.slug),
    tiivistelma: t.tiivistelma,
    category: "klubi",
    intro: portableText(t.johdanto, _id, "intro"),
    columns: t.sarakkeet.map((c, i) => ({ _key: `c${i}`, key: c.avain, label: c.otsikko, type: c.tyyppi })),
    rows: t.rivit.map((row, r) => ({
      _key: `r${r}`,
      // Tyhjä solu: avain säilyy (sarakemäärä yhtenäinen), arvo jätetään pois.
      cells: row.map((v, i) => clean({ _key: `c${i}`, key: t.sarakkeet[i].avain, value: v === "" ? undefined : v })),
    })),
    lisatiedot: portableText(t.lisatiedot, _id, "lisatiedot"),
    paivitetty: t.paivitetty,
    jarjestys: t.jarjestys,
    needsReview: t.needsReview,
    legacyUrl: `/${t.lahdesivu}`,
  });
}

function toimintaDoc(t: Toiminta): Doc {
  const _id = `klubiToiminta-${t.slug}`;
  return clean({
    _id,
    _type: "klubiToiminta",
    title: t.otsikko,
    slug: slugField(t.slug),
    tiivistelma: t.tiivistelma,
    kuvaus: portableText(t.kuvaus, _id, "kuvaus"),
    jarjestys: t.jarjestys,
    kuvat: t.kuvat?.length ? t.kuvat.map((k, i) => image(k, _id, `kuvat[${i}]`)) : undefined,
    vuodet: t.vuodet.length
      ? t.vuodet.map((v, i) =>
          clean({
            _key: key(_id, `vuodet[${i}]`),
            vuosi: v.vuosi,
            paivamaara: v.paivamaara,
            otsikko: v.otsikko,
            jarjestysnumero: v.jarjestysnumero,
            paikka: v.paikka,
            osallistujat: v.osallistujat?.length ? v.osallistujat : undefined,
            kuvaus: v.kuvaus,
            // Lähteen <a href> (matkakuvaus, video). Skeemaan tarvitaan kenttä
            // vuodet[].linkki { url, teksti } — ks. docs/12 "Toteutunut tilanne".
            linkki: v.linkki ? { url: v.linkki.url, teksti: v.linkki.teksti } : undefined,
            kuvat: v.kuvat?.length ? v.kuvat.map((k, j) => image(k, _id, `vuodet[${i}].kuvat[${j}]`)) : undefined,
          }),
        )
      : undefined,
    tilastot: t.taulukot.length ? t.taulukot.map((s, i) => ref(tilastoId(s), key(_id, `tilastot[${i}]`))) : undefined,
    needsReview: t.needsReview,
    legacyUrl: `/${t.lahdesivu}`,
  });
}

function sivuDoc(s: Sivu): Doc {
  const _id = `sivu-${s.slug.replace(/\//g, "-")}`;
  return clean({
    _id,
    _type: "sivu",
    title: s.otsikko,
    slug: slugField(s.slug),
    tiivistelma: s.tiivistelma,
    hero: s.hero ? image(s.hero, _id, "hero", false) : undefined,
    body: portableText(s.body, _id, "body"),
    tilastot: s.taulukot?.length ? s.taulukot.map((t, i) => ref(tilastoId(t), key(_id, `tilastot[${i}]`))) : undefined,
    needsReview: s.needsReview,
    legacyUrl: `/${s.lahdesivu}`,
    muutLegacyUrlit: s.muutLahdesivut?.length ? s.muutLahdesivut.map((p) => `/${p}`) : undefined,
  });
}

function singletonDocs(d: KlubiData): Doc[] {
  const e = d.singletonit.etusivu;
  const etusivu: Doc = clean({
    _id: "etusivu",
    _type: "etusivu",
    legacyUrl: `/${e.lahdesivu}`,
    heroEyebrow: e.heroEyebrow,
    heroTitle: e.heroTitle,
    heroDescription: e.heroDescription,
    heroCtas: e.heroCtas.map((c, i) => ({ _key: key("etusivu", `heroCtas[${i}]`), ...c })),
    seuraavaOttelu: e.seuraavaOttelu ? clean({ ...e.seuraavaOttelu }) : undefined,
    blocks: e.blocks.map((b, i) => {
      const _key = key("etusivu", `blocks[${i}]`);
      switch (b.tyyppi) {
        case "esittely":
          return clean({
            _type: "esittely",
            _key,
            heading: b.heading,
            body: portableText(b.body, "etusivu", `blocks[${i}].body`),
            ctaLabel: b.ctaLabel,
            ctaHref: b.ctaHref,
          });
        case "cta":
          return { _type: "cta", _key, heading: b.heading, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref };
        case "jalkapalloarkisto":
          return { _type: "jalkapalloarkisto", _key };
        default:
          return { _type: b.tyyppi, _key, count: b.count };
      }
    }),
  });
  const navigaatio: Doc = {
    _id: "navigaatio",
    _type: "navigaatio",
    items: d.singletonit.navigaatio.items.map((it, i) =>
      clean({
        _key: key("navigaatio", `items[${i}]`),
        label: it.label,
        href: it.href,
        highlight: it.highlight,
        children: it.children?.map((c, j) => ({ _key: key("navigaatio", `items[${i}].children[${j}]`), ...c })),
      }),
    ),
  };
  const a = d.singletonit.asetukset;
  const asetukset: Doc = clean({
    _id: "asetukset",
    _type: "asetukset",
    siteName: a.siteName,
    logo: a.logo ? { _type: "image", _sanityAsset: asset(a.logo.file), alt: a.logo.alt } : undefined,
  });
  const yhteystiedot: Doc = { _id: "yhteystiedot", _type: "yhteystiedot", city: d.singletonit.yhteystiedot.city };
  return [etusivu, navigaatio, asetukset, yhteystiedot];
}

// ── Tarkistukset ennen kirjoitusta ─────────────────────────────────────────

const MOJIBAKE = /Ã¤|Ã¶|Ã…|Ã„|Ã–|â€|&auml;|&ouml;|&nbsp;|&amp;|�/;

function validate(docs: Doc[]): string[] {
  const errors: string[] = [];
  const ids = new Set(docs.map((d) => d._id));
  if (ids.size !== docs.length) errors.push("Kaksoiskappale _id:ssä");
  const walk = (v: unknown, path: string, doc: Doc) => {
    if (typeof v === "string") {
      if (v === "" && !path.endsWith(".value")) errors.push(`${doc._id} ${path}: tyhjä merkkijono`);
      if (MOJIBAKE.test(v)) errors.push(`${doc._id} ${path}: mojibake "${MOJIBAKE.exec(v)?.[0]}"`);
      return;
    }
    if (Array.isArray(v)) {
      const keys = v.map((x) => (x && typeof x === "object" ? (x as { _key?: string })._key : undefined)).filter(Boolean);
      if (new Set(keys).size !== keys.length) errors.push(`${doc._id} ${path}: _key ei ole yksilöllinen`);
      v.forEach((x, i) => walk(x, `${path}[${i}]`, doc));
      return;
    }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o._type === "reference" && !ids.has(o._ref as string)) errors.push(`${doc._id} ${path}: viittaus puuttuu ${o._ref}`);
      if (o._type === "imageWithAlt") {
        const alt = o.alt as string | undefined;
        if (!alt || alt.length < 3 || alt.length > 200) errors.push(`${doc._id} ${path}: alt ${alt?.length ?? 0} merkkiä`);
        if (alt && /\.(jpe?g|png|gif)$/i.test(alt)) errors.push(`${doc._id} ${path}: alt on tiedostonimi`);
      }
      for (const [k, x] of Object.entries(o)) walk(x, path ? `${path}.${k}` : k, doc);
    }
  };
  for (const d of docs) {
    walk(d, "", d);
    // Skeeman pakolliset kentät (sanity/schemas/**).
    const req: Record<string, string[]> = {
      sivu: ["title", "slug"],
      klubiToiminta: ["title", "slug"],
      jalkapalloTilasto: ["title", "slug", "category"],
      etusivu: ["heroTitle", "heroDescription"],
      asetukset: ["siteName"],
      yhteystiedot: ["city"],
    };
    for (const f of req[d._type] ?? []) if (d[f] === undefined) errors.push(`${d._id}: pakollinen kenttä ${f} puuttuu`);
    if (d._type === "klubiToiminta") {
      for (const v of (d.vuodet as { vuosi?: number }[] | undefined) ?? []) {
        if (!Number.isInteger(v.vuosi) || v.vuosi! < 1900 || v.vuosi! > 2100) errors.push(`${d._id}: vuosi ${v.vuosi}`);
      }
    }
    if (d._type === "jalkapalloTilasto") {
      const w = (d.columns as unknown[]).length;
      for (const r of d.rows as { cells: unknown[] }[]) if (r.cells.length !== w) errors.push(`${d._id}: rivin leveys ≠ ${w}`);
    }
    const tiiv = d.tiivistelma as string | undefined;
    if (tiiv && tiiv.length > 300) errors.push(`${d._id}: tiivistelmä ${tiiv.length} > 300`);
    if (d._type === "sivu") {
      const first = (d.slug as { current: string }).current.split("/")[0];
      if (["studio", "api", "yhteystiedot", "tapahtumat", "uutiset", "ravintolat", "jalkapalloarkisto", "galleria", "stadionit"].includes(first)) {
        errors.push(`${d._id}: varattu polku ${first}`);
      }
    }
  }
  return errors;
}

// ── Tarkistus Sanitysta importin jälkeen ────────────────────────────────────

async function verify(docs: Doc[]): Promise<void> {
  process.loadEnvFile(join(ROOT, ".env.local"));
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID tai SANITY_API_WRITE_TOKEN puuttuu .env.local:sta");
  const query = async <T>(groq: string, params: Record<string, unknown> = {}): Promise<T> => {
    const url = new URL(`https://${projectId}.api.sanity.io/v2024-10-01/data/query/${DATASET}`);
    url.searchParams.set("query", groq);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Kysely epäonnistui: HTTP ${res.status}`);
    return ((await res.json()) as { result: T }).result;
  };
  const ids = docs.map((d) => d._id);
  const found = await query<{ _id: string; _type: string }[]>(`*[_id in $ids]{_id, _type}`, { ids });
  const missing = ids.filter((id) => !found.some((f) => f._id === id));
  const byType: Record<string, { odotettu: number; sanityssa: number }> = {};
  for (const d of docs) (byType[d._type] ??= { odotettu: 0, sanityssa: 0 }).odotettu += 1;
  for (const f of found) (byType[f._type] ??= { odotettu: 0, sanityssa: 0 }).sanityssa += 1;
  const drafts = await query<number>(`count(*[_id in $ids])`, { ids: ids.map((i) => `drafts.${i}`) });

  // Mojibake ja entiteetit (docs/12 §1.2): haetaan dokumentit ja tutkitaan kaikki merkkijonot.
  const full = await query<Doc[]>(`*[_id in $ids]`, { ids });
  const bad: string[] = [];
  const strings = (v: unknown, path: string, id: string) => {
    if (typeof v === "string") {
      if (/Ã¤|Ã¶|Ã…|Ã„|Ã–|â€|&auml;|&ouml;|&nbsp;|�|채/.test(v)) bad.push(`${id} ${path}`);
    } else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, id));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) strings(x, `${path}.${k}`, id);
  };
  for (const d of full) strings(d, "", d._id);

  // Kuvat: jokaisella kuvalla asset ja alt.
  const imgStats = await query<{ kuvat: number; ilmanAssettia: number; ilmanAltia: number }>(
    `{
      "kuvat": count(*[_id in $ids]{"k": [...coalesce(kuvat, []), ...coalesce(vuodet[].kuvat[], []), ...coalesce(body[_type == "imageWithAlt"], []), hero]}.k[defined(@)]),
      "ilmanAssettia": count(*[_id in $ids]{"k": [...coalesce(kuvat, []), ...coalesce(vuodet[].kuvat[], []), ...coalesce(body[_type == "imageWithAlt"], []), hero]}.k[defined(@) && !defined(asset._ref)]),
      "ilmanAltia": count(*[_id in $ids]{"k": [...coalesce(kuvat, []), ...coalesce(vuodet[].kuvat[], []), ...coalesce(body[_type == "imageWithAlt"], []), hero]}.k[defined(@) && !defined(alt)])
    }`,
    { ids },
  );
  const logo = await query<boolean>(`defined(*[_id == "asetukset"][0].logo.asset._ref)`);

  // Taulukot: rivimäärät Sanityssa = NDJSON.
  const rowCounts = await query<{ _id: string; rivit: number; sarakkeet: number }[]>(
    `*[_id in $ids && _type == "jalkapalloTilasto"]{_id, "rivit": count(rows), "sarakkeet": count(columns)}`,
    { ids },
  );
  const rowMismatch = rowCounts.filter((r) => {
    const d = docs.find((x) => x._id === r._id)!;
    return (d.rows as unknown[]).length !== r.rivit || (d.columns as unknown[]).length !== r.sarakkeet;
  });

  console.log(`
Tarkistus: dataset ${DATASET}
${Object.entries(byType)
  .map(([t, c]) => `  ${t.padEnd(20)} odotettu ${String(c.odotettu).padStart(3)}  Sanityssa ${String(c.sanityssa).padStart(3)}${c.odotettu === c.sanityssa ? "" : "  ← EROAA"}`)
  .join("\n")}
Puuttuvat dokumentit .... ${missing.length}${missing.length ? ` (${missing.slice(0, 5).join(", ")})` : ""}
Luonnoksia (drafts.) .... ${drafts}
Mojibake / entiteetit ... ${bad.length}${bad.length ? ` (${bad.slice(0, 5).join(", ")})` : ""}
Kuvia ................... ${imgStats.kuvat}  (ilman assettia ${imgStats.ilmanAssettia}, ilman altia ${imgStats.ilmanAltia})
Logo asetuksissa ........ ${logo ? "kyllä" : "EI"}
Taulukoiden rivimäärät .. ${rowCounts.length - rowMismatch.length}/${rowCounts.length} täsmää`);
  if (missing.length || bad.length || imgStats.ilmanAssettia || imgStats.ilmanAltia || rowMismatch.length || drafts || !logo) {
    process.exitCode = 1;
  }
}

// ── Pääohjelma ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const data = JSON.parse(await readFile(SOURCE, "utf-8")) as KlubiData;

  const docs: Doc[] = [
    ...singletonDocs(data),
    ...data.sivut.map(sivuDoc),
    ...data.toiminnat.map(toimintaDoc),
    ...data.taulukot.map(tilastoDoc),
  ];

  if (process.argv.includes("--verify")) {
    await verify(docs);
    return;
  }

  const errors = validate(docs);
  if (errors.length) {
    console.error(`Tarkistus epäonnistui (${errors.length}):\n  ${errors.slice(0, 40).join("\n  ")}`);
    process.exit(1);
  }

  await writeFile(OUT, `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`, "utf-8");

  // Coverage: jokainen M6:n vanha URL → tila ja kohde (täydentää data/coverage.tsv:tä).
  const ids = new Set(docs.map((d) => d._id));
  const lines = ["legacyUrl\ttila\tkohde\thuomio"];
  for (const c of data.coverage) {
    const external = c.kohde.startsWith("ravintola-");
    if (!external && !ids.has(c.kohde)) throw new Error(`Coverage-kohde puuttuu NDJSONista: ${c.kohde}`);
    lines.push([c.legacyUrl, c.tila, c.kohde, c.huomio.replace(/\s+/g, " ")].join("\t"));
  }
  await writeFile(COVERAGE, `${lines.join("\n")}\n`, "utf-8");

  const count = (t: string) => docs.filter((d) => d._type === t).length;
  const images = (JSON.stringify(docs).match(/"_sanityAsset"/g) ?? []).length;
  const review = docs.filter((d) => d.needsReview === true);
  console.log(`
Singletoneja ............ ${count("etusivu") + count("navigaatio") + count("asetukset") + count("yhteystiedot")}
Sivuja .................. ${count("sivu")}
Toimintamuotoja ......... ${count("klubiToiminta")}
Taulukoita .............. ${count("jalkapalloTilasto")}
Dokumentteja yhteensä ... ${docs.length}
Kuva-assetteja .......... ${images}
Tarkistettavia .......... ${review.length} (${review.map((d) => d._id).join(", ")})
Coverage-rivejä ......... ${lines.length - 1}

Kirjoitettu: ${OUT}
             ${COVERAGE}

Tuonti:
  npx sanity dataset import data/migration-klubi.ndjson ${DATASET} --replace`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
