# 21 — Klubilaisten arvosanat ravintoloille

Päätetty 3.10.2026. Ravintolan arvosana lasketaan klubilaisten arvosanoista
automaattisesti, eikä sitä enää kirjoiteta käsin. Lähtödata on klubin
ruokailutaulukko (`ruokailu2026.xls`, ei versionhallinnassa: jäsenten nimet).

## Säännöt

| Sääntö | Toteutus |
|---|---|
| Arvioijat ovat klubilaisia | `klubilainen`-dokumentit (Studio: Ravintolat → Klubilaiset). Taulukon 12 arvioijaa: `klubilainen-<taulukon numero>` |
| Yksi voimassa oleva arvosana klubilaista ja ravintolaa kohden | Uusin (päivä) korvaa vanhemman. Samana päivänä lomakkeen arvostelu voittaa taulukon rivin |
| Klubilaisen arvosana | `klubiArvio` (taulukosta tuotu tai Studiossa lisätty) **tai** hyväksytty lomakkeen arvostelu, joka on liitetty klubilaiseen (`arvioija`) |
| Ei painotuksia | Klubilaisen kokonaisarvosana = (ruoka + hinta + viihtyvyys) / 3. Taulukon henkilökohtaiset painot (Painot-välilehti) jätettiin pois |
| Ravintolan arvosana | Ruoka, hinta ja viihtyvyys = klubilaisten keskiarvot; kokonaisarvosana = klubilaisten kokonaisarvosanojen keskiarvo. Yksi desimaali |
| Ulkopuoliset | Lomakkeen arvostelu ilman klubilaista näkyy sivulla, mutta ei vaikuta arvosanaan |
| Lomakkeen arvostelun päivä | Käyntipäivä (`kayntipaiva`, lomakkeella oletuksena lähetyspäivä, arvostelija voi vaihtaa). Vanhoissa arvosteluissa lähetysaika. Klubilaisen arvostelun käyntipäivä näkyy ravintolan sivulla klubin käyntinä (4.10.2026) |
| Vanha arvosana ilman taulukkodataa | Pysyy ennallaan (yksi uusi arvio ei korvaa usean arvioijan keskiarvoa). Automaattinen laskenta alkaa, kun ravintolalla on taulukon arvosanoja tai sillä ei ole vanhaa arvosanaa (uusi ravintola) |
| Kahden klubilaisen sääntö | Ravintola näkyy sivustolla (lista, suodattimet, etusivu, oma sivu, samankaltaiset, sivukartta) vasta, kun sillä on vähintään 2 klubilaisen arvosanaa (`JULKINEN_RAVINTOLA`). Yhden arvioijan ravintola odottaa Studiossa (Ravintolat → Odottavat toista arvioijaa) ja tulee näkyviin itsestään. Vanhan sivuston ravintola ilman taulukkodataa näkyy edelleen. Lomakkeen ravintolavalikossa piilossa olevatkin ovat valittavissa |
| Tuorein arvio | `automaattinenArvosana.viimeisinArvio`; järjestys "Tuorein arvostelu ensin" ja etusivun ravintolanosto käyttävät uudempaa tästä ja klubin käyntipäivästä (`TUOREIN_ARVIO`) |

Laskenta: `lib/ravintola-arvosana.ts` (testit `npm run test:arvosana`).
Tulos tallennetaan ravintolan kenttiin (`ratingOverall`, `ratingFood`,
`ratingPrice`, `ratingAtmosphere`, `automaattinenArvosana`), joten listat,
suodattimet, top-listat ja JSON-LD toimivat ilman muutoksia. Vanhan sivuston
arvosana tallentuu ensimmäisellä laskennalla kenttään `alkuperainenArvio`
(vain vertailuun) ja palautuu, jos ravintolan klubilaisten arvosanat poistetaan.

Laskennan käynnistää Sanityn webhook (`app/api/revalidate`) aina, kun
`klubiArvio` tai `ravintolaKayttajaArvostelu` muuttuu, sekä
`npm run laske:arvosanat`. Webhook tarvitsee Vercelissä `SANITY_API_WRITE_TOKEN`in.

## Arvostelu puhelimella (4.10.2026)

Arvostelu on sovellusmainen näkymä `app/(sovellus)/ravintolat/arvostele/` (oma
reittiryhmä ilman sivuston ylä- ja alapalkkia). Yksi asia ruudulla kerrallaan,
yläpalkissa takaisin, vaihe ja sulje, alapalkissa aina sama painike. Vaiheet
mahtuvat iPhone 13 -kokoiselle ruudulle ilman vieritystä (mitattu).

| Vaihe | Sisältö |
|---|---|
| Kuka arvostelee | Vain kun laite ei muista nimeä. Klubilaisen nimen napautus vie eteenpäin ja muistetaan (`localStorage` `klubi.arvostelija`); lomake lähettää klubilaisen `_id`:n, joten liitos ei riipu kirjoitusasusta. "En ole klubilainen" → nimikenttä |
| Ravintola | "Arvostelijana Elias · Vaihda" (väärä nimi huomataan heti). Haku ylhäällä, "Lisää uusi ravintola" heti sen alla. Ennen kirjoittamista **Viimeksi arvioidut** (5, uusin ensin, myös hyväksymättömät lähetykset: yhdessä syötäessä ensimmäisen arvostelu nostaa ravintolan muiden kärkeen; lähetys tyhjentää välimuistin `updateTag`; mukana klubilaisten uudet ravintolaehdotukset 7 päivän ajalta: valinta täyttää saman nimen, kaupungin ja maan, jolloin "Hyväksy ja luo ravintola" luo yhden ravintolan molemmille) ja sitten toista arvioijaa odottavat (ilman arvostelijan itse jo arvioimia). Napautus vie eteenpäin. Uudesta ravintolasta nimi ja kaupunki; maa (oletus Suomi) ja osoite "Maa ja osoite" -kohdan takana |
| Arvosanat | Napit 1–5 ja −/+ (0,1), numeron voi myös kirjoittaa. Ei liukusäädintä (vieritys siirsi sitä). Kokonaisarvosana näkyy heti |
| Tarkista ja lähetä | Teksti (vapaaehtoinen) ja kuvat, sitten yhteenveto: ravintola, arvosana, käynti (oletus tänään) ja arvostelija, kukin "Muuta"-napautuksella. Lähetä |

- **Vaihe osoitteessa** (`?vaihe=arvosanat`, `history.pushState`): puhelimen
  takaisin-ele siirtyy edelliseen vaiheeseen. Eteenpäin ei pääse keskeneräisen
  vaiheen yli. Palvelimen virhe vie vaiheeseen, jossa virhe on.
- **Saman uuden ravintolan arvostelut samaan aikaan** (`lib/ravintolan-nimi.ts`: sama ravintola =
  sama nimi ja kaupunki, kun kirjainkoko, ääkköset, välimerkit ja yleissanat kuten "ravintola" ohitetaan):
  1. Ravintolavaiheen haku löytää myös klubilaisten odottavat ehdotukset (ensimmäisinä osumina).
  2. Lista päivittyy, kun ravintolavaiheeseen tullaan tai puhelin palaa taustalta (`router.refresh`, enintään 15 s välein).
  3. Lähetys liittää ehdotuksen hakemiston ravintolaan tai kirjoittaa sen samoin kuin vanhin odottava ehdotus.
  4. "Hyväksy ja luo ravintola" käyttää olemassa olevaa ravintolaa samalla säännöllä (myös täsmälleen yhtä aikaa
     lähetetyt) ja kertoo ennen vahvistusta, liitetäänkö arvostelu olemassa olevaan vai luodaanko uusi.
  Eri nimiä ("Savu" / "Savu Bistro") ei yhdistetä automaattisesti: sihteeri valitsee ravintolan Studiossa.
- **Luottamus**: nimen tai ravintolan napautus korostuu hetken (0,18 s) ennen siirtymää.
  Verkkokatkos lähetyksessä ei vie virhesivulle: ilmoitus ja uusi yritys samasta kohdasta.
  Kiitosnäkymä näyttää, mitä lähti (ravintola, arvosana, arvostelija).
- **Luonnos**: keskeneräinen arvostelu tallentuu laitteelle (`klubi.arvostelu-luonnos`,
  14 päivää) ja jatkuu samasta kohdasta ("Jatkat keskeneräistä arvostelua · Aloita
  alusta"). Kuvat eivät tallennu.
- **Kotinäytön kuvake** (`app/manifest.ts`, PWA): avaa suoraan arvostelun ilman
  selaimen palkkeja. Kiitosnäkymä ohjaa lisäämään sen (Android: painike, iPhone:
  Jaa → Lisää Koti-valikkoon). Kuvakkeet `npm run brandikuvat` → `public/sovellus/`.
  Service workeria ei ole tarkoituksella (päivitykset näkyvät heti).
- Säännöt `vaiheet.ts`, testit `npm run test:arvostelu`.

## Sivulla

- **/ravintolat/odottavat**: toista arvioijaa odottavat (ei lopettaneita), ensimmäisen
  arvioijan nimi ja pisteet, painike arvostelulomakkeelle ravintola valmiiksi valittuna.
  Linkki ja määrä ravintolahakemiston (/ravintolat) otsikon alla "Lähetä oma arvostelu" -painikkeen vieressä; arvostelussa odottavat ovat ravintolavaiheen listana. `noindex`, ei sivukartassa.

- Arvosanakortissa: "Keskiarvo N klubilaisen arvosanasta".
- Taulukko **Klubilaisten arvosanat**: nimi, päivä, ruoka, hinta, viihtyvyys,
  keskiarvo (kunkin klubilaisen voimassa oleva arvosana).
- **Kävijöiden arviot**: lomakkeen arvostelut kommentteineen; klubilaiseen
  liitetyssä merkki "Klubilainen".
- Kortit: "arvioitu 8/2026".

## Ruokailutaulukon tuonti

1. `pip install xlrd` ja `python scripts/klubiarviot-excel.py ruokailu2026.xls`
   → `data/normalized/klubiarviot.json`
2. `npm run tuo:klubiarviot` (kuivaharjoitus) → `data/klubiarviot-tarkistus.csv`
3. Täytä tarkistuslistan sarake **päätös** (`ok`, ravintolan `_id` tai `ohita`) ja
   tallenna nimellä `data/klubiarviot-paatokset.csv`. Aja uudelleen kuivaharjoitus.
   Päätös `uusi` luo ravintolan (ja tarvittaessa kaupungin); uudelleenajo tunnistaa
   jo luodun nimen ja kaupungin perusteella eikä luo kaksoiskappaletta.
4. `npm run tuo:klubiarviot -- --vie` (development) ja tarkistus sivulla
5. `npm run tuo:klubiarviot -- --production --vie` (varmuuskopio ensin), **vasta
   deployn jälkeen**, jotta Studio ja webhook tuntevat uudet tyypit

Täsmäys: sama nimi samassa kaupungissa, tai sama ensimmäinen käyntipäivä ja
lähes sama nimi, tai lähes sama nimi samassa kaupungissa ja sama päivä tai
osoite. Pelkkä osoite ei riitä. Kaksi taulukon riviä samaan ravintolaan menee
tarkistukseen. Uudelleenajo korvaa vain tuodut (`tuotu: true`) ja poistaa
tuodut, joiden riviä ei enää täsmäytetä; Studiossa lisättyihin ei kosketa.
Samalla lomakkeen arvostelut ilman klubilaista liitetään, kun nimi täsmää
täsmälleen yhteen klubilaiseen.

### Tila 3.10.2026

- Taulukko: 570 ravintolaa, 12 arvioijaa, 1 545 arvosanaa. Vanha sivusto noudatti
  kahden arvioijan sääntöä: taulukon 67 yhden arvioijan ravintolasta 66 puuttui
  sivustolta (poikkeus Torero, Lahti 2004, nyt piilotettu)
- Täsmäys: 487 automaattisesti, 10 päätöksellä (mm. Rax Tampere/Helsinki, Leon de
  Bruxelles = "Bryssel", Huviretki Mikkeli = "Cumulus", Moskovan kaksi McDonald'sia),
  73 uutta: 6 näkyviin (Nonni, Love Berlin Döner, Burger King Mäntsälä, Heila
  Kauppahalli, Factory Kamppi, Amarillo Flamingo) ja 67 piiloon (myös Rosso, ks. alla)
- Ainoa sivuston ravintola ilman taulukkodataa: Olivia Centralstation (Helsinki 2023,
  vanhalla sivustolla, ei taulukossa). Pidetään näkyvissä vanhalla arvosanalla 3,4
- Taulukon virheet, jotka tuonti käsittelee säännöllä:
  - arvosana, jonka kaikki päivät ovat ennen ravintolan 1. käyntiä, hylätään: ainoa on
    Rosso (Imatra 2024), Simo 2,0/2,0/2,0 päivällä 9.10.1999; taulukon Lkm-sarake on 1
    ja R/H/V-sarakkeet (5,1) rikki saman virheen takia. Rosso jää piiloon (1 arvioija)
  - "Mannerheimintie 50, 00260" + "Suomi – Pohjois-Irlanti" on kopioitu 7 riville eri
    kaupungeissa: uuteen ravintolaan ei oteta kopioitua osoitetta, tapahtumaa eikä T/L-tietoa
  - 8 arvioijalta puuttuu päivä (esim. Factory Kamppi / Veikko): käytetään rivin päivää
- Riippumaton tarkistus (Excel luettuna uudelleen suoraan, ei välivaiheen kautta):
  arvioijanumerot = Painot-välilehti (1 Ilpo … 11 Veikko, 13 Elias), kaikki 570 riviä ja
  4 635 pistesolua oikeissa ravintoloissa oikeilla nimillä, käyntipäivät täsmäävät, ja
  ravintolan ruoka/hinta/viihtyvyys = taulukon R/H/V-sarakkeet (paitsi rikkinäinen Rosso).
  Pyöristys puoli ylöspäin (2,85 → 2,9)
- Painotusten poisto: 320 ravintolan arvosana ennallaan, 150 muuttui ±0,1
- Development tuotu ja tarkistettu (uudelleenajo ei muuta mitään). Production odottaa deployta
