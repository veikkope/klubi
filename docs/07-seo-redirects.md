# 07 — SEO ja 301-redirectit

## Tavoitteet
1. Ei putoamista Googlessa migraation yhteydessä
2. Vanhat linkit toimivat (vanhat blogipostaukset, vanhat email-allekirjoitukset, ulkoiset linkit)
3. Strukturoitu data: hakukoneet ymmärtävät sisällön
4. Sosiaaliset jakolinkit näyttävät hyvältä (OG-kuvat)

## Metadata-strategia

### Per-sivu
- Käytä Next.js Metadata APIa (`generateMetadata` tai static `metadata`-export)
- Lähde: Sanityn `seoTitle` / `seoDescription` → fallback `title` / `excerpt` / `ingress` → fallback `asetukset.defaultSeoDescription`
- Lokalisaatio: `lang="fi"`, `locale: "fi_FI"`

### Otsikkomalli
`%s · Lahden Suomalainen Klubi ry`
- Etusivu: `Lahden Suomalainen Klubi ry` (ei suffixiä)
- Tapahtumat: `Vappu 2026 · Lahden Suomalainen Klubi ry`
- Asetettu `app/layout.tsx`:ssä Metadata.template:lla

### Open Graph -kuvat
- Per dokumentti: jos `coverImage`/`hero`/`image` löytyy, käytä sitä
- Fallback: `asetukset.defaultOgImage`
- Generoi `/api/og`-reitti, joka piirtää brändätyn OG-kuvan (otsikko + logo siniselle taustalle) — sprintissä 5

## Sitemap

`app/sitemap.ts` generoi automaattisesti:
- Etusivu (priority 1.0)
- Yhdistys-sivut (priority 0.8)
- Tapahtumat tulevaisuudessa (priority 0.7)
- Uutiset (priority 0.6, lastmod = publishedAt)
- Ravintolat, stadionit (priority 0.5)
- Jalkapallotilastot (priority 0.4)

`changefreq`:
- Etusivu: weekly
- Uutiset & tapahtumat: daily
- Muut: monthly

## Robots.txt

`app/robots.ts`:
```
User-agent: *
Allow: /
Disallow: /studio
Disallow: /api/

Sitemap: https://www.lahdensuomalainenklubi.com/sitemap.xml
```

## Strukturoitu data (JSON-LD)

| Sivutyyppi | Skema |
|---|---|
| Etusivu, footer | `Organization` (nimi, logo, osoite, sosiaaliset mediat) |
| Tapahtuma | `Event` (name, startDate, endDate, location, image) |
| Uutinen | `Article` (headline, datePublished, image, author) |
| Ravintola | `Restaurant` (name, address, starRating, aggregateRating) |
| Yhdistyssivu | `WebPage` + `BreadcrumbList` |

Toteutus: per-sivu komponentti `<JsonLd schema={...} />` joka renderöi `<script type="application/ld+json">`.

## 301-redirectit

### Lähde
`lib/redirects.ts` (versioitu Gitissä) → ladataan `next.config.ts`:n `redirects()`-funktiosta.

### Strategia
- **Kovat redirectit** (yksittäinen vanha URL → yksittäinen uusi URL): suora mapping
- **Pehmeät redirectit** (kategoria → hakemisto): query-parametri. Vanhat ravintolasivut (`ruokailu*.htm`) ohjautuvat tarkimpaan hakemistonäkymään, joka näyttää kaikki sivun ravintolat (ks. "Ravintolasivujen ohjaukset" alla).
- **Kuolleet linkit**: ohjaa hakemistoon, esim. `/ruokailu.htm` → `/ravintolat`

### Manuaalisen lisäyksen prosessi
1. Lisää rivi `lib/redirects.ts`:ään
2. PR + review
3. Deploy

Tai: lisää `data/manual-redirects.csv`:hen ja aja `npm run redirects` — skripti generoi `lib/redirects.ts`:n. Tämä helpottaa kun rivejä on paljon (sprintin 5 aikana).

### Ravintolasivujen ohjaukset (ruokailu*.htm)

`scripts/generate-redirects.ts` johtaa kohteen sivun ravintoloista (Sanityn `legacyUrl` ja `muutLegacyUrlit`), ei sivun nimestä. Kohde on tarkin hakemistonäkymä, joka näyttää kaikki sivun ravintolat:

1. kaikki samassa kaupungissa → `?kaupunki=<slug>` (ei maa-tason viitteitä)
2. kaikki Suomessa, yksi maakunta → `?maakunta=<arvo>`
3. kaikki Suomessa, 2–3 maakuntaa → `?maakunta=<a>,<b>`
4. kaikki samassa maassa → `?maa=<slug>`
5. muuten → `/ravintolat`

Jos sivulla on lopettaneita ravintoloita, kohteeseen lisätään `lopettaneet=1`. Skripti simuloi hakemiston suodattimen ja kaatuu, jos jokin ohjaus ei näytä 100 %:a sivun ravintoloista. Kattavuustaulukko tulostuu jokaisella ajolla (`npm run redirects`). `ruokailu.htm` ja `ruokailutop5.htm` → `/ravintolat` (koostesivut). `--offline`-ajon sääntö (`?kaupunki=<sivun nimi>`) on vain varajärjestely.

Tilanne 2026-09-27: 44 ravintolasivua, kaikki 100 %. Tasot: kaupunki 27, maakunta 5, maakunnat 4, maa 8. Koko taulukko: docs/12 "Maa- ja maakuntasuodatin".

### Vahvistus
Sprint 5:ssä aja testiskripti:
```ts
// scripts/verify-redirects.ts
for (const r of legacyRedirects) {
  const res = await fetch(`https://klubi.vercel.app${r.source}`, { redirect: "manual" });
  if (res.status !== 308 && res.status !== 301) console.error("FAIL", r.source);
}
```

(Next.js `permanent: true` palauttaa 308; useimmat hakukoneet käsittelevät sen kuten 301.)

## Ajonaikaiset ohjaukset (Sanity)

*docs/24 askel 8 (Y18), toteutettu 8.10.2026.* Staattisten ohjausten lisäksi sivusto
ohjaa kaksi asiaa Sanityn datasta, ilman deployta ja ilman kehittäjää.

### Järjestys
1. `next.config.ts` (`lib/redirects.ts`: vanhan sivuston .htm-osoitteet ja blogin
   kirjoitukset, sekä muutama käsin tehty). Ajetaan ennen reittejä, joten ne voittavat aina.
2. Reitti: jos osoitteessa on sivu, se näytetään. Sivu voittaa aina ohjauksen.
3. **404-haara** (`ohjaaTaiEiLoydy(polku)`, `sanity/lib/ohjaus.ts`): ensin isän ohjaus
   (`ohjaus`-dokumentti), sitten dokumentin aiempi osoite (`aiemmatPolut`). Muuten 404.

proxy.ts-tiedostoa ei käytetä: se ajettaisiin jokaiselle pyynnölle, ja ohjaus
haettaisiin Sanitystä turhaan (docs/23 Y18). next.config-ohjauksiin Sanityn dataa ei
voi lisätä (Vercelin 1024 ohjauksen raja, deploy).

### Tilakoodit
- **308** (`permanentRedirect`): dokumentin aiempi osoite → nykyinen osoite.
- **307** (`redirect`): isän ohjaus ja lyhytosoite. Kohteen voi vaihtaa, joten selain ja
  hakukone eivät saa muistaa sitä pysyvänä. Jos ketjussa on yksikin isän ohjaus, tulos on 307.
- Kaupungin vanha `?kaupunki=`-tunniste ohjautuu hakemiston siistiin osoitteeseen 307:llä
  (`korjaaKaupunki`, `siistiRavintolaHref`); rajattu näkymä on noindex. Uutiskategorian
  vanha `?kategoria=` → 308 (`app/(public)/uutiset/page.tsx`).

### Ohjauskartta ja välimuisti
- Kysely `ohjauskarttaQuery` (`sanity/lib/queries/ohjaukset.ts`) hakee kaikki ohjaukset ja
  kaikki sivustolla näkyvät dokumentit, joilla on aiempia osoitteita. Se on parametriton:
  yksi välimuistiavain kaikille 404-vastauksille, joten bottien satunnaiset osoitteet eivät
  lisää Sanityn kutsuja.
- Tagi `ohjaus`: webhook tyhjentää sen, kun ohjaus tai mikä tahansa ohjattava tyyppi
  (`OHJATTAVAT_TYYPIT`) muuttuu. Next 16 tallentaa myös sivun ohjauksen ISR-välimuistiin;
  sama tagi vanhentaa sen (e2e-testin askel 5 varmistaa). Varasuunnitelma, jos ei: catch-allin
  `revalidate` 3600 → 300 s.
- Ratkaisu on puhdas funktio `ratkaiseOhjaus` (`lib/ohjaukset.ts`): polut normalisoidaan
  (pienet kirjaimet, prosenttikoodaus purettu, kysely ja ankkuri pois, lopun kauttaviiva
  pois). Jos kaksi dokumenttia väittää samaa aiempaa osoitetta, uusin `_updatedAt` voittaa
  (tasatilanteessa pienin `_id`).

### Ketjut ja silmukat
Kävijä saa aina yhden ohjauksen lopulliseen kohteeseen. Kohde lasketaan dokumentin
nykyisestä reitistä, joten useampi uudelleennimeäminen (A → B → C) ohjaa A:n ja B:n suoraan
C:hen. **Dokumentin nykyinen reitti päättää ketjun aina** (aiemman osoitteen kohde ja isän
ohjaus, jonka kohde on Sivuston sivu): siinä on elävä sivu, vaikka sama polku olisi toisen
dokumentin aiempi osoite. Ketju jatkuu vain isän ohjauksesta, jonka kohde on Muu osoite
sivuston sisällä (toiseen ohjaukseen tai aiempaan osoitteeseen), enintään viisi hyppyä.
Ulkoinen kohde ja etusivu (`/`) päättävät ketjun; `mailto:` ei kelpaa kohteeksi. Silmukka
antaa 404:n ja kirjaa `console.error`in.

### Aiempien osoitteiden tallennus (webhook)
Webhook (`app/api/revalidate/route.ts`, `sanity/lib/aiemmat-polut.ts`) tallentaa vanhan
osoitteen, kun julkaistun ohjattavan dokumentin, uutiskategorian tai kaupungin osoite
muuttuu. Uutiskategoriassa ja kaupungissa tallennetaan pelkkä tunniste. Taulukon vanhaa
reittiä ei tallenneta, jos siinä on ankkuri: se on osion yhteinen sivu (esim.
/jalkapalloarkisto/mestarit), jossa muut taulukot näkyvät yhä.

- Vain olemassa olevat versiot (julkaistu ja luonnos) patchataan.
- Atomiset operaatiot erillisinä mutaatioina yhdessä transaktiossa: `setIfMissing`,
  `unset` (uusi osoite, jos palattiin aiempaan; toistot) ja `insert` listan loppuun. Ei
  koko listan settiä, joten kaksi nopeaa julkaisua eivät hävitä toistensa osoitteita.
- Itsekorjaus: projektion `ennen.aiemmatPolut`-osoitteet, jotka puuttuvat nykyisestä
  (luonnos avattiin ennen webhookin patchia), palautetaan, kun osoite muuttui tässä
  julkaisussa tai edellistä versiota (`ennen._updatedAt`) on muokattu viimeisen 10 minuutin
  aikana (`itsekorjausSallittu`). Vanhentunut luonnos syntyy vain juuri webhookin
  lisäyksen ympärillä, joten ikkuna riittää.
- **Virheellisen aiemman osoitteen poisto (kehittäjä):** varmista, ettei dokumenttia ole
  muokattu 10 minuuttiin. Varmuuskopio (`npm run backup`), sitten samassa transaktiossa
  julkaistulle ja mahdolliselle luonnokselle `unset(['aiemmatPolut[@ == "/vanha"]'])`
  (esim. `npx sanity documents query` -tarkistus ennen ja jälkeen). Webhook ei palauta
  osoitetta, koska osoite ei muuttunut eikä edellinen versio ole tuore.
- **Kopioi pohjaksi (askel 9):** Studion Kopioi on "Kopioi pohjaksi", joka jättää pois
  osoitteen (`slug`), `legacyUrl`-, `muutLegacyUrlit`-, `aiemmatPolut`- ja `blogspot`-kentät,
  tarkistusliput (`needsReview`, `tarkistettavaa`), ravintolan `automaattinenArvosana`-kentän
  ja uutisen `publishedAt`-kentän sekä tyyppikohtaiset kentät (`KOPIOSTA_POISTETTAVAT`,
  `KOPIOSTA_POISTETTAVAT_TYYPEITTAIN`, `kopioiPohjaksi` tiedostossa
  `sanity/actions/vanhat-osoitteet.tsx`). Muuten kopio veisi alkuperäisen vanhat osoitteet.
  **Sanityn @beta-rajapinta** `mapDocument` (DuplicateActionProps): tarkista
  pääversiopäivityksessä, että kopio on yhä ilman näitä kenttiä.
- **Poiston turva (askel 9, K3):** Poista ja Poista julkaisu näyttävät ensin varoituksen,
  jos dokumentin omaan sivuun ohjautuu vanhoja osoitteita (`poistonVaroitus`,
  `vanhatOsoitteet` tiedostossa `lib/ohjaukset.ts`; `varoitaVanhoistaOsoitteista`).
  Ylimpänä on nykyinen osoite, koska staattiset ohjaukset ja aiemmat osoitteet vievät
  siihen, ja isän ohjaus tehdään siitä poiston jälkeen (ennen poistoa HEAD antaa 200, ja
  `lahdeOnVapaa` hylkää osoitteen). Tunnistetyypit ja toisen sivun ankkurina näkyvät
  taulukot ohitetaan: niiden poisto ei vie vanhoja linkkejä 404:ään.
- Ristiriidassa uudelleenyritys tuoreella haulla (enintään 3). Lopullinen epäonnistuminen
  → `console.error` ja vastaus 500, jolloin Sanity yrittää webhookia uudelleen.
- Webhookin oma patch laukaisee uuden webhookin, jonka `before().slug` on sama kuin
  nykyinen: ei muutosta, ei silmukkaa.

**Webhookin projektio ja suodatin** (sanity.io/manage → API → Webhooks → "Sivuston
päivitys (revalidate)"; sama teksti docs/17 §D):

```groq
{ _id, _type, "slug": slug.current, "operaatio": delta::operation(),
  "ennen": before(){ _updatedAt, "slug": slug.current, aiemmatPolut, category, huuhkajatOsio, mestaruusmaa } }
```

```groq
defined(_type) && !(_type match "sanity.*") && !(_type in ["sivustonTila", "varmuuskopio"])
```

Projektiossa ei saa olla `*[...]`-alikyselyitä (ne epäonnistuvat webhookissa hiljaa). Jos
webhook luodaan uudelleen vanhalla projektiolla `{_type, "slug": slug.current}`, välimuisti
tyhjenee yhä, mutta aiempia osoitteita ei tallenneta: Vercelin lokiin tulee varoitus
"webhookin projektiosta puuttuu operaatio".

### Rakennetesti
`npm run test:ohjaukset` kaatuu, jos `app/(public)`-kansion koodissa on `notFound(`-kutsu:
jokaisen reitin on kutsuttava `return ohjaaTaiEiLoydy(polku)`, muuten lyhytosoitteet ja
muuttuneet osoitteet eivät toimi reitin alla. Testi tarkistaa myös, että kyselyn
tyyppilista vastaa `OHJATTAVAT_TYYPIT`-joukkoa ja että jokainen `polkuMuuttunut`-säännön
tyyppi on ohjattava tai tunnistetyyppi.

### Päästä päähän
`npm run e2e:ohjaukset -- --paikallinen` (development, localhost, webhook simuloidaan) ja
`npm run e2e:ohjaukset` (production, aito webhook, varmuuskopio ensin). Kattaa osoitteen
muutoksen, lyhytosoitteen, kohteen vaihdon välimuistin läpi, kaksi kilpailutilannetta (K2)
ja poiston jälkeisen ohjauksen (K3). Netto 0 dokumenttia.

### Y19:n johtopäätös (8.10.2026)
Ajonaikaista legacyUrl-hakua ei tehdä. Kaikilla 188 .htm-osoitteella ja 530 blogipolulla on
staattinen ohjaus, ja kaikki 689 kohdetta vastaavat 200:lla. Kun migroidun dokumentin
osoite muuttuu, ketju on staattinen 308 → vanha polku → aiempi osoite 308 → uusi polku
(kaksi hyppyä). `npm run redirects` päivittää staattisen kohteen suoraksi, kun kehittäjä
ajaa sen. Poistetun dokumentin osoitteen hoitaa isän ohjaus nykyisestä osoitteesta
(docs/09 "Lyhytosoite esitteeseen", kohta Poistettu tai yhdistetty sivu).

**Muistiin Sanityn pääversiopäivitykseen:** tarkista, että `delta::operation()` ja
`before()` toimivat webhookin projektiossa (API-versio v2021-03-25).

## Hreflang
Vain suomi → ei hreflang-tarvetta.

## Suorituskykytarkistukset SEO:lle
- Lighthouse SEO ≥ 95
- Mobiili-ystävällinen (Google Mobile-Friendly Test)
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1

## Google Search Console
Sprint 6 julkaisun jälkeen:
1. Vahvista domain
2. Lähetä sitemap.xml
3. Tarkkaile "Coverage"-raporttia 2 viikon ajan: kaikki sivut indeksoidaan, ei "Crawl error"-viestejä
4. Tarkkaile "Performance"-raporttia: vanhat sivut häviävät, uudet ilmestyvät

## Bing Webmaster Tools
- Submit sitemap myös Bingiin
- Vaivaton, asetus kerran riittää
