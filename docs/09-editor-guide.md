# 09 — Sivuston päivittäjän opas (sihteerille)

> **Tämä opas on Lahden Suomalainen Klubi ry:n sihteerille.** Et tarvitse
> ohjelmointitaitoja. Kaikki sisältö muokataan sisältöeditorissa (Sanity Studio).
> Studio on suomeksi. Suluissa on englanninkielinen nimi, jos jokin kohta näkyy
> vielä englanniksi.
>
> Versio 2.3 (7.10.2026). Blogi on siirtynyt Studioon, ja vanhan version voi palauttaa
> varmuuskopiosta.

> **Uudet jutut kirjoitetaan nyt Studioon, ei enää blogiin.** Blogspot-blogi on
> siirretty kokonaan tälle sivustolle (Uutiset), ja blogin osoitteet ohjaavat tänne.
> Blogiin kirjoitettu juttu ei enää näy missään. Ohje: *Uutisen kirjoittaminen* alla.

## Tärkeät linkit

| | |
|---|---|
| Julkinen sivusto | https://www.lahdensuomalainenklubi.com |
| Sisältöeditori (Studio) | https://www.lahdensuomalainenklubi.com/studio |
| Apu | Kehittäjä. Yhteystiedot on annettu sinulle erikseen |

## Kirjautuminen

1. Avaa Studio yllä olevasta osoitteesta ja tallenna se kirjanmerkkeihin.
2. Kirjaudu **omalla tunnuksellasi** (Google-tili tai sähköposti), jolla sinut on kutsuttu
   projektiin. Tunnus on henkilökohtainen, joten älä jaa sitä muille.
3. Vasemmalla näkyy valikko ja oikealla muokattava sisältö. Yläpalkissa ovat
   **Sisältö** ja **Esikatselu**.

Roolisi on **Administrator** (ylläpitäjä), koska Sanity-projekti kuuluu klubille
(docs/17 §A3). Voit muokata ja julkaista kaiken sisällön ja tarvittaessa kutsua uusia
käyttäjiä. **Älä muuta projektin asetuksia** (API, CORS, tokenit, webhookit): sivusto
toimii niiden varassa. Kehittäjä hoitaa ne.

## Perusasiat

- **Julkaise (Publish):** muutokset tallentuvat automaattisesti **luonnokseksi**, jota
  vain Studion käyttäjät näkevät. Sivustolla muutos näkyy vasta, kun painat
  alhaalla oikealla **Julkaise**. Sivu päivittyy sekunneissa.
- **Luonnos kesken:** voit sulkea dokumentin milloin tahansa, sillä luonnos säilyy.
  Keskeneräiset luonnokset tunnistaa merkistä listassa.
- **Esikatselu:** yläpalkin **Esikatselu** näyttää sivun luonnoksineen. Dokumentin
  yläosassa on myös linkki sivulle, jolla sisältö näkyy.
- **Versiohistoria:** oikean yläkulman kellokuvakkeesta näet aiemmat versiot ja voit
  palauttaa niistä minkä tahansa. **Historia säilyy vain 3 päivää** (Sanityn ilmainen
  taso). Vanhemman virheen voit korjata itse viikoittaisesta varmuuskopiosta:
  dokumentin **⋯** → **Palauta varmuuskopiosta** (ks. Varmuuskopiot).
- **Pakolliset kentät** näkyvät punaisella. Julkaisu onnistuu vasta, kun ne on täytetty.

## Studion valikko

- **Tehtävät sinulle:** aloita tästä. Kaikki, mikä odottaa sinua, yhdessä paikassa.
  Tyhjä lista tarkoittaa, ettei siinä ole tehtävää.
  - **Arvostelut odottavat hyväksyntää:** kävijöiden ravintola-arvostelut
  - **Uudet kommentit (7 päivää):** lue ja piilota tarvittaessa
  - **Julkaisemattomat muutokset:** muokkaukset, joita et ole vielä julkaissut.
    Sivustolla näkyy niissä yhä vanha versio. Avaa ja paina **Julkaise**, tai hylkää
    muutos (⋯ → **Hylkää muutokset**).
  - **Ajastetut uutiset:** uutiset, joiden julkaisuaika on tulevaisuudessa
  - **Vaatii tarkistuksen (kaikki):** migraation merkitsemät dokumentit yhdessä listassa
- **Sivun asetukset**
  - **Etusivu:** etusivun yläosa (pääjuttu, pikalinkit) ja lohkot
  - **Navigaatio:** yläpalkin linkit
  - **Yhteystiedot:** osoite, sähköposti, puhelin ja some. Näkyvät footerissa ja yhteystietosivulla
  - **Varmuuskopiot:** automaattiset viikkokopiot ja poistettujen palautus (ks. alla)
- **Tarkistettavat:** migraation merkitsemät dokumentit tyypeittäin (ks. alla)
- **Uutiset:** tiedotteet ja blogikirjoitukset, myös blogin kaikki 530 kirjoitusta vuodesta 2007
- **Uutiskategoriat:** uutisten kategoriat ja suodattimen valinnat
- **Kommentit ja veikkaukset:** jäsenten viestit uusin ensin sekä piilotetut
- **Ottelut:** etusivun ja /ottelut-sivun otteluohjelma
- **Tapahtumat:** klubin tulevat tapahtumat
- **Galleria-albumit** ja **Sivut** (esim. säännöt ja tietosuojaseloste)
- **Klubin toiminta:** vappu, mölkky, matkat ym. vuosimerkintöineen
- **Hallitus**
- **Ravintolat:** ravintolat, **odottavat arvostelut**, klubilaisten arvosanat ja kaupungit
- **Jalkapalloarkisto:** tilastot, arvokisat, pelaajat ja stadionit

## Yleiset toimenpiteet

### Uutisen kirjoittaminen

Tämä korvaa blogiin kirjoittamisen. Studio toimii myös puhelimen selaimessa.

1. **Uutiset** → **+** (Luo uusi).
2. **Otsikko**, sen jälkeen **Polku** → *Luo* (Generate). **Julkaisuaika** on oletuksena nyt.
3. **Lyhenne** (1–2 virkettä) näkyy uutislistalla ja jutun alussa.
   **Tiivistelmän** voi jättää tyhjäksi.
4. **Kansikuva** ja **Sisältö**. Sisältöön voi lisätä otsikoita, listoja, linkkejä ja
   **kuvia tekstin sekaan**: paina **+** tekstin kohdalla → *Kuva*.
   **YouTube-video** lisätään samalla tavalla: napsauta Sisältö-kentän tekstiin ja paina
   kentän työkalupalkin oikeasta reunasta toistokolmiota ▷ (kapealla näytöllä **+**-valikosta
   *YouTube-video*). Liitä videon
   osoite (YouTubessa videon alta **Jaa** → **Kopioi**) ja kirjoita lyhyt otsikko, esim.
   "Huuhkajien maali Unkaria vastaan 2023". Sivulla näkyy videon kuva ja toistopainike;
   video alkaa, kun lukija painaa sitä. Jos haluat videon alkavan tietystä kohdasta,
   rastita YouTuben Jaa-ikkunassa *Aloita kohdasta* ennen kopiointia.
   Pelkän linkin voi edelleen tehdä tekstiin tavallisena linkkinä.
   Video toimii samoin kaikissa tekstikentissä, joissa on **+**: sivut, tapahtumat,
   ravintolat ja jalkapalloarkisto (tilastojen esittelyt ja lisätiedot, arvokisat,
   pelaajat, stadionit, lehtileikkeet).
5. **Kategoriat:** rastita sopivat (esim. Palloveikkaus, Matkakuvaus, Tapahtumat).
6. **Julkaise**.

**Ajastus:** jos haluat uutisen näkyviin myöhemmin (esim. vuosikokouskutsu maanantaina
klo 8), valitse **Julkaisuaika**-kenttään se hetki ja paina **Julkaise** heti. Uutinen
odottaa piilossa ja tulee näkyviin itsestään noin minuutin kuluessa valitusta ajasta.
Listassa ja kohdassa **Tehtävät sinulle → Ajastetut uutiset** sen kohdalla lukee
*Ajastettu* ja aika.

### Jakokuva (kun linkki jaetaan WhatsAppissa tai Facebookissa)

Kun sivuston linkki jaetaan, esikatselussa näkyy kuva, otsikko ja sivuston osoite. Sama
pätee uutisiin, tapahtumiin, sivuihin, ravintoloihin, klubin toimintaan, gallerioihin ja
jalkapalloarkistoon. Kuva valitaan automaattisesti tässä järjestyksessä:

1. sivun **oma kuva** (uutisen ja galleria-albumin kansikuva, tapahtuman kuva, sivun
   yläkuva, ravintolan, stadionin tai pelaajan ensimmäinen kuva)
2. ensimmäinen **kuva tekstin seassa**
3. ensimmäisen **YouTube-videon kuva** toistopainikkeella
4. **klubin logo** valkoisella pohjalla, jos muuta ei ole

Paras esikatselu syntyy, kun sivulla on oma kuva. Hyvä kuva on vaakakuva, vähintään
noin 1200 pikseliä leveä, ja sen tärkein kohta on keskellä: WhatsApp näyttää kuvan
usein pienenä neliönä, joka leikataan keskeltä. Hyvin pieniä kuvia (esim. vanhan
sivuston pikkukuvat) ei käytetä, koska ne näyttäisivät suttuisilta; silloin
esikatselussa on logo. Kuvaan ei tarvitse lisätä logoa tai tekstiä, koska otsikko ja
osoite näkyvät esikatselussa kuvan vieressä.

WhatsApp ja Facebook muistavat kerran jaetun linkin kuvan. Jos lisäät kuvan vasta
jakamisen jälkeen, vanha kuva voi näkyä samassa linkissä vielä jonkin aikaa.

### Uusi uutiskategoria

Kategoriat näkyvät uutisten yhteydessä ja uutislistan suodattimessa (/uutiset).

1. **Uutiskategoriat** → **+**. Toinen tapa: uutisen Kategoriat-kohdan linkki
   **Lisää uusi kategoria** (aukeaa uuteen välilehteen).
2. **Nimi**, esim. *Vierasmatkat*. **Polku** → *Luo*.
3. Valinnainen **Järjestys suodattimessa**: pienin numero ensin. Nykyiset ovat
   10, 20, 30 … 90, joten esim. 45 sijoittuu Tapahtumien ja Jalkapallon väliin.
4. **Julkaise**. Kategoria ilmestyy uutisten valintaruutuihin heti, ja suodattimeen
   kun ensimmäinen uutinen on merkitty siihen.

**Nimen voi vaihtaa** milloin tahansa: uusi nimi näkyy kaikissa uutisissa. **Älä muuta
julkaistun kategorian polkua**, koska vanhat linkit lakkaisivat toimimasta.
**Kategorian poisto** onnistuu vasta, kun mikään uutinen ei käytä sitä; Studio kertoo,
mitkä uutiset siihen viittaavat. Poista rasti niistä ensin.

Palloveikkauksen tilanne on tavallinen uutinen. Kirjoita sarjataulukko riveinä:
**Shift + Enter** vaihtaa rivin saman kappaleen sisällä, kuten blogissa ennen.

Sivusto tekee muutaman asian itse, eikä sinun tarvitse tehdä niille mitään:
- **Ensimmäinen kappale** näytetään isommalla kirjasimella johdantona, jos se on
  lyhyt tai keskipitkä, noin 1–4 lausetta. Kirjoita siis alkuun pari lausetta,
  jotka kertovat, mistä jutussa on kyse.
- **Lukuaika** ("3 min lukuaika") näkyy pidemmissä jutuissa.
- **Jaa-painike** ja linkit edelliseen ja seuraavaan uutiseen tulevat jokaiseen
  uutiseen.

Uutissivulla on **haku**. Julkaistu uutinen löytyy haulla heti, eikä sinun tarvitse
tehdä mitään. Hyvä otsikko ja lyhenne auttavat, koska otsikko-osumat nousevat
tuloksissa ylimmäksi.

### Tunnisteet uutiselle

Tunnisteet ovat uutisen aiheita, kuten blogin "labels": joukkue, paikka tai henkilö,
esim. *Huuhkajat*, *Olympiastadion*, *Teemu Pukki*. Jokaisesta tunnisteesta tulee oma sivu,
jolla on kaikki sen uutiset (osoite **/uutiset/tunniste/huuhkajat**). Kaikki tunnisteet
ovat hakemistossa **/uutiset/tunnisteet**.

1. Uutisen **Sisältö**-välilehdellä kenttä **Tunnisteet**.
2. Kirjoita pari ensimmäistä kirjainta. Kentän alle tulee lista jo käytetyistä
   tunnisteista ja niiden uutismäärä (esim. *Huuhkajat · 117 uutista*).
3. **Valitse listalta**, jos tunniste on jo olemassa. Näin sama aihe pysyy yhdellä sivulla.
   Uusi tunniste lisätään kirjoittamalla se ja painamalla **Enter**.
4. Lisätyt tunnisteet näkyvät kentän yläpuolella. **×** tunnisteen vieressä poistaa sen.
5. **Julkaise**.

Hyvä tietää:
- Kirjainkoolla ei ole väliä. Jos kirjoitat *huuhkajat*, Studio lisää sen vakiintuneessa
  muodossa *Huuhkajat* ja kertoo siitä kentän alla.
- Saman tunnisteen voi lisätä vain kerran. Jos se on jo uutisessa, kentän alle tulee
  siitä maininta.
- Useamman tunnisteen voi kirjoittaa kerralla pilkuilla erotettuina: *Lahti, Olympiastadion*.
- Kentän alla olevat **Suosituimmat**-painikkeet lisäävät yleisimmän tunnisteen yhdellä
  klikkauksella.
- Tunnisteita voi olla enintään 30 per uutinen.

> **SEO**-välilehden **Blogin tunnisteet** on vain tallenne vanhan blogin tunnisteista.
> Sen muokkaaminen ei muuta sivustoa. Sivustolla näkyvät tunnisteet muokataan
> **Sisältö**-välilehden kentässä **Tunnisteet**.

### Veikkaus tai kommentit uutisen alle

Jäsenet voivat jättää veikkauksen tai kommentin uutisen alle, ja viesti näkyy heti.

Kuka tahansa voi kirjoittaa pelkällä nimellään. Asiattomat viestit piilotetaan jälkikäteen
(ks. alla), ja kommentoinnin voi sulkea uutiselta rastin poistamalla.

**Palloveikkaus (joukkueet järjestykseen):**
1. Tee uutinen, esim. "Palloveikkaus 2027", ja kirjoita ohjeet tekstiin.
2. Välilehti **Kommentit ja veikkaus** → rasti **Salli kommentit**.
3. Lomakkeen tyyppi **Sarjajärjestys**. **Joukkueet**: kaikki sarjan joukkueet, yksi per rivi.
4. **Veikkaus sulkeutuu**, esim. ensimmäisen kierroksen alku.
5. **Julkaise**.

**Voittajaveikkaus (EM/MM):** sama, mutta tyyppi **Voittajaveikkaus**. Valitse sijojen
määrä (oletus 4) ja kysytäänkö maalikuningas.

**Tavallinen kommentti** (esim. "Suomen paras avaus", kesäjuhla): tyyppi **Kommentti**.

**Valvonta:** valikossa **Kommentit ja veikkaukset**:

- **Uusimmat**: kaikki kommentit, uusin ensin.
- **Uutisittain**: valitse uutinen, niin näet vain sen kommentit (esim. yhden veikkauksen kaikki vastaukset).
- **Piilotetut**: piilottamasi kommentit.

Asiaton viesti: avaa kommentti ja paina alareunan **Piilota sivulta**. Kommentti
katoaa sivulta heti, eikä Julkaise-painallusta tarvita. Kommentti säilyy Studiossa,
ja sen saa takaisin samasta painikkeesta (**Näytä sivulla**). Listassa piilotetun
kommentin edessä on 🚫.

Pysyvä poisto (esim. jäsen pyytää poistamaan tietonsa): alareunan **⋯ → Poista
pysyvästi**. Poistettua ei voi palauttaa.

> **Älä käytä Kopioi (Duplicate) -toimintoa vanhoille blogikirjoituksille**, koska kopio
> saisi blogin alkuperätiedot. Tee uusi uutinen tyhjästä ja kopioi joukkueet
> tekstinä edellisestä veikkauksesta.

### Ottelun lisääminen otteluohjelmaan

Veikkausliigan ottelut tulevat automaattisesti. Lisää käsin maajoukkueen ottelut ja
ottelut, joihin klubi lähtee.

1. **Ottelut** → **+**.
2. **Aika** (päivä ja kellonaika), **Koti** ja **Vieras**. Kun alat kirjoittaa
   joukkuetta, Studio ehdottaa nimiä automaattisesta otteluohjelmasta. Valitse
   ehdotus, niin kirjoitusasu on varmasti oikein. Suomen maajoukkue on tasan "Suomi".
   Jos Studio kysyy keltaisella **Tarkoititko…?**, korjaa nimi. Muuten merkintä ei
   yhdisty oikeaan otteluun. Muiden maiden nimet (esim. "Albania") ovat kunnossa sellaisenaan.
3. Valinnaiset: kilpailu, stadion, **Klubi paikalla** tai **Vierasmatka**.
4. **Julkaise**.

Etusivulla näkyvät Huuhkajien ja FC Lahden ottelut, ja sivun yläosassa on
laskuri seuraavaan Huuhkajien otteluun. Laskuri päivittyy itsestään, kun lisäät
ottelun, eikä sitä tarvitse muuttaa erikseen. FC Lahden ottelut tulevat
automaattisesti. Valinnat löytyvät kohdasta **Etusivu → Otteluohjelma ja
tapahtumat**. Kohtaan **Näytä myös näiden seurojen ottelut** voit lisätä tai
poistaa seuroja (kirjoita nimi kuten Veikkausliigan sivuilla ja paina Enter).

### Tapahtuman lisääminen

1. **Tapahtumat** → **+**.
2. Nimi, polku (*Luo*), alkamis- ja päättymisaika, paikka, kansikuva ja kuvaus.
3. Ilmoittautumislinkki tai -sähköposti (valinnainen).
4. **Julkaise**. Tapahtuma näkyy etusivulla ja /tapahtumat-sivulla, kunnes se on ohi.

Niin kauan kuin yhtään tapahtumaa ei ole, Tapahtumat-osio on piilossa valikosta,
alatunnisteesta ja hakukoneilta. Se tulee näkyviin itsestään ensimmäisen tapahtuman
julkaisun jälkeen. Sama koskee Kuvagalleriaa ja albumeita.

**Jakokuva:** kun tapahtuman linkki jaetaan WhatsAppissa tai Facebookissa, esikatselun
kuvana on tapahtuman **kansikuva**. Ilman kansikuvaa käytetään kuvausta: ensin siinä
olevaa kuvaa, sitten YouTube-videon kuvaa, ja jos kumpaakaan ei ole, klubin logoa.
Lisää siis kansikuva ennen kuin jaat kutsun: vaakakuva, vähintään noin 1200 pikseliä
leveä, tärkein kohta keskellä. Kuvaan ei tarvitse kirjoittaa tapahtuman nimeä tai
aikaa, koska otsikko näkyy esikatselussa kuvan vieressä. Lisätietoa kohdassa
*Jakokuva* uutisohjeen alla.

### Uusi sivu (esim. säännöt)

1. **Sivut** → **+**.
2. **Otsikko** ja **Polku**. Polku määrää osoitteen: `klubi/historia` näkyy osoitteessa
   /klubi/historia. Osa poluista on varattu (esim. uutiset, ravintolat), ja Studio kertoo
   niistä.
3. Ingressi ja sisältö. **Julkaise**.

**Taulukot sivulle:** sivun kohtaan **Taulukot** voi valita taulukoita (esim. tulokset),
jotka näkyvät sivun lopussa. Taulukot tehdään kohdassa **Jalkapalloarkisto → Tilastot**
kategorialla *Klubin omat tilastot*.

Jos sivu on kirjoitettu muulla kielellä (esim. englanninkielinen esittely), valitse
**Sisällön kieli**. Ruudunlukija ääntää tekstin silloin oikein.

### Kuvan vaihtaminen

1. Avaa dokumentti ja klikkaa kuvaa → **Korvaa** (Replace).
2. Täytä **Vaihtoehtoinen teksti (alt)**: kuvaile 1–2 lauseella, mitä kuvassa näkyy.
   Teksti on pakollinen, koska ruudunlukija lukee sen näkövammaisille.
3. **Julkaise**.

Pakkaa yli 5 Mt:n kuvat ensin (esim. tinypng.com).

### Galleria-albumin lisääminen

1. **Galleria-albumit** → **+**. Anna nimi, polku (*Luo*), päivämäärä ja kansikuva.
2. **Kuvat:** raahaa kaikki kuvat kerralla tietokoneen kansiosta kenttään. Järjestä
   raahaamalla.
3. Kuvaukset (**Mitä kuvassa on**) ovat suositeltavia, mutta eivät pakollisia. Ilman
   kuvausta sivu nimeää kuvan albumin ja numeron mukaan ("Vappu 2026, kuva 3/40").
   Kuvauksia voi lisätä myöhemmin.
4. **Julkaise**.

### Etusivun muokkaaminen

Etusivun yläosa päivittyy itsestään: siinä näkyy aina **uusin juttu** isona,
ja oikealla **Seuraavaksi**-kortissa seuraava Huuhkajien ottelu laskurin kanssa
ja seuraava klubin tapahtuma. Kun julkaiset uutisen, se nousee yläosaan.

1. **Sivun asetukset → Etusivu → Yläosa**.
2. Halutessasi:
   - **Pääjuttu:** valitse juttu, jos haluat nostaa jonkin muun kuin uusimman
     (esim. vuosikokouskutsun). Anna **Pääjuttu näkyy asti** -päivä, niin yläosa
     palaa siitä eteenpäin uusimpaan juttuun itsestään.
   - **Taustakuva:** näkyy mustavalkoisena tummansinisen sävyn alla. Vaihda
     kuva vaikka kauden mukaan; tekstit erottuvat aina. Sama kuva näkyy somejaoissa.
   - **Pikalinkit:** enintään neljä linkkiä Seuraavaksi-korttiin, esim.
     "Palloveikkaus" → `/klubi/palloveikkaus`. Sivuston oma polku alkaa `/`,
     ulkoinen linkki `https://`. Studio huomauttaa, jos muoto on väärä.
   - **Näytä seuraava Huuhkajien ottelu ja laskuri:** pois päältä, jos et halua sitä.
3. Hakukoneiden kuvaus on **SEO**-välilehdellä. Se ei näy sivulla.
4. **Lohkot:** vedä kahvasta muuttaaksesi järjestystä ja lisää uusi **+**-painikkeella.
   Roskakori **poistaa** lohkon. Voit palauttaa sen versiohistoriasta.
5. **Julkaise**.

### Yhteystiedot

**Sivun asetukset → Yhteystiedot** → muokkaa → **Julkaise**. Muutos näkyy footerissa ja
yhteystietosivulla.

### Valikon muokkaaminen

1. **Sivun asetukset → Navigaatio**.
2. Muokkaa linkkiä: klikkaa sitä ja muuta **Otsikko** tai **Linkki**.
3. Uusi linkki: **+** listan alla. Linkki alkaa `/` (oma sivu) tai `https://` (muu sivusto).
4. Järjestys: vedä kahvasta (⋮⋮).
5. Alavalikko: avaa linkki → **Alavalikko** → **+**.
6. **Julkaise**.

Päälinkkejä enintään 7.

### Hallituksen jäsenet

Uusi jäsen: **Hallitus** → **+** → **Nimi**, **Rooli** (esim. Sihteeri) ja
**Järjestysnumero** (1 näkyy ensin) → **Julkaise**. Kuva, esittely, sähköposti ja
puhelin ovat vapaaehtoisia.

Jäsen vaihtuu: avaa vanha jäsen → **⋯ → Poista**, ja lisää uusi.

### Klubin toiminta: uusi vuosi

1. **Klubin toiminta** → valitse toiminta (esim. Mölkky).
2. Välilehti **Vuosittain** → **+**.
3. Täytä **Vuosi**. Muut kentät ovat vapaaehtoisia. **Järjestysnumero** on tavallinen
   luku (esim. 37).
4. **Julkaise**. Uusin vuosi näkyy sivulla ensimmäisenä.

### Ravintolan arvosana ja klubilaisten pisteet

Ravintolan arvosana lasketaan **automaattisesti** klubilaisten pisteistä, kuten
ennen ruokailutaulukossa: jokaisen klubilaisen ruoka, hinta ja viihtyvyys, ja
ravintolan arvosana on niiden keskiarvo (ilman painotuksia). Arvosanaa ei
kirjoiteta käsin, ja ravintolan arvosanakentät ovat lukittuja.

- **Pisteiden lisääminen:** Ravintolat → **Klubilaisten arvosanat** → **+**. Valitse
  ravintola ja klubilainen, anna pisteet ja päivä → **Julkaise**. Arvosana päivittyy
  sivulle itsestään.
- **Uusintakäynti:** avaa klubilaisen arvosana (sama lista, hae ravintolan nimellä),
  muuta pisteet ja päivä → **Julkaise**. Uusin arvosana korvaa vanhan, joten
  samaa klubilaista ei lasketa kahdesti. Studio varoittaa, jos yrität lisätä
  klubilaiselle toisen arvosanan samaan ravintolaan.
- **Uusi klubilainen:** Ravintolat → **Klubilaiset** → **+** → nimi → **Julkaise**. Nimi
  tulee heti arvostelulomakkeen nimipainikkeisiin. Kahdella klubilaisella ei voi olla
  samaa nimeä: lisää tarvittaessa sukunimen alkukirjain (esim. "Mikko K.").
- **Klubilainen lopettaa:** avaa klubilainen ja poista valinta **Näytä arvostelulomakkeella**
  → **Julkaise**. Nimi poistuu lomakkeelta, mutta hänen aiemmat arvosanansa säilyvät.
  Klubilaista ei voi poistaa kokonaan, koska ravintoloiden arvosanat viittaavat häneen.
- Lomakkeelta tullut arvostelu on myös klubilaisen arvosana, kun se on liitetty
  klubilaiseen (ks. alla).

**Kahden klubilaisen sääntö:** ravintola näkyy sivustolla vasta, kun vähintään kaksi
klubilaista on arvioinut sen. Siihen asti se odottaa listassa **Ravintolat → Odottavat
toista arvioijaa**, ja se tulee sivulle itsestään, kun toinen arvosana lisätään.
Klubilaiset näkevät samat paikat sivulla **/ravintolat/odottavat** (painike
Ravintola-arviot-sivun otsikon alla; haku nimellä tai kaupungilla) ja arvostelun
ravintolavaiheessa, ja voivat arvostella ne sieltä suoraan.

Ravintolasivulla näkyy taulukko **Klubilaisten arvosanat** ja arvosanan alla
esim. "Keskiarvo 10 klubilaisen arvosanasta". Tuoreimmin arvioidut näkyvät
etusivulla ja ravintolalistan alussa.

**Käynnit:** kun klubi käy ravintolassa, lisää päivä myös ravintolan kohtaan
**Arvostelu → Käynnit listan alkuun** (uusin ensin). Studio huomauttaa, jos
järjestys on väärä.

### Ravintola-arvostelun hyväksyminen

Kävijöiden lähettämät arvostelut eivät näy sivulla ennen kuin hyväksyt ne.
Hyväksymätön arvostelu ei näy sivulla edes esikatselussa, vain tässä jonossa.

> **Keltainen "Esikatselutila"-palkki sivun yläreunassa?** Olet käyttänyt Studion
> esikatselua, ja selaimesi näyttää nyt myös julkaisemattomat luonnokset (esim.
> keskeneräiset uutiset). Kävijät eivät näe niitä. Paina palkista **Poistu
> esikatselusta**, niin näet sivun kuten kävijät.

1. **Ravintolat → Arvostelut: odottavat hyväksyntää**.
   Tarkista kohta **Klubilainen**: klubilainen valitsee lomakkeella oman nimensä, joten
   kohta on yleensä valmiiksi oikein. Listassa lukee **Ei klubilainen**, jos arvostelija
   ei valinnut nimeään. Jos hän kuitenkin on klubilainen, valitse hänet. Muuten jätä
   tyhjäksi: arvostelu näkyy silti, mutta ei vaikuta ravintolan arvosanaan.
   Klubilaisen arvostelu korvaa hänen aiemman arvosanansa ravintolalle.
2. Avaa arvostelu ja lue se. Katso myös kuvat, jos niitä on (listassa näkyy esim. "2 kuvaa").
   Arvosteluteksti on vapaaehtoinen: pelkät arvosanat ovat kelvollinen arvostelu.
3. **Hyväksy:** paina **Julkaise**. Arvostelu ja sen kuvat näkyvät ravintolan sivulla.
4. **Hylkää:** avaa alareunan päänapin vieressä oleva **⌄**-valikko → **Hylkää arvostelu** →
   **Vahvista**. Arvostelu ja sen kuvat poistetaan heti. (Päänappi on **Julkaise**, tai uuden
   ravintolan ehdotuksessa **Hyväksy ja luo ravintola**; Hylkää on aina valikossa ensimmäisenä.)

**Kuvat.** Kävijä voi liittää arvosteluun enintään kolme kuvaa. Tarkista kuvat ennen julkaisua:

- **Sopimaton kuva, muuten hyvä arvostelu:** vie hiiri kuvan päälle kohdassa **Kuvat** →
  **⋯** → **Poista**, ja paina sitten **Julkaise**.
- **Kuvaus** on teksti, jonka ruudunlukija lukee näkövammaiselle. Jos kävijä ei kirjoittanut
  sitä, siinä lukee "Kävijän kuva ravintolasta …". Voit tarkentaa sitä, esim. "Paahdettu lohi".
- Arvosteluissa ei ole tavallista Poista-toimintoa. Hylkäys ja poisto tehdään aina
  **Hylkää arvostelu** (tai julkaistussa **Poista arvostelu**) -toiminnolla, joka poistaa
  myös kuvat.
- Kuvia, joissa on tunnistettavia ihmisiä, ei kannata julkaista ilman syytä.

**Uusi ravintola.** Kävijä voi arvostella myös ravintolan, jota hakemistossa ei vielä ole.
Silloin listassa lukee **UUSI: ravintolan nimi**, ja arvostelussa näkyy laatikko
*Kävijän ehdottama uusi ravintola*. Kohdan **Ravintola** keltainen huomautus on tällöin
normaali: ravintola täyttyy, kun painat **Hyväksy ja luo ravintola**.

1. Tarkista nimi, kaupunki ja maa. Voit korjata kirjoitusvirheet ja lisätä osoitteen
   tai verkkosivun suoraan laatikkoon: ravintola luodaan näillä tiedoilla. Jos ravintola on jo hakemistossa toisella nimellä,
   valitse se kohtaan **Ravintola** ja paina **Julkaise**.
2. Muuten paina alareunan vihreää **Hyväksy ja luo ravintola**. Vahvistus kertoo, mitä
   tapahtuu, ja paina sitten **Vahvista**:
   - *"…lisätään hakemistoon"*: ravintola luodaan ja arvostelu julkaistaan sen sivulle.
   - *"…on jo hakemistossa"*: toinen klubilainen on arvostellut saman ravintolan
     (esim. samalla illallisella), ja ravintola on jo luotu. Arvostelu liitetään siihen;
     uutta ravintolaa ei synny. Kirjainkoko, ääkköset ja sana "ravintola" eivät haittaa
     ("Ravintola Savu" ja "Savu" ovat sama).

   Saman illan arvostelut tulevat yleensä samalla nimellä, koska klubilaiset valitsevat
   ensimmäisen ehdotuksen listasta. Jos nimet poikkeavat selvästi ("Savu" ja "Bistro Savu"),
   hyväksy ensimmäinen ja valitse toiselle kohtaan **Ravintola** juuri luotu ravintola →
   **Julkaise**.
3. Täydennä ravintolan tietoja halutessasi: **Kaikki ravintolat** → ravintola (kuva,
   osoite) → **Julkaise**.
4. Jos kaupunki oli uusi, avaa se **Kaupungit**-listasta ja valitse maakunta.

Arvostelijalta kysytään vain nimi, joka näkyy arvostelun yhteydessä. Sähköpostia ei kerätä.

**Automaattinen huolto.** Sivusto tarkistaa joka yö ravintoloiden arvosanat ja poistaa
hylättyjen arvostelujen jälkeen mahdollisesti jääneet käyttämättömät kuvat. Sinun ei
tarvitse tehdä mitään. Jos arvosteluja tulee tunnissa poikkeuksellisen paljon (yli 30),
lomake pitää tauon, ettei jono täyty roskapostista.

### Uuden kaupungin lisääminen (ravintolat)

1. **Ravintolat → Kaupungit** → **+**.
2. **Nimi** suomeksi (esim. "Jyväskylä", "Tukholma"), sen jälkeen **Osoitetunniste** → *Luo*.
3. **Maa** kirjoitetaan aina samalla tavalla kuin muissa: "Suomi", "Saksa", "Alankomaat"
   (ei "Hollanti"), "Iso-Britannia" (ei "Englanti"), "Tšekki".
4. **Maakunta** (vain Suomi): valitse listasta. Kylästä valitaan sen kunnan maakunta
   (Vääksy → Asikkala → Päijät-Häme).
5. **Julkaise** ja valitse kaupunki ravintolan **Kaupunki**-kenttään.

Jos ravintolan kaupunkia ei tiedetä (esim. laiva), liitä se maan nimiseen "kaupunkiin"
(esim. "Ruotsi").

Ravintolasivun **Alue**- ja **Kaupunki**-valikot (ja niiden lukumäärät) rakentuvat näistä
tiedoista itsestään: uusi maa, maakunta tai kaupunki ilmestyy valikkoon, kun sinne on
julkaistu ensimmäinen ravintola. Valikoita ei tarvitse ylläpitää erikseen. Jos kaupunki
puuttuu maakuntavalinnasta, tarkista sen **Maakunta**-kenttä.

### Litmanen-osio

Valikon **Litmanen** alla on neljä sivua:

| Sivu | Mistä sisältö tulee Studiossa |
|---|---|
| **Jari Litmanen** (yleiskatsaus) | **Jalkapalloarkisto → Pelaajat → Jari Litmanen**: perustiedot, pääkuva (Kuvat-kentän ensimmäinen), esittely, seurat ja saavutukset (välilehti *Ura*). Avainluvut lasketaan näistä automaattisesti. |
| **Lehtileikkeet** | **Jalkapalloarkisto → Lehtileikkeet**: jutut, joiden *Sivu* on "Lehtileikkeet". |
| **Patsas** | Jari Litmasen sivun välilehti *Patsas* (paljastuspäivä, sijainti, esittely, kuvat) + lehtileikkeet, joiden *Sivu* on "Patsas". |
| **Litmasen loukkaantumiset** | Jari Litmasen sivun *Tilastotaulukot* (välilehti *Ura*) + lehtileikkeet, joiden *Sivu* on "Terveys ja loukkaantumiset". Yhteenveto ja kaavio lasketaan taulukosta automaattisesti. |

**Uusi lehtijuttu:** Jalkapalloarkisto → Lehtileikkeet → **+**. Täytä otsikko, pelaaja
(Jari Litmanen), sivu, julkaisupäivä, lähde (esim. *is.fi*) ja teksti. Linkki
alkuperäiseen juttuun on valinnainen. Jutut järjestyvät sivulla julkaisupäivän mukaan
uusin ensin, ja vuosilinkit päivittyvät itsestään. Sivulla näkyy jutun alku, ja loput
avautuvat *Lue koko juttu* -painikkeesta.

**Uusi patsaskuva:** Jari Litmanen → välilehti *Patsas* → Kuvat → lisää kuva, kirjoita
alt-teksti ja valitse kuvauspäivä. Kuvat järjestyvät päivän mukaan uusin ensin.

**Tarkistettavat:** siirrossa kahdelle jutulle ei löytynyt otsikkoa, joten otsikoksi on
otettu jutun ensimmäinen virke. Ne löytyvät kohdasta **Tarkistettavat → Lehtileikkeet**:
korjaa otsikko ja ota *Vaatii tarkistuksen* -rasti pois.

### Järkytykset

**Suomen jalkapallon TOP 10 järkytykset** on omalla sivullaan (`/jalkapalloarkisto/jarkytykset`,
arkiston valikossa *TOP 10 järkytykset*). Taulukko löytyy Studiosta **Jalkapallotilastot**-listasta;
sivulle päätyvät kaikki taulukot, joiden kategoria on *Suomen jalkapallon järkytykset*.

### Maailman parhaat

**Maailman paras avaus vuosittain** on omalla sivullaan (`/jalkapalloarkisto/maailman-parhaat`,
arkiston valikossa *Maailman parhaat*). Uuden vuoden kenttäkaavio lisätään Studiossa
taulukon **Maailman paras avaus vuosittain** kenttään **Kuvat** (listan alkuun). Sivulle
päätyvät kaikki taulukot, joiden kategoria on *Maailman paras avaus*.

### Palloveikkauksen sivut

Jokaisella veikkauksella on oma sivunsa: **Sivut → Maaottelujen tulosveikkaus,
Arvokisaveikkaus, Veikkausliigan palloveikkaus**. Säännöt kirjoitetaan sivun
pääsisältöön, ja veikkauksen taulukot lisätään sivun kohtaan **Taulukot** (uusi kausi:
tee taulukko ja lisää se listan alkuun). Palloveikkaus-sivu (`/klubi/palloveikkaus`)
listaa veikkaukset automaattisesti. Uusi veikkaus tehdään luomalla uusi sivu, jonka
polku alkaa `klubi/palloveikkaus/`, esimerkiksi `klubi/palloveikkaus/mestarisarja`.

### Taulukon muokkaaminen (tilastot, palloveikkaus, mölkky)

Taulukot löytyvät kohdasta **Jalkapalloarkisto → Tilastot**. Avaa taulukko ja valitse
välilehti **Tilastodata**. Taulukko toimii kuten Excel.

- **Solun muuttaminen:** napsauta solua ja kirjoita. Muutos tallentuu, kun siirryt
  pois solusta. **Enter** siirtää alas, **nuolinäppäimet** solusta toiseen ja
  **Esc** peruu muutoksen.
- **Päivämäärät** kirjoitetaan tuttuun tapaan: `26.9.2026`, `9/2026` tai väli
  `30.1.–1.2.2009`. **Luvut** voi kirjoittaa välilyönnillä (`61 035`).
- **Uusi rivi:** **Lisää rivi** taulukon alla, tai rivinumeron vieressä olevasta
  **⋮**-valikosta *Lisää rivi yläpuolelle / alapuolelle*. Samasta valikosta rivin voi
  siirtää tai poistaa. Poiston voi perua ilmoituksen **Kumoa**-painikkeella.
- **Sarakkeet:** sarakkeen otsikon **⋮**-valikosta muutetaan nimeä ja tyyppiä,
  lisätään sarake viereen, siirretään tai poistetaan.
- **Excelistä:** kopioi solut Excelissä (Ctrl+C), napsauta taulukon solua ja liitä
  (Ctrl+V). Tiedot täyttyvät siitä solusta alkaen, ja puuttuvat rivit lisätään loppuun.
  Isomman taulukon voi tuoda painikkeella **Tuo Excelistä**, joka näyttää ensin
  esikatselun.
- **Exceliin:** **Kopioi Exceliin** kopioi koko taulukon. Liitä se Exceliin, muokkaa ja
  tuo takaisin **Tuo Excelistä → Korvaa koko taulukko**.
- **Etsi taulukosta** näyttää vain rivit, joilla hakusana esiintyy.
- Aaltoviiva solun alla tarkoittaa, että arvo ei näytä numerolta tai päivämäärältä.
  Arvo tallentuu silti, ja viemällä hiiren solun päälle näet selityksen.

Muista lopuksi **Julkaise**.

### Huuhkajat-taulukon lisääminen

Huuhkajat-sivu on jaettu aiheisiin, ja jokaisella aiheella on oma sivunsa
(Pelaajatilastot, Huuhkaja-arvostelu, Kansojen liiga, Paras avauskokoonpano,
Englannin pääsarjassa).

1. **Jalkapalloarkisto → Tilastot** → **+**.
2. **Kategoria:** *Huuhkajat (maajoukkueen tilastot)*.
3. **Osio Huuhkajat-sivulla:** valitse aihe. Ilman valintaa taulukkoa ei voi julkaista.
4. **Järjestysnumero:** pienempi luku näkyy osion sivulla ylempänä.
5. Täytä taulukko välilehdellä **Tilastodata** (ks. edellä), esim. **Tuo Excelistä**.
6. **Julkaise**. Uusi osio ilmestyy Huuhkajat-sivulle vasta, kun siinä on taulukko.

Karsintasarjat (kategoria *Karsinta*) ovat omia sivujaan, ja ne listataan
Huuhkajat-sivun alaosassa uusin ensin. Kansojen liigan kaudet näkyvät samassa
kohdassa karsintasarjojen alla.

**Uusi Kansojen liigan kausi:** kun osioksi on valittu *Kansojen liiga*, näkyviin
tulee kenttä **Kauden ottelut ja tulokset**. Valitse siihen saman kauden
karsintasivu (esim. *Suomen ottelut 2026–2027 ja EM 2028 -karsinta*). Silloin
sarjataulukko näkyy myös karsintasivulla otteluiden yhteydessä, ja Kansojen
liiga -sivulla taulukon alla on linkki kauden otteluihin. Jos kenttä on tyhjä,
Studio muistuttaa siitä keltaisella varoituksella. Ottelut kirjoitetaan
edelleen karsintasivulle, ja sarjataulukkoa päivitetään vain Kansojen liigan
taulukkoon.

### Kokoonpano pelikentälle

Avauskokoonpanot (esim. Huuhkaja-arvostelun "Huuhkajat avauskokoonpano
2005–2025") piirretään sivulle pelikentäksi.

1. Avaa tilasto ja tekstikenttä, esim. **Lisätiedot taulukon jälkeen**.
2. Valitse tekstieditorin **+**-valikosta **Kokoonpano pelikentällä**
   (olemassa olevaa voi muokata klikkaamalla sitä).
3. **Otsikko**, esim. "Huuhkajat avauskokoonpano 2005–2025 (91 ottelua)".
4. **Rivit hyökkäyksestä maalivahtiin:** ylin rivi on hyökkäys, alin
   maalivahti. Lisää jokaiselle riville pelaajat vasemmalta oikealle: nimi ja
   luku (luku näkyy pelaajan pallossa).
5. **Selite** (valinnainen) näkyy kentän alla, esim. mitä luku tarkoittaa.
6. **Julkaise**. Studio varoittaa, jos kentällä on muu määrä kuin 11 pelaajaa.

## Tarkistettavat

Migraatio ei arvannut asioita, joita se ei voinut päätellä varmasti. Se merkitsi
dokumentit rastilla **Vaatii tarkistuksen** ja kirjoitti syyn kenttään
**Mitä tarkistaa** (näkyy vain, kun rasti on päällä).

1. Valikko **Tarkistettavat** → valitse tyyppi.
2. Avaa dokumentti ja lue **Mitä tarkistaa**.
3. Korjaa tiedot tai totea ne oikeiksi, ota rasti pois ja **Julkaise**.

Lista siivottiin 1.10.2026: turhat merkinnät poistettiin ja varmat korjaukset tehtiin.
Ajantasainen määrä näkyy valikossa **Tarkistettavat**. Merkki ⚠ nimen edessä kertoo
saman listoissa.

## Täytä itse — puuttuvat tiedot

Näitä ei ollut vanhalla sivulla. Tarkista, että ne on täytetty:

- [ ] Yhteystiedot: osoite, **sähköposti**, puhelin (Sivun asetukset → Yhteystiedot)
- [ ] Y-tunnus ja IBAN (Sivun asetukset → Yhteystiedot)
- [ ] Sosiaalinen media (Sivun asetukset → Yhteystiedot)
- [ ] Hallituksen jäsenet (Hallitus)
- [ ] Tulevat tapahtumat (Tapahtumat)
- [ ] Etusivun kuvat: taustakuva ja Klubista-kuva (Sivun asetukset → Etusivu)
- [ ] Tietosuojaselosteen vahvistus hallitukselta (Sivut → Tietosuojaseloste)

## Tietosuojapyynnöt

Jos joku pyytää poistamaan tietonsa (kommentti, veikkaus tai arvostelu kuvineen):

1. Etsi viesti Studion hakukentällä nimellä.
2. Kommentissa ja veikkauksessa **⋯ → Poista pysyvästi**. Arvostelussa **⋯ → Poista arvostelu**, joka poistaa myös kuvat.
   Piilottaminen ei riitä: piilotettu viesti säilyy järjestelmässä ja on yhä teknisesti luettavissa.
3. Vastaa pyytäjälle, että tieto on poistettu. Tietosuojaseloste on osoitteessa /tietosuoja.

## Tyypilliset tilanteet

| Tilanne | Mitä tehdä |
|---|---|
| Julkaisu ei onnistu | Punaiset kentät ovat pakollisia. Vieritä alas, täytä ja yritä uudelleen |
| Muutos ei näy sivulla | Tarkista, että painoit **Julkaise**. Sivu päivittyy yleensä sekunneissa, viimeistään minuutissa |
| Linkki ei toimi | Ulkoinen linkki alkaa `https://`, sivuston oma polku `/` (esim. `/uutiset`) |
| Jotain meni pieleen (alle 3 päivää sitten) | Kellokuvake → versiohistoria → palauta edellinen versio |
| Jotain meni pieleen (yli 3 päivää sitten) | Dokumentin **⋯** → **Palauta varmuuskopiosta** → valitse viikko → tarkista → **Julkaise** |
| Poistin vahingossa | **Sivun asetukset → Varmuuskopiot** → uusin kopio → välilehti **Palauta poistettu** |

## Mitä EI saa tehdä

- **Älä poista** Sivun asetuksien dokumentteja. Niitä ei voi poistaa eikä niiden julkaisua
  perua, mutta jos jokin menee pieleen, soita kehittäjälle.
- **Älä muuta julkaistun sivun Polkua**, koska se rikkoo linkit. Studio varoittaa
  keltaisella, jos polku poikkeaa julkaistusta. Jos muutos on pakko tehdä, kerro
  kehittäjälle, joka tekee ohjauksen. Klubin pääsivujen (Klubi, Hallitus, Toiminta,
  Palloveikkaus) ja Jari Litmasen polut on lukittu kokonaan, koska sivusto hakee ne
  polun perusteella.
- **Älä muuta** kenttiä **Vanha osoite** tai **Alkuperäinen Blogspot-kirjoitus**. Vanhat linkit ohjautuvat niiden varassa.

## Varmuuskopiot

Sivusto tekee joka maanantaiyö automaattisesti varmuuskopion kaikesta julkaistusta
sisällöstä (tekstit ja tiedot). Kopiot näkyvät kohdassa **Sivun asetukset →
Varmuuskopiot**, ja 12 uusinta säilyy (noin kolme kuukautta).

- Sinun ei tarvitse tehdä mitään. Kopioita ei voi muokata eikä poistaa käsin.
- Halutessasi voit ladata kopion talteen klubin omaan pilveen: avaa kopio →
  tiedostokentän **⋯** → **Lataa**. Esimerkiksi kerran kuussa riittää.
- Kuvat eivät ole kopiossa: ne säilyvät Sanityssa, ja kehittäjä ottaa kuvista
  erillisen kopion isompien muutosten yhteydessä.

### Vanhan version palautus

Kun huomaat virheen, joka on tehty yli 3 päivää sitten (versiohistoria ei enää ulotu
siihen):

1. Avaa dokumentti, esim. uutinen tai sivu.
2. Paina alhaalla oikealla Julkaise-painikkeen vieressä **⋯** → **Palauta varmuuskopiosta**.
3. Näet viikot uusin ensin. Jokaisen kohdalla lukee, milloin dokumenttia oli muokattu,
   tai "sama kuin nykyinen", jos se ei ole muuttunut. Paina sopivan viikon kohdalla **Palauta**.
4. Vanha versio tulee **luonnokseksi**. Sivusto ei vielä muutu. Tarkista lomakkeelta,
   että sisältö on oikea, ja paina **Julkaise**.
5. Jos valitsit väärän viikon, palauta toinen viikko tai hylkää luonnos (⋯ → **Hylkää
   muutokset**), jolloin kaikki jää ennalleen.

### Poistetun dokumentin palautus

1. **Sivun asetukset → Varmuuskopiot** → avaa uusin kopio, jossa dokumentti vielä oli.
2. Valitse yläreunasta välilehti **Palauta poistettu**. Siinä ovat kaikki kopion jälkeen
   poistetut dokumentit.
3. Hae nimellä ja paina **Palauta** → **Avaa** → tarkista → **Julkaise**.

Kommentteja ja kävijöiden arvosteluja ei palauteta: niiden poisto on moderointia.
Koko sivuston palautuksen (esim. jos kaikki sisältö katoaa) tekee kehittäjä.

## Tuki

Jos et tiedä, miten jokin tehdään, ota yhteyttä kehittäjään (yhteystiedot on annettu
sinulle erikseen). Tuoreet muutokset (3 päivää) perut versiohistoriasta ja vanhemmat
varmuuskopiosta (ks. Varmuuskopiot), molemmat itse.

### Jos kehittäjä ei ole tavoitettavissa

Sivusto toimii ilman ylläpitoa: sisältö, kuvat ja varmuuskopiot ovat Sanityssa, joka
kuuluu klubille. Kiireettömät asiat voivat odottaa.

- **Sisältövirhe:** korjaa se Studiossa tai palauta edellinen versio versiohistoriasta tai
  varmuuskopiosta.
- **Sivusto ei aukea lainkaan:** tarkista ensin toisella laitteella tai verkolla. Jos vika
  jatkuu yli päivän, uusi ylläpitäjä tarvitsee tämän repositorion
  (github.com/veikkope/klubi) ja ohjeen docs/17 §A3, jossa siirto on kuvattu vaihe vaiheelta.
- **Domain tai sähköposti:** domainin uusinta hoidetaan rekisteröijän (Wepard) kautta,
  ei sivuston kautta.
- **Älä anna** Sanityn tunnuksiasi tai tokeneita kenellekään. Uusi ylläpitäjä kutsutaan
  omalla sähköpostillaan: sanity.io/manage → projekti → **Members** → **Invite**.
