# 06 — Migraatiosuunnitelma

Tämä dokumentti kuvaa, miten `lahdensuomalainenklubi.com`-sivuston sisältö on siirretty uuteen Sanity-pohjaiseen sivustoon ja miten siirto ajetaan uudelleen. Tavoite: ei tietojen häviötä, ja kaikki vanhat URL:t ohjataan kunnolla.

Sitova sopimus maalista, putkesta ja agenttien vastuista on `docs/12-sisaltomigraatio.md`. Tämä dokumentti kertoo tilan ja komennot.

## Tila (2026-09-27)

**Migraatio on ajettu development-datasetiin.** Vaiheet 0–2 ja QA:n ensimmäisen kierroksen korjaukset ovat valmiit. Korjaukset on tehty putkeen, ei käsin Sanityyn. Mitatut luvut ja korjauskierroksen muutokset ovat docs/12:n loppuosassa "Toteutunut tilanne".

| Putki | Lähde | Dokumentit (development) | Komento |
|---|---|---|---|
| Ravintolat | `ruokailu*.htm` (46) | 498 `ravintola` + 90 `kaupunki` (postitoimipaikasta) | `npm run migrate:ravintolat` |
| Stadionit (M5) | `stadion*.htm` + hubi (19) | 17 `stadion`, 5 uutta `kaupunki`, 1 tilasto | `npm run migrate:stadionit` |
| Uutisarkisto (M1) | `kommentit*` + `blogi*` + otsikkoarkisto (50) | 222 `uutinen` | `npm run migrate:uutiset` |
| Huuhkajat (M2) | ottelut-, arvostelu- ja pelaajasivut (21) | 28 `jalkapalloTilasto` | `npm run migrate:huuhkajat` |
| Tilastot (M3) | mestarit, valmentajat, palkinnot, eurocupit (21) | 23 `jalkapalloTilasto` | `npm run migrate:tilastot` |
| Arvokisat (M4) | MM/EM, mitalistit, Litmanen, Pikkuhuuhkajat (17) | 15 `arvokisa`, 1 `pelaaja`, 62 tilastoa | `npm run migrate:arvokisat` |
| Klubi (M6) | yleistä, toiminta, veikkaus, etusivu (21) | 4 `sivu`, 9 `klubiToiminta`, 73 tilastoa, 4 singletonia | `npm run migrate:klubi` |
| **Kaikki** | 198 vanhaa URL:ia | 1 048 dokumenttia (92 kaupunkia) | `npm run migrate:all` |

`production`-datasettiin ei ole kirjoitettu. Julkaisussa koko sisältö kopioidaan kerralla (docs/12 §0):

```bash
npx sanity dataset copy development production
```

## Putki

```
data/raw-html/*.htm                    ← npm run crawl (paikallinen kopio, ei verkkoa)
data/images/ + normalized/kuvat.json   ← npm run images
   │  scripts/parse-<tyyppi>.ts        ← jäsennys, CMS-riippumaton
   ▼
data/normalized/<tyyppi>.json          ← + <tyyppi>-report.json, <tyyppi>-kuvat-dropped.json
   │  scripts/import-<tyyppi>.ts       ← ohut Sanity-adapteri
   ▼
data/migration-<tyyppi>.ndjson         ← + data/coverage-<tyyppi>.tsv
   │  scripts/sanity-import.ts         ← aina development, --replace
   ▼
Sanity (development)
   │  scripts/build-coverage.ts        ← data/coverage.tsv + normalized/kuvat-dropped.json
   │  scripts/generate-redirects.ts    ← lib/redirects.ts Sanityn legacyUrl-kentistä
   ▼
Tarkistukset: verify:migration, verify:redirects, verify:content
```

Jokainen `migrate:<tyyppi>` ajaa parse → import → Sanity-tuonti. Kaksi peräkkäistä ajoa tuottavat tavulleen saman NDJSON:n (deterministiset `_id`:t ja `_key`:t, ei aikaleimoja).

### Komennot

| Tehtävä | Komento |
|---|---|
| Yksi putki | `npm run migrate:<ravintolat\|stadionit\|uutiset\|huuhkajat\|tilastot\|arvokisat\|klubi>` |
| Kaikki putket + kattavuus + ohjaukset | `npm run migrate:all` |
| Kattavuuskooste (+ kohde-id:t Sanitysta) | `npm run migrate:coverage` |
| Ohjaukset Sanityn `legacyUrl`-kentistä | `npm run redirects` (`-- --offline` = vain säännöt) |
| §1-datatarkistus (mojibake, taulukot, kuvat, singletonit) | `npm run verify:migration` |
| Pakolliset kentät skeeman säännöillä | `npx sanity documents validate -d development` |
| Ohjaukset (palvelin käynnissä) | `npm run verify:redirects` |
| Jokainen dokumentti renderöityy (palvelin käynnissä) | `npm run verify:content` |

Ohjaus- ja renderöintitarkistukset ajetaan käynnissä olevaa palvelinta vasten: `npm run dev` tai `npm run build && npx next start -p 3100` ja `BASE_URL=http://localhost:3100`.

### Järjestys `migrate:all`-ajossa

1. **Ravintolat ensin**: `import-ravintolat.ts` luo kaupungit, joihin muut viittaavat. `--replace` tyhjentää ravintolan `images`- ja `review`-kentät, joten putki ajaa lopuksi `import-kuvat.ts`:n (kuvat) ja `patch-ravintola-arviot.ts`:n (Kuu-, Loiste- ja Salud-sivujen arviot).
2. Stadionit, uutiset, Huuhkajat, tilastot, arvokisat, klubi: toisistaan riippumattomia.
3. Kattavuus ja ohjaukset viimeisinä, koska ne lukevat valmiin datasetin.

Parserit lukevat vanhojen `.htm`-linkkien uudet kohteet `lib/redirects.ts`:stä. Jos ohjaukset muuttuvat, aja putket uudelleen, jotta tekstin sisäiset linkit osoittavat uusiin kohteisiin. Kierros on vakaa: toinen ajo ei muuta mitään.

## Datan puhdistus — toteutetut säännöt

### Merkistö
`<meta charset>` ei ole luotettava. Dekoodaus tehdään tiukalla UTF-8:lla, ja jos se epäonnistuu, käytetään windows-1252:ta (`scripts/lib/decode-html.ts`).

**Havainto integraatiossa:** Node 24:n `TextDecoder("windows-1252")` dekoodaa tavut 0x80–0x9F C1-ohjausmerkeiksi (esim. 0x96 → U+0096 eikä "–"). Mojibake-haku ei löydä niitä. Vaiheessa 1 vika näkyi 16 uutisessa, 3 karsintasivulla ja U21-EM-kisassa. Yhteinen apuri käyttää omaa taulukkoa, ja kaikki putket on ajettu uudelleen: C1-merkkejä on nyt 0.

### HTML-entiteetit
`cheerio` purkaa entiteetit tekstistä. Kuvainventaarion (`kuvat.json`) alt-tekstit ovat kuitenkin raakoja attribuutteja (`HofBr&auml;uhaus`). `import-kuvat.ts` purkaa ne `decodeEntities`-apurilla. Integraatiossa korjattiin 12 ravintolakuvan alt-teksti.

### Tilastotaulukot
Kaikki viisi tilastoputkea ajavat taulukot lopuksi `scripts/lib/normalize-cell.ts`:n läpi. Päivämäärät muutetaan ISO-muotoon (DD.MM.YYYY → YYYY-MM-DD ja välit → `YYYY-MM-DD/YYYY-MM-DD`). Lukusoluista poistetaan tuhaterotin (`61 035` → `61035`), ja näkymättömät merkit (U+200B ym.) poistetaan. Jos sarakkeessa on yksikin epäselvä arvo, koko sarake jää tekstiksi. **Yhteenvetorivit** (solu `Yhteensä`, `Keskiarvo`, `Summa` tai `Total`, apuri `isSummaryRow`/`withoutSummaryRows`) eivät vaikuta sarakkeen tyyppiin, ei parsereiden tyyppipäättelyssä eikä `normalizeGrid`:ssä. Niiden tyyppiin sopimattomat solut jäävät tekstiksi. Juurisyy korjattu 2026-09-27: jouluruokailun osallistujataulukon rivi `Yhteensä | 197 | Keskiarvo | 7,9 henkilöä` kaatoi sarakkeet `ensimmainen`/`viimeinen` tekstiksi, jolloin 44 solua jäi DD.MM.YYYY-muotoon. `components/ui/stat-table.tsx` näyttää arvot suomalaisittain. Päiväväli renderöidään kahtena `<time>`-elementtinä, koska `datetime` ei hyväksy ISO-väliä.

Taulukot on tallennettu muotoon `jalkapalloTilasto.columns/rows`. Sarakeotsikot on lisätty sinne, missä lähteessä niitä ei ollut, ja jokainen muutos on kirjattu `<tyyppi>-report.json`-tiedostoon. Tyhjiä soluja ei tallenneta tyhjinä merkkijonoina, joten renderöijä käsittelee puuttuvan solun tyhjänä. Lähteen laskuvirheitä (esim. V+T+H ≠ O) ei ole korjattu hiljaa, vaan ne on merkitty `needsReview`-lipulla.

### Kuvat
Sisältökuvat on ladattu `_sanityAsset`-viittauksin, ja Sanity deduplikoi ne sisällön hashilla. Sama kuva voi siksi olla useassa dokumentissa samana assetina. Päätös: tämä on sallittua, kun kuva liittyy kumpaankin, esim. valmentajakuva sekä uutisessa että valmentajataulukossa. Pudotetut kuvat perusteluineen ovat tiedostossa `data/normalized/kuvat-dropped.json` (212 kpl: Wikimedian lippukuvat, hubien koristekuvat, toisteiset paikkamerkit).

### Blogspot
Blogin kaikki 528 kirjoitusta tuodaan uutisina omalla putkellaan: **docs/14-blogspot-migraatio.md** (`npm run blogspot:fetch` + `npm run migrate:blogspot`). Otsikkoarkiston 300 Blogspot-linkkiä on jäsennetty tiedostoon `data/normalized/uutiset-otsikkoarkisto.json`, mutta **`import-uutiset.ts --otsikkoarkisto` -lippua ei pidä enää käyttää**, koska se loisi linkkityngät samoista kirjoituksista, jotka on nyt tuotu kokonaisina.

## Ohjaukset

`scripts/generate-redirects.ts` lukee kohteet Sanityn `legacyUrl`- ja `muutLegacyUrlit`-kentistä. Reitti muodostetaan `lib/path.ts`:n `documentRoute`-funktiolla. Etusija on tämä:

1. `data/manual-redirects.csv` (käsin tehdyt poikkeukset)
2. Sanity (auktoritatiivinen)
3. Skriptin säännöt: kehykset, hubit ja kaupunkisivut, joilla ei ole omaa dokumenttia

Kun useampi dokumentti jakaa saman vanhan osoitteen:

- **Uutiset:** vuosisivu ohjautuu arkistoon `/uutiset/arkisto/<vuosi>`. Yhden merkinnän sivu ohjautuu suoraan uutiseen.
- **Muut:** oma sivu voittaa listaussivun osion. Esimerkiksi MM2010.htm ohjautuu kisasivulle eikä lohkotaulukkoon, ja ottelut2018ja2019.htm karsintasivulle eikä Kansojen liigan taulukkoon.
- **Useita omia sivuja:** kohteena on niiden listaussivu (kansojenliiga.htm → /jalkapalloarkisto/arvokisat).
- **Ravintolasivut (`ruokailu*.htm`):** kohde lasketaan siitä, mihin kaupunkeihin sivun ravintolat viittaavat. Jos yli puolet on samassa kaupungissa, kohde on `/ravintolat?kaupunki=<slug>`, muuten `/ravintolat`. Sivun nimeä (esim. "uusimaa") ei käytetä, koska sillä nimellä ei ole kaupunkia.

Skripti epäonnistuu, jos yksikin vanha URL jää kartoittamatta.

## Manuaalinen sisältö (ei automaatiota)

Näitä ei ole vanhalla sivustolla, joten ne täytetään Studiossa. Lista on myös oppaan (docs/09) kohdassa "Täytä itse":

- yhdistyksen yhteystiedot (osoite, postinumero, sähköposti, puhelin, Y-tunnus, IBAN, some)
- hallituksen jäsenet
- säännöt
- jäsenmaksut ja hakuprosessi
- tulevat tapahtumat
- `needsReview`-dokumenttien tarkistus

## Verifiointi

- [x] 198/198 vanhaa URL:ia `data/coverage.tsv`:ssä, `unknown` = 0
- [x] 0 mojibakea, 0 C1-merkkiä, 0 purkamatonta entiteettiä, 0 näkymätöntä merkkiä (1 048 dokumenttia)
- [x] 0 validointivirhettä (`sanity documents validate`), 3 varoitusta (yhteystiedot)
- [x] 512/512 päivämääräsarakkeiden solua ISO-muodossa. `verify:migration` tarkistaa myös text-sarakkeet: jos sarakkeen kaikki ei-yhteenvetoarvot ovat DD.MM.YYYY-muodossa, se on kriittinen virhe. Sallittuja poikkeuksia on 14 solua sekasarakkeissa (`klubi-arvokisaveikkaus-*.huomautus`: maksupäivä tai "Voittaja"/"Ei maksettu").
- [x] 199/199 ohjausta toimii, 0 osoittaa 404-sivulle tai tyhjään ravintolalistaan
- [x] 953/953 migroitua dokumenttia renderöityy reitillään otsikkoineen
- [x] `migrate:all` kahdesti → 37 tuotostiedostoa tavulleen samat
- [ ] QA-satunnaisotanta (docs/12 §1.6, vaihe 3, toinen kierros)
- [ ] `needsReview`-dokumentit tarkistettu Studiossa (57 kpl, ks. docs/09)
