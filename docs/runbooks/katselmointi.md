# Katselmointi: klubin lisälista

Pluginin `reviewer`-agentti lukee tämän yleisen listansa lisäksi.

- **Productioniin kirjoittaminen:** mikään skripti tai koodi ei kirjoita `production`-datasettiin ilman `--production`-valitsinta, kuivaharjoitusta oletuksena ja varmuuskopiota (`docs/runbooks/tuotantomuutokset.md`). Ei `--replace`:a.
- **Puuttuva sisältö dynaamisessa reitissä:** `return ohjaaTaiEiLoydy(polku)`, ei `notFound()` (`npm run test:ohjaukset`).
- **URL:t:** poistunut tai muuttunut osoite ohjautuu 301:llä, uusi polku varattu (`docs/runbooks/seo.md`).
- **Kovakoodattu sisältö:** otsikot, tekstit, kuvat ja valikot tulevat Sanitysta. Vain UI-tekstit saa kirjoittaa komponenttiin.
- **Skeema:** suomenkieliset otsikot, kuvaukset ja virheilmoitukset, pakolliset kentät, kuvissa `alt`, `preview`. Kentän poisto, jossa on dataa → siirtymäaika.
- **Studio- tai skeemamuutos:** onko `npm run savutesti:studio` ajettu? Onko ylläpito-ohjeen kortti (`docs/ohje/`) päivitetty ja `npm run ohje` ajettu?
- **Sääntö testiksi:** uusi liiketoimintasääntö (arvosanat, kommentit, linkit, polut) on testissä `scripts/test-*.ts` ja mukana `npm test`issä.
- **Henkilötiedot:** kommenttien ja arvostelujen tiedot eivät päädy lokeihin.
