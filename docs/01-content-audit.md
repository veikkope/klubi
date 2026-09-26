# 01 — Sisältöauditointi

> **Päivitetty 2026-09-26 täyden crawlin pohjalta.** Aiempi versio laadittiin
> selaimesta arvaillen ja sisälsi URL:eja joita ei ole olemassa
> (`/ottelut.htm`, `/klubi.htm`, `/kommentit.htm`, `/blogi.htm`). Alla olevat
> luvut ovat mitattuja, eivät arvioita. Lähde: `npm run crawl` →
> `data/raw-html/` + `data/crawl-status.tsv`.

## Mitattu laajuus

| | |
|---|---|
| HTML-sivuja | **198** (kaikki HTTP 200) |
| HTML yhteensä | 7,8 MB |
| Uniikkeja kuvia | **1 112** |
| Ravintola-arvioita | **497** (jäsennetty, 1 vaatii tarkistuksen) |
| Linkkejä Blogspotiin | ~450 |
| PDF- tai muita liitteitä | 0 |

Sivusto on **FrontPage-frameset**: `index.html` määrittelee kehykset, ja jokainen
osio on oma `.htm`-tiedostonsa. Osoiterivi ei siis vaihdu osiota vaihdettaessa,
mutta se on puhtaasti kosmeettista — jokainen sivu on suoraan haettavissa omalla
URL:llaan, eikä sisällön poimintaan tarvita selainautomaatiota.

## Vanhan päänavigaation 10+1 linkkiä

Todelliset kohteet `links.htm`-kehyssivulta luettuna.

| # | Linkki | Vanha URL | Sisältö | Uusi sijainti |
|---|---|---|---|---|
| 1 | ETUSIVU | `/etusivu.htm` | Viimeisimmät otsikot, laskuri seuraavaan otteluun | `/` |
| 2 | YLEISTÄ | `/yleista.htm` | Yhdistyksen esittely, perustettu 2007 | `/klubi` |
| 3 | OTTELUT | `/otteluihin.htm` | Otteluarkisto | `/jalkapalloarkisto/huuhkajat` |
| 4 | ARVOSTELU | `/arvostelu.htm` | Huuhkajien pelaajatilastot | `/jalkapalloarkisto/huuhkajat` |
| 5 | VEIKKAUS | `/veikkaus.htm` | Klubin ennustuskilpailu | `/klubi/palloveikkaus` |
| 6 | KOMMENTIT | `/Kommentit2022.htm` | Uutisarkiston uusin vuosi | `/uutiset/arkisto` |
| 7 | STADIONIT | `/stadionit.htm` | Stadionopas | `/jalkapalloarkisto/stadionit` |
| 8 | RUOKAILU | `/ruokailu.htm` | Ravintolahakemisto | `/ravintolat` |
| 9 | HISTORIA | `/historia.htm` | Jalkapalloarkiston hub | `/jalkapalloarkisto` |
| 10 | BLOGI | `/blogi2017.htm` | Blogiarkiston uusin vuosi | `/uutiset/arkisto` |
| 11 | KLUBI | *(ulkoinen)* | Blogspot — klubin elävä kanava | säilyy ulkoisena |

**Huomio:** KLUBI-linkki osoittaa Blogspotiin, ei sivuston omalle sivulle.
Yhdistyksen ajankohtainen toiminta on siis Blogspotissa ja tämä sivusto on
käytännössä jalkapalloarkisto + ravintolahakemisto. Blogspot-migraatio on oma
projektinsa (RSS-syötteen kautta), eikä kuulu tähän vaiheeseen.

## Sivuperheet mitattuna

| Ryhmä | Tiedostokuvio | Sivuja | Uusi sijainti |
|---|---|---:|---|
| Ravintolat | `ruokailu*.htm` | 46 | `/ravintolat` |
| Uutisarkisto | `kommentit*.htm` | 28 | `/uutiset/arkisto/[vuosi]` |
| Blogiarkisto | `blogi*.htm` | 19 | `/uutiset/arkisto/[vuosi]` |
| Otteluarkisto | `ottelut*.htm` | 11 | `/jalkapalloarkisto/huuhkajat` |
| Stadionit | `stadion*.htm` | 15 | `/jalkapalloarkisto/stadionit` |
| Arvokisat | `MM20*.htm`, `EM20*.htm`, `*tilasto.htm` | ~12 | `/jalkapalloarkisto/arvokisat` |
| Pelaajat | `litmanen*.htm`, `pelaaja*.htm` | ~6 | `/jalkapalloarkisto/pelaajat` |
| Klubin toiminta | `talkoot`, `vappu`, `molkky`, … | ~10 | `/klubi/toiminta/[slug]` |
| Veikkaus | `veikkaus*.htm` | 4 | `/klubi/palloveikkaus` |

Kolme viimeistä perhettä puuttuivat alkuperäisestä informaatioarkkitehtuurista
kokonaan. Ne lisättiin `docs/11-maali-ja-rinnakkaistoteutus.md` §1:ssä.

## Ravintoladatan rakenne

Vanha muoto on poikkeuksellisen säännöllinen ja siksi koneellisesti purettavissa:

```
(03) 23.12.2003 Mamma Maria
Vapaudenkatu 10 / 15110 Lahti
**** ( 3,6  Ruoka 3,5 / Hinta 4,0 / Viihtyvyys 3,6 )
Jouluruokailu / 01.05.2007 / 14.07.2008 / ...
03 751 6716
```

Jäsennystulos (`npm run parse:ravintolat` → `data/normalized/ravintolat.json`):

| Kenttä | Osumia |
|---|---:|
| Kokonaisarvosana | 488 / 497 |
| Osa-arviot (Ruoka / Hinta / Viihtyvyys) | 476 |
| Osoite | 493 |
| Puhelin | 336 |
| Käyntimerkintöjä | 467 |
| Lopettaneita | 34 |
| Vaatii tarkistuksen | 1 |

Suurimmat alueet: Helsinki 112, Lahti 94, Venäjä 35, Tampere 24, Uusimaa 24,
Lappeenranta 23, Lontoo 23.

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

Stadionsivuja on yhteensä 15; täysi lista `data/crawl-status.tsv`:ssä (`stadion*.htm`).

### E. Ravintolat
Kaupungeittain järjestetty, yhteensä 497 arviota 46 sivulla (ks. mitattu taulukko yllä). Arvioinnit 0–5 yhden desimaalin tarkkuudella, lisäksi kolme osa-arviota.

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

## Jäljellä olevat selvitykset

Nämä eivät ole vanhalla sivustolla eikä niitä voi scrapeta — kysyttävä isältä:

- [ ] Yhdistyksen yhteystiedot (osoite, Y-tunnus, IBAN)
- [ ] Hallituksen kokoonpano ja kuvat
- [ ] Säännöt (PDF tai teksti)
- [ ] Jäsenmaksut ja hakuprosessi
- [ ] Päätös: päästetäänkö tekoälycrawlerit sisään (`app/robots.ts`, ks. docs/11 §7)
- [ ] Selvitettävä: Sanityn asset-raja 1 112 kuvalle
