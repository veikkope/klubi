# 02 — Informaatioarkkitehtuuri

## Sivukartta

```
/                                Etusivu
├── /yhdistys                    Tietoa klubista
│   ├── /yhdistys/hallitus       Hallitus
│   └── /yhdistys/saannot        Säännöt
├── /jasenyys                    Jäsenyysinfo
│   └── /jasenyys/liity          Hakemuslomake
├── /tapahtumat                  Tapahtumakalenteri
│   └── /tapahtumat/[slug]       Yksittäinen tapahtuma
├── /uutiset                     Uutiset / blogi
│   └── /uutiset/[slug]          Yksittäinen uutinen
├── /galleria                    Albumiluettelo
│   └── /galleria/[slug]         Yksittäinen albumi
├── /jalkapallo                  Jalkapalloarkiston etusivu
│   ├── /jalkapallo/fifa-ranking
│   ├── /jalkapallo/mestarit
│   ├── /jalkapallo/valmentajat
│   ├── /jalkapallo/vuoden-pelaaja
│   ├── /jalkapallo/euroopan-paras
│   ├── /jalkapallo/saavutukset
│   ├── /jalkapallo/eurocup
│   ├── /jalkapallo/uefa-cup
│   ├── /jalkapallo/super-cup
│   ├── /jalkapallo/conference-league
│   ├── /jalkapallo/intercontinental
│   └── /jalkapallo/karsinnat/[slug]
├── /ravintolat                  Ravintolahakemisto (filtteröitävä)
│   ├── /ravintolat/[slug]       Yksittäisen ravintolan sivu
│   └── /ravintolat/arvostele    Arvostelulomake
├── /stadionit                   Stadionhakemisto
│   └── /stadionit/[slug]        Yksittäinen stadion
└── /yhteystiedot                Yhteystiedot + kartta
```

## Päänavigaatio (header)

Maksimi 7 päälinkkiä, jotta otsake pysyy luettavana mobiilissa.

1. **Etusivu** (logo klikattavissa)
2. **Yhdistys** (dropdown: Hallitus, Säännöt)
3. **Tapahtumat**
4. **Uutiset**
5. **Galleria**
6. **Arkisto** (dropdown: Jalkapallo, Ravintolat, Stadionit)
7. **Liity jäseneksi** (CTA-nappi, korostettu)

Mobiilissa hamburger-valikko. Sanity-singletonista `navigaatio` voidaan järjestää linkit ilman koodausta.

## Footer

- **Yhdistys**: Lyhyt esittely, Y-tunnus, perustamisvuosi
- **Linkit**: Yhdistys, Jäsenyys, Tapahtumat, Yhteystiedot
- **Yhteystiedot**: Osoite, sähköposti, puhelin
- **Sosiaalinen media**: YouTube-kanava (`@suomalainenklubi`), mahdolliset uudet kanavat
- **Tekijänoikeus**: © 2026 Lahden Suomalainen Klubi ry

## Breadcrumbs

Käytetään kaikissa alasivuilla. Generoidaan automaattisesti URL-rakenteesta + Sanity-otsikoista. JSON-LD `BreadcrumbList` -strukturoitu data SEO:ta varten.

## URL-konventiot

- **Suomeksi, ilman ääkkösiä** (slug-muuntaja `ä → a`, `ö → o`, `å → a`)
- **Pienet kirjaimet, väliviivat** (`/jalkapallo/uefa-cup`, ei `/UEFACup` tai `/uefa_cup`)
- **Lyhyt mutta kuvaava** — mieluummin `/yhdistys` kuin `/tietoa-yhdistyksesta`
- **Vältä päivämääriä URL:ssa** ellei kyseessä ole arkistoaika (`/uutiset/2026/05/...`) — käytetään slugia + Sanity `publishedAt`-kenttää

## Sisäinen haku (faasi 2)

Ensimmäisessä julkaisussa **ei** sisäistä hakua. Jos käyttäjäpalaute osoittaa tarpeen, lisätään myöhemmin Sanity GROQ-kyselyllä tai Algolialla.

## Etusivun rakenne

1. **Hero** — kuva, otsikko (yhdistyksen nimi + slogan Sanitysta), nappi "Liity jäseneksi"
2. **Ajankohtaista** — 3 viimeisintä uutista korttina
3. **Tulevat tapahtumat** — 3 seuraavaa tapahtumaa korttina, ohjaa `/tapahtumat`-sivulle
4. **Esittely** — lyhyt kuvaus yhdistyksestä, kuva, "Lue lisää" → `/yhdistys`
5. **Ravintolat-spotlight** — TOP 5 ravintolaa Lahdesta (kuva + tähdet + linkki)
6. **Jalkapalloarkisto-teaser** — visuaalinen kortti, joka viittaa kiehtoviin tilastoihin (esim. nykyinen FIFA-ranking)
7. **CTA** — Liity jäseneksi tai ota yhteyttä

Etusivun lohkot ovat **Sanityssa konfiguroitavissa** — singleton-dokumentti `etusivu` jossa toistettavia lohkotyyppejä (`hero`, `uutisnostot`, `tapahtumat`, `esittely`, `cta`). Isäsi voi piilottaa lohkon, vaihtaa otsikon tai järjestää uudelleen ilman koodausta.

## Mobiilikäytettävyys

- Tap-targets ≥ 44x44 px
- Lukutekstit `16px`+ mobiilissa
- Navigaatio sticky top
- Hampurilaisvalikko skaalautuu Sheet-komponentista (Radix UI tai oma)
- Kuvat lazy-load, srcset responsiivisesti
