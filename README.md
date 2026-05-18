# Klubi

Verkkosivu-uudistus **Lahden Suomalainen Klubi ry:lle**. Vanha vuoden 2007 sivusto korvataan modernilla rakenteella, jota yhdistyksen sihteeri pystyy päivittämään Sanity Studiossa ilman koodausta.

**Demo:** [klubi-blond.vercel.app](https://klubi-blond.vercel.app/)

## Konteksti

Yhdistys on toiminut yli viisitoista vuotta ja kerännyt sivuilleen tapahtumakalentereita, jalkapallotilastoja, ravintola-arvosteluja ja uutisia. Tavoitteet uudistukselle:

- sisältö säilyy mutta rakenne uudistuu mobiililähtöiseksi
- sihteeri (oma isäni) pystyy päivittämään kaiken ilman teknistä apua
- vanhat URL:t ohjautuvat 301:llä uusiin
- saavutettavuus AA-tasolla

## Teknologiat

- **Next.js 16** (App Router, Turbopack) — TypeScript, Tailwind CSS v4
- **Sanity CMS** — Studio upotettu `/studio`-polkuun, skeemat ja Studion UI suomeksi
- **Vercel** — hosting, tag-pohjainen revalidointi
- React 19, `@portabletext/react`, `lucide-react`

## Toteutetut reitit

| Reitti | Kuvaus |
|---|---|
| `/` | Etusivu, lohkot Sanity-singletonista |
| `/[...slug]` | Hierarkkiset sisältösivut (esim. `/klubi/saannot`) |
| `/yhteystiedot` | Yhteystiedot Sanity-singletonista |
| `/tapahtumat` | Tulevat + menneet, JSON-LD `Event` |
| `/tapahtumat/[slug]/ics` | Kalenterivienti (RFC 5545) |
| `/uutiset` | Lista + kategoriasuodatin URL-parametrilla |
| `/uutiset/[slug]` | Liittyvät jutut, JSON-LD `NewsArticle` |
| `/galleria` | Albumit |
| `/galleria/[slug]` | Yksittäinen albumi + saavutettava lightbox |
| `/ravintolat` | Suodatettava hakemisto (kaupunki / ruokatyyppi / tähdet / hinta) |
| `/ravintolat/[slug]` | Klubin arvostelu + hyväksytyt käyttäjäarvostelut, JSON-LD `Restaurant` |
| `/studio` | Sanity Studio sihteerille |

## Suunnitteluratkaisuja

- **Kaikki sisältö Sanitysta** — navigaatio, etusivun lohkot, yhteystiedot, sivut. Mitään ei kovakoodattu komponentteihin.
- **Graceful fallbacks** — `lib/defaults.ts` peilaa Sanity-singletoneiden `initialValue`-arvot. Sivusto rakentuu ja toimii myös ilman Sanity-projektin alustusta — `npx sanity init` voi tehdä myöhemmin ilman että kehitysympäristö rikkoutuu.
- **Catch-all `[...slug]` `sivu`-tyypille** — yksi sivu-dokumentti per polku, slug voi sisältää kauttaviivoja (`klubi/saannot`). Custom slugify säilyttää `/`-merkit, validointi estää varatut top-level-polut. Murupolku rakennetaan esi-isien otsikoista yhdellä GROQ-kyselyllä.
- **Suodattimet pelkkinä `<Link>`-elementteinä** — ravintoloiden ja uutisten suodattimet toimivat ilman JavaScriptia, tila URL:ssa. Facets-kysely näyttää vain ne arvot joista on tuloksia.
- **DIY-lightbox** — focus trap, ESC, nuolinäppäimet, body-scroll-lukko, portal `document.body`yn. Ei ulkoista riippuvuutta.
- **JSON-LD per sivutyyppi** — Event, NewsArticle, Restaurant + AggregateRating. Schema.org-ystävällinen.

## Paikallinen kehitys

```bash
npm install
cp .env.example .env.local   # täytä NEXT_PUBLIC_SANITY_PROJECT_ID jos haluat oikean Sanity-datan
npm run dev                  # http://localhost:3000
```

Komennot:

```bash
npm run dev         # kehityspalvelin (Turbopack)
npm run type-check  # tsc --noEmit
npm run lint        # ESLint
npm run build       # tuotantokäännös
```

## Rakenne

```
app/(public)/    Julkiset reitit (header + footer route group -layoutista)
app/studio/      Sanity Studio embedded
components/      UI-komponentit, blokit, gallery, jaetut kortit
sanity/          Skeemat, GROQ-kyselyt, fetch-wrapperi, env
lib/             Apurit (cn, format, ics, path, defaults, types)
docs/            Suunnitteludokumentit — sisältöauditointi, IA, design, build plan
```

## Status

Sprint 4 kesken. Avoinna: jalkapalloarkisto (hub + alasivut + tilastotaulukot), stadionit, jäsenhakemuslomake (Server Action + sähköposti), kartta ravintoloihin, lopullinen sisältömigraatio vanhalta sivustolta, 301-redirectit.

## Lisenssi

Projektin koodi on yhdistyksen käyttöön. Skeemat, komponentit ja apurit voi käyttää referenssinä.
