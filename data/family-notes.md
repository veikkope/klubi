# Sivuperheet — lähtötieto vaiheen 1 agenteille (M1–M6)

Laatinut vaiheen 0b skeema-agentti 2026-09-27. Sopimus: `docs/12-sisaltomigraatio.md`.
URL → agentti -jako: `data/coverage.tsv` (198 riviä, jokaisella täsmälleen yksi agentti).
Skeemamuutokset: `docs/05-content-models.md` § "Sisältömigraation lisäykset".
`sanity/schemas/**` on nyt **jäädytetty** — tarpeet raporttiin, ei muutoksia.

| Agentti | Sivuja | Sisältökuvia (kuvat.json) |
|---|---:|---:|
| M1 Uutisarkisto | 50 | 132 |
| M2 Huuhkajat | 21 | 114 |
| M3 Tilastot | 21 | 91 |
| M4 Arvokisat & pelaajat | 17 | 31 |
| M5 Stadionit | 19 | 64 |
| M6 Klubi & runko | 21 | 178 |
| ravintolat-valmis | 46 | 484 |
| frame (index.html, yla, links) | 3 | – |

18 kuvaa esiintyy usean agentin sivuilla → Sanity deduplikoi hashilla, mutta
**omistajuus** ratkaistaan `scripts/lib/match-image-owner.ts`:llä, ei molemmille.
Wikimedia-lippukuvat (`upload.wikimedia.org`, mm. `mmtilasto`, `emtilasto`,
`eurocuptilasto`) eivät ole inventaariossa → ne pudotetaan; maan nimi säilyy solutekstinä.

---

## 0. Kaikille yhteistä

### 0.1 Merkistö — ÄLÄ luota `<meta charset>`:iin

Mitattu kaikista 197 tiedostosta (tavut vs. ilmoitus):

| Ilmoitettu | Todellinen | Kpl |
|---|---|---:|
| windows-1252 | ei-UTF-8 tavuja (oikeasti 1252) | 58 |
| windows-1252 | pelkkä ASCII (+ `&auml;`-entiteetit) | 68 |
| us-ascii | pelkkä ASCII | 40 |
| **us-ascii** | **validi UTF-8** | 9: `cupvoittajiencup`, `etusivu`, `eurocuptilasto`, `Kommentit2022`, `otsikkoarkisto`, `ottelut2024ja2025`, `ruokailukotka`, `suomenparasavauskokoonpano`, `veikkauspalloveikkaus` |
| iso-8859-1 | pelkkä ASCII | 8: `EM2012`, `EM2016`, `Kuu`, `Loiste`, `MM2010`, `MM2014`, `MM2018`, `Salud` |
| utf-8 | validi UTF-8 | 13 |
| **euc-kr** | **validi UTF-8** | 1: `ruokailulappeenranta` |

BOM:eja ei ole. **Oikea sääntö** (toimii kaikille 197:lle): yritä
`new TextDecoder("utf-8", { fatal: true })`; jos heittää → `windows-1252`.
Sen jälkeen cheerio purkaa entiteetit (`&auml;`, `&nbsp;`), sitten ` ` → välilyönti
ja `.normalize("NFC")`.

```ts
function decodeHtml(buf: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}
```

**Älä kopioi `scripts/parse-ravintolat.ts`:n `decode()`-funktiota**: se luottaa
ilmoitukseen ja dekoodaa `ruokailulappeenranta.htm`:n euc-kr:nä (`Käy` → `K채y`) ja
jättää `us-ascii`-ilmoituksen UTF-8:ksi vain sattumalta oikein. Suositus integraatiolle:
yhteinen `scripts/lib/decode-html.ts` yllä olevalla logiikalla.

Lähteessä valmiina oleva mojibake: vain `mmtilasto.htm` lippukuvan alt `VenÃ¤jÃ¤n lippu`
(kuva pudotetaan). Muualla 0.

### 0.2 Yleiset HTML-piirteet
- 167/197 on FrontPage-generoitua: `<font face size>`, `<b>`, `<br>`-rivitys,
  kovat rivinvaihdot keskellä virkettä (lähdekoodin rivitys ≠ kappale). Kappale =
  `<br><br>` tai `<p>`; yksittäinen `<br>` on usein vain rivinvaihto.
- Jokaisella sivulla Google Analytics -skripti (`_uacct = "UA-1394129-1"; urchinTracker();`)
  → poista `<script>` ennen tekstin poimintaa.
- `<title>` on usein roskaa ("Uusi sivu 1", "Suunnittelu", "Puun kaadot Pirtillä",
  "Salud") → **älä käytä otsikkona**; otsikko sivun ensimmäisestä isosta/lihavoidusta tekstistä.
- Sivujen yläosassa on sisarsivujen linkkilista (esim. "Kommentit 2005 Kommentit 2006 …"),
  poista se ennen sisällön jäsennystä.
- Taulukoissa FrontPage käyttää sisäkkäisiä `<table>`-rakenteita ja tyhjiä
  välikesarakkeita ("-" maalieron välissä: `26 - 5`). `cheerio`:n `find("tr")`
  poimii myös sisäkkäisten taulukoiden rivit → käytä `> tbody > tr` / `children()`.
- Kuvatekstit ovat muotoa "Paikka pp.kk.vvvv Kuvaus" tai "(Kuva pp.kk.vvvv …)" →
  `caption`; alt `scripts/lib/derive-alt.ts`:llä.
- Päivämäärät `pp.kk.vvvv`, joskus `p.k.` ilman vuotta (arvokisat) tai `pp.kk.-pp.kk.vvvv`
  (aikavälit).

### 0.3 Uudet skeemakentät, joita kannattaa käyttää
- `muutLegacyUrlit` (kaikissa migroitavissa tyypeissä paitsi `uutinen`): kun useampi vanha
  sivu yhdistetään yhteen dokumenttiin, pääsivu `legacyUrl`:iin ja muut tähän.
- Portable Textin `link.href` hyväksyy nyt suhteelliset polut (`/jalkapalloarkisto/…`).
- `jalkapalloTilasto.jarjestys` useiden taulukoiden sivuille, `lisatiedot` taulukon
  jälkeiselle tekstille, `paivitetty` lähteen päivitysmerkinnälle, `kuvat`.

---

## M1 — Uutisarkisto (50 sivua → `uutinen`)

**Lähteet:** `kommentit2005 … Kommentit2022` (26), `blogi2006 … blogi2017` (20),
`kommentitvenaja`, `kommentitvenaja2007`, `kommentitvenaja2008`, `otsikkoarkisto`.

**Rakenteet (kolme aikakautta):**
1. *FrontPage 2005–2013 (kommentit):* merkintä = `<b><font>Otsikko</font></b>` (usein
   `<img align=left>` otsikon sisällä) → leipäteksti `<font size=2>` + `<br>` →
   **lähderivi** `<font size="1">(ESS 12.01.2008)</font>` tai
   `(palloliitto.fi 31.01.2008 / Kuva 17.11.2007)`. Lähderivi päättää merkinnän ja
   antaa päiväyksen + lähteen → `publishedAt`, `lahde.nimi`, kuvan päiväys → `caption`.
2. *Blogi 2006–2015:* sama otsikkorakenne, mutta päättyy riviin
   `/ 12.06.2008 (Kuva 02.06.2008 Berad Sadik)` tai `<small>/&nbsp;07.04.2020&nbsp;</small>`.
   Oma teksti, ei lainattu → kategoria `blogi`, ei `lahde`-kenttää.
3. *Moderni 2017–2022:* `<img alt="Tanska - Suomi 11.06.2021 …">` →
   `<small><small><big>Kuvateksti&nbsp;11.06.2021</big></small></small>` (tämä on
   **kuvateksti**, ei otsikko) → `<strong>Otsikko</strong>` → teksti → lähde
   `(palloliitto.fi .17.11.2021)`.

**Sudenkuopat:**
- **Tiedostonimen vuosi ≠ merkinnän vuosi**: `blogi2017.htm` sisältää merkintöjä 2020.
  Päiväys aina merkinnästä, ei tiedostonimestä.
- Leipätekstissä on päivämääriä ("Teplicen (26.03.2005) valtava järkytys") → päiväys
  vain lähde-/päiväriviltä, ei ensimmäisestä osumasta.
- Lähderivi voi katketa rivinvaihdolla keskeltä (`(Uusi Lahti 16.01.2008 / kuva Kisapuisto\n06.01.2007)`).
- Kirjoitusvirheitä lähteessä (`palloliitto.fi .17.11.2021`) → toleranssi regexiin.
- Lainatut uutiset (ESS, palloliitto.fi, Uusi Lahti, IS Veikkaaja, yle.fi) ovat
  valtaosa `kommentit`-sisällöstä → `lahde.nimi` aina kun lähderivi löytyy.
- **`otsikkoarkisto.htm`**: ~600 riviä muotoa `Otsikko / KLUBI|HISTORIA pp.kk.vvvv`
  + linkki; 390 linkkiä Blogspotiin (`.com` ja `.fi` -domainit sekaisin), loput sisäisiin
  `.htm`-sivuihin. Sama otsikko voi esiintyä kahdesti. Skeema tukee otsikkotynkää:
  `ulkoinenLinkki` asetettu → `excerpt` ja `body` eivät ole pakollisia. **Päätös pääagentilta
  ennen importtia**: luodaanko 390 tynkää vai merkitäänkö sivu `merged` → `/uutiset/arkisto`.
  Sisäisiin sivuihin osoittavat otsikot ovat jo muiden agenttien sisältöä → ei tynkiä niistä.
- `excerpt` ≤ 200 ja `tiivistelma` ≤ 300 merkkiä: ei keksitä, johdetaan ensimmäisistä virkkeistä.
- Kategoria `HISTORIA` → `jalkapallo`; `KLUBI` → ei automaattista kategoriaa, ellei
  avainsana yksiselitteinen (vappu/mölkky/vuosikokous → `tapahtumaraportti`).

## M2 — Huuhkajat (21 sivua → `jalkapalloTilasto` huuhkajat/karsinta)

**Lähteet:** `ottelut2006ja2007 … ottelut2026ja2027` (11), `otteluihin` (hubi),
`arvostelu`, `pelaajatilasto`, `pelaajienottelumaara`, `maaottelut2004_6`, `suomenika`,
`suomenparasavauskokoonpano`, `suomen%20paras%20avauskokoonpano`,
`englanninylintasohuuhkajat`, `unohtumattomat`.

**Rakenteet:**
- *ottelut\*:* (1) karsintalohkon ohjelma tekstinä `pp.kk.vvvv Koti  Vieras 1-0, …`
  (pelit samalla rivillä pilkuin), (2) sarjataulukko `<table>` 9 saraketta:
  `Joukkue O V T H TM - PM P` (sarake "-" on erotin, yhdistä TM–PM yhdeksi "Maalit"-
  sarakkeeksi tai pudota eksplisiittisesti), 1–2 taulukkoa/sivu, (3) otteluraportit
  vapaana tekstinä (kokoonpanot, vaihdot `> 84'` / `-> 68.`, maalit, erotuomari,
  yleisö) → `lisatiedot`. Taulukon rivi 0 on usein jo dataa (ei `<th>`) → otsikot
  on lisättävä itse; merkitse raporttiin.
- *arvostelu:* 8 taulukkoa, sisäkkäisiä (taulukko 0 = 357 riviä sisältää taulukot 1–2);
  pelaajarankingit "01. Teemu Pukki 45" ja ottelukohtaiset avaukset. 82 kuvaa (pelaajat).
- *pelaajatilasto:* 1 taulukko 40×8, otsikko kaksirivinen (colspan: A-maaottelut / maalit).
- *englanninylintasohuuhkajat:* 2 siistiä taulukkoa (22×10, 21×4) otsikkorivillä.
- *suomenparasavauskokoonpano:* 105×6 (Pelaaja / vuodet), 24 kuvaa.

**Sudenkuopat:**
- `pelaajienottelumaara`, `suomenika`, `maaottelut2004_6`, `suomen%20paras%20avauskokoonpano`:
  **data vain kuvina** (kaaviot) → ei voi tehdä tekstitaulukkoa; ehdotus `needsReview` + kuvat
  alt-teksteineen tai `merged` (kirjaa perustelu).
- Kategoria: karsintalohkot → `karsinta` (reitti `/jalkapalloarkisto/karsinnat/[slug]`),
  pelaajatilastot → `huuhkajat`. Slug-ehdotus `karsinta-mm-2010` jne.
- `unohtumattomat`: ottelulista + kuolleet Picasa-linkit → taulukko (`muu`) tai `dropped`.
- `ottelut2018ja2019`, `ottelut2020ja2021`, `ottelut2026ja2027`, `pelaajatilasto` ovat UTF-8,
  `ottelut2024ja2025` UTF-8 vaikka ilmoittaa us-ascii (ks. §0.1).

## M3 — Tilastot (21 sivua → `jalkapalloTilasto`)

**Lähteet ja kategoriat:**

| Sivu | Taulukko | Kategoria |
|---|---|---|
| `fifaranking` | **ei `<table>`** — teksti + uutisote + 5 kuvaa | `fifa-ranking` |
| `suomi` | 121×5 Suomen mestarit | `champions` |
| `suomenvalmentajat` | 31×12, otsikossa päivitys "26.09.2026" → `paivitetty` | `valmentajat` |
| `suomenvalmentajientulot` | ei taulukkoa, uutisteksti | `valmentajien-palkat` (slug `valmentajien-palkat`) |
| `vuodenpelaaja` | 81×6 | `vuoden-pelaaja` |
| `FIFAvuodenpelaaja` | 34×4 | `vuoden-pelaaja` tai `ballon-dor` |
| `euroopan_paras_pelaaja` | 56×4 | `ballon-dor` |
| `maailmanparhaat` | 2 taulukkoa (12×8 vuosisarakkeet, 51×3) | `ballon-dor` |
| `top10jalkapallojarkytykset`, `top10jalkapallosaavutukset` | 12×7, 11×7 | `saavutukset` |
| `lupaavia` | 81×11, kaksi rinnakkaista listaa samassa taulukossa | `lupaavat` |
| `eurocuptilasto` | 2 taulukkoa (35×7, 38×5), 143 kuvaa (seuralogot/liput) | `eurocup` |
| `uefacup` | 70×4 | `uefa-cup` |
| `cupvoittajiencup` | 50×4 | `conference-league` |
| `supercup` | 57×4 | `super-cup` |
| `intercontinental`, `maanosaliittojencup` | 33×4, 17×4 | `intercontinental` |
| `englanti`, `venaja` | 55×8 + 157×4, 96×3 | `ulkomaiset-mestarit` (uusi) |
| `puheenjohtajat` | 18×3 **Palloliiton** puheenjohtajat | `palloliitto` (uusi) |
| `historia` | linkkihubi, ei dataa | → `merged` `/jalkapalloarkisto` |

**Sudenkuopat:**
- Taulukon ensimmäinen rivi on usein **otsikko koko taulukon levyisenä** (colspan):
  "SUOMEN JALKAPALLOMESTARIT", "UEFA CUP -> EUROOPPA-LIIGA" → otsikkoriviksi `title`,
  varsinainen sarakeotsikkorivi on rivi 1 tai puuttuu.
- `lupaavia`: kaksi kautta rinnakkain samoissa riveissä (1980–1986 | 1987–1991) → pura kahdeksi
  taulukoksi tai lisää "Kausi"-sarake; ei saa sekoittaa rivejä.
- `venaja`: puuttuvat solut (vuodet 1941–1943 ilman mestaria) → tyhjä arvo, rivi säilyy.
- `puheenjohtajat`: nykyinen redirect `/klubi/hallitus` on **väärä** (ei klubin hallitus).
- Seuranimen perässä lippukuva (Wikimedia) — pudota kuva, säilytä teksti.
- `fifaranking`, `suomenvalmentajat`, `suomi`, `uefacup`, `venaja` ovat UTF-8;
  `cupvoittajiencup`, `eurocuptilasto` UTF-8 vaikka ilmoittavat us-ascii.

## M4 — Arvokisat & pelaajat (17 sivua → `arvokisa`, `pelaaja`, `jalkapalloTilasto`)

**Lähteet:** `MM2010, MM2014, MM2018, MM2022, MM2026, EM2008, EM2012, EM2016, EM2020,
EM2024` (10), `mmtilasto`, `emtilasto`, `kansojenliiga`, `pikkuhuuhkajat`,
`litmanen`, `litmanenjari`, `litmanenjaripatsas`. (`maailmanparhaat` siirretty M3:lle —
se on vuosittainen tilasto, ei pelaajaprofiili.)

**Rakenteet:**
- Kisasivu alkaa `11.06.-11.07.2010` + `MM-kilpailut Etelä-Afrikka` → `alkuPvm`,
  `loppuPvm` (uudet), `isantamaat`. Sitten `Lohko A` + 9-sarakkeinen sarjataulukko
  (6–8 taulukkoa/sivu → yksi `jalkapalloTilasto` per lohko, kategoria `arvokisa`,
  `jarjestys` = lohkon järjestys, viitataan `arvokisa.tilastot`-kentästä) + lohkon
  ottelut `p.k. Kaupunki` / `Koti - Vieras 1-1`. Jatkopelit tekstinä
  ("Pronssiottelu", "Loppuottelu/Finaali") → `voittaja`, `hopea`, `pronssi` (uudet).
- `MM2026`: ei taulukoita, ottelut päivittäin tekstinä (`11.06.2026` + `A - B 2-0 (1-0)`).
- `mmtilasto` (25×5 Vuosi/Isäntä/Mestari/Hopea/Pronssi), `emtilasto` (18×4),
  `kansojenliiga` (4×5 + lainattuja uutisia iltalehti.fi/iltasanomat.fi) → taulukot
  kategorialla `arvokisa`; mitalitiedot myös rakenteisina kunkin `arvokisa`-dokumentin kenttiin.
- `pikkuhuuhkajat`: U21-EM 2009 → `arvokisa` kisatyypillä `u21-em` (uusi); pelaajaesittelyt
  (`#1 Anssi Jaakkola, AC Siena (ITA)` + kappale) → `kuvaus`.
- Litmanen: `litmanenjari` = päivätyt uutisotteet (`(is.fi 27.10.2025)`) → `pelaaja.kuvaus`;
  `litmanen` = loukkaantumistaulukko 62 riviä → `jalkapalloTilasto` (kategoria `pelaaja`)
  viitattuna `pelaaja.tilastot`-kentästä (uusi); `litmanenjaripatsas` = kuvasivu (16 kuvaa)
  → `muutLegacyUrlit`. Yksi `pelaaja-jari-litmanen`.

**Sudenkuopat:**
- Ottelupäivät `11.6.` ilman vuotta → vuosi kisasta.
- "Lohko" ja kirjain voivat olla eri riveillä (`Lohko\nB`).
- `EM2012, EM2016, MM2010, MM2014, MM2018` ilmoittavat iso-8859-1 mutta ovat ASCII+entiteetit.
- `EM2020`-isäntämaita 12 → `isantamaat` listana.
- `kansojenliiga` kattaa useita kausia: joko yksi `arvokisa` per kausi (vuosi pakollinen!)
  tai yksi kooste → päätös raporttiin. `vuosi` on pakollinen kenttä.
- `pikkuhuuhkajat`-redirect osoittaa nyt `/jalkapalloarkisto/pelaajat` → integraatio päivittää.

## M5 — Stadionit (19 sivua → `stadion`)

**Lähteet:** `stadion*.htm` (15, joista `stadionit` on hubi), `pietarikrestovskystadium`,
`wembleylontoo`, `ateenanolympiastadion`, `puutteellisetjarjestelyt`.

**Rakenteet:** otsikko `Kaupunki Stadion` → osoiterivi (`Tamme puiestee 1, Tartu, Estonia`
→ `address`, uusi kenttä) → `Rakennettu: 1932` / `Otettu käyttöön: 1923` → `openedYear` →
`Kapasiteetti: 1.600` / `90.000` (piste = tuhaterotin!) → `capacity` → kuvat + kuvateksti
`01.06.2012 Tamme Stadium`. Osa sivuista on proosaa (Kisapuisto: historiaa ja
olympiaotteluita 1952) → `description`.

**Kaupungit:** `development`-datasetissa on jo `kaupunki-`: helsinki, lahti, tampere, turku,
tallinna, tarto, ventspils, lontoo, koopenhamina, venaja(!), kreikka(!) … Puuttuvat:
**teplice, moskova, pietari, voru, ateena** → luo `kaupunki-<slug>` ja nimeä raportissa.
Huom: olemassa olevissa on maita (`venaja`, `kreikka`, `belgia`) kaupunkeina → älä viittaa
maahan, luo oikea kaupunki.

**Sudenkuopat:**
- `<title>` on lähes kaikilla "Finnair Stadium" (kopioitu pohja) → älä käytä.
- Slugit täsmälleen redirectien kohteista (esim. `tallinnaalecoq`, `pietarikrestovskystadium`).
- `stadionit.htm` = hubi (maa → kaupunki → stadion -linkkitaulukko) → `merged` listaussivuun.
- `puutteellisetjarjestelyt` ei ole stadion: 67-rivinen taulukko (PVM / järjestely / paikka)
  → `jalkapalloTilasto` kategorialla `muu`; M5 omistaa sen, koska redirect osoittaa
  stadioneihin. Paikka-sarakkeessa stadionin nimi → voi linkittää stadionsivuun.
- `geopoint` vain jos lähteessä koordinaatit — ei ole yhdelläkään sivulla → jätä tyhjäksi,
  älä geokoodaa arvaamalla.

## M6 — Klubi & runko (21 sivua → `sivu`, `klubiToiminta`, singletonit)

**Lähteet:** `etusivu`, `yleista`, `english`, `talkoot`, `vappu`, `molkky`,
`vuosikokous`, `matkailu`, `ilotulitukset`, `jouluruokailu`, `musiikki`,
`venetsialaiset`, `veikkaus`, `veikkausmaaottelujentulos`, `veikkausarvokisat`,
`veikkauspalloveikkaus`, `toriparkki`, `toriparkkilahti`, `Kuu`, `Loiste`, `Salud`.

**klubiToiminta (9):** vuosimerkinnät riveinä:
- `vuosikokous`, `venetsialaiset`: `(11) 11.02.2017 Sibeliustalo (6): Ilpo, Olli, …` →
  `jarjestysnumero` (uusi), `paivamaara`, `paikka`, osallistujamäärä, `osallistujat` (uusi).
- `talkoot`: `28.10.2000 Koivun kaato, Kyminpirtti (lisätietoa)` → `otsikko` (uusi),
  `paikka`, `kuvaus`.
- `vappu`: `01.05.2011 (5) Ilpo, Olli, … (Kuohuviini / maa)` → `osallistujat`, `kuvaus`.
- `molkky`: `25.07.2026 Kyminpirtti / 38 (20)` + `1.Simo 2.Ossi 3.Roosa`; **37 taulukkoa**
  (kierroskohtaiset pisteet per kisa, 2 kisaa/vuosi, + kaikkien aikojen taulukko 35×22)
  → `jalkapalloTilasto` kategoria `klubi`, viitataan `klubiToiminta.tilastot` (uusi).
  Nimissä lähteen typo `llpo` (pieni L) = Ilpo → normalisoi ja kirjaa.
- `jouluruokailu`: rivit `23.12.2001 (06) Sichuan Panda* (Ilpo, …)` + 2 taulukkoa
  (osallistujat, ravintolat) → `klubi`-tilastot. Ravintolan nimi voi viitata `ravintola`-
  dokumenttiin — vain tekstinä, ei referenssikenttää.
- `matkailu`: `2008 Ateena / Kreikka` → vuosimerkinnät.
- `musiikki`, `ilotulitukset`: lähes tyhjiä (otsikko + 1 kuva) → luo, `needsReview`, tai merged.
- `<title>` kaikilla "Puun kaadot Pirtillä" → älä käytä.

**sivu:** `yleista` → slug `klubi` (tarkista `app/(public)/klubi` odottama slug),
`english` → `english`, palloveikkaus → `klubi/palloveikkaus`. `toriparkki` (50 kuvaa,
päivätyt kuvatekstit `(725/50) Lahden tori Vappuna`) + `toriparkkilahti` (tekniset tiedot)
→ yksi `sivu`, toinen `muutLegacyUrlit`. Huom: `sivu`-slugin ensimmäinen osa ei saa olla
`jalkapalloarkisto`, `uutiset`, `ravintolat` ym. (skeeman validointi).

**Palloveikkaus:** `veikkausmaaottelujentulos` (88×31 + säännöt-taulukko ilman soluja),
`veikkausarvokisat` (13 taulukkoa, yksi 92×**421** sarakkeen sisäkkäinen kehys →
käytä vain sisimpiä taulukoita), `veikkauspalloveikkaus` (22 taulukkoa/kausi, UTF-8 vaikka
ilmoittaa us-ascii) → `jalkapalloTilasto` kategoria `klubi`, viitataan `sivu.tilastot` (uusi).

**Singletonit:**
- `etusivu`: `etusivu.htm` sisältää "Viimeiset" (3 uusinta otsikkoarkiston riviä →
  ei tallenneta, lohko hakee uutiset) ja "Seuraavaksi: 29.09.2026 Suomi - Valko-Venäjä,
  Kansojen liiga" + JS-laskurin `2026-09-29T19:00:00` → `seuraavaOttelu { ottelu, kilpailu,
  aika }` (uusi). Hero-tekstit `lib/defaults.ts`:stä.
- `navigaatio`: `lib/defaults.ts`:n rakenne (ei vanhan `links.htm`:n 11 linkkiä).
- `yhteystiedot`: `address`, `postalCode`, `email` ovat nyt varoituksia, eivät virheitä →
  singleton voidaan luoda tyhjänä (vain `city: "Lahti"`); listaa docs/09 "täytä itse".
- `asetukset`: `siteName` pakollinen (initialValue).

**Kuu / Loiste / Salud:** ravintolan päivätyt arviokommentit (menu, arvosanat
"R 2,9 H 2,4 V 2,9"), linkitetty `ruokailuhelsinki`/`ruokailutampere`-sivuilta. Kohde on
jo importattu `ravintola`-dokumentti → **ei `--replace`** (tuhoaisi ravintola-importin
kentät). Vaihtoehdot raporttiin: (a) patch `review` + `muutLegacyUrlit` Sanity-
mutaatiolla, (b) jätä integraatiolle. Nykyinen redirect `/jalkapalloarkisto` on väärä.

---

## Tunnetut riskit
1. Otsikkoarkiston 390 Blogspot-tynkää: sisältöpäätös puuttuu (M1).
2. Kuvina olevat tilastot (4 M2-sivua) eivät täytä "data tekstinä" -sääntöä → needsReview.
3. Uudet kentät eivät vielä renderöidy (ks. docs/05) → §1.6 tekstivertailu voi jäädä alle
   95 %, jos `lisatiedot`/`tilastot`-viittaukset eivät näy sivulla ennen integraatiota.
4. `jalkapalloTilasto`-kyselyt järjestävät `title asc` → lohkot/kaudet väärässä järjestyksessä
   kunnes integraatio lisää `jarjestys`-järjestyksen.
5. `generate-redirects.ts` ei vielä lue `muutLegacyUrlit`-kenttää (integraatio).
