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
- **Pehmeät redirectit** (kategoria → hakemisto): query-parametri (esim. `/ruokailulahti.htm` → `/ravintolat?kaupunki=lahti`)
- **Kuolleet linkit**: ohjaa hakemistoon, esim. `/ruokailu.htm` → `/ravintolat`

### Manuaalisen lisäyksen prosessi
1. Lisää rivi `lib/redirects.ts`:ään
2. PR + review
3. Deploy

Tai: lisää `data/manual-redirects.csv`:hen ja aja `npm run redirects` — skripti generoi `lib/redirects.ts`:n. Tämä helpottaa kun rivejä on paljon (sprintin 5 aikana).

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
