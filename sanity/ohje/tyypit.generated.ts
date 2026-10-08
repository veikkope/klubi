// GENEROITU: npm run ohje (scripts/ohje-koosta.ts). Älä muokkaa käsin.
// Lähde: docs/ohje/ (kirjoitusohje docs/ohje/README.md). test:ohje tarkistaa, että tämä on ajan tasalla.

/** Dokumenttityyppi → ohjekorttien tunnukset (frontmatter `tyypit`). */
export const OHJE_TYYPEILLE: Readonly<Record<string, readonly string[]>> = {
  "arvokisa": [
    "luonnos-julkaisu-ja-peruminen",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "uusi-arvokisa",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat"
  ],
  "etusivu": [
    "luonnos-julkaisu-ja-peruminen",
    "kuva",
    "linkit",
    "etusivu-ylaosa",
    "etusivun-lohkot",
    "vanhan-version-palautus",
    "tayta-itse",
    "linkki-vie-vaaraan-paikkaan",
    "julkaise-ei-onnistu"
  ],
  "galleriaAlbumi": [
    "luonnos-julkaisu-ja-peruminen",
    "kuva",
    "jakokuva",
    "galleria-albumi",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "julkaise-ei-onnistu"
  ],
  "hallitusJasen": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "hallitus",
    "vanhan-version-palautus",
    "tayta-itse",
    "julkaise-ei-onnistu"
  ],
  "jalkapalloTilasto": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "tilastotaulukon-paivitys",
    "uusi-tilastotaulukko",
    "huuhkajat-ja-kansojen-liiga",
    "karsinnat",
    "kokoonpano-pelikentalle",
    "jarkytykset-ja-maailman-parhaat",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "julkaise-ei-onnistu",
    "et-ehka-voi-poistaa"
  ],
  "kaupunki": [
    "uusi-kaupunki",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "et-ehka-voi-poistaa"
  ],
  "klubiArvio": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "klubilaisen-pisteet",
    "klubilaisen-arvosanan-poisto",
    "ravintola-ei-nay"
  ],
  "klubiToiminta": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "huomiolaatikko-painike-liite",
    "taulukko-tekstissa",
    "tekstin-muotoilu",
    "jakokuva",
    "toiminta-uusi-vuosi",
    "uusi-toimintamuoto",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "linkki-vie-vaaraan-paikkaan",
    "julkaise-ei-onnistu"
  ],
  "klubilainen": [
    "arvostelulomake-klubilaisille",
    "et-ehka-voi-poistaa"
  ],
  "kommentti": [
    "esikatselu",
    "kommenttien-valvonta",
    "tietosuojapyynto",
    "tilamerkit"
  ],
  "lehtileike": [
    "luonnos-julkaisu-ja-peruminen",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "litmanen",
    "vanhan-version-palautus",
    "tarkistettavat"
  ],
  "navigaatio": [
    "luonnos-julkaisu-ja-peruminen",
    "linkit",
    "valikko-ja-alatunniste",
    "vanhan-version-palautus",
    "linkki-vie-vaaraan-paikkaan",
    "julkaise-ei-onnistu"
  ],
  "ohjaus": [
    "esikatselu",
    "linkit",
    "lyhytosoite",
    "vanhan-version-palautus",
    "ohjauksen-ilmoitukset"
  ],
  "ottelu": [
    "esikatselu",
    "ottelun-lisaaminen",
    "vanhan-version-palautus"
  ],
  "pelaaja": [
    "luonnos-julkaisu-ja-peruminen",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "jakokuva",
    "pelaaja",
    "litmanen",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat"
  ],
  "ravintola": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "jakokuva",
    "klubilaisen-pisteet",
    "ravintolan-tiedot",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "ravintola-ei-nay",
    "julkaise-ei-onnistu",
    "et-ehka-voi-poistaa",
    "tilamerkit"
  ],
  "ravintolaKayttajaArvostelu": [
    "arvostelun-hyvaksynta",
    "uusi-ravintola-arvostelusta",
    "tietosuojapyynto"
  ],
  "sivu": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "huomiolaatikko-painike-liite",
    "taulukko-tekstissa",
    "tekstin-muotoilu",
    "jakokuva",
    "esittely",
    "palloveikkauksen-sivut",
    "uusi-sivu",
    "osioiden-sivut",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "tayta-itse",
    "linkki-vie-vaaraan-paikkaan",
    "julkaise-ei-onnistu",
    "et-ehka-voi-poistaa",
    "mika-teksti-nakyy-missa"
  ],
  "stadion": [
    "luonnos-julkaisu-ja-peruminen",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "tekstin-muotoilu",
    "jakokuva",
    "stadion",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat"
  ],
  "tapahtuma": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "huomiolaatikko-painike-liite",
    "taulukko-tekstissa",
    "tekstin-muotoilu",
    "jakokuva",
    "tapahtuman-lisaaminen",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "julkaise-ei-onnistu",
    "et-ehka-voi-poistaa"
  ],
  "uutinen": [
    "luonnos-julkaisu-ja-peruminen",
    "esikatselu",
    "kuva",
    "linkit",
    "video-kartta-lomake",
    "huomiolaatikko-painike-liite",
    "taulukko-tekstissa",
    "tekstin-muotoilu",
    "uutisen-kirjoittaminen",
    "ajasta-uutinen",
    "valmiit-pohjat",
    "kategoriat-ja-tunnisteet",
    "veikkaus-ja-kommentit",
    "jakokuva",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "tarkistettavat",
    "uutinen-ei-nay-ajastettu",
    "linkki-vie-vaaraan-paikkaan",
    "julkaise-ei-onnistu",
    "et-ehka-voi-poistaa",
    "tilamerkit",
    "mika-teksti-nakyy-missa"
  ],
  "uutisKategoria": [
    "esikatselu",
    "kategoriat-ja-tunnisteet",
    "osoitteen-muuttaminen",
    "vanhan-version-palautus",
    "et-ehka-voi-poistaa"
  ],
  "varmuuskopio": [
    "varmuuskopiot",
    "poistetun-palautus"
  ],
  "yhteystiedot": [
    "luonnos-julkaisu-ja-peruminen",
    "yhteystiedot",
    "vanhan-version-palautus",
    "tayta-itse"
  ]
};
