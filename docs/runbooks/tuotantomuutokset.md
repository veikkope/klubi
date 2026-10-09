# Tuotantomuutokset

`production` on isän ylläpitämä tuotantodata, jota Vercel käyttää. Työnkulku: skill `tyokalut:vie-tuotantoon`.

## Säännöt

1. **Käyttäjä ajaa jokaisen productioniin kirjoittavan komennon itse `!`-etuliitteellä.** Pluginin vartija estää `--dataset production` ja `--replace`; `.claude/settings.json` estää lisäksi skriptien `--production`-valitsimen, `sync:blogspot:production`in ja e2e-ajot productioniin. Claude tekee kuivaharjoituksen developmentissa, valmistelee komennot ja tarkistaa tuloksen lukemalla.
2. **Varmuuskopio samana päivänä ennen jokaista muutosta:** `npm run backup` → `varmuuskopiot/production-<aika>.tar.gz` (gitignoressa, kuvineen; vain luku, Claude saa ajaa). Lisäksi automaattinen viikkokopio Studioon (`/api/varmuuskopio`, docs/17 §D).
3. **Vain lisäys tai dokumenttikohtainen patch:** `--missing`, `createIfNotExists`, `patch`. **Ei koskaan `--replace` koko datasettiin**: isä muokkaa productionia (docs/17 §D). Ainoa poikkeus on hätäpalautus varmuuskopiosta, jonka käyttäjä päättää ja ajaa.
4. Skriptit ovat oletuksena kuivaharjoituksia, kirjoittavat vain `--vie`-valitsimella ja ovat idempotentteja. Productioniin vasta, kun koodi on deployattu (kaksoisluku: deploy → patch → vanhan kentän poisto aikaisintaan 2 viikon päästä, docs/24).
5. Kirjaa jokainen muutos alla olevaan lokiin.

## Komennot

| Tehtävä | Komento (käyttäjä ajaa `!`-etuliitteellä) |
|---|---|
| Vie uutta sisältöä `development` → `production`, vain lisäys | `npx sanity dataset import data/migration-<tyyppi>.ndjson --dataset production --missing`. Generoi NDJSON ensin uudelleen (`migraatio.md`): ennen 9.10.2026 tehdyissä tiedostoissa on vanhan kansion kuvapolut. |
| Blogin uudet kirjoitukset → production | `npm run sync:blogspot:production` (kuivaharjoitus) · `-- --vie` (varmuuskopio + `--missing` + tarkistus) |
| Orpojen arvostelukuvien siivous | `npm run siivoa:arvostelukuvat -- --production` (listaa) · `-- --production --poista` |
| Käyttämättömien tiedostojen siivous (yöhuolto tekee saman, docs/24 askel 7) | `npm run siivoa:tiedostot -- --production` (kuivaharjoitus) · `-- --production --poista` (varmuuskopion kanssa) |
| Ruokailutaulukon arvosanat Sanityyn (docs/21) | `npm run tuo:klubiarviot -- --production --vie` |
| Ravintoloiden arvosanat uudelleen (webhook tekee tämän itse) | `npm run laske:arvosanat -- --production --vie` |
| Osioiden sivut (30 koodireitin lukitut `sivu`-dokumentit, `createIfNotExists`, idempotentti; uuden koodireitin jälkeen deployn jälkeen) | `npm run luo:osiosivut -- --production` · `-- --production --vie` |
| Linkit linkkiobjekteiksi (P5 ajettu 8.10.2026) ja vanhojen kenttien poisto (**P11 odottaa**, noin 22.10.2026, docs/24) | `npm run patch:linkit -- --production --vie --poista-vanhat` (kuivaharjoitus ilman `--vie`), sen jälkeen koodimuutos docs/24 P11 |
| Uutiskategoriat (ajettu 4.10.2026); vanhan `categories`-kentän poisto deployn jälkeen | `npm run patch:uutiskategoriat -- --production --poista-vanhat` (kuivaharjoitus kertoo, onko jäljellä), `--vie` kirjoittaa |
| Päästä päähän -testit productionissa | `testit.md` |

## Kertaskriptit (`scripts/kerta/`)

Ajo: `npx tsx scripts/kerta/<tiedosto>.ts [--production] [--vie]`. Kaikki ovat oletuksena kuivaharjoituksia ja idempotentteja (paitsi `check-*`, jotka vain lukevat paikallista dataa). Kun productionin tila on epävarma, kuivaharjoitus productioniin kertoo, onko muutettavaa.

| Skripti | Mitä | Production |
|---|---|---|
| `2026-09-26-check-derived-alt`, `-check-image-formats`, `-check-image-links` | Migraation kuvatarkistukset (`data/`) | – (vain luku) |
| `2026-09-28-poista-jasenhakemus-tietosuojasta` | Jäsenhakemus pois tietosuojaselosteesta (docs/17) | tarkistamatta |
| `2026-09-30-lisaa-kuvat-tietosuojaan` | Arvostelukuvat tietosuojaselosteeseen (docs/18) | ajettu 30.9.2026 |
| `2026-09-30-migrate-etusivu-v3` | Etusivun rakenne v3 | tarkistamatta |
| `2026-09-30-patch-huuhkajat-osiot` | Huuhkajat-sivun osiot | tarkistamatta |
| `2026-09-30-patch-tunnisteet` | Blogin tunnisteet muokattavaan kenttään (docs/14 §3.1) | ajettu 30.9.2026 |
| `2026-10-01-jaa-palloveikkaus` | Palloveikkaussivun jako alasivuiksi | tarkistamatta |
| `2026-10-01-patch-litmanen` | Päävalikon Pelaajat → Litmanen, `litmanen.htm` loukkaantumissivulle | tarkistamatta |
| `2026-10-01-patch-omat-sivut` | Järkytykset ja maailman paras avaus omille sivuilleen (kategoriat `jarkytykset`, `maailman-parhaat`) | tarkistamatta |
| `2026-10-01-uudista-litmanen` | Lehtijutut `lehtileike`-dokumenteiksi, faktat ja patsas omiin kenttiin (docs/20; raportti `data/litmanen-leikkeet.tsv`) | tarkistamatta |
| `2026-10-01-siivoa-tarkistettavat` | Tarkistettavat-listan siivous | ajettu 1.10.2026 |
| `2026-10-06-patch-kansojen-liiga` | Kansojen liigan lohkotaulukot kauden karsintasivulle (`kaudenOttelut`) | tarkistamatta |
| `2026-10-09-luo-tietosuojaseloste` | Tietosuojaselosteen luonti | tarkistamatta |
| `2026-10-09-lisaa-kavijatilastot-tietosuojaan` | Kävijätilastot (GoatCounter) tietosuojaselosteeseen | tarkistamatta |

`tyokalut:siivous` poistaa yli 3 kk vanhat ajetut kertaskriptit (git muistaa).

## Loki

| Päivä | Mitä | Komento | Varmuuskopio |
|---|---|---|---|
| 30.9.2026 | Blogin tunnisteet, arvostelukuvien tietosuojapatch, 29.9. blogikirjoitus | ks. git log 30.9. | |
| 1.10.2026 | Tarkistettavat-listan siivous | `siivoa-tarkistettavat --production --vie` | |
| 4.10.2026 | Uutiskategoriat | `patch:uutiskategoriat -- --production --vie` | |
| 5.10.2026 | Datasetit yksityisiksi (docs/17 §A4) | Sanityn hallinta | |
| 8.10.2026 | P0: development productionin kopioksi | `npx sanity dataset import … development --replace` (vain development) | `production-2026-10-08.tar.gz` |
| 8.10.2026 | P3, P5 (osiosivut, linkit), P8 (webhook, e2e 25/25) | docs/24 luku 5 | `production-2026-10-08.tar.gz` |
