# Testit ja tarkistukset

## Perus

| Tehtävä | Komento |
|---|---|
| Tarkista TypeScript (sovellus ja `scripts/`) | `npm run type-check` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Kaikki yksikkötestit (sama kuin CI) | `npm test` |

Sääntö testiksi: uusi liiketoimintasääntö kirjoitetaan `scripts/test-*.ts`-testiksi ja lisätään `npm test`iin samassa muutoksessa.

## Studion savutesti (pakollinen Studio- ja skeemamuutoksen jälkeen ennen pushia)

`npm run savutesti:studio`: Playwright avaa jokaisen dokumenttityypin, rakenteen listan, pohjan ja listan kohteen ja etsii kaatumiset; ei kirjoita dataan. Ei kuulu `npm test`iin eikä CI:hin. Vaatii `npm run dev` käynnissä ja kirjautumisen (`npx sanity login`). `VAIN=sana,sana` rajaa, `RINNAKKAIN=…`, `BASE_URL=…`, `NAYTA=1` selain näkyviin.

Miksi: type-check, yksikkötestit, `sanity schema validate` ja build eivät havaitse Studion ajonaikaisia kaatumisia (8.10.2026 kaksi pääsi tuotantoon).

## Yksikkötestit (kaikki `npm test`issä)

| Testaa | Komento |
|---|---|
| Kommenttilomakkeen säännöt | `npm run test:kommentit` |
| Paluuosoitteen rajaus (avoin uudelleenohjaus) | `npm run test:paluuosoite` |
| Arvostelukuvien säännöt | `npm run test:arvostelukuvat` |
| Taulukkoeditorin säännöt | `npm run test:taulukko` |
| Linkit (www.-alku, puuttuva kauttaviiva, linkkiobjekti: Sivuston sivu / Muu osoite / Tiedosto, liitetiedostot, kohteen tila) | `npm run test:linkki` |
| Joukkueiden nimivertailu (otteluohjelma) | `npm run test:joukkueet` |
| Kansojen liigan taulukon ja kauden karsintasivun paritus | `npm run test:kaudet` |
| Kuvaloader (Sanityn CDN) | `npm run test:kuvat` |
| Litmanen-osion säännöt (lehtileikkeiden ote, loukkaantumisyhteenveto) | `npm run test:litmanen` |
| YouTube-osoitteiden tulkinta (`lib/youtube.ts`) | `npm run test:youtube` |
| Ylläpito-ohje (lihavoidut Studion nimet koodia vasten, `studio:`-linkit, korttilinkit, kuvat, rakenne, generoitu sisältö ajan tasalla) | `npm run test:ohje` |
| Tiedostosiivouksen säännöt (7 päivän armoaika, varmuuskopiot aina suojattu; GROQ groq-js:llä) | `npm run test:tiedostosiivous` |
| Sivuston tilan säännöt (Aloituksen liikennevalot: varmuuskopio, huolto, otteluhaku, kiintiön arvio, perustiedot) | `npm run test:sivuston-tila` |
| Aloituksen tehtävärekisteri ja kysely (Tehtävät sinulle -listat ja laskurit) | `npm run test:aloitus` |
| Varmuuskopion säännöt | `npm run test:varmuuskopio` |
| Varmuuskopiosta palauttamisen säännöt (Studion Palauta varmuuskopiosta / Palauta poistettu) | `npm run test:palautus` |
| Tyhjien osioiden piilotus (valikko, alatunniste, sitemap) | `npm run test:osiot` |
| Sivun polkusäännöt (varatut polut, lukitut sivut, jokainen app-reitti varattu) | `npm run test:sivupolku` |
| Tekstin lohkot ja uutiskortti (lohkojen järjestys, kuvasarja, huomiolaatikon sävy, liitetiedosto, korttikuvan varakäytös, jakokuva, tekstin alku kortissa; GROQ groq-js:llä: liite ja painike) | `npm run test:lohkot` |
| Upotuslohko (Google Maps, Google Forms, Vimeo; vieraat palvelut, javascript:/data:, liitetty iframe-HTML → vain osoite) | `npm run test:upotus` |
| Osioiden sivut (rekisteri, lukitus, reittien kattavuus, oletustekstit, siemen ei muuta näkymää eikä meta-kuvauksia) | `npm run test:osiosivut` |
| Päävalikon linkit ja siitä johdettu alatunniste (Sivusto-sarake, alavalikot sarakkeina, tyhjät osiot) | `npm run test:navigaatio` |
| Linkkien migraation säännöt (viittaus vain yksiselitteiseen julkaistuun dokumenttiin, muut Muu osoite, kävijän osoite ei muutu, idempotentti) | `npm run test:linkit-migraatio` |
| Ajonaikaiset ohjaukset (lyhytosoitteet, aiemmat osoitteet, webhookin yhdistäminen, reittien `ohjaaTaiEiLoydy`) | `npm run test:ohjaukset` |
| Valmiit pohjat ja [täytä]-sääntö (vuosikokous, palloveikkaus, arvosana ravintolalle) | `npm run test:pohjat` |
| Studion tilamerkit (Ajastettu, Tarkistettava, Odottaa toista arvioijaa, Piilotettu; pariteetti `JULKINEN_RAVINTOLA`) | `npm run test:tilamerkit` |
| Ohjausgeneraattorin syötteet ja tulos (crawl-status.tsv ↔ lib/redirects.ts, ei ketjuja, oletusdatasetti production) | `npm run test:ohjausgeneraattori` |
| Esikatselun sijainnit ja tilastoryhmät (Käytetty … sivulla kaikille tyypeille, taulukko usealla sivulla, vanhat sijainnit ennallaan, ryhmät eivät hukkaa taulukoita) | `npm run test:sijainnit` |
| Uutishaun hakusanat | `npm run test:haku` |
| Lukuaika ja ingressisääntö (uutiset, ravintola-arviot) | `npm run test:artikkeli` |
| Uutisten tunnisteet | `npm run test:tunnisteet` |
| Ravintolan arvosanalaskenta (klubilaisten arvosanat) | `npm run test:arvosana` |
| Arvostelun vaiheet ja luonnos (puhelinnäkymä) | `npm run test:arvostelu` |

## Muut tarkistukset (eivät `npm test`issä)

| Tehtävä | Komento |
|---|---|
| Saavutettavuustesti (axe, WCAG 2.1 AA) | `npm run test:saavutettavuus` (sivusto käynnissä; `BASE_URL=…` muu osoite) |
| Taulukoiden sijainnit productionia ja sivustoa vasten (vain luku; `BASE_URL=…`, `SANITY_DATASET=…` muu kohde) | `npm run verify:sijainnit` |
| Migraation tarkistukset | `npm run verify:migration`, `verify:content`, `verify:redirects`, `verify:blogspot` |

## Päästä päähän -testit

| Tehtävä | Komento |
|---|---|
| Ohjaukset ja aiemmat osoitteet (luo ja poistaa testisivun ja kaksi ohjausta; netto 0). `-- --paikallinen`: development + localhost (palvelin development-datasetillä, `SANITY_REVALIDATE_SECRET` ja `SANITY_API_WRITE_TOKEN` asetettuina), webhook simuloidaan. | `npm run e2e:ohjaukset -- --paikallinen` |
| Sama productionissa ja aidolla webhookilla: varmuuskopio ensin, webhook-jono tyhjänä (docs/24 P8). **Käyttäjä ajaa itse.** | `! npm run e2e:ohjaukset` |
| Kahden klubilaisen sääntö webhookin kautta productionissa (luo ja poistaa testiravintolan; varmuuskopio ensin, webhook-jono tyhjänä). **Käyttäjä ajaa itse.** | `! npm run e2e:arvioijasaanto` |
