/**
 * Päästä päähän -testi: automaattiset ohjaukset ja lyhytosoitteet (docs/24
 * askel 8, P8). Testaa koko ketjun: webhook tallentaa vanhan osoitteen
 * (aiemmatPolut), 404-haara ohjaa sen (308), isän ohjaus ohjaa (307) ja
 * kohteen vaihto näkyy välimuistista huolimatta.
 *
 * Kaksi tilaa:
 *   npm run e2e:ohjaukset -- --paikallinen
 *       development-datasetti ja http://localhost:3000. Kehityspalvelin
 *       käynnissä development-datasetillä (NEXT_PUBLIC_SANITY_DATASET=development,
 *       SANITY_API_WRITE_TOKEN ja SANITY_REVALIDATE_SECRET asetettuina). Sanityn
 *       webhook ei kutsu localhostia, joten testi lähettää sen itse
 *       allekirjoitettuna (@sanity/webhook).
 *   npm run e2e:ohjaukset
 *       production ja https://www.lahdensuomalainenklubi.com, aito webhook.
 *       Ajaa ensin `npm run backup` ja keskeyttää, jos se epäonnistuu. Ennen
 *       ajoa webhookin projektio on vaihdettu (docs/17 §D) ja webhook-jono on
 *       tyhjä (sanity.io/manage → API → Webhooks → Attempts).
 *
 * Luo ja poistaa testisivun ja kaksi ohjausta (netto 0 dokumenttia).
 * Testisivu näkyy sivustolla muutaman minuutin.
 *
 * Kulku:
 *  1. Testisivu julkaistaan → 200.
 *  2. Osoitteen muutos → webhook tallentaa vanhan osoitteen.
 *  3. Vanha osoite → 308 uuteen, uusi → 200.
 *  4. Lyhytosoite testisivulle → 307.
 *  5. Lyhytosoitteen kohde ulkoiseksi → uusi kohde 120 sekunnissa (ISR:n
 *     välimuistiin tallennettu ohjaus tyhjenee tagilla, riski R1).
 *  6. Kilpailutilanne (K2): kaksi osoitteen muutosta peräkkäin ilman odotusta
 *     → kaikki vanhat osoitteet tallessa ja ohjautuvat uusimpaan.
 *  7. Kilpailutilanne (K2): luonnos avataan ennen webhookin patchia, ja seuraava
 *     julkaisu korvaa julkaistun version → webhook palauttaa vanhan osoitteen.
 *  8. Poisto → ohjaus (K3): testisivu poistetaan, sen osoite antaa 404:n
 *     sekunneissa, ja ohjaus samasta osoitteesta hyväksytään ja toimii.
 *  9. Siivous (finally): ohjaukset ja sivu pois, osoitteet 404.
 */
import { spawnSync } from "node:child_process";

import { createClient } from "@sanity/client";
import { encodeSignatureHeader } from "@sanity/webhook";

import { normalisoiPolku, tarkistaOhjauksenLahde, type EnnenTiedot } from "../lib/ohjaukset";
import { sanityWriteToken } from "./lib/sanity-token";

const PAIKALLINEN = process.argv.includes("--paikallinen");
const DATASET = PAIKALLINEN ? "development" : "production";
const SITE = PAIKALLINEN ? "http://localhost:3000" : "https://www.lahdensuomalainenklubi.com";

const SIVU_ID = "sivu-testi-ohjaus-poistetaan";
const OHJAUS_ID = "ohjaus-testi-poistetaan";
const OHJAUS2_ID = "ohjaus-testi-2-poistetaan";
const A = "testi-ohjaus-poistetaan";
const UUSI = "testi-ohjaus-uusi-poistetaan";
const B = "testi-ohjaus-b-poistetaan";
const C = "testi-ohjaus-c-poistetaan";
const D = "testi-ohjaus-d-poistetaan";
const LYHYT = "/testi-lyhytosoite-poistetaan";
const ULKOINEN = "https://www.palloliitto.fi/";

const token = sanityWriteToken();
if (!token) {
  console.error("Kirjoitustoken puuttuu: SANITY_API_WRITE_TOKEN tai `npx sanity login`.");
  process.exit(1);
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: DATASET,
  apiVersion: "2025-08-15",
  token,
  useCdn: false,
  perspective: "raw",
});
const salaisuus = process.env.SANITY_REVALIDATE_SECRET;

const t0 = Date.now();
const aika = () => `${((Date.now() - t0) / 1000).toFixed(0).padStart(4)} s`;
let virheita = 0;
function ok(ehto: boolean, kuvaus: string) {
  console.log(`${aika()}  ${ehto ? "✓" : "✗"} ${kuvaus}`);
  if (!ehto) virheita++;
}
const odota = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function odotaKunnes<T>(kuvaus: string, hae: () => Promise<T>, ehto: (x: T) => boolean, maxMs = 120_000): Promise<T> {
  const alku = Date.now();
  let x = await hae();
  while (!ehto(x) && Date.now() - alku < maxMs) {
    await odota(3000);
    x = await hae();
  }
  ok(ehto(x), `${kuvaus} (${((Date.now() - alku) / 1000).toFixed(0)} s)`);
  return x;
}

type Vastaus = { status: number; location: string | null };

/**
 * Location vertailumuotoon. `next start` lähettää välimuistin ohittavassa
 * (MISS) vastauksessa kaksi samaa Location-otsaketta, jotka fetch yhdistää
 * muotoon "a, a": vain ensimmäinen. Sivuston oma täysi osoite → polku, mutta
 * ulkoinen osoite säilyy kokonaisena (muuten ulkoinen kohde näyttäisi
 * polulta "/" eikä kohteen vaihtoa voisi todentaa).
 */
function vertailtavaSijainti(location: string | null): string | null {
  if (!location) return null;
  const ensimmainen = location.split(", ")[0];
  const oma = new Set([new URL(SITE).origin, "https://www.lahdensuomalainenklubi.com", "https://lahdensuomalainenklubi.com"]);
  try {
    const url = new URL(ensimmainen, SITE);
    if (oma.has(url.origin)) return `${url.pathname}${url.search}${url.hash}`;
    return url.href;
  } catch {
    return ensimmainen;
  }
}
async function osoite(polku: string): Promise<Vastaus> {
  const res = await fetch(`${SITE}${polku}`, { method: "HEAD", cache: "no-store", redirect: "manual" });
  return { status: res.status, location: vertailtavaSijainti(res.headers.get("location")) };
}
const onOhjaus = (status: number, kohde: string) => (v: Vastaus) => v.status === status && v.location === kohde;

type SivuTila = { slug: string | null; aiemmatPolut: string[] | null; title?: string } | null;
const sivunTila = () =>
  client.fetch<SivuTila>(`*[_id == $id][0]{ "slug": slug.current, aiemmatPolut, title }`, { id: SIVU_ID });
const aiemmat = async () => (await sivunTila())?.aiemmatPolut ?? [];
const sisaltaa = (lista: string[], ...polut: string[]) => polut.every((p) => lista.includes(p));

/**
 * Paikallinen tila: Sanityn webhook ei kutsu localhostia, joten sama kutsu
 * lähetetään itse allekirjoitettuna. Productionissa aito webhook hoitaa tämän.
 */
async function webhook(payload: {
  _id: string;
  _type: string;
  slug?: string | null;
  operaatio: "create" | "update" | "delete";
  ennen?: EnnenTiedot | null;
}) {
  if (!PAIKALLINEN) return;
  if (!salaisuus) throw new Error("SANITY_REVALIDATE_SECRET puuttuu (.env.local).");
  const runko = JSON.stringify(payload);
  const res = await fetch(`${SITE}/api/revalidate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "sanity-webhook-signature": await encodeSignatureHeader(runko, Date.now(), salaisuus),
    },
    body: runko,
  });
  if (!res.ok) console.log(`${aika()}    webhook ${payload._type} ${payload.operaatio}: HTTP ${res.status}`);
}

/** Julkaistun sivun osoitteen muutos kuten Studion Julkaise, ja (paikallisesti) webhook. */
async function muutaOsoite(uusi: string, ennen?: { slug: string; aiemmatPolut: string[] }) {
  const edellinen = ennen ?? { slug: (await sivunTila())!.slug!, aiemmatPolut: await aiemmat() };
  await client.patch(SIVU_ID).set({ slug: { _type: "slug", current: uusi } }).commit({ visibility: "sync" });
  return () =>
    webhook({ _id: SIVU_ID, _type: "sivu", slug: uusi, operaatio: "update", ennen: { slug: edellinen.slug, aiemmatPolut: edellinen.aiemmatPolut } });
}

async function siivoa() {
  const tx = client.transaction();
  for (const id of [OHJAUS_ID, OHJAUS2_ID, SIVU_ID]) {
    tx.delete(id);
    tx.delete(`drafts.${id}`);
  }
  await tx.commit({ visibility: "sync" });
  await webhook({ _id: OHJAUS_ID, _type: "ohjaus", operaatio: "delete" });
  await webhook({ _id: SIVU_ID, _type: "sivu", operaatio: "delete" });
}

async function main() {
  console.log(`Datasetti ${DATASET}, sivusto ${SITE}\n`);
  if (!PAIKALLINEN) {
    console.log("Varmuuskopio productionista");
    const tulos = spawnSync("npm", ["run", "backup"], { stdio: "inherit", shell: process.platform === "win32" });
    if (tulos.status !== 0) {
      console.error("Varmuuskopio epäonnistui: mitään ei kirjoitettu.");
      process.exit(1);
    }
  }
  const jaljella = await client.fetch<number>(`count(*[_id in $idt])`, {
    idt: [SIVU_ID, OHJAUS_ID, OHJAUS2_ID].flatMap((id) => [id, `drafts.${id}`]),
  });
  if (jaljella > 0) {
    console.log("Edellisen ajon testidokumentit poistetaan ensin.");
    await siivoa();
  }

  console.log("1. Testisivu julkaistaan");
  await client.create({ _id: SIVU_ID, _type: "sivu", title: "Testisivu (poistetaan)", slug: { _type: "slug", current: A } });
  await webhook({ _id: SIVU_ID, _type: "sivu", slug: A, operaatio: "create", ennen: null });
  await odotaKunnes(`/${A} vastaa 200`, () => osoite(`/${A}`), (v) => v.status === 200);

  console.log("2. Osoitteen muutos");
  await (await muutaOsoite(UUSI))();
  await odotaKunnes("webhook tallensi vanhan osoitteen", aiemmat, (l) => l.length === 1 && l[0] === `/${A}`);

  console.log("3. Vanha osoite ohjautuu");
  await odotaKunnes(`/${A} → 308 /${UUSI}`, () => osoite(`/${A}`), onOhjaus(308, `/${UUSI}`));
  await odotaKunnes(`/${UUSI} vastaa 200`, () => osoite(`/${UUSI}`), (v) => v.status === 200);

  console.log("4. Lyhytosoite testisivulle");
  ok(tarkistaOhjauksenLahde(LYHYT) === true, `${LYHYT} kelpaa osoitteeksi`);
  await client.create({
    _id: OHJAUS_ID,
    _type: "ohjaus",
    lahde: LYHYT,
    minne: { _type: "linkki", tyyppi: "sivu", kohde: { _type: "reference", _ref: SIVU_ID } },
    muistiinpano: "Automaattinen testi, poistetaan heti.",
  });
  await webhook({ _id: OHJAUS_ID, _type: "ohjaus", operaatio: "create", ennen: null });
  await odotaKunnes(`${LYHYT} → 307 /${UUSI}`, () => osoite(LYHYT), onOhjaus(307, `/${UUSI}`));

  console.log("5. Kohteen vaihto (välimuistissa oleva ohjaus vaihtuu)");
  await client
    .patch(OHJAUS_ID)
    .set({ minne: { _type: "linkki", tyyppi: "osoite", href: ULKOINEN } })
    .commit({ visibility: "sync" });
  await webhook({ _id: OHJAUS_ID, _type: "ohjaus", operaatio: "update", ennen: {} });
  await odotaKunnes(`${LYHYT} → 307 ${ULKOINEN} (enintään 120 s)`, () => osoite(LYHYT), (v) => v.status === 307 && v.location === ULKOINEN);

  console.log("6. Kaksi osoitteen muutosta peräkkäin ilman odotusta (K2)");
  const ennenB = { slug: UUSI, aiemmatPolut: await aiemmat() };
  const wB = await muutaOsoite(B, ennenB);
  // Toisen julkaisun hetkellä ensimmäisen webhookin patch ei ole vielä tullut.
  const wC = await muutaOsoite(C, { slug: B, aiemmatPolut: ennenB.aiemmatPolut });
  await Promise.all([wB(), wC()]);
  await odotaKunnes(
    "molemmat vanhat osoitteet tallessa",
    aiemmat,
    (l) => sisaltaa(l, `/${A}`, `/${UUSI}`, `/${B}`) && !l.includes(`/${C}`),
  );
  for (const vanha of [A, UUSI, B]) {
    await odotaKunnes(`/${vanha} → 308 /${C}`, () => osoite(`/${vanha}`), onOhjaus(308, `/${C}`));
  }

  console.log("7. Luonnos avataan ennen webhookin patchia (K2)");
  const ennenD = { slug: C, aiemmatPolut: await aiemmat() };
  const wD = await muutaOsoite(D, ennenD);
  await wD();
  await odotaKunnes("webhook tallensi osoitteen C", aiemmat, (l) => l.includes(`/${C}`));
  // Luonnos, josta webhookin lisäys puuttuu (avattu ennen patchia), julkaistaan.
  const julkaistu = await client.getDocument(SIVU_ID);
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...sisalto } = julkaistu!;
  void _r; void _u; void _c;
  const vanhentunut = { ...sisalto, title: "Testisivu (poistetaan, muokattu)", aiemmatPolut: ennenD.aiemmatPolut };
  await client.createOrReplace({ ...vanhentunut, _id: `drafts.${SIVU_ID}` });
  // Kuten webhookin before(): edellinen julkaistu versio muokkausaikoineen (itsekorjauksen ikkuna).
  const ennenJulkaisua = await client.fetch<EnnenTiedot>(`*[_id == $id][0]{ _updatedAt, "slug": slug.current, aiemmatPolut }`, { id: SIVU_ID });
  await client
    .transaction()
    .createOrReplace({ ...vanhentunut, _id: SIVU_ID })
    .delete(`drafts.${SIVU_ID}`)
    .commit({ visibility: "sync" });
  // Productionissa aito webhook voi ehtiä korjata listan jo ennen tätä tulostetta.
  console.log(`${aika()}    julkaisun jälkeen osoite C ${(await aiemmat()).includes(`/${C}`) ? "jo palautettu" : "puuttuu (testattava tilanne)"}`);
  await webhook({ _id: SIVU_ID, _type: "sivu", slug: D, operaatio: "update", ennen: ennenJulkaisua });
  await odotaKunnes(
    "webhook palautti osoitteen C (itsekorjaus)",
    aiemmat,
    (l) => sisaltaa(l, `/${A}`, `/${UUSI}`, `/${B}`, `/${C}`) && !l.includes(`/${D}`),
  );
  await odotaKunnes(`/${C} → 308 /${D}`, () => osoite(`/${C}`), onOhjaus(308, `/${D}`));

  console.log("8. Poisto → ohjaus nykyisestä osoitteesta (K3)");
  await client.delete(SIVU_ID);
  await webhook({ _id: SIVU_ID, _type: "sivu", slug: D, operaatio: "delete" });
  await odotaKunnes(`/${D} antaa 404 poiston jälkeen`, () => osoite(`/${D}`), (v) => v.status === 404, 60_000);
  // Studion säännöt (lahdeOnVapaa): muoto, ei toista ohjausta, osoite vastaa 404.
  const lahde = `/${D}`;
  ok(tarkistaOhjauksenLahde(lahde) === true, `${lahde} kelpaa osoitteeksi`);
  const samoja = await client.fetch<number>(`count(*[_type == "ohjaus" && lahde == $lahde])`, { lahde });
  ok(samoja === 0, "osoitteella ei ole ohjausta");
  ok((await osoite(lahde)).status === 404, "osoitteessa ei ole sivua eikä kiinteää ohjausta (lahdeOnVapaa)");
  await client.create({
    _id: OHJAUS2_ID,
    _type: "ohjaus",
    lahde,
    minne: { _type: "linkki", tyyppi: "osoite", href: "/klubi" },
    muistiinpano: "Automaattinen testi, poistetaan heti.",
  });
  await webhook({ _id: OHJAUS2_ID, _type: "ohjaus", operaatio: "create", ennen: null });
  await odotaKunnes(`${lahde} → 307 /klubi`, () => osoite(lahde), onOhjaus(307, "/klubi"));
  ok(normalisoiPolku(lahde) === lahde, "osoite on vertailumuodossa");
}

main()
  .catch((e) => {
    virheita++;
    console.error("VIRHE:", e);
  })
  .finally(async () => {
    console.log("9. Siivous");
    try {
      await siivoa();
      ok(
        (await client.fetch<number>(`count(*[_id in $idt])`, {
          idt: [SIVU_ID, OHJAUS_ID, OHJAUS2_ID].flatMap((id) => [id, `drafts.${id}`]),
        })) === 0,
        "testidokumentit poistettu",
      );
      for (const polku of [LYHYT, `/${A}`, `/${C}`, `/${D}`]) {
        await odotaKunnes(`${polku} antaa 404`, () => osoite(polku), (v) => v.status === 404);
      }
    } catch (e) {
      virheita++;
      console.error("SIIVOUSVIRHE:", e);
    }
    console.log(virheita === 0 ? "\nKAIKKI OK" : `\n${virheita} VIRHETTÄ`);
    process.exit(virheita === 0 ? 0 : 1);
  });
