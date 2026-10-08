/**
 * Ohjeen kuvien esimerkkidata (siemen). Kirjoitetaan VAIN development-
 * datasettiin; dokumenttien tunnukset alkavat `ohjekuva-` (luonnokset
 * `drafts.ohjekuva-`).
 *
 * Data on keksittyä: henkilöt "Testi Klubilainen" ym., sähköpostit
 * @esimerkki.fi, kuvat piirretään tässä tiedostossa (ei valokuvia ihmisistä).
 * Ei oikeita nimiä, koska kuvat ovat julkisessa repossa.
 *
 * Siemen on idempotentti: dokumentti kirjoitetaan vain, jos sen sisältö
 * poikkeaa tästä tiedostosta. Näin Studion "Muokattu …"-aika ja historia
 * pysyvät samoina ajosta toiseen, eivätkä kuvat muutu turhaan. Kuvat
 * ladataan kerran (tiedostonimi `ohjekuva-*.png`; Sanity tunnistaa saman
 * sisällön).
 *
 * Uusi esimerkkidokumentti: lisää se `siemen()`-listaan. Kiinteät arvot
 * (päiväykset, _key-avaimet) pitävät kuvat samoina joka ajolla.
 */
import type { SanityClient } from "@sanity/client";
import sharp from "sharp";

export const SALLITTU_DATASETTI = "development";

export interface SiemenDokumentti {
  _id: string;
  _type: string;
  /** Aiemmat julkaistut versiot (historiaa varten): kirjoitetaan ennen lopullista, vain kun dokumentti luodaan. */
  _aiemmat?: Record<string, unknown>[];
  [kentta: string]: unknown;
}

// ─────────────────────────────── Kuvat ───────────────────────────────

/** Keksityt kuvat SVG:nä (1600×1000): kenttä, ruoka-annos, järvimaisema. */
const KUVAT: Record<string, string> = {
  "ohjekuva-kentta.png": `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#dff1ff"/></linearGradient></defs>
    <rect width="1600" height="420" fill="url(#t)"/><rect y="420" width="1600" height="580" fill="#3f8f3a"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 200}" y="420" width="100" height="580" fill="#479b41"/>`).join("")}
    <rect x="200" y="520" width="1200" height="420" fill="none" stroke="#fff" stroke-width="8"/>
    <line x1="800" y1="520" x2="800" y2="940" stroke="#fff" stroke-width="8"/>
    <circle cx="800" cy="730" r="90" fill="none" stroke="#fff" stroke-width="8"/>
    <rect x="80" y="300" width="1440" height="120" fill="#1f3b73"/><rect x="80" y="280" width="1440" height="24" fill="#c9d6ea"/>
    <circle cx="980" cy="760" r="26" fill="#fff" stroke="#222" stroke-width="4"/></svg>`,
  "ohjekuva-annos.png": `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <rect width="1600" height="1000" fill="#8a5a3b"/>${[0, 1, 2, 3, 4].map((i) => `<rect y="${i * 200}" width="1600" height="8" fill="#6f452b"/>`).join("")}
    <circle cx="800" cy="500" r="380" fill="#f4f1ea"/><circle cx="800" cy="500" r="300" fill="#fffdf8"/>
    <ellipse cx="700" cy="520" rx="150" ry="95" fill="#b5642f"/><ellipse cx="700" cy="505" rx="120" ry="65" fill="#c97a40"/>
    <circle cx="900" cy="430" r="70" fill="#f2c94c"/><circle cx="930" cy="580" r="60" fill="#e8b84a"/>
    <circle cx="860" cy="620" r="40" fill="#5aa04a"/><circle cx="960" cy="500" r="35" fill="#4c8f3f"/>
    <rect x="280" y="200" width="30" height="600" rx="12" fill="#c0c0c0"/><rect x="1290" y="200" width="30" height="600" rx="12" fill="#c0c0c0"/></svg>`,
  "ohjekuva-jarvi.png": `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b267"/><stop offset="1" stop-color="#fde4c3"/></linearGradient></defs>
    <rect width="1600" height="560" fill="url(#s)"/><circle cx="1150" cy="380" r="110" fill="#fff3c4"/>
    <path d="M0 560 L250 400 L480 520 L760 360 L1050 540 L1300 430 L1600 560 Z" fill="#2f5d50"/>
    <rect y="560" width="1600" height="440" fill="#3d6f9e"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${200 + i * 210}" y="${640 + (i % 3) * 90}" width="140" height="6" fill="#9cc3e6"/>`).join("")}</svg>`,
};

export type SiemenKuvat = Record<keyof typeof KUVAT, string>;

/** Lataa keksityt kuvat (kerran) ja palauttaa tiedostonimi → assetin tunnus. */
async function lataaKuvat(client: SanityClient): Promise<SiemenKuvat> {
  const olemassa = await client.fetch<{ _id: string; originalFilename: string }[]>(
    `*[_type == "sanity.imageAsset" && originalFilename in $nimet]{ _id, originalFilename }`,
    { nimet: Object.keys(KUVAT) },
  );
  const tulos: Record<string, string> = {};
  for (const [nimi, svg] of Object.entries(KUVAT)) {
    const loytynyt = olemassa.find((a) => a.originalFilename === nimi);
    if (loytynyt) {
      tulos[nimi] = loytynyt._id;
      continue;
    }
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    const asset = await client.assets.upload("image", png, { filename: nimi });
    tulos[nimi] = asset._id;
  }
  return tulos as SiemenKuvat;
}

// ─────────────────────────────── Dokumentit ───────────────────────────────

const ref = (_ref: string) => ({ _type: "reference", _ref });
const kuva = (asset: string, alt: string, extra: Record<string, unknown> = {}) => ({
  _type: "imageWithAlt",
  asset: ref(asset),
  alt,
  ...extra,
});

/** Tekstikappale (kiinteä avain → sama data joka ajolla). */
function kappale(avain: string, teksti: string, extra: Record<string, unknown> = {}) {
  return {
    _type: "block",
    _key: avain,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${avain}s`, text: teksti, marks: [] }],
    ...extra,
  };
}

/** Kappale, jonka keskellä on linkki (annotaatio `link`). */
function linkkiKappale(avain: string, ennen: string, linkki: string, jalkeen: string, maare: Record<string, unknown>) {
  return {
    _type: "block",
    _key: avain,
    style: "normal",
    markDefs: [{ _type: "link", _key: `${avain}l`, ...maare }],
    children: [
      { _type: "span", _key: `${avain}a`, text: ennen, marks: [] },
      { _type: "span", _key: `${avain}b`, text: linkki, marks: [`${avain}l`] },
      { _type: "span", _key: `${avain}c`, text: jalkeen, marks: [] },
    ],
  };
}

/** Tunnukset, joihin manifesti viittaa (yksi paikka). */
export const SIEMEN_ID = {
  uutinen: "ohjekuva-uutinen",
  julkaistu: "ohjekuva-syysretki",
  ajastettu: "ohjekuva-uutinen-ajastettu",
  virhe: "ohjekuva-uutinen-virhe",
  tarkistettava: "ohjekuva-uutinen-tarkistettava",
  klubilainen: "ohjekuva-klubilainen",
  kaupunki: "ohjekuva-kaupunki",
  ravintola: "ohjekuva-ravintola",
  arvosana: "ohjekuva-arvosana",
  arvostelu: "ohjekuva-arvostelu",
  ehdotus: "ohjekuva-arvostelu-ehdotus",
  kommentti: "ohjekuva-kommentti",
  albumi: "ohjekuva-albumi",
  tilasto: "ohjekuva-tilasto",
  ohjaus: "ohjekuva-ohjaus",
  hallitus: "ohjekuva-hallitus",
} as const;

export function siemen(k: SiemenKuvat): SiemenDokumentti[] {
  const I = SIEMEN_ID;
  const uutisenRunko = [
    kappale("ohjekuva1", "Klubin syysretki suuntaa tänä vuonna Tampereelle. Lähdemme bussilla Lahden matkakeskuksesta lauantaina aamulla."),
    linkkiKappale("ohjekuva2", "Retken aikataulu ja hinta löytyvät ", "tapahtumasivulta", ". Ilmoittaudu viimeistään kaksi viikkoa ennen lähtöä.", {
      tyyppi: "sivu",
      kohde: ref(SIEMEN_ID.ajastettu),
    }),
    {
      _type: "huomio",
      _key: "ohjekuva3",
      savy: "tieto",
      otsikko: "Muista ilmoittautua",
      teksti: "Bussiin mahtuu 50 matkustajaa. Paikat täytetään ilmoittautumisjärjestyksessä.",
    },
    {
      _type: "upotus",
      _key: "ohjekuva4",
      osoite: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d25.66!3d60.98",
      otsikko: "Kartta: lähtöpaikka Lahden matkakeskus",
    },
    {
      _type: "taulukko",
      _key: "ohjekuva5",
      otsikko: "Aikataulu",
      columns: [
        { _key: "c1", key: "aika", label: "Aika", type: "text" },
        { _key: "c2", key: "ohjelma", label: "Ohjelma", type: "text" },
      ],
      rows: [
        ["9.00", "Lähtö Lahdesta"],
        ["11.00", "Kaupunkikierros"],
        ["15.00", "Ottelu"],
      ].map(([aika, ohjelma], i) => ({
        _type: "taulukonRivi",
        _key: `r${i + 1}`,
        cells: [
          { _key: "a", key: "aika", value: aika },
          { _key: "o", key: "ohjelma", value: ohjelma },
        ],
      })),
    },
  ];
  const julkaistu = {
    _type: "uutinen",
    title: "Klubin syysretki Tampereelle",
    slug: { _type: "slug", current: "esimerkki-klubin-syysretki" },
    publishedAt: "2026-09-20T09:00:00.000Z",
    excerpt: "Syysretki tehdään bussilla Tampereelle. Mukaan mahtuu 50 klubilaista.",
    coverImage: kuva(k["ohjekuva-kentta.png"], "Jalkapallokenttä ja katsomo aurinkoisena päivänä", {
      caption: "Retken päätteeksi katsomme ottelun.",
    }),
    body: uutisenRunko,
  };
  return [
    {
      // Ajastettu uutinen: julkaisuaika kaukana tulevaisuudessa.
      _id: I.ajastettu,
      _type: "uutinen",
      title: "Kevätkokous 2030",
      slug: { _type: "slug", current: "esimerkki-kevatkokous-2030" },
      publishedAt: "2030-03-01T08:00:00.000Z",
      body: [kappale("ohjekuva1", "Klubin kevätkokous pidetään maaliskuussa. Esityslista julkaistaan myöhemmin.")],
    },
    {
      // Julkaisematon uutinen: lomake, alapalkki ja Julkaise.
      _id: `drafts.${I.uutinen}`,
      _type: "uutinen",
      title: "Syyskokous ja pikkujoulut",
      slug: { _type: "slug", current: "esimerkki-syyskokous-ja-pikkujoulut" },
      publishedAt: "2026-10-01T15:00:00.000Z",
      excerpt: "Klubin syyskokous pidetään marraskuussa. Kokouksen jälkeen vietetään pikkujouluja.",
      body: [
        kappale("ohjekuva1", "Klubin sääntömääräinen syyskokous pidetään lauantaina 14.11. kello 15 klubin tiloissa."),
        linkkiKappale("ohjekuva2", "Kokouksen jälkeen vietetään pikkujouluja. Ilmoittaudu ", "tapahtumasivulla", " viimeistään 7.11.", {
          // Linkki kesken (Sivu valitsematta): Linkin ikkunan haku ohjeen kuvaan.
          tyyppi: "sivu",
        }),
      ],
    },
    {
      // Julkaistu uutinen kahdella aiemmalla versiolla (historia) ja luonnoksella (Hylkää muutokset).
      _id: I.julkaistu,
      ...julkaistu,
      _aiemmat: [
        { ...julkaistu, title: "Syysretki Tampereelle", excerpt: "Syysretki tehdään bussilla Tampereelle." },
      ],
    },
    {
      _id: `drafts.${I.julkaistu}`,
      ...julkaistu,
      title: "Klubin syysretki Tampereelle 17.10.",
      // Muuttunut osoite: kentän Osoite sivustolla tieto vanhan osoitteen ohjauksesta.
      slug: { _type: "slug", current: "esimerkki-klubin-syysretki-2026" },
    },
    {
      // Julkaisu estyy: Otsikko puuttuu.
      _id: `drafts.${I.virhe}`,
      _type: "uutinen",
      slug: { _type: "slug", current: "esimerkki-keskeneraiset" },
      publishedAt: "2026-10-02T09:00:00.000Z",
      body: [kappale("ohjekuva1", "Tämä uutinen on vielä kesken.")],
    },
    {
      // Vanhalta sivustolta siirretty, tarkistettava uutinen.
      _id: I.tarkistettava,
      _type: "uutinen",
      title: "Esimerkki: vanhan sivuston juttu",
      slug: { _type: "slug", current: "esimerkki-vanhan-sivuston-juttu" },
      publishedAt: "2026-01-15T10:00:00.000Z",
      body: [kappale("ohjekuva1", "Juttu siirrettiin vanhalta sivustolta. Kuvateksti puuttui alkuperäisestä.")],
      needsReview: true,
      tarkistettavaa: "Kuvateksti puuttui vanhalta sivulta. Tarkista, että kuva ja teksti ovat oikein.",
    },
    {
      // Keksitty hallituksen jäsen (developmentissa ei ole nykyistä hallitusta).
      _id: I.hallitus,
      _type: "hallitusJasen",
      name: "Testi Hallituslainen",
      role: "Sihteeri",
      nykyinen: true,
      email: "sihteeri@esimerkki.fi",
      order: 3,
    },
    {
      _id: I.klubilainen,
      _type: "klubilainen",
      nimi: "Testi Klubilainen",
      lomakkeella: false,
    },
    {
      _id: I.kaupunki,
      _type: "kaupunki",
      name: "Esimerkkilä",
      slug: { _type: "slug", current: "esimerkkila" },
      country: "Suomi",
      maakunta: "Päijät-Häme",
    },
    {
      _id: I.ravintola,
      _type: "ravintola",
      name: "Ravintola Esimerkki",
      slug: { _type: "slug", current: "ravintola-esimerkki" },
      city: ref(I.kaupunki),
      address: "Esimerkkikatu 1",
      postalCode: "15100",
      website: "https://www.esimerkki.fi",
      priceLevel: "€€",
      tuomio: "Hyvä paikka ennen ottelua.",
    },
    {
      _id: I.arvosana,
      _type: "klubiArvio",
      ravintola: ref(I.ravintola),
      arvioija: ref(I.klubilainen),
      ratingFood: 4,
      ratingPrice: 3.5,
      ratingAtmosphere: 4.5,
      paiva: "2026-09-12",
    },
    {
      // Odottava arvostelu (luonnos) kuvineen.
      _id: `drafts.${I.arvostelu}`,
      _type: "ravintolaKayttajaArvostelu",
      reviewerName: "Testi Klubilainen",
      arvioija: ref(I.klubilainen),
      restaurant: ref(I.ravintola),
      kayntipaiva: "2026-10-03",
      ratingFood: 4,
      ratingPrice: 3.5,
      ratingAtmosphere: 4,
      comment: "Annokset olivat hyviä ja palvelu nopeaa. Ennen ottelua kannattaa varata pöytä.",
      kuvat: [
        { _type: "image", _key: "k1", asset: ref(k["ohjekuva-annos.png"]), alt: "Lautasellinen ruokaa puupöydällä" },
        { _type: "image", _key: "k2", asset: ref(k["ohjekuva-jarvi.png"]), alt: "Järvimaisema ravintolan terassilta" },
      ],
      submittedAt: "2026-10-04T16:30:00.000Z",
    },
    {
      // Arvostelu, jossa kävijä ehdottaa uutta ravintolaa.
      _id: `drafts.${I.ehdotus}`,
      _type: "ravintolaKayttajaArvostelu",
      reviewerName: "Testi Klubilainen",
      arvioija: ref(I.klubilainen),
      ehdotettuRavintola: { nimi: "Kahvila Esimerkki", kaupunki: "Esimerkkilä", lisatieto: "Torikatu 2" },
      kayntipaiva: "2026-10-02",
      ratingFood: 4.5,
      ratingPrice: 4,
      ratingAtmosphere: 4,
      comment: "Uusi kahvila torin laidalla. Hyvät leivonnaiset.",
      submittedAt: "2026-10-03T12:00:00.000Z",
    },
    {
      _id: I.kommentti,
      _type: "kommentti",
      piilotettu: false,
      uutinen: ref(I.julkaistu),
      nimi: "Testi Klubilainen",
      teksti: "Hieno retki! Olen mukana.",
      lahetetty: "2026-10-05T18:00:00.000Z",
      lahde: "sivusto",
    },
    {
      _id: I.albumi,
      _type: "galleriaAlbumi",
      title: "Esimerkki: syysretki",
      slug: { _type: "slug", current: "esimerkki-syysretki" },
      date: "2026-09-26",
      coverImage: kuva(k["ohjekuva-kentta.png"], "Jalkapallokenttä ja katsomo"),
      images: [
        { _type: "galleriaKuva", _key: "g1", asset: ref(k["ohjekuva-kentta.png"]), alt: "Jalkapallokenttä ja katsomo" },
        { _type: "galleriaKuva", _key: "g2", asset: ref(k["ohjekuva-jarvi.png"]), alt: "Järvimaisema illalla" },
        { _type: "galleriaKuva", _key: "g3", asset: ref(k["ohjekuva-annos.png"]), alt: "Lounasannos retkellä" },
      ],
    },
    {
      // Huuhkajat-taulukko: osio Kansojen liiga ja kokoonpano Lisätiedoissa.
      _id: `drafts.${I.tilasto}`,
      _type: "jalkapalloTilasto",
      title: "Esimerkki: Kansojen liiga, lohkotaulukko",
      slug: { _type: "slug", current: "esimerkki-kansojen-liiga" },
      category: "huuhkajat",
      huuhkajatOsio: "kansojen-liiga",
      jarjestys: 10,
      lisatiedot: [
        kappale("ohjekuva1", "Avauskokoonpano viimeisessä ottelussa:"),
        {
          _type: "kokoonpano",
          _key: "ohjekuva2",
          otsikko: "Suomi – Esimerkkimaa",
          rivit: [
            { _type: "kokoonpanoRivi", _key: "r1", pelaajat: [{ _type: "kokoonpanoPelaaja", _key: "p1", nimi: "Hyökkääjä A" }, { _type: "kokoonpanoPelaaja", _key: "p2", nimi: "Hyökkääjä B" }] },
            { _type: "kokoonpanoRivi", _key: "r2", pelaajat: ["A", "B", "C", "D"].map((x) => ({ _type: "kokoonpanoPelaaja", _key: `k${x}`, nimi: `Keskikenttä ${x}` })) },
            { _type: "kokoonpanoRivi", _key: "r3", pelaajat: ["A", "B", "C", "D"].map((x) => ({ _type: "kokoonpanoPelaaja", _key: `p${x}`, nimi: `Puolustaja ${x}` })) },
            { _type: "kokoonpanoRivi", _key: "r4", pelaajat: [{ _type: "kokoonpanoPelaaja", _key: "mv", nimi: "Maalivahti" }] },
          ],
        },
      ],
      paivitetty: "2026-10-01",
    },
    {
      _id: I.ohjaus,
      _type: "ohjaus",
      lahde: "/esimerkki-retki",
      minne: { _type: "linkki", tyyppi: "sivu", kohde: ref(I.julkaistu) },
      muistiinpano: "Syysretken esite 2026 (esimerkki).",
    },
  ];
}

// ─────────────────────────────── Kirjoitus ───────────────────────────────

const JARJESTELMAKENTAT = new Set(["_rev", "_createdAt", "_updatedAt", "_system", "_aiemmat"]);

function vertailtava(arvo: unknown): unknown {
  if (Array.isArray(arvo)) return arvo.map(vertailtava);
  if (arvo && typeof arvo === "object") {
    return Object.fromEntries(
      Object.entries(arvo as Record<string, unknown>)
        .filter(([k]) => !JARJESTELMAKENTAT.has(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, vertailtava(v)]),
    );
  }
  return arvo;
}

export const onSiemenTunnus = (id: string) => /^(drafts\.)?ohjekuva-[a-z0-9-]+$/.test(id);

function varmistaDatasetti(client: SanityClient, studionDatasetti: string) {
  if (studionDatasetti !== SALLITTU_DATASETTI) {
    throw new Error(`Siemen kirjoitetaan vain datasettiin ${SALLITTU_DATASETTI}; Studio käyttää datasettiä ${studionDatasetti}.`);
  }
  const clientinDatasetti = client.config().dataset;
  if (clientinDatasetti !== SALLITTU_DATASETTI) {
    throw new Error(`Siemen kirjoitetaan vain datasettiin ${SALLITTU_DATASETTI}; client osoittaa datasettiin ${clientinDatasetti}.`);
  }
}

/**
 * Kirjoittaa siemenen. Kolme varmistusta ennen kirjoitusta: kutsujan
 * ilmoittama datasetti, clientin oma asetus ja jokaisen tunnuksen muoto.
 * Palauttaa kirjoitettujen ja ennallaan olleiden tunnukset.
 */
export async function kirjoitaSiemen(
  client: SanityClient,
  studionDatasetti: string,
): Promise<{ kirjoitetut: string[]; ennallaan: string[] }> {
  varmistaDatasetti(client, studionDatasetti);
  const kuvat = await lataaKuvat(client);
  const dokumentit = siemen(kuvat);
  const vaarat = dokumentit.filter((d) => !onSiemenTunnus(d._id)).map((d) => d._id);
  if (vaarat.length > 0) throw new Error(`Siemenen tunnusten pitää alkaa ohjekuva-: ${vaarat.join(", ")}`);

  const nykyiset = await client.fetch<Record<string, unknown>[]>(`*[_id in $idt]`, { idt: dokumentit.map((d) => d._id) });
  const nykyinen = new Map(nykyiset.map((d) => [String(d._id), d]));
  const kirjoitetut: string[] = [];
  const ennallaan: string[] = [];
  for (const { _aiemmat, ...d } of dokumentit) {
    const vanha = nykyinen.get(d._id);
    if (vanha && JSON.stringify(vertailtava(vanha)) === JSON.stringify(vertailtava(d))) {
      ennallaan.push(d._id);
      continue;
    }
    if (_aiemmat && !d._id.startsWith("drafts.")) {
      // Julkaistu dokumentti historian kanssa: jokainen versio luonnoksena ja julkaisu
      // Sanityn julkaisutoiminnolla, jotta historiaan tulee Julkaistu-rivit (kuten Studiossa).
      const versiot = vanha ? [d] : [..._aiemmat.map((a) => ({ ...a, _id: d._id, _type: d._type })), d];
      for (const versio of versiot) {
        await client.createOrReplace({ ...versio, _id: `drafts.${d._id}` }, { visibility: "sync" });
        await client.action(
          { actionType: "sanity.action.document.publish", draftId: `drafts.${d._id}`, publishedId: d._id },
        );
      }
    } else {
      await client.createOrReplace(d, { visibility: "sync" });
    }
    kirjoitetut.push(d._id);
  }
  return { kirjoitetut, ennallaan };
}

/** Siemenen dokumentit, jotka puuttuvat datasetistä (--tarkista, --ei-siementa). */
export async function puuttuvaSiemen(client: SanityClient): Promise<string[]> {
  const idt = siemen(Object.fromEntries(Object.keys(KUVAT).map((n) => [n, "x"])) as SiemenKuvat).map((d) => d._id);
  const loytyneet = new Set(await client.fetch<string[]>(`*[_id in $idt]._id`, { idt }));
  return idt.filter((id) => !loytyneet.has(id));
}
