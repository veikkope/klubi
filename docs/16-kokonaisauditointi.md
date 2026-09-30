# Lahden Suomalainen Klubi ry: uuden sivuston kokonaisauditointi

**Päivämäärä:** 28.9.2026
**Kohde:** https://klubi-blond.vercel.app (main-haara, commit 15d30b7), Sanity-projekti zyrukn4s (datasetit production ja development)
**Tapa:** Yhdeksän rinnakkaista auditointia, jotka vain lukivat. Mitään ei muokattu, Sanityyn ei kirjoitettu eikä lomakkeita lähetetty. Jokainen korkea tai kriittinen löydös on tarkistettu erikseen. Kumottuja löydöksiä ei ollut yhdelläkään osa-alueella.

---

## 0. Korjausten tila (päivitetty 28.9.2026 illalla)

| Este | Tila |
|---|---|
| 1 Domain / info@-posti | Suunniteltu: **docs/17 §C**. Tarkennus: myös `mail` on CNAME apexiin, joten se muutetaan A-tietueeksi ennen MX-muutosta. |
| 2 Studio ja CORS | ✅ CORS lisätty neljälle osoitteelle. Isän kutsu (Editor) ja tokenien siivous: docs/17 §A. |
| 3 Arvostelijoiden sähköpostit | ✅ Sähköpostia ei enää kerätä. Arvostelu tallentuu luonnoksena (ei luettavissa julkisesti) ja hyväksytään julkaisemalla. Testattu. |
| 4 Ottelun 29.9. aika | **Ei virhe.** Sivun 19.00 on oikein (vahvistettu). Vanhan sivun 21.45 oli väärä. |
| 5 Tietosuojaseloste | ✅ /tietosuoja (Sanity-sivu), linkit footerissa ja kaikissa lomakkeissa. Hallitus vahvistaa sisällön ("Mitä tarkistaa"). |
| 6 Next.js-haavoittuvuudet | ✅ 16.3.6 + `npm audit fix`: 31 → 9 haavoittuvuutta, kaikki jäljellä olevat vain Sanityn komentorivityökalussa (ei julkisella sivustolla). Dependabot ja CI lisätty. |
| 7 404- ja virhesivut | ✅ Suomenkieliset, sivuston ulkoasulla, noindex. |
| 8 Esikatselu | Koodi ✅ (Studio: sisältö ensin, esikatselulinkit dokumenteissa). Vercelistä puuttuu `SANITY_API_READ_TOKEN`: docs/17 §B. |
| 9 Webhook | ✅ Luotu Sanityyn, ja riippuvuudet (arvostelu/kaupunki → ravintola) lisätty. Vercelistä puuttuu `SANITY_REVALIDATE_SECRET`: docs/17 §B. |
| 10 Perustiedot | Isä ja hallitus: docs/09 "Täytä itse". |
| 11 Studion valikko | ✅ Klubin toiminta, arvokisat, pelaajat, odottavat arvostelut. Studio suomeksi, Vision vain ylläpitäjille. |
| 12 Tarkistusjono | ✅ Valikko **Tarkistettavat** tyypeittäin, kenttä **Mitä tarkistaa** täytetty 75 dokumenttiin (dev ja prod), ⚠ kaikissa tyypeissä. |
| 13 Isän opas | ✅ docs/09 v2.0 kirjoitettu uudelleen. |
| Varmuuskopiointi | ✅ `npm run backup`, ensimmäinen kopio otettu 28.9. CLAUDE.md:n `--replace`-ohje korjattu. |

---

## 1. Vastaukset kysymyksiin

### Ovatko sivut täysin valmiit?

**Eivät vielä.** Julkinen sivusto toimii ja on teknisesti hyvässä kunnossa, mutta domainia ei voi vielä siirtää eikä isä pääse vielä päivittämään sivustoa.

- **Toimii:** Sitemapin kaikki 1363 osoitetta palauttavat 200. Sisäisiä linkkejä on 1418 sivulla, eikä yksikään ole rikki. Type-check ja lint menevät läpi ilman virheitä, kommenttitestit 12/12 menevät läpi ja tuotantobuild tekee 1377 sivua. Saavutettavuuden perusasiat ja JSON-LD-rakenteet ovat kunnossa.
- **Ei vielä toimi:**
  - Studio ei toimi tuotannossa. Sanityn CORS-listalla on vain localhost, joten isä ei pääse kirjautumaan.
  - Esikatselu ja revalidointi-webhook palauttavat 501, koska ympäristömuuttujat puuttuvat Vercelistä.
  - Ravintola-arvostelulomake tallentaisi arvostelijan sähköpostiosoitteen julkiseen datasettiin.
  - Tietosuojaseloste puuttuu.
  - Next.js-versiossa on tunnettuja haavoittuvuuksia.
  - 404-sivu on englanninkielinen oletussivu.
  - Jos domain siirretään nykyisen ohjeen (docs/08) mukaan, **klubin info@-sähköposti katkeaa**.
- **Sisältöä puuttuu:** Yhteystiedoissa on vain "Lahti". Hallitus, säännöt, tapahtumat ja galleria ovat tyhjiä sivuja, ja niihin on linkki valikosta.
- **Kiireellinen:** Huomisen ottelun Suomi–Valko-Venäjä (29.9.) aika on sivulla väärin: sivulla lukee 19.00, vanhalla sivulla 21.45.

### Onko kaikki tuotu?

**Lähes kaikki. Vanhan sivuston ja blogin sisältö on siirretty ja tarkistettu.**

| Mitä | Tulos |
|---|---|
| Vanhan sivuston URL:t | **198/198** käsitelty: 176 siirretty, 19 yhdistetty, 3 pudotettu perustellusti (kehys- ja valikkosivuja sekä index.html, joka on 404 myös vanhalla sivulla) |
| Kohdedokumentit productionissa | **308/308** |
| verify:content | **1482/1482** dokumenttia 1324 sivulla, 0 virhettä |
| Sanavertailu vanha → uusi | 124/143 sivua ≥ 99 % ja 128 ≥ 97 %. Loput erot ovat muotoilua. |
| Ravintolat | **498/498** sivukohtaisesti |
| Tilastotaulukot (otos) | täsmäävät, esim. päävalmentajat 28/28, Suomen mestarit 119/119, vuoden pelaaja 79/79 |
| Blogspot-kirjoitukset | **528/528**, tekstin kattavuus vähintään 99,8 %, kuvia 649 ilman ongelmia |
| Vanhat veikkauskommentit | **502**, täsmälleen oikeissa 90 uutisessa (poikkeamia 0/90) |
| Kuvat | 1067/1073 siirretty (4 puuttuu, ks. kohta 6). Alt-teksti on **1769/1769** kuvaviittauksessa |
| Vanhat .htm-ohjaukset | 198/198 sivulla on ohjaus. verify:redirects antoi 721/727, ja loput 6 näyttävät skriptin vääriltä hälytyksiltä |

**Puutteet:**
1. **Nonni-ravintola (Tampere, 25.9.2026) puuttuu.** Vanhaa sivustoa on päivitetty crawlin jälkeen: 8 sivua on muuttunut. Nonni on näistä ainoa todennettu puute. Kaikki 8 sivua on tunnistettu, mutta vain osa muutoksista on tarkistettu productionista, joten muitakin eroja voi olla.
2. **4 kuvaa** jäi siirtämättä.
3. Otsikkoarkiston "HISTORIA"-päivitysotsikot jäivät pois (itse data on tilastosivuilla).
4. **Klubin perustietoja ei tuotu, koska niitä ei ollut vanhallakaan sivulla.** Tällaisia ovat yhteystiedot, hallitus, säännöt, jäsenmaksu ja tapahtumat. Hallituksen tai isän pitää toimittaa ne.

---

## 2. Kokonaistila

| Osa-alue | Arvosana | Tärkein havainto | Tila 30.9.2026 |
|---|---|---|---|
| Sisällön kattavuus (vanha sivusto) | lähes valmis | Migraatio on kattava (198/198, 308/308, 498/498). Nonni puuttuu, 29.9. ottelun aika on väärin ja perustiedot ovat tyhjiä. | Ottelun aika ei ollut virhe. ☐ Nonni ja jäädytys, ☐ perustiedot (isä). |
| Blogi, veikkaus ja kommentit | lähes valmis | 528/528 kirjoitusta ja 502 kommenttia oikein. Kommentointi ei ole vielä päällä missään uutisessa, eikä `sync:blogspot` kirjoita productioniin. | ✅ 529/529 productionissa, tuotantopolku `sync:blogspot:production`. Kommentit käytössä ilman koodisanaa. |
| Ohjaukset ja SEO/GEO | lähes valmis | Sitemap, canonicalit ja JSON-LD ovat kunnossa. Kaikki osoittaa www-domainiin, jossa vanha Apache vastaa yhä. MX-riski domainin siirrossa. | ✅ Vercel-osoitteet noindex. ☐ Domainin siirto (docs/17 §C). |
| Saavutettavuus (WCAG 2.1 AA) | lähes valmis | Perusta on hyvä. Lomakekenttien reunat (1,1:1), pelkällä värillä erottuvat linkit ja tummien pintojen fokusrengas eivät täytä AA-tasoa. | ✅ Korjattu 30.9., axe-testi 48 sivua. Jäljellä korttilinkkien nimet ja Nextin 404-bugi. |
| Suorituskyky ja tekninen laatu | lähes valmis | Next.js 16.2.6:ssa on haavoittuvuuksia, 404-sivu on oletussivu, webhook palauttaa 501 ja sanityFetch nielee virheet. | ✅ Next 16.3.7, oma 404, webhook, sanityFetch heittää virheen, kuvat Sanityn CDN:stä. |
| Tietoturva ja tietosuoja | lähes valmis | Arvostelijoiden sähköpostit päätyisivät julkiseen API:in ja tietosuojaseloste puuttuu. Salaisuuksien käsittely on kunnossa. | ✅ Korjattu. ☐ Hallitus vahvistaa tietosuojaselosteen. |
| CMS ja isän käytettävyys | **keskeneräinen** | Studio ei toimi tuotannossa (CORS). Kolme sisältötyyppiä puuttuu valikosta, tarkistusjonolla ei ole näkymää ja isän opas on virheellinen. | ✅ CORS, valikko, opas, taulukkoeditori, Studio-parannukset. ☐ Perehdytys. |
| Visuaalinen ilme, UX ja linkit | lähes valmis | 0 rikkinäistä linkkiä. Etusivulta puuttuvat hero- ja Klubista-kuvat, Tapahtumat on tyhjä ja ruokatyyppisuodatin on tyhjä. | ☐ Kuvat ja tapahtumat (isä). ☐ Ruokatyyppisuodatin, uutishaku. |
| Julkaisuvalmius ja ylläpito | **keskeneräinen** | Kolme estettä ennen domainin siirtoa: MX, CORS ja webhook. Varmuuskopiointia ei ole, ja CLAUDE.md:n `--replace`-vienti on riski. | ✅ CORS, webhook, varmuuskopio, `--replace` korjattu. ☐ MX/DNS-siirto, ☐ varmuuskopioiden ajastus. |

---

## 3. Julkaisun esteet (kriittiset ja korkeat, tarkistetut)

Eri osa-alueiden päällekkäiset löydökset on yhdistetty. Tunnukset ovat hakasulkeissa.

### Kriittiset

**1. Domainin siirto nykyohjeen mukaan katkaisee info@-sähköpostin** [julkaisu-1, seo-1]
- **Mitä:** MX-tietue osoittaa apex-nimeen `lahdensuomalainenklubi.com` (A 5.44.244.222, Wepardi), joka on sama palvelin kuin vanhalla web-sivustolla. Jos apexin A-tietue vaihdetaan Verceliin, posti ohjautuu Vercelille, jolla ei ole postipalvelinta. Myös SPF:n `+a +mx` alkaa viitata väärään paikkaan. docs/08 Sprint 6 mainitsee vain A/AAAA- tai NS-vaihdon, ei postia.
- **Miksi:** Yhdistyksen sähköposti lakkaisi toimimasta huomaamatta.
- **Korjaus:** Ennen DNS-vaihtoa selvitetään palveluntarjoajalta (int2000/Wepardi), missä postilaatikko sijaitsee. MX vaihdetaan osoittamaan tietueeseen `mail.lahdensuomalainenklubi.com` (se osoittaa jo samaan IP:hen), odotetaan TTL:n verran ja testataan posti. Vasta sen jälkeen vaihdetaan apexin A-tietue Verceliin. NS-vaihtoa Verceliin ei tehdä. Vercel ei käytä AAAA-tietueita, joten docs/08:n ohje korjataan.
- **Kuka:** kehittäjä yhdessä DNS-palveluntarjoajan kanssa. **Työmäärä:** pieni–keskisuuri.

**2. Studio ei toimi tuotannossa: Sanityn CORS sallii vain localhostin** [cms-1, julkaisu-2]
- **Mitä:** `sanity cors list` palauttaa vain `http://localhost:3333`. Osoitteet klubi-blond.vercel.app ja www.lahdensuomalainenklubi.com eivät saa CORS-otsakkeita. Huom: kaksi tarkistusta saivat localhost:3000:lle eri tuloksen, mutta tuotanto-originien osalta tulos on yksiselitteinen.
- **Miksi:** Isä ei pääse muokkaamaan sisältöä lainkaan. Tämä estää myös muut isän tehtävät alla, esimerkiksi ottelun ajan korjauksen ja perustietojen täyttämisen.
- **Korjaus:** `npx sanity cors add <origin> --credentials` osoitteille https://klubi-blond.vercel.app, https://www.lahdensuomalainenklubi.com ja https://lahdensuomalainenklubi.com. Isä kutsutaan projektiin Editor-roolilla, ja kirjautuminen testataan hänen tunnuksellaan.
- **Kuka:** kehittäjä. **Työmäärä:** pieni (minuutteja).

**3. Ravintola-arvostelijoiden sähköpostiosoitteet tallentuisivat julkiseen datasettiin** [cms-2, tietoturva-1]
- **Mitä:** `arvostele/actions.ts:150-159` luo dokumentin `ravintolaKayttajaArvostelu` ja kentän `reviewerEmail` ilman pisteellistä id:tä. Production-datasetti on julkinen, joten sen voi lukea kuka tahansa ilman kirjautumista. Lomake lupaa: "Emme julkaise sähköpostiosoitettasi." Myös moderoimattomat ja hylätyt arvostelut näkyisivät API:ssa. Arvosteluja on nyt 0, joten vuotoa ei ole vielä tapahtunut.
- **Miksi:** Henkilötietojen julkinen paljastuminen on GDPR-riski ja rikkoo lomakkeen lupauksen.
- **Korjaus:** Tehdään yksi seuraavista: (a) arvostelu tallennetaan pisteelliselle id:lle (`arvostelut.<uuid>`) ja hyväksytty versio julkaistaan ilman sähköpostia, (b) sähköpostia ei tallenneta Sanityyn, tai (c) datasetti muutetaan yksityiseksi. Siihen asti lomake piilotetaan tai sähköpostikenttä poistetaan.
- **Kuka:** kehittäjä. **Työmäärä:** keskisuuri.

### Korkeat

**4. Huomisen ottelun (29.9.) kellonaika on väärin** [sisalto-2]
- **Mitä:** Sivulla /ottelut näkyy "Ti 29.9. · 19.00 Suomi – Valko-Venäjä", mutta vanhalla sivulla lukee 21.45. Dokumentti tehtiin vanhan etusivun "Seuraavaksi"-rivistä, jossa kellonaikaa ei ollut. Muiden neljän ottelun ajat ovat oikein. Oikeaa aikaa ei ole tarkistettu riippumattomasta lähteestä.
- **Korjaus:** Isä tarkistaa ajan. Koska Studio ei vielä toimi tuotannossa (este 2), **kehittäjä korjaa ajan heti tai korjaa ensin CORSin**. Jatkossa kellonaikaa ei tuoda lähteestä, jossa sitä ei ole, tai dokumentti merkitään needsReview-lipulla.
- **Kuka:** isä tai kehittäjä. **Työmäärä:** pieni. **Kiireellinen.**

**5. Tietosuojaseloste puuttuu** [tietoturva-2]
- **Mitä:** /tietosuoja, /tietosuojaseloste ja /evasteet palauttavat 404, eikä Sanityssa tai koodissa ole tietosuojasivua. Jäsenhakemus kerää nimen, sähköpostin, puhelimen, syntymävuoden ja paikkakunnan. Arvostelu kerää nimen ja sähköpostin. Suostumusteksti ei kerro rekisterinpitäjää, säilytysaikaa eikä käsittelijöitä (Sanity, Vercel, Resend, siirrot EU:n ulkopuolelle). Evästebanneria ei tarvita, koska evästeitä tai analytiikkaa ei käytetä.
- **Miksi:** GDPR:n artikla 13 edellyttää informointia.
- **Korjaus:** Laaditaan seloste, julkaistaan se Sanity-sivuna /tietosuoja ja linkitetään footeriin ja jokaisen lomakkeen viereen.
- **Kuka:** hallitus hyväksyy sisällön, kehittäjä lisää linkit. **Työmäärä:** keskisuuri.

**6. Next.js 16.2.6:ssa on tunnettuja tietoturvahaavoittuvuuksia** [suorituskyky-1, tietoturva-3]
- **Mitä:** npm audit löytää 31 haavoittuvuutta (2 critical, 15 high). Next-paketille korjaus on saatavilla versiossa 16.3.6 ilman major-päivitystä. Tuotantoa koskevat realistisesti Server Actions -DoS ja cache confusion. Windows-RCE ja AVIF-kuvaoptimoinnin RCE eivät todennäköisesti koske Verceliä. Arviot vaihtelivat korkeasta keskitasoon, mutta päivitys on pieni ja se kannattaa tehdä ennen domainin siirtoa.
- **Korjaus:** `npm i next@16.3.6 eslint-config-next@16.3.6`, sen jälkeen type-check, lint, build ja verify:content, ja deploy. Lisäksi `npm audit fix` ja Dependabot tai Renovate.
- **Kuka:** kehittäjä. **Työmäärä:** pieni.

**7. 404-sivu on Nextin englanninkielinen oletussivu, eikä virhesivuja ole** [suorituskyky-2, ux-1, seo-3]
- **Mitä:** Sivulla lukee "404: This page could not be found.", eikä siinä ole lang-attribuuttia, headeria, footeria eikä tyylejä. Tiedostoja `not-found.tsx`, `error.tsx` ja `global-error.tsx` ei ole, vaikka koodissa on 14 `notFound()`-kutsua. Status 404 ja noindex ovat oikein.
- **Miksi:** Domainin siirron jälkeen tälle sivulle päätyvät kaikki ohjaamattomat vanhat linkit, esimerkiksi 755 vanhaa kuvaosoitetta.
- **Korjaus:** Lisätään `app/(public)/not-found.tsx` suomeksi sivuston ulkoasulla ja linkeillä etusivulle, uutisiin, ravintoloihin ja arkistoon. Lisäksi `error.tsx` ja `global-error.tsx`.
- **Kuka:** kehittäjä. **Työmäärä:** pieni.

**8. Esikatselu (Studion oletusnäkymä) ei toimi tuotannossa** [cms-3, tietoturva-7]
- **Mitä:** /api/draft-mode/enable palauttaa 501, koska `SANITY_API_READ_TOKEN` puuttuu Vercelistä. Presentation on Studion ensimmäinen näkymä, joten isä päätyy ensimmäisenä rikkinäiseen näkymään. `resolve.locations` puuttuu. Tietoturvan kannalta nykytila on turvallinen.
- **Korjaus:** Luodaan Viewer-token ja lisätään se Vercelin Production-ympäristöön. Presentationille lisätään `resolve.locations`, tai structureTool nostetaan ensimmäiseksi näkymäksi.
- **Kuka:** kehittäjä. **Työmäärä:** pieni.

**9. Revalidointi-webhook ei ole käytössä** [julkaisu-3, cms-10, suorituskyky-4, tietoturva-8]
- **Mitä:** POST /api/revalidate palauttaa 501 "SANITY_REVALIDATE_SECRET puuttuu", eikä Sanityssa ole webhookeja. Muutokset näkyvät nyt vain ISR:n vanhentumisen kautta. Viiveestä on ristiriitaisia tietoja: koodin kommentit ja osa auditoinneista puhuvat tunnista, mutta `sanity/lib/fetch.ts` asettaa kaikille hauille `revalidate: 60` ja buildin reittitaulukossa lukee "1m". Todellinen viive on siis todennäköisesti noin minuutti. Isän opas lupaa muutosten näkyvän "heti". Lisäksi arvostelujen (`ravintolaKayttajaArvostelu`) ja kaupunkien tagit eivät vastaa ravintolasivun tageja.
- **Korjaus:** Luodaan salaisuus, lisätään se Verceliin ja luodaan webhook ensin osoitteeseen klubi-blond.vercel.app ja domainin siirron jälkeen www-osoitteeseen. Tyyppiliitännät ravintolaKayttajaArvostelu → ravintola ja kaupunki → ravintola lisätään. Kommentit ja docs/09 päivitetään.
- **Kuka:** kehittäjä. **Työmäärä:** pieni.

**10. Klubin perustiedot puuttuvat, ja tyhjiin sivuihin on linkki valikosta** [sisalto-3, cms-8, ux-3, seo-6]
- **Mitä:** Yhteystiedoissa on vain `city: "Lahti"`. Hallituksen jäseniä, tapahtumia ja galleria-albumeita on kutakin 0. Sivuja `klubi/saannot` ja `klubi/liity` ei ole. Sivuilla /klubi/hallitus, /klubi/saannot, /klubi/yhteystiedot, /tapahtumat ja /galleria näkyy tyhjätilateksti, silti ne ovat indeksoitavia ja sitemapissa. Footerissa lukee vain "Lahti". Sisältö ei ollut vanhallakaan sivulla.
- **Korjaus:** Hallitus tai isä toimittaa docs/09:n "Täytä itse" -tiedot: yhteystiedot, Y-tunnus, IBAN, hallitus, säännöt, jäsenmaksu, liittymisohje ja tulevat tapahtumat. Kehittäjä merkitsee tyhjätilasivut noindexillä ja jättää ne pois sitemapista tai piilottaa ne valikosta, kunnes sisältöä on. Footeriin lisätään linkki yhteystietosivulle.
- **Kuka:** hallitus ja isä, kehittäjä tukee. **Työmäärä:** keskisuuri. Edellyttää, että este 2 on korjattu.

**11. Kolme sisältötyyppiä puuttuu Studion valikosta** [cms-4]
- **Mitä:** `sanity/structure.ts`:ssä ei ole tyyppejä klubiToiminta (9 dokumenttia), arvokisa (15) eikä pelaaja (1). docs/09 ja sivun /klubi/toiminta tyhjätilateksti viittaavat valikkopolkuihin, joita ei ole olemassa.
- **Korjaus:** Valikkoon lisätään "Klubin toiminta" sekä Jalkapalloarkiston alle "Arvokisat" ja "Pelaajat".
- **Kuka:** kehittäjä. **Työmäärä:** pieni.

**12. Tarkistusjonolla (75 dokumenttia) ei ole näkymää eikä syitä** [cms-6, sisalto-5]
- **Mitä:** Productionissa `needsReview==true` on 75 dokumentilla: uutinen 37, ravintola 22, jalkapalloTilasto 10, stadion 3, klubiToiminta 2 ja pelaaja 1. docs/09 kertoo 57. Studiossa ei ole suodatettua listaa, eikä skeemassa ole syykenttää, joten syyt ovat vain raporttitiedostoissa. ⚠-merkki näkyy ravintoloilla ja piilotetuilla tyypeillä, mutta ei uutisilla, tilastoilla eikä stadioneilla.
- **Korjaus:** Valikkoon lisätään "Tarkistettavat"-lista (ryhmiteltynä tyypeittäin) ja ⚠-merkki kaikkiin tyyppeihin. Skeemaan lisätään vain luku -kenttä `needsReviewReason`, jonka import-skriptit täyttävät raporteista. Luvut päivitetään docs/09:ään.
- **Kuka:** kehittäjä. **Työmäärä:** keskisuuri.

**13. Isän opas (docs/09) sisältää virheitä ja siitä puuttuu työnkulkuja** [cms-11, julkaisu-5, sisalto-5]
- **Mitä:**
  - Oppaan mukaan arvostelusta tulee sähköposti, mutta mitään ei lähetetä.
  - Opas neuvoo "Save draft" -painiketta, jota Sanity v5:ssä ei ole.
  - "X piilottaa tilapäisesti" poistaa todellisuudessa lohkon.
  - Tapahtumien järjestys ei ole oletuksena "uusin ensin".
  - Oppaan valikkopolkuja ei ole olemassa.
  - Studio-osoite www…/studio palauttaa nyt 404.
  - Tarkistettavien määrä on vanhentunut (57, oikea 75).
  - Oppaassa neuvotaan piilottamaan kommentti poistopyynnön perusteella, mutta piilotettu kommentti näkyy yhä API:ssa [tietoturva-5].
  - Puuttuvat työnkulut: ottelut, galleria, kuva tekstin sekaan, uusi arvokisa, uusi sivu ja palloveikkaustaulukon päivitys.
- **Korjaus:** Opas kirjoitetaan uudelleen esteiden 2, 8, 11 ja 12 jälkeen kuvakaappausten kanssa ja käydään läpi isän kanssa Studiossa.
- **Kuka:** kehittäjä. **Työmäärä:** keskisuuri.

---

## 4. Julkaisun tarkistuslista (järjestyksessä)

> Tila päivitetty 30.9.2026. Kohdan alussa tila, sen jälkeen alkuperäinen tehtävä.

### A. Heti (tällä viikolla)
1. ✅ Ei virhe (19.00 oikein, vahvistettu 28.9.). — **29.9. ottelun kellonaika** tarkistetaan ja korjataan (este 4).
2. ✅ CORS 28.9., isän kutsu lähetetty. ☐ Isän ensimmäinen kirjautuminen testataan perehdytyksessä. — **Sanity CORS**: lisätään klubi-blond, www ja apex credentials-valinnalla. Isä kutsutaan Editoriksi ja kirjautuminen testataan (este 2).
3. ✅ 28.9. — **Vercel-ympäristömuuttujat**: lisätään `SANITY_API_READ_TOKEN` ja `SANITY_REVALIDATE_SECRET`, luodaan webhook osoitteeseen klubi-blond.vercel.app, tarkistetaan 200-vastaus webhookin lokista ja tehdään redeploy (esteet 8 ja 9). Samalla varmistetaan, että `SANITY_API_WRITE_TOKEN` on olemassa ja rajattu.
4. ✅ Nyt 16.3.7 (30.9.). — **Next.js 16.3.6** ja `npm audit fix`, sen jälkeen type-check, lint, build ja deploy (este 6).
5. ✅ 28.9. (ei sähköpostia, luonnoksena). — **Arvostelulomake**: sähköpostin tallennus korjataan tai lomake piilotetaan (este 3).

### B. Ennen domainin siirtoa
6. ✅ 28.9. ☐ Hallitus vahvistaa sisällön (Studiossa "Vaatii tarkistuksen"). — **Tietosuojaseloste** julkaistaan ja linkitetään footeriin ja lomakkeisiin (este 5).
7. ✅ 28.9. Huom.: Next 16.3 -bugi (issue #99287), 404-sivun sisältö renderöityy vasta selaimessa. — **Oma 404- ja virhesivu** suomeksi (este 7).
8. ✅ 28.9. — **Studion rakenne**: puuttuvat tyypit, Tarkistettavat-lista ja syykenttä (esteet 11 ja 12). Lisäksi suomenkielinen Studio `@sanity/locale-fi-fi` ja Vision piilotetaan isältä.
9. ✅ Opas päivitetty 30.9. (taulukkoeditori, galleria, joukkue-ehdotukset, sisällön kieli). ☐ Koulutuskerta. ☐ Isä käy läpi 76 tarkistettavaa. — **Isän opas** päivitetään ja isän kanssa pidetään koulutuskerta (este 13). Isä käy läpi 75 tarkistettavaa dokumenttia.
10. ☐ Isä ja hallitus (tilanne 30.9.: yhteystiedoissa vain kaupunki, hallitus 0, tapahtumat 0). — **Perustiedot** täytetään Studiossa, tai tyhjät sivut piilotetaan valikosta ja merkitään noindexillä (este 10).
11. ✅ Koodi lukee osoitteen Yhteystiedoista (30.9.). ☐ Hallitus vahvistaa postilaatikon ja osoite tallennetaan Studioon (nyt tyhjä: sähköposti ei näy sivustolla). — **info@-osoite**: hallitus vahvistaa, että postilaatikko on olemassa ja sitä luetaan. Osoite tallennetaan yhteystiedot-singletoniin, ja koodi lukee sen sieltä.
12. ✅ Ratkaistu 28.9.: sivusto ei ota jäsenhakemuksia vastaan (ei Resendiä), maininta poistettu tietosuojaselosteesta. — **Jäsenhakemukset**: hallitus päättää vastaanottajan. Otetaan Resend käyttöön (DKIM-tietue Wepardin DNS:ään ja muuttujat Verceliin) ja lähetetään oma testihakemus, tai päätetään, että lomake ohjaa sähköpostiin.
13. ✅ Ratkaistu: koodisana poistettu kokonaan, kommentit julkaistaan heti ja isä piilottaa asiattomat. — **Kommentit**: isä asettaa koodisanan (sitä ei ole tällä hetkellä, `secrets.kommenttikoodi` puuttuu). Tehdään yksi hyväksymistesti tuotannossa piilotetulla testiuutisella.
14. ☐ Sovitaan isän kanssa. — **Sisällön jäädytyspäivä** sovitaan isän kanssa. Sen jälkeen muutoksia tehdään vain Studioon. Nonni lisätään. Last-Modified-tarkistus ajetaan uudelleen kaikille 198 URL:lle ja erot synkataan.
15. ✅ Polku valmis 30.9. (`npm run sync:blogspot:production`), 529/529 productionissa. ☐ Viimeinen ajo jäädytyspäivänä. — **Blogin viimeinen synkronointi productioniin**: tehdään dokumentoitu `--missing`-polku, koska nykyinen `sync:blogspot` kirjoittaa vain developmentiin. Lopuksi ajetaan `SANITY_VERIFY_DATASET=production npm run verify:blogspot`.
16. ✅ 28.9. (varmuuskopiot 28.9. ja 30.9.). — **CLAUDE.md:n dataset-käytäntö** korjataan: ei enää `--replace`-vientiä dev → prod, kun isä muokkaa productionia. **Ensimmäinen varmuuskopio productionista** otetaan.
17. ✅ 30.9.: kaikki `*.vercel.app`-osoitteet `X-Robots-Tag: noindex, nofollow` (next.config.ts). — **klubi-blond.vercel.app** merkitään noindexillä (`X-Robots-Tag` host-ehdolla).
18. ◐ 30.9.: verify:redirects (0 rikki) ja saavutettavuustesti (48 sivua) ajettu. ☐ verify:content preview-osoitetta vastaan. ☐ Vanhan sivuston varmuuskopio (Wepardi). — Tarkistukset preview-osoitetta vastaan: type-check, lint, verify:content ja verify:redirects. **Vanhasta sivustosta otetaan varmuuskopio** (Wepardi: tiedostot ja posti).

### C. Domainin siirtopäivä
19. ☐ **Vuorokautta ennen**: DNS-tietueiden TTL lasketaan 300 sekuntiin.
20. ☐ **Posti ensin**: MX vaihdetaan osoittamaan tietueeseen `mail.lahdensuomalainenklubi.com`. Odotetaan TTL:n verran, ja lähetys ja vastaanotto testataan. SPF siivotaan (`+a` poistetaan tai korvataan eksplisiittisellä ip4:llä) (este 1).
21. ☐ **Vercel → Domains**: `www.lahdensuomalainenklubi.com` asetetaan ensisijaiseksi, ja apex ohjataan 308:lla www-osoitteeseen.
22. ☐ **Wepardin DNS**: apexin A-tietueeksi 76.76.21.21 ja www CNAME `cname.vercel-dns.com`. **NS-vaihtoa ei tehdä, eikä MX-, SPF- tai DKIM-tietueisiin kosketa.**
23. ☐ Odotetaan, että HTTPS-varmenne valmistuu. Tarkistetaan https://www., apex, http→https, /studio, /sitemap.xml ja /api/og. Ajetaan `BASE_URL=https://www.lahdensuomalainenklubi.com npm run verify:redirects` ja `verify:content` sekä sitemap-crawl.
24. ☐ **Webhookin URL** vaihdetaan www-osoitteeseen.
25. ☐ **klubi-blond.vercel.app** ohjataan 308:lla www-osoitteeseen.
26. ☐ **Blogi**: tarkistetaan, että `curl -I https://www.lahdensuomalainenklubi.com/blogspot/<polku>` palauttaa 308. **Vasta sen jälkeen** blogiin kirjoitetaan muuttoilmoitus ja teemaan lisätään ohjausskripti (docs/14 §5). Blogi poistetaan JSON-LD:n sameAs-listasta.
27. ☐ **Search Console**: Domain-omaisuus vahvistetaan TXT-tietueella (SPF säilytetään ennallaan), sitemap lähetetään ja 5–10 avainsivulle tehdään URL-tarkistus. Osoitteenmuutostyökalua ei tarvita. Bing tuodaan Search Consolesta.
28. ☐ Jakoesikatselu testataan (Facebook Sharing Debugger, LinkedIn Post Inspector).

### D. Siirron jälkeen
29. ☐ Seurataan kahden viikon ajan Vercelin 404-lokia ja Search Consolen Sivut-raporttia.
30. ☐ README, docs/08, docs/14, docs/15 ja CLAUDE.md:n linkit päivitetään.
31. ☐ **Wepardin web-osa irtisanotaan vasta, kun posti on varmasti erotettu tai siirretty.**

---

## 5. Parannukset julkaisun jälkeen (keskitaso)

### Isän käytettävyys ja Studio
- ✅ *Korjattu 30.9.2026: taulukkoeditori, ks. docs/19.* **Tilastotaulukoiden muokkaus** avain–arvo-soluina on käytännössä mahdotonta. Esimerkiksi palloveikkauksessa on 31 saraketta, joten yksi rivi vaatii 31 soluobjektia. Ratkaisuksi tehdään ruudukkosyöttö tai "liitä CSV/Excelistä" -toiminto. [cms-5] Työmäärä **suuri**.
- ✅ *Korjattu 30.9.2026: poistettu Studion valikosta (skeema ja data säilyvät). Logo on tyylioppaan brändikuva (public/brand), kuvaus tulee etusivulta ja jakokuvat generoidaan.* **"Sivuston asetukset" -singleton ei vaikuta sivustoon.** Se joko kytketään käyttöön tai piilotetaan. [cms-7, suorituskyky-3]
- ✅ *Korjattu 28.9.2026 (`@sanity/locale-fi-fi`).* **Studio on englanniksi**, mikä on CLAUDE.md:n käytännön 3 vastaista. [cms-13]
- ✅ *Korjattu 30.9.2026: valintaruudut (uutiset ja ravintoloiden ruokatyyppi). Kaikki nykyiset kategoriat olivat listan arvoja.* **Kategorioiden valintalista ei toimi** (`layout: "tags"` ohittaa listan), joten isä kirjoittaa kategoriat vapaasti ja kirjoitusvirheet rikkovat suodattimen. [cms-16]
- ✅ *Korjattu 30.9.2026: `lib/yhteystiedot.ts` lukee osoitteen Yhteystiedoista, eikä tyhjää korvata oletuksella. Huom.: tuotannossa kenttä on vielä tyhjä (docs/09 "Täytä itse").* **info@-osoite on kovakoodattu** viiteen kohtaan (`lib/defaults.ts:53`, arvostelu- ja kommenttiactionit, `arvostele/page.tsx`). Osoite luetaan jatkossa yhteystiedot-singletonista, ja jos kenttä on tyhjä, osoitetta ei näytetä. [sisalto-4, cms-9]

### Saavutettavuus (WCAG AA)
- ✅ *Korjattu 30.9.2026. uusi token `--border-input` #7c7f8c = 3,98:1 valkoisella, 3,68:1 paperilla.* Lomakekenttien reunojen kontrasti on 1,10–1,19:1 (vaatimus 3:1). [saavutettavuus-1]
- ✅ *Korjattu 30.9.2026. 28 tekstilinkkiä alleviivattu pysyvästi (tyylioppaan mukaisesti); sininen erottuu leipätekstistä vain 1,92:1.* Tekstin sisäiset linkit erottuvat vain värillä (taso A, 1.4.1), koska alleviivaus näkyy vain hoverissa. [saavutettavuus-2]
- ✅ *Korjattu 30.9.2026. fokussäännöt `@layer base`:en; tummilla pinnoilla `--ring` on valkoinen (15,8:1).* Globals.css:n kerrostamattomat fokussäännöt ohittavat komponenttien fokustyylit, ja rengas näkyy tummilla pinnoilla huonosti (1,8:1). [saavutettavuus-3]

### Tekninen kestävyys ja kustannukset
- ✅ *Korjattu 30.9.2026: virhe heitetään eteenpäin. ISR tarjoaa silloin viimeisimmän onnistuneen sivun, build kaatuu (Vercel pitää edellisen version) ja välimuistissa olematon sivu näyttää virhesivun (500), ei 404:ää. Testattu olemattomalla datasetillä. Ulkoinen otteluohjelma (lib/ottelut.ts) jää tarkoituksella vikasietoiseksi.* `sanityFetch` nielee virheet varadataan, joten Sanityn katkos voi tallentaa välimuistiin tyhjiä tai 404-sivuja, ja build voi "onnistua" tyhjänä. [suorituskyky-6]
- ✅ *Korjattu 30.9.2026: `lib/sanity-image-loader.ts` (next/image → Sanityn CDN, rajaus ja polttopiste säilyvät, ei suurennusta). Brändikuvat pienennetty valmiiksi (`npm run brandikuvat`, ~57 kt → 5 kt). `/_next/image` ei ole enää käytössä.* Kaikki kuvat kulkevat Vercelin Image Optimizationin kautta (1700 kuvaa, 1,05 GB), mikä on kiintiöriski Hobby-tasolla. Ratkaisuksi otetaan käyttöön Sanityn CDN-loader. [suorituskyky-8]
- ◐ *30.9.: `npm run backup` käytössä, ajastus puuttuu.* Varmuuskopiointia ei ole. Lisätään `npm run backup` ja ajastus. [julkaisu-7]
- ✅ *Korjattu 28.9.* CLAUDE.md:n `--replace`-vienti ylikirjoittaisi isän muutokset. [julkaisu-6] Tämä korjataan jo tarkistuslistan kohdassa 16.

### Sisältö ja blogi
- Nonni-ravintola ja sisällön jäädytys. [sisalto-1]
- ✅ *Korjattu 30.9.2026: `npm run sync:blogspot:production` (kuivaharjoitus, `--vie`: varmuuskopio + `--missing` + tarkistus) ja dynaaminen `/blogspot`-reitti, jolla uudet kirjoitukset ohjautuvat ilman deployta (docs/14 §5–6).* `sync:blogspot` kirjoittaa vain developmentiin, joten tarvitaan dokumentoitu production-polku. [blogi-2]
- ✅ *Korjattu 30.9.2026: docs/14 §6.4 vaihe 3.* docs/14 §6.3:sta puuttuu ehdoton vaihe "domain osoittaa Verceliin". Jos teemaskripti asennetaan liian aikaisin, blogin kävijät ohjautuvat 404-sivulle. [blogi-1]

### SEO ja UX
- Viisi tyhjätilasivua on indeksoitavia ja sitemapissa. [seo-6]
- Päänavigaation Tapahtumat on tyhjä, eikä etusivulla ole tapahtumasaraketta. [ux-2]
- Ruokatyyppisuodattimessa ei ole yhtään vaihtoehtoa (cuisine 0/498), vaikka ingressi mainitsee sen. [ux-4]
- Etusivulta puuttuvat tyylioppaan hero-kuva (4:5) ja Klubista-kuva. Isä valitsee ne. [ux-6]
- 750 uutisessa ei ole hakua, ja 50 uutiselta puuttuu kategoria. [ux-8]

### Ylläpito
- ✅ *Ratkaistu 28.9.: jäsenhakemuksia ei oteta vastaan sivuston kautta.* Jäsenhakemuksen sähköpostilähetys (Resend) ei ole käytössä. Vercelin tilaa ei voitu todentaa. [julkaisu-4]

---

## 6. Pienet havainnot (matala ja info)

**Sisältö ja data**
- 4 kuvaa siirtämättä: `hyypia070912.jpg`, `tainio.jpg`, `maajoukkuekuva080602muuri.jpg` ja `ruokailuLPRiskenderbar170731.jpg`, joka kuuluu Lalolle. Lisäksi 2 käyttämätöntä jpg-assettia. [sisalto-7]
- Ravintoloiden tähtiluokka (1–5 ja sanallinen selite) on tallessa, mutta se ei näy sivulla. [sisalto-6]
- Pienten ravintolasivujen ohjaukset vievät sivutettuun maakuntanäkymään, jonka ensimmäisellä sivulla vanhan sivun ravintoloita ei näy. [sisalto-8]
- Otsikkoarkiston HISTORIA-otsikot kannattaa kirjata tietoisesti pudotetuiksi. [sisalto-9]
- Ohjaukset ovat 308 eivätkä 301. Hakukoneille ne ovat vastaavat, mutta CLAUDE.md ja docs/07 päivitetään. [sisalto-10]
- Vanhentunut ja lukittu "Seuraava ottelu" -kenttä näkyy etusivun editorissa. [cms-18]
- 43 blogikirjoitusta on ilman kategoriaa, mikä on docs/14:n mukaista. [blogi-9]

**Blogi ja kommentit**
- Kommentointi ei ole päällä missään uutisessa, ja koodisana puuttuu. Tämä on tarkoituksellisesti vaiheistettu. [blogi-3, cms-12]
- docs/09:n Duplicate-vinkki kopioisi vanhan blogikirjoituksen blogspot-kentän. [blogi-4]
- ✅ *Korjattu 30.9.2026.* Testiesimerkki `/blogspot/2019/03/milano.html` on väärä polku. [blogi-5]
- Vanhentuneita tietoja on docs/14:ssä, docs/15:ssä ja uutinen.ts:n kenttäkuvauksessa. [blogi-6]
- Blogi on JSON-LD:n sameAs-listassa. [blogi-7]
- Käyttöönottoaikataulu päätetään ennen joulukuun "paras avaus" -kierrosta. [blogi-8]

**SEO**
- klubi-blond.vercel.app on indeksoitavissa. [seo-4, julkaisu-14]
- robots.txt estää /api/og-kuvat. [seo-5]
- Sitemapin lastmod on kaikilla sivuilla migraatiopäivä. [seo-7]
- Päällekkäisiä title-tageja: esim. McDonald's 9 kertaa. [seo-8]
- 6 sivulta puuttuu kuvaus. [seo-9]
- ✅ *Korjattu 30.9.2026. /klubi: sivuston nimeä ei toisteta (`buildMetadata`).* Pitkiä otsikoita, ja /klubi-sivun otsikko toistaa sivuston nimen. [seo-10, saavutettavuus-14]
- Organization-merkinnästä puuttuvat logo ja sähköposti. [seo-12]
- Blogspot on julkinen siirtoon asti. [seo-13]
- verify:redirects antaa 6 väärää hälytystä. [seo-14]
- Vanhat kuvaosoitteet (755 kpl) jäävät ilman ohjausta. [seo-15]
- `?sivu=999` antaa indeksoitavan tyhjän sivun. [seo-16, ux-12]

**Saavutettavuus**
- ✅ *Korjattu 30.9.2026. sivulle kenttä "Sisällön kieli" (Studio). Tuotannon /english-sivulle valitaan Englanti deployn jälkeen.* /english on merkitty suomeksi. [saavutettavuus-4, seo-11]
- ✅ *Korjattu 30.9.2026. fokus palautetaan siirretyn joukkueen painikkeeseen.* Sarjajärjestyskomponentin fokus katoaa (koodianalyysi). [saavutettavuus-5]
- Taulukoita on kuvina ilman tekstivastinetta. [saavutettavuus-6]
- Korttilinkkien nimet ovat pitkiä. [saavutettavuus-7]
- ✅ *Korjattu 30.9.2026. alt tyhjätään, kun se toistaa näkyvän kuvatekstin (`SanityImage kuvateksti`). Epävarmat alt-tekstit ovat sisältötyötä.* Otteluohjelmakuvien alt-tekstit ovat epävarmoja ja toistavat kuvatekstin. [saavutettavuus-8]
- ✅ *Korjattu 30.9.2026. vain kuva haalistetaan (oli 3,72:1); "Toiminta loppunut" näkyy myös mobiilissa.* Lopettaneiden ravintoloiden kortit jäävät alle kontrastivaatimuksen. [saavutettavuus-9]
- ✅ *Korjattu 30.9.2026. Esc palauttaa fokuksen, Tab ulos sulkee, aria-controls ja aria-current, ei aria-haspopupia (disclosure-malli).* Dropdownin Esc ja Tab-käytös on puutteellinen. [saavutettavuus-10]
- ✅ *Korjattu 30.9.2026. kommenttilomake kuten arvostelulomake.* Lomakkeet eivät siirrä fokusta virheyhteenvetoon. [saavutettavuus-11]
- ✅ *Korjattu 30.9.2026. `PortableText ylinOtsikko`, `CardTitle as`, yksilöllinen id; tyhjä riviotsikko `<td>`:ksi.* Otsikkotasoissa on hyppyjä, ja ravintolasivulla on tuplattu id. [saavutettavuus-12]
- ✅ *Korjattu 30.9.2026. `UusiValilehti` kaikissa 7 kohdassa, somekuvakkeet 44 px.* Uuteen välilehteen avautuvista linkeistä ei varoiteta, ja somekuvakkeet ovat 36 px. [saavutettavuus-13]
- ✅ *Korjattu 30.9.2026. `npm run test:saavutettavuus` (axe-core, WCAG 2.1 A/AA, 48 sivua sitemapista). Kontrasti lasketaan tokeneista, koska jsdomissa ei ole asettelua.* Automaattista axe-testausta ei ole. [saavutettavuus-15]
- **Uusi havainto 30.9.2026:** Next.js 16.3.6–16.3.7 palauttaa `notFound()`-sivut tyhjänä virhekuorena ilman `lang`-attribuuttia (sisältö renderöityy selaimessa). Nextin bugi: https://github.com/vercel/next.js/issues/99287. HTTP-tila (404), otsikko ja noindex ovat oikein. Päivitetään Next, kun korjaus julkaistaan; testi raportoi tämän varoituksena.

**Tekniikka**
- ISR-väli on todellisuudessa 60 s eikä 3600 s. [suorituskyky-5]
- /uutiset ja /ravintolat ovat dynaamisia (TTFB 300–560 ms). [suorituskyky-7]
- /huuhkajat-sivun HTML on 1,0 MB. [suorituskyky-9]
- CI:tä ei ole, ja tsx, domhandler ja @sanity/client ovat julistamattomia riippuvuuksia. [suorituskyky-10]
- Koodissa on käyttämättömiä exportteja. [suorituskyky-11]
- Build riippuu Google Fontsista. [suorituskyky-12]
- Major-päivitykset odottavat (sanity 6, next-sanity 13). [suorituskyky-13]

**Tietoturva**
- HTTP-turvaotsakkeista on vain HSTS. [tietoturva-4]
- Piilotetut kommentit ovat API:ssa luettavissa. [tietoturva-5]
- Koodisanan arvaamista ei rajoiteta. [tietoturva-6]
- Revalidate-reitti palauttaa virheviestin asiakkaalle. [tietoturva-9]
- Repo on julkinen, ja commiteissa näkyy henkilökohtainen sähköposti. [tietoturva-10]

**CMS ja UX**
- Listasivujen johdannot on kovakoodattu. [cms-14]
- Tyhjätilat näyttävät kävijöille ylläpitäjän ohjeita, ja galleriaan on linkki footerissa. [cms-15, ux-13]
- Uutislistalla ei ole oletusjärjestystä. [cms-17]
- href-kentille ei ole validointia, ja varattuja polkuja puuttuu. [cms-19]
- Galleria-albumin kuvien lisääminen on työlästä. [cms-20]
- Arvosanavalinta 4,5 ei palauta koskaan tuloksia. [ux-5]
- Mobiilissa on 4 px:n vaakavieritys SectionNavin takia. [ux-7]
- Ravintoloissa ei ole nimihakua. [ux-9]
- Etusivun pääjuttuna on pistetaulukko. [ux-10]
- Ravintoloilta puuttuvat tuomiot ja hintatasot. [ux-11]
- Termit vaihtelevat, esim. arvio/arvostelu. [ux-14]
- Uutiskortit ovat eripituisia. [ux-15]
- Klubin alanavigaatiossa on "Liity jäseneksi", vaikka tyyliopas kieltää liittymiskehotteet. Hallitus päättää. [ux-17]

**Dokumentaatio ja ylläpito**
- Isän oppaan Studio-osoite palauttaa nyt 404. [julkaisu-5]
- Free-tierin dokumenttikiintiön käyttö on epävarma: kahdessa datasetissa on yhteensä 7568 dokumenttia. [julkaisu-8]
- README on vanhentunut. [julkaisu-9]
- docs/08:ssa on 44 avointa ruutua, joista suurin osa on jo tehty. [julkaisu-10]
- CLAUDE.md:n linkit ovat täyttämättä, ja skriptit käyttävät olematonta osoitetta klubi.vercel.app. [julkaisu-11]
- Write-tokenia ei voitu todentaa. [julkaisu-12]
- Blogin sulkeminen on suunnitelman mukaan kesken. [julkaisu-13]
- .env.example ei kata skriptien muuttujia. [julkaisu-15]
- Yhdistetyt feature-haarat ovat paikallisesti. [julkaisu-16]

**Hyvin tehty (ei toimenpiteitä):** migraation kattavuus [sisalto-11], sitemap, canonicalit, JSON-LD ja ohjaukset [seo-17], saavutettavuuden perusasiat [saavutettavuus-16], JS-bundlet ja kuvien toimitus [suorituskyky-14], salaisuuksien käsittely [tietoturva-11], skeemojen ja datan eheys [cms-21] sekä sisäiset linkit ja tyylioppaan tokenit [ux-16].

---

## 7. Mitä tarkistettiin ja mitä ei voitu tarkistaa

### Tarkistettiin
- **Sisältö:** 198 URL:ia ja 308 dokumenttia GROQ-kyselyllä. verify:content (1482 dokumenttia). Sanavertailu 147 sivulle. Ravintolamäärät 45 ruokailusivulta. Taulukkorivit otoksesta. Kuvien SHA1-vertailu (1073 kuvaa). HEAD-pyynnöt kaikille 198 vanhalle URL:lle.
- **Blogi:** Blogin syötteet (528 kirjoitusta, 2140 kommenttia). verify:blogspot productionia vasten. 20 kirjoituksen otos. Kaikki 90 kommentoitua uutista. Koodisanan suojaus eri perspektiiveillä.
- **SEO:** Sitemapin kaikki 1363 URL:ia (status, title, canonical, JSON-LD). verify:redirects (727 ohjausta). DNS-tietueet. 404-käytös 11 polulla.
- **Saavutettavuus:** 19 sivua omalla jäsentimellä. Kontrastit tokeneista. Tuotannon CSS-kaskadi. Lomakekomponenttien koodikatselmointi.
- **Tekninen laatu:** type-check, lint, test:kommentit, build (2 ajoa), npm audit, TTFB 16 URL:lle ja bundlekoot.
- **Tietoturva:** Server Actionit rivi riviltä. Noin 20 kirjautumatonta GROQ-kyselyä. HTTP-otsakkeet. 23 client-chunkia skannattu salaisuuksien varalta. Git-historia.
- **CMS:** Kaikki 25 skeemaa. `sanity schema validate` ja `documents validate`. CORS-lista ja webhookit kirjautuneena CLI:llä. docs/09 verrattu Studioon ja dataan.
- **UX:** Kaksi indeksointia (1418 sivua). Playwright-mobiilimittaus 22 sivulle. Kuvakaappaukset.
- **Julkaisuvalmius:** DNS, postipalvelimen portit, RDAP, git-tila ja dokumentit.

### Ei voitu tarkistaa (kattavuusaukot)
- **Vercelin asetuksia ei nähty.** Ympäristömuuttujista vain `SANITY_API_READ_TOKEN`- ja `SANITY_REVALIDATE_SECRET`-muuttujien puuttuminen todennettiin 501-vastauksista. `SANITY_API_WRITE_TOKEN`, `RESEND_*`, `JASENHAKEMUS_*` ja `TASO_*` ovat tuntemattomia. Domain-asetuksia ja käyttötilastoja (Image Optimization -kiintiö) ei nähty.
- **Lomakkeita ei lähetetty** sääntöjen mukaisesti. Jäsenhakemuksen, kommentin ja arvostelun toiminta tuotannossa sekä niiden virhe- ja onnistumisviestit jäivät todentamatta.
- **Postilaatikkoa info@lahdensuomalainenklubi.com ei todennettu.** MX-tietue on olemassa ja portit 993 ja 587 ovat auki, mutta porttia 25 ei voitu testata. Wepardin sopimusta ja domainin hallintatunnuksia ei selvitetty.
- **29.9. ottelun oikeaa aloitusaikaa** ei tarkistettu riippumattomasta lähteestä.
- **Studioon ei kirjauduttu selaimessa** isän roolissa. CORS-este on päätelty listasta ja preflight-vastauksista. Presentation-näkymää ei nähty. Isän jäsenyyttä projektissa ei tarkistettu.
- **Selain- ja ruudunlukijatestaus jäi tekemättä.** Chrome-laajennus ei toiminut. Fokusjärjestystä, zoomausta (200–400 %) ja NVDA- tai VoiceOver-käyttöä ei testattu. Kontrastit on laskettu tokeneista eikä renderöidystä sivusta. Kommenttilomaketta ei renderöidy millään sivulla, joten löydös saavutettavuus-5 perustuu vain koodiin.
- **Lighthousea ja Core Web Vitalsia ei mitattu.** TTFB mitattiin yhdestä sijainnista.
- **Googlen Rich Results Testiä, Search Consolea ja Bingiä ei käytetty.** Ei tiedetä, onko vercel.app jo indeksoitu, eikä vanhan sivuston hakuliikennettä tunneta.
- **Sanity free-tierin rajat** (projekti- vai datasetkohtainen), luonnosten määrä ja webhookien suodattimet jäivät tarkistamatta.
- **Sanavertailu on sanajoukkotasoinen.** Se ei havaitse järjestys- tai numeroarvovirheitä. Numerot tarkistettiin vain otoksesta. Ravintoloiden arvostelutekstit tarkistettiin vain viideltä ravintolalta. Kuvien visuaalista vastaavuutta ei arvioitu.
- **Vanhaa sivustoa päivitetään yhä.** Tilanne on 28.9.2026. Kahdeksasta muuttuneesta sivusta tarkistettiin Nonni-muutos, ja muiden muutosten viennistä tehtiin osittainen tarkistus.
- **ISR:n käytöstä Sanity-katkoksen aikana** ei voitu testata. Löydös suorituskyky-6 on koodista tehty päätelmä.
- **Vanhojen blogikommenttien (502) sisältöä ei käyty läpi** henkilötietojen varalta.
- **Ristiriitoja auditointien välillä:**
  - Revalidoinnin viive: koodin kommentit sanovat tunti, mutta build-taulukon mukaan se on minuutti. Tässä raportissa pidetään todennäköisenä minuuttia.
  - CORS-preflightin tulos localhost:3000:lle vaihteli. Tuotanto-originien osalta tulos on yksiselitteinen.
  - Next.js-haavoittuvuuksien vakavuus arvioitiin korkeaksi tai keskitasoksi. Tässä raportissa ne käsitellään julkaisua edeltävänä korjauksena.
