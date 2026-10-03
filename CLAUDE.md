# Lahden Suomalainen Klubi ry — Claude Code -ohje

Tämä tiedosto on **agenttien ydinohje**. Kaikki Claude Code -agentit lukevat tämän automaattisesti. Pidä lyhyenä — yksityiskohdat ovat `docs/`-kansiossa.

## Projektin tavoite

Rakentaa Lahden Suomalainen Klubi ry:lle moderni, elegantti ja näyttävä sivusto, jota yhdistyksen sihteeri (käyttäjän isä) voi päivittää **ilman koodausta**. Sisältö siirretään vanhalta `lahdensuomalainenklubi.com` -sivustolta uuteen modernimpaan rakenteeseen.

## Teknologiapino

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
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
| Generoi Sanity-tyypit | `npm run typegen` |
| Hae vanha sivusto paikallisesti | `npm run crawl` + `npm run images` → `data/` (gitignoressa) |
| Koko migraatio → `development` | `npm run migrate:all` (yksittäin `migrate:<tyyppi>`) |
| Tarkista migraatio | `npm run verify:migration`, `verify:content`, `verify:redirects`, `verify:blogspot` |
| Testaa kommenttilomakkeen säännöt | `npm run test:kommentit` |
| Testaa arvostelukuvien säännöt | `npm run test:arvostelukuvat` |
| Testaa taulukkoeditorin säännöt | `npm run test:taulukko` |
| Testaa joukkueiden nimivertailu (otteluohjelma) | `npm run test:joukkueet` |
| Testaa kuvaloader (Sanityn CDN) | `npm run test:kuvat` |
| Testaa Litmanen-osion säännöt (lehtileikkeiden ote, loukkaantumisyhteenveto) | `npm run test:litmanen` |
| Brändikuvien verkkoversiot (vain kun logo muuttuu) | `npm run brandikuvat` → `public/brand/web/` |
| Saavutettavuustesti (axe, WCAG 2.1 AA) | `npm run test:saavutettavuus` (sivusto käynnissä; `BASE_URL=…` muu osoite) |
| Orpojen arvostelukuvien siivous (listaa; `-- --poista` poistaa) | `npm run siivoa:arvostelukuvat` (tarvittaessa; lisää `-- --production`) |
| Hae Blogspot-blogi paikallisesti | `npm run blogspot:fetch` → `data/blogspot/` (gitignoressa) |
| Blogi → `development` | `npm run migrate:blogspot` (ensimmäinen kerta) · `npm run sync:blogspot` (vain uudet, säilyttää Studion muokkaukset) |
| Blogin uudet kirjoitukset → `production` | `npm run sync:blogspot:production` (kuivaharjoitus) · `-- --vie` (varmuuskopio + `--missing` + tarkistus) |
| Generoi redirectit | `npm run redirects` |
| Vie uutta sisältöä `development` → `production` | **Vain lisäys:** `npx sanity dataset import data/migration-<tyyppi>.ndjson --dataset production --missing`. **Ei koskaan `--replace` koko datasettiin**: isä muokkaa productionia (docs/17 §D) |
| Varmuuskopio productionista | `npm run backup` → `varmuuskopiot/` (gitignoressa, kuvineen). Aina ennen isompaa muutosta. Lisäksi automaattinen viikkokopio Studioon (`/api/varmuuskopio`, docs/17 §D) |
| Testaa varmuuskopion säännöt | `npm run test:varmuuskopio` |
| Testaa uutishaun hakusanat | `npm run test:haku` |
| Testaa lukuaika ja ingressisääntö (uutiset, ravintola-arviot) | `npm run test:artikkeli` |
| Testaa uutisten tunnisteet | `npm run test:tunnisteet` |
| Testaa ravintolan arvosanalaskenta (klubilaisten arvosanat) | `npm run test:arvosana` |
| Ruokailutaulukon arvosanat Sanityyn (kuivaharjoitus + tarkistuslista; `-- --vie`, `-- --production --vie` varmuuskopion kanssa) | `npm run tuo:klubiarviot` (docs/21) |
| Ravintoloiden arvosanat uudelleen klubilaisten arvosanoista (webhook tekee tämän itse; kuivaharjoitus, `-- --vie`, `-- --production --vie`) | `npm run laske:arvosanat` |
| Blogin tunnisteet muokattavaan kenttään (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` productioniin varmuuskopion kanssa) | `npm run patch:tunnisteet` (docs/14 §3.1) |
| Yhdistettyjen uutiskategorioiden vanhat arvot uusiin (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa) | `npm run patch:kategoriat` |
| Palloveikkaussivun jako veikkausten omiksi alasivuiksi (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen) | `npm run patch:palloveikkaus` |
| Litmanen-osio: päävalikon Pelaajat → Litmanen ja `litmanen.htm` loukkaantumissivulle (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen) | `npm run patch:litmanen` |
| Järkytykset ja maailman paras avaus omille sivuilleen (kategoriat `jarkytykset`, `maailman-parhaat`; kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen, productioniin vasta deployn jälkeen) | `npm run patch:omat-sivut` |
| Litmanen-osion uudistus: lehtijutut `lehtileike`-dokumenteiksi, faktat ja patsas omiin kenttiin (kuivaharjoitus → `data/litmanen-leikkeet.tsv`; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen, productioniin vasta deployn jälkeen) | `npm run patch:litmanen-osio` (docs/20) |
| Tarkistettavat-listan siivous 1.10.2026: turhat merkinnät pois, varmat korjaukset, otsikkoehdotukset (kuivaharjoitus; `-- --vie` varmuuskopion kanssa; idempotentti, ajettu productioniin) | `npm run siivoa:tarkistettavat` |

**Datasetit:** migraatiot ja kehitys kirjoittavat aina `development`-datasettiin (`.env.local`). `production` on isän ylläpitämä tuotantodata, jota Vercel käyttää: sinne viedään vain puuttuvia dokumentteja (`--missing`) tai dokumenttikohtaisia patcheja, ja aina varmuuskopion jälkeen. Jos sisältö näyttää puuttuvan, tarkista ensin `NEXT_PUBLIC_SANITY_PROJECT_ID` ja `NEXT_PUBLIC_SANITY_DATASET`. Migraation sopimus ja tila: `docs/12-sisaltomigraatio.md`.

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
| Maalimäärittely ja rinnakkaistoteutus | `docs/11-maali-ja-rinnakkaistoteutus.md` |
| Sisältömigraatio (maali, tila) | `docs/12-sisaltomigraatio.md` |
| Otteluohjelma (lähteet, avaimet) | `docs/13-otteluohjelma.md` |
| Veikkaus ja kommentit | `docs/15-veikkaus-ja-kommentit.md` |
| Kokonaisauditointi 28.9.2026 | `docs/16-kokonaisauditointi.md` |
| Julkaisu: käyttöoikeudet, Vercel, domainin siirto | `docs/17-julkaisu-domain-ja-oikeudet.md` |
| Blogspot-migraatio (blogi → uutiset) | `docs/14-blogspot-migraatio.md` |
| Arvostelujen kuvat (moderointi, siivous) | `docs/18-arvostelukuvat.md` |
| Tilastotaulukoiden editori | `docs/19-taulukkoeditori.md` |
| Litmanen-osio (lehtileikkeet, patsas, loukkaantumiset) | `docs/20-litmanen-osio.md` |
| Klubilaisten arvosanat (ruokailutaulukko, laskenta) | `docs/21-klubilaisten-arvosanat.md` |
| Tyyliopas (lopullinen, HTML) | `docs/design-handoff/` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
