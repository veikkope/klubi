/**
 * Päästä päähän -testi productionissa: kahden klubilaisen sääntö (docs/21)
 * webhookin kautta. Laskentaa EI ajeta itse, vaan odotetaan, että Sanityn
 * webhook (app/api/revalidate) tekee sen, ja tarkistetaan julkaistu sivusto.
 *
 * Kulku: testiravintola ilman arvioita (piilossa) → klubilaisen arvostelu
 * luonnoksena (ei vaikuta) → hyväksyntä (1 arvioija, piilossa, odottavien
 * listalla) → sama klubilainen uudelleen (korvaa, yhä piilossa) → toinen
 * klubilainen (julki, taulukossa molemmat) → siivous (kaikki poistetaan).
 *
 * Kirjoittaa productioniin ja näyttää testiravintolan sivustolla noin
 * minuutin ajan. Ennen ajoa: `npm run backup` ja webhook-jono tyhjä
 * (sanity.io/manage → API → Webhooks → Attempts, tai Vercelin lokit).
 *
 * Ajo: npm run e2e:arvioijasaanto
 */
import { createClient } from "@sanity/client";
import { sanityWriteToken } from "./lib/sanity-token";

const SITE = "https://klubi-blond.vercel.app";
const RID = "ravintola-testiravintola-poistetaan";
const SLUG = "testiravintola-poistetaan";
const NIMI = "Testiravintola (poistetaan)";
const VEIKKO = "klubilainen-11";
const SIMO = "klubilainen-4";

process.loadEnvFile(".env.local");
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: "production",
  apiVersion: "2025-08-15",
  token: sanityWriteToken()!,
  useCdn: false,
  perspective: "raw",
});

const t0 = Date.now();
const aika = () => `${((Date.now() - t0) / 1000).toFixed(0).padStart(4)} s`;
let virheita = 0;
function ok(ehto: boolean, kuvaus: string) {
  console.log(`${aika()}  ${ehto ? "✓" : "✗"} ${kuvaus}`);
  if (!ehto) virheita++;
}
const odota = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function odotaKunnes<T>(kuvaus: string, hae: () => Promise<T>, ehto: (x: T) => boolean, maxMs = 240_000): Promise<T> {
  const alku = Date.now();
  let x = await hae();
  while (!ehto(x) && Date.now() - alku < maxMs) {
    await odota(3000);
    x = await hae();
  }
  ok(ehto(x), `${kuvaus} (${((Date.now() - alku) / 1000).toFixed(0)} s)`);
  return x;
}

type Tila = {
  ratingOverall?: number;
  ratingFood?: number;
  automaattinenArvosana?: { arvioijia: number; viimeisinArvio: string } | null;
};
const tila = () =>
  client.fetch<Tila | null>(`*[_id == $id][0]{ ratingOverall, ratingFood, automaattinenArvosana }`, { id: RID });
async function sivu(polku: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${SITE}${polku}`, { cache: "no-store", redirect: "manual" });
  return { status: res.status, html: await res.text() };
}

function arvostelu(id: string, arvioija: string, nimi: string, r: number, h: number, v: number) {
  return {
    _id: id,
    _type: "ravintolaKayttajaArvostelu",
    reviewerName: nimi,
    arvioija: { _type: "reference", _ref: arvioija },
    restaurant: { _type: "reference", _ref: RID },
    ratingFood: r,
    ratingPrice: h,
    ratingAtmosphere: v,
    comment: "Automaattinen testi, poistetaan heti.",
    submittedAt: new Date().toISOString(),
  };
}
/** Isän "Julkaise": luonnos julkaistuksi ja luonnos pois (kuten Studio). */
async function hyvaksy(id: string) {
  const luonnos = await client.getDocument(`drafts.${id}`);
  if (!luonnos) throw new Error(`luonnos ${id} puuttuu`);
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...sisalto } = luonnos;
  void _r; void _u; void _c;
  await client.transaction().createOrReplace({ ...sisalto, _id: id }).delete(`drafts.${id}`).commit({ visibility: "sync" });
}

async function siivoa() {
  const tx = client.transaction();
  for (const id of ["e2e-arvostelu-1", "e2e-arvostelu-2", "e2e-arvostelu-3"]) {
    tx.delete(id);
    tx.delete(`drafts.${id}`);
  }
  await tx.commit({ visibility: "sync" });
}

async function main() {
  const lahti = await client.fetch<string>(`*[_type == "kaupunki" && slug.current == "lahti"][0]._id`);

  console.log("1. Testiravintola ilman arvioita");
  await client.createOrReplace({
    _id: RID,
    _type: "ravintola",
    name: NIMI,
    slug: { _type: "slug", current: SLUG },
    city: { _type: "reference", _ref: lahti },
  });
  const s1 = await sivu(`/ravintolat/${SLUG}`);
  ok(s1.status === 404, `oma sivu piilossa (HTTP ${s1.status})`);

  console.log("2. Veikon arvostelu luonnoksena (lomake)");
  await client.create({ ...arvostelu("drafts.e2e-arvostelu-1", VEIKKO, "Veikko", 4, 4, 4) });
  await odota(30_000);
  const t2 = await tila();
  ok(!t2?.automaattinenArvosana, "luonnos ei vaikuta arvosanaan");

  console.log("3. Isä hyväksyy Veikon arvostelun");
  await hyvaksy("e2e-arvostelu-1");
  await odotaKunnes("webhook laski: 1 klubilainen, arvosana 4,0", tila, (x) => x?.automaattinenArvosana?.arvioijia === 1 && x.ratingOverall === 4);
  const s3 = await sivu(`/ravintolat/${SLUG}`);
  ok(s3.status === 404, `yksi arvioija: yhä piilossa (HTTP ${s3.status})`);
  await odotaKunnes("näkyy odottavien listalla", () => sivu("/ravintolat/odottavat"), (s) => s.html.includes(NIMI));

  console.log("4. Veikko arvioi uudelleen");
  await client.create({ ...arvostelu("drafts.e2e-arvostelu-2", VEIKKO, "Veikko", 2, 2, 2) });
  await hyvaksy("e2e-arvostelu-2");
  await odotaKunnes("uusi korvasi vanhan: yhä 1 klubilainen, arvosana 2,0", tila, (x) => x?.automaattinenArvosana?.arvioijia === 1 && x.ratingOverall === 2);
  const s4 = await sivu(`/ravintolat/${SLUG}`);
  ok(s4.status === 404, `sama klubilainen ei riitä: yhä piilossa (HTTP ${s4.status})`);

  console.log("5. Simo arvioi, isä hyväksyy");
  await client.create({ ...arvostelu("drafts.e2e-arvostelu-3", SIMO, "Simo", 5, 5, 5) });
  await hyvaksy("e2e-arvostelu-3");
  await odotaKunnes("webhook laski: 2 klubilaista, arvosana 3,5", tila, (x) => x?.automaattinenArvosana?.arvioijia === 2 && x.ratingOverall === 3.5);
  const s5 = await odotaKunnes("oma sivu julki (200)", () => sivu(`/ravintolat/${SLUG}`), (s) => s.status === 200);
  ok(s5.html.includes("Klubilaisten arvosanat") && s5.html.includes("Veikko") && s5.html.includes("Simo"), "sivulla taulukko: Veikko ja Simo");
  ok(s5.html.includes("Keskiarvo <!-- -->2<!-- --> klubilaisen arvosanasta"), "sivulla: Keskiarvo 2 klubilaisen arvosanasta");
  await odotaKunnes("hakemistossa (Lahti)", () => sivu("/ravintolat?kaupunki=lahti"), (s) => s.html.includes(NIMI));
  await odotaKunnes("poistui odottavien listalta", () => sivu("/ravintolat/odottavat"), (s) => !s.html.includes(NIMI));
}

main()
  .catch((e) => {
    virheita++;
    console.error("VIRHE:", e);
  })
  .finally(async () => {
    console.log("6. Siivous");
    try {
      await siivoa();
      await odotaKunnes("webhook palautti: ei laskettua arvosanaa", tila, (x) => !x?.automaattinenArvosana);
      await client.delete(RID);
      ok(!(await client.getDocument(RID)), "testiravintola poistettu");
      await odotaKunnes("oma sivu taas 404", () => sivu(`/ravintolat/${SLUG}`), (s) => s.status === 404);
      await odotaKunnes("ei hakemistossa", () => sivu("/ravintolat?kaupunki=lahti"), (s) => !s.html.includes(NIMI));
    } catch (e) {
      virheita++;
      console.error("SIIVOUSVIRHE:", e);
    }
    console.log(virheita === 0 ? "\nKAIKKI OK" : `\n${virheita} VIRHETTÄ`);
    process.exit(virheita === 0 ? 0 : 1);
  });
