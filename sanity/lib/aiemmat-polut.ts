import {
  OHJATTAVAT_TYYPIT,
  TUNNISTE_TYYPIT,
  aiempienPolkujenMuutos,
  aiempienPolkujenMutaatiot,
  itsekorjausSallittu,
  osoitteenMuutos,
  type EnnenTiedot,
  type PolkuMutaatio,
} from "../../lib/ohjaukset";
import { routableProjection, type RoutableDoc } from "../../lib/path";

/**
 * Webhookin tallennus (docs/24 askel 8, K2): kun julkaistun dokumentin
 * osoite muuttuu, vanha osoite lisätään kenttään `aiemmatPolut`, josta
 * 404-haara ohjaa sen uuteen osoitteeseen (sanity/lib/ohjaus.ts).
 *
 * Vanha osoite ei saa kadota. Siksi:
 *  1. Patchataan vain olemassa olevat versiot (julkaistu ja luonnos): patch
 *     puuttuvaan luonnokseen kaataisi koko transaktion.
 *  2. Ei koko listan settiä, vaan atomiset operaatiot (setIfMissing, unset ja
 *     insert listan loppuun) erillisinä mutaatioina samassa transaktiossa:
 *     kaksi nopeaa julkaisua (A→B, B→C) eivät ylikirjoita toistensa lisäyksiä.
 *  3. Ennen-listan osoitteet, jotka puuttuvat nykyisestä, palautetaan
 *     (itsekorjaus), kun osoite muuttui tai edellinen versio on tuore
 *     (`itsekorjausSallittu`): isä avasi luonnoksen ennen webhookin patchia, ja
 *     seuraava julkaisu korvasi julkaistun version ilman lisättyä osoitetta.
 *  4. Ristiriidassa (esim. luonnos julkaistiin haun ja kirjoituksen välissä)
 *     yritetään uudelleen tuoreella haulla, enintään 3 kertaa.
 *
 * Patch laukaisee uuden webhookin, jonka `before().slug` on sama kuin
 * nykyinen, joten muutosta ei tule eikä silmukkaa synny.
 *
 * Moduuli ei sisällä salaisuuksia (kirjoittava client tulee parametrina
 * reitistä app/api/revalidate), joten sitä voi testata tsx:llä
 * (`npm run test:ohjaukset`).
 */

export type AiempiOsoiteKutsu = { _id: string; _type: string; slug?: string | null; ennen: EnnenTiedot };

/** "ok": kirjoitettu; "ei-muutosta": mitään ei tarvittu; "virhe": kirjoitus epäonnistui (webhook 500). */
export type TallennuksenTulos = "ok" | "ei-muutosta" | "virhe";

/** Clientin osa, jota tallennus käyttää (testeissä korvike). */
export type KirjoittavaClient = {
  fetch<T>(query: string, params: Record<string, unknown>): Promise<T>;
  mutate(mutaatiot: PolkuMutaatio[], options: { visibility: "sync" }): Promise<unknown>;
};

export const YRITYKSET = 3;

type Versio = { _id: string; aiemmatPolut?: string[] | null };
type Haku = { doc: (RoutableDoc & Versio) | null; versiot: Versio[] };

const HAKU = /* groq */ `{
  "doc": *[_id == $id][0]{ ${routableProjection}, aiemmatPolut },
  "versiot": *[_id in [$id, "drafts." + $id]]{ _id, aiemmatPolut }
}`;

/** Webhookin kutsu: "varoitus" = vanha projektio, "tarkista" = osoite voi muuttua, "ohita" = ei mitään. */
export function aiemmanOsoitteenKasittely(body: {
  _id?: string;
  _type?: string;
  slug?: string | null;
  operaatio?: string;
  ennen?: EnnenTiedot | null;
}): "varoitus" | "tarkista" | "ohita" {
  if (!body._type || (!OHJATTAVAT_TYYPIT.has(body._type) && !TUNNISTE_TYYPIT.has(body._type))) return "ohita";
  if (body.operaatio === undefined) return "varoitus";
  if (body.operaatio !== "update" || !body._id || !body.ennen) return "ohita";
  return tarvitseeTarkistuksen({ _id: body._id, _type: body._type, slug: body.slug, ennen: body.ennen }) ? "tarkista" : "ohita";
}

/** Tarvitaanko hakua lainkaan: osoite muuttui, tai ennen-listassa voi olla itsekorjattavaa. */
export function tarvitseeTarkistuksen(kutsu: AiempiOsoiteKutsu): boolean {
  if (!OHJATTAVAT_TYYPIT.has(kutsu._type) && !TUNNISTE_TYYPIT.has(kutsu._type)) return false;
  if ((kutsu.ennen.aiemmatPolut ?? []).length > 0) return true;
  // Tilaston osoite riippuu myös kategoriasta ja osiosta, joita payload ei kerro.
  if (kutsu._type === "jalkapalloTilasto") return true;
  return (kutsu.ennen.slug ?? null) !== (kutsu.slug ?? null);
}

function onRistiriita(error: unknown): boolean {
  return (error as { statusCode?: number } | null)?.statusCode === 409;
}

export async function tallennaAiempiOsoite(
  client: KirjoittavaClient,
  kutsu: AiempiOsoiteKutsu,
  nyt: () => Date = () => new Date(),
): Promise<TallennuksenTulos> {
  if (!tarvitseeTarkistuksen(kutsu)) return "ei-muutosta";
  const id = kutsu._id.replace(/^drafts\./, "");
  for (let yritys = 1; ; yritys++) {
    try {
      const { doc, versiot } = await client.fetch<Haku>(HAKU, { id });
      // Dokumentti poistettiin tai piilotettiin välissä: ei mitään ohjattavaa.
      if (!doc) return "ei-muutosta";
      const { vanha, uusi } = osoitteenMuutos(kutsu._type, kutsu.ennen, doc);
      const ennenLista = itsekorjausSallittu(kutsu.ennen, vanha, uusi, nyt()) ? kutsu.ennen.aiemmatPolut : null;
      const mutaatiot: PolkuMutaatio[] = [];
      for (const versio of versiot) {
        const muutos = aiempienPolkujenMuutos(versio.aiemmatPolut, ennenLista, vanha, uusi);
        if (muutos) mutaatiot.push(...aiempienPolkujenMutaatiot(versio._id, muutos));
      }
      if (mutaatiot.length === 0) return "ei-muutosta";
      await client.mutate(mutaatiot, { visibility: "sync" });
      console.log(`[revalidate] aiempi osoite tallennettu: ${id} ${vanha ?? "–"} → ${uusi ?? "–"}`);
      return "ok";
    } catch (error) {
      const syy = error instanceof Error ? error.message : String(error);
      if (onRistiriita(error) && yritys < YRITYKSET) {
        console.warn(`[revalidate] aiemman osoitteen tallennus: ristiriita, yritetään uudelleen (${yritys}/${YRITYKSET}): ${syy}`);
        continue;
      }
      console.error(`[revalidate] aiempaa osoitetta ei tallennettu: ${id} (${syy})`);
      return "virhe";
    }
  }
}
