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
        .child(
          S.list()
            .title("Sivun asetukset")
            .items([
              S.listItem()
                .title("Etusivu")
                .child(S.document().schemaType("etusivu").documentId("etusivu")),
              S.listItem()
                .title("Navigaatio")
                .child(S.document().schemaType("navigaatio").documentId("navigaatio")),
              S.listItem()
                .title("Yhteystiedot")
                .child(S.document().schemaType("yhteystiedot").documentId("yhteystiedot")),
              S.listItem()
                .title("Sivuston asetukset")
                .child(S.document().schemaType("asetukset").documentId("asetukset")),
            ]),
        ),

      S.divider(),

      S.listItem().title("Tapahtumat").schemaType("tapahtuma").child(S.documentTypeList("tapahtuma").title("Tapahtumat")),
      S.listItem().title("Uutiset").schemaType("uutinen").child(S.documentTypeList("uutinen").title("Uutiset")),
      S.listItem().title("Galleria-albumit").schemaType("galleriaAlbumi").child(S.documentTypeList("galleriaAlbumi").title("Galleria-albumit")),
      S.listItem().title("Sivut").schemaType("sivu").child(S.documentTypeList("sivu").title("Sivut")),

      S.divider(),

      S.listItem().title("Hallitus").schemaType("hallitusJasen").child(S.documentTypeList("hallitusJasen").title("Hallituksen jäsenet")),

      S.divider(),

      S.listItem()
        .title("Ravintolat")
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
        .child(
          S.list()
            .title("Jalkapalloarkisto")
            .items([
              S.listItem().title("Tilastot").schemaType("jalkapalloTilasto").child(S.documentTypeList("jalkapalloTilasto").title("Tilastot")),
              S.listItem().title("Stadionit").schemaType("stadion").child(S.documentTypeList("stadion").title("Stadionit")),
            ]),
        ),
    ]);
