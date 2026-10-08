/**
 * Linkkien migraatio (docs/24 askel 5, P5 ja P11): vanhat merkkijonolinkit
 * linkkiobjekteiksi. Sivuston oma polku, jolle on julkaistu dokumentti, muuttuu
 * viittaukseksi (Sivuston sivu), ja kaikki muut vanhat linkit saavat tyypin
 * Muu osoite. Säännöt ja testit: scripts/lib/linkit-migraatio.ts,
 * scripts/test-linkit-migraatio.ts.
 *
 * Ajo:
 *   npm run patch:linkit                                  # development, kuivaharjoitus
 *   npm run patch:linkit -- --vie                         # development, kirjoitus
 *   npm run patch:linkit -- --production                  # production, kuivaharjoitus
 *   npm run patch:linkit -- --production --vie            # varmuuskopio + kirjoitus + tarkistus
 *   ... --poista-vanhat                                   # P11: vanhat href, url ja ctaHref pois
 *
 * Isännät (myös luonnokset): valikko, etusivu (pikalinkit ja lohkojen napit),
 * klubin toimintamuotojen vuosilinkit ja jokaisen dokumentin tekstin linkit.
 * Vanhat href-, url- ja ctaHref-arvot säilyvät, kunnes `--poista-vanhat`.
 *
 * Turvat:
 *  - Ennen kirjoitusta (myös kuivaharjoituksessa) muutokset simuloidaan, ja
 *    jokaisen linkin kävijän osoitteen (`linkinOsoite`) pitää pysyä samana ja
 *    viittauksen kohteen osoitteen olla sama kuin vanha osoite. Muuten mitään
 *    ei kirjoiteta.
 *  - Jokainen dokumentti omana transaktionaan `ifRevisionId`-ehdolla.
 *  - Productionissa ensin `npm run backup`; jos se epäonnistuu, mitään ei kirjoiteta.
 *  - Kirjoituksen jälkeen valikko, etusivu, klubin toiminta ja muutettujen
 *    tekstien linkit haetaan sivuston kyselyillä ja verrataan alkuperäisiin.
 *  - Idempotentti: toinen ajo ei muuta mitään.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { createClient, type SanityClient } from "@sanity/client";

import { linkinOsoite, linkinOsoiteTaiVanha, LINKIN_KOHDETYYPIT, ratkaiseLinkit, type LinkinKohde, type LinkinTiedosto, type LinkkiData } from "../lib/linkki";
import { ratkaiseNavigaatio } from "../lib/navigaatio";
import { navigationQuery } from "../sanity/lib/queries";
import { etusivuQuery } from "../sanity/lib/queries/etusivu";
import { klubiToimintaBySlugQuery } from "../sanity/lib/queries/klubi";
import { runko } from "../sanity/lib/queries/kuvat";
import { kohdeProjektio, tiedostoProjektio } from "../sanity/lib/queries/linkki";
import {
  arvoPolussa,
  dokumentinMuutokset,
  linkitIlmanTyyppia,
  linkkienViittaukset,
  miksiOsoite,
  muuttuneetOsoitteet,
  rakennaHakemisto,
  sovellaOperaatiot,
  type HakemistonKohde,
  type Muutos,
  type Operaatio,
  type Ratkaisu,
} from "./lib/linkit-migraatio";
import { sanityWriteToken } from "./lib/sanity-token";

type Doc = Record<string, unknown> & { _id: string; _type: string; _rev: string; slug?: { current?: string } };
type Suunnitelma = { doc: Doc; operaatiot: Operaatio[]; muutokset: Muutos[] };

const TSV = "data/linkit-migraatio.tsv";

/** Järjestelmä- ja varmuuskopiodokumentit eivät sisällä linkkejä. */
const ISANNAT = `*[!(_type match "sanity.*") && !(_type match "system.*")
  && !(_type in ["varmuuskopio", "sivustonTila"]) && !(_id in path("versions.**"))]`;

async function main() {
  const vie = process.argv.includes("--vie");
  const poistaVanhat = process.argv.includes("--poista-vanhat");
  const dataset = process.argv.includes("--production") ? "production" : "development";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const asetukset = { projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false } as const;
  const client = createClient({ ...asetukset, perspective: "raw" });
  const julkaistu = createClient({ ...asetukset, perspective: "published" });

  console.log(`Dataset ${dataset}${vie ? "" : " (kuivaharjoitus)"}${poistaVanhat ? ", vanhat kentät poistetaan" : ""}`);
  const { suunnitelmat, ratkaisu } = await suunnittele(client, poistaVanhat);

  // Tuloste ja tiedosto.
  const rivit: string[][] = [];
  for (const s of suunnitelmat) {
    for (const m of s.muutokset) rivit.push([s.doc._id, m.polku, m.vanha ?? "", kuvaaUusi(m)]);
  }
  if (rivit.length) {
    console.log("\ndokumentti | kenttä | vanha → uusi");
    for (const [id, polku, vanha, uusi] of rivit) console.log(`  ${id} | ${polku} | ${vanha || "–"} → ${uusi}`);
  }
  const yhteenveto = laskeYhteenveto(suunnitelmat);
  console.log(`\n${yhteenveto}`);

  // Invariantit: viittauksen kohde on sama osoite, kävijän osoite ei muutu, jokaisella linkillä on tyyppi.
  const virheet = tarkistaInvariantit(suunnitelmat, ratkaisu, poistaVanhat);
  if (virheet.length) {
    console.error("\nPysäytetty: muunnos muuttaisi linkkejä. Mitään ei kirjoitettu.");
    for (const v of virheet) console.error(`  ${v}`);
    process.exit(1);
  }
  console.log("✓ Tarkistus: viittausten kohteet ovat samat osoitteet, eikä yhdenkään linkin osoite kävijälle muutu.");

  if (!vie) {
    mkdirSync("data", { recursive: true });
    writeFileSync(
      TSV,
      ["dokumentti\tkenttä\tvanha\tuusi", ...rivit.map((r) => r.join("\t"))].join("\n") + "\n",
      "utf-8",
    );
    console.log(
      `\nKuivaharjoitus: mitään ei kirjoitettu (taulukko ${TSV}). Kirjoita: npm run patch:linkit -- ` +
        `${dataset === "production" ? "--production " : ""}--vie${poistaVanhat ? " --poista-vanhat" : ""}`,
    );
    return;
  }
  if (suunnitelmat.length === 0) {
    console.log("\nEi muutettavaa.");
    return;
  }

  if (dataset === "production") {
    console.log("\nVarmuuskopio productionista");
    const tulos = spawnSync("npm", ["run", "backup"], { stdio: "inherit", shell: process.platform === "win32" });
    if (tulos.status !== 0) {
      console.error("Varmuuskopio epäonnistui: mitään ei kirjoitettu.");
      process.exit(1);
    }
  }

  const tekstit = tekstikentat(suunnitelmat);
  const ennen = await sivustonLinkit(julkaistu, tekstit);

  // Yksi transaktio per dokumentti. `ifRevisionId`: kesken ajon muokattu dokumentti hylätään.
  const hylatyt: string[] = [];
  for (const s of suunnitelmat) {
    try {
      await client
        .transaction()
        .patch(s.doc._id, (p) => {
          let patch = p.ifRevisionId(s.doc._rev);
          for (const op of s.operaatiot) {
            patch = op.tyyppi === "set" ? patch.set({ [op.polku]: op.arvo }) : patch.unset([op.polku]);
          }
          return patch;
        })
        .commit();
    } catch (virhe) {
      hylatyt.push(`${s.doc._id}: ${(virhe as Error).message}`);
    }
  }

  const jalkeen = await sivustonLinkit(julkaistu, tekstit);
  const erot = vertaa(ennen, jalkeen);
  const jaljella = (await suunnittele(client, poistaVanhat)).suunnitelmat;

  if (hylatyt.length) {
    console.error(`\n${hylatyt.length} dokumenttia jäi kirjoittamatta (muokattu kesken ajon?):`);
    for (const h of hylatyt) console.error(`  ${h}`);
  }
  if (erot.length) {
    console.error("\nSivuston linkit muuttuivat:");
    for (const e of erot) console.error(`  ${e}`);
  }
  if (jaljella.length) {
    console.error(`\nMuutettavaa jäi ${jaljella.length} dokumenttiin: ${jaljella.map((s) => s.doc._id).join(", ")}`);
  }
  if (hylatyt.length || erot.length || jaljella.length) {
    console.error("Aja uudelleen tai palauta varmuuskopiosta.");
    process.exit(1);
  }
  console.log(
    `\n✓ ${dataset}: ${suunnitelmat.length} dokumenttia kirjoitettu. Sivuston kyselyt antavat samat linkit kuin ennen ` +
      `(valikko, etusivu, klubin toiminta, ${tekstit.length} tekstikenttää), eikä muutettavaa jäänyt.`,
  );
}

/** Hakemisto, isännät, viittausten tiedot ja muutokset. */
async function suunnittele(client: SanityClient, poistaVanhat: boolean) {
  const hakemistonRivit = await client.fetch<HakemistonKohde[]>(
    `*[_type in $tyypit && defined(slug.current) && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]${kohdeProjektio}`,
    { tyypit: [...LINKIN_KOHDETYYPIT] },
  );
  const hakemisto = rakennaHakemisto(hakemistonRivit);
  const docs = await client.fetch<Doc[]>(ISANNAT);

  // Kävijän osoitteiden laskentaan: nykyiset viittaukset ja tiedostot sekä hakemiston kohteet.
  const refit = new Set<string>();
  const assetit = new Set<string>();
  for (const d of docs) {
    const v = linkkienViittaukset(d);
    v.kohteet.forEach((r) => refit.add(r));
    v.tiedostot.forEach((t) => assetit.add(t));
  }
  const kohteet = new Map<string, LinkinKohde>(hakemistonRivit.map((r) => [r._id, r as LinkinKohde]));
  const puuttuvat = [...refit].filter((r) => !kohteet.has(r));
  if (puuttuvat.length) {
    for (const k of await client.fetch<LinkinKohde[]>(`*[_id in $idt]${kohdeProjektio}`, { idt: puuttuvat })) {
      kohteet.set(k._id, k);
    }
  }
  const tiedostot = new Map<string, LinkinTiedosto>();
  if (assetit.size) {
    // Sama kuin `tiedostoProjektio`, lisäksi tunnus.
    const rivit = await client.fetch<(LinkinTiedosto & { _id: string })[]>(
      `*[_id in $idt]{ _id, ${tiedostoProjektio.trim().slice(1, -1)} }`,
      { idt: [...assetit] },
    );
    for (const r of rivit) tiedostot.set(r._id, r);
  }
  const ratkaisu: Ratkaisu = { kohteet, tiedostot };

  const suunnitelmat: Suunnitelma[] = [];
  for (const doc of docs) {
    const { operaatiot, muutokset } = dokumentinMuutokset(doc, hakemisto, { poistaVanhat, ratkaisu });
    if (operaatiot.length) {
      // Tulosteeseen syy, miksi sivuston oma polku jää osoitteeksi.
      for (const m of muutokset) {
        if (m.tulos !== "viittaus" && m.tulos !== "poisto" && m.vanha?.startsWith("/")) {
          m.uusi = `osoite (${miksiOsoite(m.vanha, hakemisto)})`;
        }
      }
      suunnitelmat.push({ doc, operaatiot, muutokset });
    }
  }
  return { suunnitelmat, ratkaisu, hakemisto };
}

function kuvaaUusi(m: Muutos): string {
  if (m.tulos === "viittaus") return `sivu: ${m.uusi} (${m.kohteenOsoite})`;
  if (m.tulos === "poisto") return `${m.uusi} poistettu`;
  if (m.tulos === "osoite") return `${m.uusi}, href kopioitu`;
  return m.uusi;
}

function laskeYhteenveto(suunnitelmat: Suunnitelma[]): string {
  const kaikki = suunnitelmat.flatMap((s) => s.muutokset);
  const n = (t: Muutos["tulos"]) => kaikki.filter((m) => m.tulos === t).length;
  const arvoDokumentit = suunnitelmat.filter((s) => s.muutokset.some((m) => m.tulos === "viittaus" || m.tulos === "osoite"));
  const tyyppiDokumentit = suunnitelmat.filter((s) => s.muutokset.some((m) => m.tulos === "tyyppi"));
  const rivit = [
    `Yhteenveto: ${suunnitelmat.length} dokumenttia patchataan`,
    `  arvoja ${n("viittaus") + n("osoite")} (${arvoDokumentit.length} dokumentissa): viittauksia ${n("viittaus")}, osoitteita ${n("osoite")}`,
    `  tyyppi "osoite" ilman muuta muutosta (href ennallaan): ${n("tyyppi")} linkkiä ${tyyppiDokumentit.length} dokumentissa`,
  ];
  if (n("poisto")) rivit.push(`  vanhoja kenttiä poistetaan: ${n("poisto")}`);
  const perDoc = arvoDokumentit.map((s) => {
    const v = s.muutokset.filter((m) => m.tulos === "viittaus").length;
    const o = s.muutokset.filter((m) => m.tulos === "osoite").length;
    return `    ${s.doc._id}: ${v} viittausta, ${o} osoitetta`;
  });
  return [...rivit, ...perDoc].join("\n");
}

function tarkistaInvariantit(suunnitelmat: Suunnitelma[], ratkaisu: Ratkaisu, poistaVanhat: boolean): string[] {
  const virheet: string[] = [];
  for (const s of suunnitelmat) {
    for (const m of s.muutokset) {
      if (m.tulos === "viittaus" && m.kohteenOsoite !== m.vanha) {
        virheet.push(`${s.doc._id} ${m.polku}: kohteen osoite ${m.kohteenOsoite} ≠ vanha ${m.vanha}`);
      }
    }
    let uusi: Doc;
    try {
      uusi = sovellaOperaatiot(s.doc, s.operaatiot);
    } catch (virhe) {
      virheet.push(`${s.doc._id}: ${(virhe as Error).message}`);
      continue;
    }
    for (const [polku, ennen, jalkeen] of muuttuneetOsoitteet(s.doc, uusi, ratkaisu)) {
      virheet.push(`${s.doc._id} ${polku}: ${ennen ?? "ei linkkiä"} → ${jalkeen ?? "ei linkkiä"}`);
    }
    if (!poistaVanhat) {
      for (const polku of linkitIlmanTyyppia(uusi)) virheet.push(`${s.doc._id} ${polku}: tyyppi puuttuu yhä`);
    }
    // Tekstin linkin uusi arvo säilyttää avaimen ja vanhan osoitteen (paitsi poistossa).
    for (const op of s.operaatiot) {
      if (op.tyyppi !== "set" || !op.polku.includes(".markDefs[")) continue;
      const vanha = arvoPolussa(s.doc, op.polku) as Record<string, unknown> | undefined;
      const arvo = op.arvo as Record<string, unknown>;
      if (vanha?._key !== arvo._key) virheet.push(`${s.doc._id} ${op.polku}: avain muuttuisi`);
      if (!poistaVanhat && vanha?.href !== arvo.href) virheet.push(`${s.doc._id} ${op.polku}: href muuttuisi`);
      if (vanha?.newTab !== arvo.newTab) virheet.push(`${s.doc._id} ${op.polku}: newTab muuttuisi`);
    }
  }
  return virheet;
}

/* -------------------------------------------------------------------------- */
/* Sivuston kyselyt: linkit ennen ja jälkeen                                  */
/* -------------------------------------------------------------------------- */

type Tekstikentta = { id: string; kentta: string };

/** Julkaistut dokumentit ja niiden ylätason tekstikentät, joiden linkit muuttuvat. */
function tekstikentat(suunnitelmat: Suunnitelma[]): Tekstikentta[] {
  const tulos = new Map<string, Tekstikentta>();
  for (const s of suunnitelmat) {
    if (s.doc._id.startsWith("drafts.")) continue;
    for (const op of s.operaatiot) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)\[_key=="[^"]*"\]\.markDefs\[/.exec(op.polku);
      if (m) tulos.set(`${s.doc._id}|${m[1]}`, { id: s.doc._id, kentta: m[1] });
    }
  }
  return [...tulos.values()];
}

/** Kävijän linkit sivuston omilla kyselyillä (published-näkymä). */
async function sivustonLinkit(client: SanityClient, tekstit: Tekstikentta[]): Promise<Record<string, unknown>> {
  const tulos: Record<string, unknown> = {};

  const nav = await client.fetch<{ items?: Parameters<typeof ratkaiseNavigaatio>[0] } | null>(navigationQuery);
  tulos.valikko = ratkaiseNavigaatio(nav?.items);

  type Etusivu = {
    heroCtas?: (LinkkiData & { label?: string })[] | null;
    blocks?: { _key: string; ctaHref?: string | null; ctaLinkki?: LinkkiData | null }[] | null;
  };
  const etusivu = await client.fetch<Etusivu | null>(etusivuQuery);
  tulos.pikalinkit = ratkaiseLinkit(etusivu?.heroCtas).map((c) => [c.label, c.href]);
  tulos.lohkot = (etusivu?.blocks ?? []).map((b) => [b._key, linkinOsoiteTaiVanha(b.ctaLinkki, b.ctaHref)]);

  type Toiminta = { vuodet?: { _key: string; linkki?: (LinkkiData & { url?: string | null }) | null }[] | null };
  const slugit = await client.fetch<string[]>(
    `*[_type == "klubiToiminta" && defined(slug.current) && count(vuodet[defined(linkki)]) > 0].slug.current`,
  );
  for (const slug of slugit.sort()) {
    const t = await client.fetch<Toiminta | null>(klubiToimintaBySlugQuery, { slug });
    tulos[`klubiToiminta:${slug}`] = (t?.vuodet ?? []).map((v) => [
      v._key,
      v.linkki ? linkinOsoiteTaiVanha(v.linkki, v.linkki.url) : null,
    ]);
  }

  for (const { id, kentta } of tekstit) {
    const arvo = await client.fetch<unknown>(`*[_id == $id][0]{ "arvo": ${kentta}[]{${runko}} }.arvo`, { id });
    tulos[`${id}.${kentta}`] = tekstinLinkit(arvo);
  }
  return tulos;
}

/** Tekstikentän linkit kuten components/portable-text.tsx ne näyttää: markDefin avain → osoite. */
function tekstinLinkit(arvo: unknown): [string, string | null][] {
  const tulos: [string, string | null][] = [];
  for (const lohko of Array.isArray(arvo) ? arvo : []) {
    for (const m of (lohko as { markDefs?: (LinkkiData & { _key: string; _type: string })[] })?.markDefs ?? []) {
      if (m._type === "link") tulos.push([m._key, linkinOsoite(m)]);
    }
  }
  return tulos;
}

function vertaa(ennen: Record<string, unknown>, jalkeen: Record<string, unknown>): string[] {
  const erot: string[] = [];
  for (const avain of new Set([...Object.keys(ennen), ...Object.keys(jalkeen)])) {
    const a = JSON.stringify(ennen[avain] ?? null);
    const b = JSON.stringify(jalkeen[avain] ?? null);
    if (a !== b) erot.push(`${avain}: ${a} → ${b}`);
  }
  return erot;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
