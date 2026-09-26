# 11 — Maalimäärittely ja rinnakkaistoteutus

> **Tarkoitus:** määrittää *valmis* niin tarkasti, että useampi agentti voi rakentaa
> sivuja samanaikaisesti ilman että lopputulos hajoaa. Tämä dokumentti on **sopimus**,
> ei ehdotus. Jos agentti joutuu poikkeamaan siitä, poikkeama kirjataan tänne ensin.
>
> Luotu 2026-09-26 sen jälkeen kun vanha sivusto crawlattiin kokonaan (198 sivua).
> Korvaa `docs/08-build-plan.md`:n sprinttijaon siltä osin kuin ne ovat ristiriidassa.

---

## 0. Miksi järjestys ratkaisee

Rinnakkaisuus ei ole nopeuskysymys vaan **riippuvuuskysymys**. Jos kuusi agenttia
rakentaa sivuja yhtä aikaa ennen kuin yhteiset rajapinnat ovat lukossa, saadaan
kuusi eri tapaa hakea dataa, kuusi eri korttikomponenttia ja kuusi eri tapaa
kirjoittaa metadata. Integraatio maksaa silloin enemmän kuin rinnakkaisuus säästi.

Sääntö: **rinnakkaistetaan lehtisolmut, ei runkoa.** Runko jäädytetään ensin.

```
Gate 0  Perusta          sekventiaalinen   ← sopimukset lukitaan
   │
   ├──────┬──────┬──────┬──────┬──────┐
Gate 1   A      B      C      D      E    rinnakkainen (5 agenttia)
   └──────┴──────┴──────┴──────┴──────┘
   │
Gate 2  Integraatio       sekventiaalinen   ← vaatii kaikki reitit olemassa
```

Portin läpäisy on binäärinen: `npm run type-check && npm run lint && npm run build`
menee läpi, tai portti ei ole auki. Seuraavaa vaihetta ei aloiteta ennen sitä.

---

## 1. Kohdesivukartta

Alkuperäinen `docs/02-information-architecture.md` laadittiin virheellisen
auditoinnin pohjalta. Todellinen crawl paljasti **kolme sivuperhettä joita IA ei
kata**. Ne lisätään tässä:

| Uusi reittiperhe | Vanhat sivut | Määrä |
|---|---|---|
| `/klubi/toiminta/[slug]` | talkoot, vappu, molkky, vuosikokous, jouluruokailu, ilotulitukset, venetsialaiset, matkailu, musiikki | ~10 |
| `/jalkapalloarkisto/arvokisat/[slug]` | MM2010–MM2026, EM2008–EM2024, mmtilasto, emtilasto, kansojenliiga | ~12 |
| `/jalkapalloarkisto/pelaajat/[slug]` | litmanen, litmanenjari, pelaajatilasto, pikkuhuuhkajat, maailmanparhaat | ~6 |

### Täysi reittiluettelo (rakennettava)

```
/                                        ✅ on
/klubi                                   ❌
/klubi/hallitus                          ❌
/klubi/saannot                           ❌
/klubi/palloveikkaus                     ❌
/klubi/yhteystiedot                      ⚠️  siirto /yhteystiedot → tänne
/klubi/liity                             ❌  lomake
/klubi/toiminta                          ❌  hub
/klubi/toiminta/[slug]                   ❌
/tapahtumat                              ✅ on
/tapahtumat/[slug]                       ✅ on
/uutiset                                 ✅ on
/uutiset/[slug]                          ✅ on
/uutiset/arkisto                         ❌
/jalkapalloarkisto                       ❌  hub
/jalkapalloarkisto/huuhkajat             ❌
/jalkapalloarkisto/mestarit              ❌
/jalkapalloarkisto/valmentajat           ❌
/jalkapalloarkisto/vuoden-pelaajat       ❌
/jalkapalloarkisto/euroopan-paras        ❌
/jalkapalloarkisto/saavutukset           ❌
/jalkapalloarkisto/fifa-ranking          ❌
/jalkapalloarkisto/lupaavat              ❌
/jalkapalloarkisto/eurocupit             ❌  hub
/jalkapalloarkisto/eurocupit/[slug]      ❌  5 kpl
/jalkapalloarkisto/karsinnat/[slug]      ❌
/jalkapalloarkisto/arvokisat             ❌  hub
/jalkapalloarkisto/arvokisat/[slug]      ❌  ~12 kpl
/jalkapalloarkisto/pelaajat/[slug]       ❌  ~6 kpl
/jalkapalloarkisto/stadionit             ❌  hub
/jalkapalloarkisto/stadionit/[slug]      ❌  ~15 kpl
/ravintolat                              ✅ on (suodattimet puuttuvat)
/ravintolat/[slug]                       ✅ on
/ravintolat/arvostele                    ❌  lomake
/galleria                                ✅ on
/galleria/[slug]                         ✅ on
/[...slug]                               ✅ on  (geneerinen `sivu`)
```

Reittitiedostoja rakennettavana: **24**. Niiden takana renderöityvää sisältöä
198 vanhalta sivulta.

---

## 2. Gate 0 — jäädytettävät sopimukset

Nämä **on oltava valmiina ja muuttumattomina** ennen Gate 1:tä. Kaikki Gate 1:n
agentit kuluttavat näitä eivätkä koskaan muokkaa niitä.

### 2.1 Skeemasopimus

Ravintolaskeema laajennetaan vastaamaan purettua dataa — muuten menetämme
476 osa-arviota ja 467 käyntimerkintää:

```ts
ratingFood        number   0–5   "Ruoka"
ratingPrice       number   0–5   "Hinta"
ratingAtmosphere  number   0–5   "Viihtyvyys"
visits            array<date>    "Käynnit"
visitContext      string         "Käynnin yhteys" (esim. "Jouluruokailu")
closed            boolean        "Toiminta loppunut"
closedNote        string         "Lisätieto lopettamisesta"
legacyUrl         string         "Vanha URL" (redirect-generaattorille)
tiivistelma       text     ≤300  "Tiivistelmä" ← GEO, ks. §7
```

Uudet dokumenttityypit: `klubiToiminta`, `arvokisa`, `pelaaja`.
Kaikkiin sisältötyyppeihin lisätään `legacyUrl` ja `tiivistelma`.

**Jäädytyskriteeri:** `sanity/schemas/index.ts` ei muutu Gate 1:n aikana.

### 2.2 Datasopimus — typegen

Käsin kirjoitettu `lib/types.ts` (242 riviä) on ylläpitovelka: se ajautuu erilleen
skeemoista hiljaa. Korvataan generoinnilla:

```bash
npx sanity schema extract --path sanity/extract.json
npx sanity typegen generate          # → sanity/sanity.types.ts
```

Tämän jälkeen GROQ-kyselyiden tulostyypit johdetaan kyselystä itsestään.
Jokainen kysely määritellään `defineQuery`-funktiolla `sanity/lib/queries.ts`:ssä,
jolloin typegen tunnistaa sen.

**Sääntö:** `any` on kielletty. Jos tyyppi puuttuu, kysely on väärin kirjoitettu.

### 2.3 Sivusopimus

Jokainen reitti rakennetaan samalla rungolla. Gate 0 tuottaa nämä apurit:

```ts
// lib/seo.ts
buildMetadata({ title, description, path, image, publishedAt, modifiedAt }): Metadata

// components/seo/json-ld.tsx
<JsonLd schema={...} />          // renderöi <script type="application/ld+json">

// lib/schema-org.ts
organizationSchema()
breadcrumbSchema(trail)
articleSchema(uutinen)
eventSchema(tapahtuma)
restaurantSchema(ravintola)
datasetSchema(tilasto)           // jalkapalloarkiston taulukot
```

Sivun runko on aina:

```tsx
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch({ ... });
  return buildMetadata({ ... });
}

export default async function Page() {
  const data = await sanityFetch({ query, tags, fallback });
  if (!data) notFound();
  return (
    <>
      <JsonLd schema={[breadcrumbSchema(trail), pageSchema(data)]} />
      <Breadcrumbs trail={trail} />
      <PageHeader title={...} lead={data.tiivistelma} />
      {/* sisältö */}
    </>
  );
}
```

### 2.4 Komponenttisopimus

Gate 1:n agentit **eivät luo uusia perusprimitiivejä**. Olemassa olevat
(`Button`, `Card`, `Badge`, `Stars`, `Container`, `Breadcrumbs`, `PortableText`)
riittävät. Gate 0 lisää kolme puuttuvaa, joita arkistosivut tarvitsevat:

| Komponentti | Tarkoitus |
|---|---|
| `<StatTable />` | Responsiivinen, saavutettava taulukko (`<caption>`, `<th scope>`, vaakascroll omassa säiliössään) |
| `<PageHeader />` | Otsikko + tiivistelmä + valinnainen eyebrow, yhtenäinen kaikilla sivuilla |
| `<ArchiveNav />` | Jalkapalloarkiston sisäinen navigaatio |

Jos agentti tarvitsee neljännen, se **pysähtyy ja kysyy** — ei keksi omaansa.

### 2.5 Presentation-kytkentä

Isän editointikokemus on projektin tärkein käytettävyystavoite. Gate 0:ssa:
`presentationTool` konfiguraatioon, `<VisualEditing />` layoutiin, draft mode
-reitit, `sanityFetch` tukemaan draft-perspektiiviä.

---

## 3. Gate 1 — rinnakkaisajo

Viisi agenttia, **erilliset tiedosto-omistajuudet**. Kaksi agenttia ei koskaan
kirjoita samaan tiedostoon — se on ainoa tapa välttää konfliktit rinnakkaisajossa.

| Agentti | Omistaa | Reittejä |
|---|---|---|
| **A — Klubi** | `app/(public)/klubi/**` | 8 |
| **B — Jalkapalloarkisto** | `app/(public)/jalkapalloarkisto/**` | 12 |
| **C — Ravintolat** | `app/(public)/ravintolat/**`, `components/ravintola-*` | 3 |
| **D — Uutiset & tapahtumat** | `app/(public)/uutiset/**`, `app/(public)/tapahtumat/**` | 5 |
| **E — Etusivu & galleria** | `app/(public)/page.tsx`, `app/(public)/galleria/**`, `components/blocks/**` | 3 |

Jaetut tiedostot (`lib/`, `sanity/lib/`, `components/ui/`, `components/layout/`)
ovat **vain luku** Gate 1:n aikana.

Kyselyt eivät mene yhteiseen `sanity/lib/queries.ts`:ään — rinnakkainen kirjoitus
samaan tiedostoon ylikirjoittaisi toisen agentin työn. Jokainen agentti luo oman
tiedostonsa:

```
sanity/lib/queries/klubi.ts          agentti A
sanity/lib/queries/arkisto.ts        agentti B
sanity/lib/queries/ravintolat.ts     agentti C
sanity/lib/queries/uutiset.ts        agentti D
sanity/lib/queries/etusivu.ts        agentti E
```

Kyselyt kirjoitetaan `defineQuery`-funktiolla, jotta typegen tunnistaa ne.
Olemassa oleva `sanity/lib/queries.ts` jää paikalleen eikä sitä muokata.

---

## 4. Gate 2 — integraatio

Vaatii että kaikki reitit ovat olemassa.

- `scripts/generate-redirects.ts` — generoi `lib/redirects.ts`:n crawl-datasta.
  Nykyinen kattaa 37/198 vanhaa URL:ia. **Jokaisen 198:n on ohjauduttava.**
- `scripts/verify-redirects.ts` — ajaa jokaisen vanhan URL:n läpi, vaatii 301/308
- `app/sitemap.ts` — kaikki reitit, `lastModified` Sanityn `_updatedAt`:sta
- `app/robots.ts` — ks. §7 crawler-politiikka
- `app/llms.txt/route.ts` — ks. §7
- `app/api/og/route.tsx` — brändätty OG-kuva
- `app/api/revalidate/route.ts` — Sanity-webhook
- Saavutettavuusskannaus, Lighthouse-kierros, selaintesti

---

## 5. Definition of Done — per sivu

Sivu on valmis vasta kun **jokainen** kohta täyttyy. Tämä on tarkistuslista, jota
vasten jokainen Gate 1:n agentti tarkistaa oman työnsä ennen valmiiksi ilmoittamista.

**Data**
- [ ] Haettu `sanityFetch`:llä, `tags` revalidointia varten, `fallback` annettu
- [ ] Ei sisältöä kovakoodattuna — vain UI-tekstit (`"Lataa lisää"`) saavat olla koodissa
- [ ] Tyhjä tila käsitelty: mitä näkyy kun Sanityssa ei ole vielä sisältöä

**Renderöinti**
- [ ] Server Component oletuksena; `"use client"` vain interaktiivisissa lehdissä
- [ ] Dynaamisilla reiteillä `generateStaticParams` + `notFound()` puuttuvalle
- [ ] `revalidate` asetettu eksplisiittisesti

**Metadata & strukturoitu data**
- [ ] `generateMetadata` käyttää `buildMetadata`-apuria
- [ ] Kanoninen URL asetettu
- [ ] OG-kuva: sivun oma tai fallback
- [ ] JSON-LD: oikea schema.org-tyyppi **+** `BreadcrumbList`
- [ ] `datePublished` / `dateModified` mukana missä sisällöllä on aika

**Navigaatio**
- [ ] Murupolku näkyvissä ja strukturoituna
- [ ] Sivu löytyy navigaatiosta tai vanhemman hub-sivun listauksesta — ei orpoja sivuja

**Saavutettavuus (WCAG 2.1 AA)**
- [ ] Yksi `<h1>`, otsikkotasot järjestyksessä, ei hyppyjä
- [ ] Kaikilla kuvilla `alt`; koristekuvilla `alt=""`
- [ ] Kontrasti ≥ 4.5:1 leipätekstille
- [ ] Näppäimistönavigointi toimii, fokus näkyy
- [ ] Taulukoissa `<caption>` ja `<th scope>`
- [ ] Lomakekentillä `<label>`, virheilmoitukset `aria-live`-alueessa

**Responsiivisuus**
- [ ] Toimii 360 px → 1920 px
- [ ] Ei vaakascrollia bodyssä; leveä sisältö scrollaa omassa säiliössään
- [ ] Kosketuskohteet ≥ 44×44 px

**Suorituskyky**
- [ ] Kuvat `next/image`:lla, `sizes` annettu
- [ ] Ei layout shiftiä (kuville mitat)
- [ ] LCP-elementti ei ole lazy-loadattu

**Koodinlaatu**
- [ ] `npm run type-check` puhdas, ei `any`
- [ ] `npm run lint` puhdas
- [ ] Suomenkieliset käyttöliittymätekstit
- [ ] Ei TODO-kommentteja jäljellä

---

## 6. SEO

Perusta on jo kuvattu `docs/07-seo-redirects.md`:ssä. Tässä vain se, mikä muuttuu
tai tarkentuu 198 sivun laajuudessa:

| Asia | Vaatimus |
|---|---|
| Redirectit | **198/198** vanhaa URL:ia ohjautuu, todennettu skriptillä |
| Kanoniset | Jokaisella sivulla absoluuttinen `canonical` |
| Sitemap | Generoitu Sanitysta, `lastModified` todellinen |
| Otsikot | `%s · Lahden Suomalainen Klubi ry`, ≤ 60 merkkiä |
| Kuvaukset | 120–160 merkkiä, ei generoitu katkaisemalla leipätekstiä |
| Sisäiset linkit | Jokainen arkistosivu linkittyy hubiinsa ja vähintään kahteen sisarsivuun |
| Core Web Vitals | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 |
| Lighthouse | SEO ≥ 95, Accessibility ≥ 95, Performance ≥ 90 |

**Migraatioriski:** vanha sivusto on frameset, joten Google on indeksoinut
yksittäiset `.htm`-tiedostot ilman navigaatiokontekstia. Osa niistä on
todennäköisesti indeksoitu heikosti. Uusi rakenne parantaa tätä, mutta
**redirectien täydellisyys on kriittinen** — jokainen puuttuva on menetetty sivu.

---

## 7. GEO — generative engine optimization

Tavoite: sisältö on siteerattavissa kun joku kysyy tekoälyltä *"mikä on Suomen
paras jalkapalloravintola Lahdessa"* tai *"milloin Lahden Suomalainen Klubi
perustettiin"*.

> **Rehellinen varaus:** GEO:n näyttö on ohuempaa kuin klassisen SEO:n. Alla olevat
> toimet ovat halpoja, eivät vahingoita SEO:ta, ja perustuvat siihen mitä
> vastausmoottoreiden tiedetään käyttävän. Ne eivät ole taattu tuotto.

**1. Entiteetin yksiselitteisyys.** `Organization`-JSON-LD juurilayoutissa:
nimi, `foundingDate: "2007"`, `location` (Lahti), `sameAs` → Blogspot, YouTube.
Vastausmoottorin on tunnistettava yhdistys entiteetiksi, ei merkkijonoksi.

**2. Vastausmuotoinen aloitus.** Jokainen sisältösivu alkaa 2–3 virkkeen
tiivistelmällä, joka vastaa sivun kysymykseen itsenäisesti ilman muuta kontekstia.
Tämä on syy miksi `tiivistelma`-kenttä on skeemasopimuksessa (§2.1) — ilman sitä
sitä ei voi lisätä jälkikäteen ilman uutta migraatiota.

**3. Data tekstinä, ei kuvina.** Jalkapalloarkiston tilastot ovat oikeita
HTML-taulukoita `<caption>`- ja `<th scope>` -merkinnöillä. Vanha sivusto teki
tämän jo oikein; älä regressoi kuviksi tai canvakseksi.

**4. `llms.txt`.** Juureen kuratoitu kartta siitä, mitä sivusto sisältää ja mistä
auktoritatiivinen versio löytyy. Halpa toteuttaa, ei haittaa jos jää käyttämättä.

**5. Tuoreussignaalit.** `dateModified` jokaisessa JSON-LD:ssä Sanityn
`_updatedAt`:sta — ei käsin ylläpidettynä.

**6. Palvelinrenderöinti.** Vastausmoottorien crawlerit eivät pääsääntöisesti aja
JavaScriptiä. Kaikki sisältö tulee HTML:ssä — tämä on jo arkkitehtuurin ansiota,
mutta se on syy olla lisäämättä client-side-datahakuja sisällölle.

**7. Crawler-politiikka.** `app/robots.ts`:ssä päätetään eksplisiittisesti,
päästetäänkö `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` ja `CCBot`.

> **Tämä on yhdistyksen päätös, ei tekninen oletus.** Suositus: salli. Sisältö on
> julkista, yhdistys hyötyy löydettävyydestä, eikä sivustolla ole myytävää
> sisältöä jota suojella. Kysy silti isältä ennen julkaisua.

---

## 8. Skaalautuvuus ja ylläpidettävyys

**Yksi totuuden lähde per asia.**
Värit ja typografia vain `app/globals.css`:ssä. Tyypit vain typegenistä.
Navigaatio vain Sanityn `navigaatio`-singletonista. Reittipolut vain
`lib/path.ts`:ssä. Jos sama tieto on kahdessa paikassa, toinen on bugi joka
odottaa tapahtumistaan.

**Sisältötyyppi ennen reittiä.** CLAUDE.md:n sääntö 5 pätee: uusi sivutyyppi
tarkoittaa ensin skeemaa, sitten reittiä. Ei koskaan päinvastoin.

**Arkiston kasvu.** Jalkapalloarkisto kasvaa joka vuosi (uudet arvokisat,
uudet ottelut). Rakenne on siksi `[slug]`-pohjainen eikä kovakoodattu:
isä lisää uuden arvokisan Studiossa, eikä kukaan koske koodiin.

**Migraatioputken pysyvyys.** `data/raw-html/` on paikallinen kopio vanhasta
sivustosta. Parserit ajetaan sitä vasten, eivät verkkoa vasten — jäsennystä voi
iteroida ilman että vanhaa palvelinta rasitetaan tai että se ehtii kaatua alta.

**CMS-riippumattomuus.** Parserit tuottavat normalisoitua JSONia
(`data/normalized/*.json`). CMS-kohtainen import on ohut adapteri sen päällä.
Jos Sanity vaihdetaan Payloadiin, jäsennystyö ei mene hukkaan.

---

## 9. Automaattiset laatuportit

Jokaisen agentin on ajettava ennen valmiiksi ilmoittamista:

```bash
npm run type-check      # tsc --noEmit, ei virheitä
npm run lint            # eslint, ei virheitä
npm run build           # next build menee läpi
```

Gate 2:ssa lisäksi:

```bash
npx tsx scripts/verify-redirects.ts     # 198/198 ohjautuu
npx @axe-core/cli http://localhost:3000 # ei kriittisiä
npx lighthouse ...                      # SEO ≥95, A11y ≥95, Perf ≥90
```

---

## 10. Tunnetut riskit

| Riski | Vaikutus | Hallinta |
|---|---|---|
| Sanityn asset-raja (1 112 kuvaa) | Kuvia ei voi ladata | **Selvitettävä ennen kuvamigraatiota** |
| Sanity-projektia ei ole luotu | Mikään ei renderöi oikeaa dataa | `sanityFetch`-fallbackit pitävät sivut pystyssä, mutta tämä on tehtävä |
| Isältä puuttuvat tiedot (hallitus, säännöt, Y-tunnus, jäsenmaksut) | Klubi-osio jää vajaaksi | Rakennetaan rakenne valmiiksi, sisältö täytetään Studiossa myöhemmin |
| Blogspot (450 linkkiä) | Klubin elävä sisältö on toisaalla | Erillinen migraatio RSS:n kautta — ei tässä vaiheessa |
| Arkistosivujen sisältö on epäsäännöllisempää kuin ravintoladata | Parserit tuottavat roskaa | `needsReview`-lippu + Studiossa tarkistus, ei sokeaa importtia |

---

## 10b. Toteutunut tilanne (2026-09-26)

Gate 0, Gate 1 ja Gate 2 ajettu. `npm run type-check`, `npm run lint` ja
`npm run build` menevät puhtaasti läpi; 42 sivua prerenderöityy.

### Integraatiossa löytyneet viat

Rinnakkaisajo tuotti odotetut sivut, mutta **integraatiovaihe löysi viisi vikaa
jaetuista tiedostoista**, joita yksikään agentti ei olisi löytänyt yksin. Tämä on
paras perustelu Gate 2:n olemassaololle:

| Vika | Seuraus | Löytäjä |
|---|---|---|
| `revalidateTag(tag)` ilman toista argumenttia | Ei käänny Next 16:ssa | 3 agenttia itsenäisesti |
| `seo`-projektio 6 kyselyssä | Palautti aina nullin — `seo` on kenttäryhmä, ei kenttä | Klubi-agentti |
| Parametrinen viipale `[0...$count]` 5 kyselyssä | GROQ vaatii vakioluvun | 2 agenttia, `groq-js`:llä todennettuna |
| `city->{ _ref }` | Palautti aina nullin — dereferoidussa on `_id` | Etusivuagentti |
| `cn()` ilman `tailwind-merge`a | `className`-ylikirjoitus ei purrut | 2 agenttia |

Lisäksi puuttui: virheväritokenit, `placeSchema`, stadionin `location`-geopoint,
`absoluteTitle`/`noFollow`, kolme `jalkapalloTilasto`-kategoriaa, etusivun
`jalkapalloarkisto`- ja `galleria`-lohkot.

### Todennettu

- **199/199 ohjausta** palauttaa 308:n oikeaan osoitteeseen (`npm run verify:redirects`)
- 37 ohjausta osoittaa sivulle jolle ei ole vielä sisältöä — odotettua ennen
  migraatiota, **oltava 0 ennen julkaisua**
- Draft mode ei riko staattista generointia: sivut prerenderöityvät yhä

### Tietoisesti tekemättä jätetty

- `tiivistelma`/`legacyUrl` **ei** lisätty `hallitusJasen`-tyyppiin: jäsenillä on
  jo `bio`, ei omia sivuja eikä vanhoja URL:eja. Skeemajohdonmukaisuus ei ole
  itseisarvo, jos se lisää isälle täytettävää ilman hyötyä.
- Karsinnoille ei omaa hub-reittiä: ne on nostettu Huuhkajat-sivulle omana
  osionaan, mikä on sisällöllisesti oikein.

### Tunnettu velka

- `lib/types.ts` sisältää yhä vanhentuneita `seo`-objektityyppejä
  (`UutinenFull`, `TapahtumaFull`, `RavintolaFull`) ja `RavintolaCard`in, joka ei
  tunne uusia arvostelukenttiä. Agentit kirjoittivat omat tyyppinsä
  kyselytiedostoihinsa. **Oikea korjaus on `npm run typegen`** heti kun
  Sanity-projekti on olemassa — sen jälkeen käsintyypit poistetaan.
- Redirect-generaattori keksii dynaamisten reittien slugit (esim.
  `stadionlahtiurheilukeskus.htm` → `/stadionit/lahtiurheilukeskus`).
  Migraation on tuotettava **täsmälleen samat slugit**. `legacyUrl`-kenttä on
  olemassa juuri siksi, että ohjaukset voidaan myöhemmin generoida Sanitysta
  auktoritatiivisesti eikä arvaamalla.

## 11. Eteneminen tästä

1. **Gate 0** — skeemat, typegen, `lib/seo.ts`, JSON-LD-apurit, kolme komponenttia,
   Presentation-kytkentä
2. **Gate 1** — viisi agenttia rinnakkain, tiedosto-omistajuudet §3:n mukaan
3. **Gate 2** — redirectit, sitemap, robots, llms.txt, OG, todennus
4. **Sisältömigraatio** — parserit per sisältötyyppi, import Sanityyn
5. **Julkaisu** — DNS, Search Console, 2 viikon seuranta

Sisältömigraatio on tarkoituksella **vaiheen 4 kohdalla, ei ensimmäisenä**:
reittien ja skeemojen on oltava lopullisia ennen kuin 198 sivua ajetaan sisään,
muuten import tehdään kahdesti.
