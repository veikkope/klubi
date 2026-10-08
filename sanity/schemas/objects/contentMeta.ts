import {
  defineField,
  type Rule,
  type SanityDocumentLike,
  type SlugRule,
  type TextRule,
  type ValidationBuilder,
} from "sanity";

import { tarkistaLinkki } from "../../../lib/linkki";
import { apiVersion } from "../../env";
import { linkinKohdeVaroitus } from "../../lib/linkin-kohde";

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
 * Varoitus, kun julkaistun dokumentin polkua (slug) muutetaan: vanhat linkit
 * (Google, jaetut linkit, vanhan sivuston ohjaukset) lakkaisivat toimimasta.
 * Varoitus ei estä julkaisua, koska polun korjaus voi olla tarkoituksellinen;
 * silloin kehittäjä lisää ohjauksen (CLAUDE.md: 301-ohjaukset).
 */
export const polkuMuuttunut = (rule: SlugRule) =>
  rule
    .custom(async (slug, context) => {
      const id = context.document?._id;
      if (!slug?.current || !id) return true;
      const julkaistu = await context
        .getClient({ apiVersion })
        .fetch<string | null>(`*[_id == $id][0].slug.current`, { id: id.replace(/^drafts\./, "") });
      if (!julkaistu || julkaistu === slug.current) return true;
      return (
        `Julkaistu osoite on "${julkaistu}". Jos muutat sen, vanhat linkit tähän sivuun lakkaavat ` +
        "toimimasta. Palauta vanha osoite, tai pyydä kehittäjää lisäämään ohjaus ennen julkaisua."
      );
    })
    .warning();

/**
 * Valikon ja pikalinkkien `href`-kenttä (string, koska sivuston oma polku ei
 * kelpaa url-tyypille). Hyväksyy sivuston polun (`/uutiset`), täyden
 * osoitteen (`https://…`), sähköpostin (`mailto:`) ja puhelinnumeron (`tel:`).
 * Tyypillinen virhe on unohtunut kauttaviiva tai "www."-alku, jolloin linkki
 * osoittaisi nykyisen sivun alle ja päätyisi 404:ään (lib/linkki.ts).
 */
export const linkkiValidointi = (rule: Rule) => [
  rule.required().custom<string>((href) => tarkistaLinkki(href)),
  linkinKohdeVaroitus(rule),
];

/** Sama kuin `linkkiValidointi`, mutta kentän saa jättää tyhjäksi. */
export const valinnainenLinkkiValidointi = (rule: Rule) => [
  rule.custom<string>((href) => tarkistaLinkki(href)),
  linkinKohdeVaroitus(rule),
];
