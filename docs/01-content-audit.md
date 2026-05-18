# 01 — Sisältöauditointi

Tämä dokumentti listaa nykyisen sivuston **kaiken** sisällön, jotta migraatiossa ei jää mitään pois. Tarkka inventaario suoritetaan `scripts/scrape-old-site.ts`-skriptillä; tämä dokumentti pidetään ajan tasalla scrape-tulosten perusteella.

## Sivuston pääryhmät

### 1. Yhdistyssisältö (siirretään uuteen muotoon)
- Yhdistyksen perustiedot, perustamisvuosi 2007
- Hallitus (tarkat tiedot puuttuvat — selvitettävä isältä)
- Säännöt (selvitettävä)
- Yhteystiedot (selvitettävä)
- Jäsenyysinfo, hinnat (selvitettävä)

### 2. Tapahtumat ja uutiset (blogspot-postaukset)
Vanhassa Blogspot-versiossa `lahdensuomalainenklubi.blogspot.com`:
- Vappu (2026)
- Vuosikokous 25.4.2026
- Mölkkyturnaus (pääsiäinen)
- Palloveikkaus (Veikkausliiga-ennustus)
- Aiempi historia useita vuosia takaperin

→ Siirretään `uutinen`-dokumenteiksi Sanityyn, säilyttäen päivämäärät SEO-arvon takia.

### 3. Jalkapalloarkisto (rakenteinen data)
Tämä on sivuston laajin sisältöryhmä. Jokainen alasivu = oma sisältöyksikkö.

| Vanha URL | Sisältö | Uusi sijainti |
|---|---|---|
| `/fifaranking.htm` | Suomen FIFA-ranking-historia (1992→2026), nykyinen sija 73 | `/jalkapallo/fifa-ranking` |
| `/suomi.htm` | Suomen mestarit (liiga/cup/liigacup vuodesta 1908) | `/jalkapallo/mestarit` |
| `/suomenvalmentajat.htm` | Huuhkajien päävalmentajat 1922→ | `/jalkapallo/valmentajat` |
| `/suomenvalmentajientulot.htm` | Päävalmentajien palkat | `/jalkapallo/valmentajat#palkat` |
| `/vuodenpelaaja.htm` | Suomen vuoden pelaajat | `/jalkapallo/vuoden-pelaaja` |
| `/FIFAvuodenpelaaja.htm` | FIFA:n vuoden pelaajat | `/jalkapallo/vuoden-pelaaja#fifa` |
| `/euroopan_paras_pelaaja.htm` | Ballon d'Or -voittajat | `/jalkapallo/euroopan-paras` |
| `/top10jalkapallosaavutukset.htm` | Suomen jalkapallon 10 merkittävintä | `/jalkapallo/saavutukset` |
| `/ottelut2012ja2013.htm` | 2014 MM-karsinta | `/jalkapallo/karsinnat/mm-2014` |
| `/intercontinental.htm` | FIFA Club World Cup | `/jalkapallo/intercontinental` |
| `/cupvoittajiencup.htm` | Conference League / Cup Winners' Cup | `/jalkapallo/conference-league` |
| `/uefacup.htm` | Europa League / UEFA Cup | `/jalkapallo/uefa-cup` |
| `/supercup.htm` | UEFA Super Cup | `/jalkapallo/super-cup` |
| `/eurocuptilasto.htm` | Champions League | `/jalkapallo/eurocup` |
| `/lupaavia.htm` | Lupaavat pelaajat 1980–1991 | `/jalkapallo/historia/lupaavat-1980-1991` |
| `/Kommentit2022.htm` | Uutisarkisto 2021–2024 | Jaetaan yksittäisiksi `uutinen`-dokumenteiksi |

### 4. Stadionit
| Vanha URL | Sisältö | Uusi sijainti |
|---|---|---|
| `/stadionit.htm` | Eurooppalaiset stadionit listattu | `/stadionit` (hakemisto) |
| `/stadionlahtiurheilukeskus.htm` | Lahden Stadion (Finnair Stadium) | `/stadionit/lahti` |
| `/stadionhelsinkiolympiastadion.htm` | Olympiastadion Helsinki | `/stadionit/helsinki-olympiastadion` |

(Lisää stadionsivuja selvitettävä scrape-skriptillä.)

### 5. Ravintolareviewit (rakenteinen data)
Kaupungeittain järjestetty, ~93 ravintolaa, tähtiluokitus 1–5.

| Vanha URL | Kaupunki | Uusi sijainti |
|---|---|---|
| `/ruokailu.htm` | Pääindeksi (frame) | `/ravintolat` |
| `/ruokailulahti.htm` | Lahti (93 ravintolaa, TOP 5 -listat 2015–2025) | `/ravintolat?kaupunki=lahti` |
| `/ruokailuhameenlinna.htm` | Hämeenlinna | `/ravintolat?kaupunki=hameenlinna` |
| `/ruokailulappeenranta.htm` | Lappeenranta | `/ravintolat?kaupunki=lappeenranta` |
| `/ruokailupirkanmaa.htm` | Pirkanmaa (Parkano, Jalasjärvi, Ikaalinen, Härmä) | `/ravintolat?kaupunki=pirkanmaa` |
| `/ruokailukokkola.htm` | Kokkola | `/ravintolat?kaupunki=kokkola` |
| `/ruokailuuusimaa.htm` | Uusimaa | `/ravintolat?kaupunki=uusimaa` |
| `/ruokailukreikka.htm` | Kreikka | `/ravintolat?maa=kreikka` |

### 6. Media
- YouTube-kanava: https://www.youtube.com/@suomalainenklubi
- Blogspot: http://lahdensuomalainenklubi.blogspot.com/
- Kuvat: scrape-skripti kerää URL:t, ladataan Sanityyn

## Tehtävät auditin viimeistelyyn

- [ ] Aja `scripts/scrape-old-site.ts` → tuloksena `data/raw-content.json`
- [ ] Laske tarkka sivumäärä, ravintolamäärä, kuvamäärä
- [ ] Tunnista 404-linkit (kuolleet ulkoiset linkit)
- [ ] Listaa kaikki kuva-URL:t
- [ ] Tunnista yhteystiedot (kysy isältä jos puuttuu)
- [ ] Tunnista hallituksen kokoonpano (kysy isältä)
- [ ] Tunnista jäsenyysmaksut ja hakuprosessi (kysy isältä)

Päivitä tämä dokumentti scrape-tulosten perusteella konkreettisilla luvuilla.
