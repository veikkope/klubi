# 20 — Litmanen-osio

Jari Litmasen sivusto-osio jalkapalloarkistossa: yleiskatsaus, lehtileikkeet,
patsas ja loukkaantumiset. Päätetty 1.10.2026.

## 1. Lähtötilanne

Vanha `litmanenjari.htm` migroitiin yhdeksi `pelaaja`-dokumentiksi, jonka
`kuvaus`-kentässä oli kaikki: 290 Portable Text -lohkoa (~115 000 merkkiä),
noin 75 kokonaista lehtijuttua 2009–2025, kaksi faktalaatikkoa, oma
"Litmasen loukkaantumiset" -osio terveysuutisineen ja 15 kuvaa. Lisäksi
`kuvat`-kentässä oli 17 kuvaa, joista 15 on patsaskuvia.

Ongelmat:

- Sivua ei voi lukea: yksi 40 tulostesivun mittainen pötkö ilman sisällysluetteloa.
- Juttujen rajat eivät erotu (osa otsikoista h3, osa tavallisia kappaleita).
- Samat tiedot kahteen kertaan (faktalaatikot vs. perustietokentät).
- Terveysuutiset profiilissa, vaikka loukkaantumisilla on oma sivu.
- Isän on vaikea lisätä uutta juttua: oikea kohta pitää etsiä 290 lohkon seasta.

## 2. Rakenne

```
/jalkapalloarkisto/litmanen                    Jari Litmanen (yleiskatsaus)
/jalkapalloarkisto/litmanen/lehtileikkeet      Lehtileikkeet
/jalkapalloarkisto/litmanen/patsas             Patsas
/jalkapalloarkisto/litmanen/loukkaantumiset    Litmasen loukkaantumiset
```

Neljä sivua samalla osiovalikolla (`litmanenNav`). Jokainen juttu on täsmälleen
yhdellä sivulla (ei kaksoissisältöä hakukoneelle), sivu määräytyy jutun
`osio`-kentästä.

| Sivu | Sisältö |
|---|---|
| Yleiskatsaus | pääkuva, avainluvut (maaottelut, maalit, seurat, vuodet), perustiedot, esittely (`kuvaus`, valinnainen), uran aikajana (`seurat`), saavutukset ryhmittäin, osiokortit, kolme uusinta lehtileikettä, Litmanen-tunnisteen uutiset |
| Lehtileikkeet | vuosittain ryhmitelty lista, vuosilinkit; jutusta näkyy otsikko, päiväys, lähde ja ensimmäinen kappale, loput avautuu "Lue koko juttu" (`<details>`) |
| Patsas | paljastuspäivä ja paikka, esittely, päivätyt kuvat galleriana (lightbox), patsasjutut, linkki patsas-tunnisteen uutisiin |
| Loukkaantumiset | yhteenveto (määrä, vuodet, yleisin vamma, pahin vuosi), kaavio vuosittain, vammat kehonosittain, taulukko, terveysjutut |

Kaikki listat tuoreimmasta vanhimpaan (sama periaate kuin avauskuvissa).

## 3. Sisältömalli

### `lehtileike` (uusi dokumenttityyppi)

Oma dokumentti eikä taulukko pelaajan sisällä: jutuilla on oma elinkaarensa,
niitä on kymmeniä, ja Studion listassa ne voi järjestää päivämäärän mukaan ja
hakea otsikolla.

| Kenttä | Tyyppi | |
|---|---|---|
| `otsikko` | string, pakollinen | |
| `pelaaja` | reference → pelaaja, pakollinen | kenen sivulla juttu näkyy |
| `osio` | radio: lehtileikkeet / patsas / terveys | mille sivulle |
| `julkaistu` | date, pakollinen | jutun julkaisupäivä |
| `lahde` | string | esim. "is.fi", "HS" |
| `linkki` | url | alkuperäinen juttu, jos verkossa |
| `teksti` | portableText, pakollinen | |
| `needsReview`, `tarkistettavaa` | | migraation liput |

Ankkuri sivulla: `leike-<_id>` (pysyvä, myös Studiossa luoduille).

### `pelaaja` (lisäkentät)

- `syntymapaikka`, `pituus` — perustiedot (aiemmin faktalaatikossa tekstinä)
- `saavutukset[]` — `{ ryhma: seurajoukkueet | maajoukkue | henkilokohtaiset, nimi, vuodet }`
- `patsas` — `{ paljastettu, sijainti, esittely, kuvat[] (paivattyKuva) }`
- `uutistunniste` — uutisten tunniste, jonka kirjoitukset nostetaan sivulle ("litmanen")

### `paivattyKuva` (uusi objekti)

Kuva + alt (pakollinen) + kuvateksti + `paivamaara`. Päivämäärä järjestää
patsaskuvat, eikä sitä tarvitse lukea kuvatekstistä.

## 4. Siirto (`npm run patch:litmanen-osio`)

Skripti `scripts/uudista-litmanen.ts` jäsentää nykyisen `kuvaus`-kentän:

1. Jutun alku = h3-otsikko tai lyhyt (≤ 90 merkkiä) kappale ilman loppupistettä
   edellisen jutun lähdemerkinnän jälkeen.
2. Lähde ja päiväys jutun lopun sulkeista: "(is.fi 27.10.2025)",
   "(ess / 8.5.2012 / …)", "(16.01.2012 ess.fi)". Sulkeet poistetaan tekstistä.
   Ilman päiväystä → `needsReview`.
3. Osio: "Litmasen loukkaantumiset" -otsikon jälkeiset → `terveys`; otsikossa
   "patsa"/"jalusta" → `patsas`; muut → `lehtileikkeet`.
4. Faktalaatikot → `syntymapaikka`, `pituus`, `saavutukset`, `patsas.paljastettu/sijainti`.
5. `kuvat[1..]` (patsaskuvat ja pilapiirros) → `patsas.kuvat`, päiväys alt-tekstistä.
6. `kuvaus` tyhjennetään; `kuvat` = pääkuva.
7. `/litmanenjaripatsas.htm` pois `muutLegacyUrlit`ista → ohjaus patsassivulle.

Kuivaharjoitus kirjoittaa listan `data/litmanen-leikkeet.tsv` tarkistettavaksi.
Kirjoitus: `createIfNotExists` + pelaajan patch `ifRevisionId`-ehdolla samassa
transaktiossa. Production aina varmuuskopion jälkeen ja vasta kun koodi on julkaistu.

## 5. Avoin päätös: tekijänoikeudet

Lehtijutut ovat kokonaisina (kuten vanhalla sivustolla). Sivu näyttää
ensimmäisen kappaleen ja loput avautuvat. Jos klubi haluaa näyttää vain
tiivistelmän ja linkin, se on yhden komponentin muutos (`LeikeLista`), ja
kokonaiset tekstit voivat jäädä Studioon.
