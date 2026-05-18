# 01 — Sisältöauditointi

Tämä dokumentti listaa nykyisen sivuston **kaiken** sisällön. Tarkka inventaario suoritetaan `scripts/scrape-old-site.ts`-skriptillä; tämä dokumentti pidetään ajan tasalla scrape-tulosten perusteella.

## Vanhan päänavigaation 10+1 linkkiä

Vanhalla sivustolla on yläpalkissa nämä linkit. Tämä audit tehtiin 2026-05-18.

| # | Linkki (vanha) | Vanha URL | Sisältö lyhyesti | Uusi sijainti |
|---|---|---|---|---|
| 1 | ETUSIVU | `/` (`/etusivu.htm`) | Pääuutiset, ajankohtaiset | `/` |
| 2 | YLEISTÄ | `/yleista.htm` | Yhdistyksen esittely, perustettu 2007, tavoitteet, järjestetyt tapahtumat | `/klubi` |
| 3 | OTTELUT | `/ottelut.htm` | **404** — sivu ei toimi | (poistetaan) → `/tapahtumat` |
| 4 | ARVOSTELU | `/arvostelu.htm` | Huuhkajien pelaajatilastot (Pukki 45, Sparv 30), avauskokoonpanot, otteluhistoria | `/jalkapalloarkisto/huuhkajat` |
| 5 | VEIKKAUS | `/veikkaus.htm` | Klubin sisäinen ennustuskilpailu: maaottelujen, arvokisojen ja Veikkausliigan veikkaus | `/klubi/palloveikkaus` |
| 6 | KOMMENTIT | `/kommentit.htm` | Vuoden 2007 jalkapallo-uutiset ja kommentit, arkisto 2005–2006 | `/uutiset/arkisto` |
| 7 | STADIONIT | `/stadionit.htm` | Stadionopas: Suomi, Tshekki, Venäjä, Latvia, Viro, Englanti, Kreikka, Tanska | `/jalkapalloarkisto/stadionit` |
| 8 | RUOKAILU | `/ruokailu.htm` | Ravintola-arvioinnit 1,0–5,0 asteikolla, Suomi + ulkomaat | `/ravintolat` |
| 9 | HISTORIA | `/historia.htm` | Suomen ja kv. jalkapallon historia, tilastot, FIFA-ranking, valmentajat | `/jalkapalloarkisto` (hub) |
| 10 | BLOGI | `/blogi.htm` | Suomalainen jalkapalloblogi 2007: maajoukkue, seurat, Lahden jalkapallo | `/uutiset` |
| 11 | KLUBI | `/klubi.htm` | **404** — sivu ei toimi | (poistetaan) → `/klubi` |

## Sisältöryhmien tiivistelmä

### A. Yhdistyssisältö (säilytetään ja moderniisoidaan)
- Yhdistyksen esittely (YLEISTÄ → `/klubi`)
- Perustamisvuosi 2007, tavoitteet (suomalaisuus, sivistys, jäsenten hyvinvointi)
- Toimintamuodot: talkoot, vappu, mölkky-turnaukset, vuosikokous, matkat, ilotulitukset, jouluruokailu
- Palloveikkaus = klubin sisäinen aktiviteetti (VEIKKAUS → `/klubi/palloveikkaus`)
- Hallitus (tarkat tiedot puuttuvat — selvitettävä isältä)
- Säännöt (selvitettävä)
- Yhteystiedot (selvitettävä)
- Jäsenyysinfo, hinnat (selvitettävä)

### B. Tapahtumat ja uutiset (yhdistetään)
Aiemmin BLOGI + KOMMENTIT — yhdistetään yhdeksi `/uutiset`-osioksi:
- Pääuutiset: Manchester City FA Cup -voitto, Suomi-Saksa 31.5.2026, Huuhkajien nousu, vuosikokous
- Maajoukkueen uutiset, seurajoukkueiden historia, Lahden jalkapallon kehitys
- Kommenttiarkisto 2005–2024 → `/uutiset/arkisto`
- Blogspot-postaukset: `lahdensuomalainenklubi.blogspot.com` (Vappu 2026, vuosikokous, mölkky, palloveikkaus)
- YouTube-kanava: https://www.youtube.com/@suomalainenklubi

### C. Jalkapalloarkisto (siirretään `/jalkapalloarkisto`-hubin alle)
Vanhan sivuston laajin sisältöryhmä.

| Vanha URL | Sisältö | Uusi sijainti |
|---|---|---|
| `/arvostelu.htm` | Huuhkajien pelaajatilastot ja otteluhistoria | `/jalkapalloarkisto/huuhkajat` |
| `/historia.htm` | Jalkapalloarkiston hub | `/jalkapalloarkisto` |
| `/fifaranking.htm` | Suomen FIFA-ranking 1992→ | `/jalkapalloarkisto/fifa-ranking` |
| `/suomi.htm` | Suomen mestarit | `/jalkapalloarkisto/mestarit` |
| `/suomenvalmentajat.htm` | Huuhkajien valmentajat 1922→ | `/jalkapalloarkisto/valmentajat` |
| `/suomenvalmentajientulot.htm` | Valmentajien palkat | `/jalkapalloarkisto/valmentajat#palkat` |
| `/vuodenpelaaja.htm` | Suomen vuoden pelaajat | `/jalkapalloarkisto/vuoden-pelaajat` |
| `/FIFAvuodenpelaaja.htm` | FIFA:n vuoden pelaajat | `/jalkapalloarkisto/vuoden-pelaajat` |
| `/euroopan_paras_pelaaja.htm` | Ballon d'Or -voittajat | `/jalkapalloarkisto/euroopan-paras` |
| `/top10jalkapallosaavutukset.htm` | Suomen jalkapallon 10 merkittävintä | `/jalkapalloarkisto/saavutukset` |
| `/ottelut2012ja2013.htm` | 2014 MM-karsinta | `/jalkapalloarkisto/karsinnat/mm-2014` |
| `/intercontinental.htm` | FIFA Club World Cup | `/jalkapalloarkisto/eurocupit/intercontinental` |
| `/cupvoittajiencup.htm` | Conference League | `/jalkapalloarkisto/eurocupit/conference-league` |
| `/uefacup.htm` | Europa League | `/jalkapalloarkisto/eurocupit/europa-league` |
| `/supercup.htm` | UEFA Super Cup | `/jalkapalloarkisto/eurocupit/super-cup` |
| `/eurocuptilasto.htm` | Champions League | `/jalkapalloarkisto/eurocupit/champions-league` |
| `/lupaavia.htm` | Lupaavat pelaajat 1980–1991 | `/jalkapalloarkisto/lupaavat` |
| `/Kommentit2022.htm` | Uutisarkisto 2021–2024 | `/uutiset/arkisto` |

### D. Stadionit
Siirretään jalkapalloarkiston alle.

| Vanha URL | Uusi sijainti |
|---|---|
| `/stadionit.htm` | `/jalkapalloarkisto/stadionit` |
| `/stadionlahtiurheilukeskus.htm` | `/jalkapalloarkisto/stadionit/lahti` |
| `/stadionhelsinkiolympiastadion.htm` | `/jalkapalloarkisto/stadionit/helsinki-olympiastadion` |

(Lisää stadionsivuja selvitettävä scrape-skriptillä.)

### E. Ravintolat
Kaupungeittain järjestetty, ~93 ravintolaa Lahdessa, lisäksi muita kaupunkeja ja ulkomaita. Arvioinnit 1,0–5,0.

| Vanha URL | Uusi sijainti |
|---|---|
| `/ruokailu.htm` | `/ravintolat` |
| `/ruokailulahti.htm` | `/ravintolat?kaupunki=lahti` |
| `/ruokailuhameenlinna.htm` | `/ravintolat?kaupunki=hameenlinna` |
| `/ruokailulappeenranta.htm` | `/ravintolat?kaupunki=lappeenranta` |
| `/ruokailupirkanmaa.htm` | `/ravintolat?kaupunki=pirkanmaa` |
| `/ruokailukokkola.htm` | `/ravintolat?kaupunki=kokkola` |
| `/ruokailuuusimaa.htm` | `/ravintolat?kaupunki=uusimaa` |
| `/ruokailukreikka.htm` | `/ravintolat?maa=kreikka` |

## Tehtävät auditin viimeistelyyn

- [ ] Aja `npm run scrape` → tuloksena `data/raw-content.json`
- [ ] Laske tarkka sivumäärä, ravintolamäärä, kuvamäärä
- [ ] Tunnista 404-linkit (kuolleet ulkoiset linkit)
- [ ] Listaa kaikki kuva-URL:t
- [ ] Tunnista yhteystiedot (kysy isältä jos puuttuu)
- [ ] Tunnista hallituksen kokoonpano (kysy isältä)
- [ ] Tunnista jäsenyysmaksut ja hakuprosessi (kysy isältä)
- [ ] Tunnista palloveikkauksen säännöt (selvitettävä veikkaus.htm:stä)

Päivitä tämä dokumentti scrape-tulosten perusteella konkreettisilla luvuilla.
