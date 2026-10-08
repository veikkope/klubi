import {
  defineField,
  type SanityDocumentLike,
  type SlugRule,
  type TextRule,
  type ValidationBuilder,
} from "sanity";

import { polunMuutosViesti } from "../../../lib/ohjaukset";
import { apiVersion } from "../../env";

/**
 * Kentät jotka toistuvat kaikissa sisältötyypeissä.
 *
 * `tiivistelma` on sekä käyttöliittymä- että GEO-kenttä: se renderöityy sivun
 * alkuun ingressiksi ja toimii samalla vastauksena, jonka hakukone tai
 * tekoälyavustaja voi siteerata sellaisenaan. Katso `docs/11-maali-ja-
 * rinnakkaistoteutus.md` §7.
 *
 * `legacyUrl` sitoo dokumentin vanhaan .htm-osoitteeseen, jotta
 * `scripts/generate-redirects.ts` voi tuottaa 301-ohjaukset automaattisesti
 * eikä niitä tarvitse ylläpitää käsin 198 sivulle.
 */

/** Tyyppikohtaiset ohitukset tiivistelmäkentälle (docs/24 askel 1, Y10). */
export type TiivistelmanOhitukset = {
  title?: string;
  description?: string;
  validation?: ValidationBuilder<TextRule, string>;
};

export const tiivistelmaField = (group?: string, ohitukset: TiivistelmanOhitukset = {}) =>
  defineField({
    name: "tiivistelma",
    title: ohitukset.title ?? "Tiivistelmä",
    description:
      ohitukset.description ??
      "Näkyy sivun alussa isommalla tekstillä ja on se teksti, jonka hakukone " +
        "todennäköisimmin lainaa. 2–3 virkettä.",
    type: "text",
    rows: 3,
    validation:
      ohitukset.validation ??
      ((rule) => rule.max(300).warning("Suositus: alle 300 merkkiä — tiivistelmä, ei johdanto.")),
    ...(group ? { group } : {}),
  });

export const legacyUrlField = (group?: string) =>
  defineField({
    name: "legacyUrl",
    title: "Vanha osoite",
    description:
      "Vanhan sivuston polku, esim. /ruokailulahti.htm. Täytetään migraatiossa " +
      "automaattisesti. Älä muuta käsin — tämän varassa vanhat linkit ohjautuvat.",
    type: "string",
    readOnly: true,
    ...(group ? { group } : {}),
  });

/**
 * Muut vanhat osoitteet, jotka on yhdistetty tähän dokumenttiin (esim.
 * litmanen.htm + litmanenjari.htm + litmanenjaripatsas.htm → yksi pelaaja).
 * `legacyUrl` on pääosoite; nämä ohjataan samaan kohteeseen.
 */
export const muutLegacyUrlitField = (group?: string) =>
  defineField({
    name: "muutLegacyUrlit",
    title: "Muut vanhat osoitteet",
    description:
      "Vanhan sivuston muut polut, joiden sisältö on yhdistetty tähän. Täytetään " +
      "migraatiossa automaattisesti. Älä muuta käsin — vanhat linkit ohjautuvat näiden varassa.",
    type: "array",
    of: [{ type: "string" }],
    readOnly: true,
    ...(group ? { group } : {}),
  });

/**
 * Mitä tarkistaa: migraation kirjaama syy "Vaatii tarkistuksen" -lipulle
 * (scripts/patch-tarkistussyyt.ts). Näkyy vain, kun lippu on päällä.
 */
export const tarkistettavaaField = (group?: string) =>
  defineField({
    name: "tarkistettavaa",
    title: "Mitä tarkistaa",
    description: "Migraation huomio. Kun asia on kunnossa, ota rasti pois kohdasta Vaatii tarkistuksen.",
    type: "text",
    rows: 3,
    readOnly: true,
    hidden: ({ document }) => !document?.needsReview,
    ...(group ? { group } : {}),
  });

/** Migraation merkitsemä lippu: tieto vaatii ihmisen tarkistuksen. */
export const needsReviewField = (group?: string) =>
  defineField({
    name: "needsReview",
    title: "Vaatii tarkistuksen",
    description:
      "Migraatio ei saanut kaikkea tietoa varmasti oikein. Tarkista sisältö, ota rasti pois " +
      "ja paina lopuksi Julkaise: ennen julkaisua sivusto ja Tarkistettavat-lista näyttävät " +
      "yhä vanhaa.",
    type: "boolean",
    initialValue: false,
    // Vain migraation merkitsemille: uudessa dokumentissa rasti vain hämmentäisi.
    // Syyllinen dokumentti pysyy näkyvissä myös rastin poiston jälkeen (syy säilyy).
    hidden: ({ document }) => !document?.needsReview && !document?.tarkistettavaa,
    ...(group ? { group } : {}),
  });

/**
 * Polku on lukittu, kun sivusto hakee dokumentin juuri tällä slugilla
 * (esim. Litmanen-osio, klubin pääsivut, lib/path.ts). Muutos veisi koko
 * osion 404:ään eikä redirect auttaisi, joten varoitus ei riitä.
 */
export function koodiinSidottuSlug(
  document: SanityDocumentLike | undefined,
  lukitut: readonly string[],
): boolean {
  const slug = (document?.slug as { current?: string } | undefined)?.current;
  return Boolean(slug && lukitut.includes(slug));
}

/**
 * Aiemmat osoitteet (docs/24 askel 8): webhook (app/api/revalidate) lisää
 * vanhan osoitteen itse, kun julkaistun dokumentin osoite muuttuu, ja
 * 404-haara ohjaa sen nykyiseen osoitteeseen (308). Ohjattavilla tyypeillä
 * täysi polku (/uutiset/vanha), uutiskategorialla ja kaupungilla pelkkä
 * tunniste (suodattimen ?kategoria= tai ?kaupunki=).
 */
export const AIEMMAT_KUVAUS =
  "Osoitteet, joissa tämä on aiemmin ollut. Ne ohjautuvat tänne automaattisesti. " +
  "Sivusto lisää osoitteen itse, kun muutat osoitetta ja julkaiset.";

export const AIEMMAT_TUNNISTEET_KUVAUS =
  "Aiemmat osoitteet suodattimessa. Vanhat linkit ohjautuvat tähän automaattisesti. " +
  "Sivusto lisää osoitteen itse, kun muutat osoitetta ja julkaiset.";

export const aiemmatPolutField = (group?: string, kuvaus: string = AIEMMAT_KUVAUS) =>
  defineField({
    name: "aiemmatPolut",
    title: "Aiemmat osoitteet",
    description: kuvaus,
    type: "array",
    of: [{ type: "string" }],
    options: { layout: "tags" },
    readOnly: true,
    hidden: ({ value }) => !Array.isArray(value) || value.length === 0,
    ...(group ? { group } : {}),
  });

/** Sivun alasivujen määrä 60 sekunnin muistilla: sääntö ajetaan jokaisella näppäilyllä. */
const ALASIVUT_VOIMASSA_MS = 60_000;
const alasivuMuisti = new Map<string, { aika: number; maara: Promise<number> }>();

function alasivujenMaara(hae: () => Promise<number>, julkaistu: string): Promise<number> {
  const vanha = alasivuMuisti.get(julkaistu);
  if (vanha && Date.now() - vanha.aika < ALASIVUT_VOIMASSA_MS) return vanha.maara;
  const maara = hae().catch(() => 0);
  alasivuMuisti.set(julkaistu, { aika: Date.now(), maara });
  return maara;
}

/**
 * Sininen tieto, kun julkaistun dokumentin osoitetta (slug) muutetaan: vanha
 * osoite ohjautuu julkaisun jälkeen uuteen automaattisesti (docs/24 askel 8).
 * Sivulla kerrotaan lisäksi alasivujen määrä, koska alasivujen osoitteet eivät
 * muutu mukana. Tekstit: `polunMuutosViesti` (lib/ohjaukset.ts).
 */
export const polkuMuuttunut = (rule: SlugRule) =>
  rule
    .custom(async (slug, context) => {
      const id = context.document?._id;
      if (!slug?.current || !id) return true;
      const client = context.getClient({ apiVersion });
      const julkaistu = await client.fetch<string | null>(`*[_id == $id][0].slug.current`, {
        id: id.replace(/^drafts\./, ""),
      });
      if (!julkaistu || julkaistu === slug.current) return true;
      const tyyppi = context.document?._type ?? "";
      const alasivuja =
        tyyppi === "sivu"
          ? await alasivujenMaara(
              () =>
                client.fetch<number>(
                  `count(*[_type == "sivu" && !(_id in path("drafts.**")) && string::startsWith(slug.current, $etuliite)])`,
                  { etuliite: `${julkaistu}/` },
                ),
              julkaistu,
            )
          : 0;
      const category = (context.document as { category?: string } | undefined)?.category;
      return polunMuutosViesti(tyyppi, category, julkaistu, alasivuja).viesti;
    })
    .info();
