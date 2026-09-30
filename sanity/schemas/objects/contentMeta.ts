import { defineField, type SlugRule } from "sanity";

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

export const tiivistelmaField = (group?: string) =>
  defineField({
    name: "tiivistelma",
    title: "Tiivistelmä",
    description:
      "2–3 virkettä, jotka vastaavat sivun kysymykseen itsenäisesti. Näkyy sivun " +
      "alussa ingressinä ja on se teksti, jonka hakukone todennäköisimmin lainaa.",
    type: "text",
    rows: 3,
    validation: (rule) =>
      rule.max(300).warning("Suositus: alle 300 merkkiä — tiivistelmä, ei johdanto."),
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
      "Migraatio ei saanut kaikkea tietoa varmasti oikein. Tarkista sisältö ja " +
      "ota rasti pois kun olet käynyt sen läpi.",
    type: "boolean",
    initialValue: false,
    ...(group ? { group } : {}),
  });

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
        `Julkaistu polku on "${julkaistu}". Jos muutat sen, vanhat linkit tähän sivuun lakkaavat ` +
        "toimimasta. Palauta vanha polku, tai pyydä kehittäjää lisäämään ohjaus ennen julkaisua."
      );
    })
    .warning();
