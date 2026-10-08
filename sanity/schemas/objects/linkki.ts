import { LinkIcon } from "@sanity/icons";
import { defineField, defineType, type Rule } from "sanity";

import {
  LINKIN_KOHDETYYPIT,
  linkinKuvaus,
  linkinTyyppi,
  onLinkkiTaytetty,
  osoiteKaytossa,
  tarkistaOsoite,
  valittuTyyppi,
} from "../../../lib/linkki";
import { projectId } from "../../env";
import { kohteenTila, sivullaOnValinta, tarkistaLinkinKohde } from "../../lib/linkin-kohde";
import { liitetiedostoKentta } from "./liite";

/**
 * Linkkiobjekti (docs/24 askel 4, §2.2). Jokainen linkki valitaan kolmesta
 * vaihtoehdosta: Sivuston sivu (viittaus, seuraa osoitteen muutosta), Muu
 * osoite (toinen sivusto, sähköposti, puhelin tai oma polku, jolle ei ole
 * dokumenttia) tai Tiedosto (PDF, Word, Excel).
 *
 * Kaksi käyttötapaa:
 *  - `...linkkiKentat({ pakollinen })` objektiin, jossa on jo oma teksti
 *    (valikko, pikalinkit, tekstin linkki, klubin toiminnan vuosilinkki).
 *    Vanhan datan `href` on suoraan kelvollinen Muu osoite.
 *  - nimetty tyyppi `linkki` itsenäisiin linkkikenttiin (etusivun napit).
 *
 * Piilotetun kentän sääntö ajetaan Sanityssa myös piilossa, joten jokainen
 * sääntö palauttaa true, kun kenttä ei ole käytössä. Poikkeus on käyttämätön
 * sivuvalinta: se varoittaa, koska vahva viittaus estäisi sivun poiston.
 */

type LinkinArvo = Parameters<typeof onLinkkiTaytetty>[0];

const tyyppi = (parent: unknown) => linkinTyyppi(parent as LinkinArvo);

export function linkkiKentat({ pakollinen }: { pakollinen: boolean }) {
  return [
    defineField({
      name: "tyyppi",
      title: "Mihin linkki vie?",
      type: "string",
      description:
        "Sivuston sivu pysyy kunnossa, vaikka sivun osoite muuttuisi. Muu osoite on toinen sivusto, sähköposti tai puhelinnumero.",
      options: {
        list: [
          { title: "Sivuston sivu", value: "sivu" },
          { title: "Muu osoite", value: "osoite" },
          { title: "Tiedosto", value: "tiedosto" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      ...(pakollinen ? { initialValue: "sivu" } : {}),
    }),
    defineField({
      name: "kohde",
      title: "Sivu",
      type: "reference",
      description: "Kirjoita sivun, uutisen, ravintolan tai muun sisällön nimen alkua ja valitse listasta.",
      to: LINKIN_KOHDETYYPIT.map((type) => ({ type })),
      options: { disableNew: true, filter: "defined(slug.current)" },
      // Käyttämätön valinta näkyy, jotta sen voi tyhjentää (varoitus alla).
      hidden: ({ parent, value }) => tyyppi(parent) !== "sivu" && !value,
      validation: (rule) => [
        rule.custom((arvo: { _ref?: string } | undefined, konteksti) => {
          if (!pakollinen || tyyppi(konteksti.parent) !== "sivu") return true;
          return arvo?._ref ? true : "Valitse sivu, johon linkki vie.";
        }),
        // Valinnainen linkki: Sivuston sivu valittu, mutta sivu puuttuu.
        rule
          .custom((arvo: { _ref?: string } | undefined, konteksti) => {
            if (pakollinen || tyyppi(konteksti.parent) !== "sivu" || arvo?._ref) return true;
            return "Valitse sivu, johon linkki vie, tai tyhjennä valinta Mihin linkki vie?.";
          })
          .warning(),
        rule.custom(async (arvo: { _ref?: string } | undefined, konteksti) => {
          if (tyyppi(konteksti.parent) !== "sivu" || !arvo?._ref) return true;
          const tila = await kohteenTila(arvo, konteksti);
          return tila?.taso === "virhe" ? tila.viesti : true;
        }),
        rule
          .custom(async (arvo: { _ref?: string } | undefined, konteksti) => {
            if (!arvo?._ref) return true;
            if (tyyppi(konteksti.parent) !== "sivu") {
              return "Tätä valintaa ei käytetä, koska linkki vie nyt muualle. Tyhjennä se (kolme pistettä → Tyhjennä), muuten valittua sivua ei voi poistaa.";
            }
            const tila = await kohteenTila(arvo, konteksti);
            return tila?.taso === "varoitus" ? tila.viesti : true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "href",
      title: "Osoite",
      // Merkkijono eikä url-tyyppi: sivuston oma polku (/…) ei kelpaa url-tyypille.
      type: "string",
      description:
        "Toinen sivusto (https://…), sähköposti (mailto:nimi@esimerkki.fi) tai puhelin (tel:+358…). Sivuston omalle sivulle valitse Sivuston sivu. Osoite /… vain silloin, kun sivua ei löydy listasta (esim. /uutiset/arkisto/2016).",
      // Näkyy myös, kun tyyppiä ei ole valittu (vanha linkki): muuten kenttä
      // piiloutuisi kesken kirjoituksen, kun vanha osoite tyhjennetään, ja
      // pakollinen linkki tallentuisi tyhjänä. Valinnaisessa linkissä tyhjä
      // ja valitsematon kenttä pysyy piilossa.
      hidden: ({ parent, value }) =>
        !osoiteKaytossa(parent as LinkinArvo) || (!pakollinen && !valittuTyyppi(parent as LinkinArvo) && !value),
      validation: (rule) => [
        // Sivuston oma tiedosto osoitteena on virhe: siivous ei näe sitä käytetyksi (docs/24 askel 7).
        rule.custom<string>((href, konteksti) =>
          tarkistaOsoite(href, konteksti.parent as LinkinArvo, pakollinen, projectId),
        ),
        // Valinnainen linkki: Muu osoite valittu, mutta osoite puuttuu.
        rule
          .custom<string>((href, konteksti) =>
            !pakollinen && !href && valittuTyyppi(konteksti.parent as LinkinArvo) === "osoite"
              ? "Kirjoita osoite, tai tyhjennä valinta Mihin linkki vie?."
              : true,
          )
          .warning(),
        rule
          .custom<string>((href, konteksti) =>
            osoiteKaytossa(konteksti.parent as LinkinArvo) ? tarkistaLinkinKohde(href) : true,
          )
          .warning(),
        rule
          .custom<string>((href, konteksti) =>
            osoiteKaytossa(konteksti.parent as LinkinArvo) ? sivullaOnValinta(href, konteksti) : true,
          )
          .warning(),
      ],
    }),
    liitetiedostoKentta({
      name: "tiedosto",
      pakollinen,
      aktiivinen: (parent) => tyyppi(parent) === "tiedosto",
      // Käyttämätön tiedosto näkyy, jotta sen voi tyhjentää (varoitus liite.ts:ssä).
      hidden: ({ parent, value }) => tyyppi(parent) !== "tiedosto" && !value,
      kayttamatonVaroitus:
        "Tiedosto on yhä tallessa, vaikka linkki ei käytä sitä. Tyhjennä se (kolme pistettä → Tyhjennä kenttä), jottei se jää turhaan julkiseksi.",
      tyhjaVaroitus: pakollinen ? undefined : "Lisää tiedosto, tai tyhjennä valinta Mihin linkki vie?.",
    }),
  ];
}

/**
 * Isäntäkentän sääntö, kun nimetty `linkki` on pakollinen (askeleen 6
 * painike, askeleen 8 ohjaus).
 */
export const vaadiLinkki = (rule: Rule) =>
  rule.custom((arvo) => onLinkkiTaytetty(arvo as LinkinArvo) || "Valitse, mihin linkki vie.");

type EsikatselunArvot = {
  otsikko?: string;
  tyyppi?: string;
  href?: string;
  kohdeTyyppi?: string;
  kohdeSlug?: string;
  kohdeOtsikko?: string;
  kohdeNimi?: string;
  tiedostonNimi?: string;
};

/** Esikatselun kentät: otsikko ja alaotsikko "→ /klubi", "→ https://…" tai "Tiedosto: saannot.pdf". */
export function linkinEsikatselunKentat(otsikkoKentta?: string) {
  return {
    ...(otsikkoKentta ? { otsikko: otsikkoKentta } : {}),
    tyyppi: "tyyppi",
    href: "href",
    kohdeTyyppi: "kohde._type",
    kohdeSlug: "kohde.slug.current",
    kohdeOtsikko: "kohde.title",
    kohdeNimi: "kohde.name",
    tiedostonNimi: "tiedosto.asset.originalFilename",
  };
}

/** Esikatselun otsikko ja alaotsikko `linkinEsikatselunKentat`-arvoista. */
export function linkinEsikatselunTekstit(arvot: EsikatselunArvot): { title: string; subtitle: string } {
  const nimi = arvot.kohdeOtsikko || arvot.kohdeNimi;
  return {
    title: arvot.otsikko || nimi || "Linkki",
    subtitle: linkinKuvaus({ ...arvot, kohdeNimi: nimi }),
  };
}

/** Linkin esikatselu Studion listoissa. `otsikkoKentta`: isäntäobjektin tekstikenttä (esim. "label"). */
export function linkinEsikatselu(otsikkoKentta?: string) {
  return {
    select: linkinEsikatselunKentat(otsikkoKentta),
    prepare: (arvot: EsikatselunArvot) => linkinEsikatselunTekstit(arvot),
  };
}

/** Nimetty linkkiobjekti itsenäisiin linkkikenttiin. Itsessään valinnainen (`vaadiLinkki`). */
export const linkki = defineType({
  name: "linkki",
  title: "Linkki",
  type: "object",
  icon: LinkIcon,
  fields: linkkiKentat({ pakollinen: false }),
  preview: linkinEsikatselu(),
});
