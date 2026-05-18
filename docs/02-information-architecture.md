# 02 — Informaatioarkkitehtuuri

> **Päivitetty 2026-05-18** vanhan sivuston täydellisen auditoinnin pohjalta. Nykyiset 10 + 1 yläpalkin linkkiä on tiivistetty 6 päälinkkiin + 1 CTA:han.

## Päänavigaatio

| # | Linkki | Polku | Tyyppi |
|---|---|---|---|
| 1 | **Klubi** ▾ | `/klubi` | Dropdown (5 alasivua) |
| 2 | **Tapahtumat** | `/tapahtumat` | Lista + yksittäiset |
| 3 | **Uutiset** | `/uutiset` | Lista + yksittäiset (sis. arkiston) |
| 4 | **Jalkapalloarkisto** ▾ | `/jalkapalloarkisto` | Dropdown (5 alasivua) |
| 5 | **Ravintolat** | `/ravintolat` | Hakemisto + yksittäiset |
| 6 | **Liity jäseneksi** | `/klubi/liity` | CTA-nappi (korostettu) |

Logo viittaa etusivulle `/`.

### Klubi-dropdown
- Esittely → `/klubi`
- Hallitus → `/klubi/hallitus`
- Säännöt → `/klubi/saannot`
- Palloveikkaus → `/klubi/palloveikkaus`
- Yhteystiedot → `/klubi/yhteystiedot`

### Jalkapalloarkisto-dropdown
- Huuhkajien ottelut → `/jalkapalloarkisto/huuhkajat`
- Suomen mestarit → `/jalkapalloarkisto/mestarit`
- Eurocupit → `/jalkapalloarkisto/eurocupit`
- Vuoden pelaajat → `/jalkapalloarkisto/vuoden-pelaajat`
- Stadionit → `/jalkapalloarkisto/stadionit`

## Sivukartta

```
/                                Etusivu
├── /klubi                       Esittely (entinen "Yleistä")
│   ├── /klubi/hallitus
│   ├── /klubi/saannot
│   ├── /klubi/palloveikkaus     Klubin ennustuskilpailu (entinen "Veikkaus")
│   ├── /klubi/yhteystiedot
│   └── /klubi/liity             Sähköinen jäsenhakemus
├── /tapahtumat
│   └── /tapahtumat/[slug]
├── /uutiset                     Yhdistetty (entinen "Blogi" + "Kommentit")
│   └── /uutiset/[slug]
├── /uutiset/arkisto             2005–2024 historiallinen blogiarkisto
├── /jalkapalloarkisto           Hub (entinen "Historia")
│   ├── /jalkapalloarkisto/huuhkajat              entinen "Arvostelu"
│   ├── /jalkapalloarkisto/mestarit               suomi.htm
│   ├── /jalkapalloarkisto/valmentajat            suomenvalmentajat.htm
│   ├── /jalkapalloarkisto/vuoden-pelaajat        vuodenpelaaja.htm + FIFAvuodenpelaaja.htm
│   ├── /jalkapalloarkisto/euroopan-paras         euroopan_paras_pelaaja.htm
│   ├── /jalkapalloarkisto/saavutukset            top10jalkapallosaavutukset.htm
│   ├── /jalkapalloarkisto/eurocupit              hub
│   │   ├── /jalkapalloarkisto/eurocupit/champions-league
│   │   ├── /jalkapalloarkisto/eurocupit/europa-league
│   │   ├── /jalkapalloarkisto/eurocupit/conference-league
│   │   ├── /jalkapalloarkisto/eurocupit/super-cup
│   │   └── /jalkapalloarkisto/eurocupit/intercontinental
│   ├── /jalkapalloarkisto/fifa-ranking           fifaranking.htm
│   ├── /jalkapalloarkisto/karsinnat/[slug]       ottelut2012ja2013.htm
│   ├── /jalkapalloarkisto/lupaavat               lupaavia.htm
│   └── /jalkapalloarkisto/stadionit              hub
│       └── /jalkapalloarkisto/stadionit/[slug]
├── /ravintolat                  Hakemisto suodattimineen (kaupunki/tähdet)
│   ├── /ravintolat/[slug]
│   └── /ravintolat/arvostele
└── /galleria
    └── /galleria/[slug]
```

> Galleria ei ole päänavigaatiossa — siihen pääsee uutisten ja tapahtumien yhteydestä. Jos isä toivoo myöhemmin galleriaa pääpalkkiin, lisätään.

## Linkkimuutokset — vanha → uusi (jokaisesta lähtee 301)

| Vanha | Uusi | Huomio |
|---|---|---|
| `/` `/etusivu.htm` | `/` | Etusivu säilyy |
| `/yleista.htm` | `/klubi` | "Yleistä" → "Klubi (esittely)" |
| `/klubi.htm` | `/klubi` | Nykyisin 404 — ohjataan klubisivulle |
| `/ottelut.htm` | `/tapahtumat` | Nykyisin 404 — tulevat ottelut ovat tapahtumissa |
| `/arvostelu.htm` | `/jalkapalloarkisto/huuhkajat` | "Arvostelu" oli harhaanjohtava nimi |
| `/veikkaus.htm` | `/klubi/palloveikkaus` | Klubin sisäinen aktiviteetti |
| `/kommentit.htm` | `/uutiset/arkisto` | Yhdistetty uutisarkiston kanssa |
| `/Kommentit2022.htm` | `/uutiset/arkisto` | Sama |
| `/blogi.htm` | `/uutiset` | "Blogi" → "Uutiset" |
| `/historia.htm` | `/jalkapalloarkisto` | Jalkapalloarkiston hub |
| `/stadionit.htm` | `/jalkapalloarkisto/stadionit` | Siirretty arkiston alle |
| `/ruokailu.htm` | `/ravintolat` | "Ruokailu" → "Ravintolat" |

Lisäksi kaikki yksittäiset alasivut (ks. `lib/redirects.ts`).

## Footer

- **Yhdistys**: Lyhyt esittely, Y-tunnus, perustamisvuosi
- **Linkit**: Klubi, Tapahtumat, Uutiset, Ravintolat
- **Yhteystiedot**: Osoite, sähköposti, puhelin
- **Sosiaalinen media**: YouTube @suomalainenklubi, mahdolliset uudet kanavat
- **Tekijänoikeus**: © 2026 Lahden Suomalainen Klubi ry

## Breadcrumbs

Kaikilla alasivulla. Generoidaan automaattisesti URL-rakenteesta + Sanity-otsikoista. JSON-LD `BreadcrumbList` SEO:ta varten.

## URL-konventiot

- **Suomeksi, ilman ääkkösiä** (slug-muuntaja `ä → a`, `ö → o`, `å → a`)
- **Pienet kirjaimet, väliviivat** (`/jalkapalloarkisto/vuoden-pelaajat`)
- **Lyhyt mutta kuvaava** — mieluummin `/klubi` kuin `/tietoa-yhdistyksesta`

## Etusivun rakenne

1. **Hero** — kuva, otsikko, slogan, CTA "Liity jäseneksi"
2. **Ajankohtaista** — 3 viimeisintä uutista korttina (yhdistetty entiset BLOGI + KOMMENTIT)
3. **Tulevat tapahtumat** — 3 seuraavaa tapahtumaa kortteina
4. **Esittely** — lyhyt klubin esittely + CTA → `/klubi`
5. **Ravintolat-spotlight** — TOP 5 Lahden ravintoloista
6. **Jalkapalloarkisto-teaser** — nykyinen FIFA-ranking + linkki arkistoon
7. **CTA-banneri** — Liity jäseneksi

Etusivun lohkot ovat Sanityssa konfiguroitavissa (singleton `etusivu`).

## Mobiilikäytettävyys

- Tap-targets ≥ 44×44 px
- Lukutekstit ≥ 16 px mobiilissa
- Navigaatio sticky top
- Hampurilaisvalikko: Sheet-komponentti, kolme alimmaista linkkiä (Tapahtumat, Uutiset, Liity) näkyvät myös bottom-tab-tyyppisesti tarvittaessa
- Dropdownit muuttuvat mobiilissa avautuviksi alisarakkeiksi

## Saavutettavuus

- `<nav aria-label="Päänavigaatio">`
- `aria-expanded` dropdowneille
- Skip-to-content -linkki
- Fokus-rengas näkyvissä
