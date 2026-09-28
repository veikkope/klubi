import { ArchiveIcon, CogIcon, CommentIcon, ControlsIcon, EnvelopeIcon, HomeIcon, LemonIcon, LockIcon, MenuIcon } from "@sanity/icons";

import { KOMMENTTIKOODI_ID } from "./schemas/singletons/kommenttikoodi";
import type { StructureResolver } from "sanity/structure";

/**
 * Desk-strukturointi: Sanity Studion vasemman valikon järjestys.
 *
 * - Singletonit (Etusivu, Asetukset, Navigaatio, Yhteystiedot) näkyvät erikseen "Asetukset"-osion alla
 *   ja niistä ei voi luoda useampaa kappaletta.
 * - Dokumenttityypit järjestetty käyttötarkoituksen mukaan, ei aakkosellisesti.
 */
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
              S.listItem()
                .title("Etusivu")
                .icon(HomeIcon)
                .child(S.document().schemaType("etusivu").documentId("etusivu")),
              S.listItem()
                .title("Navigaatio")
                .icon(MenuIcon)
                .child(S.document().schemaType("navigaatio").documentId("navigaatio")),
              S.listItem()
                .title("Yhteystiedot")
                .icon(EnvelopeIcon)
                .child(S.document().schemaType("yhteystiedot").documentId("yhteystiedot")),
              S.listItem()
                .title("Sivuston asetukset")
                .icon(CogIcon)
                .child(S.document().schemaType("asetukset").documentId("asetukset")),
              S.listItem()
                .title("Kommenttien koodisana")
                .icon(LockIcon)
                .child(S.document().schemaType("kommenttikoodi").documentId(KOMMENTTIKOODI_ID)),
            ]),
        ),

      S.divider(),

      S.listItem().title("Tapahtumat").schemaType("tapahtuma").child(S.documentTypeList("tapahtuma").title("Tapahtumat")),
      S.listItem().title("Ottelut").schemaType("ottelu").child(S.documentTypeList("ottelu").title("Ottelut").defaultOrdering([{ field: "aika", direction: "asc" }])),
      S.listItem().title("Uutiset").schemaType("uutinen").child(S.documentTypeList("uutinen").title("Uutiset")),
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
      S.listItem().title("Galleria-albumit").schemaType("galleriaAlbumi").child(S.documentTypeList("galleriaAlbumi").title("Galleria-albumit")),
      S.listItem().title("Sivut").schemaType("sivu").child(S.documentTypeList("sivu").title("Sivut")),

      S.divider(),

      S.listItem().title("Hallitus").schemaType("hallitusJasen").child(S.documentTypeList("hallitusJasen").title("Hallituksen jäsenet")),

      S.divider(),

      S.listItem()
        .title("Ravintolat")
        .icon(LemonIcon)
        .child(
          S.list()
            .title("Ravintolat")
            .items([
              S.listItem().title("Kaikki ravintolat").schemaType("ravintola").child(S.documentTypeList("ravintola").title("Ravintolat")),
              S.listItem().title("Käyttäjäarvostelut").schemaType("ravintolaKayttajaArvostelu").child(
                S.documentTypeList("ravintolaKayttajaArvostelu").title("Käyttäjäarvostelut"),
              ),
              S.listItem().title("Kaupungit").schemaType("kaupunki").child(S.documentTypeList("kaupunki").title("Kaupungit")),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title("Jalkapalloarkisto")
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title("Jalkapalloarkisto")
            .items([
              S.listItem().title("Tilastot").schemaType("jalkapalloTilasto").child(S.documentTypeList("jalkapalloTilasto").title("Tilastot")),
              S.listItem().title("Stadionit").schemaType("stadion").child(S.documentTypeList("stadion").title("Stadionit")),
            ]),
        ),
    ]);
