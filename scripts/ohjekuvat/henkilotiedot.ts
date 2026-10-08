/**
 * Henkilötiedot pois ohjeen kuvista (repo on julkinen, docs/25 Rajaukset).
 *
 * 1. Selaimessa Sanityn käyttäjähaut (`/users/me`, `/users/<id,id>`,
 *    `/projects/<id>`) vastaavat keksityllä käyttäjällä: nimi "Sihteeri",
 *    sähköposti sihteeri@esimerkki.fi, ei profiilikuvaa. Rooli on Editor kuten
 *    sihteerillä, joten valikko vastaa hänen näkymäänsä (Kyselyt-työkalu
 *    piilossa, sanity.config.ts). Läsnäolon avatarit piilotetaan tyyleillä
 *    (merkinnat.ts PIILOTUS_CSS).
 * 2. Ennen tallennusta rajauksen näkyvä teksti tarkistetaan: oikeiden
 *    kommentoijien, arvostelijoiden ja klubilaisten nimet developmentista,
 *    projektin käyttäjät, OHJE_KIELLETYT ja sähköpostit muualta kuin
 *    esimerkki.fi. Osuma → kuva hylätään.
 */
import type { SanityClient } from "@sanity/client";
import type { BrowserContext } from "playwright";

export const KUVITELTU_KAYTTAJA = {
  nimi: "Sihteeri",
  sahkoposti: "sihteeri@esimerkki.fi",
  rooli: process.env.OHJE_ROOLI ?? "editor",
} as const;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const onKayttaja = (o: Record<string, Json>) =>
  "email" in o || ("displayName" in o && ("imageUrl" in o || "familyName" in o || "givenName" in o || "provider" in o));

/** Korvaa käyttäjäolioiden nimet, sähköpostit ja kuvat (rekursiivisesti). */
export function anonymisoi(arvo: Json, juuri = true): Json {
  if (Array.isArray(arvo)) return arvo.map((a) => anonymisoi(a, false));
  if (!arvo || typeof arvo !== "object") return arvo;
  const o: Record<string, Json> = {};
  for (const [k, v] of Object.entries(arvo)) o[k] = anonymisoi(v, false);
  if (!onKayttaja(o)) return o;
  for (const k of ["displayName", "name"]) if (k in o) o[k] = KUVITELTU_KAYTTAJA.nimi;
  if ("givenName" in o) o.givenName = KUVITELTU_KAYTTAJA.nimi;
  if ("familyName" in o) o.familyName = "";
  if ("middleName" in o) o.middleName = "";
  if ("email" in o) o.email = KUVITELTU_KAYTTAJA.sahkoposti;
  for (const k of ["imageUrl", "profileImage"]) delete o[k];
  if (juuri && "roles" in o) {
    // /users/me: valikko sihteerin roolilla (sanity.config.ts tools).
    o.role = KUVITELTU_KAYTTAJA.rooli;
    o.roles = [{ name: KUVITELTU_KAYTTAJA.rooli, title: KUVITELTU_KAYTTAJA.rooli === "editor" ? "Editor" : KUVITELTU_KAYTTAJA.rooli }];
  }
  return o;
}

/** Käyttäjähaut, jotka anonymisoidaan (ei /users/me/keyvalue: Studion asetukset). */
const KAYTTAJAHAKU = /\.sanity\.io\/v[^/]+\/(users\/(?!me\/)[^/?]+|projects\/[^/?]+)(\?|$)/;

export async function anonymisoiKayttajat(context: BrowserContext): Promise<void> {
  await context.route(KAYTTAJAHAKU, async (reitti) => {
    if (reitti.request().method() !== "GET") return reitti.continue();
    const vastaus = await reitti.fetch().catch(() => null);
    if (!vastaus) return reitti.abort();
    let json: Json;
    try {
      json = (await vastaus.json()) as Json;
    } catch {
      return reitti.fulfill({ response: vastaus });
    }
    return reitti.fulfill({ response: vastaus, json: anonymisoi(json) });
  });
}

// ─────────────────────────────── Tarkistus ───────────────────────────────

export interface KiellettyNimi {
  nimi: string;
  lahde: string;
}

/** Peittää nimen raporttia varten: "Matti Meikäläinen" → "M***n (17 merkkiä)". */
export const peita = (nimi: string) => `${nimi[0]}***${nimi.at(-1)} (${nimi.length} merkkiä)`;

/** Yhdistyksen virallinen nimi (sanity.config.ts title): sen osat eivät ole henkilön nimiä. */
const ORGANISAATIO = "Lahden Suomalainen Klubi ry";

/** Nimimerkit, jotka eivät ole henkilön nimiä (Studio näyttää esim. uudelle dokumentille "Nimetön"). */
const YLEISNIMET = new Set(["nimetön", "anonyymi", "vieras", "nimimerkki", "tuntematon"]);

const SIEMEN_POIS = `!string::startsWith(_id, "ohjekuva-") && !string::startsWith(_id, "drafts.ohjekuva-")`;

/**
 * Kielletyt nimet: oikeat kommentoijat, arvostelijat ja klubilaiset
 * developmentista (julkiset hallituksen jäsenet pois), projektin käyttäjät ja
 * OHJE_KIELLETYT (pilkuilla erotettu). OHJE_SALLITUT poistaa väärät osumat.
 */
export async function kielletytNimet(
  client: SanityClient,
  projectId: string,
): Promise<{ nimet: KiellettyNimi[]; sallitutSahkopostit: string[]; varoitukset: string[] }> {
  const varoitukset: string[] = [];
  const data = await client.fetch<{
    kommentoijat: string[];
    arvostelijat: string[];
    klubilaiset: string[];
    hallitus: string[];
    julkisetSahkopostit: (string | null)[];
  }>(
    `{
      "kommentoijat": array::unique(*[_type == "kommentti" && defined(nimi) && ${SIEMEN_POIS}].nimi),
      "arvostelijat": array::unique(*[_type == "ravintolaKayttajaArvostelu" && defined(reviewerName) && ${SIEMEN_POIS}].reviewerName),
      "klubilaiset": array::unique(*[_type == "klubilainen" && defined(nimi) && ${SIEMEN_POIS}].nimi),
      "hallitus": array::unique(*[_type == "hallitusJasen" && defined(name)].name),
      "julkisetSahkopostit": [*[_id == "yhteystiedot"][0].email] + *[_type == "hallitusJasen" && defined(email)].email
    }`,
  );
  // Hallituksen jäsenet ja yhteystietojen sähköposti ovat sivustolla julkisesti
  // (Klubi → Hallitus, Yhteystiedot; käyttäjä hyväksyi 8.10.2026), joten ne saavat
  // näkyä kuvissa, myös kun sama henkilö on projektin käyttäjä. Klubi itse
  // kommentoi nimillä "Klubi" ja "Lahden Suomalainen Klubi": ei henkilö.
  const julkiset = new Set(data.hallitus.map((n) => n.trim().toLowerCase()));
  const organisaatiota = (nimi: string) =>
    new RegExp(`(^|\\s)${escape(nimi.toLowerCase())}(\\s|$)`).test(ORGANISAATIO.toLowerCase());
  const nimet: KiellettyNimi[] = [];
  const lisaa = (lista: string[], lahde: string, julkisetPois: boolean) => {
    for (const n of lista) {
      const nimi = n.trim();
      if (nimi.length < 4 || YLEISNIMET.has(nimi.toLowerCase())) continue;
      // Datasta tulevat yksisanaiset nimimerkit ("Sami") eivät yksin tunnista henkilöä ja
      // osuisivat julkisiin pelaajanimiin: vain etu- ja sukunimi. OHJE_KIELLETYT aina.
      if (lahde !== "OHJE_KIELLETYT" && !/\s/.test(nimi)) continue;
      if (julkisetPois && (julkiset.has(nimi.toLowerCase()) || organisaatiota(nimi))) continue;
      nimet.push({ nimi, lahde });
    }
  };
  lisaa(data.kommentoijat, "kommentoija", true);
  lisaa(data.arvostelijat, "arvostelija", true);
  lisaa(data.klubilaiset, "klubilainen", true);

  // Projektin käyttäjät: jäsenet hallinta-API:sta (/projects/<id>), nimet
  // samasta käyttäjähausta kuin Studio (/users/<id,id>). Aina kiellettyjä.
  type Kayttaja = { displayName?: string; givenName?: string; familyName?: string; name?: string };
  const api = client.withConfig({ apiVersion: "2021-06-07" });
  const hallinta = api.withConfig({ useProjectHostname: false });
  const kayttajat: Kayttaja[] = [];
  try {
    kayttajat.push(await api.request<Kayttaja>({ uri: "/users/me" }));
  } catch {
    varoitukset.push("omaa käyttäjää ei saatu (/users/me)");
  }
  try {
    const projekti = await hallinta.request<{ members?: { id: string; isRobot?: boolean }[] }>({ uri: `/projects/${projectId}` });
    const idt = (projekti.members ?? []).filter((m) => !m.isRobot).map((m) => m.id);
    if (idt.length > 0) {
      const lista = await api.request<Kayttaja | Kayttaja[]>({ uri: `/users/${idt.join(",")}` });
      kayttajat.push(...(Array.isArray(lista) ? lista : [lista]));
    }
  } catch {
    varoitukset.push("projektin käyttäjiä ei saatu: tarkistetaan vain oma käyttäjä ja OHJE_KIELLETYT");
  }
  for (const k of kayttajat) {
    const koko = [k.givenName, k.familyName].filter(Boolean).join(" ");
    lisaa([k.displayName ?? "", k.name ?? "", koko], "projektin käyttäjä", true);
  }

  lisaa(
    (process.env.OHJE_KIELLETYT ?? "").split(",").filter(Boolean),
    "OHJE_KIELLETYT",
    false,
  );
  const sallitut = new Set(
    (process.env.OHJE_SALLITUT ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const nahdyt = new Set<string>();
  return {
    sallitutSahkopostit: data.julkisetSahkopostit.filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase()),
    nimet: nimet.filter((n) => {
      const avain = n.nimi.toLowerCase();
      if (sallitut.has(avain) || nahdyt.has(avain)) return false;
      nahdyt.add(avain);
      return true;
    }),
    varoitukset,
  };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SAHKOPOSTI = /[\p{L}0-9._%+-]+@([\p{L}0-9-]+\.)+[\p{L}]{2,}/gu;

/** Henkilötiedot tekstissä: kielletyt nimet (kokonaisina sanoina) ja vieraat sähköpostit. */
export function henkilotiedotTekstissa(teksti: string, kielletyt: KiellettyNimi[], sallitut: string[] = []): string[] {
  const osumat: string[] = [];
  const normaali = teksti.replace(/\s+/g, " ");
  for (const k of kielletyt) {
    const malli = new RegExp(`(?<![\\p{L}\\p{N}])${escape(k.nimi).replace(/\s+/g, "\\s+")}(?![\\p{L}\\p{N}])`, "iu");
    if (malli.test(normaali)) osumat.push(`${k.lahde}: ${peita(k.nimi)}`);
  }
  for (const s of normaali.match(SAHKOPOSTI) ?? []) {
    if (!/@esimerkki\.fi$/i.test(s) && !sallitut.includes(s.toLowerCase())) osumat.push(`sähköposti: ${peita(s)}`);
  }
  return [...new Set(osumat)];
}
