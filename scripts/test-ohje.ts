/**
 * Ylläpito-ohjeen testi (docs/25, kirjoitusohje docs/ohje/README.md).
 *
 * Ajo: npm run test:ohje   (osa `npm test`-ketjua)
 *
 * 1. Yksikkötestit: linkkimuunnokset, markdown → HTML, haku ja tarkistukset
 *    omilla testikorteilla (scripts/fixtures/ohje/, eivät näy Studiossa).
 * 2. docs/ohje/ tarkistetaan:
 *    - frontmatter (pakolliset kentät, uniikit tunnukset, tyypit skeemassa),
 *      tehtäväkortin otsikot ja numeroidut askeleet, vianetsinnän rakenne,
 *      pikaoppaassa tasan viisi tehtävää;
 *    - jokainen lihavointi on Studiossa näkyvä nimi: sanasto kootaan skeemasta,
 *      Studion rakenteesta, koodin merkkijonoista (TypeScript-kääntäjä:
 *      sanity/**, sanity.config.ts, lib/**, esikatselupalkki) ja
 *      @sanity/locale-fi-fi:n suomennoksista. Polut " → " pilkotaan osiin.
 *      Poikkeukset perusteluineen: POIKKEUKSET;
 *    - studio:-linkit (rakenteen tunnukset, tyypit, pohjat, singletonit),
 *      korttilinkit ja ankkurit;
 *    - kuvat: viite ilman frontmatterin kuvatilausta = virhe, puuttuva
 *      kuvatiedosto = VAROITUS (kuvat otetaan erikseen: npm run ohjekuvat);
 *    - henkilötiedot: ei sähköposteja (paitsi @esimerkki.fi), ei tunnuksia;
 *    - generoitu moduuli ja tuloste ovat ajan tasalla (npm run ohje);
 *    - next.config.ts: /studio-ohje/ ei päädy hakukoneisiin.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";

import { createSchema, type Template } from "sanity";
import { createStructureBuilder } from "sanity/structure";
import ts from "typescript";

import nextConfig from "../next.config";
import { OSIOSIVUT, osioSivuId } from "../lib/osiosivut";
import { haeOhjeista, hakusanat, normalisoi } from "../lib/ohje/haku";
import {
  KUVAKANSIO,
  MODUULI,
  PIKAOPAS_TULOSTE,
  TULOSTE,
  TYYPPIMODUULI,
  generoiModuuli,
  generoiTuloste,
  generoiTyyppiModuuli,
  koostaOhje,
  lueKuvaKoot,
  type Koonti,
} from "../lib/ohje/koosta";
import { jasennaKorttiLinkki, jasennaStudioLinkki, kuvanTiedosto, kuvanTunnus } from "../lib/ohje/linkit";
import { VIANETSINNAN_OTSAKKEET, ankkuri, kasitteleKortti, type KasiteltyKortti } from "../lib/ohje/markdown";
import type { OhjeKortti } from "../lib/ohje/tyypit";
import { pohjat } from "../sanity/pohjat";
import { schemaTypes, singletonTypes } from "../sanity/schemas";
import { structure } from "../sanity/structure";

const JUURI = process.cwd();
const FIXTURES = "scripts/fixtures/ohje";

let ok = 0;
async function test(nimi: string, fn: () => void | Promise<void>) {
  await fn();
  ok += 1;
  console.log(`✓ ${nimi}`);
}

/**
 * Lihavoinnit, jotka näkyvät Studiossa mutta eivät tule tämän repon
 * merkkijonoista tai Sanityn suomennoksista. Jokaiselle peruste.
 */
const POIKKEUKSET: { teksti: string; peruste: string }[] = [
  // Esimerkki: { teksti: "Ctrl+Z", peruste: "Näppäinyhdistelmä, ei Studion tekstiä." },
  // Lisää vain, kun nimi todella näkyy ruudulla mutta ei tule koodista eikä suomennoksista
  // (esim. selaimen oma teksti). Väärin kirjoitettu nimi korjataan korttiin.
];

/* ───────────────────────── Sanasto ───────────────────────── */

function tiedostot(kansio: string, paatteet: RegExp, pois: RegExp = /$^/): string[] {
  const polku = join(JUURI, kansio);
  if (!existsSync(polku)) return [];
  const tulos: string[] = [];
  for (const nimi of readdirSync(polku)) {
    const suhteellinen = posix.join(kansio, nimi);
    if (pois.test(suhteellinen)) continue;
    if (statSync(join(JUURI, suhteellinen)).isDirectory()) tulos.push(...tiedostot(suhteellinen, paatteet, pois));
    else if (paatteet.test(nimi)) tulos.push(suhteellinen);
  }
  return tulos;
}

function siisti(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Studion nimi ilman loppuvälimerkkiä ja lainausmerkkejä vertailua varten. */
function vertailumuoto(s: string): string {
  return siisti(s)
    .replace(/^["'“”«»]+|["'“”«»]+$/g, "")
    .replace(/[:.…]+$/, "")
    .trim();
}

type Sanasto = { sanat: Set<string>; kuviot: RegExp[] };

function lisaaKuvio(sanasto: Sanasto, osat: string[]) {
  const siistit = osat.map((o) => o.replace(/\s+/g, " "));
  siistit[0] = siistit[0].replace(/^\s*["'“”«»]*/, "");
  siistit[siistit.length - 1] = siistit[siistit.length - 1].replace(/["'“”«»]*[:.…]*\s*$/, "");
  // Vähintään viisi kiinteää kirjainta: pelkkä "{{count}}" tai "Uusi ${x}" ei saa hyväksyä mitä tahansa.
  if (siistit.join("").replace(/[\s\p{P}]/gu, "").length < 5) return;
  const lahde = siistit.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  sanasto.kuviot.push(new RegExp(`^${lahde.join(".+?")}$`, "u"));
}

function lisaa(sanasto: Sanasto, teksti: string) {
  const s = vertailumuoto(teksti);
  if (s) sanasto.sanat.add(s);
}

/** Merkkijonot TypeScript-kääntäjällä: literaalit, JSX-teksti ja mallijonot kuvioina. */
function lisaaKoodista(sanasto: Sanasto, tiedosto: string) {
  const lahde = readFileSync(join(JUURI, tiedosto), "utf8");
  const kind = tiedosto.endsWith("x")
    ? ts.ScriptKind.TSX
    : tiedosto.endsWith(".js")
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(tiedosto, lahde, ts.ScriptTarget.Latest, false, kind);
  const kay = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      lisaa(sanasto, n.text);
      if (/\{\{[^}]+\}\}|<\/?[A-Za-z]+>/.test(n.text)) {
        // Suomennosten muuttujat ({{count}}) ja korostukset (<strong>…</strong>).
        lisaaKuvio(sanasto, n.text.replace(/<\/?[A-Za-z]+>/g, "").split(/\{\{[^}]+\}\}/));
        lisaa(sanasto, n.text.replace(/<\/?[A-Za-z]+>/g, ""));
      }
    } else if (ts.isTemplateExpression(n)) {
      lisaaKuvio(sanasto, [n.head.text, ...n.templateSpans.map((s) => s.literal.text)]);
    } else if (ts.isJsxText(n)) {
      lisaa(sanasto, n.text);
    }
    ts.forEachChild(n, kay);
  };
  kay(sf);
}

function kokoaSanasto(sarjallistettu: SarjaRakenne): Sanasto {
  const sanasto: Sanasto = { sanat: new Set(), kuviot: [] };
  const koodi = [
    ...tiedostot("sanity", /\.(ts|tsx)$/, /^sanity\/(ohje\/.*\.generated\.ts|sanity\.types\.ts)$/),
    "sanity.config.ts",
    ...tiedostot("lib", /\.ts$/, /^lib\/ohje(\/|$)/),
    "components/esikatselu-palkki.tsx",
  ];
  for (const t of koodi) if (existsSync(join(JUURI, t))) lisaaKoodista(sanasto, t);
  // Sanityn suomennokset (Julkaise, Hylkää muutokset, Historia …).
  for (const t of tiedostot("node_modules/@sanity/locale-fi-fi/dist", /\.js$/)) lisaaKoodista(sanasto, t);
  // Skeeman otsikot (myös lasketut: kentät, ryhmät, kenttäryhmät, options.list).
  const kayArvo = (arvo: unknown, syvyys = 0) => {
    if (syvyys > 30 || !arvo || typeof arvo !== "object") return;
    if (Array.isArray(arvo)) return arvo.forEach((a) => kayArvo(a, syvyys + 1));
    for (const [k, v] of Object.entries(arvo)) {
      if ((k === "title" || k === "description") && typeof v === "string") lisaa(sanasto, v);
      else if (typeof v === "object") kayArvo(v, syvyys + 1);
    }
  };
  kayArvo(schemaTypes);
  // Studion rakenne (lasketut otsikot, esim. "Tilastot: tarkistettavat").
  const kayRakenne = (n: SarjaRakenne) => {
    if (n.title) lisaa(sanasto, n.title);
    for (const i of n.items ?? []) {
      if (i.title) lisaa(sanasto, i.title);
      if (i.child) kayRakenne(i.child);
    }
  };
  kayRakenne(sarjallistettu);
  for (const p of POIKKEUKSET) lisaa(sanasto, p.teksti);
  return sanasto;
}

function onSanastossa(sanasto: Sanasto, nimi: string): boolean {
  const v = vertailumuoto(nimi);
  return !v || sanasto.sanat.has(v) || sanasto.kuviot.some((k) => k.test(v));
}

/** Lihavoinnin osat: polku nuolilla pilkotaan. */
function lihavoinninOsat(teksti: string): string[] {
  return teksti
    .split(/\s*→\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ───────────────────────── Studion rakenne ───────────────────────── */

type SarjaRakenne = { id?: string; title?: string; type?: string; items?: SarjaKohta[] };
type SarjaKohta = { id: string; title?: string; type?: string; child?: SarjaRakenne };

function documentTyypit(): string[] {
  return schemaTypes.filter((t) => t.type === "document").map((t) => t.name);
}

function kaikkiPohjat(): Template[] {
  const oletukset = documentTyypit().map((t) => ({ id: t, schemaType: t, title: t, value: {} }) as Template);
  return pohjat(oletukset);
}

/** Studion rakenne sarjallistettuna (oikea StructureBuilder, kevyt lähde). */
function sarjallistaRakenne(): SarjaRakenne {
  const schema = createSchema({ name: "ohje-testi", types: schemaTypes });
  const lahde = {
    projectId: "testi",
    dataset: "testi",
    schema,
    currentUser: null,
    getClient: () => ({}),
    i18n: { t: (k: string) => k },
    templates: kaikkiPohjat(),
    document: { resolveNewDocumentOptions: () => [] },
  };
  const varoitus = console.warn;
  console.warn = () => {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const S = createStructureBuilder({ source: lahde, perspectiveStack: [] } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const juuri = (structure as any)(S, lahde);
    const sarja = juuri.serialize({ path: [] }) as SarjaRakenne;
    const siivoa = (n: SarjaRakenne): SarjaRakenne => ({
      id: n.id,
      title: n.title,
      type: n.type,
      items: (n.items ?? [])
        .filter((i) => i && i.type !== "divider")
        .map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          child:
            i.child && typeof i.child === "object" && i.child.type === "list"
              ? siivoa(i.child)
              : i.child && typeof i.child === "object"
                ? { id: i.child.id, title: i.child.title, type: i.child.type }
                : undefined,
        })),
    });
    return siivoa(sarja);
  } finally {
    console.warn = varoitus;
  }
}

/* ───────────────────────── Tarkistukset ───────────────────────── */

type Tulos = { virheet: string[]; varoitukset: string[] };

const TEHTAVAN_OTSIKOT = [
  "Milloin",
  "Ennen kuin aloitat",
  "Askeleet",
  "Tulos",
  "Lisävalinnat",
  "Jos jokin menee vikaan",
];
const TEHTAVAN_PAKOLLISET = ["Milloin", "Askeleet", "Tulos", "Jos jokin menee vikaan"];

const SAHKOPOSTI = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const KIELLETYT = [/veikkope/i];

type Ymparisto = {
  sanasto: Sanasto;
  rakenne: SarjaRakenne;
  pohjat: Template[];
  tyypit: Set<string>;
};

function tarkistaStudioLinkki(href: string, y: Ymparisto): string | null {
  const l = jasennaStudioLinkki(href);
  if ("virhe" in l) return l.virhe;
  if (l.laji === "rakenne") {
    let taso: SarjaRakenne | undefined = y.rakenne;
    for (const [i, osa] of l.osat.entries()) {
      const kohta: SarjaKohta | undefined = taso?.items?.find((k) => k.id === osa);
      if (!kohta) {
        const vaihtoehdot = (taso?.items ?? []).map((k) => k.id).join(", ");
        return `${href}: rakenteessa ei ole kohtaa "${osa}" (tällä tasolla: ${vaihtoehdot || "ei alakohtia"})`;
      }
      taso = i < l.osat.length - 1 ? (kohta.child?.type === "list" ? kohta.child : undefined) : undefined;
      if (i < l.osat.length - 1 && !taso) return `${href}: kohdan "${osa}" alla ei ole valikkoa`;
    }
    return null;
  }
  if (l.laji === "luo") {
    if (!y.pohjat.some((p) => p.id === l.tyyppi && p.schemaType === l.tyyppi)) {
      return `${href}: tyyppiä "${l.tyyppi}" ei voi luoda (ei dokumenttityyppi, singleton tai ajastuksen tyyppi)`;
    }
    if (l.pohja) {
      const p = y.pohjat.find((t) => t.id === l.pohja);
      if (!p) return `${href}: pohjaa "${l.pohja}" ei ole (sanity/pohjat.ts)`;
      if (p.schemaType !== l.tyyppi) return `${href}: pohja "${l.pohja}" on tyypille ${p.schemaType}`;
      if (p.parameters?.length) return `${href}: pohja "${l.pohja}" tarvitsee parametrin; linkitä rakenteen kohtaan`;
    }
    return null;
  }
  if (l.laji === "muokkaa") {
    const sallitut = new Set([...singletonTypes, ...OSIOSIVUT.map((o) => osioSivuId(o.slug))]);
    return sallitut.has(l.id)
      ? null
      : `${href}: muokkaa-linkki vain singletoneihin ja osioiden sivuihin (${[...singletonTypes].join(", ")})`;
  }
  return null;
}

function tarkistaKortti(k: KasiteltyKortti, koonti: Koonti, y: Ymparisto, t: Tulos) {
  const kohde = k.tiedosto;
  const virhe = (s: string) => t.virheet.push(`${kohde}: ${s}`);
  const varoitus = (s: string) => t.varoitukset.push(`${kohde}: ${s}`);
  for (const v of k.virheet) virhe(v);

  // Tyypit skeemassa.
  for (const tyyppi of k.kortti.tyypit) if (!y.tyypit.has(tyyppi)) virhe(`tyypit: "${tyyppi}" ei ole dokumenttityyppi`);

  // Ei omaa #-otsikkoa: otsikko tulee frontmatterista.
  if (k.kortti.otsikot.some((o) => o.taso === 1))
    virhe("#-otsikko: kortin otsikko tulee frontmatterista (otsikko:), ei #-riviä");

  // Muoto.
  const h2 = k.osat.filter((o) => o.taso === 2);
  if (k.muoto === "tehtava") {
    const nimet = h2.map((o) => o.teksti);
    for (const n of nimet)
      if (!TEHTAVAN_OTSIKOT.includes(n))
        virhe(`tehtäväkortin otsikko "## ${n}" ei kuulu rakenteeseen (${TEHTAVAN_OTSIKOT.join(", ")})`);
    for (const p of TEHTAVAN_PAKOLLISET) if (!nimet.includes(p)) virhe(`tehtäväkortista puuttuu "## ${p}"`);
    const jarjestys = nimet.filter((n) => TEHTAVAN_OTSIKOT.includes(n)).map((n) => TEHTAVAN_OTSIKOT.indexOf(n));
    if (jarjestys.some((v, i) => i > 0 && v <= jarjestys[i - 1]))
      virhe(`tehtäväkortin otsikot väärässä järjestyksessä: ${nimet.join(" → ")}`);
    const askeleet = h2.find((o) => o.teksti === "Askeleet");
    if (askeleet && askeleet.numeroituja === 0) virhe("Askeleet: numeroitu lista puuttuu (1. 2. 3.)");
    if (!k.kortti.kesto) varoitus("tehtäväkortista puuttuu kesto (esim. noin 5 minuuttia)");
  } else if (k.muoto === "vianetsinta") {
    const otsakkeet = k.lihavoinnit
      .map((l) => l.teksti)
      .filter((s) => (VIANETSINNAN_OTSAKKEET as readonly string[]).includes(s));
    const puuttuvat = VIANETSINNAN_OTSAKKEET.filter((o) => !otsakkeet.includes(o));
    if (puuttuvat.length) virhe(`vianetsintäkortista puuttuu ${puuttuvat.map((p) => `**${p}**`).join(", ")}`);
    else if (VIANETSINNAN_OTSAKKEET.some((o, i) => otsakkeet.indexOf(o) !== i))
      virhe(`vianetsinnän järjestys: ${VIANETSINNAN_OTSAKKEET.join(" · ")}`);
    if (!k.kortti.html.includes("<ol")) virhe("vianetsintä: **Näin korjaat:** -kohdasta puuttuu numeroitu lista");
  } else if (k.muoto === "pikaopas") {
    const tehtavat = k.osat.find((o) => o.taso <= 3 && /teht[äa]v/i.test(o.teksti));
    if (!tehtavat) virhe('pikaopas: otsikko "Viisi yleisintä tehtävää" puuttuu');
    else {
      const maara = tehtavat.taulukonRivit || tehtavat.listanKohdat || tehtavat.alaotsikot;
      if (maara !== 5) virhe(`pikaopas: tehtäviä on ${maara}, pitää olla tasan 5`);
    }
  }

  // Lihavoinnit sanastoa vasten.
  for (const l of k.lihavoinnit) {
    if (l.otsake || (VIANETSINNAN_OTSAKKEET as readonly string[]).includes(l.teksti)) continue;
    for (const osa of lihavoinninOsat(l.teksti)) {
      if (!onSanastossa(y.sanasto, osa)) {
        virhe(
          `lihavointi **${osa}**${osa !== l.teksti ? ` (polussa **${l.teksti}**)` : ""} ei ole Studion nimi. Korjaa ruudun mukaan tai poista lihavointi.`,
        );
      }
    }
  }

  // Linkit.
  const kortitIdlla = new Map(koonti.kasitellyt.map((c) => [c.kortti.id, c]));
  for (const { href } of k.linkit) {
    if (href.startsWith("studio:")) {
      const v = tarkistaStudioLinkki(href, y);
      if (v) virhe(`linkki ${v}`);
      continue;
    }
    const kortti = jasennaKorttiLinkki(href);
    if (kortti) {
      const kohdePolku = posix.normalize(posix.join(posix.dirname(kohde), kortti.suhteellinen));
      const kohdeKortti = koonti.kasitellyt.find((c) => c.tiedosto === kohdePolku);
      if (!kohdeKortti) {
        const samaId = kortitIdlla.get(kortti.id);
        virhe(
          `linkki ${href}: korttia ${kohdePolku} ei ole${samaId ? ` (tarkoititko ${posix.relative(posix.dirname(kohde), samaId.tiedosto)}?)` : ""}`,
        );
      } else {
        const kohta = kortti.ankkuri;
        if (kohta && !kohdeKortti.kortti.otsikot.some((o) => o.id === `${kohdeKortti.kortti.id}--${ankkuri(kohta)}`)) {
          virhe(`linkki ${href}: kortissa ei ole otsikkoa #${kohta}`);
        }
      }
      continue;
    }
    if (/^https:\/\//.test(href) || /^mailto:/.test(href)) continue;
    if (/^http:\/\//.test(href)) {
      varoitus(`linkki ${href}: käytä https://`);
      continue;
    }
    virhe(`linkki ${href}: sallittuja ovat korttilinkki (../osio/kortti.md), studio:… ja https://…`);
  }

  // Kuvat.
  const tilatut = new Set(k.kuvatilaukset.map((c) => c.id));
  const viitatut = new Set<string>();
  for (const { src, alt } of k.kuvat) {
    const tiedosto = kuvanTiedosto(src);
    if (!tiedosto) {
      virhe(`kuva ${src}: polku on muotoa ../../public/studio-ohje/<id>.webp`);
      continue;
    }
    const tunnus = kuvanTunnus(tiedosto);
    viitatut.add(tunnus);
    // Polun alku on sopimuksen mukaan ../../public/studio-ohje/ (README); vain loppu ratkaisee.
    if (!/^(\.\.\/)+public\/studio-ohje\//.test(src))
      virhe(`kuva ${src}: polku on muotoa ../../public/studio-ohje/${tiedosto}`);
    if (!tilatut.has(tunnus))
      virhe(`kuva ${tiedosto}: frontmatterin kuvat-listassa ei ole id:tä "${tunnus}" (kuvatilaus puuttuu)`);
    if (!alt.trim()) virhe(`kuva ${tiedosto}: alt-teksti puuttuu`);
    else if (alt.length > 155) virhe(`kuva ${tiedosto}: alt-teksti on ${alt.length} merkkiä (enintään 155)`);
    if (!existsSync(join(JUURI, KUVAKANSIO, tiedosto)))
      varoitus(`kuvaa ${KUVAKANSIO}/${tiedosto} ei vielä ole (npm run ohjekuvat)`);
  }
  for (const c of k.kuvatilaukset) {
    if (!viitatut.has(c.id)) varoitus(`kuvatilaus "${c.id}": tekstissä ei ole viitettä ![…](…/${c.id}.webp)`);
    if (typeof c.avaa === "string") {
      const v = c.avaa.startsWith("studio:") ? tarkistaStudioLinkki(c.avaa, y) : `avaa on studio:-linkki`;
      if (v) virhe(`kuvatilaus "${c.id}": ${v}`);
    }
  }

  // Henkilötiedot (repo on julkinen).
  for (const osoite of k.lahde.match(SAHKOPOSTI) ?? []) {
    if (!/@esimerkki\.fi$/i.test(osoite)) virhe(`sähköpostiosoite ${osoite}: käytä vain @esimerkki.fi -osoitteita`);
  }
  for (const kielletty of KIELLETYT)
    if (kielletty.test(k.lahde)) virhe(`henkilön tunnus (${kielletty.source}) ei kuulu ohjeeseen`);
}

function tarkistaKoonti(koonti: Koonti, lahde: string, y: Ymparisto): Tulos {
  const t: Tulos = { virheet: [], varoitukset: [] };
  for (const f of koonti.tuntemattomat)
    t.virheet.push(`${f}: ei kuulu mihinkään osioon (kansiot: docs/ohje/README.md)`);
  for (const f of koonti.ohitetut) t.virheet.push(`${f}: kortti jäi pois ohjeesta, koska otsikko puuttuu`);
  const idt = new Map<string, string[]>();
  for (const k of koonti.kasitellyt) idt.set(k.kortti.id, [...(idt.get(k.kortti.id) ?? []), k.tiedosto]);
  for (const [id, polut] of idt)
    if (polut.length > 1) t.virheet.push(`kortin tunnus "${id}" toistuu: ${polut.join(", ")}`);
  const kuvaIdt = new Map<string, string[]>();
  for (const k of koonti.kasitellyt)
    for (const c of k.kuvatilaukset) kuvaIdt.set(c.id, [...(kuvaIdt.get(c.id) ?? []), k.tiedosto]);
  for (const [id, polut] of kuvaIdt)
    if (polut.length > 1) t.virheet.push(`kuvan id "${id}" toistuu: ${polut.join(", ")}`);
  if (koonti.kasitellyt.length && !koonti.kasitellyt.some((k) => k.kortti.osio === "pikaopas")) {
    t.varoitukset.push(`${lahde}/pikaopas.md puuttuu`);
  }
  for (const k of koonti.kasitellyt) tarkistaKortti(k, koonti, y, t);
  return t;
}

/* ───────────────────────── Ajo ───────────────────────── */

async function main() {
  const rakenne = sarjallistaRakenne();
  const y: Ymparisto = {
    sanasto: kokoaSanasto(rakenne),
    rakenne,
    pohjat: kaikkiPohjat(),
    tyypit: new Set(documentTyypit()),
  };

  await test("studio:-linkit muunnetaan Studion osoitteiksi", () => {
    const polku = (h: string) => {
      const l = jasennaStudioLinkki(h);
      assert.ok(!("virhe" in l), h);
      return l.polku;
    };
    assert.equal(polku("studio:rakenne/jalkapalloarkisto/tilastot"), "/studio/structure/jalkapalloarkisto;tilastot");
    assert.equal(polku("studio:rakenne"), "/studio/structure");
    assert.equal(polku("studio:luo/uutinen"), "/studio/intent/create/type=uutinen");
    assert.equal(
      polku("studio:luo/uutinen?pohja=uutinen-vuosikokous"),
      "/studio/intent/create/template=uutinen-vuosikokous;type=uutinen",
    );
    assert.equal(polku("studio:muokkaa/etusivu"), "/studio/intent/edit/id=etusivu");
    assert.equal(polku("studio:aloitus"), "/studio/aloitus");
    for (const huono of [
      "studio:",
      "studio:luo",
      "studio:luo/uutinen?tyyppi=x",
      "studio:muokkaa",
      "studio:rakenne/a b",
      "studio:avaa/x",
    ]) {
      assert.ok("virhe" in jasennaStudioLinkki(huono), huono);
    }
  });

  await test("studio:-linkit tarkistetaan Studion rakennetta, tyyppejä ja pohjia vasten", () => {
    for (const hyva of [
      "studio:rakenne/jalkapalloarkisto/tilastot/tilastot-huuhkajat",
      "studio:rakenne/tehtavat/julkaisemattomat",
      "studio:rakenne/asetukset/etusivu",
      "studio:rakenne/klubi/hallitus/entiset",
      "studio:rakenne/ravintolat/arvosanat/arvosanat-ravintoloittain",
      "studio:luo/uutinen?pohja=uutinen-vuosikokous",
      "studio:luo/ottelu",
      "studio:muokkaa/etusivu",
      "studio:muokkaa/sivu-klubi",
    ]) {
      assert.equal(tarkistaStudioLinkki(hyva, y), null, hyva);
    }
    for (const huono of [
      "studio:rakenne/jalkapalloarkistoo",
      "studio:rakenne/uutiset/jotain", // Uutiset on dokumenttilista, ei valikko
      "studio:luo/etusivu", // singleton
      "studio:luo/varmuuskopio", // ajastuksen tyyppi
      "studio:luo/uutinen?pohja=olematon",
      "studio:luo/ottelu?pohja=uutinen-vuosikokous",
      "studio:luo/sivu?pohja=lukittu-sivu", // tarvitsee parametrin
      "studio:muokkaa/drafts.x",
      "studio:muokkaa/jokin-uutinen",
    ]) {
      assert.notEqual(tarkistaStudioLinkki(huono, y), null, huono);
    }
  });

  await test("kuvien koot kuvaskriptin kuvat.json-tiedostosta (CSS-pikseleinä)", () => {
    assert.deepEqual(lueKuvaKoot(JUURI, "scripts/fixtures/ohje-kuvat.json"), {
      "testiuutinen-01-lista.webp": { width: 1280, height: 800 },
      "muu.png": { width: 300, height: 200 },
    });
    assert.deepEqual(lueKuvaKoot(JUURI, "scripts/fixtures/olematon.json"), {});
  });

  await test("korttilinkit ja kuvapolut", () => {
    assert.deepEqual(jasennaKorttiLinkki("../uutiset/ajasta-uutinen.md"), {
      id: "ajasta-uutinen",
      ankkuri: null,
      suhteellinen: "../uutiset/ajasta-uutinen.md",
    });
    assert.deepEqual(jasennaKorttiLinkki("arkisto/x.md#askeleet"), {
      id: "x",
      ankkuri: "askeleet",
      suhteellinen: "arkisto/x.md",
    });
    assert.equal(jasennaKorttiLinkki("https://example.com/x.md"), null);
    assert.equal(jasennaKorttiLinkki("studio:rakenne"), null);
    assert.equal(kuvanTiedosto("../../public/studio-ohje/a-01.webp"), "a-01.webp");
    assert.equal(kuvanTiedosto("../kuvat/a.webp"), null);
  });

  const fixtures = koostaOhje(JUURI, FIXTURES, { "testiuutinen-01-lista.webp": { width: 1280, height: 800 } });
  const uutinen = fixtures.kasitellyt.find((k) => k.kortti.id === "kirjoita-testiuutinen")!;

  await test("markdown → Studion HTML (linkit, kuvat, huomautukset, ankkurit, ei raakaa HTML:ää)", () => {
    const h = uutinen.kortti.html;
    assert.match(h, /<h2 id="kirjoita-testiuutinen--askeleet">Askeleet<\/h2>/);
    assert.match(h, /<a href="\/studio\/structure\/uutiset" data-ohje-studio="1">/);
    assert.match(h, /href="\/studio\/intent\/create\/template=uutinen-vuosikokous;type=uutinen"/);
    assert.match(h, /<a href="\/studio\/ohjeet\/pikaopas" data-ohje-kortti="pikaopas">/);
    assert.match(h, /data-ohje-kortti="muutos-ei-nay-testi"/);
    assert.match(
      h,
      /<img class="ohje-kuva" src="\/studio-ohje\/testiuutinen-01-lista\.webp" alt="Studion valikko\. 1: Uutiset\." width="1280" height="800"/,
    );
    assert.match(h, /<button type="button" class="ohje-kuvanappi"/);
    assert.match(h, /<p class="markdown-alert-title">Vinkki<\/p>/);
    assert.match(h, /<p class="markdown-alert-title">Varoitus<\/p>/);
    assert.match(h, /target="_blank" rel="noopener noreferrer"/);
    assert.ok(!h.includes("<script>"), "raaka HTML escapataan");
    assert.match(h, /&lt;script&gt;/);
    assert.equal(uutinen.kortti.kesto, "noin 5 minuuttia");
    assert.deepEqual(uutinen.kortti.tyypit, ["uutinen", "uutisKategoria"]);
    assert.ok(uutinen.kortti.teksti.includes("Vasemmasta valikosta valitse Uutiset"));
    assert.ok(
      !uutinen.kortti.teksti.includes("<strong") && !uutinen.kortti.teksti.includes("<li"),
      "teksti ilman tageja",
    );
  });

  await test("markdown → tuloste (sivuston osoitteet, kortin ankkuri, kuva tulosteen vieressä)", () => {
    const h = uutinen.tulosteHtml;
    assert.match(h, /href="https:\/\/www\.lahdensuomalainenklubi\.com\/studio\/structure\/uutiset"/);
    assert.match(h, /href="#kortti-pikaopas"/);
    assert.match(h, /<img class="ohje-kuva" src="testiuutinen-01-lista\.webp"/);
    assert.ok(!h.includes("ohje-kuvanappi"));
    const tuloste = generoiTuloste(fixtures);
    assert.match(tuloste, /<section class="kortti" id="kortti-kirjoita-testiuutinen">/);
    assert.match(tuloste, /<nav class="sisallys"/);
    assert.match(tuloste, /@page \{ size: A4;/);
    const pika = generoiTuloste(fixtures, true);
    assert.ok(pika.includes('id="kortti-pikaopas"') && !pika.includes('id="kortti-kirjoita-testiuutinen"'));
  });

  await test("koonti: osiot järjestyksessä, kortit järjestyksen mukaan, versio sisällöstä", () => {
    assert.deepEqual(
      fixtures.sisalto.osiot.map((o) => o.id),
      ["pikaopas", "uutiset", "vianetsinta"],
    );
    assert.equal(fixtures.sisalto.osiot[1].otsikko, "Uutiset");
    assert.equal(fixtures.sisalto.osiot[2].otsikko, "Vianetsintä");
    const uudelleen = koostaOhje(JUURI, FIXTURES, { "testiuutinen-01-lista.webp": { width: 1280, height: 800 } });
    assert.equal(uudelleen.sisalto.versio, fixtures.sisalto.versio);
    assert.match(generoiModuuli(fixtures.sisalto), /export const OHJE: OhjeSisalto = /);
    assert.match(generoiTyyppiModuuli(fixtures.sisalto), /"uutisKategoria": \[\n\s+"kirjoita-testiuutinen"\n\s+\]/);
    // Tyhjä lähde ei kaada koostajaa.
    const tyhja = koostaOhje(JUURI, "scripts/fixtures/olematon-kansio");
    assert.deepEqual(tyhja.sisalto.osiot, []);
    assert.match(generoiTuloste(tyhja), /Ohjeessa ei ole vielä kortteja/);
  });

  await test("testikortit läpäisevät kaikki tarkistukset", () => {
    const t = tarkistaKoonti(fixtures, FIXTURES, y);
    assert.deepEqual(t.virheet, []);
    assert.ok(
      t.varoitukset.every((v) => v.includes("ei vielä ole")),
      t.varoitukset.join("\n"),
    );
  });

  await test("tarkistukset löytävät virheet", () => {
    const kortti = (
      lahde: string,
      tiedosto = `${FIXTURES}/uutiset/rikki.md`,
      osio = { id: "uutiset", muoto: "tehtava" as const },
    ) => kasitteleKortti(lahde, tiedosto, osio);
    const rikki = kortti(`---
otsikko: Rikki
jarjestys: 10
tyypit: [eiOle]
kuvat:
  - id: tilattu
    avaa: studio:rakenne/eiOle
paivitetty: 2026-10-08
---
# Oma otsikko

## Askeleet

Ei numeroitua listaa. **Julkaisee** ja **Uutiset → Eioo**.
![Kuva](../../public/studio-ohje/tilaamaton.webp)
[x](studio:luo/etusivu) [y](../olematon/x.md) [z](jotain.html)
Ota yhteyttä: matti@example.com tai veikkope.

## Ylimääräinen
`);
    const koonti: Koonti = {
      ...fixtures,
      kasitellyt: [...fixtures.kasitellyt, rikki],
      tuntemattomat: [],
      ohitetut: [],
    };
    const t: Tulos = { virheet: [], varoitukset: [] };
    tarkistaKortti(rikki, koonti, y, t);
    const kaikki = t.virheet.join("\n");
    for (const odotettu of [
      'tyypit: "eiOle"',
      "#-otsikko",
      'puuttuu "## Milloin"',
      'puuttuu "## Tulos"',
      '"## Ylimääräinen" ei kuulu',
      "Askeleet: numeroitu lista puuttuu",
      "**Julkaisee** ei ole Studion nimi",
      "**Eioo** (polussa **Uutiset → Eioo**)",
      "kuvatilaus puuttuu",
      'kuvatilaus "tilattu": studio:rakenne/eiOle',
      "studio:luo/etusivu",
      "../olematon/x.md",
      "jotain.html",
      "matti@example.com",
      "veikkope",
    ]) {
      assert.ok(kaikki.includes(odotettu), `odotettiin virhettä "${odotettu}":\n${kaikki}`);
    }
    assert.ok(!kaikki.includes("**Uutiset**"), "polun ensimmäinen osa on oikea nimi");

    const vika = kasitteleKortti(
      `---\notsikko: Vika\njarjestys: 10\npaivitetty: 2026-10-08\n---\n**Mitä näet:** x\n\n**Näin korjaat:** tee näin.\n`,
      `${FIXTURES}/vianetsinta/vika.md`,
      { id: "vianetsinta", muoto: "vianetsinta" },
    );
    const tv: Tulos = { virheet: [], varoitukset: [] };
    tarkistaKortti(vika, { ...fixtures, kasitellyt: [...fixtures.kasitellyt, vika] }, y, tv);
    assert.ok(
      tv.virheet.some((v) => v.includes("**Miksi:**") && v.includes("**Ei auttanut?**")),
      tv.virheet.join("\n"),
    );
    assert.ok(
      tv.virheet.some((v) => v.includes("numeroitu lista")),
      tv.virheet.join("\n"),
    );

    const pika = kasitteleKortti(
      `---\notsikko: P\njarjestys: 0\npaivitetty: 2026-10-08\n---\n## Viisi yleisintä tehtävää\n\n| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n`,
      `${FIXTURES}/pikaopas.md`,
      { id: "pikaopas", muoto: "pikaopas" },
    );
    const tp: Tulos = { virheet: [], varoitukset: [] };
    tarkistaKortti(pika, fixtures, y, tp);
    assert.ok(
      tp.virheet.some((v) => v.includes("tehtäviä on 2, pitää olla tasan 5")),
      tp.virheet.join("\n"),
    );

    const ilman = kasitteleKortti("Ei frontmatteria", `${FIXTURES}/uutiset/ilman.md`, {
      id: "uutiset",
      muoto: "tehtava",
    });
    assert.ok(ilman.virheet.some((v) => v.includes("frontmatter puuttuu")));
    const huonoNimi = kasitteleKortti(
      "---\notsikko: x\njarjestys: 1\npaivitetty: 2026-10-08\n---\n",
      `${FIXTURES}/uutiset/Väärä_Nimi.md`,
      { id: "uutiset", muoto: "vapaa" },
    );
    assert.ok(huonoNimi.virheet.some((v) => v.includes("tiedostonimi")));
  });

  await test("sanasto: skeema, rakenne, koodi ja Sanityn suomennokset", () => {
    for (const nimi of [
      "Julkaise", // locale
      "Hylkää muutokset", // locale
      "Tiivistelmä jutun alussa (valinnainen)", // skeema
      "Tehtävät sinulle", // rakenne
      "Arvostelut odottavat hyväksyntää", // tehtävärekisteri
      "Huuhkajat", // tilastoryhmä (lib)
      "Tilastot: tarkistettavat", // laskettu otsikko
      "Kopioi pohjaksi", // oma toiminto
      "Vuosikokouskutsu", // pohja
      "Poistu esikatselusta", // esikatselupalkki
      "Käytetty 3 sivulla", // suomennoksen {{count}}
      "Nykyinen osoite:", // loppukaksoispiste ei haittaa
    ]) {
      assert.ok(onSanastossa(y.sanasto, nimi), nimi);
    }
    for (const nimi of ["Julkaisee", "Tallenna nyt", "Huuhkaja", "Uusi rivi"])
      assert.ok(!onSanastossa(y.sanasto, nimi), nimi);
    assert.deepEqual(lihavoinninOsat("Klubi → Hallitus → Entiset jäsenet"), ["Klubi", "Hallitus", "Entiset jäsenet"]);
    for (const p of POIKKEUKSET) assert.ok(p.peruste.length > 10, `poikkeuksella "${p.teksti}" on peruste`);
  });

  await test("haku: väljä ä/a ja ö/o, kaikki sanat, pisteytys otsikko > avainsanat > teksti", () => {
    assert.equal(normalisoi("Päivitä Öljy Åland"), "paivita oljy aland");
    assert.equal(normalisoi("Ä!").length, 2);
    assert.deepEqual(hakusanat("  Julkaise,  uutinen "), ["julkaise", "uutinen"]);
    const kortti = (id: string, otsikko: string, avainsanat: string[], teksti: string): OhjeKortti => ({
      id,
      otsikko,
      osio: "uutiset",
      avainsanat,
      tyypit: [],
      kesto: null,
      paivitetty: null,
      html: "",
      teksti,
      otsikot: [],
    });
    const kortit = [
      kortti("a", "Päivitä tilastotaulukko", ["tilasto"], "Avaa taulukko."),
      kortti("b", "Kirjoita uutinen", ["juttu", "tilasto"], "Uutinen julkaistaan."),
      kortti("c", "Varmuuskopiot", [], "Joskus tilastotaulukko katoaa, palauta se."),
    ];
    assert.deepEqual(
      haeOhjeista(kortit, "").map((t) => t.kortti.id),
      [],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "tilastotaulukko").map((t) => t.kortti.id),
      ["a", "c"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "paivita").map((t) => t.kortti.id),
      ["a"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "PÄIVITÄ").map((t) => t.kortti.id),
      ["a"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "taulukko").map((t) => t.kortti.id),
      ["a", "c"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "tilasto").map((t) => t.kortti.id),
      ["a", "b", "c"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "tilasto juttu").map((t) => t.kortti.id),
      ["b"],
    );
    assert.deepEqual(
      haeOhjeista(kortit, "olematon").map((t) => t.kortti.id),
      [],
    );
    // Taivutus: vartalo ilman kahta viimeistä kirjainta, puolet pisteistä.
    assert.deepEqual(haeOhjeista(kortit, "julkaisu").map((t) => t.kortti.id), ["b"]);
    assert.deepEqual(haeOhjeista(kortit, "tilastoja").map((t) => t.kortti.id), ["a", "b", "c"]);
    const [c] = haeOhjeista(kortit, "palauta");
    assert.match(c.ote, /palauta/);
  });

  await test("next.config.ts: /studio-ohje/ ei hakukoneisiin", async () => {
    const otsakkeet = (await nextConfig.headers?.()) ?? [];
    const ohje = otsakkeet.find((h) => h.source === "/studio-ohje/:path*" && !h.has);
    assert.ok(ohje, "header /studio-ohje/:path* puuttuu");
    assert.ok(ohje.headers.some((h) => h.key === "X-Robots-Tag" && /noindex/.test(h.value)));
  });

  // docs/ohje
  const koonti = koostaOhje(JUURI);
  const tulos = tarkistaKoonti(koonti, "docs/ohje", y);
  // Generoitu moduuli ja tuloste ajan tasalla (npm run ohje).
  for (const [tiedosto, odotettu] of [
    [MODUULI, generoiModuuli(koonti.sisalto)],
    [TYYPPIMODUULI, generoiTyyppiModuuli(koonti.sisalto)],
    [TULOSTE, generoiTuloste(koonti)],
    [PIKAOPAS_TULOSTE, generoiTuloste(koonti, true)],
  ] as const) {
    const polku = join(JUURI, tiedosto);
    if (!existsSync(polku)) tulos.virheet.push(`${tiedosto} puuttuu: aja npm run ohje`);
    else if (readFileSync(polku, "utf8") !== odotettu)
      tulos.virheet.push(`${tiedosto} on vanhentunut: aja npm run ohje`);
  }
  // Henkilötiedot myös kortin ulkopuolisista tiedostoista (README, kuvamanifestit docs/ohje-kansiossa).
  for (const f of tiedostot("docs/ohje", /\.(md|ya?ml|json)$/)) {
    if (koonti.kasitellyt.some((k) => k.tiedosto === f)) continue;
    const s = readFileSync(join(JUURI, f), "utf8");
    for (const osoite of s.match(SAHKOPOSTI) ?? [])
      if (!/@esimerkki\.fi$/i.test(osoite)) tulos.virheet.push(`${f}: sähköpostiosoite ${osoite}`);
    for (const k of KIELLETYT) if (k.test(s)) tulos.virheet.push(`${f}: henkilön tunnus (${k.source})`);
  }
  // Puuttuvat kuvat yhtenä rivinä: ne syntyvät vasta kuvaskriptillä (npm run ohjekuvat).
  const puuttuvat = tulos.varoitukset.filter((v) => v.includes("ei vielä ole (npm run ohjekuvat)"));
  for (const v of tulos.varoitukset) if (!puuttuvat.includes(v)) console.log(`  VAROITUS ${v}`);
  if (puuttuvat.length) {
    console.log(`  VAROITUS ${puuttuvat.length} kuvaa puuttuu vielä (npm run ohjekuvat). Lista: OHJE_KUVAT=1 npm run test:ohje`);
    if (process.env.OHJE_KUVAT) for (const v of puuttuvat) console.log(`    ${v}`);
  }
  const kortteja = koonti.sisalto.osiot.reduce((n, o) => n + o.kortit.length, 0);
  if (tulos.virheet.length) {
    console.error(`\n✗ docs/ohje: ${tulos.virheet.length} virhettä (${kortteja} korttia)`);
    for (const v of tulos.virheet) console.error(`  ${v}`);
    process.exit(1);
  }
  ok += 1;
  console.log(`✓ docs/ohje: ${kortteja} korttia kunnossa (${tulos.varoitukset.length} varoitusta)`);
  console.log(`\n${ok} testiä OK`);
}

// Apufunktiot muiden skriptien käyttöön (esim. vianetsintä: miksi nimi hyväksytään).
export { kokoaSanasto, onSanastossa, sarjallistaRakenne };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
