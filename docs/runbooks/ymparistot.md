# Ympäristöt

| | development | production |
|---|---|---|
| Sanity-datasetti | `development` | `production` (isän, Vercel käyttää) |
| Kuka kirjoittaa | Claude, skriptit (oletus) | Isä Studiossa; kehittäjä vain dokumenttikohtaisilla patcheilla tai `--missing`-lisäyksillä, käyttäjä ajaa itse (`tuotantomuutokset.md`) |
| Sisältö | Productionin kopio 8.10.2026 (docs/24 P0); tyhjennetään julkaisun jälkeen (päätös 7.10.2026) | |

## `.env.local`

- **Paikallinen `.env.local` osoittaa productioniin** (`NEXT_PUBLIC_SANITY_DATASET=production`), vaikka vanha ohje väitti developmentia. Paikallinen Studio (`localhost:3000/studio`) siis muokkaa isän dataa. Development-ajoon: `NEXT_PUBLIC_SANITY_DATASET=development npm run dev`.
- Lukutokenia (`SANITY_API_READ_TOKEN`) ei ole. Datasetit ovat yksityisiä Growth-kokeilun ajan, joten ilman tokenia `npm run dev` näyttää tyhjän sivuston ja build rakentaa tyhjän. Lukuun Sanity CLI:n token:
  ```sh
  SANITY_API_READ_TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync(require('os').homedir()+'/.config/sanity/config.json','utf8')).authToken)") npm run dev
  ```
- Skriptit hakevat kirjoitustokenin `scripts/lib/sanity-token.ts`:llä (`.env.local` tai CLI-kirjautuminen `npx sanity login`). Tokenia ei tulosteta.
- Claude ei lue `.env*`-tiedostoja (`.claude/settings.json`, vartija). Muuttujat: `.env.example`.
- Jos sisältö näyttää puuttuvan, tarkista ensin `NEXT_PUBLIC_SANITY_PROJECT_ID` ja `NEXT_PUBLIC_SANITY_DATASET`.

## Sanityn taso

Growth-kokeilu päättyy 26.10.2026; projekti jää Free-tasolle (päätös 7.10.2026), jolloin datasetit muuttuvat taas julkisiksi. Silloin ja kun lomakkeet lakkaavat toimimasta: `npm run tarkista:sanity-taso` (tilaus, datasetin näkyvyys, tokenien ja käyttäjien roolit, sivusto; vain luku).

## Paikallisen ympäristön sudenkuopat

- Tarkistusbuildia ennen `rm -rf .next` (Turbopack tarjoili kerran vanhoja esirenderöityjä sivuja).
- Sanityn 429-rajoitus buildissa: `next.config.ts` `experimental.cpus: 4` ja `sanityFetch`in uusinta 429:ssä.
- Windowsissa `next dev`/`next start` voi jäädä henkiin: `taskkill //PID <pid> //T //F`.
- Git Bashissa polkuja sisältävät env-muuttujat `MSYS_NO_PATHCONV=1`-etuliitteellä (esim. `SIVUT="/,/klubi"`).
- `npx sanity documents query` kaatuu pelkkään skalaariin: kääri `{"n": count(...)}`.
- Push `main`iin julkaisee Verceliin automaattisesti. Tila: `gh api repos/veikkope/klubi/commits/<sha>/status` (Vercel) ja check-runs (tarkistukset).

## Hosting

Vercel (Hobby käynnistyksessä, Pro harkitaan liikenteen mukaan), deploy Vercelin oletus-Nodella. Kehitykseen Node 25.
