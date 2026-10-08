import {
  ArchiveIcon,
  BellIcon,
  ClockIcon,
  CommentIcon,
  EditIcon,
  ControlsIcon,
  DatabaseIcon,
  DocumentIcon,
  DocumentsIcon,
  EnvelopeIcon,
  HomeIcon,
  LemonIcon,
  MenuIcon,
  TagIcon,
  UsersIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import type { ComponentType } from "react";
import type { DefaultDocumentNodeResolver, StructureBuilder, StructureResolver } from "sanity/structure";
import {
  OSIOSIVUT,
  osioSivu,
  osioSivuId,
  type OsioSivuSlug,
  type StudionRyhma,
} from "../lib/osiosivut";
import { PALLOVEIKKAUS_SLUG } from "../lib/path";
import { JULKINEN_RAVINTOLA } from "../lib/ravintola-arvosana";
import { PalautaPoistettu } from "./components/varmuuskopio/palauta-poistettu";
import { ODOTTAVAT_ARVOSTELUT, TARKISTETTAVAT_TYYPIT, TEHTAVAT } from "./lib/tehtavat";

/**
 * Sanity Studion vasemman valikon järjestys (docs/09, docs/24 §2.6).
 *
 * - Jokaisella kohdalla on kiinteä tunnus (`.id()`), joten Studion osoitteet
 *   eivät muutu, kun otsikoita muutetaan.
 * - Etusivu, Navigaatio ja Varmuuskopiot ovat "Sivuston asetukset" -osiossa;
 *   Yhteystiedot (singleton) on Klubi-ryhmässä. Singletoneista ei voi luoda kopioita.
 * - Singleton `asetukset` ei ole valikossa: mikään sen kentistä ei
 *   vaikuta sivustoon. Logo on tyylioppaan brändikuva (public/brand, sininen ja
 *   valkoinen versio), kuvaus tulee etusivulta ja jakokuvat generoidaan
 *   (app/api/og). Skeema säilyy, jotta vanha data pysyy validina (docs/16 §5).
 * - Tyypit on järjestetty käyttötarkoituksen mukaan: ensin se, mitä sihteeri
 *   päivittää usein (uutiset, ottelut, tapahtumat), sitten arkistot.
 * - "Tarkistettavat" kokoaa migraation merkitsemät dokumentit tyypeittäin, joten
 *   ne on helppo käydä läpi yksi kerrallaan.
 * - Osioiden sivut (lib/osiosivut.ts) avataan kiinteällä tunnuksella. Jos
 *   dokumenttia ei vielä ole, pohja `lukittu-sivu` täyttää koodin oletustekstit.
 *   Klubin viisi sivua ovat vain Klubi-ryhmässä, muut kohdassa Osioiden sivut.
 *   Sivut-lista näyttää vain omat sivut.
 */

/** Tehtävän kuvake Studion valikossa (rekisteri: sanity/lib/tehtavat.ts). */
const TEHTAVAN_KUVAKE: Record<string, ComponentType | undefined> = {
  kommentit: CommentIcon,
  julkaisemattomat: EditIcon,
  ajastetut: ClockIcon,
  tarkistettavat: WarningOutlineIcon,
};

/**
 * "Tehtävät sinulle" (docs/23 Y11, Y35): kaikki, mikä odottaa sihteerin
 * toimia, yhdessä paikassa. Tyhjä lista = ei tehtävää. Rekisteri ja ehdot
 * ovat tiedostossa sanity/lib/tehtavat.ts, josta myös Aloitus-näkymä laskee
 * laskurit. Jokaisella kohdalla on kiinteä tunnus: /studio/structure/tehtavat;<id>.
 */
const tehtavat = (S: StructureBuilder) =>
  S.listItem()
    .id("tehtavat")
    .title("Tehtävät sinulle")
    .icon(BellIcon)
    .child(
      S.list()
        .title("Tehtävät sinulle")
        .items(
          TEHTAVAT.map((t) => {
            let lista = S.documentList()
              .title(t.listanOtsikko ?? t.otsikko)
              .filter(t.suodatin)
              .defaultOrdering(t.jarjestys);
            if (t.tyyppi) lista = lista.schemaType(t.tyyppi);
            if (t.params) lista = lista.params(t.params);
            let kohta = S.listItem().id(t.id).title(t.otsikko).child(lista);
            if (t.tyyppi) kohta = kohta.schemaType(t.tyyppi);
            const kuvake = TEHTAVAN_KUVAKE[t.id];
            return kuvake ? kohta.icon(kuvake) : kohta;
          }),
        ),
    );

const lista = (S: StructureBuilder, tyyppi: string, otsikko: string, id?: string) => {
  const kohta = S.listItem().title(otsikko).schemaType(tyyppi).child(S.documentTypeList(tyyppi).title(otsikko));
  return id ? kohta.id(id) : kohta;
};

/**
 * Osion sivu kiinteällä tunnuksella (docs/24 §2.6). `id` vain Klubi-ryhmässä,
 * jossa kohdan nimi kertoo sivun tehtävän; muuten kohdan tunnus on sivun tunnus.
 */
const lukittuSivu = (S: StructureBuilder, slug: OsioSivuSlug, otsikko?: string, id?: string) =>
  S.listItem()
    .id(id ?? osioSivuId(slug))
    .title(otsikko ?? osioSivu(slug)?.nimi ?? slug)
    .icon(DocumentIcon)
    .child(
      S.document()
        .schemaType("sivu")
        .documentId(osioSivuId(slug))
        .initialValueTemplate("lukittu-sivu", { slug }),
    );

/** Tavallisen sivun pohja: lukitun sivun pohja ei kuulu listojen Luo-painikkeeseen. */
const sivunPohja = (S: StructureBuilder) => [S.initialValueTemplateItem("sivu")];

/** Klubi-ryhmä (docs/23 Y25): sama rakenne kuin sivuston Klubi-osiossa. */
const klubi = (S: StructureBuilder) =>
  S.listItem()
    .id("klubi")
    .title("Klubi")
    .icon(UsersIcon)
    .child(
      S.list()
        .title("Klubi")
        .items([
          lukittuSivu(S, "klubi", "Esittely", "esittely"),
          S.listItem()
            .id("toiminta")
            .title("Toiminta")
            .schemaType("klubiToiminta")
            .child(
              S.list()
                .title("Toiminta")
                .items([
                  lukittuSivu(S, "klubi/toiminta", "Toiminta-sivun otsikko ja johdanto", "toiminta-sivu"),
                  // Sama järjestys kuin Toiminta-sivulla (queries/klubi.ts, klubiToimintaListQuery).
                  S.listItem()
                    .id("toimintamuodot")
                    .title("Toimintamuodot")
                    .schemaType("klubiToiminta")
                    .child(
                      S.documentTypeList("klubiToiminta")
                        .title("Toimintamuodot")
                        .defaultOrdering([
                          { field: "jarjestys", direction: "asc" },
                          { field: "title", direction: "asc" },
                        ]),
                    ),
                ]),
            ),
          S.listItem()
            .id("hallitus")
            .title("Hallitus")
            .schemaType("hallitusJasen")
            .child(
              S.list()
                .title("Hallitus")
                .items([
                  lukittuSivu(S, "klubi/hallitus", "Hallitus-sivun otsikko ja johdanto", "hallitus-sivu"),
                  S.listItem()
                    .id("nykyinen")
                    .title("Nykyinen hallitus")
                    .schemaType("hallitusJasen")
                    .child(
                      S.documentList()
                        .title("Nykyinen hallitus")
                        .schemaType("hallitusJasen")
                        .filter(`_type == "hallitusJasen" && nykyinen != false`)
                        .defaultOrdering([{ field: "order", direction: "asc" }]),
                    ),
                  // Jäsentä ei poisteta, vaan Nykyinen jäsen -rasti otetaan pois (docs/09).
                  S.listItem()
                    .id("entiset")
                    .title("Entiset jäsenet")
                    .schemaType("hallitusJasen")
                    .child(
                      S.documentList()
                        .title("Entiset jäsenet")
                        .schemaType("hallitusJasen")
                        .filter(`_type == "hallitusJasen" && nykyinen == false`)
                        .defaultOrdering([{ field: "name", direction: "asc" }])
                        .initialValueTemplates([]),
                    ),
                ]),
            ),
          S.listItem()
            .id("palloveikkaus")
            .title("Palloveikkaus")
            .icon(DocumentsIcon)
            .child(
              S.list()
                .title("Palloveikkaus")
                .items([
                  lukittuSivu(S, "klubi/palloveikkaus", "Palloveikkaus-sivu", "palloveikkaus-sivu"),
                  // Jokainen veikkaus on oma sivunsa polulla klubi/palloveikkaus/…
                  // (sama järjestys kuin sivuston korteissa: luontijärjestys).
                  S.listItem()
                    .id("veikkausten-alasivut")
                    .title("Veikkausten alasivut")
                    .schemaType("sivu")
                    .child(
                      S.documentList()
                        .title("Veikkausten alasivut")
                        .schemaType("sivu")
                        .filter(
                          `_type == "sivu" && defined(slug.current) && string::startsWith(slug.current, $etuliite)`,
                        )
                        .params({ etuliite: `${PALLOVEIKKAUS_SLUG}/` })
                        .defaultOrdering([{ field: "_createdAt", direction: "asc" }])
                        .initialValueTemplates(sivunPohja(S)),
                    ),
                ]),
            ),
          S.listItem()
            .id("yhteystiedot")
            .title("Yhteystiedot")
            .icon(EnvelopeIcon)
            .child(
              S.list()
                .title("Yhteystiedot")
                .items([
                  S.listItem()
                    .id("yhteystiedot-tiedot")
                    .title("Osoite, sähköposti ja some")
                    .icon(EnvelopeIcon)
                    .child(S.document().schemaType("yhteystiedot").documentId("yhteystiedot")),
                  lukittuSivu(S, "klubi/yhteystiedot", "Yhteystiedot-sivun otsikko ja johdanto", "yhteystiedot-sivu"),
                ]),
            ),
        ]),
    );

/** Osioiden sivujen alaryhmät (R9: Klubin sivut vain Klubi-ryhmässä). */
const OSIOIDEN_RYHMAT: { ryhma: Exclude<StudionRyhma, "klubi">; otsikko: string }[] = [
  { ryhma: "uutiset", otsikko: "Uutiset ja tapahtumat" },
  { ryhma: "ravintolat", otsikko: "Ravintolat" },
  { ryhma: "jalkapalloarkisto", otsikko: "Jalkapalloarkisto" },
];

const osioidenSivut = (S: StructureBuilder) =>
  S.listItem()
    .id("osiosivut")
    .title("Osioiden sivut")
    .icon(DocumentsIcon)
    .child(
      S.list()
        .title("Osioiden sivut: otsikot ja johdannot")
        .items(
          OSIOIDEN_RYHMAT.map(({ ryhma, otsikko }) =>
            S.listItem()
              .id(`osiosivut-${ryhma}`)
              .title(otsikko)
              .icon(DocumentsIcon)
              .child(
                S.list()
                  .title(otsikko)
                  .items(OSIOSIVUT.filter((o) => o.ryhma === ryhma).map((o) => lukittuSivu(S, o.slug))),
              ),
          ),
        ),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sisältö")
    .items([
      tehtavat(S),

      S.listItem()
        .id("asetukset")
        .title("Sivuston asetukset")
        .icon(ControlsIcon)
        .child(
          S.list()
            .title("Sivuston asetukset")
            .items([
              S.listItem()
                .id("etusivu")
                .title("Etusivu")
                .icon(HomeIcon)
                .child(S.document().schemaType("etusivu").documentId("etusivu")),
              S.listItem()
                .id("navigaatio")
                .title("Navigaatio")
                .icon(MenuIcon)
                .child(S.document().schemaType("navigaatio").documentId("navigaatio")),
              S.listItem()
                .id("varmuuskopiot")
                .title("Varmuuskopiot")
                .icon(DatabaseIcon)
                .child(
                  S.documentTypeList("varmuuskopio")
                    .title("Varmuuskopiot (viikoittain, automaattinen)")
                    .defaultOrdering([{ field: "paiva", direction: "desc" }])
                    .initialValueTemplates([])
                    .menuItems([]),
                ),
            ]),
        ),

      S.listItem()
        .id("tarkistettavat")
        .title("Tarkistettavat")
        .icon(WarningOutlineIcon)
        .child(
          S.list()
            .title("Vaatii tarkistuksen")
            .items(
              TARKISTETTAVAT_TYYPIT.map(({ tyyppi, otsikko }) =>
                S.listItem()
                  .title(otsikko)
                  .schemaType(tyyppi)
                  .child(
                    S.documentList()
                      .title(`${otsikko}: tarkistettavat`)
                      .schemaType(tyyppi)
                      .filter(`_type == $tyyppi && needsReview == true`)
                      .params({ tyyppi }),
                  ),
              ),
            ),
        ),

      S.divider(),

      S.listItem()
        .id("uutiset")
        .title("Uutiset")
        .schemaType("uutinen")
        .child(
          S.documentTypeList("uutinen")
            .title("Uutiset")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
      S.listItem()
        .id("uutiskategoriat")
        .title("Uutiskategoriat")
        .icon(TagIcon)
        .schemaType("uutisKategoria")
        .child(
          S.documentTypeList("uutisKategoria")
            .title("Uutiskategoriat")
            .defaultOrdering([
              { field: "jarjestys", direction: "asc" },
              { field: "nimi", direction: "asc" },
            ]),
        ),
      S.listItem()
        .id("kommentit")
        .title("Kommentit ja veikkaukset")
        .icon(CommentIcon)
        .child(
          S.list()
            .title("Kommentit ja veikkaukset")
            .items([
              S.listItem()
                .title("Uusimmat")
                .schemaType("kommentti")
                .child(
                  S.documentTypeList("kommentti")
                    .title("Uusimmat kommentit")
                    .defaultOrdering([{ field: "lahetetty", direction: "desc" }]),
                ),
              // Yhden veikkauksen tai keskustelun läpikäynti: uutinen → sen kommentit.
              S.listItem()
                .title("Uutisittain")
                .schemaType("uutinen")
                .child(
                  S.documentList()
                    .title("Uutiset, joilla on kommentteja")
                    .schemaType("uutinen")
                    .filter(`_type == "uutinen" && count(*[_type == "kommentti" && uutinen._ref == ^._id]) > 0`)
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                    .child((uutinenId) =>
                      S.documentList()
                        .title("Uutisen kommentit")
                        .schemaType("kommentti")
                        .filter(`_type == "kommentti" && uutinen._ref == $uutinenId`)
                        .params({ uutinenId: uutinenId.replace(/^drafts\./, "") })
                        .defaultOrdering([{ field: "lahetetty", direction: "desc" }])
                        .initialValueTemplates([]),
                    ),
                ),
              S.listItem()
                .title("Piilotetut")
                .schemaType("kommentti")
                .child(
                  S.documentList()
                    .title("Piilotetut kommentit")
                    .schemaType("kommentti")
                    .filter(`_type == "kommentti" && piilotettu == true`)
                    .defaultOrdering([{ field: "lahetetty", direction: "desc" }]),
                ),
            ]),
        ),
      S.listItem()
        .id("ottelut")
        .title("Ottelut")
        .schemaType("ottelu")
        .child(S.documentTypeList("ottelu").title("Ottelut").defaultOrdering([{ field: "aika", direction: "asc" }])),
      S.listItem()
        .id("tapahtumat")
        .title("Tapahtumat")
        .schemaType("tapahtuma")
        .child(
          S.documentTypeList("tapahtuma")
            .title("Tapahtumat")
            .defaultOrdering([{ field: "startsAt", direction: "desc" }]),
        ),
      lista(S, "galleriaAlbumi", "Galleria-albumit", "galleria"),
      // Omat sivut: ilman osioiden sivuja ja palloveikkauksen alasivuja (ne ovat
      // Klubi-ryhmässä ja Osioiden sivuissa). Tietosuojaseloste on täällä.
      S.listItem()
        .id("sivut")
        .title("Sivut")
        .schemaType("sivu")
        .child(
          S.documentList()
            .title("Sivut")
            .schemaType("sivu")
            .filter(
              // Osiosivut näkyvät omissa ryhmissään. Suodatus tunnuksella, ei osoitteella:
              // tavallinen sivu, jolla on vahingossa osion osoite, pysyy tässä listassa.
              `_type == "sivu" && !(_id in $lukitut) && ` +
                `!(defined(slug.current) && string::startsWith(slug.current, $veikkaukset))`,
            )
            .params({
              lukitut: OSIOSIVUT.flatMap((o) => [osioSivuId(o.slug), `drafts.${osioSivuId(o.slug)}`]),
              veikkaukset: `${PALLOVEIKKAUS_SLUG}/`,
            })
            .initialValueTemplates(sivunPohja(S)),
        ),

      S.divider(),

      klubi(S),

      S.divider(),

      S.listItem()
        .id("ravintolat")
        .title("Ravintolat")
        .icon(LemonIcon)
        .child(
          S.list()
            .title("Ravintolat")
            .items([
              lista(S, "ravintola", "Kaikki ravintolat"),
              S.listItem()
                .title("Ravintolat: odottavat toista arvioijaa")
                .schemaType("ravintola")
                .child(
                  // Klubin sääntö: sivustolla vasta kahden klubilaisen arvosanan jälkeen.
                  S.documentList()
                    .title("Odottavat toista arvioijaa")
                    .schemaType("ravintola")
                    .filter(`_type == "ravintola" && !${JULKINEN_RAVINTOLA}`)
                    .defaultOrdering([{ field: "visitedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Arvostelut: odottavat hyväksyntää")
                .schemaType("ravintolaKayttajaArvostelu")
                .child(
                  // Lomake tallentaa arvostelun luonnoksena. Julkaistu = hyväksytty.
                  // Studio hakee listat luonnosnäkymässä (perspective "drafts"), jossa
                  // luonnoksen `_id` on ilman `drafts.`-etuliitettä: luonnoksen tunnistaa
                  // `_originalId`:stä. Listalle tulee myös jo hyväksytty arvostelu, jota on
                  // muokattu julkaisematta: sekin odottaa julkaisua.
                  S.documentList()
                    .title("Odottavat hyväksyntää")
                    .schemaType("ravintolaKayttajaArvostelu")
                    .filter(ODOTTAVAT_ARVOSTELUT)
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Arvostelut: kaikki")
                .schemaType("ravintolaKayttajaArvostelu")
                .child(
                  S.documentTypeList("ravintolaKayttajaArvostelu")
                    .title("Kaikki arvostelut")
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Klubilaisten arvosanat")
                .schemaType("klubiArvio")
                .child(
                  S.documentTypeList("klubiArvio")
                    .title("Klubilaisten arvosanat")
                    .defaultOrdering([{ field: "paiva", direction: "desc" }]),
                ),
              lista(S, "klubilainen", "Klubilaiset"),
              lista(S, "kaupunki", "Kaupungit"),
            ]),
        ),

      S.listItem()
        .id("jalkapalloarkisto")
        .title("Jalkapalloarkisto")
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title("Jalkapalloarkisto")
            .items([
              lista(S, "jalkapalloTilasto", "Tilastot"),
              lista(S, "arvokisa", "Arvokisat"),
              lista(S, "pelaaja", "Pelaajat"),
              S.listItem()
                .title("Lehtileikkeet")
                .schemaType("lehtileike")
                .child(
                  S.documentTypeList("lehtileike")
                    .title("Lehtileikkeet")
                    .defaultOrdering([{ field: "julkaistu", direction: "desc" }]),
                ),
              lista(S, "stadion", "Stadionit"),
            ]),
        ),

      osioidenSivut(S),
    ]);

/**
 * Varmuuskopiolla on lomakkeen rinnalla "Palauta poistettu" -välilehti
 * (docs/23 Y32). Muut dokumentit näytetään tavalliseen tapaan.
 */
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) =>
  schemaType === "varmuuskopio"
    ? S.document().views([
        S.view.form().title("Tiedot"),
        S.view.component(PalautaPoistettu).title("Palauta poistettu"),
      ])
    : S.document();
