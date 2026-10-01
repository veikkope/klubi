# 13 — Otteluohjelma

Etusivun "Tulevat ottelut" ja `/ottelut`-sivu. Toteutus: `lib/ottelut.ts`, näkymä `components/fixture-list.tsx`, etusivulohko `otteluohjelma`.

## Lähteet

| # | Lähde | Milloin | Kattavuus | Huomio |
|---|---|---|---|---|
| 1 | **Palloliiton Taso-rajapinta** (`spl.torneopal.fi/taso/rest/getMatches`) | Kun `TASO_API_KEY` on asetettu | Veikkausliiga, Ykkösliiga, Suomen Cup (sarjat `TASO_SARJAT`-muuttujassa) | Virallinen. Avain vain palvelimella. Parametrien nimet ja vastausmuoto perustuvat julkiseen dokumentaatioon, ja ne on tarkistettava, kun avain on saatu. |
| 2 | **Veikkausliigan kalenterisyöte** (`veikkausliiga.com/tilastot/spljp{vv}/kalenterit/`) | Oletus ilman avainta | Vain Veikkausliiga | Ei stadioneja. Kausi vaihtuu automaattisesti vuoden mukaan. |
| 3 | **Studion `ottelu`-dokumentit** | Aina | Mitä tahansa | Maajoukkue- ja cup-ottelut sekä merkinnät "Klubi paikalla" ja "Vierasmatka". |

Ulkoinen data välimuistitetaan tunniksi. Jos haku epäonnistuu, lista näytetään pelkillä Studion otteluilla, eikä sivu kaadu.

### Studion ottelu yhdistyy automaattiseen

Studion ottelu yhdistyy automaattisesti haettuun, kun Helsingin aikaan päivä on sama ja joukkueiden nimet täsmäävät. Vertailussa kirjainkoko, välilyönnit ja välimerkit ohitetaan. Kirjoita siksi joukkueet Studioon kuten Veikkausliigan sivuilla (esim. "FC Lahti", "IF Gnistan"). Studion täytetyt kentät (kilpailu, stadion) voittavat, mutta kellonaika tulee aina syötteestä.

Kirjoitusvirheiden esto (`lib/joukkueet.ts`, `sanity/components/joukkue/`):

- `GET /api/joukkueet` palauttaa automaattisen ohjelman joukkueet ja "Suomi" (välimuisti tunti, julkista tietoa).
- Studion Koti- ja Vieras-kentissä on ehdotuslista (datalist): automaattisen ohjelman joukkueet ja Studion otteluissa aiemmin käytetyt nimet.
- Varoitus (ei estä julkaisua), kun nimi on lähes muttei täysin sama kuin tunnettu joukkue: Damerau–Levenshtein-etäisyys enintään 1 (≤ 5 merkin nimet) tai 2. Alle 4-merkkisiä lyhenteitä ei verrata, koska HJK/SJK ja TPS/VPS eroavat yhdellä merkillä. Testit: `npm run test:joukkueet`.

Esimerkki: klubi lähtee vierasmatkalle Seinäjoelle. Lisää Studioon ottelu "SJK – FC Lahti" oikealle päivälle ja valitse "Vierasmatka". Merkintä ilmestyy automaattisesti haetun ottelun viereen.

## Huuhkajien ottelut

Suomen miesten maajoukkueen ottelut ovat klubille erityisiä. Klubi käy jokaisessa kotiottelussa, mutta vieraspeleihin se ei yleensä mene.
- Ottelu tunnistetaan, kun kotijoukkue tai vierasjoukkue on tasan **"Suomi"** (kirjainkoko ohitetaan).
- **Kotiottelu** (Suomi kotijoukkueena) saa automaattisesti merkinnän **"Klubi paikalla"**, eikä sitä tarvitse valita Studiossa.
- **Vieraspeli** korostetaan, mutta ilman merkintää. Jos klubi lähtee mukaan, valitse Studiossa "Klubi paikalla" tai "Vierasmatka".
- Listassa rivillä on vaalean sininen pohja, sininen palkki vasemmassa reunassa ja sininen **"Huuhkajat"**-tunniste kilpailun edessä.
- Muut Suomen joukkueet kirjoitetaan tarkenteella ("Suomi (naiset)", "Suomi U21"), jolloin niitä ei tulkita Huuhkajiksi.

Maajoukkueen ottelut lisätään Studioon käsin, koska automaattinen syöte kattaa vain Veikkausliigan. Pelejä on noin 10 vuodessa.

## Etusivu: Huuhkajat, valitut seurat ja laskuri

Etusivun otteluohjelmalohkossa on nämä Studion valinnat:
- **Näytä vain Huuhkajien ja valittujen seurojen ottelut** (oletuksena päällä). Listassa ovat ottelut, joissa joukkue on tasan "Suomi", sekä **Näytä myös näiden seurojen ottelut** -listan seurojen ottelut. Nimi verrataan kuten Studion ja syötteen yhdistämisessä. Etusivulla listassa on "FC Lahti". Jos lista on tyhjä, ulkoisia syötteitä ei haeta. Sama seuralista rajaa myös `/ottelut`-sivun: siellä näkyvät aina vain Huuhkajat ja listan seurat (kytkimestä riippumatta, `ottelujenSeuratQuery`). Ilman etusivun lohkoa oletus on "FC Lahti".
- **Näytä laskuri seuraavaan Huuhkajien otteluun.** Laskuri on ottelulistan yläpuolella (`components/match-countdown.tsx`). Ottelu on sama, joka on listassa ensimmäisenä, joten laskurille ei ole omaa kenttää. Jos Huuhkajien ottelua ei ole tiedossa, laskuria ei näytetä.

Kun ottelu alkaa, laskurin tilalle vaihtuu "Ottelu on alkanut". Seuraavaan otteluun laskuri siirtyy, kun etusivu päivittyy seuraavan kerran (tunnin välein tai heti Studion julkaisun jälkeen), kuitenkin aikaisintaan 2 tuntia alkamisen jälkeen.

Vanha etusivun kenttä `seuraavaOttelu` on vanhentunut, eikä sitä käytetä.

## Varmenneongelma (veikkausliiga.com)

veikkausliiga.com ei lähetä TLS-ketjussa välivarmennettaan (ZeroSSL ECC DV SSL CA 2). Selaimet hakevat sen itse, mutta Node ei, joten tavallinen `fetch` kaatuu virheeseen `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

`lib/fetch-with-intermediate.ts` lisää puuttuvan välivarmenteen luotettujen juurien rinnalle vain tätä hakua varten. Varmennusta ei ohiteta. Välivarmenne on voimassa 23.9.2035 asti. Jos veikkausliiga.com korjaa ketjunsa, koodi toimii silti.

## Ympäristömuuttujat

| Muuttuja | Pakollinen | Esimerkki |
|---|---|---|
| `TASO_API_KEY` | ei | (Palloliitolta) |
| `TASO_SARJAT` | ei | `spljp26:VL,splcup26:SC`. Oletuksena kuluvan kauden Veikkausliiga. |

## Taso-avaimen hankkiminen

Toimi näin:
1. Jos klubilla on TASO-pääkäyttäjätunnukset (taso.palloliitto.fi), ota rajapinta käyttöön kohdasta "Rajapinta" ja hyväksy käyttöehdot.
2. Muuten lähetä sähköpostia osoitteeseen **tuki@torneopal.fi**. Pyydä `getMatches`-avainta Veikkausliigaan, Ykkösliigaan ja Suomen Cupiin voittoa tavoittelemattoman yhdistyksen sivustolle. Kysy samalla käyttöehdot, pyyntörajat ja kuuluvatko A-maajoukkueen ottelut rajapintaan.
3. Aseta `TASO_API_KEY` Verceliin (Production + Preview). Älä koskaan laita avainta `NEXT_PUBLIC_`-muuttujaan.

Maajoukkueen ottelut (noin 10 vuodessa) lisätään toistaiseksi Studiossa.

## Selvitetyt vaihtoehdot (syyskuu 2026)

- **football-data.org:** Veikkausliiga ja Suomen Cup vain maksullisissa tasoissa (alkaen 49 €/kk).
- **API-Football:** maksuton taso ei sisällä kuluvaa kautta. Pro-taso 19 $/kk.
- **TheSportsDB:** ilmaisella avaimella vain yksi seuraava ottelu. Data on yhteisön ylläpitämää.
- **FotMob ja vastaavat:** epävirallisia rajapintoja, joiden käyttöä ei ole sallittu. Ei käytetä.
