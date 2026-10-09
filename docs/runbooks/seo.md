# SEO, URL:t ja ohjaukset

Korvaa entiset `seo-agent`- ja `ia-sitemap-agent`-agentit (9.10.2026). Suunnitelma ja historia: `docs/02-information-architecture.md`, `docs/07-seo-redirects.md`.

## URL-konventiot

- Pienet kirjaimet ja väliviivat, ei ääkkösiä (`/klubi/saannot`), lyhyt mutta kuvaava.
- Ei päivämääriä URL:ssa, paitsi arkistoissa.
- Päävalikossa enintään 7 linkkiä (mobiili).
- Uusi reitti varataan polkusäännöissä (`npm run test:sivupolku`), osioiden sivu rekisteriin (`lib/osiosivut.ts`, `npm run test:osiosivut`).

## Ohjaukset

- **Jokainen vanha `.htm`-osoite ohjautuu järkevään kohteeseen 301:llä.** Ei 404:ää: jos selvää vastinetta ei ole, ohjaa hakemistoon.
- `lib/redirects.ts` generoidaan: `npm run redirects` (lukee productionia, vain luku) → tarkista `git diff lib/redirects.ts`. Syöte `data/crawl-status.tsv` on gitissä (docs/24 askel 12). Testi `npm run test:ohjausgeneraattori`, tarkistus `npm run verify:redirects`.
- Ajonaikaiset ohjaukset (isän lyhytosoitteet, muuttuneet osoitteet): uusi dynaaminen reitti kutsuu puuttuvalle sisällölle `return ohjaaTaiEiLoydy(polku)` (`sanity/lib/ohjaus.ts`), ei `notFound()`. Testi `npm run test:ohjaukset`.
- Vanha kategoria → uusi suodatin query-parametrilla (`?kaupunki=lahti`).

## Metadata

- Jokaisella sivulla `title`, `description` ja canonical (`alternates`); ei canonicalia toiseen sivuun ilman syytä.
- Open Graph (`og:locale=fi_FI`, kuva) ja Twitter `summary_large_image`. Jakokuva: `npm run test:lohkot`.
- Ei `meta keywords` -kenttää.
- `app/sitemap.ts` ja `app/robots.ts` päivittyvät Sanitysta; tyhjät osiot piilotetaan (`npm run test:osiot`).

## JSON-LD

| Sivutyyppi | Skeema |
|---|---|
| Etusivu, alatunniste | `Organization` |
| Tapahtuma | `Event` |
| Uutinen | `Article` |
| Ravintola | `Restaurant` |
| Alasivut | `BreadcrumbList` |
