# Lahden Suomalainen Klubi ry, uusi sivusto: ylläpidettävyys ilman kehittäjää

**Päiväys:** 7.10.2026
**Kohde:** https://www.lahdensuomalainenklubi.com ja Sanity Studio (/studio), Sanity-projekti zyrukn4s
**Lukijat:** kehittäjä ja isä (sihteeri, ylläpitäjä)
**Pohja:** Seitsemän tutkimusnäkökulmaa: kovakoodattu sisältö, isän tehtäväskenaariot, Sanityn ominaisuudet, linkit ja ohjaukset, kehittäjäriippuvuudet, Studion käytettävyys, rakenteellinen joustavuus ja productionin datan tila. Lisäksi kolme täydennystutkimusta: Sanityn tilaus ja kustannukset, ratkaisujen ristiriidat ja tiekartta sekä isän todellinen käyttö. Löydöksiä oli yhteensä 144, ja yksi kumottiin. Tässä raportissa päällekkäiset löydökset on yhdistetty 43 kohdaksi (Y1–Y43). Kunkin kohdan alla mainitaan alkuperäiset tunnisteet.
**Tutkimuskysymys:** Mitä isä voi tehdä yksin, mihin tarvitaan vielä kehittäjää ja miten Sanityn omilla ominaisuuksilla riippuvuus kehittäjästä saadaan poistettua.

---

## 0. Päätökset 7.10.2026

Kehittäjä päätti luvun 7 kysymykset. Nämä ohittavat raportin suositukset siltä osin kuin ne eroavat.

| Aihe | Päätös | Vaikutus tiekarttaan |
|---|---|---|
| Sanityn taso (Y1) | **Free-taso.** Growth-kokeilu päättyy 26.10.2026. | Y2 on pakollinen ennen 26.10.: tarkistetaan, millä Free-tason roolilla lomakkeiden kirjoittava token toimii, ja testataan kommentti, arvostelu, huolto ja varmuuskopio 26.10. illalla. Y32:n palautustoiminto on tarpeellinen, koska historia lyhenee kolmeen päivään. Y7: isä on Administrator, ja opas kertoo, mihin hallinnan kohtiin ei kosketa. |
| Julkinen datasetti (Y3) | Hyväksytään. **Varmuuskopiot jäävät Sanityyn kokonaisina**, koska ne eivät sisällä arkaluonteista tietoa. | Y3:n varmuuskopiomuutokset jäävät pois. Tietosuojaseloste ja docs/17 §A4 päivitetään vastaamaan julkista datasettiä. |
| Kommenttien moderointi | Ylläpitäjä voi sekä **piilottaa että poistaa** kommentin. Molemmat toiminnot jäävät (`PiilotaKommentti`, `PoistaKommentti`). | Ei muutosta. Oppaaseen lisätään, että piilotettu kommentti on luettavissa rajapinnasta, ja jos halutaan, että se katoaa kokonaan, käytetään poistoa. |
| Koodi ja hosting (Y5) | **Pidetään ennallaan** Veikon GitHub- ja Vercel-tileillä. | Vain hätäohje ja `.env.example` kuntoon. GitHub-organisaatio ja Vercel Pro jäävät pois. |
| Development-datasetti (Y4) | **Tyhjennetään kokonaan** julkaisun jälkeen. Kehitys tehdään tuoreesta productionin kopiosta. | CLAUDE.md:n ja docs/12:n migraatio-ohjeet päivitetään samalla. |
| Blogi (Y8) | **Katkaistaan nyt.** Viimeinen synkka, muuttoilmoitus ja yhteinen kirjoituskerta Studiossa. | Y8 heti, Y9 (kuvasarja) perään. |
| Tapahtumat ja Galleria (Y24) | **Piilotetaan automaattisesti, kun ne ovat tyhjiä:** pois valikosta, alatunnisteesta ja sitemapista. Ne palaavat näkyviin, kun sisältöä lisätään. | Y24 |
| Ilmoitukset (Y33, Y35) | **Tehtävät-lista Studiossa**, ei sähköpostia. | Y35 |
| Tekstilohkot (Y14, Y15) | **Kaikki:** kuvasarja, PDF-liite, painike ja huomiolaatikko, taulukko ja kartta tai upotus. | Y15:n vaiheet 3–4 siirtyvät vaiheesta 3 vaiheeseen 2. |
| Listasivut (Y22) | **Kaikki 24 kerralla** Sanityyn. | Y22:n työmäärä kasvaa. |
| Osoitteen muutos (Y18) | **Sallitaan**: ohjaus syntyy automaattisesti, ja isä voi tehdä **lyhytosoitteita** (esim. /jasenmaksu). | Y18 |
| Alatunniste (Y23) | **Seuraa päävalikkoa.** Erillistä listaa ei tehdä. | Y23 |
| Jalkapalloarkisto (Y27) | **Tekstisivut riittävät.** `arkistoOsio` jää pois. | Y27:n askel 3 pois. |
| Pelaajaosiot ja kumppanit (Y28) | **Ei nyt.** | Y28:n yleistys pois, vain lehtileikkeen rajaus Litmaseen. |
| Johdantokentät (Y10) | **Ei yhdistetä.** Kenttien ohjeet selkeytetään. | Y10:n migraatio pois. |
| Kahden klubilaisen sääntö (Y31) | **Pysyvä**, ja se pysyy koodissa. | Ei muutosta. |
| Ylläpito-linkki footerissa | **Säilyy.** | Ei muutosta. |
| Vuosien 2006–2007 otsikkoehdotukset | **Ei massana.** Isä käy ne läpi Tarkistettavat-listalta. | Ei muutosta. |
| Tiedotebanneri (Y13) | **Ei nyt.** | Y13 pois vaiheesta 2. |

**Toteutettu 7.10.2026 (ennen 26.10. määräaikaa):**
- **Y1–Y2 tarkistus:** `npm run tarkista:sanity-taso` näyttää tilauksen, datasetin näkyvyyden, tokenien ja käyttäjien roolit ja sivuston tilan (vain luku). Tilanne 7.10.: Growth Trial päättyy 26.10.2026 klo 16.30 Suomen aikaa (ei 17.30: kesäaika päättyy 25.10.), datasetti on yksityinen, ja "Vercel - lomakkeet" -tokenilla on rooli editor. Sanityn mukaan robottitokenin Editor-rooli on sallittu myös ilmaistasolla, joten lomakkeiden ei pitäisi pysähtyä. Varmistus ajetaan 26.10. illalla (docs/17 §D).
- **Y32 palautus Studiossa:** jokaisen sisältödokumentin ⋯-valikossa on **Palauta varmuuskopiosta**, ja varmuuskopion avaamiseen tulee välilehti **Palauta poistettu**. Valittu versio palautetaan luonnokseksi, joten sivusto muuttuu vasta, kun isä julkaisee sen. Säännöt ovat tiedostossa `lib/palautus.ts`, ja testit ajetaan komennolla `npm run test:palautus`. Kirjoitus on testattu `development`-datasettiin productionin oikealla kopiolla, myös luonnosmetatiedon (`_system`) kanssa. Ohjeet ovat docs/09:ssä (Varmuuskopiot) ja docs/17 §D:ssä.
- **Y8 blogin katkaisu:** tekninen osa tehty 7.10.: production on ajan tasalla (530 kirjoitusta, 1041 dokumenttia kommentteineen), ja blogiosoitteiden ohjaus toimii (308). Bloggerissa tehdään vielä muuttoilmoitus ja teeman skripti isän tunnuksilla (docs/14 §6, teksti valmiina). docs/09:n alkuun lisättiin huomautus "Uudet jutut kirjoitetaan Studioon".
- **Y19 osittain:** ohjausgeneraattori ja tarkistusskriptit (`verify:blogspot`, `verify:content`, `verify:migration`) lukevat Sanityä aina tokenilla. Ilman tokenia yksityinen datasetti palautti tyhjän tuloksen virheettä, ja generaattori ehti 7.10. ylikirjoittaa `lib/redirects.ts`:n lähes tyhjäksi (palautettu, ei commitoitu). Generaattori kieltäytyy nyt kirjoittamasta tiedostoa, jos Sanity palauttaa 0 dokumenttia.
- **Y11 ja Y35:** Studion ylimmäksi kohta **Tehtävät sinulle**: odottavat arvostelut, uudet kommentit (7 pv), julkaisemattomat muutokset, ajastetut uutiset ja tarkistettavat yhdessä listassa. Tarkistettaviin lisättiin sivut, tapahtumat ja galleria-albumit. Vaatii tarkistuksen -rasti näkyy vain migraation merkitsemissä dokumenteissa, ja sen ohje muistuttaa julkaisusta. Ensimmäinen ajo löysi productionista kolme julkaisematonta luonnosta (mm. "Suomi - Albania 03.10.2026").
- **Y12 ajastus:** kaikki uutishaut käyttävät jaettua ehtoa `NAKYVA_UUTINEN` (`sanity/lib/queries/julkaisu.ts`): tulevaksi päivätty uutinen odottaa piilossa listoissa, haussa, tunnisteissa, arkistossa, etusivulla (myös Pääjuttuna), sitemapissa ja edellinen- ja seuraava-linkeissä. Studion listassa merkintä *Ajastettu*. Productionissa 756/756 uutista näkyy kuten ennen.
- **Y16:** sivun Taulukot-kenttä näkyy nyt myös yleisellä sivupohjalla. Taulukkoprojektio on jaettu (`tilastoProjection`), ja taulukon muutos päivittää sivut webhookissa (`jalkapalloTilasto → sivu`).
- **Y24:** tyhjä osio (Tapahtumat, Galleria) piilotetaan valikosta, alatunnisteesta ja sitemapista ja merkitään noindexiksi (`lib/osiot.ts`, `npm run test:osiot`). Se palaa itsestään ensimmäisen julkaisun jälkeen. 19 kävijälle näkyvää tyhjätilatekstiä, jotka neuvoivat lisäämään sisältöä "Studiossa", kirjoitettiin kävijälle sopiviksi.
- **Vercelin build korjattu 7.10.:** `next/font/google` kaatoi Vercelin buildin (vercel/next.js#99114, Google palautti päätteettömiä fonttiosoitteita), joten pushatut muutokset eivät menneet tuotantoon. Fontit ovat nyt repossa (`app/fonts`, `next/font/local`), latauksen toiminta ennallaan. Tuotanto tarkistettu deployn jälkeen.
- **Y17 askel 1:** linkkikentät (valikko, etusivu, tekstin linkit, klubitoiminnan linkit) varoittavat keltaisella, jos sisäisessä osoitteessa ei ole sivua. Studio kysyy sen sivustolta (`sanity/lib/linkin-kohde.ts`), joten kaikki reitit ja ohjaukset ovat mukana. Kaikki productionin 48 sisäistä polkua tarkistettu: ei vääriä varoituksia.
- **Y21:** tietosuojasivun polku lukittu, ja lukittuja sivuja ei voi poistaa eikä piilottaa. Polkutarkistus kattaa koko polun (esim. klubi/toiminta/x, ottelut, blogspot), ja testi tarkistaa, että jokainen app-kansion reitti on varattu (`lib/sivupolku.ts`, `npm run test:sivupolku`).
- **Y28:** lehtileikkeen pelaajaksi voi valita vain Litmasen, ja se on valmiina uudessa leikkeessä.
- **Y39:** hallituksen jäsenellä on kenttä Nykyinen jäsen; Studiossa Nykyinen hallitus ja Entiset jäsenet. Uutisen Kirjoittaja-kenttä piilotettu (ei käytössä).
- **Y41 alku:** pelattu "Seuraava ottelu" piilotettu etusivun lomakkeelta. Datan siivousmigraatio myöhemmin.
- **Y43:** oppaan vanhentuneet kohdat korjattu (blogitunnisteet, kuvien pakkaus, tilastojen sijainti, Wepard, hallituksen vaihto, valikkoon lisääminen, lukitut sivut).

Avoimena on yhä (ei valittavissa lomakkeella): kuka on domainin rekisteröijä ja kuka siirtää DNS-vyöhykkeen ennen Zonerin irtisanomista (Y6), kuka kirjoitti 4.10. Albania-uutisen ja mitä Arvostelu-kategoria tarkoittaa, ja kuka täyttää hallituksen, yhteystiedot ja tapahtumat.

**Päätetty 8.10.2026 (docs/24 luku 6):**
- Tekninen tukihenkilö pysyy repossa nimettömänä, koska repo on julkinen GitHubissa. Dokumenteissa ja Studion teksteissä puhutaan vain "tukihenkilöstä" ilman nimeä tai yhteystietoja.
- Ulkoista valvontaa (UptimeRobot) ei oteta käyttöön, eikä hälytyksiä lähetetä kenellekään. Sivuston tila näkyy Studion Aloituksessa (Y33, docs/24 askel 7).

**Toteutettu vaiheessa 2 (docs/24):**
- **Askel 1, Y38 ja Y10:** Studion sanasto (`sanity/schemas/objects/sanasto.ts`): "Polku (slug)" → "Osoite sivustolla" ja "SEO" → "Hakukoneet ja jako" kymmenessä tyypissä, hakukonekenttien, ison yläkuvan, suodatinosoitteiden ja järjestyskenttien nimet selkokielisiksi. Uutisen ja sivun johdantokenttien (Tiivistelmä, Lyhenne, Ingressi) ohjeet kertovat, missä kukin näkyy; sivun Ingressi näkyy Studiossa vain, jos se on täytetty. Etusivun lohkon voi piilottaa rastilla poistamatta sitä (`piilota`), ja Klubin toiminta -lista on Studiossa samassa järjestyksessä kuin sivustolla. Dataa ei muutettu.
- **Askel 3, Y22 ja Y25:** Osioiden sivut (`lib/osiosivut.ts`): 30 koodireitin otsikko, johdanto (Tiivistelmä), hakukonetekstit ja jalkapalloarkiston 16 kortin teksti luetaan lukitulta `sivu`-dokumentilta, ja koodin teksti on varana. Studioon Klubi-ryhmä (Esittely, Toiminta, Hallitus, Palloveikkaus, Yhteystiedot) ja Osioiden sivut; "Sivun asetukset" on nyt "Sivuston asetukset", ja Sivut-lista näyttää vain omat sivut. Dokumentit luodaan skriptillä `npm run luo:osiosivut` (28 uutta productionissa, docs/24 P3); näkymä ja meta-kuvaukset eivät muutu.
- **Askel 4, Y17 askeleet 2–3 ja Y23:** Linkkiobjekti (`lib/linkki.ts`, `sanity/schemas/objects/linkki.ts`): jokainen linkki (valikko, etusivun pikalinkit ja napit, klubin toiminnan vuosilinkki, tekstin linkki) valitaan kolmesta vaihtoehdosta, Sivuston sivu (viittaus, seuraa osoitteen muutosta), Muu osoite tai Tiedosto (PDF, Word, Excel). Studio varoittaa julkaisemattomasta tai ajastetusta kohteesta ja Muu osoite -linkistä, jolle on parempi valinta. Alatunnisteen linkkisarakkeet johdetaan päävalikosta (`lib/navigaatio.ts`). Vanha data toimii sellaisenaan (kaksoisluku); linkit muunnetaan viittauksiksi askeleessa 5. Dataa ei muutettu.
- **Askel 5, Y17:n migraatio:** `npm run patch:linkit` (`scripts/patch-linkit.ts`, säännöt `scripts/lib/linkit-migraatio.ts`) muuttaa vanhat merkkijonolinkit linkkiobjekteiksi: sivuston oma polku, joka ratkeaa yksiselitteisesti julkaistuun ja näkyvään dokumenttiin, viittaukseksi (Sivuston sivu) ja kaikki muut vanhat linkit, myös tekstin ulkoiset linkit, ankkurit ja polut ilman dokumenttia, tyypiksi Muu osoite. Vanhat href-, url- ja ctaHref-arvot säilyvät (`--poista-vanhat` myöhemmin, docs/24 P11). Skripti simuloi muutokset ja pysähtyy, jos yhdenkään linkin osoite kävijälle muuttuisi, ja vertaa kirjoituksen jälkeen sivuston kyselyjen linkit. Developmentissa 8.10.2026: 19 dokumenttia, 53 arvoa (6 dokumentissa: 52 viittausta, 1 osoite) ja 21 tekstin linkkiä tyypiksi Muu osoite (13 dokumentissa); toinen ajo ei muuttanut mitään. Productioniin vasta P5:ssä.

---

## 1. Tiivistelmä

**Kokonaisarvio: isä pärjää arjessa yksin, mutta sivuston rakenteen muuttaminen, virheiden korjaaminen ja palveluiden jatkuvuus vaativat vielä kehittäjää.**
**Arvosana tänään: 5 / 10.** Arki onnistuu hyvin (noin 8/10): uutiset, ravintolat, ottelut, arvokisat ja moderointi. Sivuston rakenteen muuttaminen onnistuu heikosti (noin 3/10): linkit, ohjaukset, listasivujen tekstit, alatunniste ja arkiston osiot. Jatkuvuus on samoin heikoissa kantimissa (noin 3/10): tilaus, tilit, domain, palautus ja valvonta. Vaiheen 1 jälkeen arvio on noin 6,5, vaiheen 2 jälkeen noin 8 ja vaiheen 3 jälkeen 8,5–9. Täyttä kymppiä ei voi saavuttaa, koska ohjelmistopäivitykset, Vercel ja nimipalvelu vaativat aina teknistä osaamista (luku 5).

Tärkeimmät viestit:

1. **Arjen työ onnistuu jo ilman kehittäjää.** Studio on suomeksi ja suojaa yleisimmiltä virheiltä. Uusi uutinen, ottelu, tapahtuma, galleria, arvokisa, karsintataulukko, palloveikkauksen alasivu, Litmanen-leike ja ravintola-arvostelujen hyväksyntä onnistuvat muutamalla napsautuksella. Esimerkki: kävijän arvostelu, joka saapui 6.10. klo 9.12, oli hyväksytty ja ravintola luotu samana päivänä klo 18.33.
2. **Kiireellisin asia ei liity koodiin. Sanityn ilmainen Growth-kokeilu päättyy 26.10.2026 klo 16.30** (Y1). Jos mitään ei tehdä, tietokanta muuttuu julkiseksi, versiohistoria lyhenee kolmeen päivään, ja lomakkeiden kirjoitusoikeus voi lakata (Y2). Hallituksen pitää päättää ennen 26.10., maksetaanko noin 180–360 $ vuodessa vai tehdäänkö ilmaistasolle tarvittavat muutokset. Myös nimipalvelu (DNS), domain ja Vercel-tili ovat kehittäjän tai webhotellin varassa (Y5, Y6).
3. **Isä kirjoittaa uutiset yhä Blogspotiin, ja jokainen kirjoitus tarvitsee kehittäjän siirtämään sen sivustolle** (Y8). Tämä on arjen suurin riippuvuus kehittäjästä. Studiossa on kirjoitettu vain yksi uutinen. Korjaus edellyttää kolmea asiaa: sovitaan blogin sulkemispäivä, kuvasarjan lisääminen Studiossa tehdään yhtä helpoksi kuin blogissa (Y9), ja isän kanssa kirjoitetaan yksi juttu yhdessä.
4. **Sivuston "kehys" on yhä koodissa.** Linkit kirjoitetaan käsin, polun vaihto vaatii kehittäjän, ja 24 listasivun johdanto ja alatunniste ovat koodissa. Leipätekstiin ei voi lisätä PDF:ää, painiketta eikä kuvasarjaa (Y14–Y23). Korjaukset ovat Sanityn perusratkaisuja: viittauksella toteutettu linkki, lukitut osiosivut, ohjausdokumentti ja muutama uusi tekstilohko. Järjestyksellä on väliä: osiosivut ensin, sitten linkit ja alatunniste, sitten tekstilohkot ja lopuksi ohjaukset.
5. **Virheen korjaaminen ja vikojen huomaaminen vaativat yhä kehittäjää.** Yli kolme päivää vanhaa virhettä ei voi palauttaa Studiossa (Y32). Vioista ei tule hälytystä kenellekään (Y33). Molemmat voi siirtää Studioon: palautustoiminto varmuuskopiosta ja "Sivuston tila" -näkymä. Kehittäjää ei kuitenkaan voi poistaa kokonaan, joten tarvitaan nimetty tukihenkilö ja kirjallinen hätäohje (luku 5).

---

## 2. Mitä isä voi jo tehdä yksin

Taulukko perustuu tehtäväskenaarioihin. Tehtävät on käyty läpi koodia ja productionin dataa vasten.

| Tehtävä | Tila | Huomio |
|---|---|---|
| Uutinen, jossa tekstiä ja pari kuvaa | Onnistuu | Kuvasarja on hidas: kuva kerrallaan ja jokaiseen alt-teksti (Y9) |
| Uusi uutiskategoria | Onnistuu | Kategorioista puuttuu selitys, joten syntyy päällekkäisyyksiä (Y40) |
| Uutisen ajastus tulevalle päivälle | Ei onnistu | Tulevaksi päivätty uutinen näkyy heti (Y12) |
| Ottelu, Huuhkajien ottelu, merkinnät Klubi paikalla ja Vierasmatka | Onnistuu | |
| Seuran sarjan vaihto, esim. FC Lahti Ykkösliigaan | Ei onnistu | Sarjat on määritelty Vercelissä (Y29) |
| Tapahtuma ilmoittautumislinkillä | Onnistuu | Isossa Ilmoittaudu-painikkeessa ei voi tehdä (Y15) |
| Kuvagalleria-albumi | Onnistuu | Albumia ei voi näyttää uutisen sisällä (Y15) |
| Arvostelujen hyväksyntä, uusi ravintola, kommenttien moderointi | Onnistuu | Uusista arvosteluista ei tule ilmoitusta (Y33) |
| Litmanen-leike, uusi arvokisa (EM 2028), karsintataulukko | Onnistuu | |
| Palloveikkauksen uusi alasivu | Onnistuu | |
| Etusivun pääjuttu, ajastettu päättyminen, lohkojen järjestys | Onnistuu | "Piilota lohko" poistaa lohkon (Y38) |
| Valikon muokkaus | Vaikea | Polku kirjoitetaan käsin, eikä Studio tarkista, onko sivu olemassa (Y17) |
| Uusi tekstisivu | Onnistuu | Valikkoon lisääminen on vaikeaa, eikä sivu näy Klubi-osion välilehdissä (Y26) |
| Taulukko tavalliselle sivulle | Ei onnistu | Kenttä on lomakkeella, mutta taulukko ei näy sivulla (Y16) |
| PDF-liite (kokouskutsu, säännöt) | Ei onnistu | Y14 |
| Painike tai korostettu huomiolaatikko tekstissä | Ei onnistu | Y15 |
| Alatunnisteen linkit | Ei onnistu | Y23 |
| Listasivun esittelyteksti (esim. Tapahtumat) | Ei onnistu | Y22 |
| Hallitus- ja Toiminta-sivujen johdanto | Vaikea | Ominaisuus on olemassa, mutta piilossa (Y25) |
| Julkaistun sivun osoitteen korjaus | Ei onnistu | Vaatii kehittäjän tekemän ohjauksen (Y18) |
| Lyhytosoite esitteeseen (/jasenmaksu) | Ei onnistu | Y18 |
| Hallituksen vaihto | Vaikea | Opas neuvoo poistamaan jäsenen (Y39) |
| Tiedote jokaisen sivun yläreunaan | Ei onnistu | Y13 |
| Uusi jalkapalloarkiston osio tai tekstisivu arkiston alle | Ei onnistu | Kiertotie on "Muu tilasto" (Y27) |
| Uusi pelaajaosio Litmasen tapaan | Ei onnistu | Y28 |
| Virheen peruminen alle 3 päivän sisällä | Onnistuu | Versiohistoria (Free-tasolla) |
| Virheen peruminen yli 3 päivän jälkeen | Ei onnistu | Y32 |
| Logon vaihto | Ei onnistu | Tietoinen päätös, kirjataan oppaaseen (Y41) |
| Sivuston uudelleenjulkaisu, lokit, ympäristömuuttujat | Ei onnistu | Kehittäjän Vercel-tili (Y5) |
| Sanityn tilauksen maksaminen | Onnistuu ohjeella | Isä on organisaation Administrator (Y1) |
| Domainin uusinta | Vaikea | Maksaja ja tunnukset kirjaamatta (Y6) |

---

## 3. Löydökset teemoittain

Merkinnät: **vakavuus** on *estää* (isä ei pääse eteenpäin ilman kehittäjää), *hankaloittaa* (onnistuu kiertoteitse tai vaatii kehittäjää satunnaisesti) tai *pieni*. **Todennäköisyys** on *usein*, *joskus* tai *harvoin*. **Työmäärä** on kehittäjän arvio: *pieni* (alle päivä), *keski* (1–3 päivää) tai *suuri* (yli 3 päivää).

### A. Tilaus, tilit ja omistajuus

#### Y1. Sanityn Growth-kokeilu päättyy 26.10.2026 klo 16.30, eikä päätöstä ole tehty (estää · varma)
- **Mitä:** Projekti on 30 päivän Growth-kokeilussa: `planId "growth-trial-2023-10-19"`, `status "trialing"`, `trialUntil "2026-10-26T14:30:14Z"`. Jos mitään ei tehdä, projekti siirtyy automaattisesti Free-tasolle. Sanityn ohjeen mukaan silloin "Private datasets will become public" ja "all team members with non-admin roles will be converted to viewers". Lisäksi kommentit, tehtävät, ajastetut luonnokset ja AI Assist poistuvat käytöstä, ja versiohistoria lyhenee 90 päivästä 3 päivään. Dokumentaatio olettaa jo Free-tason (docs/09:41, docs/17:211). Hakusanoilla trial, Growth tai kokeilu ei löydy docs/-kansiosta mitään.
- **Missä:** Management API `GET /v2021-06-07/subscriptions/project/zyrukn4s` ja `/projects/zyrukn4s` (features: privateDataset, roleEditor, studioComments, sanityTasks, scheduledPublishing, maxRetentionDays 90). Sanityn ohjesivu docs/platform-management/growth-plan-trial. Yksityisyyden perustelut: docs/17:59-81.
- **Miksi isälle:** Kaikki, minkä hän ehtii oppia kokeilun aikana (kommentit Studiossa, ajastus, kuukauden versiohistoria), katoaa ilman ilmoitusta. Isän oma pääsy säilyy, koska hän on Administrator.
- **Ratkaisu:** Hallitus päättää ennen 26.10. Vaihtoehto A: Growth (sanity.io/manage → organisaatio → Billing), jolloin mikään ei muutu. Vaihtoehto B: Free-taso, jolloin Y2 ja Y3 tehdään ennen 26.10. Kummassakin tapauksessa päätös kirjataan docs/17:ään, merkitään kalenteriin ja testataan samana iltana (Y2). Opasta ei kirjoiteta kokeilun ominaisuuksien varaan ennen päätöstä.
- **Työmäärä:** pieni (päätös). Vaihtoehto B tuo lisäksi Y2:n ja Y3:n työt.
- **Lähteet:** SAN-1, TIL-1, TIL-6

#### Y2. Lomakkeiden kirjoitusoikeus voi muuttua lukuoikeudeksi, jolloin viisi toimintoa pysähtyy hiljaa (estää · joskus)
- **Mitä:** Robottitoken "Vercel - lomakkeet" on projektin jäsen roolilla Editor. Free-tasolla on vain roolit Administrator ja Viewer. Sanityn ohje ei kerro, muunnetaanko myös robottitokenit Viewereiksi. Jos muunnetaan, seuraavat lakkaavat toimimasta: (1) kommenttien ja veikkausten tallennus, (2) ravintola-arvostelujen vastaanotto, (3) arvosanojen laskenta webhookissa, (4) yöllinen huolto ja (5) viikkovarmuuskopio. Lukutoken on jo Viewer, joten sivuston näkyminen ei muutu.
- **Missä:** Management API `/projects/zyrukn4s/tokens`. `app/(public)/uutiset/_kommentit/actions.ts:70`, `app/(sovellus)/ravintolat/arvostele/actions.ts:228`, `app/api/revalidate/route.ts:48-60`, `app/api/huolto/route.ts:31`, `app/api/varmuuskopio/route.ts:34`.
- **Miksi isälle:** Isä saattaa huomata, että kommentteja ei enää tule. Varmuuskopioiden loppumista hän ei huomaa, koska hälytystä ei ole (Y33).
- **Ratkaisu:** Ennen 26.10. kysytään Sanityn tuelta tai tarkistetaan sanity.io/manage → API → Tokens, voiko Free-tason projektiin luoda kirjoittavan tokenin. Jos ei voi, valitaan Growth tai luodaan token roolilla, jota Free tukee, ja vaihdetaan se Verceliin ennen vanhan poistamista. Testi 26.10. illalla: lähetetään testikommentti, ajetaan `/api/varmuuskopio` käsin ja ajetaan `npm run e2e:arvioijasaanto`.
- **Työmäärä:** pieni
- **Lähteet:** TIL-2, SAN-1

#### Y3. Free-tasolla tietokanta on julkinen: varmuuskopiot ja kävijöiden lataamat kuvat ovat luettavissa (hankaloittaa · joskus, vain Free-tasolla)
- **Mitä:** Julkisesta datasetistä kuka tahansa voi lukea kaikki julkaistut dokumentit rajapinnan kautta. Niihin kuuluvat kaksi varmuuskopiota ja niiden latausosoitteet, ja varmuuskopioissa ovat myös sivulta piilotetut kommentit 12 viikon ajalta. Samoin luettavissa ovat kävijöiden arvostelukuvat (6 kpl) alkuperäisine tiedostonimineen sekä klubilaisten nimet (12). Luonnokset (`drafts.`) pysyvät suojassa. Kommenteissa ei ole sähköpostikenttää. Tietosuojaseloste ja docs/17 §A4 lupaavat yksityisyyttä, joka katoaa ilman ilmoitusta. Koodin kommentit väittävät jo nyt, että "dataset on julkinen" (`lib/varmuuskopio.ts:4`, `app/api/varmuuskopio/route.ts:19`). Tästä syystä varmuuskopio jättää luonnokset pois (Y32).
- **Missä:** Sanityn ohjesivu docs/content-lake/datasets ("private datasets revert to public if the trial ends"). `sanity/schemas/documents/kommentti.ts:18-60`, docs/17:59-81.
- **Miksi isälle:** Hallitus vastaa tietosuojasta. Seloste muuttuu virheelliseksi ilman, että kukaan muuttaa sitä.
- **Ratkaisu:** Jos jäädään Free-tasolle: varmuuskopiot tallennetaan Sanityn ulkopuolelle (GitHub Actionin artefakti tai yhdistyksen pilvikansio) tai piilotetut kommentit jätetään niistä pois. Piilotus korvataan poistolla. Hylätyt arvostelukuvat poistetaan heti, mikä on huollossa jo osin käytössä. docs/17 §A4 ja tietosuojaseloste päivitetään. Growth-tasolla muutoksia ei tarvita.
- **Työmäärä:** keski
- **Lähteet:** TIL-3, KEH-12

#### Y4. Kiintiöt: dokumenttiraja on projektikohtainen ja development vie siitä puolet, eikä API-kiintiön ylitystä voi ostaa lisää (estää · harvoin)
- **Mitä:** Sanityn mukaan dokumenttikiintiö lasketaan koko projektille kaikista dataseteistä yhteensä. Production sisältää 5569 dokumenttia (3848 ilman assetteja) ja development 5557 (3833). Free-tason ja nykyisen kokeilun raja on 10 000. Koska kirjoitukset toimivat, assetit eivät ilmeisesti kuulu laskentaan, jolloin käytössä on noin 7681/10 000. Kun raja täyttyy, isä ei voi luoda edes luonnosta. API-pyyntöjä saa Free-tasolla 250 000 kuukaudessa, eikä ylitystä sallita (`overageAllowed false`, ylityksestä HTTP 402). Ajonaikaiset haut ohittavat CDN:n (`sanity/lib/fetch.ts:71`), mutta Next Data Cache rajaa saman kyselyn enintään yhteen kertaan minuutissa (`fetch.ts:104`). Siksi ylitys on epätodennäköinen. Todellista kulutusta ei voitu lukea.
- **Missä:** `subscription.plan.resources` (documents 10000, apirequests 250000). Sanityn ohjesivu docs/platform-management/plans-and-payments. `sanity/lib/fetch.ts:71, 104`.
- **Miksi isälle:** Virheilmoitus olisi isälle käsittämätön, eikä hän voisi tehdä asialle mitään.
- **Ratkaisu:** Tarkistetaan sanity.io/manage → Usage. Development tyhjennetään tai pienennetään otokseksi julkaisun jälkeen (tästä päätetään). Hakusivuille `useCdn: true`. Huoltoraporttiin lisätään count(*) ja varoitus 80 %:n kohdalla (Y33). docs/09:n vianetsintään rivi "En voi luoda uutta dokumenttia → kiintiö täynnä".
- **Työmäärä:** pieni
- **Lähteet:** TIL-4, TIL-5, SAN-7, KEH-11, DATA-13

#### Y5. Vercel, GitHub ja salaisuudet ovat kehittäjän henkilökohtaisilla tileillä (estää · harvoin)
- **Mitä:** Vercel-projekti on kehittäjän Hobby-tilillä, johon ei voi lisätä jäseniä. Repo (veikkope/klubi) on julkinen ja henkilökohtainen. Yhdeksän ympäristömuuttujaa on tallessa vain Vercelissä, ja `CRON_SECRET` puuttuu `.env.example`-tiedostosta. Koko sivusto riippuu `SANITY_API_READ_TOKEN`-tokenista. Isä Administratorina näkee tokenit ja voi vahingossa poistaa ne. Hobby-tason ehto on "non-commercial personal use". Jos yhteystietoihin lisätään IBAN jäsenmaksuja varten, se voidaan tulkita maksujen pyytämiseksi. Hobby-tasolla lokit säilyvät tunnin, ja rajojen ylittyessä projekti pysäytetään 30 päiväksi.
- **Missä:** docs/17 §A3–A4, `.env.example:7-29`, vercel.com/docs/limits/fair-use-guidelines, `app/(public)/klubi/yhteystiedot/page.tsx:58,160`.
- **Miksi isälle:** Isä ei voi julkaista sivustoa uudelleen, palata edelliseen versioon, katsoa lokeja eikä vaihtaa salaisuutta.
- **Ratkaisu:** (1) Perustetaan klubille GitHub-organisaatio, jonka omistaja on isä tai yhdistys, ja siirretään repo sinne. (2) Päätetään, siirretäänkö Vercel Pro -tiimiin (240 $/v), jossa isä on jäsen, vai tehdäänkö kirjallinen hätäsiirtopaketti. Paketissa on muuttujien nimet, tieto siitä, mistä kunkin arvo saadaan uudelleen, ja docs/17 §A3:n vaiheet. Paketti säilytetään klubin salasanaholvissa. (3) Kaikki muuttujat `.env.example`-tiedostoon. (4) Oppaaseen ohje: "Älä poista API-tokeneita, joiden nimi alkaa Vercel –" ja "älä lisää IBANia ennen kuin Vercel-taso on tarkistettu".
- **Työmäärä:** pieni
- **Lähteet:** KEH-4, TIL-7, TIL-8

#### Y6. Domain ja nimipalvelu ovat webhotellin varassa, eikä uusinnan maksajaa ole kirjattu (estää · harvoin, määräaika)
- **Mitä:** DNS-vyöhyke on Zonerin webhotellin cPanelissa (ns1/ns2.int2000.net). Webhotelli on tarkoitus irtisanoa noin kuukauden kuluttua 4.10.2026 eli marraskuun alussa, eikä kirjallista vahvistusta vyöhykkeen säilymisestä ole saatu. Domain vanhenee 28.8.2027. Rekisteröijää ja maksajaa ei ole kirjattu. Opas puhuu yhä Wepardista.
- **Missä:** RDAP (expiration 2027-08-28), docs/17:188, 200-202, 253, docs/22 J7, docs/09:647.
- **Miksi isälle:** Jos vyöhyke katoaa, koko sivusto ja Studio katoavat verkosta.
- **Ratkaisu:** Vyöhyke siirretään rekisteröijän DNS-palveluun tai Verceliin ennen irtisanomista. Varmistetaan, että rekisteröijä on yhdistys. Uusinta laitetaan automaattiseksi yhdistyksen maksutavalla, ja kalenteriin muistutus heinäkuulle 2027. docs/17:ään taulukko: palvelu, omistaja, maksaja, hinta, uusinta ja tunnukset. Laskut ja varoitukset ohjataan yhdistyksen sähköpostiin.
- **Työmäärä:** pieni
- **Lähteet:** KEH-5, TIE-6, TIL-8

#### Y7. Isän rooli on dokumenteissa ristiriitainen (pieni · usein)
- **Mitä:** docs/09:26 sanoo Administrator, docs/17:20 sanoo Editor, ja `sanity.config.ts:90-94` piilottaa Kyselyt-työkalun (Vision) roolin perusteella olettaen sihteerin olevan Editor. Todellisuudessa isällä on molemmat roolit, ja 26.10. jälkeen Free-tasolla jää vain Administrator. Vision on vain kyselytyökalu, mutta Administrator pääsee sanity.io/managessa poistamaan datasetin, tokenit ja webhookin.
- **Missä:** `sanity.config.ts:90-94`, docs/09:26, docs/17:20, Management API members.
- **Miksi isälle:** Valikossa on kehittäjän työkalu, ja hallinnassa on vaarallisia painikkeita, joista oppaassa sanotaan vain "älä koske".
- **Ratkaisu:** Tasopäätöksen jälkeen kaikki kolme yhtenäistetään. Vision piilotetaan käyttäjätunnisteen perusteella eikä roolin mukaan. Free-tasolla oppaaseen: "Olet Administrator, älä avaa kohtia API, Datasets ja Members." Growth-tasolla isä on Editor ja kehittäjä Administrator.
- **Työmäärä:** pieni
- **Lähteet:** SAN-14, KAY-6, OPAS-3, TIL-9

### B. Arjen kirjoittaminen

#### Y8. Blogi on yhä isän pääkanava, ja jokainen kirjoitus tarvitsee kehittäjän siirron (estää · usein)
- **Mitä:** Migraation jälkeen Blogspotiin on kirjoitettu kolme juttua (27.9., 29.9. ja 1.10.). Kehittäjä on tuonut ne skriptillä 1–2 päivän viiveellä (`_createdAt` 28.9., 30.9. ja 3.10.). Productionin 753 uutisesta vain yksi on luotu Studiossa (4.10.). Blogissa tehty korjaus ei päivity sivustolle, koska synkka toimii vain `--missing`-tilassa (29.9. kirjoitusta muokattiin blogissa 1.10.). Kommentointi- ja veikkausominaisuus on valmis, mutta 29.9. jälkeen ei ole tullut yhtään kommenttia. docs/14 §6.4:n käyttöönottovaiheet ovat tekemättä (muuttoilmoitus, ohjausskripti), eikä docs/09 kerro, että tapa vaihtuu.
- **Missä:** Blogger-syöte, varmuuskopio production-2026-10-06, docs/14:243-264, docs/17:254, docs/09 (ainoa maininta rivillä 129).
- **Miksi isälle:** Hänelle ei ole kerrottu, että kirjoituspaikka vaihtuu. Kun hän kirjoittaa blogiin, juttu ei näy uudella sivustolla ilman kehittäjää.
- **Ratkaisu:** (1) Sovitaan katkaisupäivä. Ajetaan viimeinen synkka ja `verify:blogspot`, lisätään ohjausskripti ja julkaistaan kirjoitus "Klubin blogi on muuttanut". (2) docs/09:n alkuun laatikko: "Uudet jutut kirjoitetaan Studioon (Uutiset → +), ei enää blogiin." (3) Isän seuraava juttu kirjoitetaan yhdessä Studiossa, ja seuraava palloveikkaus tehdään Studion veikkauslomakkeella. (4) Kysytään isältä, miksi hän kirjoittaa blogiin: tottumus, puhelin vai kuvien helppous. Vastaus kertoo, riittääkö Y9.
- **Työmäärä:** pieni
- **Lähteet:** DATA-4, KAY-B1, KAY-B3, KEH-10, KAY-T5

#### Y9. Isän tyypillinen kuvajuttu on Studiossa selvästi hitaampi kuin blogissa (hankaloittaa · usein)
- **Mitä:** Blogikirjoitukset ovat lyhyitä (vuonna 2026 176–1219 merkkiä) ja kuvapainotteisia. Kuvateksti on 220/530 kirjoituksessa, ja 24 kirjoituksessa on vähintään 5 kuvaa (enimmillään 13). Studiossa kuva lisätään yksi kerrallaan, jokainen alt-teksti on pakollinen ja estää julkaisun, Lyhenne on pakollinen ja kansikuva on erillinen kenttä. Tekstiin lisätty kuva on aina koko palstan levyinen. Ainoasta Studiossa kirjoitetusta uutisesta puuttuu kansikuva, ja 29.9. tuodun jutun 8 kuvalla on sama alt-teksti.
- **Missä:** `sanity/schemas/objects/imageWithAlt.ts:15-20`, `uutinen.ts:72-87`, `portableText.ts:66-70`, `components/portable-text.tsx` (kuvan renderöinti aina samalla leveydellä), varmuuskopio: uutinen 16deaa03… ilman kansikuvaa.
- **Miksi isälle:** Juuri tämä kitka todennäköisesti pitää hänet blogissa.
- **Ratkaisu:** (1) Tekstiin uusi lohko "Kuvat (useita)": imageWithAlt-taulukko ruudukkona, johon useita kuvia voi raahata kerralla (osa Y15:tä, tehdään ensimmäisenä). (2) Kun kansikuva on tyhjä, käytetään leipätekstin ensimmäistä kuvaa. Jakokuvassa tämä logiikka on jo (docs/09:95-99). Kansikuvakenttään lisätään varoitus "näkyy uutislistassa ja somejaoissa". (3) Lyhenne muutetaan valinnaiseksi, ja varana käytetään ensimmäisen kappaleen alkua. (4) Harkitaan, voisiko uutisen leipätekstin kuvassa puuttuva alt olla varoitus virheen sijaan ja kuvateksti varana. CLAUDE.md:n mukaan alt-teksti on pakollinen, joten tästä päättää kehittäjä.
- **Työmäärä:** keski
- **Lähteet:** KAY-B2, DATA-15, RAK-8

#### Y10. Neljä päällekkäistä johdantokenttää, joista vain yksi näkyy (hankaloittaa · usein)
- **Mitä:** Uutisessa on Tiivistelmä, Lyhenne ja SEO-kuvaus, sivulla Tiivistelmä, Ingressi ja SEO-kuvaus. Sivusto näyttää jutun alussa Tiivistelmän ja käyttää Lyhennettä tai Ingressiä vain, jos Tiivistelmä on tyhjä. Opas sanoo päinvastoin (docs/09:71-72). Productionissa Tiivistelmä on 548/753 uutisessa ja 7/8 sivussa. 375 uutisessa Tiivistelmä ja Lyhenne eroavat toisistaan.
- **Missä:** `app/(public)/uutiset/[slug]/page.tsx:117` (`news.tiivistelma ?? news.excerpt`), `app/(public)/[...slug]/page.tsx:81`, `sivu.ts:135-143` ("Näkyy hero-alueella"), `contentMeta.ts:19-31`.
- **Miksi isälle:** Hän korjaa Lyhenteen, mutta jutun alku ei muutu, joten hän päättelee julkaisun epäonnistuneen.
- **Ratkaisu:** Kentät yhdistetään yhdeksi. Patch-skripti listaa ensin 375 eroavaa uutista TSV-tiedostoon (kuivaharjoitus), ja sen jälkeen päätetään, kumpi teksti jää. Yhdistetty kenttä syöttää sekä jutun alun että listan. SEO-kentät siirretään suljettuun fieldsetiin. Varmuuskopio otetaan ennen patchia.
- **Työmäärä:** keski
- **Lähteet:** KAY-1

#### Y11. Julkaisematon muutos katoaa Tarkistettavat-listalta, eikä lista kata kaikkia tyyppejä (hankaloittaa · joskus)
- **Mitä:** 4.10. vuoden 2006 uutisesta otettiin pois rasti "Vaatii tarkistuksen", mutta muutosta ei julkaistu. Julkaistussa versiossa lippu on yhä päällä, mutta luonnos putoaa listalta (`structure.ts:94`). Julkaisemattomille muutoksille ei ole omaa listaa. Tarkistettavat-lista ei kata sivuja, tapahtumia eikä gallerioita (`structure.ts:32-41`), joten tietosuojaselosteen lippu ei näy siellä. Kuudelta ravintolalta (amarillo-flamingo, burger-king-mantsala, factory-kamppi, heila-kauppahalli, love-berlin-doner, nonni) puuttuu syy. Migraation "Vaatii tarkistuksen" -rasti näkyy myös jokaisessa uudessa dokumentissa (`contentMeta.ts:80-90`, ei hidden-ehtoa).
- **Missä:** `sanity/structure.ts:32-41, 92-96`, `contentMeta.ts:67-91`. Varmuuskopio: needsReview 42–43 kpl, joista 6 ilman syytä.
- **Miksi isälle:** Hän luulee käsitelleensä dokumentin, vaikka sivusto näyttää vanhaa. Uuden uutisen rasti hämmentää: pitäisikö se rastia?
- **Ratkaisu:** Uusi lista "Julkaisemattomat muutokset" (`_id in path("drafts.**") && _type != "sanity.previewUrlSecret"`). Tarkistettaviin lisätään sivu, tapahtuma ja galleriaAlbumi. needsReview-kenttään `hidden: ({value}) => !value` ja kuvaukseen "Paina lopuksi Julkaise". Kehittäjä kirjoittaa syyn kuudelle ravintolalle tai poistaa liput. Vuosien 2006–2007 otsikkoehdotukset voidaan hyväksyä massana isän luvalla. Tietosuojan vahvistus viedään hallituksen asialistalle.
- **Työmäärä:** pieni
- **Lähteet:** DATA-10, KAY-T3, KAY-4, DATA-5, KAY-5

#### Y12. Uutista ei voi ajastaa: tulevaksi päivätty uutinen näkyy heti (hankaloittaa · joskus)
- **Mitä:** Sanityn ajastetut luonnokset ja Content Releases eivät kuulu Free-tasoon. Kokeilun ajastus katoaa 26.10. Uutisten suodattimessa (`sanity/lib/queries/uutiset.ts:99`) ei ole ehtoa `publishedAt <= now()`.
- **Miksi isälle:** Etukäteen tehty vuosikokouskutsu, jonka päiväys on ensi maanantai, näkyy sivustolla heti.
- **Ratkaisu:** uutinenFilteriin `&& dateTime(publishedAt) <= dateTime(now())`, jolloin ehto koskee listaa, hakua, tunnisteita, edellinen- ja seuraava-linkkejä, sitemapia ja etusivua. publishedAt-kenttään ohje ja Ajastettu-merkki (Y37). Cronia ei tarvita, koska `revalidate: 60` tuo jutun näkyviin noin minuutissa. Toimii Free-tasolla.
- **Työmäärä:** pieni
- **Lähteet:** SAN-6

#### Y13. Koko sivuston tiedotebanneria ei ole (hankaloittaa · joskus)
- **Mitä:** Jokaisen sivun yläreunaan ei voi lisätä riviä, esimerkiksi "Vierasmatka peruttu" tai "Vuosikokous 15.3.". Lähin keino on etusivun Pääjuttu, joka näkyy vain etusivulla ja vaatii julkaistun uutisen.
- **Missä:** grep `banneri|tiedotepalkki|announcement` → ei osumia, `etusivu.ts:26-43`.
- **Ratkaisu:** Navigaatio-singletoniin objekti `tiedote`: käytössä, teksti (enintään 140 merkkiä), linkki (Y17), sävy ja "Näkyy asti". Banneri poistuu itsestään samaan tapaan kuin Pääjuttu. Renderöidään (public)-layoutiin, ja "näkyy asti" tarkistetaan renderöinnissä.
- **Työmäärä:** pieni
- **Lähteet:** SKE-7

### C. Sisällön rakentaminen tekstieditorissa

#### Y14. PDF-liitettä ei voi lisätä mihinkään (hankaloittaa · joskus)
- **Mitä:** Leipäteksti (portableText) sallii vain tekstin, kuvan, kokoonpanon ja YouTube-videon. Skeemassa ainoa tiedostokenttä on varmuuskopion (`varmuuskopio.ts:29`). Productionin kaksi tiedostoa ovat varmuuskopioita. Vanha sivusto ei ilmeisesti julkaissut liitteitä: 25 tekstilinkissä ei ole yhtään PDF- tai Drive-linkkiä, ja blogissa on yksi PDF-linkki. Tarve on siis odotettu, ei havaittu.
- **Missä:** `sanity/schemas/objects/portableText.ts:63-70`, `tapahtuma.ts:89-101`.
- **Miksi isälle:** Vuosikokouskutsu, säännöt ja toimintakertomus ovat yhdistyksen sihteerin perustehtäviä. Ainoa kiertotie on ladata tiedosto toiseen palveluun ja kirjoittaa linkki käsin.
- **Ratkaisu:** Yksi jaettu `liite`-objekti (file, `accept: ".pdf,.docx,.xlsx"`, pakollinen otsikko). Se tulee leipätekstiin latauskorttina, jossa näkyvät tiedostotyyppi ja koko, ja Y17:n linkkiobjektiin vaihtoehdoksi "Tiedosto". Runko-projektioon lisätään haara `asset->{url, extension, size, originalFilename}`. Oppaaseen: liitteet ovat julkisia osoitteensa kautta, joten henkilötietoja (pöytäkirjat, jäsenluettelot) ei liitetä. Toimii Free-tasolla.
- **Työmäärä:** pieni
- **Lähteet:** SKE-1, SAN-3, RAK-2, OPAS-4

#### Y15. Tekstistä puuttuvat painike, huomiolaatikko, kuvasarja, taulukko ja upotus. Sivulle ei kuitenkaan tehdä page builderia (hankaloittaa · usein)
- **Mitä:** Isä ei voi lisätä Ilmoittaudu-painiketta, laatikkoa "Jäsenmaksu 2027: 25 €", kuvasarjaa, pientä taulukkoa eikä karttaa. Projektissa on valmis taulukkoeditori, mutta sitä käytetään vain jalkapalloTilastossa. Etusivun lohkot on määritelty etusivu.ts:ään eikä niitä voi käyttää muualla.
- **Ristiriita ratkaistu:** Ehdotukset SAN-4 (page builder sivulle) ja RAK-12/RIS-2 (lohkot tekstiin) olivat vastakkain. Data puoltaa lohkoja tekstiin: kaikki 8 sivua ovat pelkkää leipätekstiä, isä osaa jo tekstieditorin, ja etusivun lohkot hämmentävät jo nyt (Y38). Lohko kirjoitetaan kerran ja toimii jokaisessa tyypissä, jossa laajennettu teksti on käytössä.
- **Rajaus (tärkeä):** Jaettua portableTextiä käytetään 11 skeemassa, myös taulukon johdannossa, ravintola-arviossa ja lehtileikkeessä. Jos lohkot lisätään sinne, "Taulukko"-lohko ilmestyy taulukon omaan johdantoon, eikä kaikkia käyttöpaikkoja renderöidä. Siksi tehdään erillinen tyyppi `rikasSisalto`, jota käyttävät vain sivu, uutinen, tapahtuma ja klubiToiminta. Testi varmistaa, että jokaiselle jäsenelle on renderöijä.
- **Missä:** `portableText.ts:63-70`, `components/portable-text.tsx`, `sanity/lib/queries/kuvat.ts:29` (runko-fragmentti, 24 käyttöä), `etusivu.ts:146-300`, `sivu.ts:144-163`.
- **Ratkaisu, järjestyksessä:** (1) kuvasarja (Y9) ja liite (Y14), (2) huomiolaatikko (`nosto`: sävy ja lyhyt teksti) ja painike (teksti ja Y17:n linkkiobjekti, vasta linkkiobjektin jälkeen), (3) taulukko (viittaus jalkapalloTilasto-dokumenttiin ja olemassa oleva taulukkoeditori, ei `@sanity/table`-pluginia), (4) upotus vain sallitusta listasta (YouTube, Vimeo, Google Maps, Google Forms) ja muille osoitteille linkkikortti. Jokaiselle lohkolle suomenkielinen esikatselu, ikoni ja `options.insertMenu`-ryhmät. Ei sarakeasetteluja, taustavärejä eikä vapaata HTML:ää. Kumppanilogot (SKE-15) hoituvat kuvasarjalla, kunnes tarve on todellinen.
- **Työmäärä:** keski (kaikki yhteensä suuri, joten tehdään vaiheittain)
- **Lähteet:** SKE-2, SAN-3, SAN-4, RAK-4, RAK-9, RAK-11, RAK-12, RAK-14, RIS-2, SKE-15

#### Y16. Sivun Taulukot-kenttä ei näy tavallisella sivulla (estää · joskus)
- **Mitä:** Jokaisessa Sivu-lomakkeessa on kenttä Taulukot, jonka ohje sanoo "Sivulla näytettävät taulukot". Yleinen sivupohja ei kuitenkaan hae eikä näytä kenttää. Taulukot näkyvät vain Klubi-sivuilla ja palloveikkauksen alasivuilla (12, 1 ja 21 taulukkoa productionissa).
- **Missä:** `sivu.ts:150-159`, `sanity/lib/queries.ts:50-64` (sivuWithAncestorsQuery ilman tilastot-kenttää), `app/(public)/[...slug]/page.tsx:137-149`, `klubi/_components/klubi-sivu.tsx:119-125`.
- **Miksi isälle:** Julkaisu onnistuu ilman virhettä, mutta taulukkoa ei näy. Tämä on hiljainen virhe.
- **Ratkaisu:** `tilastot[]->` lisätään kyselyyn jaettuna fragmenttina (klubi.ts:54-70), ja StatSections renderöidään catch-all-sivulla bodyn alla.
- **Työmäärä:** pieni
- **Lähteet:** SKE-4, RAK-1

### D. Linkit, polut ja ohjaukset

#### Y17. Linkit kirjoitetaan käsin, eikä niiden kohdetta tarkisteta (hankaloittaa · joskus)
- **Mitä:** Päävalikko, alavalikot, etusivun pikalinkit, esittely- ja arkistonostojen napit, klubin toiminnan vuosilinkit ja leipätekstin linkit ovat merkkijonoja. `tarkistaLinkki` hyväksyy minkä tahansa /-alkuisen polun (`lib/linkki.ts:29-30`). Productionissa on 75 merkkijonolinkkiä: 55 sisäistä ja 20 ulkoista. Sisäisistä 38 osoittaa dokumenttiin ja 17 koodin reittiin, jolla ei ole dokumenttia, kuten /ottelut ja /jalkapalloarkisto/mestarit. Dokumenttiin osoittavat linkit ovat vain viidessä dokumentissa: navigaatio, etusivu, sivu-klubi (9 linkkiä toimintasivuille), klubiToiminta-matkailu (23 linkkiä uutisiin) ja yksi uutinen. Kaikki toimivat nyt. Kyse on riskistä, ei nykyisestä rikkinäisyydestä. Redirect-generaattori ei lue linkkejä (`scripts/generate-redirects.ts:9-14`), joten muutos ei vaikuta 301-ohjauksiin.
- **Missä:** `navigaatio.ts:28, 49`, `etusivu.ts:72, 228, 275`, `klubiToiminta.ts:114-130`, `portableText.ts:31-58`, `lib/linkki.ts`.
- **Miksi isälle:** Uuden sivun lisääminen valikkoon vaatii, että hän tietää polun ulkoa. Kirjoitusvirhe (/klubi/histora) menee läpi. Jos hän muuttaa matkakuvauksen polkua, 23 linkkiä Matkailu-sivulta katkeaa hiljaa.
- **Ratkaisu, kolmessa askeleessa:**
  1. **Heti, ilman migraatiota:** linkkiValidointiin asynkroninen varoitus, joka tarkistaa `context.getClient`-kyselyllä, löytyykö polulle dokumentti tai koodireitti: "Sivustolla ei ole sivua osoitteessa /…".
  2. **Jaettu `linkki`-objekti:** radiovalinta Sivuston sivu / Ulkoinen osoite / Tiedosto. Sivu on viittaus (sivu, uutinen, tapahtuma, ravintola, klubiToiminta, arvokisa, galleriaAlbumi, stadion, pelaaja) asetuksella `options.disableNew`, ja ankkuri on valinnainen. Href lasketaan koodissa `documentHref`-funktiolla, ei GROQ:ssa, jotta reittisäännöt pysyvät yhdessä paikassa. Viittaus säilyy, vaikka kohteen polku muuttuu, ja Sanity estää poistamasta dokumenttia, johon viitataan. **Edellytys:** valikon 13 koodireittiä tarvitsevat ensin dokumentin (Y22). Ilman niitä linkit on pidettävä merkkijonoina.
  3. **Leipätekstiin annotaatio `sisainenLinkki`** nykyisen linkin rinnalle. Viittaus puretaan runko-fragmentissa (24 käyttöä) ja `ravintolat.ts:416`:ssa.
  Migraatio: patchataan 5 dokumenttia (38 arvoa) varmuuskopion jälkeen. Ensin deploy, joka lukee sekä vanhaa että uutta kenttää, sitten patch ja lopuksi vanha kenttä piiloon deprecated-merkinnällä (malli `navigaatio.ts:32-40`). Ulkoiset 20 linkkiä ja 3 ankkurilinkkiä jäävät ennalleen.
- **Työmäärä:** pieni (askel 1) + keski (askeleet 2–3)
- **Lähteet:** SKE-5, SAN-2, LPO-4, LPO-6, LPO-7, KAY-11, RAK-5, TIE-1, TIE-2, TIE-3, TIE-4

#### Y18. Polun vaihto ei luo ohjausta, eikä isä voi tehdä ohjausta itse (estää · harvoin)
- **Mitä:** Kun julkaistun dokumentin polku muuttuu, Studio sanoo: "Palauta vanha polku, tai pyydä kehittäjää lisäämään ohjaus ennen julkaisua" (`contentMeta.ts:122`). Ohjaukset ovat vain `next.config.ts:62-71`:ssa ja generoidussa `lib/redirects.ts`-tiedostossa (730 sääntöä), jotka luetaan buildin aikana. Build ei generoi tiedostoa (`package.json:8` "next build"). Generaattori lukee vain dokumentit, joilla on legacyUrl, joten isän omille uutisille ei synny ohjausta edes kehittäjän ajamana. Studiossa ei ole ohjaustyyppiä, eikä lyhytosoitetta (/jasenmaksu) voi tehdä. Vercelin raja on 1024 ohjausta, ja 732 on käytössä, joten Sanityn ohjauksia ei voi lisätä next.configiin. Valmis pienoismalli on olemassa: `uutisKategoria.aiemmatPolut` luetaan ajonaikaisesti (`sanity/lib/queries/kategoriat.ts:20`).
- **Missä:** `contentMeta.ts:111-125`, `scripts/generate-redirects.ts:390-393`, reittien suorat `notFound()`-kutsut (`[...slug]/page.tsx:72`, `uutiset/[slug]:101`, `tapahtumat/[slug]:96`, `ravintolat/[slug]:127`, `klubi/toiminta/[slug]:81`), docs/09:612-616.
- **Miksi isälle:** Kirjoitusvirheen korjaaminen osoitteesta tai sivun uudelleennimeäminen on tavallista ylläpitoa, mutta nyt se vaatii kehittäjän.
- **Ratkaisu:**
  1. **Automaattinen ohjaus webhookilla:** reititettäviin tyyppeihin kenttä `aiemmatPolut` (readOnly). Webhookin projektioon lisätään `"vanhaSlug": before().slug.current`. Kun vanhaSlug eroaa uudesta, `app/api/revalidate/route.ts` lisää sen kenttään. Reitillä on jo kirjoittava client (rivit 48-54). Tämä kattaa myös skripti- ja API-muutokset, eikä Studioon tarvita omaa julkaisutoimintoa.
  2. **Dokumenttityyppi `ohjaus`** (vanha polku, kohde Y17:n linkkiobjektina, muistiinpano) lyhytosoitteita ja yhdistettyjä sivuja varten. Lähde-kenttä varoittaa, jos polku on jo olemassa tai jos next.configin ohjaus ajaisi sen ohi.
  3. **Haku vain 404-haarassa:** yhteinen apuri kutsutaan ennen `notFound()`-kutsua catch-all- ja dynaamisissa reiteissä, ja se käyttää välimuistia (tagi `ohjaus`). Proxy.ts-tiedostoa ei tehdä, jotta jokainen pyyntö ei kuormita Sanityä.
  4. Polkuvaroitus muutetaan muotoon "Vanha osoite ohjataan automaattisesti uuteen", ja docs/09:612-616 päivitetään.
- **Työmäärä:** keski (1 ja 3) + keski (2)
- **Lähteet:** SKE-6, LPO-1, LPO-2, LPO-12, KEH-1, KAY-15, RAK-6, RAK-13, OPAS-2, TIE-5

#### Y19. Vanhojen .htm- ja blogiosoitteiden ohjaukset ovat jäätyneet buildin hetkeen, ja niiden generointi on hauras (hankaloittaa · joskus)
- **Mitä:** 957 dokumentilla on legacyUrl ja 530:lla blogspot-polku. Niiden kohteet ovat kiinteitä polkuja, esimerkiksi `lib/redirects.ts:60` /jouluruokailu.htm → /klubi/toiminta/jouluruokailu. Jos isä muuttaa sluggia, vanha osoite ohjaa vanhaan polkuun, joka antaa 404:n. Generaattori lukee oletuksena development-datasettiä (`generate-redirects.ts:4, 389`), vaikka isä muokkaa productionia. Generaattorin syötteet `data/crawl-status.tsv`, `data/manual-redirects.csv` ja `data/normalized/blogspot-map.json` eivät ole gitissä (`.gitignore:57`, `git ls-files data`). Kun vanha sivusto poistuu, uusi kehittäjä ei pysty generoimaan ohjauksia uudelleen.
- **Miksi isälle:** Vanhat Google-tulokset ja jaetut linkit rikkoutuvat, eikä kukaan huomaa sitä.
- **Ratkaisu:** Lyhyellä aikavälillä Y18:n `aiemmatPolut` korjaa ketjun, koska 308 vie vanhaan polkuun ja reitti ohjaa siitä uuteen. Heti: generaattorin oletukseksi production (lukeminen on turvallista) ja syötteet commitoidaan, koska niissä ei ole henkilötietoja. Pitkällä aikavälillä legacyUrl- ja blogspot-ohjaukset ratkaistaan ajonaikaisesti samassa 404-haarassa. Mallia on jo `app/blogspot/[[...polku]]/route.ts`:ssa. Erikoissäännöt jäävät staattisiksi.
- **Työmäärä:** pieni (heti) + keski (ajonaikainen)
- **Lähteet:** LPO-3, LPO-10, KEH-1, KEH-14

#### Y20. Poisto, Peru julkaisu ja Kopioi eivät varoita vanhoista osoitteista (pieni · harvoin)
- **Mitä:** 1487 dokumentilla on legacyUrl, muutLegacyUrlit tai blogspot-polku. Tavallisten tyyppien Poista, Peru julkaisu ja Kopioi ovat oletusmuotoisia (`sanity.config.ts:29-59`). Poisto saa staattisen ohjauksen antamaan heti 404:n. Kopioi siirtää vanhan osoitteen uuteen dokumenttiin, ja sen jälkeen generaattori ratkaisee kilpailun tyyppien etusijalla (`generate-redirects.ts:244`). Opas kieltää Kopioin käytön (docs/09:205), mutta toiminto on yhä käytettävissä.
- **Ratkaisu:** Y17:n viittaukset estävät poiston suurimmalta osalta. Poistoon ja Peru julkaisuun kääre, joka varoittaa vanhasta osoitteesta ja ehdottaa piilottamista. Kopioi korvataan toiminnolla "Kopioi pohjaksi", joka tyhjentää kentät legacyUrl, muutLegacyUrlit, blogspot, aiemmatPolut ja slug. **Ei** legacyUrl-uniikkiusvalidointia: 106 vanhaa osoitetta on tarkoituksella yhteisiä (esim. /kommentit2006.htm 11 uutisella).
- **Työmäärä:** keski
- **Lähteet:** LPO-5, LPO-9, DATA-7

#### Y21. Tietosuojasivun polkua ei ole lukittu, eikä varattujen polkujen lista ole täydellinen (pieni · harvoin)
- **Mitä:** Alatunniste (`footer.tsx:155`), kommenttilomake (`kommentti-lomake.tsx:262`) ja arvostelulomake (`review-form.tsx:669`) linkittävät kiinteästi osoitteeseen /tietosuoja. Sivu on tavallinen sivu-dokumentti, eikä sitä ole `KOODIIN_SIDOTUT_SIVUT`-listassa (`lib/path.ts:123-128`). Isä voi nimetä polun uudelleen tai poistaa sivun, jolloin lomakkeiden tietosuojalinkki rikkoutuu. Varattujen polkujen listasta (`sivu.ts:23-33`) puuttuvat `ottelut` ja `blogspot`, ja validointi tarkistaa vain ensimmäisen polun osan. Sivu polulla klubi/yhteystiedot tai klubi/toiminta/x hyväksytään, mutta se ei näy koskaan.
- **Ratkaisu:** "tietosuoja" lisätään KOODIIN_SIDOTUT_SIVUT-listaan, jolloin polku lukittuu automaattisesti. Tarkistus laajennetaan koskemaan koko polkua ja lista johdetaan app-reiteistä. Poikkeuksina sallitaan lukitut sivut ja klubi/palloveikkaus/*. Skriptitesti varmistaa, että uusi koodireitti ei jää listalta pois. Suomenkielinen virheilmoitus: "Tämä osoite on sivuston oma osio – valitse toinen polku."
- **Työmäärä:** pieni
- **Lähteet:** KOV-4, LPO-8, SKE-13

### E. Sivuston kehys: koodiin kirjoitetut tekstit ja rakenne

#### Y22. 24 listasivun otsikko, johdanto ja hakukonekuvaus ovat koodissa (estää · joskus)
- **Mitä:** Johdanto on kovakoodattu vakio 24 sivutiedostossa, ja kahdessa muussa on kovakoodattu pelkkä meta-kuvaus. Sama teksti menee hakukoneille ja JSON-LD:hen. Esimerkiksi Tapahtumat-sivun teksti luettelee "vuosikokouksen, vapunvieton, mölkkyturnauksen, jouluruokailun" (`tapahtumat/page.tsx:24-27`).
- **Ristiriita ratkaistu:** Osa tutkimuksista laski sivuja 8, osa 24. Luku 8 on isokirjaimisten `const LEAD` -vakioiden määrä, ja siitä puuttuvat 16 sivua, joissa vakio on kirjoitettu `const lead`: galleria ja 15 jalkapalloarkiston sivua. Oikea luku on 24 näkyvää johdantoa ja 2 pelkkää meta-kuvausta (`klubi/yhteystiedot/page.tsx:29`, `ravintolat/page.tsx:98-101`).
- **Missä:** esim. `uutiset/page.tsx:42`, `ottelut/page.tsx:19`, `galleria/page.tsx:19`, `jalkapalloarkisto/mestarit/page.tsx:23` (koko lista RIS-1:ssä). docs/22:174 kirjasi ongelman korjaamattomana.
- **Miksi isälle:** Hän ei voi korjata vanhentunutta tekstiä eikä parantaa hakukonekuvausta.
- **Ratkaisu:** Käytetään olemassa olevaa mallia. Klubi-sivut hakevat jo tekstinsä lukitulla polulla olevasta sivu-dokumentista (`lib/path.ts:119-128`, `sivu.ts:97`), ja sitemap jättää ne pois (`app/sitemap.ts:235`). KOODIIN_SIDOTUT_SIVUT laajennetaan listasivuihin ja varattujen polkujen tarkistus sallii ne. Dokumentit luodaan kiinteillä _id:illä `--missing`-ajolla, ja niiden teksteiksi täytetään nykyiset vakiot, jotka jäävät varatekstiksi. Listasivuilla piilotetaan kentät, joilla ei ole vaikutusta (hero, tilastot). Studioon tulee ryhmä "Osioiden etusivut", jossa jokainen on `S.document().documentId(...)`, joten isä ei voi luoda niitä uudelleen eikä poistaa. Näistä dokumenteista tulee samalla valikon viittauskohteita (Y17). KOV-1 ehdotti erillistä `osiosivu`-tyyppiä. Se toimisi myös, mutta sivu-tyyppi ei tuo isälle uutta lomaketta ja hyödyntää valmista reitityslogiikkaa. Tyhjätilateksti (Y24) ja arkiston korttikuvaus (Y27) voidaan lisätä samoihin dokumentteihin. Kevyempi vaihtoehto: siirretään ensin vain Uutiset, Tapahtumat, Ottelut, Galleria ja arkiston etusivu, ja arkiston 15 alasivua myöhemmin.
- **Työmäärä:** keski
- **Lähteet:** KOV-1, SKE-11, SAN-5, KAY-12, RAK-7, RIS-1

#### Y23. Alatunnisteen linkit ovat koodissa eivätkä seuraa valikkoa (hankaloittaa · joskus)
- **Mitä:** Sarakkeet Jalkapallo ja Klubi ja niiden 8 linkkiä (`components/layout/footer.tsx:20-39`), ©-rivi sekä linkit Tietosuojaseloste ja Ylläpito (`:155-158`) ovat kiinteitä. Alatunniste linkittää Tapahtumiin ja Kuvagalleriaan, joissa productionissa on 0 dokumenttia. Isä ei voi poistaa näitä linkkejä. Nimet ovat jo kahdessa paikassa: alatunnisteessa lukee "Klubista", koodin varavalikossa "Klubi" (commit 508e100, `lib/defaults.ts:33`). Productionin valikossa lukee nyt "Klubista", joten kävijä ei näe ristiriitaa juuri nyt.
- **Miksi isälle:** Kun hän lisää valikkoon uuden osion tai nimeää kohdan uudelleen, alatunniste ei muutu.
- **Ratkaisu:** Navigaatio-singletoniin välilehti "Alatunniste": `sarakkeet[] {otsikko, linkit[] {teksti, linkki}}` Y17:n linkkiobjektilla. Kertaskripti esitäyttää sen nykyisillä arvoilla (setIfMissing), ja koodin lista jää varalle. Erillistä footer-singletonia ei tehdä, jotta asetukset pysyvät yhdessä paikassa. Kevyempi vaihtoehto, jos isä ei halua muokata alatunnistetta erikseen: alatunniste johdetaan päävalikosta ja siihen tulee kiinteät lisälinkit. Tietosuojalinkki: Y21.
- **Työmäärä:** pieni (Y17:n jälkeen)
- **Lähteet:** KOV-2, SKE-3, LPO-11, RAK-7, TIE-3, DATA-2

#### Y24. Tyhjät osiot näkyvät kävijälle, ja osa tyhjätiloista puhuu "Sanity Studiosta" (hankaloittaa · usein)
- **Mitä:** Productionissa on 0 hallituksen jäsentä, 0 tapahtumaa ja 0 albumia. Yhteystiedoista on täytetty vain kaupunki "Lahti": sähköposti, osoite, Y-tunnus, IBAN ja some puuttuvat. Tyhjätilat on kirjoitettu koodiin. Galleria (`galleria/page.tsx:85`), Toiminta (`klubi/toiminta/page.tsx:101`) ja Klubi (`klubi/page.tsx:126`) neuvovat kävijää lisäämään sisältöä "Sanity Studiossa". Sama teksti on myös `uutiset/page.tsx:288`:ssa, `ravintolat/page.tsx:313`:ssa ja `uutiset/tunnisteet/page.tsx:78`:ssa. Tämä on vastoin `empty-state.tsx:4-7`:n omaa periaatetta. docs/09:578-588:n "Täytä itse" -listasta on productionissa tehty vain etusivun taustakuva. Esittely-lohkosta puuttuu kuva, ja ravintolalohkon otsikossa lukee "ravintola arvostelut" ilman yhdysmerkkiä.
- **Miksi isälle:** Sivusto näyttää keskeneräiseltä, eikä klubiin saa yhteyttä sivuston kautta. Lomakkeiden virheviestit eivät pysty kertomaan osoitetta (`lib/yhteystiedot.ts:28-31`).
- **Ratkaisu:** Kehittäjä kirjoittaa tyhjätilat heti kävijälle sopiviksi. Myöhemmin teksti on Y22:n osiosivun kenttä, ja osiosivuun tulee kytkin "Piilota osio valikosta ja alatunnisteesta". Sitemap ja alatunniste jättävät tyhjät osiot pois. Isä täyttää yhteystiedot ja hallituksen (Y35:n Tehtävät-kohta ohjaa). Tietosuojaselosteen sähköposti tarkistetaan samalla hallituksen vahvistuksella. Sähköposti-kentän validointi muutetaan virheeksi.
- **Työmäärä:** pieni
- **Lähteet:** KOV-3, DATA-1, DATA-2, DATA-12, KAY-T2

#### Y25. Studion valikko ei vastaa Klubi-osion rakennetta, ja Hallitus- ja Toiminta-sivujen johdannot ovat piilossa (hankaloittaa · joskus)
- **Mitä:** Sivustolla Klubista-osio sisältää kohdat Esittely, Toiminta, Hallitus, Palloveikkaus ja Yhteystiedot. Studiossa ne ovat hajallaan: tasaisessa Sivut-listassa (mukana myös tietosuoja, toriparkki ja english), Klubin toiminnassa, Hallituksessa ja Sivun asetuksissa. Hallitus- ja Toiminta-sivut hakevat johdantonsa sivu-dokumentista, jonka polku on täsmälleen `klubi/hallitus` tai `klubi/toiminta` (`lib/path.ts:120-121`). Productionissa näitä dokumentteja ei ole, eikä opas mainitse niitä. Otsikko "Sivun asetukset" (yksikkö) sisältää koko sivuston asetukset.
- **Missä:** `sanity/structure.ts:50-77, 182-188`, `klubi/hallitus/page.tsx:32-69`, `klubi/toiminta/page.tsx:30-66`.
- **Ratkaisu:** structure.ts:ään sivuston kanssa samanniminen ryhmä "Klubi". Sen alle tulevat Esittelysivu, Hallitus (johdanto ja jäsenlista), Toiminta (johdanto ja toimintalista), Palloveikkaus (pääsivu ja alasivut) sekä Yhteystiedot. Kiinteät dokumentit näytetään `S.document().documentId()`-kohtina, ja puuttuvat luodaan valmiiksi tai initial value -pohjalla lukitulle polulle. "Sivun asetukset" nimetään "Sivuston asetuksiksi". Tavallisiin Sivuihin jäävät vain irralliset sivut.
- **Työmäärä:** keski
- **Lähteet:** KOV-7, KAY-3, DATA-3, SAN-5

#### Y26. Uusi alasivu ei näy osion välilehdissä eikä yläsivulla (hankaloittaa · joskus)
- **Mitä:** Jos isä tekee sivun klubi/jasenyys, se toimii, mutta ei näy Klubi-osion välilehdissä (`lib/nav-sections.ts:47-53`, "koodissa eivätkä Sanityssa tarkoituksella") eikä Klubi-sivun korteissa. Itse sivu renderöityy pohjalla, jossa ei ole välilehtiä (`[...slug]/page.tsx`), joten se näyttää kuuluvan eri osioon. Automaattinen alasivulistaus on vain palloveikkauksella (`sanity/lib/queries/klubi.ts:85-93`). Productionin valikossa Klubin alavalikko on täsmälleen sama kuin koodin klubiNav, joten tieto on kahdessa paikassa.
- **Ratkaisu:** Y17:n viittauslinkkien jälkeen osion välilehdet johdetaan navigaatio-singletonin saman päälinkin alavalikosta, myös catch-all-sivulla. Viittaus takaa, että valikon linkillä on olemassa oleva kohde, mikä oli koodin perustelu kovakoodaukselle. Alasivulistaus yleistetään catch-all-sivulle, ja sivuille lisätään järjestyskenttä.
- **Työmäärä:** keski
- **Lähteet:** SKE-3, RAK-3

#### Y27. Jalkapalloarkiston rakenne on koodissa (hankaloittaa · harvoin)
- **Mitä:** Tilaston kategoria on 23 kohdan kiinteä lista (`jalkapalloTilasto.ts:46-81`), ja jokainen kategoria on sidottu koodissa sivuunsa (`lib/path.ts:81, 148`). Huuhkajat-osiot johdantoineen (`lib/huuhkajat-osiot.ts:36-80`) ja ulkomaiden mestaruusmaat, joita on kaksi: Englanti ja Venäjä (`lib/ulkomaiset-mestarit.ts:31-51`), ovat koodissa. Samoin arkiston etusivun kortit (`jalkapalloarkisto/page.tsx:36-171`), osionavigaatio (`lib/nav-sections.ts:19-38`) ja 19 kiinteää reittihakemistoa. Kategorian otsikko "Ulkomaiden mestarit (Englanti, Venäjä …)" antaa ymmärtää, että maita voi lisätä. Litmanen-kortin kuvaus on vanhentunut. Arkiston kortit ja osionavigaatio ovat kaksi erillistä listaa, jotka voivat erkaantua. Tavallista tekstisivua ei voi tehdä arkiston alle, koska `jalkapalloarkisto` on varattu polku (`sivu.ts:30, 66`). Kiertotie on olemassa: kategoria "Muu tilasto" saa oman sivunsa osoitteeseen /jalkapalloarkisto/tilastot/[slug] (productionissa 2 kpl).
- **Miksi isälle:** "Naisten maajoukkue" tai "Espanjan mestarit" onnistuu taulukkona, mutta ei omana osionaan. Isälle ei ole kerrottu kiertotiestä.
- **Ratkaisu, vaiheittain:** (1) Heti: kategorian kuvaukseen ja docs/09:ään ohje "Muu tilasto" -kiertotiestä ja siitä, että uusi pysyvä osio vaatii kehittäjän. Osion kortit ja osionavigaatio yhdistetään yhdeksi koodilistaksi. (2) Varattu sana `jalkapalloarkisto` muutetaan varatuiksi kokonaisiksi poluiksi, jolloin isä voi tehdä tekstisivun polulle jalkapalloarkisto/naisten-maajoukkue. Osionavigaatioon tulevat lisälinkit navigaation Jalkapallo-päälinkin alavalikosta (sama malli kuin Y26). Korttien kuvaukset tulevat Y22:n osiosivuista. (3) Vain jos hallitus haluaa: `arkistoOsio`-dokumentti ja kategoria viittaukseksi uutiskategorioiden mallilla. Tämä on suuri ja riskialtis työ 187 taulukolle ja niiden ohjauksille, joten sitä ei suositella nyt.
- **Työmäärä:** pieni (1) + keski (2) + suuri (3)
- **Lähteet:** KOV-5, KOV-6, KOV-13, SKE-10, SKE-16, KEH-8, RAK-10

#### Y28. Uusi pelaajaosio jää orvoksi (estää · harvoin)
- **Mitä:** Pelaajan sivu syntyy, mutta pelaajalistaa ei ole, eikä osionavigaatiossa ole Pelaajat-kohtaa. Lehtileikkeen reitti palautetaan vain Litmaselle (`lib/path.ts:167-172`), joten muiden pelaajien lehtijutut eivät näy missään. Kentän kuvaus "Kenen pelaajasivulla juttu näkyy" (`lehtileike.ts:32`) johtaa harhaan. Productionissa on 1 pelaaja.
- **Ratkaisu:** Heti lehtileike.pelaaja-viittaukseen `options.filter` Litmaseen ja kuvauksen korjaus. Myöhemmin, jos tarvetta on: Litmanen-osion malli yleistetään kaikille pelaajasivuille ja lisätään /jalkapalloarkisto/pelaajat-lista.
- **Työmäärä:** pieni (rajaus) + keski (yleistys)
- **Lähteet:** SKE-9

#### Y29. Ottelusivun seuralista on piilotettu etusivun lohkoon, ja automaattinen haku kattaa vain Veikkausliigan (hankaloittaa · joskus)
- **Mitä:** /ottelut näyttää seurat, jotka on valittu etusivun otteluohjelmalohkossa. Jos lohkon poistaa, sivu putoaa oletukseen ["FC Lahti"] (`ottelut/page.tsx:32-38`). Ingressi ja teksti "Ajat ovat Suomen aikaa" ovat koodissa, samoin laskurin teksti (`match-countdown-timer.tsx:54`, jota muutettiin juuri commitilla 75f3614). Etusivun seurat-kentän kuvaus lupaa otteluiden tulevan automaattisesti (`etusivu.ts:183-191`), mutta haku kattaa vain kuluvan Veikkausliigan (`lib/ottelut.ts:128`). Sarjojen muuttaminen vaatii Vercelin muuttujan `TASO_SARJAT`. Jos siinä on vuosiluku, ohjelma katkeaa joka tammikuu. Taso-tilassa virhe ei palaa ICS-syötteeseen vaan tyhjentää listan (`lib/ottelut.ts:216-223`), eikä Taso-koodia ole testattu oikealla avaimella.
- **Ratkaisu:** Seurat-kentän kuvaukseen: "Lista ohjaa myös Ottelut-sivua. Jos seuran ottelut eivät näy, lisää ne käsin." Ottelusivun tekstit Y22:n osiosivuun. Laskurin teksti otteluohjelmalohkon kentäksi, oletusarvona nykyinen teksti. "Haettavat sarjat" valintalistaksi Sanityyn (Veikkausliiga, Ykkösliiga, Suomen Cup), ja koodi muodostaa tunnuksen kauden mukaan. `TASO_SARJAT` ilman vuotta. Taso-tilaan varahaku ICS:stä. Haun tila kirjataan Y33:n tilanäkymään.
- **Työmäärä:** keski
- **Lähteet:** KOV-9, SKE-12, KEH-7, KEH-13

#### Y30. Sivuston kuvaus, someprofiilit ja llms.txt ovat koodissa, ja niissä on ristiriitoja (pieni · joskus)
- **Mitä:** Oletus-meta description ja Organization-JSON-LD:n kuvaus tulevat koodivakiosta `siteDescription` (`lib/site.ts:14-16`: "perustettu 2007. Tapahtumat, jäsenyys…"), vaikka etusivu käyttää Studiossa muokattavaa `heroDescription`-kenttää (`app/(public)/page.tsx:49`). JSON-LD:n sameAs (`lib/schema-org.ts:54`) ei lue Yhteystiedot.socials-kenttää, jonka alatunniste näyttää. llms.txt kertoo "noin 500 vuodesta 2001" (rivit 29 ja 51), mutta ravintolasivu laskee vanhimman käynnin vuodeksi 1997.
- **Ratkaisu:** Layoutin generateMetadata ja schema-org lukevat `etusivu.heroDescription`-kentän, ja `siteDescription` jää varalle. Kenttään lisätään kuvaus "Näkyy myös hakukoneissa koko sivuston kuvauksena". sameAs kootaan socials-kentästä ja Blogspot-arkistosta. llms.txt:n luvut lasketaan GROQ:lla. Asetukset-singletonia **ei** herätetä henkiin (Y41).
- **Työmäärä:** pieni
- **Lähteet:** KOV-8, KOV-12

#### Y31. Ravintola-arvostelun julkaisuraja ja sovelluksen tekstit ovat koodissa (pieni · harvoin)
- **Mitä:** `VAHIMMAISARVIOIJAT = 2` (`lib/ravintola-arvosana.ts:141`) ohjaa GROQ-ehtoa, odottavien sivun tekstiä ja webhookin laskentaa. Arvostelusovelluksen tekstit ja manifest (`app/manifest.ts:19-21`) ovat koodissa.
- **Ratkaisu:** Sääntö pidetään koodissa ja kirjataan docs/09:ään päätökseksi, jonka muuttaminen vaatii kehittäjän. Jos klubi haluaa säätää rajaa itse, tehdään asetus, jossa on varoitus, koska muutos vaatii arvosanojen uudelleenlaskennan.
- **Työmäärä:** pieni
- **Lähteet:** KOV-10

### F. Virheensieto, valvonta ja jatkuvuus

#### Y32. Yli kolme päivää vanhan virheen palautus vaatii aina kehittäjän (estää · harvoin)
- **Mitä:** Free-tasolla versiohistoria säilyy 3 päivää. Vanhemmat virheet palautetaan viikkovarmuuskopiosta komentoriviltä (gunzip ja `npx sanity dataset import`), ja varmuuskopio-dokumentin kuvauksessa lukee "Palautuksen tekee kehittäjä" (`varmuuskopio.ts:28`). Varmuuskopiolla ei ole toimintoja (`sanity.config.ts:51`). Kopiossa ei ole kuvia eikä luonnoksia (`app/api/varmuuskopio/route.ts:19, 24-27`). Kopiot tallennetaan samaan projektiin kuin data, joten Administrator voi poistaa ne yhdellä kertaa. Kuvien täysi kopio (1719 kpl, noin 1,06 Gt) on vain kehittäjän koneella. Opas lupaa palautuksen versiohistoriasta mainitsematta rajaa (docs/09:294, 606).
- **Miksi isälle:** Jos hän huomaa viikon päästä tyhjentäneensä sivun tai poistaneensa lohkon, hän ei voi korjata sitä itse. Tämä on Studion virheensiedon suurin yksittäinen aukko.
- **Ratkaisu:** (1) Varmuuskopio-dokumenttiin toiminto "Palauta dokumentti tästä kopiosta". Se lataa tiedoston, purkaa sen selaimessa (`DecompressionStream`), antaa hakea dokumentin otsikolla ja luo siitä luonnoksen `drafts.<id>`, jonka isä tarkistaa ja julkaisee. Toiminto käyttää kirjautuneen käyttäjän yhteyttä, joten erillistä tokenia ei tarvita. Poistettu dokumentti palautuu samalla tavalla. Ohjeteksti kertoo, että kuvat eivät palaudu. (2) Projektin ulkopuolinen kopio kuvineen (GitHub Action klubin organisaatiossa tai yhdistyksen pilvi). (3) Yksi palautusharjoitus väliaikaiseen datasettiin. (4) docs/09:294 ja :606 korjataan: "vain 3 päivää". (5) Ensin Y38:n "Näytä etusivulla" -kytkin, joka poistaa yleisimmän syyn poistaa lohko. Growth-taso (90 päivää) pienentäisi tarvetta (Y1).
- **Työmäärä:** keski
- **Lähteet:** SKE-14, SAN-13, KEH-2, KAY-7, OPAS-1, KEH-12

#### Y33. Valvontaa ja ilmoituksia ei ole (hankaloittaa · usein)
- **Mitä:** Epäonnistunut varmuuskopio tai huolto palauttaa HTTP 500:n, joka näkyy vain Vercelin lokissa (`app/api/huolto/route.ts:68-69`, `varmuuskopio/route.ts:157-161`). Hobby-tasolla lokit säilyvät tunnin, eikä isällä ole Vercel-pääsyä. Otteluohjelman virhe kirjataan vain `console.error`-kutsulla. Isä ei saa ilmoitusta uudesta arvostelusta tai kommentista (`app/api` ei sisällä ilmoitusreittiä, Resend on poistettu). Studiossa on jonot (`structure.ts:201-221`), mutta niistä ei tule muistutusta.
- **Ratkaisu:** (1) Huolto- ja varmuuskopioreitti kirjoittavat ajon tuloksen singletoniin `jarjestelmanTila`: viimeisin kopio, huollon tulos, otteluiden määrä, viimeisin virhe ja dokumenttimäärä. Studioon tulee "Sivuston tila" -näkymä, jossa on punainen merkki, jos kopio on yli 8 päivää vanha tai syöte tyhjä. (2) Ilmainen ulkoinen uptime-valvonta (etusivu ja /studio), josta hälytys lähtee isälle ja tukihenkilölle. (3) Ilmoitus uudesta arvostelusta tai kommentista: GROQ-webhook (`delta::operation() == "create"`) tai yöllinen kooste huoltoreitiltä sähköpostilla. Tämä vaatii sähköpostipalvelun.
- **Työmäärä:** keski
- **Lähteet:** KEH-3, KAY-16

#### Y34. Ohjelmistopäivitykset kasautuvat, eikä niillä ole vastuuhenkilöä (hankaloittaa · usein)
- **Mitä:** Dependabotin PR:t #1, #2 ja #5–#9 ovat auki 28.9. alkaen, ja joukossa on major-päivityksiä (`@portabletext/react` 6→8, actions 4→7). CI ei aja buildia (`.github/workflows/tarkistukset.yml`), joten automaattinen yhdistäminen ei ole turvallista. Node-versio on lukitsematta (ei `engines`, ei `.nvmrc`, CI:ssä 22, paikallisesti 25). Upotettu Studio päivittyy vain koodin kautta.
- **Ratkaisu:** CI:hin `npm run build` (lukutoken GitHubin salaisuudeksi) ja automaattinen yhdistäminen patch- ja minor-ryhmille, kun CI menee läpi. Node lukitaan samaan versioon kaikkialla. Studio deployataan lisäksi Sanityn hostaamaksi (`sanity deploy`, `deployment.autoUpdates: true`), jolloin Studion pienet korjaukset tulevat ilman kehittäjää. Major-päivitykset tekee tukihenkilö neljännesvuosittain, ja epäonnistuneesta palataan Vercelin Instant Rollbackilla.
- **Työmäärä:** keski
- **Lähteet:** KEH-6

### G. Studion käytettävyys

#### Y35. Studiossa ei ole aloitusnäkymää eikä ohjeita (hankaloittaa · usein)
- **Mitä:** Studio avautuu suoraan sisältöpuuhun (`structure.ts:46-80`), eikä pluginien joukossa ole dashboardia (`sanity.config.ts:77-91`). Jonot ovat olemassa, mutta niistä ei ole koostetta eikä laskureita. 650-rivinen opas on repossa, jota isä ei käytä. "Täytä itse" -lista on vain paperilla.
- **Ratkaisu:** Ensin kevyt ratkaisu: structure.ts:n ylimmäksi kohta "Tehtävät sinulle". Sen alla on suodatettuja listoja: arvostelut odottavat, tarkistettavat, julkaisemattomat muutokset (Y11), Yhteystiedot (jos sähköposti puuttuu) ja tyhjä Hallitus. Myöhemmin oma työkalu "Aloitus", jossa ovat laskurit, pikapainikkeet (Uusi uutinen, Uusi tapahtuma, Uusi ottelu) ja tiivis "Tee näin" -ohje. Ohje Studiossa korvaa repossa olevan oppaan arkikäytössä. Toimii Free-tasolla.
- **Työmäärä:** pieni (Tehtävät) + keski (Aloitus ja ohje)
- **Lähteet:** SAN-8, KAY-14, KAY-T2

#### Y36. Taulukon sijainti sivustolla ei näy Studiossa (hankaloittaa · usein)
- **Mitä:** Esikatselun Näkyy sivulla -linkit on määritelty vain 9 tyypille (`sanity/presentation.ts:11-21`). Linkki puuttuu jalkapalloTilastolta (187 kpl), otteluilta ja hallitukselta. Listassa näkyy raaka kategoria-avain kuten "valmentajien-palkat" (`jalkapalloTilasto.ts:266-269`), ja kategoriakentän kuvaus on vain "Vaikuttaa siihen, miten tilasto näytetään sivulla". `documentRoute` osaa jo laskea taulukon sijainnin (`lib/path.ts:174-202`).
- **Ratkaisu:** jalkapalloTilasto lisätään `presentation.ts`:n locations-määritykseen documentHrefillä. Viittaavan sivun sijainti haetaan alikyselyllä. Alaotsikoksi suomenkielinen kategorian nimi. Tilastot-lista jaetaan kategorioittain (Klubin omat, Huuhkajat, Karsinnat, Arvokisat, Muut). Kategoriakuvaukseen kerrotaan, millä sivulla kategoria näkyy.
- **Työmäärä:** pieni
- **Lähteet:** KAY-2

#### Y37. Valmiita pohjia ja tilamerkkejä ei ole, ja klubiarvosanat ovat yhdessä 1544 rivin listassa (pieni · usein)
- **Mitä:** `schema.templates` vain suodattaa (`sanity.config.ts:22-26`), ja `document.badges` puuttuu. Isä aloittaa vuosikokouskutsun tai palloveikkauksen aina tyhjästä. Tila (Tarkistettava, Piilotettu, Ajastettu, Odottaa toista arvioijaa) näkyy vain oikean listan kautta. Klubiarvosanat ovat yhdessä 1544 dokumentin listassa (`structure.ts:234-241`), eikä ravintolasta voi aloittaa uutta arvosanaa. Klubilaiset käyttävät puhelinlomaketta (docs/21), joten Studiossa syöttäminen on varapolku.
- **Ratkaisu:** Pohjat: "Vuosikokouskutsu", "Palloveikkaus", "Huuhkajien ottelu" ja "Ravintolan arvosana". Merkit: Tarkistettava, Ajastettu, Piilotettu ja Ei vielä sivustolla. Ravintoloihin näkymä "Arvosanat ravintoloittain", jossa arvosanat näkyvät ravintolan alla ja uuden arvosanan pohja esitäyttää ravintolan. docs/09:339 korjataan ohjaamaan tähän näkymään. Toimii Free-tasolla.
- **Työmäärä:** pieni–keski
- **Lähteet:** SAN-9, KAY-9

#### Y38. Ammattikieli, numerojärjestys ja lohkon "piilotus", joka oikeasti poistaa lohkon (pieni · usein)
- **Mitä:** Kentissä on nimiä kuten "Polku (slug)", "SEO-otsikko (override)", "Yläbanneri (hero-kuva)" ja "URL" (`seoFields.ts:6, 15`, `sivu.ts:79, 91, 131`, `yhteystiedot.ts:75`). Saman asian nimet vaihtelevat (`kaupunki.ts:23` "Osoitetunniste", `uutisKategoria.ts:42` "Polku"). Etusivun lohkojen kuvaus lupaa "piilota lohkoja vetämällä" (`etusivu.ts:148`), mutta piilotusta ei ole ja roskakori poistaa lohkon. Järjestys annetaan numeroilla. Klubin toiminnassa otsikko "Järjestysnumero" tarkoittaa kahta eri asiaa (`klubiToiminta.ts:59-64, 97-102`), eikä Studion lista ole samassa järjestyksessä kuin sivusto.
- **Ratkaisu:** Yhtenäiset nimet: "Osoite sivustolla", välilehti "Hakukoneet ja jako", "Otsikko hakutuloksissa (valinnainen)", "Iso kuva sivun yläosassa" ja "Verkko-osoite". Jokaiseen etusivun lohkoon "Näytä sivulla" (oletuksena päällä) ja esikatseluun merkintä "piilotettu". Vuosirivin otsikoksi "Monesko kerta" ja listoille `defaultOrdering`. Raahattava järjestys vasta, kun pluginin v5-yhteensopivuus on varmistettu.
- **Työmäärä:** pieni
- **Lähteet:** KAY-13, KAY-8

#### Y39. Hallituksen vaihto ja Kirjoittaja-kenttä (hankaloittaa · joskus)
- **Mitä:** Opas neuvoo poistamaan vanhan jäsenen (docs/09:319). Uutisen Kirjoittaja viittaa hallitusJaseneen (`uutinen.ts:166-172`). Kun kenttää käytetään, poisto estyy, ja vanhan jutun kohdalla näkyy kirjoittajan nykyinen rooli (`uutiset/[slug]/page.tsx:152-160`). Kenttää ei ole käytetty yhdessäkään 753 uutisesta, eikä hallituksen jäseniä ole, joten lomakkeella on aina tyhjä valinta. Hallitukselle ei ole kautta eikä aktiivisuustietoa.
- **Ratkaisu:** hallitusJaseneen kenttä "Nykyinen jäsen" (oletuksena päällä), ja sivu suodattaa sen mukaan. Studioon näkymät "Nykyinen hallitus" ja "Entiset jäsenet". Oppaaseen ohje "ota rasti pois, älä poista". Kirjoittaja piilotetaan, kunnes kirjoittajamallista päätetään, tai rooli tallennetaan uutiseen julkaisuhetkellä. Klubilainen-tyyppiä ei käytetä kirjoittajana, koska se on ravintola-arvioiden henkilö.
- **Työmäärä:** pieni
- **Lähteet:** SKE-8, KAY-5, KAY-10

#### Y40. Kategorioilla ei ole selitystä, ja tunnisteet rönsyilevät (pieni · joskus)
- **Mitä:** Yhdelläkään 10 uutiskategoriasta ei ole kuvausta, ja ainoa kuvauskenttä on "Kuvaus hakukoneille". Isä loi 4.10. kategorian "Arvostelu" pelaajien arvosanoille, vaikka listalla on jo Ravintola (145 uutista). Kategoriat Kannattajakulttuuri ja Tiedote ovat tyhjiä. Erilaisia tunnisteita on 672, joista 335 on käytössä vain kerran. Harvinaisten tunnisteiden sivut ovat jo noindex-tilassa (`app/sitemap.ts:180`).
- **Ratkaisu:** uutisKategoriaan kenttä "Mihin käytetään", joka näytetään valintaruudun vieressä. Isän kanssa päätetään Arvostelu-kategorian ja tyhjien kategorioiden kohtalo. TunnisteetInput järjestää ehdotukset käyttömäärän mukaan. Kertakäyttöiset tunnisteet siivotaan vain isän hyväksymästä listasta. Tunnisteita **ei** muuteta viittauksiksi, koska se olisi raskas migraatio 527 uutiseen.
- **Työmäärä:** pieni
- **Lähteet:** DATA-14, KAY-T4, DATA-11

#### Y41. Vanhentuneita kenttiä ja orpo asetukset-singleton (pieni · usein)
- **Mitä:** Etusivulla näkyy lukittuna jo pelattu "Seuraava ottelu" (Suomi–Valko-Venäjä 29.9.), koska `hidden: value === undefined` (`etusivu.ts:102-117`). Piilotetuissa kentissä on dataa: heroTitle, heroCtas[].primary ja 4 navigaation highlight-arvoa. Asetukset-singleton on piilossa tarkoituksella (`structure.ts:21-24`), eikä koodi lue sitä. Sen logo-kentällä ei ole vaikutusta, ja logo tulee tiedostosta `public/brand/web/` (`footer.tsx:64, 71`, `header.tsx:41`). Ravintolan viisi tyylioppaan kenttää (website, priceLevel, tuomio, stadionHuomio, ottelupaivana) ovat tyhjiä kaikissa 573 ravintolassa. Huom: kommentti.veikkaus, klubilainen.lomakkeella ja uutinen.ulkoinenLinkki **ovat** käytössä, eikä niitä saa poistaa.
- **Ratkaisu:** Heti seuraavaOttelu-kenttään `hidden: true`. Sen jälkeen Sanity-migraatio (`defineMigration` ja `unset`), joka ajetaan ensin developmentiin ja varmuuskopion jälkeen productioniin. Se poistaa heroTitle-, seuraavaOttelu-, heroCtas[].primary- ja highlight-kentät sekä asetukset-dokumentin. Kentät ja skeema poistetaan koodista. Ravintolan viisi kenttää kootaan suljettuun fieldsetiin "Lisätiedot (valinnainen)". docs/09:ään maininta, että logon vaihto vaatii kehittäjän (`npm run brandikuvat`).
- **Työmäärä:** pieni
- **Lähteet:** SAN-11, DATA-6, DATA-8, DATA-9, KOV-11

#### Y42. Kuvakirjastoa ei ole: tunnisteita, käyttämättömien kuvien suodatusta tai poistoa Studiossa ei voi tehdä (pieni · joskus)
- **Mitä:** Kuvia on 1719 (1,06 Gt, raja 100 Gt). Studion oletusvalitsin listaa ladatut kuvat ja hakee tiedostonimellä, joten uudelleenkäyttö onnistuu. Tunnisteet, "ei käytössä" -suodatus ja kuvan alt-metatieto puuttuvat, ja orpojen kuvien siivous on komentorivityökalu. Sanityn Media Library ei sisälly Free- eikä Growth-tasoon ilman lisämaksua.
- **Ratkaisu:** Avoimen lähdekoodin `sanity-plugin-media` (MIT-lisenssi, ei lukitse palveluun), kun Sanity v5 -yhteensopivuus on varmistettu. Orpojen kuvien poisto voidaan tehdä sillä. Yöllinen huolto siivoaa jo arvostelukuvat.
- **Työmäärä:** pieni
- **Lähteet:** SAN-10

#### Y43. Oppaassa on vanhentuneita kohtia, ja siitä puuttuu ohjeita tavallisiin tehtäviin (hankaloittaa · joskus)
- **Mitä:** Oppaan noin 40 tarkistettua kenttänimeä ja polkua vastaavat Studiota. Siitä kuitenkin puuttuvat: blogista luopuminen (Y8), PDF-liite (Y14), uuden sivun lisääminen valikkoon (docs/09:245-254 päättyy julkaisuun), tieto siitä, että alatunniste on koodissa, hallituksen vaihto ilman poistoa (Y39) sekä kentät Juhlatapahtuma, Karttapaikka, Yläbanneri ja etusivun lohkotyypit. Vanhentuneita kohtia: "528 kirjoitusta" (oikein 530, :54), "Jalkapallotilastot-lista" (oikein Jalkapalloarkisto → Tilastot, :477), blogitunnisteiden "muokkaaminen", vaikka kenttä on vain luku (:168), Kopioi-kielto ilman estoa (:205), tinypng.com-ohje (:263) ja Wepard (:647).
- **Ratkaisu:** Korjataan tekstit ja lisätään puuttuvat kohdat. Jokainen tiekartan vaihe päivittää oppaan samassa muutoksessa. Opas tuodaan Studioon (Y35).
- **Työmäärä:** pieni
- **Lähteet:** OPAS-4, OPAS-5

---

## 4. Tiekartta

Periaate: ensin määräaikaan sidotut asiat, sitten se, mikä vähentää kehittäjäriippuvuutta eniten pienimmällä opeteltavalla. Uutta singletonia ei tehdä missään vaiheessa, joten asetukset pysyvät Etusivussa, Navigaatiossa ja Yhteystiedoissa. Jokainen vaihe päivittää docs/09:n samassa muutoksessa. Productioniin viedään vain dokumenttikohtaisia patcheja tai `--missing`-lisäyksiä, ja aina varmuuskopion jälkeen.

### Vaihe 1: määräajat ja nopeat korjaukset (noin 1,5–2 viikkoa kehittäjätyötä)

**1A. Ennen 26.10.2026**
- Y1 Sanityn tasopäätös (hallitus), Y2 kirjoitustokenin varmistus ja testi 26.10. illalla, Y3 yksityisyyskorjaukset, jos valitaan Free-taso. Työmäärä: pieni, Free-tasolla lisäksi keski.
- Y7 isän rooli ja dokumentit yhtenäisiksi. Pieni.

**1B. Ennen Zonerin webhotellin irtisanomista (noin marraskuun alku)**
- Y6 DNS-vyöhykkeen siirto, rekisteröijä, uusinnan maksaja. Pieni.
- Y5 hätäsiirtopaketti, `.env.example` kuntoon, "älä poista tokeneita" oppaaseen. GitHub-organisaatio. Pieni.

**1C. Blogi Studioon**
- Y8 katkaisupäivä, viimeinen synkka, muuttoilmoitus, yhteinen kirjoituskerta isän kanssa. Pieni.
- Y9 kuvasarjalohko ja kansikuvan varakuva. Keski.

**1D. Pienet rakenteelliset korjaukset (ei datamigraatiota)**
- Y16 taulukot tavallisella sivulla. Pieni.
- Y17 askel 1: linkin kohteen tarkistus. Pieni.
- Y21 tietosuojan lukitus ja varatut polut. Pieni.
- Y24 tyhjätilat kävijälle, tyhjät osiot pois sitemapista ja alatunnisteesta. Pieni.
- Y11 Julkaisemattomat muutokset -lista ja Tarkistettavat-listan laajennus. Pieni.
- Y12 ajastus julkaisupäivän perusteella. Pieni.
- Y41 seuraavaOttelu piiloon (`hidden: true`). Pieni.
- Y28 lehtileikkeen rajaus Litmaseen. Pieni.
- Y39 "Nykyinen jäsen" -kenttä ja Kirjoittaja piiloon. Pieni.
- Y19 generaattorin oletukseksi production ja syötteet gitiin. Pieni.
- Y35 Tehtävät sinulle -kohta. Pieni.
- Y43 opas kuntoon. Pieni.

Vaiheen 1 jälkeen arkiuutiset eivät enää kulje kehittäjän kautta, hiljaiset virheet (taulukot, linkit, julkaisemattomat muutokset) näkyvät, ja määräajat on hoidettu.

### Vaihe 2: kehys Studioon (noin 3–4 viikkoa)

Järjestys on sidottu: osiosivut → linkit ja alatunniste → tekstilohkot → ohjaukset.
- Y22 listasivut lukittuina sivuina (luonti `--missing`-ajolla, ei olemassa olevien dokumenttien muutoksia). Keski.
- Y25 Klubi-ryhmä Studioon ja Hallitus- ja Toiminta-sivujen johdannot. Keski.
- Y17 askeleet 2–3: linkkiobjekti, leipätekstin sisäinen linkki, 5 dokumentin patch varmuuskopion jälkeen. Keski.
- Y23 alatunniste navigaatioon. Pieni.
- Y13 tiedotebanneri. Pieni.
- Y14 ja Y15 (1–2): liite, huomiolaatikko ja painike `rikasSisalto`-tyyppiin. Keski.
- Y18 automaattinen ohjaus webhookilla ja `ohjaus`-dokumentti 404-haarassa. Keski–suuri.
- Y20 Poisto- ja Kopioi-kääreet. Keski.
- Y32 Palauta varmuuskopiosta -toiminto ja ulkoinen kopio. Keski.
- Y33 Sivuston tila -näkymä ja uptime-valvonta. Keski.
- Y10 johdantokenttien yhdistäminen. Keski.
- Y36, Y37, Y38 käytettävyyskorjaukset. Pieni–keski.

Vaiheen 2 jälkeen isä voi lisätä valikkoon sivun valitsemalla sen listasta, korjata osoitteen ilman kehittäjää, muokata listasivujen tekstejä ja alatunnistetta, liittää PDF:n ja palauttaa vanhan virheen itse.

### Vaihe 3: laajennettavuus harkinnan mukaan (noin 2–4 viikkoa, osa vain päätöksellä)
- Y26 osion välilehdet navigaatiosta ja alasivulistaus. Keski.
- Y27 askeleet 1–2: arkiston alle sallitaan tekstisivut ja lisälinkit navigaatiosta. Pieni–keski. Askel 3 (`arkistoOsio`) vain hallituksen päätöksellä. Suuri.
- Y28 pelaajaosion yleistys, jos tarvetta on. Keski.
- Y15 (3–4): taulukko- ja upotuslohkot. Keski.
- Y29 sarjat Sanityyn ja varahaku Taso-tilaan. Keski.
- Y30 sivuston kuvaus etusivulta ja sameAs somesta. Pieni.
- Y19 ajonaikaiset legacy-ohjaukset. Keski.
- Y34 CI-build, automaattinen yhdistäminen ja Studion autoUpdates. Keski.
- Y41 kenttien siivousmigraatio. Pieni.
- Y40, Y42, Y31 tarpeen mukaan. Pieni.

---

## 5. Mitä jää aina teknisen henkilön tehtäväksi

Kaikkea ei voi eikä kannata siirtää Studioon. Seuraavat asiat vaativat aina jonkun, joka osaa koodia tai palveluiden hallintaa:

| Tehtävä | Miksi | Miten hoidetaan |
|---|---|---|
| Next.js- ja Sanity-pääversioiden päivitykset | Rikkovat muutokset vaativat koodimuutoksia | Tukihenkilö neljännesvuosittain. Pienet päivitykset yhdistyvät automaattisesti (Y34). |
| Vercel: ympäristömuuttujat, uudelleenjulkaisu, palautus edelliseen versioon | Tekninen hallintapaneeli | Hätäsiirtopaketti ja salasanaholvi (Y5). Instant Rollback -ohje docs/17:ään. |
| DNS ja domain | Väärä muutos katkaisee koko sivuston | Kirjallinen ohje ja automaattinen uusinta (Y6). |
| Uusi sivutyyppi tai uusi reitti (esim. uusi arkisto-osio, joka tarvitsee oman koodin) | Ulkoasu ja reititys ovat koodissa | Isä tekee ensin tekstisivun kiertotietä (Y27). Kehittäjä tekee pysyvän osion. |
| Sanity-tokenien ja webhookin uudelleenluonti | Niiden arvot pitää viedä Verceliin | Tokenien ja webhook-projektion kuvaus docs/17:ään. |
| Logon ja brändivärien vaihto | Kuvat generoidaan komennolla `npm run brandikuvat` | Kirjataan oppaaseen (Y41). |
| Ravintolasääntö (2 klubilaista) | Muutos vaatii arvosanojen uudelleenlaskennan | Hallituksen päätös ja kehittäjä (Y31). |
| Uuden sisältötyypin välimuistiriippuvuudet | `RIIPPUVAT`-taulukko (`app/api/revalidate/route.ts:27-35`) | Kehittäjän muistisääntö CLAUDE.md:hen. Isälle tieto, että puuttuva riippuvuus viivästyttää muutosta noin minuutilla, ei tuntia. |
| Koko datasetin palautus | Komentorivityö | Palautusharjoitus kerran vuodessa ja ohje docs/17 §D:hen (Y32). |
| Taso-rajapinnan tunnukset ja otteluhaun muutokset | Ulkoisen palvelun tekniset tunnukset | Haun tila näkyy Studiossa (Y29, Y33). |

**Miten riippuvuus pidetään pienenä:**
1. **Nimetty tukihenkilö tai tukisopimus.** Hallitus päättää, kuka ja millä budjetilla, jos kehittäjä ei ole tavoitettavissa.
2. **Hätäohje yhdessä paikassa** (docs/17 ja salasanaholvi): palvelut, tunnukset, maksajat, uusintapäivät, muuttujat ja vaiheet.
3. **Automaatio hoitaa toistuvan työn:** yöllinen huolto, viikkovarmuuskopio, Dependabotin automaattinen yhdistäminen, Studion automaattinen päivitys ja valvonta, joka hälyttää isälle ja tukihenkilölle.
4. **Studio kertoo itse, kun jokin on vialla** (Sivuston tila, Y33), jotta vian huomaaminen ei vaadi kehittäjää.

---

## 6. Sanityn Free-taso ja maksulliset ominaisuudet

Hinnat on luettu sivulta sanity.io/pricing 7.10.2026 (USD ilman ALV:tä).

| Ominaisuus | Free | Growth (15 $/paikka/kk, Viewer-paikat maksuttomia) | Tarvitaanko? |
|---|---|---|---|
| Yksityinen datasetti | Ei, aina julkinen | Kyllä | Hyödyllinen. Freessä tarvitaan Y3:n korjaukset. |
| Roolit | Administrator, Viewer | Lisäksi Editor, Contributor ja Developer | Hyödyllinen: isä Editoriksi, ja robottitokenin rooli säilyy (Y2). |
| Versiohistoria | 3 päivää | 90 päivää | Hyödyllinen. Freessä korvataan palautustoiminnolla (Y32). |
| Ajastetut luonnokset ja julkaisut | Ei | Ajastus kyllä, Releases lisäosana | Ei välttämätön: julkaisupäiväsuodatin riittää (Y12). |
| Studion kommentit ja tehtävät | Ei | Kyllä | Ei välttämätön: oma moderointi ja Tehtävät-lista hoitavat (Y35). |
| Media Library | Ei | Lisäosa | Ei kannata: `sanity-plugin-media` riittää (Y42). |
| AI Assist | Ei | Kyllä | Ei tarpeen. |
| Presentation ja Visual Editing | Kyllä | Kyllä | Jo käytössä. |
| Omat dokumenttitoiminnot, validoinnit, pohjat, Structure | Kyllä | Kyllä | Valtaosa tämän raportin ratkaisuista. |
| Webhookit | 2 | Enemmän | 1 käytössä, riittää. |
| Sanity Functions | 500 000 kutsua/kk | Enemmän | Ei välttämätön, webhook ja Vercel riittävät. |
| Dokumentit | 10 000 per projekti | 25 000 | Nyt noin 7681 kahdessa datasetissä. Developmentin tyhjennys riittää (Y4). |
| API-pyynnöt | 250 000/kk, ylitys ei mahdollinen | Ylitys laskutetaan | Riittää todennäköisesti. Tarkistetaan Usage-sivulta (Y4). |

**Vuosikustannukset:**
- Sanity Free: 0 $. Growth: isä yksin 180 $/v, isä ja kehittäjä 360 $/v.
- Vercel Hobby: 0 $, mutta kehittäjän henkilökohtainen tili ja ei-kaupallinen ehto. Vercel Pro: 240 $/v (1 käyttäjä).
- Domain: Zoner, uusinta 28.8.2027, hinta tarkistamatta.
- Halvin vaihtoehto on 0 $ ja domain. Kokonaan yhdistyksen omistama, maksullinen malli maksaa noin 420–600 $/v ja domain.

**Suositus:** Growth yhdellä paikalla (isä, noin 180 $/v) on edullisin tapa poistaa kolme riskiä kerralla: julkinen datasetti (Y3), kirjoitustokenin rooli (Y2) ja 3 päivän historia (Y32). Isä saa samalla turvallisemman Editor-roolin (Y7). Free-taso on täysin toimiva vaihtoehto, kun Y2, Y3 ja Y32 tehdään ennen 26.10. tai pian sen jälkeen. Kaikki muut tämän raportin ratkaisut toimivat Free-tasolla. Media Libraryyn, Releasesiin, AI Assistiin tai Live Content API:in ei kannata maksaa. Kehittäjän paikan tarve Growth-tasolla on tarkistettava: hän tarvitsee kirjoitusoikeuden skeemaa ja migraatioita varten.

---

## 7. Päätökset käyttäjälle ja isälle

**Ennen 26.10.2026 (hallitus)**
1. Sanity Growth (180–360 $/v) vai Free-taso ja siihen tarvittavat korjaukset? Kuka maksaa ja millä kortilla?
2. Jos valitaan Free: hyväksyykö hallitus, että julkaistu sisältö, myös varmuuskopioiden osoitteet ja arvostelukuvien tiedot, on luettavissa rajapinnasta? Korvataanko kommentin piilotus poistolla? Tarvitseeko tietosuojaselostetta muuttaa?
3. Kuka testaa 26.10. illalla kommenttilomakkeen ja varmuuskopion?

**Palvelut ja omistajuus**
4. Siirretäänkö repo yhdistyksen GitHub-organisaatioon? Jääkö Vercel Hobby-tilille vai siirretäänkö se yhdistyksen Pro-tilille (240 $/v)? Aikooko yhdistys julkaista IBANin tai pyytää jäsenmaksuja sivustolla?
5. Kuka on domainin rekisteröijä, kuka uusii sen 28.8.2027 mennessä, ja kuka siirtää DNS-vyöhykkeen ennen webhotellin irtisanomista?
6. Kuka on nimetty tekninen tukihenkilö, ja onko siihen budjettia?
7. Saako development-datasetin tyhjentää julkaisun jälkeen?

**Isän työtapa**
8. Mikä on blogin katkaisupäivä? Jääkö Blogspot arkistoksi ohjausskriptin kanssa?
9. Miksi isä kirjoittaa yhä blogiin: tottumus, puhelin, kuvat vai se, ettei kukaan ole kertonut tavan vaihtuvan? (Kysytään suoraan isältä.)
10. Kuka kirjoitti 4.10. Albania-uutisen ja lisäsi siihen YouTube-videon ja Arvostelu-kategorian? Mitä Arvostelu-kategoria tarkoittaa, ja säilytetäänkö se?
11. Kuka täyttää hallituksen, yhteystiedot ja tapahtumat, ja mihin mennessä?
12. Tarvitaanko Tapahtumat- ja Galleria-osioita? Jos ei, piilotetaan ne.
13. Haluaako isä ilmoitukset uusista arvosteluista ja kommenteista sähköpostiin (vaatii sähköpostipalvelun) vai riittääkö Studion tehtävälista?

**Sisältö ja rakenne**
14. Mitä tekstilohkoja isä oikeasti tarvitsee? Kysytään viimeisimmistä tilanteista: PDF, painike, kuvasarja, kartta. Saako PDF-liitteitä ladata Sanityyn, kun ne ovat julkisia osoitteensa kautta?
15. Haluaako isä muokata alatunnistetta erikseen, vai riittääkö, että se seuraa päävalikkoa?
16. Siirretäänkö kaikkien 24 listasivun johdannot Sanityyn, vai ensin vain klubin, uutisten, tapahtumien, gallerian ja otteluiden?
17. Saako isä muuttaa julkaistun sivun osoitetta, kun ohjaus syntyy automaattisesti, vai pidetäänkö ohje "älä muuta"? Haluaako hän tehdä lyhytosoitteita esitteisiin?
18. Pitääkö isän voida perustaa kokonaan uusia arkisto-osioita (suuri työ), vai riittääkö tekstisivu ja "Muu tilasto" -kiertotie?
19. Tarvitaanko yhteistyökumppaniosiota tai muita pelaajaosioita kuin Litmasen?
20. Onko kahden klubilaisen sääntö pysyvä?
21. Saako footerin "Ylläpito"-linkki (/studio) näkyä kaikille kävijöille?
22. Saako Tiivistelmän ja Lyhenteen yhdistää productionissa (muuttaa 753 uutista ja 8 sivua), ja päättääkö kehittäjä vai isä 375 eroavan tekstin kohtalon?
23. Hyväksyykö isä vuosien 2006–2007 uutisten otsikkoehdotukset massana, vai käykö hän ne itse läpi?

---

## 8. Liite

### Kumotut ja korjatut väitteet
- **Kumottu (KEH-9):** "Studion Logo-kenttä ei vaikuta sivustoon, joten isän vaihtama logo ei näy." Asetukset-singleton on piilotettu Studiosta tarkoituksella (`structure.ts:21-24`), joten isä ei pääse vaihtamaan logoa siellä. Jäljelle jää vain oppaan maininta (Y41).
- **Listasivuja on 24, ei 8** (Y22). Haku `const LEAD` ohitti pienellä kirjoitetut vakiot.
- **Mestaruusmaita on 2 (Englanti, Venäjä), ei 5.** Kiinteitä arkistohakemistoja on 19, ei 11 (`lib/ulkomaiset-mestarit.ts`, `app/(public)/jalkapalloarkisto/`).
- **Alatunnisteen ja valikon nimiristiriita** ei näy kävijälle juuri nyt: alatunnisteessa ja productionin valikossa lukee "Klubista", vain koodin varavalikossa "Klubi". Ongelma on kahdentuminen, ei näkyvä virhe (Y23).
- **"Muutos näkyy vasta tunnin päästä" on väärin:** `sanityFetch` asettaa `revalidate: 60` (`fetch.ts:104`), joten viive on noin minuutti.
- **"API-kiintiö täyttyy helposti" on liioiteltu:** Data Cache rajaa saman kyselyn kertaan minuutissa. Täyttyminen vaatisi noin 8000 erilaista hakua päivässä.
- **"Kuvia ei voi selata Studiossa" on väärin:** oletusvalitsin listaa ja hakee ladatut kuvat (Y42).
- **"Isä syöttää 10 arvosanaa käsin" on liioiteltu:** klubilaiset arvostelevat puhelinlomakkeella, ja Studio on varapolku (Y37).
- **"SEO-kentät kuormittavat lomaketta" ei pidä:** ne ovat jo omalla välilehdellään. **kommentti.veikkaus, klubilainen.lomakkeella ja uutinen.ulkoinenLinkki eivät ole käyttämättömiä** (Y41).
- **"Otteluohjelmalohkon Kaikki tapahtumat -linkki vie tyhjälle sivulle" ei pidä:** linkki näkyy vain, kun tapahtumia on (`otteluohjelma-block.tsx:93`).
- **"Päävalikon Hallitus-linkkiä isä ei voi poistaa" ei pidä:** valikko on Sanityssa. Vain alatunniste on koodissa.
- **"Blogspot-luonnos jäi vahingossa" ei ole pääteltävissä:** aikaleima vastaa skriptipatchia. Todellinen ongelma oli toisessa luonnoksessa (Y11).
- **"Vision antaa isän poistaa dataa" ei pidä:** Vision on vain kyselytyökalu. Riski on Administrator-oikeuksissa sanity.io/managessa (Y7).
- **"Lähtöoletus: production on julkinen datasetti" ei pidä tänään:** datasetti on ollut yksityinen 5.10. alkaen (anonyymi `count(*)` = 0). Se muuttuu julkiseksi 26.10., jos Growthia ei osteta (Y1).
- **"Isälle Editor-rooli Free-tasolla" ei ole mahdollinen:** Freessä on vain Administrator ja Viewer.
- **"Build generoi ohjaukset" ei pidä:** `package.json:8` on pelkkä `next build` (Y18).

### Hylätyt ratkaisuehdotukset
- **Asetukset-singletonin herättäminen** sivuston kuvaukselle ja logolle. Se tekisi kuvauksesta kaksi kilpailevaa totuutta (Y30, Y41).
- **Erillinen footer-singleton tai "Listasivujen tekstit" -singleton.** Navigaatio ja lukitut sivut riittävät, eikä isälle tule uutta paikkaa opeteltavaksi (Y22, Y23).
- **Page builder tavalliselle sivulle.** Tilalle tulevat tekstilohkot (Y15).
- **Uusien lohkojen lisääminen jaettuun portableTextiin.** Tilalle tulee rajattu `rikasSisalto` (Y15).
- **`@sanity/table`-plugin.** Käytetään omaa taulukkoeditoria (Y15).
- **Linkin polun laskeminen GROQ:ssa.** Polku lasketaan koodissa `documentHref`-funktiolla (Y17).
- **Proxy.ts-tiedosto, joka hakee ohjauksen Sanitystä jokaiselle pyynnölle.** Haku tehdään vain 404-haarassa (Y18).
- **Ohjausten lisääminen next.configiin Studiosta.** Vercelin 1024 ohjauksen raja ja deploy-tarve estävät tämän (Y18).
- **Mukautettu julkaisutoiminto aiempien polkujen tallentamiseen.** Webhook on luotettavampi (Y18).
- **legacyUrl-uniikkiusvalidointi.** 106 vanhaa osoitetta on tarkoituksella yhteisiä (Y20).
- **Koko arkiston uudelleenrakennus yhdeksi dynaamiseksi reitiksi nyt.** Suuri riski ja harvinainen hyöty (Y27).
- **Tunnisteet viittausdokumenteiksi.** Raskas migraatio 527 uutiseen (Y40).
- **Siirtyminen Live Content API:in.** Hyöty on liian pieni (luku 5).
- **Kirjoittaja-kentän vaihtaminen klubilainen-tyyppiin.** Väärä henkilötyyppi (Y39).

### Tutkimuksen rajoitukset
- **Productionin data:** osa luvuista on tarkistettu kirjautuneella CLI:llä ja Management API:lla (vain luku). Osa on laskettu varmuuskopioista production-2026-09-29, -10-03, -10-04 ja -10-06, koska anonyymi GROQ palauttaa 0 eikä `.env.local`-tiedostoa luettu. Henkilötietoja ei tulostettu.
- **History API:a ei käytetty,** joten muokkauksia ei voi kohdistaa isälle tai kehittäjälle (esim. uutinen 16deaa03…).
- **Todentamatta jäi:** muuttuuko robottitoken Vieweriksi 26.10. (Y2), todellinen API- ja dokumenttikulutus (Y4), onko `TASO_API_KEY` asetettu Verceliin (Y29), domainin rekisteröijä ja hinta (Y6) sekä `sanity-plugin-media`-pluginin ja orderable-listan v5-yhteensopivuus (Y38, Y42).
- **Työmääräarviot** ovat suuntaa antavia, eikä niitä ole mitattu.