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
| categories | array of string | ei | Esim. "Tapahtumaraportti", "Tiedote" |
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
| website | url | ei | |
| visitedAt | date | ei | Käyntiaika |

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
| country | string | ei | Oletus "Suomi" |

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
| items | array of { label, href, children? } | kyllä | Linkit (mahd. alavalikot) |

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
| heroCtas | array of { label, href } | ei | CTA-napit |
| blocks | array (multi-type: uutiset, tapahtumat, esittely, ravintolat-spotlight, cta) | ei | Etusivun lohkot järjestyksessä |

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
