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

**Sanasto (docs/24 askel 1, Y38):** `sanity/schemas/objects/sanasto.ts`. `slug`-kentän
otsikko on kaikissa omasivuisissa tyypeissä `OSOITE_OTSIKKO` = "Osoite sivustolla"
(tyyppikohtainen kuvaus kertoo osoitteen muodon), ja `seo`-ryhmän otsikko on
`HAKUKONEET_RYHMA` = "Hakukoneet ja jako". Ryhmän tekninen nimi pysyy `seo`, joten
dataa ei muutettu. Suodattimien slugit (`kaupunki`, `uutisKategoria`) ovat
"Osoite suodattimessa".

**`tiivistelmaField(group?, { title?, description?, validation? })`**
(`sanity/schemas/objects/contentMeta.ts`): yhteinen Tiivistelmä-kenttä, jonka
otsikon, kuvauksen ja validoinnin voi ohittaa tyypeittäin. Oletusvalidointi on
varoitus yli 300 merkistä. Ohitukset: `uutinen` ("Tiivistelmä jutun alussa
(valinnainen)", näkyy jutun alussa Lyhenteen sijaan) ja `sivu` ("Tiivistelmä sivun
alussa").

`portableText`-kenttiin voi lisätä tekstin ja kuvien (`imageWithAlt`) lisäksi
lohkon `kokoonpano` (Kokoonpano pelikentällä, `components/kokoonpano.tsx`):
`otsikko` (pakollinen), `rivit[]` hyökkäyksestä maalivahtiin (1–6 riviä, rivillä
valinnainen `nimi` ruudunlukijalle ja `pelaajat[]` = `nimi` + valinnainen `luku`)
ja valinnainen `selite`. Varoitus, jos pelaajia on muu määrä kuin 11.

Lohko `youtubeVideo` (`components/youtube-video.tsx`): `url` (pakollinen, mikä
tahansa YouTube-videon osoitemuoto, `lib/youtube.ts`; `t=`/`start=` → aloituskohta),
`otsikko` (pakollinen, iframen `title` ja toistopainikkeen teksti) ja valinnainen
`kuvateksti`. Sivulla esikatselukuva + toistopainike; soitin ladataan vasta
painalluksesta `youtube-nocookie.com`-osoitteesta (ei evästeitä eikä YouTuben
skriptejä ennen toistoa). Ilman JavaScriptiä painike on linkki YouTubeen.

### `rikasSisalto` (docs/24 askel 2)

Laajennettu tekstikenttä (`sanity/schemas/objects/rikasSisalto.ts`): sama
tekstilohko kuin `portableText`issa (`tekstiLohko`, `portableText.ts`) ja lisäksi
`RIKKAAT_LOHKOT` (`lib/sisaltolohkot.ts`) Studion valikon järjestyksessä:
`imageWithAlt`, `kuvasarja`, `youtubeVideo`, `kokoonpano`. Askel 6 lisää
upotuksen, huomiolaatikon, painikkeen, liitteen ja taulukon.

- **Käyttöpaikat:** `uutinen.body`, `tapahtuma.description` ja
  `klubiToiminta.kuvaus`. `sivu.body` siirtyy tähän askeleessa 6. Muut
  tekstikentät (arkisto, ravintola-arvio, lehtileike, tilastojen johdannot,
  etusivun esittely) pysyvät `portableText`-tyyppisinä, ja niiden lohkot ovat
  `PERUSLOHKOT` (`imageWithAlt`, `kokoonpano`, `youtubeVideo`).
- **Ei datamuutosta:** Portable Text -taulukko tallentuu ilman taulukon
  tyyppinimeä, ja vanhoissa rungoissa on vain lohkot, jotka uusi tyyppi sallii.
- **Renderöinti:** `components/portable-text.tsx` (`lohkot … satisfies
  Record<RikasLohko, …>`: uusi lohko ilman renderöijää kaatuu type-checkiin).
- **GROQ:** `runko` (`sanity/lib/queries/kuvat.ts`) lisää kuvasarjan kuviin
  `lqip`- ja `vari`-kentät ja jättää pois kuvat ilman assetia.

**`kuvasarja`** (Kuvasarja (useita kuvia), `sanity/schemas/objects/kuvasarja.ts`,
`components/kuvasarja.tsx`):

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| kuvat | `galleriaKuva`[] (grid) | kyllä, vähintään 1 | Varoitus alle 2 kuvasta ("käytä lohkoa Kuva") ja yli 60 kuvasta ("harkitse galleria-albumia") |
| kuvaus | string, 3–120 merkkiä | kyllä | Yhteinen kuvaus: näkyy kuvien alla (`figcaption`) ja on kuvien alt-varateksti |
| asettelu | `ruudukko` \| `kokonaisena` (radio) | ei, oletus `ruudukko` | Ruudukko rajaa neliöiksi, kokonaisena näyttää rajaamatta (kuvakaappaukset, lehtileikkeet). Vertailu `stegaClean`illa |

Sivulla `AlbumGrid` (`sarakkeet={3}`: 2 saraketta, `sm` 3, ei `lg`-luokkaa) ja
suurennos samoin kuin galleria-albumissa.

**Alt-käytäntö:** yksittäisen kuvan (`imageWithAlt`) alt on pakollinen. Kuvasarjan
kuvissa (`galleriaKuva`) alt on suositus, ja yhteinen kuvaus on pakollinen: ilman
kuvakohtaista alt-tekstiä kuva nimetään muodossa "Klubin vappu 2026, kuva 3/9"
(ruudun `aria-label` ja suurennoksen alt), joten jokaisella kuvalla on aina
merkityksellinen kuvaus.

**Kuvien poiminta tekstistä** (`lib/sisaltolohkot.ts`): `sisallonKuvat`
(yksittäiset kuvat ja kuvasarjojen kuvat järjestyksessä), `ensimmainenIsoKuva`
(ensimmäinen vähintään `KUVAN_MIN_LEVEYS_SISALTO` = 600 px leveä) ja `kuvanMitat`.
Samaa sääntöä käyttävät GROQ-funktio `korttikuva()` (uutiskortin kuva), jakokuva
(`lib/seo.ts`) ja uutisen kansikuvan varoitus Studiossa.

## Sisältötyypit

### 1. `sivu` (julkinen vapaamuotoinen sivu)
**Tarkoitus:** Yhdistyksen tietosivut kuten `/yhdistys`, `/saannot`, `/jasenyys`.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| title | string | kyllä | Sivun otsikko |
| slug | slug | kyllä | Osoite sivustolla (/[slug]) |
| tiivistelma | text | ei | Tiivistelmä sivun alussa |
| hero | image (alt pakollinen) | ei | Iso kuva sivun yläosassa |
| ingress | text | ei | Vanha kenttä: näkyy sivulla vain, jos `tiivistelma` on tyhjä. Studiossa piilossa, kun tyhjä (`hidden: ({ value }) => !value`) |
| body | portableText | kyllä | Pääsisältö (otsikot, listat, lainaukset, kuvat). Vaihtuu `rikasSisalto`ksi askeleessa 6 (docs/24) |
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
| description | rikasSisalto | kyllä | Tapahtuman kuvaus (myös kuvasarja) |
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
| tiivistelma | text | ei | Tiivistelmä jutun alussa; jos tyhjä, jutun alussa näkyy `excerpt` |
| excerpt | text | ei | Lyhenne (uutislista ja etusivu). Varoitus yli 200 merkistä. Valinnainen 8.10.2026 alkaen (docs/24 askel 2b): kortti näyttää `coalesce(excerpt, tiivistelma)`, ja jos kumpaakaan ei ole, tekstin alun (`ote` = kolmen ensimmäisen tavallisen kappaleen teksti, `korttiOte` lyhentää enintään 200 merkkiin sanarajalla). Meta-kuvauksen viimeinen vara on sama ote |
| coverImage | image (alt pakollinen) | ei | Kansikuva. Jos tyhjä, uutiskortti (listat, etusivu, haku, tunnisteet, lehtijutut) ja jakokuva käyttävät tekstin ensimmäistä vähintään 600 px leveää kuvaa, myös kuvasarjasta (`korttikuva()`, `sanity/lib/queries/uutiskortti.ts`). Uutissivu näyttää vain oikean kansikuvan, jottei sama kuva näy kahdesti. Varoitus (ei virhe), jos kuvaa ei ole kummassakaan |
| body | rikasSisalto | kyllä* | Sisältö. *Ei pakollinen, kun `ulkoinenLinkki` on täytetty |
| kategoriat | array of reference → `uutisKategoria` | ei | Sihteeri hallitsee kategoriat Studiossa (4.10.2026 asti merkkijonolista `categories` koodissa). Valintaruudut: `sanity/components/kategoriat/KategoriatInput.tsx`. Ensimmäinen kategoria näkyy etusivun jutuissa sinisenä yläotsakkeena. Kyselyt palauttavat `categories: { _id, value, label }[]` (`sanity/lib/queries/kategoriat.ts`). |
| tunnisteet | array of string | ei | Blogin "labels": aiheet, paikat, henkilöt (vapaa teksti, enintään 30 kpl, 50 merkkiä). Sama tunniste = sama slug (`lib/tunnisteet.ts`), joten "Huuhkajat" ja "huuhkajat" eivät saa olla samassa uutisessa. Studiossa oma syöttö ehdotuksineen (`sanity/components/tunnisteet/`). Jokaisella tunnisteella sivu `/uutiset/tunniste/<slug>`, hakemisto `/uutiset/tunnisteet`. Blogista tuoduissa täytetty `blogspot.tunnisteet`-kentästä (docs/14 §3). |
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
**Tarkoitus:** Yleisön jättämät arvostelut (`/ravintolat/arvostele`). Server Action tallentaa arvostelun **luonnoksena**. Isä hyväksyy julkaisemalla ja hylkää toiminnolla **Hylkää arvostelu** (poistaa luonnoksen ja sen kuvat), joten erillistä tilakenttää ei ole. Julkaistun arvostelun poisto on **Poista arvostelu** (sama toiminto); Studion tavallinen Poista on piilotettu tältä tyypiltä.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| reviewerName | string | kyllä | Julkaistava nimi (sähköpostia ei kerätä) |
| restaurant | reference→ravintola | julkaistaessa | Puuttuu, kun kävijä ehdotti uutta ravintolaa |
| ehdotettuRavintola | object { nimi, kaupunki, maa, lisatieto? } | ei | Kävijän ehdottama ravintola, jota ei ole hakemistossa. Sihteeri voi korjata ennen hyväksyntää (nimi ja kaupunki pakollisia) |
| ratingFood, ratingPrice, ratingAtmosphere | number 1,0–5,0 (yksi desimaali) | kyllä | Ruoka, hinta, viihtyvyys kuten klubin arvioissa. Kokonaisarvosana on keskiarvo, ja se lasketaan kyselyssä (`math::avg`) |
| comment | text | kyllä | 10–1000 merkkiä |
| kuvat | array of image { alt } | ei | Enintään 3 kävijän kuvaa. `alt` pakollinen (lomake täyttää oletuksen). Kuvatiedoston `source.name = "kavija-arvostelu"`. Ks. docs/18 |
| submittedAt | datetime | kyllä | Lähetysaika |

Vain julkaistut arvostelut näkyvät. Uuden ravintolan arvostelun julkaisu vaatii ravintolan. Studion toiminto **Hyväksy ja luo ravintola** (`sanity/actions/hyvaksy-ja-luo-ravintola.tsx`) etsii kaupungin nimellä tai luo sen, luo ravintolan (nimi, polku, kaupunki, osoite tai verkkosivu), liittää arvostelun ja julkaisee. Jos lomakkeen ehdotus vastaa olemassa olevaa ravintolaa (sama nimi ja kaupunki), arvostelu liitetään siihen jo lähetettäessä.

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
| category | string (enum: "fifa-ranking", "champions", "valmentajat", "vuoden-pelaaja", "ballon-dor", "saavutukset", "jarkytykset", "maailman-parhaat", "eurocup", "uefa-cup", "super-cup", "conference-league", "intercontinental", "karsinta") | kyllä | Vaikuttaa sivun renderöintiin |
| huuhkajatOsio | string (enum `lib/huuhkajat-osiot.ts`: "pelaajatilastot", "huuhkaja-arvostelu", "kansojen-liiga", "avauskokoonpano", "englanti", "muut") | kyllä, kun category = "huuhkajat" | Osiosivu `/jalkapalloarkisto/huuhkajat/[osio]`. Arvo on pysyvä URL-segmentti. Puuttuva/tuntematon → "muut". |
| kaudenOttelut | reference → jalkapalloTilasto (`category == "karsinta"`) | suositus (varoitus), kun osio on "kansojen-liiga" (`kaudenOttelut: true` tiedostossa `lib/huuhkajat-osiot.ts`) | Saman kauden karsintasivu. Karsintasivu näyttää taulukon taulukkonsa ja lisätietojen välissä (`karsintaBySlugQuery` → `kaudenTaulukot`), osiosivu linkittää taulukolta karsintasivulle. Migraatio ja `npm run patch:kansojen-liiga` parittavat saman `legacyUrl`:n perusteella. |
| mestaruusmaa | string (enum `lib/ulkomaiset-mestarit.ts`: "englanti", "venaja") | suositus (varoitus), kun category = "ulkomaiset-mestarit" | Maasivu `/jalkapalloarkisto/ulkomaiset-mestarit/[maa]`. Arvo on pysyvä URL-segmentti. Puuttuva → päätellään slugin etuliitteestä ("venajan-"), muuten "englanti". |
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

### 10b. `lehtileike` (docs/20)
**Tarkoitus:** Yksittäinen pelaajasta kertova lehtijuttu Litmanen-osiossa. Oma dokumentti (ei taulukko pelaajan sisällä): juttuja on kymmeniä, ja niitä lisätään ja järjestetään päivämäärän mukaan.

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|---|---|---|---|
| otsikko | string | kyllä | |
| pelaaja | reference→pelaaja | kyllä | Kenen sivulla näkyy |
| osio | string (enum: "lehtileikkeet", "patsas", "terveys") | kyllä | Sivu: lehtileikkeet / patsas / loukkaantumiset |
| julkaistu | date | kyllä | Järjestys, vuosiryhmät |
| lahde | string | ei | Esim. "is.fi" |
| linkki | url | ei | Alkuperäinen juttu |
| teksti | portableText | kyllä | Listassa näkyy ote, koko teksti avautuu |

`pelaaja`-tyypin lisäkentät (docs/20): `syntymapaikka`, `pituus`, `saavutukset[]` (`ryhma`, `nimi`, `vuodet`), `uutistunniste`, `patsas` (`paljastettu`, `sijainti`, `esittely`, `kuvat[]` = `paivattyKuva`, `uutistunniste`). `paivattyKuva` = kuva + alt (pakollinen) + kuvateksti + `paivamaara`.

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
| heroEyebrow | string | ei | Klubin nimi yläosan pienellä rivillä (etusivun H1) |
| heroNosto | reference → uutinen | ei | Yläosan pääjuttu. Tyhjä = uusin juttu automaattisesti |
| heroNostoAsti | datetime | ei | Nosto voimassa asti; sen jälkeen taas uusin juttu. Näkyy vain kun heroNosto on valittu |
| heroLaskuri | boolean | ei | Seuraava Huuhkajien ottelu + laskuri yläosan Seuraavaksi-kortissa (oletus päällä) |
| heroImage | imageWithAlt | ei | Yläosan taustakuva (harmaasävy + 85 % yönsininen) ja jakokuva (Open Graph). Ilman kuvaa logo vesileimana |
| heroCtas | array of { label, href } (max 4) | ei | Pikalinkit Seuraavaksi-kortissa. `primary` piilotettu (vanha) |
| heroDescription | text | kyllä | SEO-ryhmässä: etusivun meta-kuvaus, ei näy sivulla |
| heroTitle | string | ei | **Piilotettu** — vanhan kuvaheron otsikko. Säilyy, jotta vanha data on validia. |
| seuraavaOttelu | object | ei | **Piilotettu** — korvattu otteluohjelmalla. Säilyy, jotta vanha data on validia. |
| blocks | array (multi-type: otteluohjelma, uutiset, tapahtumat, esittely, ravintolatSpotlight, jalkapalloarkisto, galleria, cta) | ei | Etusivun lohkot järjestyksessä. Tyylioppaan järjestys: otteluohjelma, uutiset, ravintolatSpotlight, esittely. `uutiset`, `esittely` ja `ravintolatSpotlight` saavat `eyebrow`-kentän. `ravintolatSpotlight` näyttää tuoreimmin arvioidut (`visits[0]`, varalla `visitedAt`). `otteluohjelma`: ottelutHeading, ottelutCount, vainMaajoukkue (boolean, oletus true), seurat (string[], tags, oletus ["FC Lahti"]), laskuri (boolean, **piilotettu** — laskuri on yläosassa, etusivu ohittaa arvon), tapahtumatHeading, tapahtumatCount. `cta` on vanha — tyyliopas kieltää liittymiskehotteet. Jokaisen seitsemän lohkotyypin ensimmäinen kenttä on `piilota` (boolean, "Piilota lohko sivulta", oletus false; puuttuva = näkyvä): `etusivuQuery` hakee `blocks[piilota != true]`, ja esikatselun alaotsikon eteen tulee "Piilotettu · ". `ottelujenSeuratQuery` **ei** suodata piilotusta, joten seuralista ohjaa /ottelut-sivua myös piilotetusta lohkosta (docs/24 askel 1). |

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
| `uutinen` | `ulkoinenLinkki` (url), `lahde { nimi, url, pvm }`; kategoria `blogi` | Otsikkoarkisto linkittää Blogspot-kirjoituksiin; vanhat merkinnät päättyvät lähderiviin "(palloliitto.fi 07.02.2008)". `excerpt` ja `body` ovat pakollisia **paitsi** jos `ulkoinenLinkki` on annettu (`excerpt` on valinnainen 8.10.2026 alkaen, docs/24 askel 2b). |
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

### Klubilaisten arvosanat (docs/21)

**`klubilainen`** (dokumentti): `nimi` (pakollinen), `taulukkoNumero` (vain luku, ruokailutaulukon arvioijanumero).

**`klubiArvio`** (dokumentti): `ravintola` (viite, pakollinen), `arvioija` (viite `klubilainen`, pakollinen; varoitus jos klubilaisella on jo arvosana samaan ravintolaan), `ratingFood`/`ratingPrice`/`ratingAtmosphere` (1–5, pakollinen), `paiva` (pakollinen; uusin voimassa), `kaynnit` (date[], tiedoksi), `tuotu` (vain luku: ruokailutaulukosta).

**`ravintolaKayttajaArvostelu.arvioija`**: viite `klubilainen`. Lomake täyttää, kun arvostelija valitsee nimensä klubilaisten listasta (muistetaan laitteelle) tai kirjoittaa täsmälleen saman nimen; puuttuessa varoitus. `comment` on vapaaehtoinen (4.10.2026): pelkät arvosanat riittävät. Klubilaiseen liitetty arvostelu on klubilaisen arvosana.

**`ravintola`**: `automaattinenArvosana` { `arvioijia`, `viimeisinArvio` } (vain luku; kun asetettu, arvosanakentät ovat lukittuja), `alkuperainenArvio` { ratingOverall, ratingFood, ratingPrice, ratingAtmosphere } (vain luku, vanhan sivuston arvo vertailuun). `visits` validoidaan uusin ensin.

## uutisKategoria (4.10.2026)

| Kenttä | Tyyppi | Pakollinen | Huomio |
|---|---|---|---|
| nimi | string 2–40 | kyllä | Uniikki (kirjainkoosta riippumatta) |
| slug | slug (nimestä) | kyllä | Suodattimen osoite `/uutiset?kategoria=<slug>`. Siirretyt kategoriat säilyttivät vanhat arvot (`otteluraportti`, `tapahtumaraportti` …), id `uutisKategoria-<vanha arvo>` |
| kuvaus | text ≤ 200 | ei | Kategoriasivun meta description |
| jarjestys | number | ei | Suodattimen järjestys, tyhjät viimeisenä aakkosjärjestyksessä |
| aiemmatPolut | string[] | ei | Vanhat polut ohjataan 308:lla nykyiseen (esim. `jasentieto` → `tapahtumaraportti`) |

Siirto: `npm run patch:uutiskategoriat` (scripts/lib/uutiskategoriat.ts). Webhook tyhjentää `uutisKategoria`-muutoksessa myös `uutinen`-tagin.

