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
  (public)/            Reittiryhmä julkisille sivuille
  (sovellus)/          Sovellusmaiset näkymät ilman sivuston palkkeja (ravintola-arvostelu, docs/21)
  studio/[[...tool]]/  Sanity Studio embedded
  api/                 Route handlers (revalidate-webhook, draft mode, cronit, OG-kuvat)
components/            React-komponentit (UI, sivurakenne, Sanity-renderöijät)
sanity/
  schemas/             Sisältötyyppien skeemat
  lib/                 Sanity-client, GROQ-kyselyt, image-helpers
  structure.ts         Studio-strukturointi (singletons, järjestys, tarkistusnäkymät)
  actions/, components/ Studion omat toiminnot ja kenttäeditorit
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
| Kaikki yksikkötestit (sama kuin CI) | `npm test` |
| Testaa kommenttilomakkeen säännöt | `npm run test:kommentit` |
| Testaa paluuosoitteen rajaus (avoin uudelleenohjaus) | `npm run test:paluuosoite` |
| Testaa arvostelukuvien säännöt | `npm run test:arvostelukuvat` |
| Testaa taulukkoeditorin säännöt | `npm run test:taulukko` |
| Testaa linkit (www.-alku, puuttuva kauttaviiva, linkkiobjekti: Sivuston sivu / Muu osoite / Tiedosto, liitetiedostot, kohteen tila) | `npm run test:linkki` |
| Testaa joukkueiden nimivertailu (otteluohjelma) | `npm run test:joukkueet` |
| Testaa Kansojen liigan taulukon ja kauden karsintasivun paritus | `npm run test:kaudet` |
| Testaa kuvaloader (Sanityn CDN) | `npm run test:kuvat` |
| Testaa Litmanen-osion säännöt (lehtileikkeiden ote, loukkaantumisyhteenveto) | `npm run test:litmanen` |
| Brändikuvien verkkoversiot ja kotinäytön sovelluskuvakkeet (vain kun logo muuttuu) | `npm run brandikuvat` → `public/brand/web/`, `public/sovellus/` |
| Saavutettavuustesti (axe, WCAG 2.1 AA) | `npm run test:saavutettavuus` (sivusto käynnissä; `BASE_URL=…` muu osoite) |
| Orpojen arvostelukuvien siivous (listaa; `-- --poista` poistaa) | `npm run siivoa:arvostelukuvat` (tarvittaessa; lisää `-- --production`) |
| Käyttämättömien tiedostojen siivous (listaa, kuivaharjoitus oletuksena; `-- --nyt=VVVV-KK-PP` laskee toiselle päivälle; `-- --poista` poistaa; `-- --production` varmuuskopion kanssa). Yöhuolto tekee saman: poistaa tiedoston, jota mikään ei ole käyttänyt 7 päivään, ei koskaan varmuuskopioita (docs/24 askel 7) | `npm run siivoa:tiedostot` |
| Testaa tiedostosiivouksen säännöt (7 päivän armoaika, varmuuskopiot aina suojattu; GROQ groq-js:llä) | `npm run test:tiedostosiivous` |
| Testaa sivuston tilan säännöt (Aloituksen liikennevalot: varmuuskopio, huolto, otteluhaku, kiintiön arvio, perustiedot) | `npm run test:sivuston-tila` |
| Testaa Aloituksen tehtävärekisterin ja kyselyn (Tehtävät sinulle -listat ja laskurit) | `npm run test:aloitus` |
| Hae Blogspot-blogi paikallisesti | `npm run blogspot:fetch` → `data/blogspot/` (gitignoressa) |
| Blogi → `development` | `npm run migrate:blogspot` (ensimmäinen kerta) · `npm run sync:blogspot` (vain uudet, säilyttää Studion muokkaukset) |
| Blogin uudet kirjoitukset → `production` | `npm run sync:blogspot:production` (kuivaharjoitus) · `-- --vie` (varmuuskopio + `--missing` + tarkistus) |
| Generoi redirectit (lukee productionia, vain luku; tarkista `git diff lib/redirects.ts`) | `npm run redirects` |
| Vie uutta sisältöä `development` → `production` | **Vain lisäys:** `npx sanity dataset import data/migration-<tyyppi>.ndjson --dataset production --missing`. **Ei koskaan `--replace` koko datasettiin**: isä muokkaa productionia (docs/17 §D) |
| Varmuuskopio productionista | `npm run backup` → `varmuuskopiot/` (gitignoressa, kuvineen). Aina ennen isompaa muutosta. Lisäksi automaattinen viikkokopio Studioon (`/api/varmuuskopio`, docs/17 §D) |
| Testaa varmuuskopion säännöt | `npm run test:varmuuskopio` |
| Testaa varmuuskopiosta palauttamisen säännöt (Studion Palauta varmuuskopiosta / Palauta poistettu) | `npm run test:palautus` |
| Testaa tyhjien osioiden piilotuksen (valikko, alatunniste, sitemap) | `npm run test:osiot` |
| Testaa sivun polkusäännöt (varatut polut, lukitut sivut, jokainen app-reitti varattu) | `npm run test:sivupolku` |
| Testaa tekstin lohkot ja uutiskortin (lohkojen järjestys, kuvasarja, huomiolaatikon sävy, liitetiedosto, korttikuvan varakäytös, jakokuva, tekstin alku kortissa; GROQ groq-js:llä: liite ja painike) | `npm run test:lohkot` |
| Testaa upotuslohkon säännöt (Google Maps, Google Forms, Vimeo; vieraat palvelut, javascript:/data:, liitetty iframe-HTML → vain osoite) | `npm run test:upotus` |
| Testaa osioiden sivut (rekisteri, lukitus, reittien kattavuus, oletustekstit, siemen ei muuta näkymää eikä meta-kuvauksia) | `npm run test:osiosivut` |
| Testaa päävalikon linkit ja siitä johdetun alatunnisteen (Sivusto-sarake, alavalikot sarakkeina, tyhjät osiot) | `npm run test:navigaatio` |
| Testaa linkkien migraation säännöt (viittaus vain yksiselitteiseen julkaistuun dokumenttiin, muut Muu osoite, kävijän osoite ei muutu, idempotentti) | `npm run test:linkit-migraatio` |
| Sanityn taso ja oikeudet (tilaus, datasetin näkyvyys, tokenien ja käyttäjien roolit, sivusto; vain luku). Aja Growth-kokeilun päätyttyä 26.10.2026 ja kun lomakkeet lakkaavat toimimasta | `npm run tarkista:sanity-taso` |
| Testaa ajonaikaiset ohjaukset (lyhytosoitteet, aiemmat osoitteet, webhookin yhdistäminen, reittien ohjaaTaiEiLoydy) | `npm run test:ohjaukset` |
| Päästä päähän -testi: ohjaukset ja aiemmat osoitteet (luo ja poistaa testisivun ja kaksi ohjausta; netto 0). `-- --paikallinen`: development + localhost (palvelin development-datasetillä, `SANITY_REVALIDATE_SECRET` ja `SANITY_API_WRITE_TOKEN` asetettuina), webhook simuloidaan. Ilman valitsinta: production ja aito webhook, varmuuskopio ensin, webhook-jono tyhjänä (docs/24 P8) | `npm run e2e:ohjaukset` |
| Testaa valmiit pohjat ja [täytä]-säännön (vuosikokous, palloveikkaus, arvosana ravintolalle) | `npm run test:pohjat` |
| Testaa Studion tilamerkit (Ajastettu, Tarkistettava, Odottaa toista arvioijaa, Piilotettu; pariteetti JULKINEN_RAVINTOLA) | `npm run test:tilamerkit` |
| Testaa ohjausgeneraattorin syötteet ja tuloksen (crawl-status.tsv ↔ lib/redirects.ts, ei ketjuja, oletusdatasetti production) | `npm run test:ohjausgeneraattori` |
| Testaa uutishaun hakusanat | `npm run test:haku` |
| Testaa lukuaika ja ingressisääntö (uutiset, ravintola-arviot) | `npm run test:artikkeli` |
| Testaa uutisten tunnisteet | `npm run test:tunnisteet` |
| Testaa ravintolan arvosanalaskenta (klubilaisten arvosanat) | `npm run test:arvosana` |
| Testaa arvostelun vaiheet ja luonnoksen (puhelinnäkymä) | `npm run test:arvostelu` |
| Ruokailutaulukon arvosanat Sanityyn (kuivaharjoitus + tarkistuslista; `-- --vie`, `-- --production --vie` varmuuskopion kanssa) | `npm run tuo:klubiarviot` (docs/21) |
| Ravintoloiden arvosanat uudelleen klubilaisten arvosanoista (webhook tekee tämän itse; kuivaharjoitus, `-- --vie`, `-- --production --vie`) | `npm run laske:arvosanat` |
| Päästä päähän -testi productionissa: kahden klubilaisen sääntö webhookin kautta (luo ja poistaa testiravintolan; varmuuskopio ensin, webhook-jono tyhjänä) | `npm run e2e:arvioijasaanto` |
| Blogin tunnisteet muokattavaan kenttään (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` productioniin varmuuskopion kanssa) | `npm run patch:tunnisteet` (docs/14 §3.1) |
| Uutiskategoriat koodista Sanityyn: kategoriadokumentit ja uutisten viittaukset (kuivaharjoitus; `-- --vie`, `-- --production --vie` varmuuskopion kanssa; `--poista-vanhat` poistaa vanhan `categories`-kentän deployn jälkeen; ajettu 4.10.2026) | `npm run patch:uutiskategoriat` |
| Vanhat merkkijonolinkit linkkiobjekteiksi: oma polku → Sivuston sivu, muut → Muu osoite (valikko, etusivu, klubin toiminta, tekstin linkit; kuivaharjoitus → `data/linkit-migraatio.tsv`; `-- --vie` kirjoittaa, `-- --production --vie` varmuuskopion kanssa; idempotentti; `--poista-vanhat` poistaa vanhat href/url/ctaHref noin 2 viikkoa myöhemmin, docs/24 P5 ja P11) | `npm run patch:linkit` |
| Osioiden sivut Sanityyn: 30 koodireitin lukitut `sivu`-dokumentit koodin oletusteksteillä (`createIfNotExists`; kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production --vie` varmuuskopion kanssa; idempotentti, productioniin vasta deployn jälkeen, docs/24 P3) | `npm run luo:osiosivut` |
| Palloveikkaussivun jako veikkausten omiksi alasivuiksi (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen) | `npm run patch:palloveikkaus` |
| Litmanen-osio: päävalikon Pelaajat → Litmanen ja `litmanen.htm` loukkaantumissivulle (kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen) | `npm run patch:litmanen` |
| Järkytykset ja maailman paras avaus omille sivuilleen (kategoriat `jarkytykset`, `maailman-parhaat`; kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen, productioniin vasta deployn jälkeen) | `npm run patch:omat-sivut` |
| Litmanen-osion uudistus: lehtijutut `lehtileike`-dokumenteiksi, faktat ja patsas omiin kenttiin (kuivaharjoitus → `data/litmanen-leikkeet.tsv`; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; kertaluonteinen, productioniin vasta deployn jälkeen) | `npm run patch:litmanen-osio` (docs/20) |
| Kansojen liigan lohkotaulukot kauden karsintasivulle (`kaudenOttelut`-viittaus saman vanhan osoitteen perusteella; kuivaharjoitus; `-- --vie` kirjoittaa, `-- --production` varmuuskopion kanssa; idempotentti, productioniin vasta deployn jälkeen) | `npm run patch:kansojen-liiga` |
| Tarkistettavat-listan siivous 1.10.2026: turhat merkinnät pois, varmat korjaukset, otsikkoehdotukset (kuivaharjoitus; `-- --vie` varmuuskopion kanssa; idempotentti, ajettu productioniin) | `npm run siivoa:tarkistettavat` |

**Datasetit:** migraatiot ja kehitys kirjoittavat aina `development`-datasettiin (`.env.local`). `production` on isän ylläpitämä tuotantodata, jota Vercel käyttää: sinne viedään vain puuttuvia dokumentteja (`--missing`) tai dokumenttikohtaisia patcheja, ja aina varmuuskopion jälkeen. Jos sisältö näyttää puuttuvan, tarkista ensin `NEXT_PUBLIC_SANITY_PROJECT_ID` ja `NEXT_PUBLIC_SANITY_DATASET`. Migraation sopimus ja tila: `docs/12-sisaltomigraatio.md`.

## Tärkeät käytännöt

1. **Kaikki sisältö hallinnoidaan Sanityssa, ei kovakoodattuna.** Otsikot, tekstit, kuvat, valikkokohteet — kaikki Studiosta päivitettäväksi.
2. **Skeemat ovat tiukkoja.** Pakolliset kentät, validointisäännöt, suomenkieliset kenttänimet ja kuvaukset. Isäsi ei saa joutua arvailemaan.
3. **Suomenkielinen sisältö** — kaikki käyttöliittymäteksti suomeksi, mukaan lukien Studion kenttäotsikot ja virheilmoitukset.
4. **Saavutettavuus on pakollinen.** Kaikilla kuvilla `alt`-teksti, kontrastit AA-tasolla, näppäimistönavigointi toimii.
5. **Älä lisää featurea ilman skeemaa.** Jos uusi sivutyyppi tarvitaan, lisää ensin Sanity-skeema, sitten reitti.
6. **301-redirectit ovat kriittisiä.** Jokainen vanha `.htm`-URL pitää ohjautua johonkin järkevään. Ylläpidetään `lib/redirects.ts`:ssa, generoidaan Sanitysta + manuaalisesta CSV:stä.
7. **Uusi dynaaminen reitti:** kun sisältöä ei löydy, kutsu `return ohjaaTaiEiLoydy(polku)` (`sanity/lib/ohjaus.ts`), älä `notFound()`. Näin isän lyhytosoitteet ja muuttuneiden osoitteiden ohjaukset toimivat. Testi (`npm run test:ohjaukset`) valvoo tätä.

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
| Julkaisuvalmiusauditointi 5.10.2026 | `docs/22-julkaisuvalmius.md` |
| Ylläpidettävyys ilman kehittäjää, päätökset 7.10.2026 | `docs/23-yllapidettavyys.md` |
| Vaihe 2: kehys Studioon, toteutussuunnitelma (askeleet 1–12, tuotantomuutokset) | `docs/24-vaihe2-toteutus.md` (+ `docs/24-liite-arkkitehdit.md`) |
| Tyyliopas (lopullinen, HTML) | `docs/design-handoff/` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
