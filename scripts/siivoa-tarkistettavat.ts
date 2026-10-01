/**
 * Tarkistettavat-listan siivous (1.10.2026): migraation "Vaatii tarkistuksen"
 * -merkinnät käytiin läpi yksitellen. Tämä skripti
 *
 *  1. poistaa merkinnän dokumenteista, joissa ei ole mitään tarkistettavaa
 *     (jo korjattu, tiedoksi kehittäjälle tai valinnainen kenttä),
 *  2. korjaa varmat virheet (lohkotaulukoiden kirjoitusvirheet, ravintolakuvien
 *     väärät alt-tekstit, Wembleyn avausvuosi, Lissabonin ravintolat),
 *  3. kirjoittaa otsikkoehdotuksen otsikottomille jutuille. Merkintä jää päälle,
 *     ja isä hyväksyy tai muokkaa otsikon Studiossa.
 *
 * Jokainen muutos tarkistaa ensin, että nykyinen arvo on se, joka on tarkoitus
 * korjata. Jos isä on jo muokannut dokumenttia, se ohitetaan eikä ylikirjoiteta.
 *
 * Ajo:
 *   npm run siivoa:tarkistettavat                         # production, kuivaharjoitus
 *   npm run siivoa:tarkistettavat -- --vie                # varmuuskopio + kirjoitus + tarkistus
 *   npm run siivoa:tarkistettavat -- --development        # development, kuivaharjoitus
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { createClient, type SanityClient } from "@sanity/client";

import { sanityWriteToken } from "./lib/sanity-token";

/* -------------------------------------------------------------------------- */
/* 1. Merkintä pois: ei toimenpidettä                                          */
/* -------------------------------------------------------------------------- */

const POISTA: { id: string; syy: string }[] = [
  { id: "pelaaja-jari-litmanen", syy: "seuralista korjattu Litmanen-uudistuksessa (FC Lahti 2008–2010, HJK 2011)" },
  { id: "jalkapalloTilasto-fifa-ranking", syy: "tiedoksi kehittäjälle: lähteessä vain kuva" },
  { id: "jalkapalloTilasto-suomen-paras-avauskokoonpano-2004-2008", syy: "tiedoksi kehittäjälle: kaaviot vain kuvina" },
  { id: "uutinen-blogspot-1300522877925221471", syy: "taulukko riveinä on luettava; sama lista järkytyssivulla" },
  { id: "uutinen-2013-01-01-hyypialla-selvat-tavoitteet-kaksi-paikkaa-on-lahella-sydantani", syy: "tarkempaa päiväystä ei ole lähteessä" },
  { id: "uutinen-2010-06-01-seka-italian-etta-suomen-juniorimaajoukkueet-ovat-kutsuneet-lauri", syy: "lähteessä vain kuukausi" },
  { id: "uutinen-blogspot-8761462343951857295", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-blogspot-194689557293472095", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-2008-12-17-fc-lahden-omistajat", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-blogspot-1567978998390406121", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-blogspot-4437287918190961365", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-2007-04-19-veikkausliigan-mestareiden-taloudellinen-tulos-mestaruusvuonna-2000", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-blogspot-1139304074174232501", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-2006-01-18-suomen-jalkapallomaajoukkueen-paavalmentaja-roy-hodgson", syy: "tiivistelmä on valinnainen" },
  { id: "uutinen-2007-02-10-pilapiirros-litille-puuhataan-nakoispatsasta", syy: "pilapiirroksen otsikko kuvan sisällöstä on kunnossa" },
  { id: "uutinen-2006-09-09-pilapiirros-maajoukkueessa-nelja-pelaajaa-lahdesta", syy: "pilapiirroksen otsikko kuvan sisällöstä on kunnossa" },
  { id: "uutinen-2006-09-08-pilapiirros-eremenko-olisin-mieluummin-venalainen", syy: "pilapiirroksen otsikko kuvan sisällöstä on kunnossa" },
  { id: "ravintola-the-bridge-bar-gatwick-airport", syy: "kaupunki Lontoo on oikein (Gatwickin lentoasema)" },
];

/* -------------------------------------------------------------------------- */
/* 2a. Lohkotaulukot: vanhan sivun kirjoitusvirheet                            */
/* -------------------------------------------------------------------------- */

type Solu = { _key: string; key: string; value?: string };
type Rivi = { _key: string; cells: Solu[] };

/** Joukkueen solut: vanha arvo → uusi. Vanhan pitää täsmätä, muuten ohitetaan. */
type RiviKorjaus = { joukkue: string; solut: Record<string, [vanha: string, uusi: string]> };

const LOHKOT: { id: string; selitys: string; korjaukset: RiviKorjaus[] }[] = [
  {
    id: "jalkapalloTilasto-em-2016-lohko-d",
    selitys: "Tsekki 0–1–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Tsekki", solut: { haviot: ["1", "2"] } }],
  },
  {
    id: "jalkapalloTilasto-em-2020-lohko-c",
    selitys: "Itävalta 2–0–1 = 6 pistettä",
    korjaukset: [{ joukkue: "Itävalta", solut: { pisteet: ["3", "6"] } }],
  },
  {
    id: "jalkapalloTilasto-em-2020-lohko-d",
    selitys: "Skotlanti 0–1–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Skotlanti", solut: { haviot: ["1", "2"] } }],
  },
  {
    id: "jalkapalloTilasto-em-2020-lohko-e",
    selitys: "Slovakia 1–0–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Slovakia", solut: { haviot: ["3", "2"] } }],
  },
  {
    // Ranska–Unkari 1–1, Portugali–Unkari 3–0, Ranska–Saksa 1–0, Portugali–Saksa 2–4,
    // Unkari–Saksa 2–2, Portugali–Ranska 2–2. Saksa toinen keskinäisellä ottelulla.
    id: "jalkapalloTilasto-em-2020-lohko-f",
    selitys: "Saksa 2. (6–5, 4 p), Portugali 3. (7–6, 4 p), Unkari 0–2–1 (2 p)",
    korjaukset: [
      { joukkue: "Saksa", solut: { sija: ["3", "2"], maalit: ["7-6", "6-5"], pisteet: ["3", "4"] } },
      { joukkue: "Portugali", solut: { sija: ["2", "3"], maalit: ["6-5", "7-6"], pisteet: ["3", "4"] } },
      { joukkue: "Unkari", solut: { tasapelit: ["1", "2"], pisteet: ["1", "2"] } },
    ],
  },
  {
    id: "jalkapalloTilasto-em-2024-lohko-a",
    selitys: "Unkari 1–0–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Unkari", solut: { haviot: ["3", "2"] } }],
  },
  {
    id: "jalkapalloTilasto-mm-2018-lohko-d",
    selitys: "Islanti 0–1–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Islanti", solut: { haviot: ["1", "2"] } }],
  },
  {
    id: "jalkapalloTilasto-mm-2022-lohko-d",
    selitys: "Tanska 0–1–2 (häviöitä 2)",
    korjaukset: [{ joukkue: "Tanska", solut: { haviot: ["1", "2"] } }],
  },
];

/* -------------------------------------------------------------------------- */
/* 2b. Ravintolat                                                               */
/* -------------------------------------------------------------------------- */

/** Kuvan alt: tiedostonimen päiväys (vvkkpp) ja käyntipäivä täsmäävät; lähteen alt oli väärä. */
const KUVA_ALT: { id: string; kuva: string; vanha: string; uusi: string }[] = [
  { id: "ravintola-eliel", kuva: "img-ailuLahtiEliel260618jpeg-0", vanha: "Huuva 17.02.2026", uusi: "Eliel Lahti 18.06.2026" },
  { id: "ravintola-great-wall", kuva: "img-ulahtiGreatWall140501jpg-0", vanha: "Kiinalainen Ravintola Great Wall Lahti 01.05.2015", uusi: "Kiinalainen Ravintola Great Wall Lahti 01.05.2014" },
  { id: "ravintola-hesburger-lahti", kuva: "img-iHesburgerSokos150102jpg-0", vanha: "Hesburger Sokos Lahti 02.01.2014", uusi: "Hesburger Sokos Lahti 02.01.2015" },
  { id: "ravintola-mcdonald-s-herttoniemi", kuva: "img-ldsHerttoniemi220916jpeg-0", vanha: "McDonald's Helsinki Herttoniemi 16.06.2022", uusi: "McDonald's Helsinki Herttoniemi 16.09.2022" },
  { id: "ravintola-megobaro-toolo", kuva: "img-lsinkiMegobaro260103jpeg-0", vanha: "Bardot 31.07.2025", uusi: "Megobaro Töölö, Helsinki 03.01.2026" },
  { id: "ravintola-mozzarella-bar", kuva: "img-riMozzarellabar210616jpg-0", vanha: "Mozzarella Bar 15.06.2021", uusi: "Mozzarella Bar, Pietari 16.06.2021" },
  { id: "ravintola-pizzeria-in-restavracija-promenada", kuva: "img-racijaPromenada150701jpg-0", vanha: "Restaurant Pannoteka, Ljubljana 01.07.2014", uusi: "Pizzeria in restavracija Promenada, Ljubljana 01.07.2015" },
  { id: "ravintola-retro-enoteca", kuva: "img-oEnoteca260718Tartarjpeg-0", vanha: "Bardot 31.07.2025", uusi: "Tartar, Retro Enoteca Helsinki 18.07.2026" },
  { id: "ravintola-rioni", kuva: "img-luTampereRioni241116jpeg-0", vanha: "Rioni Tampere 15.11.2024", uusi: "Rioni Tampere 16.11.2024" },
  { id: "ravintola-sarastro", kuva: "img-onlinnaSarastro250724jpg-0", vanha: "Sarastro Savonlinna 24.07.2023", uusi: "Sarastro Savonlinna 24.07.2025" },
  { id: "ravintola-sichuan-panda", kuva: "img-sichuan23122001jpg-0", vanha: "Sichuan Panda 23.12.2013", uusi: "Sichuan Panda Lahti 23.12.2001" },
  { id: "ravintola-wolkoff", kuva: "img-kailuwolkofflpr140618jpg-0", vanha: "Ravintola Wolkoff Lappeenranta 19.06.2014", uusi: "Ravintola Wolkoff Lappeenranta 18.06.2014" },
  { id: "ravintola-roman-italian-s-food", kuva: "img-abonitalianfood100706jpg-0", vanha: "Ravintola Roman Italian's Food, Portugali", uusi: "Ravintola Roman Italian's Food, Lissabon" },
];

const LISSABON = {
  _id: "kaupunki-lissabon",
  _type: "kaupunki",
  name: "Lissabon",
  slug: { _type: "slug", current: "lissabon" },
  country: "Portugali",
};

/** Rossion aukio on Lissabonissa; Roman Italian's Foodin kuva on tiedostossa "ruokailulissabon…". */
const LISSABONIIN = ["ravintola-mcdonald-s-rossion-aukio", "ravintola-roman-italian-s-food"];

/* -------------------------------------------------------------------------- */
/* 3. Otsikkoehdotukset                                                         */
/* -------------------------------------------------------------------------- */

const OTSIKOT: { id: string; kentta: "title" | "otsikko"; uusi: string }[] = [
  { id: "lehtileike-litmanen-2007-04-04-litmanen-kavi-viime-marraskuussa-lapi-nilkkaleikka", kentta: "otsikko", uusi: "Litmanen jatkaa Malmössä nilkkaleikkauksen jälkeen" },
  { id: "lehtileike-litmanen-2007-02-04-suomen-jalkapallomaajoukkueen-kapteenin-jari-litma", kentta: "otsikko", uusi: "Litmasen nilkka paranee – paluu Azerbaidzhan-otteluun epävarma" },
  { id: "uutinen-2007-03-17-suomessa-jalkapalloliiga-alkaa-vasta-huhtikuun-lopussa-kun-vahintaan", kentta: "title", uusi: "Suomessa liiga alkaa vasta huhtikuussa – Venäjällä pelataan jo maaliskuussa" },
  { id: "uutinen-2007-03-16-jarjestelyt-pettivat-taas-suomalaisessa-jalkapallossa-ja-nyt", kentta: "title", uusi: "Liigacupin järjestelyt pettivät Pajulahdessa: ei otteluohjelmaa eikä paareja" },
  { id: "uutinen-2007-03-08-palloliiton-liittohallitus-paatti-tanaan-etta-suomi-kazakstan-em", kentta: "title", uusi: "Suomi–Kazakstan pelataan Ratinassa – miksi ei Olympiastadionilla?" },
  { id: "uutinen-2007-03-05-kansainvalinen-jalkapalloliitto-fifa-ja-puola-ovat-paasseet-sopuun", kentta: "title", uusi: "Fifa ja Puola sopuun – Puolan sulkeminen EM-karsinnoista vältettiin" },
  { id: "uutinen-2007-02-28-fc-lahti-pystyy-toiminnanjohtaja-jussi-lumion-mukaan-kuittaamaan", kentta: "title", uusi: "FC Lahti aikoo kuitata sadan tonnin tappion kuluvalla kaudella" },
  { id: "uutinen-2007-02-28-forssellin-mukaan-uusi-paavalmentaja-roy-hodgson-on-tuonut", kentta: "title", uusi: "Forssell: Hodgson toi uutta, mutta myös pelaajat ovat kehittyneet" },
  { id: "uutinen-2007-02-25-historiakirja-rakas-jalkapallo-sata-vuotta-suomalaista-jalkapalloa", kentta: "title", uusi: "Rakas jalkapallo – Palloliiton satavuotishistoria jokaisen fanin hyllyyn" },
  { id: "uutinen-2007-02-24-liigacup-sopii-loistavasti-suomen-jalkapallon-kalenteriin-talvella", kentta: "title", uusi: "Liigacup sopii Suomen jalkapallokalenteriin" },
  { id: "uutinen-2007-02-13-venajan-liigan-parhaaksi-pelaajaksi-valitulla-pietarin-zenitin-andrei", kentta: "title", uusi: "Arshavin Venäjän liigan parhaaksi – Eremenko jr. sijalla 12" },
  { id: "uutinen-2007-01-30-palloliiton-liittohallituksen-kokous-30-01-2007-palloliitto-suhtautui", kentta: "title", uusi: "Palloliitto tukee FC Reippaan Litmanen-patsashanketta" },
  { id: "uutinen-2007-01-27-michel-platinin-valinta-euroopan-jalkapalloliiton-uefan", kentta: "title", uusi: "Platinin valinta Uefan puheenjohtajaksi on voitto jalkapallolle" },
  { id: "uutinen-2007-01-22-kansainvalinen-jalkapalloliitto-fifa-ja-lajin-eurooppalainen", kentta: "title", uusi: "Fifa ja Uefa varoittivat Puolaa – uhkana sulkeminen EM-karsinnoista" },
  { id: "uutinen-2007-01-09-suomessa-on-ihmetelty-yleisesti-alle-21-vuotiaiden-maajoukkueen", kentta: "title", uusi: "Hetemaj: alle 21-vuotiaiden tulokset surkeita, vaikka pelaajisto on hyvä" },
  { id: "uutinen-2006-12-31-vuonna-2006-maajoukkue-on-tayttanyt-loistavasti-suuret-odotukset-kun", kentta: "title", uusi: "Maajoukkueen vuosi 2006: Suomi johtaa EM-karsintalohkoaan" },
  { id: "uutinen-2006-12-24-loppuvuodesta-syntyneiden-kato-on-tuttu-juttu-palloliiton-seura-ja", kentta: "title", uusi: "Loppuvuodesta syntyneet jäävät junioreissa vähemmistöksi" },
  { id: "uutinen-2006-12-21-vuonna-1989-90-syntyneista-lupaavista-pelaajista-historia-lupaavia", kentta: "title", uusi: "Lupaavat pelaajat Valentin Granatkin -turnaukseen Pietariin" },
  { id: "uutinen-2006-12-09-hetemaj-t-ovat-kansallisuudeltaan-kosovon-albaaneja-ja-heidan", kentta: "title", uusi: "Hetemajt eivät voi edustaa Albaniaa – Fifan säännöt estävät" },
  { id: "uutinen-2006-11-18-puheenjohtaja-pekka-hamalaisen-ja-maajoukkueen-pelaajien-julkinen", kentta: "title", uusi: "Keinonurmikiista paljasti Palloliiton toiminnan tason" },
  { id: "uutinen-2006-10-22-pekka-hamalainen-valittiin-sunnuntaina-22-10-jatkamaan-suomen", kentta: "title", uusi: "Pekka Hämäläinen jatkaa Palloliiton puheenjohtajana" },
  { id: "uutinen-2006-09-28-roy-hodgson-te-olette-suomalaisia-ja-te-olette-olleet-vain-suomessa", kentta: "title", uusi: "Hodgson: Puissa ei kasva pelaajia kuten Hyypiä ja Litmanen" },
  { id: "uutinen-2006-09-23-suomessa-on-jossain-ihmetelty-uuden-maajoukkuevalmentajan", kentta: "title", uusi: "Forssell: Hodgsonin suoruus ei ole minulle uutta" },
  { id: "uutinen-2006-09-21-lahden-suomalaisen-klubin-asiantuntija-kavi-pietarissa-petrovskii", kentta: "title", uusi: "Klubin asiantuntija Pietarissa: Zenitin ottelut täynnä kansainvälisiä pelaajia" },
  { id: "uutinen-2006-09-19-portugalin-maajoukkueen-menestysvalmentajan-luiz-felipe-scolarin", kentta: "title", uusi: "Scolari: Portugali tarvitsee EM-karsinnoissa vähintään 28 pistettä" },
];

const OTSIKKO_HUOMIO = (alkuperainen: string) =>
  `• Otsikkoehdotus: jutulla ei ollut lähteessä otsikkoa, ja ehdotus on kirjoitettu jutun sisällöstä. ` +
  `Hyväksy tai muokkaa otsikkoa ja poista sitten rasti. ` +
  `Aiempi (jutun alusta katkaistu): "${alkuperainen}"`;

/* -------------------------------------------------------------------------- */
/* Toteutus                                                                     */
/* -------------------------------------------------------------------------- */

type Doc = Record<string, unknown> & {
  _id: string;
  _rev: string;
  _type: string;
  needsReview?: boolean;
  tarkistettavaa?: string;
};

const arvo = (rivi: Rivi, key: string) => rivi.cells.find((c) => c.key === key)?.value ?? "";
const luku = (rivi: Rivi, key: string) => Number.parseInt(arvo(rivi, key), 10);

/** Taulukon sisäinen eheys: jokainen rivi täsmää ja lohkon maalit menevät tasan. */
function lohkoEhjä(rivit: Rivi[]): string[] {
  const virheet: string[] = [];
  let tehdyt = 0;
  let paastetyt = 0;
  for (const r of rivit) {
    const [o, v, t, h, p] = ["ottelut", "voitot", "tasapelit", "haviot", "pisteet"].map((k) => luku(r, k));
    const nimi = arvo(r, "joukkue");
    if (v + t + h !== o) virheet.push(`${nimi}: V+T+H ${v + t + h} ≠ O ${o}`);
    if (3 * v + t !== p) virheet.push(`${nimi}: 3V+T ${3 * v + t} ≠ P ${p}`);
    const [a, b] = arvo(r, "maalit").split("-").map(Number);
    tehdyt += a;
    paastetyt += b;
  }
  if (tehdyt !== paastetyt) virheet.push(`maalit ${tehdyt}-${paastetyt} eivät mene tasan`);
  const sijat = rivit.map((r) => luku(r, "sija"));
  if (sijat.some((s, i) => s !== i + 1)) virheet.push(`sijat eivät ole järjestyksessä: ${sijat.join(",")}`);
  return virheet;
}

function korjaaLohko(rivit: Rivi[], korjaukset: RiviKorjaus[]): Rivi[] | string {
  const uudet = rivit.map((r) => ({ ...r, cells: r.cells.map((c) => ({ ...c })) }));
  for (const k of korjaukset) {
    const rivi = uudet.find((r) => arvo(r, "joukkue") === k.joukkue);
    if (!rivi) return `joukkuetta ${k.joukkue} ei löydy`;
    for (const [avain, [vanha, uusi]] of Object.entries(k.solut)) {
      const solu = rivi.cells.find((c) => c.key === avain);
      if (!solu) return `${k.joukkue}: solu ${avain} puuttuu`;
      if (solu.value === uusi) continue; // jo korjattu
      if (solu.value !== vanha) return `${k.joukkue} ${avain}: odotettiin ${vanha}, oli ${solu.value}`;
      solu.value = uusi;
    }
  }
  return uudet.sort((a, b) => luku(a, "sija") - luku(b, "sija"));
}

interface Toimenpide {
  id: string;
  ryhma: "merkintä pois" | "korjaus" | "otsikkoehdotus";
  kuvaus: string;
  set?: Record<string, unknown>;
  unset?: string[];
  rev: string;
}

async function suunnittele(client: SanityClient) {
  const idt = [
    ...POISTA.map((p) => p.id),
    ...LOHKOT.map((l) => l.id),
    ...KUVA_ALT.map((k) => k.id),
    ...LISSABONIIN,
    "stadion-wembleylontoo",
    ...OTSIKOT.map((o) => o.id),
  ];
  const [docs, luonnokset, lissabon] = await Promise.all([
    client.fetch<Doc[]>(`*[_id in $idt]`, { idt }),
    client.fetch<string[]>(`*[_id in $idt]._id`, { idt: idt.map((id) => `drafts.${id}`) }),
    client.getDocument(LISSABON._id),
  ]);
  const doc = new Map(docs.map((d) => [d._id, d]));
  const ohitetut: string[] = [];
  const luonnosIdt = new Set(luonnokset.map((id) => id.replace(/^drafts\./, "")));

  // Yksi toimenpide per dokumentti: saman dokumentin muutokset yhdistetään.
  const toimet = new Map<string, Toimenpide>();
  const lisaa = (id: string, ryhma: Toimenpide["ryhma"], kuvaus: string, set: Record<string, unknown> = {}, unset: string[] = []) => {
    const d = doc.get(id);
    if (!d) return void ohitetut.push(`${id}: ei datasetissä`);
    if (luonnosIdt.has(id)) return void ohitetut.push(`${id}: julkaisematon luonnos Studiossa`);
    const t = toimet.get(id) ?? { id, ryhma, kuvaus: "", set: {}, unset: [], rev: d._rev };
    t.kuvaus = t.kuvaus ? `${t.kuvaus}; ${kuvaus}` : kuvaus;
    if (ryhma === "korjaus" || ryhma === "otsikkoehdotus") t.ryhma = ryhma;
    Object.assign(t.set!, set);
    t.unset!.push(...unset);
    toimet.set(id, t);
  };
  const poistaMerkinta = { needsReview: false };
  /** Korjaus on jo tehty: arvo on uusi eikä merkintää ole. Uusinta-ajo ei kirjoita mitään. */
  const valmis = (id: string, onUusi: boolean) => {
    if (!onUusi || doc.get(id)?.needsReview === true) return false;
    ohitetut.push(`${id}: jo korjattu`);
    return true;
  };

  for (const p of POISTA) {
    const d = doc.get(p.id);
    if (d && d.needsReview !== true) {
      ohitetut.push(`${p.id}: merkintä on jo poistettu`);
      continue;
    }
    lisaa(p.id, "merkintä pois", p.syy, poistaMerkinta, ["tarkistettavaa"]);
  }

  for (const l of LOHKOT) {
    const d = doc.get(l.id);
    if (!d) continue;
    const tulos = korjaaLohko((d.rows as Rivi[]) ?? [], l.korjaukset);
    if (typeof tulos === "string") {
      ohitetut.push(`${l.id}: ${tulos}`);
      continue;
    }
    if (valmis(l.id, JSON.stringify(tulos) === JSON.stringify(d.rows))) continue;
    const virheet = lohkoEhjä(tulos);
    if (virheet.length > 0) throw new Error(`${l.id} ei ole korjauksen jälkeen ehjä: ${virheet.join("; ")}`);
    lisaa(l.id, "korjaus", `lohkotaulukko: ${l.selitys}`, { rows: tulos, ...poistaMerkinta }, ["tarkistettavaa"]);
  }

  for (const k of KUVA_ALT) {
    const d = doc.get(k.id);
    if (!d) continue;
    const kuva = ((d.images as { _key: string; alt?: string }[]) ?? []).find((i) => i._key === k.kuva);
    if (!kuva) {
      ohitetut.push(`${k.id}: kuvaa ${k.kuva} ei löydy`);
      continue;
    }
    if (valmis(k.id, kuva.alt === k.uusi)) continue;
    if (kuva.alt !== k.uusi && kuva.alt !== k.vanha) {
      ohitetut.push(`${k.id}: alt on muuttunut ("${kuva.alt}")`);
      continue;
    }
    lisaa(k.id, "korjaus", `kuvan alt "${k.vanha}" → "${k.uusi}"`, { [`images[_key=="${k.kuva}"].alt`]: k.uusi, ...poistaMerkinta }, ["tarkistettavaa"]);
  }

  for (const id of LISSABONIIN) {
    const d = doc.get(id);
    if (!d) continue;
    const ref = (d.city as { _ref?: string } | undefined)?._ref;
    if (valmis(id, ref === LISSABON._id)) continue;
    if (ref !== "kaupunki-portugali" && ref !== LISSABON._id) {
      ohitetut.push(`${id}: kaupunki on muuttunut (${ref})`);
      continue;
    }
    lisaa(id, "korjaus", "kaupunki Portugali → Lissabon", { city: { _type: "reference", _ref: LISSABON._id }, ...poistaMerkinta }, ["tarkistettavaa"]);
  }

  const wembley = doc.get("stadion-wembleylontoo");
  if (wembley && !valmis("stadion-wembleylontoo", wembley.openedYear === 2007)) {
    if (wembley.openedYear === 1923 || wembley.openedYear === 2007) {
      lisaa("stadion-wembleylontoo", "korjaus", "avausvuosi 1923 (vanha Wembley) → 2007", { openedYear: 2007, ...poistaMerkinta }, ["tarkistettavaa"]);
    } else ohitetut.push(`stadion-wembleylontoo: avausvuosi on muuttunut (${wembley.openedYear})`);
  }

  for (const o of OTSIKOT) {
    const d = doc.get(o.id);
    if (!d) continue;
    const nyt = String(d[o.kentta] ?? "");
    if (nyt === o.uusi) {
      ohitetut.push(`${o.id}: otsikkoehdotus on jo kirjoitettu`);
      continue;
    }
    // Vain migraation katkaisemat otsikot: isän kirjoittamaan otsikkoon ei kosketa.
    const katkaistu = nyt.endsWith("…") || /ensimmäinen virke|ensimmäisestä virkkeestä/.test(d.tarkistettavaa ?? "");
    if (!katkaistu || d.needsReview !== true) {
      ohitetut.push(`${o.id}: otsikkoa on muokattu ("${nyt}")`);
      continue;
    }
    lisaa(o.id, "otsikkoehdotus", `"${nyt}" → "${o.uusi}"`, { [o.kentta]: o.uusi, tarkistettavaa: OTSIKKO_HUOMIO(nyt) });
  }

  return { toimet: [...toimet.values()], ohitetut, luoLissabon: !lissabon };
}

async function main() {
  const vie = process.argv.includes("--vie");
  const dataset = process.argv.includes("--development") ? "development" : "production";
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = sanityWriteToken();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID tai kirjoitustoken puuttuu (.env.local tai npx sanity login).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, apiVersion: "2025-08-15", token, useCdn: false, perspective: "raw" });

  const { toimet, ohitetut, luoLissabon } = await suunnittele(client);

  console.log(`Dataset ${dataset}:`);
  if (luoLissabon) console.log(`  + kaupunki Lissabon (Portugali)`);
  for (const ryhma of ["merkintä pois", "korjaus", "otsikkoehdotus"] as const) {
    const rivit = toimet.filter((t) => t.ryhma === ryhma);
    console.log(`\n  ${ryhma} (${rivit.length})`);
    for (const t of rivit) console.log(`    ${t.id}\n      ${t.kuvaus}`);
  }
  if (ohitetut.length > 0) {
    console.log(`\n  ohitettu (${ohitetut.length})`);
    for (const o of ohitetut) console.log(`    ${o}`);
  }

  if (!vie) {
    console.log(`\nKuivaharjoitus: mitään ei kirjoitettu. Kirjoita: npm run siivoa:tarkistettavat -- ${dataset === "development" ? "--development " : ""}--vie`);
    return;
  }
  if (toimet.length === 0 && !luoLissabon) {
    console.log("\nEi tehtävää.");
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

  const tx = client.transaction();
  tx.createIfNotExists(LISSABON);
  for (const t of toimet) {
    tx.patch(t.id, (p) => {
      let q = p.ifRevisionId(t.rev);
      if (t.set && Object.keys(t.set).length > 0) q = q.set(t.set);
      if (t.unset && t.unset.length > 0) q = q.unset(t.unset);
      return q;
    });
  }
  await tx.commit({ visibility: "sync" });

  const tyypit = await client.fetch<string[]>(`*[needsReview == true && !(_id in path("drafts.**"))]._type`);
  const jaljella = new Map<string, number>();
  for (const t of tyypit) jaljella.set(t, (jaljella.get(t) ?? 0) + 1);
  console.log(`\n✓ ${toimet.length} dokumenttia päivitetty (${dataset}).`);
  console.log(`  Tarkistettavat nyt: ${[...jaljella].map(([t, n]) => `${t} ${n}`).join(", ")} (yhteensä ${tyypit.length})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
