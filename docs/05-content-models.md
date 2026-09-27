# 05 — Sisältömallit (Sanity-skeemat)

Skeemat sijaitsevat hakemistossa `sanity/schemas/`. Tämä dokumentti kuvaa **mitä** skeemoja on ja **miksi**. Tekninen TypeScript-toteutus on lähdekoodissa.

## Suunnitteluperiaatteet

1. **Suomenkieliset kenttänimet ja kuvaukset** Studion käyttöliittymässä
2. **Pakolliset kentät validoinnein** — isä ei voi julkaista puolivalmista
3. **Esikatselut näkyvät listoissa** (kuva + title + tila)
4. **Initial values** auttavat tyhjien lomakkeiden täyttämistä
5. **Strukturoitu Desk** — Studion vasen valikko järjestetty sisältötyypeittäin, ei aakkosellisesti

## Yhteiset kentät

Useimmissa julkaistavissa dokumenteissa on:
- `title` (string, pakollinen)
- `slug` (slug, pakollinen, ainutkertainen, generoituu otsikosta)
- `seoTitle`, `seoDescription` (string, valinnaisia — käyttävät titlea jos tyhjät)
- `publishedAt` (datetime, oletus: nyt)

## Sisältötyypit

### 1. `sivu` (julkinen vapaamuotoinen sivu)
**Tarkoitus:** Yhdistyksen tietosivut kuten `/yhdistys`, `/saannot`, `/jasenyys`.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | Sivun otsikko |
| slug | slug | kyllä | Polku (/[slug]) |
| hero | image (alt pakollinen) | ei | Yläbanneri |
| ingress | text | ei | Lyhyt johdanto, näkyy hero-alueella |
| body | portableText | kyllä | Pääsisältö (otsikot, listat, lainaukset, kuvat) |
| seoTitle, seoDescription | string | ei | SEO-overrides |

### 2. `tapahtuma`
**Tarkoitus:** Yhdistyksen tapahtumakalenteri (vuosikokous, vappu, mölkky, palloveikkaus).

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | Tapahtuman nimi |
| slug | slug | kyllä | |
| startsAt | datetime | kyllä | Alkamisaika |
| endsAt | datetime | ei | Päättymisaika |
| location | string | ei | Paikka (esim. "Klubin tila, Lahti") |
| juhla | boolean | ei | Juhlatapahtuma (itsenäisyyspäivä, vuosijuhla): kortti saa messinkikorostuksen. Oletus false. |
| description | portableText | kyllä | Tapahtuman kuvaus |
| image | image (alt pakollinen) | ei | Kansikuva |
| signupUrl | url | ei | Ilmoittautumislinkki |
| signupEmail | email | ei | Ilmoittautumis-sähköposti |

Listanäkymässä järjestys: `startsAt` desc (tulevat ensin).

### 3. `uutinen`
**Tarkoitus:** Klubin tiedotteet, blogimerkinnät, raportit menneistä tapahtumista.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | |
| slug | slug | kyllä | |
| publishedAt | datetime | kyllä | Julkaisuaika |
| excerpt | text | kyllä | Lyhenne listoja varten (max 200 merkkiä) |
| coverImage | image (alt pakollinen) | ei | Kansikuva |
| body | portableText | kyllä | Sisältö |
| categories | array of string | ei | Tyyliopas (Sivut v3): jalkapallojuttujen pääkategoriat **otteluraportti** ja **kannattajakulttuuri**. Lisäksi tiedote, tapahtumaraportti, jäsentieto, jalkapallo, ravintola, blogi. Ensimmäinen kategoria näkyy etusivun jutuissa sinisenä yläotsakkeena. |
| author | reference→hallitus-jasen | ei | Kirjoittaja |

### 4. `hallitus-jasen`
**Tarkoitus:** Hallituksen jäsenten esittelysivu.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| name | string | kyllä | Etu- ja sukunimi |
| role | string | kyllä | Esim. "Puheenjohtaja" |
| image | image (alt pakollinen) | ei | Profiilikuva |
| bio | text | ei | Lyhyt esittely |
| email | email | ei | |
| phone | string | ei | |
| order | number | kyllä | Järjestysnumero (esim. 1 = puheenjohtaja) |

### 5. `ravintola`
**Tarkoitus:** Klubin ravintola-arvostelut (siirretään vanhasta sivustosta).

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| name | string | kyllä | Ravintolan nimi |
| slug | slug | kyllä | |
| city | reference→kaupunki | kyllä | Sijainti |
| address | string | ei | Katuosoite |
| location | geopoint | ei | Karttapaikka |
| cuisine | array of string (multi-select) | ei | Esim. "italiainen", "lounas", "pizza" |
| priceLevel | string ("€"/"€€"/"€€€") | ei | Hintaluokka |
| stars | number 1–5 | kyllä | Klubin tähtiarvio |
| review | portableText | kyllä | Klubin arvostelu |
| images | array of image (alt pakollinen) | ei | Ravintolan kuvat |
| website | url | ei | Näkyy arviosivulla "Ravintolan verkkosivut ↗" -painikkeena |
| visitedAt | date | ei | Käyntiaika |
| ratingOverall, ratingFood, ratingPrice, ratingAtmosphere | number 0–5 | ei | Kokonaisarvosana ja ala-arvosanat (Ruoka / Hinta / Viihtyvyys). Näytetään arvosanapisteinä (pyöristettynä), tarkka arvo ruudunlukijalle. Tyylioppaan Palvelu-arvosanaa ei lisätty (päätös 2026-09-27). |
| tuomio | string (max 90) | ei | Yhden rivin tuomio arviokorttiin (tyyliopas). |
| stadionHuomio | string (max 30) | ei | Kortin tagi, esim. "15 min stadionille" tai "Vierasmatka". |
| ottelupaivana | text | ei | "Ottelupäivänä"-laatikko arvion lopussa. |

### 5b. `ottelu`
**Tarkoitus:** Otteluohjelman käsin lisätyt ottelut ja klubin merkinnät (docs/13). Veikkausliigan ottelut tulevat automaattisesti; Studion ottelu yhdistyy niihin päivän ja joukkueiden perusteella.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| aika | datetime | kyllä | Alkamisaika |
| koti | string | kyllä | Kotijoukkue, kirjoitettuna kuten Veikkausliigan sivuilla |
| vieras | string | kyllä | Vierasjoukkue |
| kilpailu | string | ei | Esim. "Veikkausliiga", "Maaottelu" |
| stadion | string | ei | |
| klubiPaikalla | boolean | ei | Sininen "Klubi paikalla" -merkki. Automaattinen Huuhkajien kotiotteluissa (kotijoukkue tasan "Suomi"). Kaikki Huuhkajien ottelut korostetaan listassa (docs/13). |
| vierasmatka | boolean | ei | "Vierasmatka"-merkki |

### 6. `ravintola-kayttaja-arvostelu`
**Tarkoitus:** Yleisön jättämät arvostelut. Tallennetaan Server Actionilla, isä moderoi Studiossa.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| reviewerName | string | kyllä | Nimi |
| reviewerEmail | email | kyllä | (ei näytetä julkisesti) |
| restaurant | reference→ravintola | kyllä | |
| stars | number 1–5 | kyllä | |
| comment | text | kyllä | Kommentti (max 1000 merkkiä) |
| status | string ("pending"/"approved"/"rejected") | kyllä | Initial: "pending" |
| submittedAt | datetime | kyllä | Initial: nyt |

Vain `status: "approved"` näytetään julkisesti.

### 7. `kaupunki`
**Tarkoitus:** Ravintoloiden ja stadionien sijaintien luokittelu.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| name | string | kyllä | Esim. "Lahti" |
| slug | slug | kyllä | Esim. "lahti" |
| country | string | kyllä | Virallinen suomenkielinen maannimi ("Suomi", "Saksa", "Venäjä", "Alankomaat", "Iso-Britannia", "Tšekki"). Oletus "Suomi". Validointi: iso alkukirjain, ei reunavälilyöntejä. Hakemiston `?maa=` on tämän slug (`lib/slugify.ts`). |
| maakunta | string (valintalista) | ei (varoitus, jos maa = Suomi ja tyhjä) | Yksi Suomen 19 maakunnasta (`lib/maakunnat.ts`). Tallennettu arvo on slug (`uusimaa`, `paijat-hame`), Studio näyttää nimen. Näkyy vain, kun `country == "Suomi"` (hidden-funktio). Hakemiston `?maakunta=`. |

**Esikatselu:** nimi + "maakunta, maa" (esim. "Lahti — Päijät-Häme, Suomi").

**Maa-tason viite:** dokumentti, jonka nimi on sama kuin maa ("Portugali", "Ruotsi", "Venäjä"), on ravintolaputken viite silloin, kun ravintolan kaupunki ei selviä lähteestä. Se ei näy hakemiston kaupunkisuodattimessa (`lib/places.ts` → `isCountryLevelPlace`), mutta sen ravintolat löytyvät maasuodattimella. Erillistä lippukenttää ei ole, jotta isän ei tarvitse ylläpitää sitä.

**Data:** ravintolaputki (`scripts/import-ravintolat.ts`) ja stadionputki (`scripts/import-stadionit.ts`) täyttävät maakunnan taulukosta `scripts/lib/maakunnat.ts` (Tilastokeskuksen kunta–maakuntaluokitus 2025, 309 kuntaa + nimetyt taajamat → kunta). Tuntematon paikkakunta kaataa ajon.

### 8. `stadion`
**Tarkoitus:** Jalkapallostadion-esittelyt.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| name | string | kyllä | Esim. "Olympiastadion" |
| slug | slug | kyllä | |
| city | reference→kaupunki | kyllä | |
| capacity | number | ei | Kapasiteetti |
| openedYear | number | ei | Rakennusvuosi |
| description | portableText | kyllä | Kuvaus |
| images | array of image | ei | |

### 9. `jalkapallo-tilasto`
**Tarkoitus:** Eri tilastoarkistot (FIFA-ranking, mestarit, valmentajat). Rakenne tukee monenlaisia taulukoita.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | Esim. "Suomen FIFA-ranking" |
| slug | slug | kyllä | |
| category | string (enum: "fifa-ranking", "champions", "valmentajat", "vuoden-pelaaja", "ballon-dor", "saavutukset", "eurocup", "uefa-cup", "super-cup", "conference-league", "intercontinental", "karsinta") | kyllä | Vaikuttaa sivun renderöintiin |
| intro | portableText | ei | Johdanto |
| columns | array of objects { key, label, type } | kyllä | Taulukon sarakkeet |
| rows | array of objects (key-value) | kyllä | Taulukon rivit |
| sources | array of url | ei | Lähteet |

### 10. `galleria-albumi`
**Tarkoitus:** Kuva-albumit tapahtumista.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | |
| slug | slug | kyllä | |
| date | date | kyllä | Albumin päivämäärä |
| event | reference→tapahtuma | ei | Linkki tapahtumaan |
| coverImage | image (alt pakollinen) | kyllä | Kansikuva |
| images | array of image (alt pakollinen, caption valinnainen) | kyllä | Albumin kuvat |

### 11. `yhteystiedot` (singleton)
**Tarkoitus:** Yhdistyksen yhteystiedot — yksi dokumentti, käytetään footerissa, /yhteystiedot-sivulla, sähköposteissa.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| address | string | kyllä | Katuosoite |
| postalCode | string | kyllä | |
| city | string | kyllä | |
| email | email | kyllä | Yhdistyksen yleinen sähköposti |
| phone | string | ei | |
| yTunnus | string | ei | Y-tunnus |
| iban | string | ei | Tilinumero |
| socials | array of objects { platform, url } | ei | Sosiaaliset mediat |
| location | geopoint | ei | Karttapaikka |

### 12. `navigaatio` (singleton)
**Tarkoitus:** Päänavigaation linkit järjestettävissä Studiossa.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| items | array of { label, href, children? } | kyllä | Linkit (mahd. alavalikot). `highlight` on piilotettu — tyylioppaassa ei ole CTA-korostusta. |

### 13. `asetukset` (singleton)
**Tarkoitus:** Sivuston yleisasetukset.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| siteName | string | kyllä | Oletus "Lahden Suomalainen Klubi ry" |
| tagline | string | ei | Slogan |
| logo | image | ei | |
| favicon | image | ei | |
| defaultOgImage | image | ei | |
| defaultSeoDescription | text | ei | |
| heroFallback | image | ei | Hero-tausta jos sivulla ei omaa |

### 14. `etusivu` (singleton)
**Tarkoitus:** Etusivun lohkojen rakenne ja järjestys (Sanityssa konfiguroitavissa).

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| heroTitle | string | kyllä | Hero-otsikko |
| heroEyebrow | string | ei | Pieni teksti otsikon yläpuolella |
| heroDescription | text | kyllä | |
| heroImage | imageWithAlt | ei | Pystykuva heron oikealla puolella (4:5) |
| heroCtas | array of { label, href, primary } (max 2) | ei | Näkyvät alleviivattuina tekstilinkkeinä (tyyliopas) |
| seuraavaOttelu | object | ei | **Piilotettu** — korvattu otteluohjelmalla. Säilyy, jotta vanha data on validia. |
| blocks | array (multi-type: otteluohjelma, uutiset, tapahtumat, esittely, ravintolatSpotlight, jalkapalloarkisto, galleria, cta) | ei | Etusivun lohkot järjestyksessä. Tyylioppaan järjestys: otteluohjelma, uutiset, ravintolatSpotlight, esittely. `uutiset`, `esittely` ja `ravintolatSpotlight` saavat `eyebrow`-kentän. `otteluohjelma`: ottelutHeading, ottelutCount, tapahtumatHeading, tapahtumatCount. `cta` on vanha — tyyliopas kieltää liittymiskehotteet. |

## Singletonien hallinta Studiossa

Singleton-dokumentit (`yhteystiedot`, `navigaatio`, `asetukset`, `etusivu`) eivät saa esiintyä "Create new" -valikossa. Tämä toteutetaan **Desk Structure** -konfiguraatiolla (`sanity/desk/`), joka näyttää singletonit erikseen "Asetukset"-osiossa.

## Validointisäännöt

- Kaikki kuvat: `alt`-teksti pakollinen
- Slug: ainutkertainen, ei ääkkösiä, max 80 merkkiä
- Email-kentät: validi formaatti
- URL-kentät: validi http(s)
- Stars: 1–5 kokonaisluku
- Excerpt: max 200 merkkiä
- Comment: max 1000 merkkiä

Validointivirheet näytetään suomeksi (`error: "Tämä kenttä on pakollinen."`).

## Sisältömigraation lisäykset (vaihe 0b, 2026-09-27)

Lisätty `docs/12-sisaltomigraatio.md` §3 vaiheessa 0b, jotta jokaiselle vanhan
sivuston tiedolle on kenttä. Olemassa olevia kenttiä ei poistettu eikä nimetty
uudelleen. Skeemat ovat jäädytettyjä vaiheen 1 ajan.

**Yhteiset (`objects/contentMeta.ts`)**
- `muutLegacyUrlit` (string[], vain luku) — muut vanhat osoitteet, jotka on
  yhdistetty dokumenttiin (esim. kolme Litmanen-sivua → yksi `pelaaja`). Mukana
  tyypeissä `sivu`, `jalkapalloTilasto`, `arvokisa`, `pelaaja`, `stadion`,
  `klubiToiminta`, `ravintola`. Redirect-generaattorin pitää lukea myös tämä.
- `legacyUrl`, `tiivistelma`, `needsReview` olivat jo kaikissa migroitavissa tyypeissä.

**`portableText`** — linkin `href` hyväksyy nyt suhteelliset polut
(`/jalkapalloarkisto/…`), koska migraatio muuntaa `.htm`-linkit sisäisiksi poluiksi.

| Tyyppi | Uudet kentät | Miksi |
|---|---|---|
| `uutinen` | `ulkoinenLinkki` (url), `lahde { nimi, url, pvm }`; kategoria `blogi` | Otsikkoarkisto linkittää Blogspot-kirjoituksiin; vanhat merkinnät päättyvät lähderiviin "(palloliitto.fi 07.02.2008)". `excerpt` ja `body` ovat pakollisia **paitsi** jos `ulkoinenLinkki` on annettu. |
| `jalkapalloTilasto` | `lisatiedot` (portableText), `paivitetty` (date), `jarjestys` (number), `kuvat` (imageWithAlt[]); kategoriat `arvokisa`, `pelaaja`, `ulkomaiset-mestarit`, `palloliitto`, `klubi`, `muu` | Ottelusivuilla taulukon jälkeen otteluraportit; useita taulukoita per sivu (lohkot A–H) tarvitsevat järjestyksen; mölkky-, veikkaus- ja jouluruokailutaulukot sekä Englannin/Venäjän mestarit ja Palloliiton puheenjohtajat eivät sopineet olemassa oleviin kategorioihin. |
| `arvokisa` | `alkuPvm`, `loppuPvm` (date), `hopea`, `pronssi` (string); kisatyyppi `u21-em` | Kisasivut alkavat "11.06.-11.07.2010"; mitalistitaulukko Mestari/Hopea/Pronssi; Pikkuhuuhkajat = U21-EM 2009. |
| `pelaaja` | `tilastot` (ref → jalkapalloTilasto[]) | litmanen.htm:n loukkaantumistaulukko. |
| `stadion` | `address` (string) | Stadionsivuilla katuosoite ("Tamme puiestee 1, Tartu"). |
| `klubiToiminta` | `vuodet[].otsikko`, `vuodet[].jarjestysnumero`, `vuodet[].osallistujat` (string[]); `tilastot` (ref[]) | Vuosikokous "(11) … (6): Ilpo, Olli…", mölkky kahdesti vuodessa, mölkyn ja jouluruokailun taulukot. |
| `sivu` | `tilastot` (ref → jalkapalloTilasto[]) | Palloveikkaussivujen 38 taulukkoa. |
| `etusivu` | `seuraavaOttelu { ottelu, kilpailu, aika }` | Vanhan etusivun "Seuraavaksi" -laskuri. |
| `yhteystiedot` | `address`, `postalCode`, `email`: `required` → **varoitus** | Migraatio luo singletonin ilman näitä (docs/12 M6), eikä se saa rikkoa "0 tyhjää pakollista kenttää" -maalia. |

**Renderöimättä (integraatiovaihe):** `uutinen.ulkoinenLinkki/lahde`,
`jalkapalloTilasto.lisatiedot/paivitetty/kuvat/jarjestys` (kyselyt järjestävät
yhä `title asc`), `arvokisa.alkuPvm/loppuPvm/hopea/pronssi`, `pelaaja.tilastot`,
`stadion.address`, `klubiToiminta.vuodet[].otsikko/jarjestysnumero/osallistujat` ja
`tilastot`, `sivu.tilastot`, `etusivu.seuraavaOttelu`, `muutLegacyUrlit`.
