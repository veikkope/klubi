# Migraatio (vanha sivusto ja Blogspot → development)

Sopimus ja tila: `docs/12-sisaltomigraatio.md`, blogi `docs/14-blogspot-migraatio.md`. Migraatiot kirjoittavat aina `development`-datasettiin: `scripts/sanity-import.ts` kieltäytyy muista dataseteista. Productioniin vienti: `tuotantomuutokset.md`.

| Tehtävä | Komento |
|---|---|
| Hae vanha sivusto paikallisesti | `npm run crawl` + `npm run images` → `data/` (gitignoressa) |
| Koko migraatio → `development` | `npm run migrate:all` (yksittäin `migrate:<tyyppi>`: ravintolat, stadionit, uutiset, huuhkajat, tilastot, arvokisat, klubi, blogspot) |
| Kattavuusraportti | `npm run migrate:coverage` |
| Tarkista migraatio | `npm run verify:migration`, `verify:content`, `verify:redirects`, `verify:blogspot` |
| Hae Blogspot-blogi paikallisesti | `npm run blogspot:fetch` → `data/blogspot/` (gitignoressa) |
| Blogi → `development`, ensimmäinen kerta | `npm run migrate:blogspot` |
| Blogi → `development`, vain uudet (säilyttää Studion muokkaukset) | `npm run sync:blogspot` |
| Generoi redirectit (lukee productionia, vain luku; tarkista `git diff lib/redirects.ts`) | `npm run redirects` (`seo.md`) |

`data/migration-*.ndjson` ovat generoituja (gitignoressa). Niissä on kuvien absoluuttiset `file://`-polut: kansion siirron jälkeen (9.10.2026) generoi ne uudelleen ennen tuontia.
