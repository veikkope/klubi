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

### Linkit

Jokaisessa linkissä (valikko, etusivun pikalinkit ja napit, klubin toiminnan
vuosilinkki ja tekstin linkit) valitset ensin **Mihin linkki vie?**:

- **Sivuston sivu:** kirjoita kenttään **Sivu** sivun, uutisen, ravintolan tai muun
  sisällön nimen alkua ja valitse listasta. Linkki pysyy kunnossa, vaikka sivun
  osoite muuttuisi. Valitse tämä aina, kun linkki vie klubin omalle sivulle.
- **Muu osoite:** toinen sivusto (`https://…`), sähköposti (`mailto:nimi@esimerkki.fi`)
  tai puhelin (`tel:+358…`). Sivuston oman osoitteen (`/…`) kirjoitat tähän vain,
  jos sivua ei löydy listasta, esim. `/uutiset/arkisto/2016` tai sivun kohta
  `#ankkuri`.
- **Tiedosto:** PDF, Word (.docx) tai Excel (.xlsx). Raahaa tiedosto kenttään.
  **Tiedosto on julkinen:** se löytyy sivuston tietokannasta, vaikka et
  linkittäisi sitä, ja myös tiedoston alkuperäinen nimi näkyy. Älä liitä
  jäsenluetteloita, pöytäkirjoja, joissa on henkilötietoja, tai muuta
  luottamuksellista. Jos lisäsit vahingossa väärän tiedoston, poista se linkistä
  ja kerro kehittäjälle, joka poistaa sen myös tietokannasta. Sivulla linkin
  perässä näkyy tiedoston tyyppi ja koko, esim. "(PDF, 240 kt)".

Listan alla näkyy, mihin linkki vie, esim. "→ /klubi/toiminta/matkailu".

**Keltaiset varoitukset** eivät estä julkaisua:

- *"… ei ole vielä julkaistu"*: valittu sivu on luonnos. Linkki näkyy sivustolla
  vasta, kun julkaiset sen.
- *"Uutinen tulee näkyviin …"*: valittu uutinen on ajastettu. Linkki tulee näkyviin
  samaan aikaan uutisen kanssa.
- *"Tälle sivulle on parempi valinta"*: Muu osoite vie sivulle, jonka voi valita
  listasta. Vaihda kohdaksi **Sivuston sivu** ja valitse varoituksessa mainittu
  sivu.
- *"Tätä valintaa ei käytetä…"*: vaihdoit linkin muualle, mutta vanha sivuvalinta
  on yhä tallessa. Tyhjennä se (kentän kolme pistettä → **Tyhjennä**), muuten
  sitä sivua ei voi poistaa.

Punainen *"Valittua sivua ei enää ole"* tarkoittaa, että sivu on poistettu: valitse
toinen.

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
- **Sivuston asetukset**
  - **Etusivu:** etusivun yläosa (pääjuttu, pikalinkit) ja lohkot
  - **Navigaatio:** yläpalkin linkit
  - **Varmuuskopiot:** automaattiset viikkokopiot ja poistettujen palautus (ks. alla)
- **Tarkistettavat:** migraation merkitsemät dokumentit tyypeittäin (ks. alla)
- **Uutiset:** tiedotteet ja blogikirjoitukset, myös blogin kaikki 530 kirjoitusta vuodesta 2007
- **Uutiskategoriat:** uutisten kategoriat ja suodattimen valinnat
- **Kommentit ja veikkaukset:** jäsenten viestit uusin ensin sekä piilotetut
- **Ottelut:** etusivun ja /ottelut-sivun otteluohjelma
- **Tapahtumat:** klubin tulevat tapahtumat
- **Galleria-albumit**
- **Sivut:** omat sivusi (esim. säännöt ja tietosuojaseloste). Osioiden sivut ja
  palloveikkauksen sivut ovat omissa kohdissaan alla.
- **Klubi:** sama rakenne kuin sivuston Klubi-osiossa
  - **Esittely:** Klubi-sivun teksti ja kuva
  - **Toiminta:** Toiminta-sivun otsikko ja johdanto sekä **Toimintamuodot** (vappu,
    mölkky, matkat ym. vuosimerkintöineen)
  - **Hallitus:** Hallitus-sivun otsikko ja johdanto, **Nykyinen hallitus** ja **Entiset jäsenet**
  - **Palloveikkaus:** Palloveikkaus-sivu ja **Veikkausten alasivut**
  - **Yhteystiedot:** **Osoite, sähköposti ja some** (näkyvät alatunnisteessa ja
    yhteystietosivulla) sekä Yhteystiedot-sivun otsikko ja johdanto
- **Ravintolat:** ravintolat, **odottavat arvostelut**, klubilaisten arvosanat ja kaupungit
- **Jalkapalloarkisto:** tilastot, arvokisat, pelaajat ja stadionit
- **Osioiden sivut:** listasivujen otsikot, johdannot ja hakukonetekstit (Uutiset ja
  tapahtumat, Ravintolat, Jalkapalloarkisto). Ks. *Osioiden sivut* alla.

## Yleiset toimenpiteet

### Uutisen kirjoittaminen

Tämä korvaa blogiin kirjoittamisen. Studio toimii myös puhelimen selaimessa.

1. **Uutiset** → **+** (Luo uusi).
2. **Otsikko**, sen jälkeen **Osoite sivustolla** → *Luo*. **Julkaisuaika** on oletuksena nyt.
   (Kentän nimi oli aiemmin *Polku*.)
3. **Lyhenne (uutislista ja etusivu)** on valinnainen: 1–2 virkettä, jotka näkyvät
   uutislistassa ja etusivun kortissa. Jos jätät sen tyhjäksi, listalla näkyy tekstin
   alku (enintään noin 200 merkkiä). Uudessa jutussa **Tiivistelmän** voi jättää
   tyhjäksi: silloin Lyhenne näkyy myös jutun alussa. Jos täytät Tiivistelmän, jutun
   alussa näkyy Tiivistelmä eikä Lyhenne (ks. taulukko alla).
4. **Kansikuva** ja **Sisältö**. Kansikuva on valinnainen: jos jätät sen tyhjäksi,
   uutislistassa, etusivulla ja jaossa käytetään tekstin ensimmäistä isoa kuvaa
   (myös kuvasarjasta). Keltainen varoitus kertoo, jos uutisessa ei ole kuvaa
   lainkaan; uutisen voi silti julkaista. Sisältöön voi lisätä otsikoita, listoja,
   linkkejä ja **kuvia tekstin sekaan**: paina **+** tekstin kohdalla → *Kuva*.
   **Kuvajutussa** (esim. matkan tai juhlan kuvat) käytä yksittäisten kuvien sijaan
   **kuvasarjaa**: kaikki kuvat kerralla ja yksi yhteinen kuvaus (ks.
   kohta *Tekstin lisäosat* alla).
   **YouTube-video** lisätään samalla tavalla: napsauta Sisältö-kentän tekstiin ja paina
   kentän työkalupalkin oikeasta reunasta toistokolmiota ▷ (kapealla näytöllä **+**-valikosta
   *YouTube-video*). Liitä videon
   osoite (YouTubessa videon alta **Jaa** → **Kopioi**) ja kirjoita lyhyt otsikko, esim.
   "Huuhkajien maali Unkaria vastaan 2023". Sivulla näkyy videon kuva ja toistopainike;
   video alkaa, kun lukija painaa sitä. Jos haluat videon alkavan tietystä kohdasta,
   rastita YouTuben Jaa-ikkunassa *Aloita kohdasta* ennen kopiointia.
   Pelkän linkin voi edelleen tehdä tekstiin tavallisena linkkinä.
   **Linkki tekstiin:** maalaa sana tai lause → työkalupalkin ketjukuvake → valitse
   **Mihin linkki vie?** (ks. *Linkit* yllä). Esim. toiseen uutiseen: Sivuston sivu
   → kirjoita uutisen otsikon alkua → valitse.
   Video toimii samoin kaikissa tekstikentissä, joissa on **+**: sivut, tapahtumat,
   ravintolat ja jalkapalloarkisto (tilastojen esittelyt ja lisätiedot, arvokisat,
   pelaajat, stadionit, lehtileikkeet). Kuvasarja sen sijaan toimii vain uutisissa,
   tapahtumissa ja klubin toiminnassa.
5. **Kategoriat:** rastita sopivat (esim. Palloveikkaus, Matkakuvaus, Tapahtumat).
6. **Julkaise**.

**Mikä teksti näkyy missä:**

| Paikka | Teksti |
|---|---|
| Jutun alussa isommalla | **Tiivistelmä**, tai jos se on tyhjä, **Lyhenne** |
| Uutislistassa ja etusivun kortissa | **Lyhenne**, tai jos se on tyhjä, Tiivistelmä, ja sen puuttuessa tekstin alku (enintään noin 200 merkkiä) |
| Googlen hakutuloksessa ja somejaossa | **Kuvaus hakutuloksissa** (välilehti *Hakukoneet ja jako*), tai jos se on tyhjä, Tiivistelmä, sen puuttuessa Lyhenne ja viimeisenä tekstin alku |

Sivuilla (**Sivut**) sama periaate: sivun alussa näkyy **Tiivistelmä sivun alussa**.
Vanha kenttä **Ingressi (vanha kenttä)** näkyy Studiossa vain sivuilla, joilla se on
jo täytetty, ja sivustolla vain, jos Tiivistelmä on tyhjä. Kirjoita johdanto aina
Tiivistelmään.

**Ajastus:** jos haluat uutisen näkyviin myöhemmin (esim. vuosikokouskutsu maanantaina
klo 8), valitse **Julkaisuaika**-kenttään se hetki ja paina **Julkaise** heti. Uutinen
odottaa piilossa ja tulee näkyviin itsestään noin minuutin kuluessa valitusta ajasta.
Listassa ja kohdassa **Tehtävät sinulle → Ajastetut uutiset** sen kohdalla lukee
*Ajastettu* ja aika.

### Tekstin lisäosat (+ -valikko)

Tekstikentän **+**-valikosta (leveällä näytöllä työkalupalkin oikean reunan
kuvakkeista) voi lisätä tekstin sekaan muutakin kuin tekstiä. Kuva, YouTube-video ja
kokoonpano toimivat kaikissa tekstikentissä, joissa on **+**. Alla olevat lisäosat
toimivat **uutisissa, tapahtumissa ja klubin toiminnassa**. Sivuilla (**Sivut**) niitä
ei vielä ole.

| Lisäosa | Milloin | Miten |
|---|---|---|
| **Kuvasarja (useita kuvia)** | Useampi kuva samasta aiheesta, esim. matkan, juhlan tai ottelun kuvat | Ks. alla |

**Kuvasarja:**

1. Napsauta tekstiin kohtaan, johon kuvat tulevat, ja valitse **+** →
   *Kuvasarja (useita kuvia)*. Leveällä näytöllä sama löytyy työkalupalkin
   kuvakkeesta, jossa on kaksi kuvaa päällekkäin.
2. **Kuvat:** raahaa kaikki kuvat kerralla tietokoneen kansiosta kenttään. Järjestä
   raahaamalla. Puhelimessa paina **Lisää kohde** ja kuvan kohdalla **Lataa**.
3. **Mitä kuvissa on (yhteinen kuvaus):** lyhyt kuvaus koko sarjasta, esim. "Klubin
   vappu 2026 Lahden torilla". Se näkyy kuvien alla, ja ruudunlukija käyttää sitä
   kuvan kuvauksena, jos kuvalla ei ole omaa ("Klubin vappu 2026, kuva 3/9").
   Kuvakohtaiset kuvaukset (**Mitä kuvassa on**) ovat suositeltavia, mutta eivät
   pakollisia.
4. **Kuvien muoto:** *Tasainen ruudukko* rajaa kuvat neliöiksi (valokuvat).
   *Kokonaiset kuvat* näyttää kuvat rajaamatta: valitse se kuvakaappauksille,
   lehtileikkeille ja kaavioille, joista rajaus leikkaisi tietoa pois.
5. Sivulla kuvat näkyvät kolmen sarakkeen ruudukkona. Kuvaa painamalla se
   suurenee, ja nuolilla voi selata sarjaa.

Yksittäiselle kuvalle käytä lohkoa *Kuva* (Studio muistuttaa tästä). Yli 60 kuvan
kokonaisuudelle sopii paremmin oma galleria-albumi.

### Jakokuva (kun linkki jaetaan WhatsAppissa tai Facebookissa)

Kun sivuston linkki jaetaan, esikatselussa näkyy kuva, otsikko ja sivuston osoite. Sama
pätee uutisiin, tapahtumiin, sivuihin, ravintoloihin, klubin toimintaan, gallerioihin ja
jalkapalloarkistoon. Kuva valitaan automaattisesti tässä järjestyksessä:

1. sivun **oma kuva** (uutisen ja galleria-albumin kansikuva, tapahtuman kuva, sivun
   yläkuva, ravintolan, stadionin tai pelaajan ensimmäinen kuva)
2. ensimmäinen **kuva tekstin seassa tai kuvasarjassa** (vain riittävän iso, vähintään
   600 pikseliä leveä). Uutisen kortissa uutislistassa ja etusivulla käytetään samaa
   kuvaa, kun kansikuva puuttuu.
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
2. **Nimi**, esim. *Vierasmatkat*. **Osoite suodattimessa** → *Luo*.
3. Valinnainen **Järjestys suodattimessa**: pienin numero ensin. Nykyiset ovat
   10, 20, 30 … 90, joten esim. 45 sijoittuu Tapahtumien ja Jalkapallon väliin.
4. **Julkaise**. Kategoria ilmestyy uutisten valintaruutuihin heti, ja suodattimeen
   kun ensimmäinen uutinen on merkitty siihen.

**Nimen voi vaihtaa** milloin tahansa: uusi nimi näkyy kaikissa uutisissa. **Älä muuta
julkaistun kategorian osoitetta**, koska vanhat linkit lakkaisivat toimimasta.
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

> **Hakukoneet ja jako** -välilehden **Blogin tunnisteet** on vain luettava tallenne vanhan blogin
> tunnisteista. Sivustolla näkyvät tunnisteet muokataan **Sisältö**-välilehden kentässä
> **Tunnisteet**.

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
2. Nimi, osoite sivustolla (*Luo*), alkamis- ja päättymisaika, paikka, kansikuva ja kuvaus.
3. Ilmoittautumislinkki tai -sähköposti (valinnainen).
4. **Julkaise**. Tapahtuma näkyy etusivulla ja /tapahtumat-sivulla, kunnes se on ohi.

Niin kauan kuin yhtään tapahtumaa ei ole, Tapahtumat-osio on piilossa valikosta,
alatunnisteesta ja hakukoneilta. Hakukoneille ja etusivun lohkoon se tulee näkyviin
itsestään ensimmäisen tapahtuman julkaisun jälkeen. Valikossa ja alatunnisteessa se
näkyy, kun lisäät sen valikkoon (ks. *Valikon muokkaaminen*). Sama koskee Galleriaa
ja albumeita.

**Jakokuva:** kun tapahtuman linkki jaetaan WhatsAppissa tai Facebookissa, esikatselun
kuvana on tapahtuman **kansikuva**. Ilman kansikuvaa käytetään kuvausta: ensin siinä
olevaa kuvaa, sitten YouTube-videon kuvaa, ja jos kumpaakaan ei ole, klubin logoa.
Lisää siis kansikuva ennen kuin jaat kutsun: vaakakuva, vähintään noin 1200 pikseliä
leveä, tärkein kohta keskellä. Kuvaan ei tarvitse kirjoittaa tapahtuman nimeä tai
aikaa, koska otsikko näkyy esikatselussa kuvan vieressä. Lisätietoa kohdassa
*Jakokuva* uutisohjeen alla.

### Osioiden sivut: otsikko, johdanto ja hakukoneteksti

Sivuston listasivuilla (esim. /uutiset, /tapahtumat, /ravintolat ja jalkapalloarkiston
osiot) lista tai taulukot tulevat automaattisesti. Otsikkoa, otsikon alla näkyvää
johdantoa ja hakukonetekstiä muokkaat itse:

1. **Osioiden sivut** → valitse ryhmä ja sivu, esim. **Uutiset ja tapahtumat → Tapahtumat**.
   Klubin sivut ovat kohdassa **Klubi** (esim. **Klubi → Hallitus → Hallitus-sivun
   otsikko ja johdanto**).
2. Muokkaa **Otsikkoa** ja **Tiivistelmää sivun alussa**. Tiivistelmä näkyy otsikon alla
   johdantona. Listasivuilla se on pakollinen.
3. Välilehdellä **Hakukoneet ja jako** voit kirjoittaa tekstin, joka näkyy Googlen
   hakutuloksessa (**Kuvaus hakutuloksissa**). Jos jätät sen tyhjäksi, Google näyttää
   Tiivistelmän.
4. **Julkaise**. Muutos näkyy sivulla viimeistään minuutissa.

Hyvä tietää:
- Lomakkeen alussa oleva sininen laatikko kertoo, mikä sivulle tulee automaattisesti.
- Osion sivua ei voi poistaa, piilottaa eikä kopioida, eikä sen osoitetta voi muuttaa:
  sivusto hakee sen osoitteen perusteella.
- Välilehtien ja arkiston etusivun korttien **otsikot** pysyvät ennallaan, koska ne ovat
  valikkonimiä.
- Jalkapalloarkiston osion sivulla on lisäksi kenttä **Teksti arkiston etusivun
  kortissa**: yksi lyhyt virke, joka näkyy Jalkapalloarkiston etusivulla osion kortissa.
- **Ravintola-arviot:** jos Tiivistelmä on tyhjä, sivusto kirjoittaa johdannon itse
  ravintoloiden määrästä (esim. "Klubi on arvioinut 573 ravintolaa vuodesta 1997
  alkaen…"). Kirjoittamasi teksti korvaa sen, eikä määrä silloin päivity itsestään.
- Kun valitset uutislistalla kategorian, otsikko ja kuvaus tulevat kategoriasta
  (**Uutiskategoriat**).

### Uusi sivu (esim. säännöt)

1. **Sivut** → **+**.
2. **Otsikko** ja **Osoite sivustolla**: `klubi/historia` näkyy osoitteessa
   /klubi/historia. Osa osoitteista on varattu (esim. uutiset, ravintolat), ja Studio kertoo
   niistä.
3. **Tiivistelmä sivun alussa** (2–3 virkettä) ja **Pääsisältö**. **Julkaise**.

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

Puhelimen ja kameran kuvat voi ladata sellaisenaan: sivusto pienentää ne kävijälle
automaattisesti.

### Aiemmin ladatun kuvan käyttö

Samaa kuvaa ei tarvitse ladata uudelleen, jos se on jo Studiossa (esim. logo tai
katsomokuva toisesta jutusta):

1. Kuvakentässä paina **Valitse**. Jos esiin tulee valikko, valitse **Ladatut kuvat**.
2. Kuvat ovat uusimmasta vanhimpaan. Selaa, ja paina tarvittaessa **Lataa lisää**.
   Hakua ei ole, joten vanhan kuvan löytää helpoimmin, kun tietää suunnilleen,
   milloin se ladattiin.
3. Valitse kuva ja täytä **Vaihtoehtoinen teksti (alt)** tähän käyttökohtaan sopivaksi.
4. **Julkaise**.

### Galleria-albumin lisääminen

1. **Galleria-albumit** → **+**. Anna nimi, osoite sivustolla (*Luo*), päivämäärä ja kansikuva.
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

1. **Sivuston asetukset → Etusivu → Yläosa**.
2. Halutessasi:
   - **Pääjuttu:** valitse juttu, jos haluat nostaa jonkin muun kuin uusimman
     (esim. vuosikokouskutsun). Anna **Pääjuttu näkyy asti** -päivä, niin yläosa
     palaa siitä eteenpäin uusimpaan juttuun itsestään.
   - **Taustakuva:** näkyy mustavalkoisena tummansinisen sävyn alla. Vaihda
     kuva vaikka kauden mukaan; tekstit erottuvat aina. Sama kuva näkyy somejaoissa.
   - **Pikalinkit:** enintään neljä linkkiä Seuraavaksi-korttiin. Kirjoita
     **Teksti** (esim. "Palloveikkaus") ja valitse **Mihin linkki vie?** → Sivuston
     sivu → "Palloveikkaus" (ks. *Linkit*).
   - **Näytä seuraava Huuhkajien ottelu ja laskuri:** pois päältä, jos et halua sitä.
3. Hakukoneiden kuvaus on **Hakukoneet ja jako** -välilehdellä. Se ei näy sivulla.
4. **Lohkot:** vedä kahvasta (⋮⋮) muuttaaksesi järjestystä ja lisää uusi **+**-painikkeella.
   - **Piilota rastilla:** jos haluat lohkon pois etusivulta väliaikaisesti, avaa se ja
     rastita **Piilota lohko sivulta**. Lohko säilyy listassa asetuksineen, ja sen
     kohdalla lukee *Piilotettu*. Ota rasti pois, niin lohko palaa.
   - **Roskakori poistaa** lohkon asetuksineen. Sen saa takaisin vain versiohistoriasta.
   - Otteluohjelman **Näytä myös näiden seurojen ottelut** -lista ohjaa myös
     /ottelut-sivua, vaikka lohko olisi piilotettu.
   - **Esittelyteksti:** linkin teksti (esim. "Lue lisää klubista") ja **Linkin
     kohde** (Mihin linkki vie?). Jos kirjoitat tekstin mutta et valitse kohdetta,
     Studio varoittaa keltaisella, eikä linkkiä näytetä.
   - **Jalkapalloarkisto-nosto:** **Napin kohde** on valinnainen. Tyhjänä nappi vie
     jalkapalloarkiston etusivulle.
5. **Julkaise**.

### Yhteystiedot

**Klubi → Yhteystiedot → Osoite, sähköposti ja some** → muokkaa → **Julkaise**. Muutos näkyy footerissa ja
yhteystietosivulla.

### Valikon muokkaaminen

1. **Sivuston asetukset → Navigaatio**.
2. Muokkaa linkkiä: klikkaa sitä ja muuta **Otsikko** tai linkin kohde.
3. Uusi linkki: **+** listan alla → kirjoita **Otsikko** → **Mihin linkki vie?** on
   valmiiksi **Sivuston sivu** → kirjoita kenttään **Sivu** sivun nimen alkua ja valitse
   listasta (ks. *Linkit*). Listan alla näkyy osoite, esim. "→ /klubi/historia".
4. Järjestys: vedä kahvasta (⋮⋮).
5. Alavalikko: avaa linkki → **Alavalikko** → **+** → Otsikko ja kohde samalla tavalla.
   Jos alavalikossa ei ole pääkohdan omaa sivua, valikko lisää alkuun linkin
   "yleisesittely".
6. **Julkaise**.

Päälinkkejä enintään 7. Vanhat linkit näkyvät kohdassa **Muu osoite** (esim.
`/ottelut`), kunnes kehittäjä vaihtaa ne sivuvalinnoiksi; siihen asti niiden
kohdalla voi näkyä keltainen *"Tälle sivulle on parempi valinta"*. Ne toimivat
sivustolla normaalisti.

**Alatunniste** (sivun alareuna) seuraa valikkoa: kohdat, joilla on alavalikko, näkyvät
omina sarakkeinaan (otsikkona kohdan nimi), ja muut kohdat sarakkeessa **Sivusto**.
Yhteystiedot tulevat Yhteystiedoista (Klubi → Yhteystiedot). Tietosuojaseloste- ja
Ylläpito-linkit ovat aina mukana. Erillistä alatunnisteen listaa ei ole.

Tyhjät osiot piiloutuvat valikosta ja alatunnisteesta itsestään (esim. Tapahtumat,
kun yhtään tapahtumaa ei ole julkaistu). **Kun julkaiset ensimmäisen albumin tai
tapahtuman, lisää Galleria tai Tapahtumat valikkoon** (Sivuston sivu → "Galleria" tai
"Tapahtumat"), muuten osioon pääsee vain etusivun lohkon kautta. Uutisarkistoon
pääsee Uutiset-sivulta.

### Hallituksen jäsenet

Uusi jäsen: **Klubi → Hallitus → Nykyinen hallitus** → **+** → **Nimi**, **Rooli** (esim. Sihteeri) ja
**Järjestys hallitussivulla** (1 = ensimmäisenä, yleensä puheenjohtaja) → **Julkaise**. Kuva, esittely, sähköposti ja
puhelin ovat vapaaehtoisia.

Jäsen vaihtuu: avaa vanha jäsen, ota rasti pois kohdasta **Nykyinen jäsen** ja
**Julkaise**. Älä poista jäsentä: hän siirtyy listaan **Klubi → Hallitus → Entiset
jäsenet** eikä näy enää hallitussivulla. Lisää sitten uusi jäsen.

Hallitus-sivun otsikon alle voit kirjoittaa johdannon: **Klubi → Hallitus →
Hallitus-sivun otsikko ja johdanto** → **Tiivistelmä sivun alussa** → **Julkaise**.

### Klubin toiminta: uusi vuosi

1. **Klubi → Toiminta → Toimintamuodot** → valitse toiminta (esim. Mölkky).
2. Välilehti **Vuosittain** → **+**.
3. Täytä **Vuosi**. Muut kentät ovat vapaaehtoisia. **Monesko kerta** on tavallinen
   luku (esim. 37), ja sivulla se näkyy muodossa (37.).
4. **Linkki** (vapaaehtoinen, esim. matkakuvaus): avaa kohta **Linkki** → **Linkin
   teksti** (esim. "Matkakuvaus") → **Mihin linkki vie?** → Sivuston sivu → kirjoita
   uutisen otsikon alkua ja valitse. Videolle valitse Muu osoite ja liitä osoite.
5. **Julkaise**. Uusin vuosi näkyy sivulla ensimmäisenä.

Vanhojen vuosien linkit toimivat sivustolla, vaikka kohta **Mihin linkki vie?** on
niissä vielä tyhjä: kehittäjä siirtää ne uuteen muotoon.

Toimintamuotojen järjestys Toiminta-sivulla määräytyy kentästä **Järjestys listassa**
(pienempi luku ylempänä). Studion Toimintamuodot-lista on samassa järjestyksessä.
Toiminta-sivun johdanto: **Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto**.

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
2. **Nimi** suomeksi (esim. "Jyväskylä", "Tukholma"), sen jälkeen **Osoite suodattimessa** → *Luo*.
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

**Uusi lehtijuttu:** Jalkapalloarkisto → Lehtileikkeet → **+**. Täytä otsikko (pelaajaksi
on valmiina Jari Litmanen, sillä leikesivu on vain hänellä), sivu, julkaisupäivä, lähde (esim. *is.fi*) ja teksti. Linkki
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
arkiston valikossa *TOP 10 järkytykset*). Taulukko löytyy Studiosta kohdasta **Jalkapalloarkisto → Tilastot**;
sivulle päätyvät kaikki taulukot, joiden kategoria on *Suomen jalkapallon järkytykset*.

### Maailman parhaat

**Maailman paras avaus vuosittain** on omalla sivullaan (`/jalkapalloarkisto/maailman-parhaat`,
arkiston valikossa *Maailman parhaat*). Uuden vuoden kenttäkaavio lisätään Studiossa
taulukon **Maailman paras avaus vuosittain** kenttään **Kuvat** (listan alkuun). Sivulle
päätyvät kaikki taulukot, joiden kategoria on *Maailman paras avaus*.

### Palloveikkauksen sivut

Jokaisella veikkauksella on oma sivunsa: **Klubi → Palloveikkaus → Veikkausten
alasivut → Maaottelujen tulosveikkaus, Arvokisaveikkaus, Veikkausliigan palloveikkaus**. Säännöt kirjoitetaan sivun
pääsisältöön, ja veikkauksen taulukot lisätään sivun kohtaan **Taulukot** (uusi kausi:
tee taulukko ja lisää se listan alkuun). Palloveikkaus-sivu (`/klubi/palloveikkaus`)
listaa veikkaukset automaattisesti. Uusi veikkaus tehdään luomalla uusi sivu
(**Veikkausten alasivut → +**), jonka osoite sivustolla alkaa `klubi/palloveikkaus/`,
esimerkiksi `klubi/palloveikkaus/mestarisarja`.

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
4. **Järjestys sivulla:** pienempi luku näkyy osion sivulla ylempänä.
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

- [ ] Yhteystiedot: osoite, **sähköposti**, puhelin (Klubi → Yhteystiedot → Osoite, sähköposti ja some)
- [ ] Y-tunnus ja IBAN (Klubi → Yhteystiedot → Osoite, sähköposti ja some)
- [ ] Sosiaalinen media (Klubi → Yhteystiedot → Osoite, sähköposti ja some)
- [ ] Hallituksen jäsenet (Klubi → Hallitus → Nykyinen hallitus)
- [ ] Hallitus- ja Toiminta-sivun johdanto, vapaaehtoinen (Klubi → Hallitus → Hallitus-sivun
  otsikko ja johdanto; Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto)
- [ ] Tulevat tapahtumat (Tapahtumat)
- [ ] Etusivun kuvat: taustakuva ja Klubista-kuva (Sivuston asetukset → Etusivu)
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
| Linkki ei toimi | Valitse sivuston omalle sivulle **Sivuston sivu** (ks. *Linkit*). Muu osoite alkaa `https://`, `mailto:` tai `tel:`. Keltainen varoitus "Sivustolla ei ole sivua…" kertoo kirjoitusvirheestä tai julkaisemattomasta sivusta |
| Linkki katosi valikosta tai tekstistä | Valittua sivua ei ole julkaistu, uutinen on ajastettu tai ravintola odottaa toista arvioijaa. Tekstissä sana näkyy silloin ilman linkkiä, ja valikosta kohta jää pois. Linkki palaa itsestään, kun sivu julkaistaan (ajastettu uutinen noin minuutin kuluessa julkaisuajasta) |
| En voi poistaa sivua tai uutista, tai sen julkaisua ei voi perua | Johonkin (esim. valikkoon tai Matkailu-sivulle) on tehty linkki tähän sivuun. Ikkuna sanoo "Et ehkä voi poistaa …, koska seuraavat asiakirjat viittaavat siihen", tai tulee ilmoitus "… Tämä yleensä tarkoittaa, että muut dokumentit viittaavat siihen.". Avaa listassa näkyvä dokumentti napsauttamalla, vaihda tai poista linkki ja paina **Julkaise**. Poista sen jälkeen. Älä paina **Poista joka tapauksessa**, koska se ei onnistu |
| Jotain meni pieleen (alle 3 päivää sitten) | Kellokuvake → versiohistoria → palauta edellinen versio |
| Jotain meni pieleen (yli 3 päivää sitten) | Dokumentin **⋯** → **Palauta varmuuskopiosta** → valitse viikko → tarkista → **Julkaise** |
| Poistin vahingossa | **Sivuston asetukset → Varmuuskopiot** → uusin kopio → välilehti **Palauta poistettu** |

## Mitä EI saa tehdä

- **Älä poista** Sivuston asetusten eikä Klubin Osoite, sähköposti ja some -dokumentteja. Niitä ei voi poistaa eikä niiden julkaisua
  perua, mutta jos jokin menee pieleen, soita kehittäjälle.
- **Älä muuta julkaistun sivun Osoitetta sivustolla**, koska se rikkoo linkit. Studio varoittaa
  keltaisella, jos osoite poikkeaa julkaistusta. Jos muutos on pakko tehdä, kerro
  kehittäjälle, joka tekee ohjauksen. Osioiden sivujen (esim. Uutiset, Ravintola-arviot,
  jalkapalloarkiston osiot), Klubin pääsivujen (Esittely, Toiminta, Hallitus,
  Palloveikkaus, Yhteystiedot), tietosuojaselosteen ja Jari Litmasen osoitteet on lukittu
  kokonaan, koska sivusto hakee ne osoitteen perusteella. Osioiden sivuja, Klubin
  pääsivuja ja tietosuojaselostetta ei voi myöskään poistaa, piilottaa eikä kopioida, mutta
  niiden sisältöä saa muokata vapaasti.
  **Sivuston sivu** -valinnalla tehdyt linkit seuraavat osoitteen muutosta itsestään.
  Muu osoite -linkit ja Googlen vanhat linkit eivät seuraa.
- **Älä muuta** kenttiä **Vanha osoite** tai **Alkuperäinen Blogspot-kirjoitus**. Vanhat linkit ohjautuvat niiden varassa.

## Varmuuskopiot

Sivusto tekee joka maanantaiyö automaattisesti varmuuskopion kaikesta julkaistusta
sisällöstä (tekstit ja tiedot). Kopiot näkyvät kohdassa **Sivuston asetukset →
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

1. **Sivuston asetukset → Varmuuskopiot** → avaa uusin kopio, jossa dokumentti vielä oli.
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
- **Domain tai sähköposti:** domainin uusinta (seuraava 28.8.2027) hoidetaan
  domainin rekisteröijän kautta, ei sivuston kautta. Rekisteröijä ja maksaja kirjataan
  ohjeeseen docs/17.
- **Älä anna** Sanityn tunnuksiasi tai tokeneita kenellekään. Uusi ylläpitäjä kutsutaan
  omalla sähköpostillaan: sanity.io/manage → projekti → **Members** → **Invite**.
