# 06 — Migraatiosuunnitelma

Tämä dokumentti kuvaa, miten nykyinen `lahdensuomalainenklubi.com` -sisältö siirretään uuteen Sanity-pohjaiseen sivustoon. Tavoite: ei tietojen häviötä, kaikki vanhat URL:t kunniallisesti ohjattuja.

## Yleisrakenne

```
[ vanhasivu.com ] ──scrape──> [ data/raw-content.json ]
                                       │
                                       ▼
                              [ normalisointi ]
                                       │
                                       ▼
                            [ data/migration.ndjson ]
                                       │
                            sanity dataset import
                                       │
                                       ▼
                            [ Sanity dataset ]
```

## Vaiheet

### 1. Scrape (`scripts/scrape-old-site.ts`)
- Käy läpi kovakoodatun URL-listan (`TARGETS`-vakio skriptissä)
- Käyttää `fetch` + `cheerio` HTML:n jäsentämiseen
- Tallentaa raakaformaatissa: title, otsikot, kappaleet, taulukot, linkit, kuvat, koko HTML
- Tulos: `data/raw-content.json`
- Komento: `npm run scrape`

### 2. Normalisointi (`scripts/normalize.ts` — kirjoitetaan myöhemmin)
Muunnos raakadatasta Sanity-yhteensopiviksi NDJSON-dokumenteiksi:
- **Yksi NDJSON-rivi = yksi Sanity-dokumentti**
- Asetetaan `_type` (esim. `ravintola`, `jalkapalloTilasto`)
- Generoidaan slug (suomennusmuunnin `ä → a`, `ö → o`)
- Asetetaan `_id` deterministisesti (esim. `drafts.ravintola-pizza-roma-lahti`)
- Tähtiarvostelu erotetaan tekstistä numerokenttään `stars`
- Tilastotaulukot muutetaan `{columns: [...], rows: [{cells: [...]}]}` -rakenteeseen
- Kuvat tallennetaan asseteiksi (URL:n perusteella ladataan)
- Tulos: `data/migration.ndjson`

### 3. Sanity-import
```bash
npx sanity dataset import data/migration.ndjson production --replace
```
- `--replace` korvaa olemassa olevat dokumentit (turvallista ennen julkaisua)
- Tarkista virheloki: jos jokin dokumentti epäonnistuu, korjaa ja aja uudelleen
- Kuvat ladataan automaattisesti jos NDJSON sisältää `_sanityAsset: "image@URL"` -viittauksia

### 4. Tarkistus Studiossa
Isäsi (tai poika) käy läpi importoidun sisällön:
- Onko jokin ravintola jäänyt pois?
- Onko tähtiarviointi oikein?
- Ovatko kuvat ladannut?
- Onko portable text -sisällössä outoja merkkejä? (HTML-entiteetit kuten `&auml;` pitää muuntaa)
- Korjaa virheet Studiossa, ne tallentuvat Sanityyn eivätkä häviä uudelleenimportissa (kun käytetään `--missing` -lippua)

### 5. Redirect-mappi (`scripts/generate-redirects.ts` — kirjoitetaan myöhemmin)
- Lukee `data/raw-content.json` + manuaalisen `data/manual-redirects.csv`:n
- Generoi `lib/redirects.ts`:n sisällön (yliajaa nykyisen tiedoston)
- Aja `npm run redirects` sprintin 5 aikana
- Tarkista output: kaikki vanhat URL:t pitäisi mainita

## Datan puhdistus — yksityiskohdat

### HTML-entiteetit
Vanhat sivut käyttävät HTML-entiteettejä (`&auml;` → `ä`). `cheerio` purkaa nämä jo `.text()`-kutsussa, mutta varmista että muunnokset pitävät paikkansa erityisesti slug-generaatiossa.

### Tähtiarvostelut ravintoloista
Vanhalla sivulla tähdet ovat usein `★★★★☆` -merkeillä tai sanoina "neljä tähteä". Normalisointiskripti tarvitsee säännön:
1. Etsi `★` tai `☆` -merkkejä ja laske
2. Jos puuttuu, etsi `\d/5` -muotoja
3. Jos puuttuu, etsi numeronumeronpalin "kolme tähteä"/"neljä tähteä"
4. Jos epäselvää, jätä `stars: null` ja merkitse `_needsReview: true`

### Tilastotaulukot
Vanhalla sivulla taulukot ovat HTML `<table>`-elementtejä. Sarakkeiden tunnistus on heuristista:
1. Ensimmäinen `<tr>` on yleensä header
2. Sarakeotsikko → `key` (slugified) ja `label`
3. Riveistä luetaan solu kerrallaan, mapataan key-pareiksi

### Kuvat
- Vanhalla sivulla suhteelliset URL:t (`stadion1.jpg`) — muunna absoluuttisiksi (`https://www.lahdensuomalainenklubi.com/stadion1.jpg`)
- 404-kuvia ohitetaan ja merkitään `_imageError: true`
- Kuvien metadata: alt-teksti otetaan `alt`-attribuutista, jos puuttuu, generoidaan kontekstista (esim. ravintolan nimi)

### Blogspot-postaukset
- `lahdensuomalainenklubi.blogspot.com` ei ole ensimmäisessä scrape-listassa
- Lisätään myöhemmin: tarkka URL-lista lukijoineen, RSS-feed (`/feeds/posts/default?alt=rss`)
- Jokainen postaus → `uutinen`-dokumentti, säilytä julkaisupäivä

## Manuaalinen sisältö (ei automaatiota)

Isältä kysytään:
- Yhdistyksen yhteystiedot (osoite, sähköposti, puhelin, Y-tunnus, IBAN)
- Hallituksen jäsenten täydelliset tiedot ja kuvat
- Jäsenyysmaksut ja hakuprosessi
- Säännöt (PDF tai teksti)
- Tulevat tapahtumat 2026 (jos ei vielä Sanityssa)

Nämä lisätään suoraan Studiossa, ei migraatioskriptissä.

## Aikataulu

| Vaihe | Kesto | Sprint |
|---|---|---|
| Scrape | ~30 min | 1 |
| Normalisointi (skripti + iterointi) | 1–2 päivää | 1 |
| Sanity-import + tarkistus | 1 päivä | 1 |
| Manuaalisen sisällön kerääminen isältä | epäselvä, riippuu isästä | 2–3 |
| Blogspot-postausten erikoismigraatio | 0.5 päivää | 3 |

## Verifiointi

Ennen kuin migraatio katsotaan valmiiksi:
- [ ] Studio näyttää ≥ 90 % vanhasta sisällöstä
- [ ] Ei _needsReview: true -dokumentteja jäljellä (tai kaikki tarkistettu manuaalisesti)
- [ ] Kaikki vanhat URL:t kartoitettu redirectiin (manuaalisesti varmistettava)
- [ ] Kuvat näkyvät kaikilla migroiduilla sivuilla
