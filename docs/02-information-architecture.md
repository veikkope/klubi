# 02 — Informaatioarkkitehtuuri

> **Päivitetty 2026-09-27** tyylioppaan "Sivut v3" (docs/design-handoff/) mukaiseksi. Sivuston pääaihe on suomalainen jalkapallokulttuuri, toinen aihe ravintola-arviot. Valikossa ei ole liittymis-CTA:ta (tyyliopas: "Do not build any join CTA").

## Päänavigaatio

| # | Linkki | Polku | Tyyppi |
|---|---|---|---|
| 1 | **Jalkapallo** ▾ | `/uutiset` | Dropdown: jutut + jalkapalloarkisto |
| 2 | **Ottelut** | `/ottelut` | Otteluohjelma (automaattinen, docs/13) |
| 3 | **Ravintola-arviot** | `/ravintolat` | Hakemisto + yksittäiset arviot |
| 4 | **Tapahtumat** | `/tapahtumat` | Klubin omat tapahtumat |
| 5 | **Klubista** ▾ | `/klubi` | Dropdown |

Logo viittaa etusivulle `/`. Aktiivinen kohta: sininen teksti + 2 px sininen alleviivaus. Valikko on Sanityssa (singleton `navigaatio`); oletukset `lib/defaults.ts`.

### Jalkapallo-dropdown
- Kentältä ja katsomosta → `/uutiset`
- Jalkapalloarkisto → `/jalkapalloarkisto`
- Huuhkajat → `/jalkapalloarkisto/huuhkajat`
- Arvokisat → `/jalkapalloarkisto/arvokisat`
- Suomen mestarit → `/jalkapalloarkisto/mestarit`
- Pelaajat → `/jalkapalloarkisto/pelaajat`
- Stadionit → `/jalkapalloarkisto/stadionit`

### Klubista-dropdown
- Esittely → `/klubi`
- Toiminta → `/klubi/toiminta`
- Hallitus → `/klubi/hallitus`
- Palloveikkaus → `/klubi/palloveikkaus`
- Yhteystiedot → `/klubi/yhteystiedot`

Jos alakohde osoittaa pääkohteen sivulle, erillistä "yleisesittely"-linkkiä ei lisätä.

## Sivukartta

```
/                                Etusivu
├── /klubi                       Esittely (entinen "Yleistä")
│   ├── /klubi/hallitus
│   ├── /klubi/palloveikkaus     Klubin ennustuskilpailu (entinen "Veikkaus")
│   └── /klubi/yhteystiedot
├── /ottelut                     Otteluohjelma (Veikkausliiga + Studion ottelut)
├── /tapahtumat
│   └── /tapahtumat/[slug]
├── /uutiset                     Yhdistetty (entinen "Blogi" + "Kommentit")
│   └── /uutiset/[slug]
├── /uutiset/arkisto             2005–2024 historiallinen blogiarkisto
├── /uutiset/tunnisteet          tunnistehakemisto (suosituimmat + A–Ö)
├── /uutiset/tunniste/[slug]     yhden tunnisteen uutiset (blogin /search/label/…)
├── /jalkapalloarkisto           Hub (entinen "Historia")
│   ├── /jalkapalloarkisto/huuhkajat              entinen "Arvostelu"; hub: aiheet + karsintasarjat
│   │   └── /jalkapalloarkisto/huuhkajat/[osio]   pelaajatilastot, huuhkaja-arvostelu, kansojen-liiga,
│   │                                             avauskokoonpano, englanti (lib/huuhkajat-osiot.ts)
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
├── /ravintolat                  Hakemisto suodattimineen (maa/maakunta/kaupunki/ruoka/arvosana)
│   ├── /ravintolat/[slug]
│   └── /ravintolat/arvostele
└── /galleria
    └── /galleria/[slug]
```

> Galleria ja uutisarkisto eivät ole päänavigaatiossa — niihin on linkki footerissa. Jäsenhakemuksia ei oteta vastaan sivuston kautta (päätös 28.9.2026): `/klubi/liity` on poistettu ja ohjautuu `/klubi`-sivulle.

## Linkkimuutokset — vanha → uusi (jokaisesta lähtee 301)

| Vanha | Uusi | Huomio |
|---|---|---|
| `/` `/etusivu.htm` | `/` | Etusivu säilyy |
| `/yleista.htm` | `/klubi` | "Yleistä" → "Klubi (esittely)" |
| `/klubi.htm` | `/klubi` | Nykyisin 404 — ohjataan klubisivulle |
| `/ottelut.htm` | — | Ei ollut olemassa vanhalla sivustolla (404), ei ohjausta. Uusi `/ottelut` on eri sisältö. |
| `/arvostelu.htm` | `/jalkapalloarkisto/huuhkajat` | "Arvostelu" oli harhaanjohtava nimi |
| `/veikkaus.htm` | `/klubi/palloveikkaus` | Klubin sisäinen aktiviteetti |
| `/kommentit.htm` | `/uutiset/arkisto` | Yhdistetty uutisarkiston kanssa |
| `/Kommentit2022.htm` | `/uutiset/arkisto` | Sama |
| `/blogi.htm` | `/uutiset` | "Blogi" → "Uutiset" |
| `/historia.htm` | `/jalkapalloarkisto` | Jalkapalloarkiston hub |
| `/stadionit.htm` | `/jalkapalloarkisto/stadionit` | Siirretty arkiston alle |
| `/ruokailu.htm` | `/ravintolat` | "Ruokailu" → "Ravintolat" |

Lisäksi kaikki yksittäiset alasivut (ks. `lib/redirects.ts`).

## Ravintolahakemiston URL-parametrit

Tila on URL:ssa (GET-lomake, toimii ilman JavaScriptiä). Kaikki parametrit ovat valinnaisia ja yhdistyvät JA-ehdolla. Oletusarvot jätetään pois osoitteesta. Rajatut näkymät ovat `noindex, follow`.

| Parametri | Arvo | Esimerkki | Huomio |
|---|---|---|---|
| `maa` | maan slug (`lib/slugify.ts` maan nimestä) | `?maa=saksa`, `?maa=venaja`, `?maa=iso-britannia` | Tuntematon slug → tyhjätila "Ei osumia". |
| `maakunta` | maakunnan arvo (`lib/maakunnat.ts`), useampi pilkulla | `?maakunta=uusimaa`, `?maakunta=etela-savo,pohjois-savo` | Vain Suomi. Jos `maa` on muu kuin `suomi`, maakunta ohitetaan. Useampi arvo = mikä tahansa niistä (vanhat aluesivut, jotka ylittävät maakuntarajan). Myös `?maakunta=a&maakunta=b` hyväksytään. |
| `kaupunki` | kaupungin slug | `?kaupunki=lahti` | Maa-tason viitteet (Portugali, Ruotsi, Venäjä) eivät ole valikossa. |
| `ruoka` | ruokatyyppi | `?ruoka=pizza` | |
| `arvosana` | vähimmäisarvosana | `?arvosana=4` | |
| `lopettaneet` | `1` | `?lopettaneet=1` | Näyttää myös toimintansa lopettaneet. |
| `jarjesta` | `nimi` | `?jarjesta=nimi` | Oletus: arvosana. |
| `sivu` | ≥ 2 | `?sivu=2` | 24 ravintolaa sivulla. |

Järjestys osoitteessa: kaupunki, maa, maakunta, ruoka, arvosana, lopettaneet, jarjesta, sivu (`buildRavintolaHref`). Maakuntavalikko näkyy, kun maata ei ole valittu tai se on Suomi. Kaupunkivalikko rajautuu valittuun maahan ja maakuntaan (valittu kaupunki pysyy listassa).

## Footer

Tyyliopas: yönsininen, valkoinen pystylogo, linkkisarakkeet ja tekijänoikeusrivi.
- **Jalkapallo**: Ottelut, Kentältä ja katsomosta, Jalkapalloarkisto, Uutisarkisto
- **Klubi**: Ravintola-arviot, Tapahtumat, Klubista, Kuvagalleria
- **Yhteystiedot**: sähköposti, puhelin, osoite/kaupunki, some, Y-tunnus/IBAN (Sanity `yhteystiedot`)
- **Alarivi**: © vuosi Lahden Suomalainen Klubi ry · Ylläpito (`/studio`)

## Breadcrumbs

Kaikilla alasivulla. Generoidaan automaattisesti URL-rakenteesta + Sanity-otsikoista. JSON-LD `BreadcrumbList` SEO:ta varten.

## URL-konventiot

- **Suomeksi, ilman ääkkösiä** (slug-muuntaja `ä → a`, `ö → o`, `å → a`)
- **Pienet kirjaimet, väliviivat** (`/jalkapalloarkisto/vuoden-pelaajat`)
- **Lyhyt mutta kuvaava** — mieluummin `/klubi` kuin `/tietoa-yhdistyksesta`

## Etusivun rakenne

Tyyliopas (Sivut v3): etusivu esittelee klubin ensin ja näyttää sitten ajankohtaisen sisällön. Uutta sisältöä tulee noin kerran kuussa.

1. **Hero** (yönsininen) — yläotsake, H1, ingressi, kaksi tekstilinkkiä (Tulevat ottelut → / Lue klubista →), oikealla 4:5 kuva
2. **Otteluohjelma ja tapahtumat** — tulevat ottelut listana (1,5fr) + klubin tapahtumat kortteina (1fr)
3. **Kentältä ja katsomosta** (valkoinen) — uusin juttu isona + 3 listana
4. **Ravintola-arviot** — 3 parhaiten arvioitua korttina
5. **Klubista** (valkoinen) — kuva + esittelyteksti + linkki

Lohkot ovat Sanityssa konfiguroitavissa (singleton `etusivu`). Tyhjät lohkot piilottavat itsensä. Jalkapalloarkisto-, galleria- ja CTA-lohkotyypit ovat yhä olemassa, mutta niitä ei käytetä etusivulla.

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
