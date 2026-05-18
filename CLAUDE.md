# Lahden Suomalainen Klubi ry — Claude Code -ohje

Tämä tiedosto on **agenttien ydinohje**. Kaikki Claude Code -agentit lukevat tämän automaattisesti. Pidä lyhyenä — yksityiskohdat ovat `docs/`-kansiossa.

## Projektin tavoite

Rakentaa Lahden Suomalainen Klubi ry:lle moderni, elegantti ja näyttävä sivusto, jota yhdistyksen sihteeri (käyttäjän isä) voi päivittää **ilman koodausta**. Sisältö siirretään vanhalta `lahdensuomalainenklubi.com` -sivustolta uuteen modernimpaan rakenteeseen.

## Teknologiapino

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Sanity CMS** (free tier, public dataset) — Studio embedded `/studio`-polussa
- **Vercel** hosting (Hobby käynnistyksessä, harkitaan Pro:ta liikenteen mukaan)
- **Node 25** kehitykseen, deploy Vercelin oletukseen

Tarkat valinnat ja niiden perustelut: `docs/03-cms-decision.md`.

## Hakemistorakenne

```
app/                   Next.js App Router -reitit
  (sivut)/             Reittiryhmä julkisille sivuille
  studio/[[...tool]]/  Sanity Studio embedded
  api/                 Route handlers (revalidate webhook, lomakkeiden submission)
components/            React-komponentit (UI, sivurakenne, Sanity-renderöijät)
sanity/
  schemas/             Sisältötyyppien skeemat
  lib/                 Sanity-client, GROQ-kyselyt, image-helpers
  desk/                Studio-strukturointi (singletons, järjestys, esikatselut)
lib/                   Sovelluksen jaetut apurit (date, slug, validointi)
scripts/               Kertaluonteiset skriptit (scrape, import, redirect-generaattori)
docs/                  Suunnittelu- ja päätösdokumentit (00-10)
.claude/agents/        Sub-agenttien määritykset
public/                Staattiset tiedostot (favicon, robots, kuvat joita Sanity ei hallitse)
```

## Komennot

| Tehtävä | Komento |
|---|---|
| Käynnistä kehityspalvelin | `npm run dev` (http://localhost:3000) |
| Avaa Sanity Studio | http://localhost:3000/studio |
| Tarkista TypeScript | `npm run type-check` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Ajaa scrape-skripti | `npx tsx scripts/scrape-old-site.ts` |
| Importoi Sanityyn | `npx sanity dataset import data/migration.ndjson production` |
| Generoi redirectit | `npx tsx scripts/generate-redirects.ts` |

## Tärkeät käytännöt

1. **Kaikki sisältö hallinnoidaan Sanityssa, ei kovakoodattuna.** Otsikot, tekstit, kuvat, valikkokohteet — kaikki Studiosta päivitettäväksi.
2. **Skeemat ovat tiukkoja.** Pakolliset kentät, validointisäännöt, suomenkieliset kenttänimet ja kuvaukset. Isäsi ei saa joutua arvailemaan.
3. **Suomenkielinen sisältö** — kaikki käyttöliittymäteksti suomeksi, mukaan lukien Studion kenttäotsikot ja virheilmoitukset.
4. **Saavutettavuus on pakollinen.** Kaikilla kuvilla `alt`-teksti, kontrastit AA-tasolla, näppäimistönavigointi toimii.
5. **Älä lisää featurea ilman skeemaa.** Jos uusi sivutyyppi tarvitaan, lisää ensin Sanity-skeema, sitten reitti.
6. **301-redirectit ovat kriittisiä.** Jokainen vanha `.htm`-URL pitää ohjautua johonkin järkevään. Ylläpidetään `lib/redirects.ts`:ssa, generoidaan Sanitysta + manuaalisesta CSV:stä.

## Sub-agenttien käyttö

Erikoistuneet agentit ovat `.claude/agents/`-kansiossa. Käytä niitä proaktiivisesti:

- **content-audit-agent** — kun pitää tutkia vanhan sivuston sisältöä
- **ia-sitemap-agent** — URL-rakenne, navigaatio, redirect-suunnittelu
- **cms-architecture-agent** — Sanity-skeemat ja CMS-päätökset
- **design-system-agent** — visuaalinen suunta, komponentit, värit, fontit
- **migration-agent** — vanhan sisällön siirto Sanityyn
- **seo-agent** — metadata, sitemap, JSON-LD, redirectit
- **build-implementation-agent** — featuren rakentaminen
- **editor-ux-agent** — Sanity Studion käytettävyys ja isälle ohjeet

Täydellinen työnkulku: `docs/10-agent-workflow.md`.

## Mitä EI saa tehdä

- Älä kovakoodaa sisältöä komponentteihin (paitsi UI-tekstejä kuten "Lataa lisää"). Sisältö Sanitysta.
- Älä tee `--no-verify` -committia eikä ohita hookkeja.
- Älä asenna pluginia/lisäosaa, joka lukitsee meidät palveluun (ei Webflow-embed, ei suljettuja widgettejä).
- Älä laita kuvia `public/`-kansioon jos ne ovat sisältöä — ne kuuluvat Sanityyn.
- Älä riko vanhoja URL:eja ilman 301-redirectiä.

## Linkit

- Nykyinen sivusto (migroidaan): https://www.lahdensuomalainenklubi.com/
- Uuden sivuston repo: (lisää kun pushattu)
- Sanity-projekti: (lisää projektin URL kun luotu)
- Vercel-projekti: (lisää URL kun luotu)
- Domain: lahdensuomalainenklubi.com (säilyy)

## Linkit dokumentteihin

| | |
|---|---|
| Yleisesittely | `docs/00-project-overview.md` |
| Sisältöauditointi | `docs/01-content-audit.md` |
| Informaatioarkkitehtuuri | `docs/02-information-architecture.md` |
| CMS-päätös | `docs/03-cms-decision.md` |
| Design-suunta | `docs/04-design-direction.md` |
| Sisältömallit | `docs/05-content-models.md` |
| Migraatiosuunnitelma | `docs/06-migration-plan.md` |
| SEO & redirectit | `docs/07-seo-redirects.md` |
| Rakennussuunnitelma | `docs/08-build-plan.md` |
| Editorin opas (isälle) | `docs/09-editor-guide.md` |
| Agenttityönkulku | `docs/10-agent-workflow.md` |
