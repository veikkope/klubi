import {
  ArchiveIcon,
  CommentIcon,
  ControlsIcon,
  EnvelopeIcon,
  HomeIcon,
  LemonIcon,
  MenuIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import type { StructureBuilder, StructureResolver } from "sanity/structure";


/**
 * Sanity Studion vasemman valikon järjestys (docs/09).
 *
 * - Singletonit ovat "Sivun asetukset" -osiossa, eikä niistä voi luoda kopioita.
 * - "Sivuston asetukset" (asetukset) ei ole valikossa: mikään sen kentistä ei
 *   vaikuta sivustoon. Logo on tyylioppaan brändikuva (public/brand, sininen ja
 *   valkoinen versio), kuvaus tulee etusivulta ja jakokuvat generoidaan
 *   (app/api/og). Skeema säilyy, jotta vanha data pysyy validina (docs/16 §5).
 * - Tyypit on järjestetty käyttötarkoituksen mukaan: ensin se, mitä sihteeri
 *   päivittää usein (uutiset, ottelut, tapahtumat), sitten arkistot.
 * - "Tarkistettavat" kokoaa migraation merkitsemät dokumentit tyypeittäin, joten
 *   ne on helppo käydä läpi yksi kerrallaan.
 */

/** Tyypit, joissa on migraation "Vaatii tarkistuksen" -lippu. */
const TARKISTETTAVAT: { tyyppi: string; otsikko: string }[] = [
  { tyyppi: "uutinen", otsikko: "Uutiset" },
  { tyyppi: "ravintola", otsikko: "Ravintolat" },
  { tyyppi: "jalkapalloTilasto", otsikko: "Tilastot" },
  { tyyppi: "stadion", otsikko: "Stadionit" },
  { tyyppi: "klubiToiminta", otsikko: "Klubin toiminta" },
  { tyyppi: "pelaaja", otsikko: "Pelaajat" },
  { tyyppi: "arvokisa", otsikko: "Arvokisat" },
];

const lista = (S: StructureBuilder, tyyppi: string, otsikko: string) =>
  S.listItem().title(otsikko).schemaType(tyyppi).child(S.documentTypeList(tyyppi).title(otsikko));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sisältö")
    .items([
      S.listItem()
        .title("Sivun asetukset")
        .icon(ControlsIcon)
        .child(
          S.list()
            .title("Sivun asetukset")
            .items([
              S.listItem().title("Etusivu").icon(HomeIcon).child(S.document().schemaType("etusivu").documentId("etusivu")),
              S.listItem()
                .title("Navigaatio")
                .icon(MenuIcon)
                .child(S.document().schemaType("navigaatio").documentId("navigaatio")),
              S.listItem()
                .title("Yhteystiedot")
                .icon(EnvelopeIcon)
                .child(S.document().schemaType("yhteystiedot").documentId("yhteystiedot")),
            ]),
        ),

      S.listItem()
        .title("Tarkistettavat")
        .icon(WarningOutlineIcon)
        .child(
          S.list()
            .title("Vaatii tarkistuksen")
            .items(
              TARKISTETTAVAT.map(({ tyyppi, otsikko }) =>
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
        .title("Uutiset")
        .schemaType("uutinen")
        .child(
          S.documentTypeList("uutinen")
            .title("Uutiset")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
      S.listItem()
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
        .title("Ottelut")
        .schemaType("ottelu")
        .child(S.documentTypeList("ottelu").title("Ottelut").defaultOrdering([{ field: "aika", direction: "asc" }])),
      S.listItem()
        .title("Tapahtumat")
        .schemaType("tapahtuma")
        .child(
          S.documentTypeList("tapahtuma")
            .title("Tapahtumat")
            .defaultOrdering([{ field: "startsAt", direction: "desc" }]),
        ),
      lista(S, "galleriaAlbumi", "Galleria-albumit"),
      lista(S, "sivu", "Sivut"),

      S.divider(),

      lista(S, "klubiToiminta", "Klubin toiminta"),
      lista(S, "hallitusJasen", "Hallitus"),

      S.divider(),

      S.listItem()
        .title("Ravintolat")
        .icon(LemonIcon)
        .child(
          S.list()
            .title("Ravintolat")
            .items([
              lista(S, "ravintola", "Kaikki ravintolat"),
              S.listItem()
                .title("Arvostelut: odottavat hyväksyntää")
                .schemaType("ravintolaKayttajaArvostelu")
                .child(
                  // Lomake tallentaa arvostelun luonnoksena. Julkaistu = hyväksytty.
                  S.documentList()
                    .title("Odottavat hyväksyntää")
                    .schemaType("ravintolaKayttajaArvostelu")
                    .filter(
                      `_type == "ravintolaKayttajaArvostelu" && _id in path("drafts.**")
                        && !defined(*[_id == string::split(^._id, "drafts.")[1]][0]._id)`,
                    )
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
              lista(S, "kaupunki", "Kaupungit"),
            ]),
        ),

      S.listItem()
        .title("Jalkapalloarkisto")
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title("Jalkapalloarkisto")
            .items([
              lista(S, "jalkapalloTilasto", "Tilastot"),
              lista(S, "arvokisa", "Arvokisat"),
              lista(S, "pelaaja", "Pelaajat"),
              lista(S, "stadion", "Stadionit"),
            ]),
        ),
    ]);
