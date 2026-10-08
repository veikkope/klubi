# 25 — Ylläpito-ohjeen uudistus (suunnitelma)

Tavoite: sihteeri osaa tehdä jokaisen ylläpitotehtävän ohjeen avulla ilman kehittäjää.
Ohje on selkeä, kuvitettu, kattava ja pysyy ajan tasalla Studion muuttuessa.

## Päätökset 8.10.2026 (käyttäjä)

| Asia | Päätös |
|---|---|
| Muoto | **Studion sisällä** (yläpalkin Ohjeet-työkalu: haku, kuvat, linkit suoraan oikeaan näkymään) **+ tulostettava PDF**. `docs/09-editor-guide.md` säilyy lähteenä. |
| Rakenne | **Pikaopas** (1 sivu, 5 yleisintä tehtävää) + **tehtäväkortit** (yksi tehtävä, numeroidut askeleet, kuva) + **vianetsintä** ("Jos näet tämän…") + **hakuteososa**. |
| Kuvat | **Automaattinen skripti** (`npm run ohjekuvat`, Playwright, development-datasetti, numeroidut merkinnät). Uudelleen ajettava, kun Studio muuttuu. |
| Käyttötesti | Agenttisimulaatio (ei testiä isän kanssa). |
| Rakenne (vaihe 2) | Alla oleva rakenne **hyväksytty**. |
| Lähde | **`docs/ohje/`** (kortti per tiedosto, kirjoitusohje `docs/ohje/README.md`). `docs/09` muuttuu viittaukseksi. Lihavointi = vain Studion nimi. |
| Termi | **tukihenkilö** oppaassa ja Studion teksteissä (`lib/sivuston-tila.ts`), ei nimiä. |
| Production | Palautetaan Päävalmentajat-sivun kadonnut linkki ja hylätään identtinen luonnos (varmuuskopio ensin). Korjataan Studion tekstit `etusivu.ts` (Pikalinkit) ja `lib/sijainnit.ts` (Tilastotaulukot). |

## Vaiheet

0. **Päätökset** — tehty.
1. **Analyysi** (4 agenttia rinnakkain, vain luku): ohjetutkija (laatukriteerit), kattavuusauditoija (opas vs. koodi), käyttöanalyytikko (mitä productionissa oikeasti muokataan), kuvaputken suunnittelija. Tuotokset: `docs/25-liite-analyysi.md`.
2. **Synteesi:** uusi rakenne ja sisällysluettelo, käyttäjän hyväksyntä.
3. **Tuotanto:** kuvaskripti, kirjoittajat lukuryhmittäin, Studion Ohjeet-työkalu ja PDF-vienti.
4. **Tarkistus:** isä-simulaatio (agentti seuraa ohjeita kirjaimellisesti Studiossa, development), faktantarkistus koodia vasten, oma selaintarkistus.
5. **Ylläpito:** `npm run ohjekuvat` ja `npm run test:ohje` (oppaan Studio-nimet ovat olemassa).

## Vaiheen 1 tulokset (8.10.2026)

Yksityiskohdat: `docs/25-liite-analyysi.md` (laatukriteerit, mallikortti, kattavuus, Studion nimet).

- **Nykyinen opas:** 126 tehtävästä 76 ohjeistettu, 30 osittain, 20 ei lainkaan. 24 virhettä (mm. ottelun kenttänimet, valikkopolut, P5:n jälkeen vanhentuneet linkkikappaleet). Ei kuvia, 150 riviä käsitteitä ennen ensimmäistä tehtävää, vianetsintä hajallaan, kehittäjäsanastoa.
- **Käyttö (production 29.9.–7.10., roolitasolla):** sihteeri päivittää ennen kaikkea **tilastotaulukoita** (105/187 muutosta) otteluiltoina, sitten ravintoloita ja arvostelujen hyväksyntää. Havaitut vaikeudet: Julkaise-painiketta käytetään tallennuksena (16 julkaisua 4 tunnissa), sijat ja prosentit lasketaan käsin vaihtelevalla muodolla, vahingossa poistunutta linkkiä ei osattu palauttaa, Tarkistettavat jäävät käsittelemättä.
- **Tekninen ratkaisu:** lähde `docs/ohje/` (kortti per tiedosto, frontmatter), koostaja → Studion Ohjeet-työkalu + dokumentin Ohje-paneeli (inspector) + tulostettava HTML → PDF (`page.pdf`). Kuvat `public/studio-ohje/`, manifesti `scripts/ohjekuvat/`, siemen developmentiin. `test:ohje` tarkistaa kuvat, lihavoidut Studion nimet, `studio:`-linkit ja frontmatterin.

## Uusi rakenne (luonnos hyväksyttäväksi)

**Pikaopas (1 A4):** kolme sääntöä (1. Muutos tallentuu itsestään, julkaise vasta lopuksi. 2. Kaiken voi perua. 3. Punainen rivi Aloituksessa ei tarkoita, että sisältö katosi) + viisi tehtävää: tilastotaulukon päivitys, uutisen kirjoittaminen, arvostelun hyväksyntä, klubilaisen pisteet ravintolalle, virheen peruminen.

**Tehtäväkortit**
- *Alkuun:* Studion osat ja kirjautuminen · Aloitus ja sivuston tila · Luonnos, julkaisu ja peruminen (Kumoa, historia, Hylkää muutokset) · Etsi dokumentti haulla · Esikatselu
- *Tekstit ja kuvat:* Kuva (lisäys, rajaus, kuvaus, kuvateksti) · Linkit · Video, kartta tai lomake · Huomiolaatikko, painike, liite · Taulukko tekstissä
- *Uutiset:* Uutisen kirjoittaminen · Ajastus · Valmiit pohjat · Kategoriat ja tunnisteet · Veikkaus ja kommentit · Kommenttien valvonta
- *Jalkapalloarkisto:* Tilastotaulukon päivitys (solut, sijat, prosentit) · Uusi taulukko · Huuhkajat ja Kansojen liiga · Karsinnat · Kokoonpano pelikentälle · Uusi arvokisa · Pelaaja · Stadion · Litmanen · Järkytykset ja maailman parhaat
- *Ravintolat:* Klubilaisen pisteet · Arvostelun hyväksyntä, hylkäys ja kuvat · Uusi ravintola arvostelusta · Ravintolan tiedot ja Toiminta loppunut · Uusi kaupunki · Arvostelulomake klubilaisille
- *Ottelut, tapahtumat, galleria:* Ottelu · Tapahtuma · Galleria-albumi
- *Klubi:* Esittely · Hallitus · Toiminta: uusi vuosi ja uusi toimintamuoto · Palloveikkauksen sivut · Yhteystiedot
- *Sivusto:* Etusivu (yläosa, lohkot) · Valikko ja alatunniste · Uusi sivu · Osioiden sivut · Osoitteen muuttaminen · Lyhytosoite · Jakokuva
- *Turvaverkko:* Varmuuskopiot · Vanhan version palautus · Poistetun palautus · Tarkistettavat · Täytä itse · Tietosuojapyyntö

**Vianetsintä (oire otsikkona):** Julkaise ei onnistu / punainen kenttä · Muutos ei näy sivustolla · Uutinen ei näy (ajastettu) · Ravintola ei näy (kahden klubilaisen sääntö) · Punainen tai keltainen rivi Aloituksessa · "Et ehkä voi poistaa…" · Ohjauksen ilmoitukset · Poistin vahingossa · Linkki vie väärään paikkaan · Studio näyttää virheen tai ei aukea · Sivusto jää esikatselutilaan

**Hakuteos:** Studion valikon kartta · Tilamerkit · Sanasto · Mihin tarvitset tukihenkilöä (logo, sarjan vaihto, uusi arkisto-osio, tiedotebanneri, Sanityn taso 26.10. ym.) · Mitä ei saa tehdä

## Vaiheen 3 tiimi

1. **Minä:** `docs/ohje/README.md` (kirjoitussäännöt) + mallikortti (tilastotaulukon päivitys).
2. **Infra-agentti** (build-implementation-agent): markdown-ydin, koostaja, Ohjeet-työkalu, inspector, `test:ohje`, PDF.
3. **Kuva-agentti** (build-implementation-agent, rinnakkain eri tiedostoissa): `scripts/lib/studio-selain.ts`, `ohjekuvat`, siemen, henkilötietosuojat.
4. **Kirjoittajat ×3** (editor-ux-agent, rinnakkain): A) Alkuun, tekstit, uutiset, turvaverkko; B) arkisto, ravintolat, ottelut; C) klubi, sivusto, vianetsintä, hakuteos. Jokainen kirjoittaa kortit ja niiden kuvamanifestin.
5. **Katselmoija** jokaiselle osalle + oma tarkistus (type-check, lint, `npm test`, build, savutesti, selain).

## Rajaukset

- Ei kirjoituksia productioniin. Kuvat development-datasetistä.
- Repo on julkinen: kuvissa ei henkilötietoja (kommentoijat, tietosuojapyynnöt, sähköpostit), eikä tukihenkilön nimeä missään.
- Studio-muutoksille selaintarkistus ennen pushia (savutesti + käsin).

## Tila 9.10.2026

Vaiheet 1–4 tehty: 77 korttia (`docs/ohje/`), 92 kuvaa (`public/studio-ohje/`), Studion **Ohjeet**-työkalu ja **Ohje**-paneeli, PDF (214 s., 8,3 Mt; pikaopas 1 s.), `test:ohje` `npm test`issä. Kaksi isä-simulaatiota kävi kaikki kortit läpi oikeassa Studiossa (development) ja korjasi ne ruudun mukaisiksi. Productioniin: Päävalmentajat-sivun kadonnut linkki palautettu ja identtinen luonnos poistettu (varmuuskopio `production-2026-10-08-1617`). Studion tekstit: tukihenkilö, kytkin (ei rasti), ei "migraatio"- eikä "Aiemmin kentän nimi" -historiaa.

## Jatkoehdotukset (ei hyväksytty)

Simulaatioiden löydöt, jotka vaativat koodimuutoksen:

1. Historiasta palautus epäonnistuu Luonnos-näkymästä ja onnistuu vasta Julkaistu-näkymässä, jossa näkyy punainen **Poista julkaisu** (ansa). Oma "Palauta tämä versio" -toiminto tai Poista julkaisu piiloon.
2. Sanityn omat työkalut (Releases, Tehtävät, Ajasta julkaisu, Luonnokset/Julkaistu-valitsin) piiloon.
3. Taulukkoeditoriin lajittelu ja sijojen laskenta, prosenttisarake, Kumoa solumuutoksille.
4. Validointivirheet näkyvät vain kuvakkeena; linkkipainike on tekstieditorin ⋯-valikossa 1280 px:ssä.
5. Englanninkieliset tekstit: "Reference to jalkapallotilasto", Karttapaikan Latitude/Longitude, "Muokkaa Linkki", päiväys "Oct 8, 2026".
6. Julkaise jää välillä tilaan "Validoidaan dokumenttia…"; React-varoitus `sanity/actions/vanhat-osoitteet.tsx` (sama key).
7. Omat `.id()` valikon kohtiin, joista ohje linkittää (Kaikki ravintolat, Klubilaiset, Arvokisat ym.).
8. Savutestiin ryhmä "Ohjeet" (työkalu, jokainen kortti, Ohje-paneeli).
