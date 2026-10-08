# Lahden Suomalainen Klubi ry, uusi sivusto: julkaisuvalmiusraportti

**Päiväys:** 5.10.2026
**Kohde:** https://www.lahdensuomalainenklubi.com (domain siirretty Verceliin 4.10.2026)
**Lukijat:** kehittäjä ja isä (sihteeri, ylläpitäjä)
**Pohja:** 13 osa-alueen asiantuntija-auditointi. Kaikki osa-alueet saatiin auditoitua.

---

## 1. Tiivistelmä

**Kokonaisarvio: valmis korjauksin.**
**Kokonaisarvosana: 7,9 / 10.** Luku on 13 osa-alueen keskiarvo.

Kriittisiä löydöksiä ei ole. Korkeita on yksi, ja se löytyi kahdelta osa-alueelta: tietosuojaselosteessa ilmoitettu info@-osoite ei ota postia vastaan. Kaikki muut löydökset ovat keskitasoa tai matalia. Varmistuksessa seitsemän alun perin korkeaksi arvioitua löydöstä laskettiin keskitasolle.

Tärkeimmät viestit:

1. **Tekninen perusta on ammattimaisella tasolla.** Axe-testissä 66 sivua meni läpi ilman ainuttakaan WCAG 2.1 A/AA -rikkomusta. Sitemapin 1723 osoitteesta jokainen palauttaa 200. Vanhoista ohjauksista 726/730 toimii, ja loput 4 ovat tarkistusskriptin vääriä hälytyksiä. Productionin validoinnissa on 0 virhettä ja 0 rikkinäistä viittausta. Type-check, lint ja 14 testipakettia menevät läpi.
2. **Puhelimella sivusto toimii hyvin.** Millään sivulla ei ole vaakavieritystä 320, 360 eikä 390 px:n leveydellä, eikä iOS zoomaa lomakekenttiin. Arvostelusovellus on tehty kuin oikea sovellus. Korjattavia mobiilivikoja on kaksi: mobiilivalikko jää auki tietyissä tilanteissa, ja ravintolasivun arvosanataulukon Keskiarvo-sarake jää ruudun ulkopuolelle.
3. **Sivusto näyttää osin keskeneräiseltä, koska sisältöä puuttuu.** Hallitus, yhteystiedot, tapahtumat ja galleria ovat tyhjiä. Ne ovat silti valikossa, footerissa, sitemapissa ja indeksoitavina. Galleria näyttää kävijälle ohjeen ylläpitäjälle. Tämä on lähinnä isän ja hallituksen sisältötyötä.
4. **Tietosuoja on kunnossa vasta, kun J1 on korjattu.** Selosteen yhteysosoite ei toimi, hallitus ei ole vahvistanut selostetta, eikä seloste kerro klubilaisten arvosanoista.
5. **Jatkuvuus nojaa yhteen ihmiseen.** Valvontaa ei ole, viikkovarmuuskopiot ovat samassa Sanity-projektissa kuin data, repo on Veikon henkilökohtaisella tilillä, ja domainin rekisteröijä ja DNS-vyöhykkeen säilyminen Zonerilla ovat selvittämättä.

---

## 2. Osa-alueet

| Osa-alue | Arvosana | Kriittiset | Korkeat | Tila |
|---|---|---|---|---|
| Mobiilikäyttö ja responsiivisuus | 8,5 | 0 | 0 | Suunniteltu puhelin edellä. Mobiilivalikossa yksi toimintavirhe, PWA-manifesti kaikilla sivuilla. |
| Mobiilin todellinen renderöinti | 8,5 | 0 | 0 | Ei vaakavieritystä, LCP 0,2–0,5 s. Ravintolan arvosanataulukko ja tyhjä galleria vaativat korjausta. |
| Saavutettavuus (WCAG 2.1 AA) | 8,5 | 0 | 0 | Axe: 66 sivua, 0 rikkomusta. /english-sivun kieli ja blogikuvien alt-tekstit puuttuvat. |
| Suorituskyky ja Core Web Vitals | 7,5 | 0 | 0 | Perusta hyvä. Todellinen päivitysväli on 60 s CDN:n ohi, loading.tsx puuttuu ja listasivut ovat dynaamisia. |
| Sanity Studion käytettävyys | 8 | 0 | 0 | Suomeksi ja suojattu. Linkkikentät, poisto ja kopiointi voivat rikkoa ohjauksia huomaamatta. |
| Isän ohjeet ja luovutus | 7 | 0 | 0 | Opas kattava ja ajan tasalla. Omistajuus, kustannukset ja jatkuvuus dokumentoimatta. |
| SEO, metadata, redirectit | 8 | 0 | 0 | Julkaisukunnossa. Vanhat ruokailusivut ohjautuvat noindex-sivuille, tyhjät sivut indeksoitavina. |
| Tietoturva ja yksityisyys | 8 | 0 | 0 | Rajapinnat ja otsakkeet kunnossa. Moderoimatonta tekstiä voi näkyä, tulvasuoja vahvistettava, seloste vanhentunut. |
| Koodin laatu | 8,5 | 0 | 0 | Puhdas ja testattu. Node-versio lukitsematta, Dependabot-PR:t kasassa. |
| Julkaisu, operointi, jatkuvuus | 7,5 | 0 | 1 | DNS ja HTTPS kunnossa. info@ ei toimi, ei valvontaa, varmuuskopio samassa projektissa kuin data. |
| Sisällön eheys ja migraatio | 8 | 0 | 1 | Rakenteellisesti eheä. Tyhjät perussivut, tietosuoja vahvistamatta, blogi ilman ohjausta. |
| Visuaalinen ammattimaisuus | 7 | 0 | 0 | Huolellinen tokenijärjestelmä. Tyhjät tilat, kovakoodatut leadit ja footer, kuvattomat uutiskortit. |
| Interaktiiviset toiminnot | 7,5 | 0 | 0 | Arvostelusovellus erinomainen. Kommentti- ja veikkauslomake kaatuu verkkokatkoksessa, isä ei saa ilmoituksia. |

---

## 3. Korjattava ennen julkaisua

> **Tila 5.10.2026:** J3, J4, J6 ja J8 korjattu koodiin (mobiilivalikko sulkeutuu linkistä, ravintolan arvosanataulukko mahtuu 360 px:iin, linkkikenttien yhteinen tarkistus `lib/linkki.ts` + `npm run test:linkki`, kommentti- ja veikkauslomakkeen verkkokatkossuoja). J1, J2, J5 ja J7 odottavat isän, hallituksen tai Veikon toimia.

Ainoa korkea löydös on J1. Kohdat J2–J8 ovat keskitasoa, mutta ne kannattaa tehdä ennen kuin sivusto julistetaan valmiiksi. Niistä joko useampi osa-alue löysi saman asian, ne arvioitiin alun perin korkeiksi, tai ne näkyvät suoraan jokaiselle kävijälle. Korjaukset ovat pieniä.

### J1. Tietosuojaselosteen yhteysosoite ei toimi, ja seloste on vahvistamatta ja vanhentunut (korkea)
- **Mitä:** Seloste neuvoo ottamaan yhteyttä osoitteeseen info@lahdensuomalainenklubi.com, mutta domainilla ei ole MX-tietuetta (SPF `-all`, DMARC `reject`). Posti lopetettiin tarkoituksella 4.10. Viestit siis palautuvat. Lisäksi:
  - hallitus ei ole vahvistanut selostetta (`needsReview=true`, ja tarkistusviesti vaati osoitteen tarkistamista "ennen domainin siirtoa")
  - seloste ei kerro 1544 klubilaisen arvosanasta, jotka näkyvät ravintolasivuilla nimellä
  - seloste mainitsee "klubin koodisanan", jota ei enää ole
  - YouTube-esikatselukuvat (i.ytimg.com) ja laitteelle tallentuva arvosteluluonnos puuttuvat.
- **Missä:** Studio, Sivut → Tietosuojaseloste (`sivu-tietosuoja`) ja Yhteystiedot (email = null). DNS. docs/17 §C6.
- **Miksi:** GDPR art. 12–14: rekisterinpitäjän ilmoittaman yhteyskanavan on toimittava, ja julkaistavista tiedoista on kerrottava. Sivusto kerää kommentteja ja arvosteluja.
- **Korjaus:**
  1. Valitse toinen: (a) info@ ilmaiseksi edelleenlähetykseksi (ImprovMX tai Cloudflare Email Routing, MX ja SPF include) luettuun postilaatikkoon ja testi ulkopuolisesta osoitteesta, tai (b) toimiva osoite selosteeseen ja Yhteystiedot-singletoniin.
  2. Lisää selosteeseen kohdat klubilaisten arvosanoista, YouTube-kuvista ja laitteelle tallennetusta luonnoksesta. Poista koodisana-maininta.
  3. Hallitus vahvistaa selosteen, isä poistaa tarkistusmerkinnän ja julkaisee.
  4. Päivitä docs/17 §C6.
- **Työmäärä:** pieni (tekninen osa noin tunti, lisäksi hallituksen vahvistus)

### J2. Tyhjät perussivut näkyvät kävijälle keskeneräisinä (keskitaso, 6 osa-aluetta)
- **Mitä:** Productionissa on 0 hallituksen jäsentä, 0 tapahtumaa ja 0 albumia, ja yhteystiedoissa on vain `city: "Lahti"`. Sivut /klubi/hallitus, /klubi/yhteystiedot, /tapahtumat ja /galleria ovat silti valikossa tai footerissa, sitemapissa ja `index, follow`. /galleria näyttää kävijälle ohjeen "Kuva-albumit lisätään Sanity Studiossa…". Footerin Yhteystiedot-sarakkeessa lukee pelkkä "Lahti", eikä somelinkkejä ole. Sama ylläpitäjän ohjeteksti on varatekstinä 16 muussa kohdassa.
- **Missä:** `app/(public)/galleria/page.tsx:85`, `components/layout/footer.tsx:20-38, 96-113`, `app/sitemap.ts:38-51`, Studio: Yhteystiedot ja Hallitus.
- **Miksi:** Tämä heikentää ammattimaista vaikutelmaa eniten. Yhdistykseen ei saa yhteyttä sivuston kautta, ja Google indeksoi ohuita sivuja.
- **Korjaus:**
  1. Isä täyttää Studiossa yhteystiedot (sähköposti, osoite, Y-tunnus, YouTube-linkki) ja hallituksen jäsenet (docs/09, "Täytä itse").
  2. Kehittäjä kirjoittaa tyhjätilatekstit kävijälle ja yhdistää ne yhdeksi EmptyState-komponentiksi. Valmis pohja on `klubi/_components/empty-state.tsx`.
  3. Kunnes sisältöä on: noindex ja pois sitemapista, kun dokumentteja on 0, ja footerin Tapahtumat- ja Kuvagalleria-linkit piiloon.
- **Työmäärä:** pieni

### J3. Mobiilivalikko jää auki ja sivu lukkoon (keskitaso)
- **Mitä:** Kun valikosta napauttaa linkin sivulle, jolla jo ollaan, tai jonka hakuparametrit tyhjenevät (esim. /uutiset?sivu=2 → Uutiset), valikko ja himmennys jäävät päälle (`aria-expanded="true"`, `body overflow: hidden`). Tämä todennettiin headless-Chromella.
- **Missä:** `components/layout/header-client.tsx:22-27, 253-264, 295-303`
- **Miksi:** Puhelimella sivusto näyttää rikkinäiseltä, eikä sivu vieri.
- **Korjaus:** Lisää MobileItemin linkeille (päätaso ja alavalikko) `onNavigate={() => setMobileOpen(false)}` tai onClick-sulkeminen.
- **Työmäärä:** pieni

### J4. Ravintolan Klubilaisten arvosanat -taulukon Keskiarvo-sarake jää puhelimessa piiloon (keskitaso)
- **Mitä:** Taulukossa on `min-w-[420px]` tavallisessa overflow-säiliössä. 360 px:n leveydellä näkyvät vain Ruoka ja Hinta. Vierityksestä ei ole vihjettä eikä taulukkoa voi vierittää näppäimistöllä.
- **Missä:** `app/(public)/ravintolat/[slug]/page.tsx:435`
- **Miksi:** Ongelma koskee kaikkia 465 ravintolasivua ja juuri tärkeintä lukua.
- **Korjaus:** Käytä StatTable-mallia (vierityssäiliö, varjovihje, tabIndex, role=region, kiinnitetty nimisarake). Vaihtoehtoisesti lyhyt päiväys (14.10.2023) ja lyhyet otsikot (Viiht., Ka.), jolloin taulukko mahtuu 350 px:iin.
- **Työmäärä:** pieni

### J5. /english-sivu on merkitty suomenkieliseksi (keskitaso, 2 osa-aluetta)
- **Mitä:** Sivun `kieli` on null, joten sivulla on vain `lang="fi"` ja `og:locale` on fi_FI.
- **Missä:** Studio: Sivut → English → Sisällön kieli (koodi `app/(public)/[...slug]/page.tsx:83` tukee jo kenttää).
- **Miksi:** Ruudunlukija lukee englantia suomen ääntämyksellä (WCAG 3.1.2), ja hakukone tunnistaa kielen väärin.
- **Korjaus:** Valitse Studiossa Sisällön kieli = Englanti ja julkaise. Tarkista lopuksi `lang="en"`.
- **Työmäärä:** pieni (1 min, isä voi tehdä)

### J6. Linkkikenttä hyväksyy muodon "www.…", josta tulee 404-linkki (keskitaso, varmistettu)
- **Mitä:** `rule.uri({ allowRelative: true })` hyväksyy osoitteen `www.palloliitto.fi` suhteellisena polkuna, ja Next Link ratkaisee sen nykyisen sivun alle. Etusivun `ctaHref`-kentissä ei ole validointia lainkaan.
- **Missä:** `sanity/schemas/objects/portableText.ts:41-47`, `klubiToiminta.ts:125-130`, `singletons/etusivu.ts:227, 269`
- **Miksi:** Isä kirjoittaa osoitteen luontevasti muodossa "www.", ei saa virhettä, ja kävijä päätyy 404-sivulle.
- **Korjaus:** Käytä valmista `linkkiValidointi`-sääntöä (`contentMeta.ts:133`). Valinnaisille ctaHref-kentille tarvitaan versio ilman `.required()`-kutsua. Tarkista ensin, nostaako uusi sääntö virheitä vanhoista migroiduista linkeistä.
- **Työmäärä:** pieni

### J7. Domainin ja DNS-vyöhykkeen jatkuvuus selvitettävä ennen Zonerin webhotellin irtisanomista (keskitaso, 2 osa-aluetta)
- **Mitä:** DNS-vyöhyke on webhotellin cPanelissa (NS ns1/ns2.int2000.net). Rekisteröijää ei ole tarkistettu (docs/17:57), eikä Zonerin kirjallista vahvistusta ole saatu (docs/17:176-178). Domain vanhenee 2027-08-28, eikä uusinnasta vastaavaa ole kirjattu. Opas puhuu yhä Wepardista.
- **Missä:** `docs/17-julkaisu-domain-ja-oikeudet.md:57, 164-178`, `docs/09-editor-guide.md:637`
- **Miksi:** Jos irtisanominen tehdään ennen vahvistusta, koko sivusto katoaa. Riski on dokumentoitu ehdoksi, mutta asia on edelleen auki.
- **Korjaus:**
  1. Zonerilta vahvistus tai vyöhykkeen siirto erilliseen DNS-palveluun.
  2. Rekisteröijäksi varmistetaan yhdistys (Zonerin asiakastiedot tai RDAP. Traficom ei koske .com-verkkotunnuksia).
  3. Kirjataan uusinnan maksaja ja ajankohta.
  4. cPanel-kopio vanhasta sivustosta kahteen paikkaan.
  5. Wepard → Zoner kaikkiin dokumentteihin.
- **Työmäärä:** pieni–keskikokoinen

### J8. Kommentti- ja veikkauslomake kaatuu virhesivulle verkkokatkoksessa (keskitaso, varmistettu)
- **Mitä:** `useActionState(lahetaKommentti)` ilman try/catchia ja `navigator.onLine`-tarkistusta. Katkos tai deployn aiheuttama versioero näyttää koko sivun "Sivun lataaminen epäonnistui", ja 12 joukkueen veikkausjärjestys katoaa.
- **Missä:** `app/(public)/uutiset/_kommentit/kommentti-lomake.tsx:68`
- **Miksi:** Puhelinkäyttäjä menettää syötteensä, ja virheilmoitus johtaa harhaan. Arvostelulomakkeessa sama tilanne on jo ratkaistu.
- **Korjaus:** Sama kääre kuin `review-form.tsx:110-125`: arvot palautetaan virhetilaan ja näytetään viesti "Ei verkkoyhteyttä. Veikkauksesi on tallessa." Harkitse veikkausluonnosta localStorageen.
- **Työmäärä:** pieni

---

## 4. Mobiilikäyttäjät

Kaksi osa-aluetta testasi tätä: 61 sivua 320 px:llä ja 25 tuotantosivua 390 ja 360 px:llä headless Chromessa mobiiliemuloinnilla.

| Käytäntö | Tila | Huomio |
|---|---|---|
| Ei vaakavieritystä | OK | scrollWidth = innerWidth kaikilla sivuilla. SectionNavin aiempi 4 px:n vika korjattu. |
| Viewport, zoomaus sallittu | OK | Ei maximumScale- eikä userScalable-rajoitusta. |
| Lomakekentät 16 px (ei iOS-zoomia) | OK | Kaikki kentät text-base tai suurempi. |
| inputMode, enterKeyHint, autocomplete | OK | type=search, inputMode=decimal, autoComplete=given-name. |
| Leveät taulukot omissa vierityssäiliöissään | Osittain | StatTable on mallikelpoinen, mutta ravintolan arvosanataulukko ei (J4). |
| Hampurilaisvalikko | Osittain | 44 px:n painike, Esc ja vierityksen lukitus kunnossa. Jää auki samaan sivuun navigoitaessa (J3). |
| Kosketusalueet ≥ 44 px | Osittain | Sirut, sivutus ja suodattimet OK. Footer 17–21 px, murupolku 20 px, ravintolasivun paluulinkki 16 px, tunnisteet 36 px. |
| Tekstin luettavuus | Osittain | Kokoonpanokuvan nimet ja tapahtumakortin kuukausi 11 px, overflow-wrap:anywhere katkoo nimiä. |
| Pitkät suomen yhdyssanat | OK | hyphens:auto ja overflow-wrap:break-word. |
| Safe-area ja lovi (arvostelusovellus) | OK | viewport-fit=cover, env(safe-area-inset-*), 100dvh. |
| Kuvat: sizes, lazy, LCP-prioriteetti | OK | fetchPriority=high, lqip, Sanityn CDN. |
| Nopeus | OK | JS noin 170–200 kt gzip, TTFB 24–41 ms (staattiset), LCP 0,2–0,5 s. |
| Napautuksen palaute dynaamisilla sivuilla | Puuttuu | Ei loading.tsx-tiedostoja. /uutiset ja /ravintolat "jäätyvät" 0,3–2 s. |
| Hover-riippumattomuus | OK | Toiminnot toimivat napautuksella. |
| prefers-reduced-motion | OK | Huomioitu kattavasti. |
| Lightbox: pyyhkäisy, pinch-zoom | OK | Pointer Events, fokusloukku, 44–48 px:n napit. |
| Lomakkeen verkkokatkossuoja | Osittain | Arvostelusovellus erinomainen, kommentti- ja veikkauslomake puuttuu (J8). |
| PWA ja kotinäyttö | Osittain | Manifesti on kaikilla sivuilla, joten "Lisää kotinäyttöön" mistä tahansa sivusta asentaa Arvostele-sovelluksen (`app/manifest.ts:17-25`). |
| Pitkä sisältö (arvokisasivut) | Osittain | EM-2024: yli 5000 px tekstiä ennen taulukoita. Hyppylinkit tai details-osiot auttaisivat. |

---

## 5. Isän ylläpidettävyys

### Mitä isä pystyy tekemään itse
- Julkaista uutisia, tapahtumia, albumeja ja ravintola-arvioita. Studio on suomeksi, kentissä on ohjetekstit, ja muutokset näkyvät webhookin kautta sekunneissa.
- Moderoida kommentteja (Piilota sivulta, Poista) ja arvosteluja (Hyväksy ja luo ravintola, Hylkää arvostelu). Toiminnot muuttavat julkaistua versiota suoraan, ja niissä on vahvistukset.
- Muokata valikkoa, etusivun nostoja ja lohkoja sekä tilastotaulukoita (Excel-liitäntä) ja Litmanen-osiota.
- Käydä läpi Tarkistettavat-näkymää (43 kohdetta, aiemmin 75).
- Ladata viikkovarmuuskopion Studiosta.
- Studio suojaa häntä virheiltä: singletoneja ei voi poistaa, polun muutoksesta tulee varoitus ja koodiin sidotut polut on lukittu.

Opas (docs/09 v2.2) kattaa kaikki arkiset työnkulut, ja noin 80 tarkistetusta nimestä vain muutama poikkeaa Studiosta.

### Missä isä todennäköisesti jumittuu
- **Uutisen yhteenvetokentät:** Tiivistelmä, Lyhenne ja SEO-kuvaus ovat päällekkäisiä, ja sivu käyttää muotoa `tiivistelma ?? excerpt`. Isä joutuu arvailemaan, mitä kenttää tarvitaan (`uutinen.ts:55-81`). Lomakkeessa on 13 kenttää, ja Kirjoittaja-kenttä on tyhjä kaikissa 753 uutisessa.
- **Etusivun lohkojen "piilotus":** ohjeteksti lupaa piilotusta, mutta toiminto poistaa lohkon sisältöineen (`etusivu.ts:148`).
- **Poisto, julkaisun peruminen ja kopiointi:** 957 dokumentissa on legacyUrl. Poisto rikkoo 301-ohjauksen varoituksetta (`sanity.config.ts:59`). Kopioi vie vanhan osoitteen ja blogspot-polun uuteen dokumenttiin.
- **Sivuja ei näy Tarkistettavat-listalla,** joten tietosuojaseloste jää huomaamatta (`structure.ts:32-41`).
- **Tilastot:** 187 taulukkoa ryhmittelemättä, ja esikatselussa näkyy teknisiä arvoja ("uefa-cup", "keskikentta").
- **Polttopiste (hotspot)** ei vaikuta useimpiin kuviin (FramedImage käyttää `object-contain`), joten säätö ei näy sivulla.
- **Kovakoodatut tekstit:** 24 listasivun otsikkoa ja johdantoa sekä footerin linkit ovat koodissa. Esimerkiksi tapahtumasivun teksti "mölkkyturnaus…" ei muutu Studiosta, ja valikon muutos ei päivitä footeria.
- **Englanti ja jargon kentissä:** "Generate" (Studiossa painike on "Luo"), "(override)", "URL", "teaser".
- **Turhat varoitukset:** 11 kaupunkia ilman maakuntaa, 6 ravintolaa ⚠-merkinnällä ilman "Mitä tarkistaa" -tekstiä, mestaruusmaa- ja patsaskuvavaroitukset. Ne opettavat ohittamaan varoitukset.
- **Vanhentunut "Seuraava ottelu" -kenttä** näkyy lukittuna etusivun ensimmäisellä välilehdellä.
- **Ei ilmoituksia:** isä ei saa mitään viestiä uudesta arvostelusta tai kommentista, joten moderointi jää muistin varaan.
- **Opas on vain Markdown-tiedosto repossa.** Linkkiä Studiosta ei ole, kuvakaappauksia ei ole, ja tekstissä on viittauksia kuten "docs/17 §A3", "CORS" ja "repositorio".
- **Roolit ristiriidassa:** docs/09 sanoo Administrator, docs/17:20 sanoo Editor. Free-tasolla on vain Administrator ja Viewer. Administratorina isä voi vahingossa poistaa datasetin ja sen mukana varmuuskopiot.

### Mitä oppaaseen pitää lisätä
1. Julkaise opas luettavana sivuna tai PDF:nä, lisää linkki "Ohjeet" Studion valikkoon ja 5–10 kuvakaappausta.
2. Vianetsintätaulukkoon rivit:
   - "Poistin vahingossa": älä luo uudelleen, ota yhteys kehittäjään samana päivänä. Versiohistoria säilyy 3 päivää, sen jälkeen palautus tehdään viikkokopiosta.
   - "Näen keskeneräisiä juttuja": poistu esikatselusta.
   - "En pääse kirjautumaan": kirjaudu samalla Google-tilillä, jolla kutsu hyväksyttiin.
   - "Muutos ei näy minuutissa": päivitä sivu ja ilmoita kehittäjälle.
3. Rutiinit: moderointijonon tarkistusväli (esim. maanantaisin), varmuuskopion lataus kerran kuussa nimettyyn paikkaan ja Varmuuskopiot-listan päiväyksen tarkistus.
4. Yksiselitteinen lause: "Uudet kirjoitukset tehdään Studiossa, ei blogissa."
5. Blogisynkan jälkeen käsitellään tarkistettavien "alt-teksti johdettu otsikosta" -merkinnät.
6. Myös tarkistusmerkinnän poisto pitää julkaista. Esimerkki: Scolari-luonnos, jossa merkinnän poisto jäi julkaisematta.
7. Uusi osio "Uusi arvokisa (EM/MM)" sekä uusi pelaaja ja stadion. Lisäksi 2–3 riviä Esikatselu-näkymästä.
8. Missä polttopiste vaikuttaa.
9. Domain ja kulut: kuka maksaa, milloin uusitaan ja millä tunnuksilla (Wepard → Zoner).
10. Nimet sanatarkasti skeeman mukaan: Alkamisaika, Kotijoukkue, Vierasjoukkue, "Jalkapalloarkisto → Tilastot", Pääsisältö sekä toimintovalikolle yksi yhtenäinen nimi.

---

## 6. Korjataan pian julkaisun jälkeen (keskitaso)

**Operointi ja jatkuvuus**
- **Valvonta puuttuu.** Lisää uptime-valvonta (UptimeRobot tai Better Stack) etusivulle, /studio:lle ja /api/og:lle sekä varoitus, jos uusin varmuuskopio on yli 8 päivää vanha (healthchecks.io tai GitHub Action). Hobby-tason lokit säilyvät vain tunnin. Kirjaa, kuka saa hälytykset. `app/api/varmuuskopio`, `app/api/huolto`, docs/17:198.
- **Varmuuskopio samassa projektissa kuin data.** Tee palautusharjoitus väliaikaiseen datasettiin ja kirjaa tulos docs/17 §D:hen. Tee kuukausittaisesta ulkoisesta kopiosta pakollinen rutiini.
- **Jatkuvuus:**
  - CRON_SECRET puuttuu `.env.example`-tiedostosta ja docs/17 §B:stä. Tee kaikista 9 muuttujasta yksi taulukko.
  - Siirrä repo yhdistyksen GitHub-organisaatioon (2.10. päätöksen mukaisesti) tai kirjaa päätös toisin.
  - Kirjoita uuden ylläpitäjän tarkistuslista.
  - Yhtenäistä isän rooli kaikissa dokumenteissa.
- **Kustannukset.** Kirjaa taulukkoon palvelu, omistaja, maksaja, hinta, uusinta ja tunnukset.
- **Vercel Hobbyn ei-kaupallinen ehto.** Kirjaa päätös tai aikaista siirto Pro-tasolle.
- **Rollback-ohje** docs/17:ään (Vercel Instant Rollback). Harkitse "wait for checks" -asetusta.
- **Julkaisun jälkeiset vaiheet:** Search Console ja Bing, blogin ohjausskripti (docs/14 §5–6) ja viimeinen `sync:blogspot:production -- --vie`, jakoesikatselun testi, cPanel-arkisto.
- **Node-versio** on lukitsematta (paikallisesti 25, CI:ssä 22, Vercelissä oletus). Lisää `engines`, `.nvmrc` ja CI-asetus.
- **Dependabot:** 8 PR:ää odottaa. Yhdistä next 16.3.8 ja tarkista, korjaako se 404-bugin #99287. Nimeä vastuuhenkilö.

**Suorituskyky**
- `sanityFetch` asettaa `revalidate: 60` ja `useCdn: false`, joten noin 1400 sivua vanhenee minuutissa ja kuluttaa suoraa API-kiintiötä. Nosta arvo 3600:aan ja käytä lyhyttä väliä vain `now()`-kyselyissä. Lisää samassa muutoksessa etusivun hakuun tagit `uutinen` ja `uutisKategoria`. `sanity/lib/fetch.ts:71, 104`
- Lisää `loading.tsx` hakemistoihin /uutiset ja /ravintolat (skeleton-kortit).
- Uutis- ja ravintolalistat ovat dynaamisia `searchParams`-käytön takia. Sivutus kannattaa siirtää polkuun (`/uutiset/sivu/2`), ja vanhat osoitteet ohjataan 301:llä.
- Tilastotaulukoiden HTML (mölkky 2,3 Mt): siirrä solutyylit taulukkotasolle. `components/ui/stat-table.tsx:152-173`

**Studio**
- Kääri Poista ja Peru julkaisu varoituksella, kun dokumentilla on legacyUrl, muutLegacyUrlit tai blogspot.polku. Tee oma Kopioi-toiminto, joka tyhjentää nämä kentät.
- Lisää Sivut, Tapahtumat ja Galleria Tarkistettavat-listaan ja sivun esikatseluun ⚠-merkki.
- Siirrä Tiivistelmä lisäasetuksiin ("Valinnainen, oletuksena Lyhenne").
- Lisää etusivun lohkoille "Näytä etusivulla" -valinta tai korjaa ohjeteksti.

**Sisältö ja SEO**
- 44 vanhaa `ruokailu*.htm`-sivua ohjautuu noindex-suodatinnäkymiin. Salli indeksointi yhden alueparametrin näkymille ja anna niille oma otsikko. `lib/redirects.ts:130-175`, `ravintolat/page.tsx:104`
- `tuo-klubiarviot.ts`: maakuntahaku 11 kaupungille (`:448-456`) ja tarkistettavaa-teksti 6 ravintolalle (`:350`). Tee dokumenttikohtaiset patchit varmuuskopion jälkeen.
- Blogikuvien alt-tekstit: uutisen 2026-09-29 (Suomi–Valko-Venäjä) yhdeksällä kuvalla on sama varateksti. Kirjoita kuvaukset ja vie syyt `import-blogspot.ts`:ssä tarkistettavaa-kenttään.
- Lisää 24 listasivun leadit ja footerin linkit Sanityyn /klubi-sivujen mallilla (CLAUDE.md:n sääntö 1).

**Tietoturva ja interaktiiviset**
- **Moderoimaton ravintolaehdotus** näkyy jopa 7 päivää kaikille Viimeksi arvioidut -listassa. Lyhennä aika 24 tuntiin tai näytä listassa vain hakemiston ravintolat. `arvostele/tuoreet.ts:37`
- **Kommenttien tulvasuoja:** lisää nimestä riippumaton kokonaisraja. *Korjattu 5.10.2026* (docs/15 §4).
- **Ilmoitukset isälle:** yöllinen /api/huolto lähettää koosteen sähköpostilla (esim. Resend).
- **Arvostelun tupla uudelleenlähetyksessä:** luo tunniste selaimessa ja käytä `createIfNotExists`-kutsua. `arvostele/actions.ts:271`
- **Webhookin arvosanalaskennan kilpailutilanne:** yritä uudelleen revisioristiriidan jälkeen tai palauta 500. `api/revalidate/route.ts:59`
- **Version skew:** älä näytä "Ei verkkoyhteyttä", kun yhteys on päällä. Näytä sen sijaan "Sivusto on päivittynyt, lataa uudelleen". `review-form.tsx:119-124`

**Visuaalinen ja mobiili**
- Kuvattomille uutiskorteille paikkamerkki (215/753 uutisesta ilman kuvaa). `components/news-card.tsx:22`
- Sisällön leveys yhtenäiseksi: listasivuille wide-leveys. `components/layout/container.tsx:13`
- PWA-manifesti vain arvostelureitille tai koko sivuston manifesti, jonka `start_url` on "/". `app/manifest.ts`

---

## 7. Hiomista (matala)

- Kosketusalueet: footer, murupolku, heron CTA-linkit ja ravintolasivun paluulinkki `min-h-11` tai `py-2`. Tunnisteet `min-h-11`, Jaa-painike `min-w-11`.
- Kokoonpanokuvan nimet 12–13 px ja `hyphens:auto`. Kaikki 11 px:n tekstit vähintään 12–13 px:iin.
- Typografiatokenit (`--text-small`, `--text-eyebrow`) ja yksi Eyebrow-komponentti (nyt 4 eri harvennusta).
- 404: välilehden otsikko vaihtuu geneeriseksi, ja kuoresta puuttuu `lang` (Next-bugi, seuraa korjausta).
- Arvokisasivuille hyppylinkit tai details-osiot.
- Organization-JSON-LD:hen logo. Tapahtumalle paikka pakolliseksi tai varoitukseksi ja Peruttu-tila.
- `?sivu=999`: notFound tai noindex.
- Title-tagit: lyhyempi jälkiliite, vuosi vuosittaisiin tervehdyksiin, seoTitle-varoitus 60 merkissä.
- Puuttuvat meta descriptionit (/klubi/toiminta, /klubi/hallitus, ilotulitukset, musiikki).
- Sitemapin lastmod: ei `new Date()`, ei massapatchien aikaa.
- `llms.txt`: vuosi 2001 → 1997, määrä datasta, blogspot pois sameAs-listasta.
- Vanhat kuvaosoitteet (noin 755) palauttavat 404. Generoi ohjaukset tai kirjaa päätös.
- Catch-all-reitti: tarkista slug välimuistitetusta listasta ennen Sanity-hakua (botit).
- Studio:
  - tilastot ryhmiksi
  - esikatseluun suomenkieliset arvot
  - varatut polut (ottelut, blogspot, klubi/yhteystiedot, klubi/toiminta/*)
  - uutiskategorian `polkuMuuttunut`
  - "Seuraava ottelu" -kentän arvo pois
  - Lähde-fieldset kokoon
  - kommentin piilotuksen virhe toastiksi.
- Tapahtumien Tulevat/Menneet päättymisajan mukaan (`dateTime(coalesce(endsAt, startsAt))`). `formatEventRange` Helsingin ajassa.
- Arvostelujen tulvaraja lähettäjäkohtaiseksi ja pikatoiminto roskaluonnosten poistoon.
- Repo julkinen ja henkilökohtainen sähköposti commiteissa: päätä näkyvyys ja käytä noreply-osoitetta.
- `npm audit`: 15 löydöstä vain Sanity CLI:ssä. Ei `--force`.
- `.env.local`-tiedostosta vanhentuneet Resend- ja JASENHAKEMUS-muuttujat pois.
- `@sanity/vision` samaan versioon kuin sanity. sanity 6 ja next-sanity 13 omaan haaraansa.
- Generoidut Sanity-tyypit käyttöön vähitellen ja typegen-tarkistus CI:hin.
- `scripts/`: kertaskriptit `scripts/arkisto/`-kansioon README:n kanssa, testit omaan kansioonsa, `tsconfig.scripts.json`, korjaus `parse-klubi.ts:2273`.
- knip-siivous, `@sanity/mutator` devDependenciesiin, yhdistetyt haarat pois.
- CLAUDE.md: kertakomennot arkistoon, test:youtube mukaan, docs 00–21, Linkit-osio. README suomeksi ja ajan tasalle.
- Operointidokumentit: 2 cronia, E19 kuitattu, docs/08 Sprint 6, roolit. TTL 300 → 3600, kun paluutie suljetaan.
- Kiintiöiden seuranta kuukausittain: Sanity 5548 dokumenttia 10 000:sta, Vercel Usage.
- Tarkistusskriptien väärät hälytykset (verify:redirects %2C, verify-migration dataset ja legacyUrl, verify-blogspot).
- Axe-testi CI:hin Vercel-previewta vastaan.
- ~~`public/`-kansiosta Next-pohjan SVG:t pois~~ *Tehty 5.10.2026.*
- Kovakoodatut värit tokeneiksi (`footer.tsx:152`, `hero.tsx:92`, `global-error.tsx`).
- Kaksi julkaisematonta luonnosta: julkaise Scolari ja hylkää Suomi–Albania.
- Ohuet toimintasivut (ilotulitukset, musiikki) ja 3 orpoa assettia (tarkista KerberosLittiSale.jpg).

---

## 8. Vahvuudet

- **Saavutettavuus:** axe 66 sivua, 0 rikkomusta. Kontrastit AA-tasolla, fokus näkyy kaikkialla, alt-teksti kaikilla 1783 kuvaviittauksella.
- **SEO ja ohjaukset:** 1723 sitemap-osoitetta, 0 virhettä. Kaikilla 199 vanhalla osoitteella on ohjaus, joka toimii myös kirjainkoosta riippumatta. Domain-kanonisointi 308:lla, yhteinen `buildMetadata`, kelvollinen JSON-LD.
- **Mobiili:** ei vaakavieritystä, 16 px:n kentät, mallikelpoinen StatTable ja lightbox. Arvostelusovellus on oikea puhelinsovellus luonnoksineen ja verkkokatkossuojineen.
- **Suorituskyky:** kuvat kulkevat Sanityn CDN:n kautta, LCP 0,2–0,5 s ja JS noin 200 kt gzip.
- **Tietoturva:** cron- ja webhook-reitit suojattu ja testattu tuotannosta, avoin uudelleenohjaus torjuttu, turvaotsakkeet kunnossa, ei analytiikkaa eikä evästebanneria.
- **Studio:** suomeksi, singletonit suojattu, moderointitoiminnot vahvistuksineen, polkumuutoksista varoitus.
- **Koodi:** strict TypeScript, 0 any-tyyppiä, 0 TODO-kommenttia, CI ja Dependabot käytössä, virheet käsitelty niin, että ISR pitää viimeisimmän toimivan sivun.
- **Data:** validointi 0 virhettä, 0 rikkinäistä viittausta, 0 mojibakea, 0 riippuvuutta vanhaan domainiin.
- **Visuaalinen:** tyylioppaan mukaiset tokenit, huolelliset tulostustyylit, virhesivut ja jakokuvat.
- **Operointi:** DNS-siirto hallittu, postin väärentäminen estetty, viikkovarmuuskopio toimii (5.10. klo 01:58 UTC).

---

## 9. Julkaisupäivän tarkistuslista

1. **Varmuuskopio:** `npm run backup` → `varmuuskopiot/` ja kopio toiseen paikkaan. Tarkista Studiosta, että viikkokopio 2026-10-05 on olemassa.
2. **Yhteysosoite (J1):** ota info@-edelleenlähetys käyttöön (MX ja SPF include) tai vaihda osoite. Lähetä testiviesti ulkopuolisesta osoitteesta.
3. **Tietosuojaseloste (J1):** täydennä arvosanat, YouTube ja luonnos, poista koodisana, hallitus vahvistaa, isä poistaa tarkistusmerkinnän ja julkaisee.
4. **Perustiedot (J2):** isä täyttää Yhteystiedot (sähköposti, osoite, Y-tunnus, YouTube) ja hallituksen jäsenet. /english → Sisällön kieli = Englanti (J5).
5. **Koodikorjaukset J2–J4, J6 ja J8:** deploy ja CI vihreäksi. Tarkista Vercel → Deployments, että tuotantodeploy onnistui.
6. **Ympäristömuuttujat:** tarkista, että Vercelin Productionissa on kaikki 9 muuttujaa (NEXT_PUBLIC_SANITY_PROJECT_ID, _DATASET, _API_VERSION, SANITY_API_READ_TOKEN, SANITY_API_WRITE_TOKEN, SANITY_REVALIDATE_SECRET, CRON_SECRET, TASO_API_KEY, TASO_SARJAT).
7. **Webhook:** julkaise testimuutos Studiossa ja varmista, että se näkyy sivulla sekunneissa.
8. **CORS:** avaa /studio tuotantodomainilla ja kirjaudu. Presentation-näkymän pitää toimia.
9. **Cronit:** Vercel → Cron Jobs. Kaksi ajastusta (varmuuskopio ja huolto), viimeisin ajo onnistunut.
10. **Ohjaukset:** `npm run verify:redirects` tuotantoa vastaan. Odotus 726/730, ja loput 4 ovat tunnettuja %2C-vääriä hälytyksiä. Pistokokeet: /etusivu.htm, /ruokailulahti.htm, /blogspot/… → 308.
11. **Saavutettavuus:** `BASE_URL=https://www.lahdensuomalainenklubi.com npm run test:saavutettavuus`. Odotus 0 rikkomusta.
12. **Puhelintesti oikealla laitteella** (iPhone ja Android): valikko (J3), ravintolasivun taulukko (J4), kommentti tai veikkaus lentotilassa (J8), arvostelusovelluksen lähetys.
13. **Search Console:** Domain-omaisuus TXT-tietueella, sitemap.xml, URL-tarkistus 5–10 sivulle. Bing tuodaan GSC:stä.
14. **Jakoesikatselu:** Facebookin Sharing Debugger ja LinkedInin Post Inspector etusivulle ja yhdelle uutiselle.
15. **Blogi:** sovi isän kanssa katkaisupäivä, aja `npm run sync:blogspot:production -- --vie`, lisää ohjausskripti Blogger-teemaan ja julkaise muuttoilmoitus.
16. **Valvonta:** uptime-valvonta päälle ja hälytys kehittäjän sähköpostiin.
17. **Ennen Zonerin irtisanomista (J7, noin kuukauden päästä):** kirjallinen vahvistus tai DNS:n siirto, rekisteröijä yhdistykselle, cPanel-arkisto, sen jälkeen TTL 3600.
18. **Perehdytys:** käy isän kanssa läpi docs/09 "Täytä itse", moderointijono ja varmuuskopion lataus. Kuittaa docs/17 §E päivämäärin.

---

## 10. Liite

### Varmistuksessa kumotut ja lievennetyt löydökset
- **Kumottuja löydöksiä ei ole.** Kaikki varmistetut löydökset todettiin päteviksi.
- **Lievennetty korkeasta keskitasoon (7 kpl):**
  - linkkikentän www-muoto (J6)
  - verkkotunnuksen omistus ja DNS (J7, asia jo dokumentoitu ehdoksi docs/17:ssä)
  - jatkuvuus, repo ja salaisuudet (repo julkinen, isä voi luoda tokenit Administratorina, TASO_* löytyvät jo .env.examplesta)
  - tyhjät perustiedot ja tyhjät sivut (sisältötyötä, siistit tyhjätilat)
  - valvonta (Vercel ilmoittaa epäonnistuneesta deploysta, kopion päiväys näkyy Studiossa)
  - varmuuskopio samassa projektissa (`--replace` ei poista muita dokumentteja, paikallisia täysiä kopioita on kolme)
  - blogin rinnakkaiskäyttö (dokumentoitu vaihe, edellytys täyttyi 4.10.)
  - galleriatekstit ja footer (näkyy tällä hetkellä vain /galleria-sivulla)
  - kommenttilomakkeen verkkokatkos (palvelinvirheet jo käsitelty)
  - isän ilmoitusten puuttuminen (pieni yhdistys, tulvasuojat olemassa).
- **Tarkennus J1:een:** "lähetä testiviesti info@-osoitteeseen" ei riitä, koska viesti palautuu. Ensin edelleenlähetys tai osoitteen vaihto.
- **Tarkennus J7:ään:** Traficom ei koske .com-verkkotunnuksia.

### Auditoinnin rajoitukset
- **Ei oikeita laitteita:** mobiilitestaus tehtiin headless Chromella (CDP-emulointi). Claude-in-Chrome-laajennus ei ollut yhteydessä, eikä iOS Safaria testattu.
- **Ei ruudunlukijaa eikä zoomausta:** saavutettavuus tarkistettiin koodista, curlilla ja axe/jsdom-testillä. Värikontrasti on axe-testistä tarkoituksella pois, ja kontrastit laskettiin tokeneista.
- **Yksittäinen epäluotettava mittaus:** /uutiset-sivun LCP 5,1 s vääristyi vierityssilmukan takia.
- **Mittaukset development-datasetista:** tilastosivujen HTML-koot (mölkky 2,3 Mt).
- **Todentamatta jäi:**
  - yhden tarkastajan Sanity-luku productionin dokumenttimääristä estettiin, joten hän nojasi docs/16- ja docs/17-dokumenttien 30.9. kirjauksiin (muut osa-alueet vahvistivat samat luvut suoraan)
  - Yhteystiedot-sivu J1:n varmistuksessa (308-ohjaus)
  - Zonerin vastaus ja vyöhykkeen sidonta webhotelliin
  - rekisteröijän nimi (RDAP ei näytä sitä)
  - Vercel-tilin ilmoitusasetukset ja onko Search Console jo käytössä
  - Skew Protectionin tila
  - kattaako OneDriven synkronointi paikalliset varmuuskopiot.
- **Osittainen läpikäynti:** jalkapalloarkiston kaikkia alasivuja ei käyty läpi tyhjätilatekstien osalta, eikä docs/09:ää luettu kokonaan blogiohjeen osalta.