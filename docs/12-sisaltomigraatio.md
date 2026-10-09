# 12 — Sisältömigraatio: maali ja agenttitiimi

> **Tarkoitus:** viedä vanhan sivuston koko sisältö Sanityyn niin, että jokainen
> 198 vanhasta sivusta on joko migroitu, yhdistetty toiseen tai tietoisesti
> jätetty pois — kirjattuna, ei unohdettuna. Tämä on `docs/11` §11:n **vaihe 4**.
> Dokumentti on sopimus agenteille; poikkeama kirjataan tänne ensin.
>
> Laadittu 2026-09-27. Ravintolat (497), kaupungit (44) ja ravintolakuvat (448)
> on jo migroitu — ne ovat tämän suunnitelman **referenssitoteutus**.

---

## 0. Päätökset (lukittu 2026-09-27)

| Kysymys | Päätös |
|---|---|
| Kohdedataset | **`development`**. Julkaisussa koko sisältö kopioidaan kerralla: `npx sanity dataset copy development production`. |
| Lähdedata | Crawlataan tällä koneella uudelleen (`npm run crawl`, `npm run images`) → `data/raw-html/`. Parserit ajetaan **paikallista kopiota vasten, ei verkkoa**. |
| Blogspot | **Ei tässä vaiheessa.** Linkit säilyvät ulkoisina. → Toteutettu erillisenä: docs/14 (2026-09-28). |
| Import | Agentit importtaavat itse `development`-datasetiin. Deterministiset `_id`:t + `--replace` → ajo on toistettava ja peruttava. |
| Tuotanto | `production`-datasettiin **ei kirjoiteta** tämän suunnitelman aikana. |

---

## 1. Maali — mitattava "valmis"

Migraatio on valmis kun **kaikki** seuraavat ovat totta. Jokainen kohta on
tarkistettavissa skriptillä tai kyselyllä, ei mielipiteellä.

### 1.1 Kattavuus
- [ ] **198/198** vanhaa URL:ia on `data/coverage.tsv`:ssä tilalla `migrated`,
      `merged` (yhdistetty toiseen dokumenttiin, kohde nimetty) tai `dropped`
      (perustelu kirjattu). Tila `unknown` = 0.
- [ ] Jokaisella migroidulla dokumentilla on `legacyUrl`.
- [ ] Sisältötyyppien määrät vastaavat lähdettä (taulukko §3, sarake "Odotettu").

### 1.2 Oikeellisuus
- [ ] **0 mojibakea**: ei merkkijonoja `Ã¤`, `Ã¶`, `Ã…`, `â€`, `&auml;`, `&nbsp;`,
      `�` missään tekstikentässä. (Vanha FrontPage-sivusto on osin
      `windows-1252`-koodattu — koodaus tunnistetaan `<meta charset>`:sta, ei oleteta.)
- [ ] **0 tyhjää pakollista kenttää** (skeeman `required`-säännöt).
- [ ] Taulukot: jokaisen `jalkapalloTilasto`-dokumentin rivimäärä = lähdetaulukon
      datarivien määrä; sarakemäärä yhtenäinen kaikilla riveillä.
- [ ] Päivämäärät ISO-muodossa; ei tulevaisuuden päiväyksiä arkistosisällössä.
- [ ] Epävarmat kohdat merkitty `needsReview: true` — ei arvattu hiljaa.
      Tavoite: < 5 % dokumenteista tyypeittäin.

### 1.3 Kuvat
- [ ] Jokainen **sisältökuva** (ei navigaationappeja, välikkeitä, laskureita,
      FrontPage-teemagrafiikkaa) on Sanityssa ja liitetty omistajadokumenttiinsa.
- [ ] Jokaisella kuvalla on kuvaava `alt` (ei tiedostonimeä, ei "kuva").
- [ ] Pudotetut kuvat listattu perusteluineen `data/normalized/kuvat-dropped.json`.

### 1.4 Toistettavuus
- [ ] Jokainen putki ajettavissa `npm run migrate:<tyyppi>` ja kaksi peräkkäistä
      ajoa tuottavat **tavulleen saman** NDJSON:n.
- [ ] Parserit ovat CMS-riippumattomia (`data/normalized/*.json`), import on
      ohut adapteri (kuten `scripts/import-ravintolat.ts`).

### 1.5 Sivusto
- [ ] `npm run type-check && npm run lint && npm run build` puhdas.
- [ ] `npm run verify:redirects` → **199/199** ohjautuu **ja 0 osoittaa sivulle
      jolla ei ole sisältöä** (docs/11 §10b: nyt 37).
- [ ] Jokainen migroitu dokumentti renderöityy omalla reitillään HTTP 200:lla
      ja sivulla näkyy dokumentin otsikko (skripti käy kaikki läpi).
- [ ] Singletonit (`etusivu`, `navigaatio`, `asetukset`, `yhteystiedot`) ovat
      olemassa, joten sivusto ei enää nojaa `lib/defaults.ts`:n fallbackeihin.

### 1.6 Laatu (satunnaisotanta)
- [ ] QA-agentti vertaa **10 % dokumenteista** (vähintään 3 per tyyppi) vanhaa
      sivua uuteen renderöityyn sivuun: tekstisisällön kattavuus ≥ 95 %
      (normalisoitu sanavertailu), taulukot rivilleen samat.

---

## 2. Yhteinen putki (kaikki agentit)

Sama malli kuin ravintoloilla — **älä keksi uutta**:

```
data/raw-html/*.htm
   │  scripts/parse-<tyyppi>.ts        ← jäsennys, CMS-riippumaton
   ▼
data/normalized/<tyyppi>.json          ← + <tyyppi>-report.json (määrät, needsReview-syyt)
   │  scripts/import-<tyyppi>.ts       ← ohut Sanity-adapteri
   ▼
data/migration-<tyyppi>.ndjson
   │  npx sanity dataset import … development --replace
   ▼
Sanity (development)
```

### 2.1 Pakolliset käytännöt
1. **Deterministinen `_id`**: `<tyyppi>-<slug>`. Ei satunnaisia ID:itä, ei `drafts.`-etuliitettä.
2. **Slugit täsmälleen samat kuin `lib/redirects.ts`:n kohteissa.** Jos parempi slug
   on perusteltu, se kirjataan raporttiin ja integraatiovaihe päivittää ohjauksen.
3. **Portable Text** rakennetaan puhtaasta HTML:stä: otsikot → `h2/h3`, listat → listat,
   linkit → `link`-annotaatio. Sisäiset `.htm`-linkit muunnetaan uusiksi poluiksi
   `lib/redirects.ts`:n kautta. Ei `<font>`/`<b>`-jäänteitä, ei tyhjiä lohkoja.
4. **Taulukot** → `jalkapalloTilasto.columns/rows` tai skeeman oma taulukkorakenne.
   Otsikkorivi tunnistetaan (`<th>` tai lihavoitu ensimmäinen rivi); yhdistetyt solut
   (`colspan/rowspan`) puretaan eksplisiittisesti, ei pudoteta.
5. **Kuvat**: käytä `data/normalized/kuvat.json`-inventaariota ja
   `scripts/lib/match-image-owner.ts` + `derive-alt.ts`. Assetit ladataan
   `_sanityAsset: "image@file://…"` -viittauksin; Sanity deduplikoi sisällön hashilla,
   joten rinnakkainen lataus on turvallista.
6. **`tiivistelma`** (≤ 300 merkkiä): johdetaan lähdetekstin ensimmäisistä
   asiavirkkeistä — **ei keksitä faktoja**. Jos lähteessä ei ole sopivaa, jätä tyhjäksi
   ja `needsReview: true`.
7. **`kaupunki`-viittaukset** käyttävät olemassa olevia `kaupunki-<slug>`-dokumentteja.
   Uusi kaupunki luodaan samalla ID-konventiolla ja nimetään raportissa.
8. **Koodaus**: tunnista per tiedosto (`<meta charset>` / BOM), dekoodaa `iconv-lite`llä
   tai `TextDecoder("windows-1252")`:lla; normalisoi Unicode NFC:ksi.

### 2.2 Tiedosto-omistajuus
Agentti kirjoittaa **vain** omiin tiedostoihinsa (§3). Jaetut tiedostot
(`sanity/schemas/**`, `lib/**`, `scripts/lib/**`, `components/**`, `app/**`,
`package.json`) ovat **vain luku** vaiheessa 1. Jos agentti tarvitsee muutosta
jaettuun tiedostoon, se **kirjaa sen raporttiin** eikä tee sitä — integraatio tekee.

### 2.3 Agentin valmiiksi-ilmoitus
Jokainen vaiheen 1 agentti palauttaa:
- lähdesivut → dokumentit -taulukon (täydentää `data/coverage-<tyyppi>.tsv`)
- määrät: parsittu / importattu / needsReview (syineen) / pudotettu (syineen)
- idempotenssitarkistuksen tuloksen (kaksi ajoa, sama hash)
- import-lokin rivimäärän
- jaettuihin tiedostoihin tarvittavat muutokset (tai "ei tarvita")

---

## 3. Agenttitiimi

```
Vaihe 0  Perusta               sekventiaalinen  (pääagentti + skeema-agentti)
   │
   ├────┬────┬────┬────┬────┐
Vaihe 1 M1   M2   M3   M4   M5   M6   rinnakkainen, erilliset tiedostot
   └────┴────┴────┴────┴────┘
   │
Vaihe 2  Integraatio            sekventiaalinen
   │
Vaihe 3  QA-verifiointi         sekventiaalinen, adversariaalinen
```

### Vaihe 0 — Perusta (sekventiaalinen)
**0a. Lähdedata** (pääagentti): `npm run crawl` → 198 sivua; `npm run images` →
kuvainventaario. Tarkistus: `data/crawl-status.tsv` 198 riviä, kaikki 200.

**0b. Skeemakatselmus** (`cms-architecture-agent`): lukee otoksen jokaisesta
sivuperheestä ja varmistaa, että skeemoissa on kenttä **jokaiselle** lähdedatan
tiedolle. Lisää puuttuvat kentät, ajaa `npm run typegen` ja `type-check`.
Tämän jälkeen `sanity/schemas/**` **jäädytetään** vaiheen 1 ajaksi.
Tuottaa `data/coverage.tsv`-rungon: jokainen 198 URL:sta → vastuuagentti.

### Vaihe 1 — Migraatio (6 agenttia rinnakkain)

| Agentti | Lähde (vanhat sivut) | Kohde | Odotettu | Omistaa |
|---|---|---|---:|---|
| **M1 Uutisarkisto** | `kommentit*.htm` (28), `blogi*.htm` (19) | `uutinen` | 1 dok / päivätty merkintä | `scripts/{parse,import}-uutiset.ts` |
| **M2 Huuhkajat** | `ottelut*.htm` (11), `arvostelu.htm`, `pelaajatilasto.htm`, `pelaajienottelumaara.htm`, karsinnat, muut Huuhkajat-sivut | `jalkapalloTilasto` (`huuhkajat`, `karsinta`) | 1 dok / lähdetaulukko | `scripts/{parse,import}-huuhkajat.ts` |
| **M3 Tilastot** | `fifaranking`, `suomi`, `suomenvalmentajat*`, `vuodenpelaaja`, `FIFAvuodenpelaaja`, `euroopan_paras_pelaaja`, `top10…`, `lupaavia`, eurocup-sivut (5) | `jalkapalloTilasto` (muut kategoriat) | ~15 | `scripts/{parse,import}-tilastot.ts` |
| **M4 Arvokisat & pelaajat** | `MM20*`, `EM20*`, `mmtilasto`, `emtilasto`, `kansojenliiga`, `litmanen*`, `pikkuhuuhkajat`, `maailmanparhaat` | `arvokisa`, `pelaaja` | ~12 + ~6 | `scripts/{parse,import}-arvokisat.ts` |
| **M5 Stadionit** | `stadion*.htm` (15) | `stadion` (+ `kaupunki`-viittaus, geopoint jos lähteessä) | 14 + hub-sisältö | `scripts/{parse,import}-stadionit.ts` |
| **M6 Klubi & runko** | `yleista`, `english`, toimintasivut (talkoot, vappu, mölkky, …), `veikkaus*` (4), `etusivu` | `sivu`, `klubiToiminta`, singletonit `etusivu`/`navigaatio`/`asetukset`/`yhteystiedot` | ~10 + 4 + 4 | `scripts/{parse,import}-klubi.ts` |

Jokaisen agentin omistukseen kuuluvat myös vastaavat `data/normalized/<tyyppi>*.json`,
`data/migration-<tyyppi>.ndjson` ja `data/coverage-<tyyppi>.tsv`.

**Tyyppikohtaiset säännöt:**

- **M1** — Yksi `uutinen` per päivätty merkintä, ei per vuosisivu. `publishedAt`
  merkinnän päivästä (klo 12:00 Europe/Helsinki, jos kellonaikaa ei ole);
  slug `YYYY-MM-DD-<otsikko>`, duplikaateille `-2`. `excerpt` ≤ 200 merkkiä.
  `categories` johdetaan avainsanoista (`jalkapallo`, `tapahtumaraportti`, …)
  vain kun osuma on yksiselitteinen. Merkinnät ilman päiväystä → `needsReview`.
  `legacyUrl` = vuosisivu (moni dokumentti voi jakaa saman; integraatio ohjaa
  vuosisivun `/uutiset/arkisto/<vuosi>`-näkymään).
- **M2/M3** — Data tekstinä, ei kuvina (docs/11 §7.3). Sarakkeen `type`
  (`number`/`date`/`year`/`link`/`text`) päätellään koko sarakkeesta. Lähteet
  `sources`-kenttään. Valmentajien palkat erillisenä dokumenttina
  (`valmentajien-palkat`).
- **M4** — `arvokisa.vuosi`, `kisatyyppi`, `isantamaat`, `voittaja`,
  `suomenSijoitus` poimitaan rakenteisena; loppu `kuvaus`-Portable Textiksi ja
  taulukot `tilastot`-kenttään. Pelaajien `seurat` rakenteisena listana.
- **M5** — Slugit `docs/11` §10b:n mukaan täsmälleen redirectien kohteista.
  Kapasiteetti ja avausvuosi numeroina vain jos lähteessä yksiselitteisesti.
- **M6** — Singletonien sisältö **vain vanhalta sivustolta tai
  `lib/defaults.ts`:stä**, ei keksittyä. Yhteystiedot, Y-tunnus, IBAN, hallitus,
  säännöt ja jäsenmaksut jätetään tyhjiksi → listataan `docs/09-editor-guide.md`:n
  "täytä itse" -osioon. Navigaatio vastaa nykyistä `lib/defaults.ts`:n rakennetta.

### Vaihe 2 — Integraatio (sekventiaalinen, 1 agentti)
1. Kokoaa `data/coverage-*.tsv` → `data/coverage.tsv`; `unknown` = 0 tai epäonnistuu.
2. Toteuttaa vaiheen 1 raporttien pyytämät jaetut muutokset (skeema, kyselyt, komponentit).
3. Päivittää `scripts/generate-redirects.ts`:n lukemaan kohteet Sanityn
   `legacyUrl`-kentistä (auktoritatiivinen), manuaalinen CSV ohittaa.
4. `npm run redirects && npm run verify:redirects` → 199/199, 0 tyhjään kohteeseen.
5. Lisää `package.json`:iin `migrate:<tyyppi>`- ja `migrate:all`-skriptit.
6. `npm run typegen && npm run type-check && npm run lint && npm run build`.
7. Renderöintiskripti `scripts/verify-content-routes.ts`: jokainen dokumentti →
   reitti → HTTP 200 + otsikko sivulla.
8. Päivittää `docs/06`, `docs/01` (tila), `docs/09` (täytä itse -lista).

### Vaihe 3 — QA-verifiointi (sekventiaalinen, 1 agentti, adversariaalinen)
Ei korjaa — **etsii virheitä** ja raportoi ne todisteineen:
- §1.2 mojibake- ja tyhjäkenttäkyselyt Sanityyn (GROQ, `match`-haut)
- §1.6 satunnaisotanta vanha vs. uusi -tekstivertailu
- taulukkojen rivimäärät lähdettä vasten
- kuvien alt-tekstit: ei tiedostonimiä, ei geneerisiä
- saavutettavuus migroiduilla sivuilla (otsikkohierarkia, taulukoiden `caption`/`th scope`)

Löydökset → pääagentti korjauttaa omistaja-agentilla ja ajaa putken uudelleen
(idempotentti). Maali saavutettu, kun QA:n kriittisiä löydöksiä = 0.

---

## 4. Riskit ja hallinta

| Riski | Hallinta |
|---|---|
| Uutisarkiston merkintärakenne epäsäännöllinen | M1 raportoi jäsennysprosentin; alle 90 % → pysähtyy ja raportoi mallit ennen importtia |
| Sanityn free-tierin dokumenttiraja (10 000) | Taulukkorivit ovat kenttiä, eivät dokumentteja; arvio koko migraatiolle < 2 500 dok |
| Rinnakkaiset agentit luovat saman `kaupunki`-dokumentin | Deterministinen ID → sama dokumentti, `--replace` idempotentti |
| Slugit poikkeavat redirecteistä | Integraatio generoi ohjaukset `legacyUrl`:sta, ei arvaa |
| Koodausvirheet (windows-1252) | Tunnistus per tiedosto + QA:n mojibake-kysely portissa |
| Keksitty sisältö (tiivistelmät, singletonit) | Sääntö §2.1.6 ja M6: vain lähteestä; muuten tyhjä + `needsReview` |

## 5. Julkaisun jälkeen (ei tässä suunnitelmassa)
`dataset copy development production`, Vercelin ympäristömuuttujat, DNS,
Search Console, Blogspot-migraatio erillisenä projektina.

---

## Toteutunut tilanne (2026-09-27, korjauskierroksen jälkeen)

Vaiheet 0–2 ja QA:n (vaihe 3) ensimmäisen kierroksen korjauskierros on tehty.
Luvut on mitattu development-datasetista ja tuotantobuildista (`next start -p 3100`)
korjauskierroksen jälkeen. Suluissa on edellinen luku, kun se muuttui.

### §1 tarkistuslista mitattuna

| Kohta | Tila | Mitattu |
|---|:---:|---|
| 1.1 Kattavuus 198/198 | ✅ | `data/coverage.tsv`: 176 migrated, 19 merged, 3 dropped, **0 unknown**. Kaikki 305 kohde-id:tä löytyvät Sanitysta. |
| 1.1 legacyUrl jokaisella | ✅ | 0 migroitua dokumenttia ilman `legacyUrl`:ia (953 dokumenttia 9 tyypistä). Etusivu-singleton sai arvon `/etusivu.htm`. |
| 1.1 Määrät vs. odotettu | ✅* | uutinen 222, jalkapalloTilasto 187, arvokisa 15, pelaaja 1, stadion 17, sivu 4, klubiToiminta 9, singletonit 4, ravintola **498** (497), kaupunki **92** (49). *Pelaajia on 1 (M4:n päätös, ks. edellinen kierros). Kaupunkeja on enemmän, koska kaupunki johdetaan nyt postitoimipaikasta eikä sivun aluenimestä. |
| 1.2 Mojibake 0 | ✅ | 0 osumaa 1 048 dokumentissa (mojibake, HTML-entiteetit, C1-ohjausmerkit, U+FFFD). Näkymättömiä merkkejä (U+200B ym.) 0 (4). |
| 1.2 Pakolliset kentät | ✅ | `sanity documents validate`: 1 048 dokumenttia, **0 virhettä**. Varoituksia on 3, kaikki yhteystiedot-singletonissa (isä täyttää). Ravintolan postinumerosääntö hyväksyy nyt ulkomaiset muodot, joten 18 aiheetonta varoitusta poistui. |
| 1.2 Taulukot | ✅ | 187 taulukkoa, 2 815 riviä, 0 rakennevirhettä. Maanosaliittojen cupista on poistettu tyhjät tulevat vuosirivit (nyt 11 riviä). |
| 1.2 Päivämäärät ISO | ✅ | 468/468 päivämääräsarakkeen solua on ISO-muodossa (ennen 401 oli muodossa DD.MM.YYYY). Aikavälit on tallennettu ISO 8601 -väleinä (`2009-01-30/2009-02-01`). Lukusoluista 6 659/6 659 on kokonaislukuja ilman välilyöntierotinta. Tulevaisuuden päiväyksiä 0. Ravintolakäyntejä 1 059, eikä yhdenkään tiivistelmä ole ristiriidassa käyntien kanssa. |
| 1.2 needsReview < 5 % | ❌ | uutinen 31/222 = 14,0 % (28), jalkapalloTilasto 10/187 = 5,3 %, stadion 3/17 = 17,6 % (1), klubiToiminta 2/9 = 22,2 %, pelaaja 1/1, ravintola 22/498 = 4,4 % (10), arvokisa 0, sivu 0. Osuus nousi, koska aiemmin hiljaa ohitetut tapaukset merkitään nyt: puuttuva tiivistelmä, lähteen ristiriitainen kapasiteetti ja kaupunki, joka ei selviä lähteestä. Syyt ovat tiedostoissa `data/normalized/*-report.json`, ja lista on docs/09:ssä. |
| 1.3 Sisältökuvat liitetty | ✅ | 1 070 assettia ja 1 119 kuvaliitosta. Ravintolasivujen kuvat on tarkistettu sha1-tiivisteellä: 480 liitetty, 4 pudotettu perusteluineen, **0 hävinnyt** (32). Orpoja assetteja on 2: BMP-kuvien vanhat versiot, jotka korvattiin PNG:llä (ks. Avoimet). |
| 1.3 Alt jokaisella | ✅ | Kuvia ilman alt-tekstiä 0. Katkenneita alt-tekstejä 0 (26), tiedostonimiä 0 (1) ja rikkinäisiä merkistöjä 0. `asetukset.logo`:n alt on "Lahden Suomalainen Klubi ry:n logo". Kuvasta tarkistettu, että se on klubin logo (klubin nimi ja hyppyrimäkitunnus). |
| 1.3 kuvat-dropped.json | ✅ | 216 pudotettua kuvaa perusteluineen (212 + 4 ravintolakuvaa) |
| 1.4 `migrate:<tyyppi>` | ✅ | `npm run migrate:all` on ajettu korjausten jälkeen kahdesti. Kaikki 7 NDJSON:ia, 29 normalisoitua JSON:ia ja `lib/redirects.ts` ovat tavulleen samat (sha256). Esim. ravintolat `456e35c9…` (korjauskierros 2, ks. alla; `migrate:ravintolat` ajettu kahdesti, 6/6 tiedostoa samat), klubi `21e0f283…`, uutiset `7033e605…`. |
| 1.4 Parserit CMS-riippumattomia | ✅ | `data/normalized/*.json` → ohut `import-*.ts`. Uusi yhteinen apuri on `scripts/lib/normalize-cell.ts`. |
| 1.5 type-check / lint / build | ✅ | kaikki puhtaita (0 virhettä, 0 varoitusta), 841 staattista sivua |
| 1.5 Ohjaukset 199/199 | ✅ | 199/199 ohjausta toimii ja osoittaa 159 kohteeseen (maa- ja maakuntasuodattimen jälkeen; ennen 149), **0 → 404**. Lähteet: 189 Sanitysta, 9 säännöistä ja 1 sisäinen siirto. |
| 1.5 0 tyhjään kohteeseen | ❌ (1) | Vanhoista .htm-osoitteista **0** vie tyhjälle sivulle. Tyhjätilatarkistus tunnistaa nyt myös `data-empty-state`-merkityt komponentit ja ravintolahakemiston "Ei osumia" -näkymän. Ainoa osuma on sisäinen siirto `/yhteystiedot` → `/klubi/yhteystiedot`: sivu on tyhjä, kunnes isä täyttää yhteystiedot. |
| 1.5 Jokainen dokumentti renderöityy | ✅ | `npm run verify:content`: 953/953 dokumenttia → HTTP 200 ja otsikko näkyy sivulla (795 uniikkia sivua) |
| 1.5 Singletonit | ✅ | `etusivu`, `navigaatio`, `asetukset`, `yhteystiedot` olemassa |
| 1.6 QA-otanta | ⏳ | vaihe 3, toinen kierros |

### Korjauskierros (QA-kierros 1 → korjaukset putkessa)

Kaikki korjaukset on tehty parse- ja import-skripteihin, ja data on tuotu
uudelleen. Sanityssa ei ole paikattu mitään käsin.

- **Ravintolat** (`parse-ravintolat.ts`, `import-ravintolat.ts`, `import-kuvat.ts`):
  - Jäsentämättömiä rivejä 0 (264). Vapaa teksti tallentuu `review`-kenttään (25 ravintolaa).
  - Käyntipäiviä ei enää katoa arvosanarivin perästä, ja lyhyt päiväys d.m.yyyy tunnistetaan.
  - Kaupunki päätellään postitoimipaikasta. Postitoimipaikasta poikkeavia kaupunkiviitteitä 0 (69).
  - `closedNote` ei katkea ensimmäiseen pisteeseen (katkenneita 0/39).
  - Slug muuttui 22 ravintolalla. Vanhat dokumentit siivottiin, eikä mikään viitannut niihin.
  - **Korjauskierros 2 (Sarastro):** `ruokailusavonlinna.htm`:n "(09) 24.07.2025 Sarastro" puuttui, koska
    se on lähteessä hajanaisen `</td>`:n jälkeen: HTML-jäsennin siirtää sen taulukon ulkopuolelle, ja
    jäsennin luki vain sisimmät td/p-solut. Nyt myös solujen ulkopuolinen sisältö luetaan ja kappaleet
    järjestetään lähteen merkkipaikan mukaan. **Turvaverkko:** jokaisen sivun "(NN)"-otsakkeet lasketaan
    raaka-HTML:stä ja verrataan jäsennettyihin (määrä ja järjestys). Ero → `ravintolat.json` jää
    kirjoittamatta ja ajo päättyy exit 1 (`ravintola-report.json` → `otsakeErot`). Lähteessä 498 = jäsennetty 498.
    Muiden 497 ravintolan jäsennys on tavulleen sama.
  - Kuvan omistaja: pelkkä kaupunkiosuma ei enää riitä (`match-image-owner.ts`, vaihe 3). Sarastron
    kuva siirtyi Valolta Sarastrolle. Muiden 479 liitoksen omistaja ei muuttunut.
  - Alt-tekstin päiväys, joka ei vastaa tiedostonimen päiväystä eikä käyntejä, merkitään
    `needsReview`-lipulla. Lähteen alt säilyy, ja syy kirjataan `ravintola-kuvat.json`:iin (`altHuomiot`).
    Osumia on 12, esim. Sarastro "24.07.2023" (kuva ja käynti 24.07.2025). Neljän kuvan alt nimeää eri
    ravintolan: Eliel "Huuva", Megobaro ja Retro Enoteca "Bardot", Promenada "Pannoteka".
- **Kuvat** (`download-images.ts`, `derive-alt.ts`, `match-image-owner.ts`):
  - Alt-teksti ei enää katkea heittomerkkiin, ja tiedostonimenä olleet alt-tekstit on korvattu.
  - Liittämättömät kuvat kirjataan tiedostoon `ravintola-kuvat-dropped.json`, ja import epäonnistuu, jos kuva häviää.
  - BMP-kuvat muunnetaan PNG:ksi.
- **Taulukot** (`normalize-cell.ts`, kaikki viisi tilastoputkea):
  - Päivämäärät muunnetaan ISO-muotoon.
  - Tuhaterottimet poistetaan.
  - Näkymättömät merkit poistetaan.
  - Tyhjät tulevat vuosirivit poistetaan.
  - Stadionin kapasiteetin ristiriita lähteessä merkitään `needsReview`-lipulla.
- **Klubi**:
  - Matkakuvausten ja videon linkit tallentuvat rakenteisena `vuodet[].linkki`-kenttään (25 kpl) eivätkä tekstinä.
  - Lähteen osallistujamäärät (n) täsmäävät nimilistoihin 70/70.
  - Etusivun `legacyUrl` on `/etusivu.htm`, ja logon alt tulee parserista.
- **Uutiset**:
  - Tiivistelmä johdetaan parserissa kokonaisista virkkeistä. Ilman tiivistelmää ja ilman needsReview-lippua 0 (44).
  - Useilla vanhoilla sivuilla toistuneilla uutisilla on `muutLegacyUrlit`-kenttä (3).
  - Kansikuvan kuvateksti näkyy `<figcaption>`-elementissä (127/127).

**Integraation jaetut muutokset:**

- Skeemat:
  - `klubiToiminta.vuodet[].linkki` { url, teksti }
  - `uutinen.muutLegacyUrlit`
  - `etusivu.legacyUrl`
  - `asetukset.logo.alt` (pakollinen, kun logo on asetettu)
  - Ravintolan postinumerosääntö hyväksyy ulkomaiset muodot.
  - `npm run typegen` on ajettu.
- Kysely ja sivu:
  - `klubi.ts` hakee `linkki`-kentän.
  - Toimintasivu näyttää linkin (`<a>`) ja osallistujamäärän muodossa "Osallistujat (5): …".
  - Vuosiosion sisennys on korjattu.
- `components/ui/stat-table.tsx`:
  - ISO-päivä näkyy muodossa `pp.kk.vvvv`, kuukausi muodossa `kk/vvvv` ja väli muodossa `30.01.–01.02.2009`, kaikki `<time dateTime>`-elementissä.
  - Lukusarakkeissa on fi-FI-tuhaterotin (`61 035`, sitova välilyönti). Vuosisarakkeissa ei ole.
- `lib/path.ts`: `etusivu` → `/`.
- Ohjaukset (`generate-redirects.ts`):
  - Vanhan ravintolasivun kohde lasketaan siitä, mihin kaupunkeihin sivun ravintolat Sanityssa viittaavat. Jos yli puolet ravintoloista on samassa kaupungissa, kohde on `?kaupunki=<slug>`, muuten koko `/ravintolat`.
  - Näin 22 vanhaa alueparametria (uusimaa, saksa, venaja …), jotka eivät osuneet yhteenkään ravintolaan, eivät enää vie tyhjälle listalle.
  - Esimerkkejä: ruokailuvenaja.htm → Pietari (23/35), ruokailulappi.htm → Sirkka (7/7), ruokailuuusimaa.htm → /ravintolat (24 ravintolaa 8 kaupungissa).
- Tyhjätilat:
  - /klubi/hallitus, /klubi/saannot, /klubi/yhteystiedot, /klubi/palloveikkaus ja /tapahtumat näyttävät kävijälle asiallisen tekstin eivätkä Studion käyttöohjetta.
  - /tapahtumat ohjaa klubin toimintasivuille.
  - Linkit säilyvät, ja täytettävät kohdat on listattu docs/09:ssä.
- `package.json`: production-datasettiin kirjoittava `import-sanity`-skripti on poistettu.
- `/jalkapalloarkisto/ulkomaiset-mestarit`: kaikilla 317 `<th>`-elementillä on `scope`. QA:n kolme osumaa olivat `<thead>`-elementtejä, joten löydös oli väärä hälytys.

### Vaiheen 2 muutokset

- **Merkistövika korjattu kaikista putkista.** Noden `TextDecoder("windows-1252")`
  tuotti C1-ohjausmerkkejä (109 merkkiä 20 dokumentissa: 16 uutista, 3 karsintaa, U21-EM 2009).
  Yhteinen `scripts/lib/decode-html.ts` käyttää omaa taulukkoa. M1, M2 ja M4 on
  tuotu uudelleen. Ravintolakuvien 12 purkamatonta entiteettiä on korjattu (`import-kuvat.ts`).
- **Ohjaukset Sanitysta:** `generate-redirects.ts` lukee `legacyUrl`- ja
  `muutLegacyUrlit`-kentät, ja reitti tulee `lib/path.ts`:n `documentRoute`-funktiosta
  (sama funktio kuin sitemapissa ja renderöintitarkistuksessa). 144 ohjausta tulee
  Sanitysta, 54 säännöistä (kehykset, hubit, kaupunkisivut) ja 1 on sisäinen siirto.
- **Uudet reitit:** `/jalkapalloarkisto/ulkomaiset-mestarit`, `/jalkapalloarkisto/palloliitto`
  ja `/jalkapalloarkisto/tilastot` (+ `/[slug]` kategorialle `muu`). Lisäksi osionavigaatio
  ja hubikortit.
- **Renderöinti:** tilastoissa näkyvät `lisatiedot`, `kuvat` (rajaamattomina),
  `paivitetty` ja järjestys `jarjestys`. Tekstitilastoissa ei ole tyhjän taulukon ilmoitusta.
  Arvokisoissa näkyvät ajankohta, hopea ja pronssi, lohkotaulukot ankkureineen ja
  mitalitaulukot listaussivulla. Pelaajan, toimintamuodon ja klubisivun tilastot
  näkyvät, samoin vuosimerkintöjen otsikko, järjestysnumero ja osallistujat. Uutisissa
  näkyvät lähde ja alkuperäinen linkki, ja tiivistelmää ei toisteta ingressinä, jos
  se on leipätekstin alku. Stadionin osoite, ISO-päivät taulukoissa (`<time>`)
  ja etusivun "Seuraavaksi"-ottelu näkyvät.
- **Kuu, Loiste ja Salud:** arviot ja 9 kuvaa on liitetty ravintoladokumentteihin
  (`scripts/patch-ravintola-arviot.ts`, idempotentti), ja vanhat osoitteet ovat
  `muutLegacyUrlit`-kentässä.
- **Korjatut viat:** sitemap listasi kaikki 187 tilastoa `/karsinnat/`-polkuun
  (nyt vain omat sivut, ja duplikaattiklubisivut poistettu). Footer ja etusivu kaatuivat
  tyhjään yhteystiedot-singletoniin ja `null`-lohkokenttiin. Toimintasivut
  näyttivät "ei vielä lisätty" -tekstin, vaikka vuosimerkintöjä oli.
- **Uudet skriptit:** `build-coverage.ts`, `sanity-import.ts` (vain development),
  `patch-ravintola-arviot.ts`, `verify-content-routes.ts`, `verify-migration.ts`.

### Maa- ja maakuntasuodatin (2026-09-27)

Tavoite: vanhat alue- ja maasivut (`ruokailu*.htm`) ohjautuvat näkymään, joka näyttää
kaikki kyseisen sivun ravintolat. Ennen 10 aluesivua meni koko hakemistoon, Mikkeli-sivu
Suonenjoelle (Mikkelin ravintola ei näkynyt) ja Portugali-sivu `?kaupunki=portugali`.

- **Skeema** (`kaupunki.ts`): uusi `maakunta` (19 maakunnan valintalista, tallennettu arvo
  on slug, näkyy vain kun maa on "Suomi", varoitus jos Suomen kaupungilta puuttuu).
  `country` on pakollinen ja validoitu (iso alkukirjain, ei reunavälilyöntejä). Esikatselu
  "Lahti — Päijät-Häme, Suomi". `npm run typegen` ajettu. Maaluettelo: `lib/maakunnat.ts`.
- **Data putkessa**: `scripts/lib/maakunnat.ts` = Tilastokeskuksen kunta–maakuntaluokitus 2025
  (309 kuntaa, eheystarkistus ajossa) + 8 nimettyä taajamaa (Sirkka → Kittilä,
  Pentinmäki → Kurikka, Härmä ja Ylihärmä → Kauhava, Hillosensalmi ja Myllykoski → Kouvola,
  Vääksy → Asikkala, Vierumäki → Heinola). Tuntematon paikkakunta kaataa ajon.
  `import-ravintolat.ts` täyttää maakunnan 41 suomalaiselle kaupungille ja käyttää
  kaupunkien slugeihin yhteistä `lib/slugify.ts`:ää (tulos tavulleen sama). Alueviite
  käyttää nyt parserin maata (ennen alue "Lontoo" olisi saanut maaksi Suomen, jos se
  olisi luotu ensin), ja ristiriitainen maa samalle kaupungille kaataa ajon.
  `import-stadionit.ts` täyttää maakunnan suomalaisille uusille kaupungeille (nyt 0;
  NDJSON tavulleen sama `3ade5dd5…`, uudelleentuontia ei tarvittu).
- **Maa-tason viitteet** (Portugali, Ruotsi, Venäjä: 9 ravintolaa, joiden kaupunki ei selviä
  lähteestä): viite säilyy. Kaupunkisuodatin jättää pois dokumentit, joiden nimi on maan
  nimi (`lib/places.ts` → `isCountryLevelPlace`). Valitsin säännön lippukentän sijaan,
  koska se johdetaan datasta eikä isän tarvitse muistaa ylläpitää erillistä kenttää.
  Stadionien Teplice ja Võru eivät näy, koska facetit listaavat vain paikat, joissa on ravintoloita.
- **Ajot**: `migrate:ravintolat` kahdesti, 7/7 tiedostoa tavulleen samat
  (`migration-ravintolat.ndjson` `3e9e13b4…`). Development: 588 dokumenttia tuotu,
  498 ravintolaa, 92 kaupunkia, 0 kaupunkia ilman maata, 0 Suomen kaupunkia ilman maakuntaa,
  0 ravintolaa ilman kaupunkia. Kuu, Loiste ja Salud: arviot (12/2/13 lohkoa) ja `muutLegacyUrlit` tallella.
- **Kysely** (`queries/ravintolat.ts`): `$countryNames` ja `$maakuntaSlugs` (null = ei rajausta)
  directory- ja count-kyselyihin. Facetit palauttavat paikat (maa, maakunta, määrä), ja
  `buildRavintolatFacets` koostaa maat ja maakunnat ravintolamäärineen (GROQ:ssa ei ole
  ryhmittelyä). `?maa=`-slug muunnetaan nimiksi facettien avulla (`countryNamesForSlug`),
  koska GROQ ei osaa laskea slugia nimestä. Siksi sivu hakee facetit ensin. Tuntematon slug → 0 osumaa.
- **UI**: valikot "Maa" ja "Maakunta" (maakunta vain kun maa on tyhjä tai Suomi), rajausnapit,
  aria-live-tulosmäärä ennallaan, `noindex` rajatuille näkymille. Useampi maakunta
  (`?maakunta=a,b`) näkyy valikossa yhtenä valintana "Uusimaa + Kanta-Häme".
- **Laajennus pyydettyyn**: tasojen kaupunki → maakunta → maa väliin tuli "2–3 maakuntaa".
  Ilman sitä Uusimaa-, Kotka-, Parkano- ja Mikkeli-sivut olisivat menneet näkymään
  `?maa=suomi` (311 ravintolaa), koska jokaisella on yksi ravintola naapurimaakunnassa
  (Riihimäki, Loviisa, Härmä/Ylihärmä/Pentinmäki, Suonenjoki).
- **Lopettaneet**: jos sivulla on lopettaneita ravintoloita, kohteeseen lisätään `lopettaneet=1`.
  Muuten 100 %:n kattavuus ei toteutuisi (oletusnäkymä piilottaa ne).

| Vanha sivu | Uusi kohde | Kattavuus | Näkymässä |
|---|---|---|---|
| ruokailu.htm, ruokailutop5.htm | `/ravintolat` | koostesivu | 459 |
| ruokailubelgia.htm | `/ravintolat?maa=belgia` | 2/2 | 2 |
| ruokailuespanja.htm | `/ravintolat?kaupunki=madrid` | 2/2 | 2 |
| ruokailuhameenlinna.htm | `/ravintolat?kaupunki=hameenlinna` | 6/6 | 6 |
| ruokailuheinola.htm | `/ravintolat?maakunta=paijat-hame` | 2/2 | 74 |
| ruokailuhelsinki.htm | `/ravintolat?kaupunki=helsinki&lopettaneet=1` | 112/112 | 113 |
| ruokailuhollanti.htm | `/ravintolat?kaupunki=den-haag` | 1/1 | 1 |
| ruokailuimatra.htm | `/ravintolat?kaupunki=imatra` | 1/1 | 1 |
| ruokailuirlanti.htm | `/ravintolat?kaupunki=dublin` | 4/4 | 4 |
| ruokailuislanti.htm | `/ravintolat?kaupunki=reykjavik` | 3/3 | 3 |
| ruokailuitalia.htm | `/ravintolat?kaupunki=milano` | 1/1 | 1 |
| ruokailukokkola.htm | `/ravintolat?kaupunki=kokkola` | 2/2 | 2 |
| ruokailukotka.htm | `/ravintolat?maakunta=uusimaa,kymenlaakso` | 9/9 | 133 |
| ruokailukreikka.htm | `/ravintolat?maa=kreikka` | 8/8 | 8 |
| ruokailukroatia.htm | `/ravintolat?kaupunki=zagreb` | 1/1 | 1 |
| ruokailulahti.htm | `/ravintolat?maakunta=paijat-hame&lopettaneet=1` | 94/94 | 96 |
| ruokailulappeenranta.htm | `/ravintolat?maakunta=etela-karjala&lopettaneet=1` | 23/23 | 24 |
| ruokailulappi.htm | `/ravintolat?kaupunki=sirkka` | 7/7 | 7 |
| ruokailulontoo.htm | `/ravintolat?maa=iso-britannia&lopettaneet=1` | 23/23 | 23 |
| ruokailumikkeli.htm | `/ravintolat?maakunta=etela-savo,pohjois-savo&lopettaneet=1` | 3/3 | 12 |
| ruokailuoulu.htm | `/ravintolat?kaupunki=oulu` | 1/1 | 1 |
| ruokailuparkano.htm | `/ravintolat?maakunta=pirkanmaa,etela-pohjanmaa` | 5/5 | 31 |
| ruokailupirkanmaa.htm | `/ravintolat?maakunta=pirkanmaa` | 3/3 | 28 |
| ruokailuportugali.htm | `/ravintolat?maa=portugali` | 6/6 | 6 |
| ruokailupuolavarsova.htm | `/ravintolat?kaupunki=varsova` | 3/3 | 3 |
| ruokailuranska.htm | `/ravintolat?maa=ranska` | 14/14 | 14 |
| ruokailuriika.htm | `/ravintolat?kaupunki=riika` | 2/2 | 2 |
| ruokailuruotsi.htm | `/ravintolat?maa=ruotsi` | 9/9 | 9 |
| ruokailusaksa.htm | `/ravintolat?maa=saksa` | 9/9 | 9 |
| ruokailusavonlinna.htm | `/ravintolat?maakunta=etela-savo` | 9/9 | 9 |
| ruokailuslovakia.htm | `/ravintolat?kaupunki=bratislava` | 3/3 | 3 |
| ruokailuslovenia.htm | `/ravintolat?kaupunki=ljubljana` | 3/3 | 3 |
| ruokailusveitsi.htm | `/ravintolat?kaupunki=zurich` | 2/2 | 2 |
| ruokailutallinna.htm | `/ravintolat?kaupunki=tallinna` | 5/5 | 5 |
| ruokailutampere.htm | `/ravintolat?kaupunki=tampere&lopettaneet=1` | 24/24 | 24 |
| ruokailutanska.htm | `/ravintolat?kaupunki=koopenhamina` | 1/1 | 1 |
| ruokailutarto.htm | `/ravintolat?kaupunki=tarto` | 2/2 | 2 |
| ruokailuTshekki.htm | `/ravintolat?kaupunki=praha` | 5/5 | 5 |
| ruokailuturkki.htm | `/ravintolat?kaupunki=istanbul` | 2/2 | 2 |
| ruokailuturku.htm | `/ravintolat?kaupunki=turku&lopettaneet=1` | 8/8 | 8 |
| ruokailuuusimaa.htm | `/ravintolat?maakunta=uusimaa,kanta-hame` | 24/24 | 132 |
| ruokailuvaasa.htm | `/ravintolat?kaupunki=vaasa` | 15/15 | 15 |
| ruokailuvarsinaissuomi.htm | `/ravintolat?kaupunki=paimio` | 1/1 | 1 |
| ruokailuvenaja.htm | `/ravintolat?maa=venaja` | 35/35 | 35 |
| ruokailuventspils.htm | `/ravintolat?kaupunki=ventspils` | 3/3 | 3 |

"Näkymässä" = ravintolat kohdenäkymässä yhteensä. Muutokset aiempaan (20 ohjausta): esim.
lahti `?kaupunki=lahti` → `?maakunta=paijat-hame&lopettaneet=1` (sivulla on myös Hollolan ravintoloita),
kreikka Ateena → `?maa=kreikka` (Egina mukaan), venaja Pietari (23/35) → `?maa=venaja` (35/35).

**Laatuportit**: type-check 0 virhettä, lint 0 virhettä ja 0 varoitusta, build 841 staattista sivua,
`verify:redirects` (portti 3100) 199/199 toimii, 0 rikki, 0 ilman sisältöä, 1 tyhjätila
(`/yhteystiedot`, ennallaan). `verify:content` 954/954 → HTTP 200, 0 virhettä. `verify-migration`
"Ei kriittisiä löydöksiä". Käsin tarkistettu: `?maa=saksa` 9, `?maakunta=uusimaa` 125,
`?maa=suomi&maakunta=pirkanmaa` 28, `/ruokailumikkeli.htm` → 12 ravintolaa, joista yksi on Huviretki Mikkeli,
`?maa=tuntematon` → tyhjätila "Ei osumia", kaikki `noindex, follow`.

### Avoimet

1. **needsReview-osuus ylittää 5 %** neljällä tyypillä (uutinen, jalkapalloTilasto,
   stadion, klubiToiminta) ja pelaajalla (1/1). Isä tarkistaa 57 kohdetta Studiossa
   (docs/09 "Täytä itse"). Skeemassa ei ole kenttää syylle. Ehdotus
   cms-architecture-agentille: kenttä `needsReviewReason`, jotta syy näkyy Studiossa
   eikä vain tiedostoissa `*-report.json`.
2. **`/klubi/yhteystiedot`** näyttää tyhjätilan, kunnes yhteystiedot täytetään.
   Samoin hallitus, säännöt ja tapahtumat.
3. ~~Ravintolahakemistossa ei ole alue- tai maasuodatinta.~~ Ratkaistu, ks.
   "Maa- ja maakuntasuodatin" yllä. Jäljelle jää tarkkuus: Kotka-sivun (9 ravintolaa)
   näkymä on Uusimaa + Kymenlaakso (133), koska Loviisa on Uudellamaalla.
   Samoin Uusimaa-sivu (24 → 132, sisältää Helsingin). Jos tämä halutaan
   tarkemmaksi, vaihtoehto on useamman kaupungin parametri `?kaupunki=a,b`.
4. **Development-datasetissa on 2 orpoa kuva-assettia** (`image-7f5f4799…-985x554-jpg`,
   `image-9dff22d0…-985x554-jpg`). Ne ovat BMP-lähteiden vanhoja versioita, jotka
   korvattiin PNG:llä, eikä putki luo niitä uudelleen. Ne voi poistaa, tai
   `import-kuvat.ts`:n vaihe 0 voi siivota ne.
5. ~~**Otsikkoarkiston 300 Blogspot-linkkiä** on jäsennetty, mutta niitä ei ole tuotu (§0).~~ Blogin kaikki kirjoitukset tuodaan kokonaisina: docs/14.
6. ~~Kansojen liigan lohkotaulukot (M2) voisi linkittää arvokisojen `tilastot`-kenttään (M4).~~
   Korjattu 6.10.2026 toisin: lohkotaulukko viittaa saman kauden karsintasivuun
   (`kaudenOttelut`), koska ottelut ovat siellä. Karsintasivu näyttää taulukon, ja
   Kansojen liiga -sivu linkittää otteluihin (`npx tsx scripts/kerta/2026-10-06-patch-kansojen-liiga.ts`).
7. MM-kisojen mitalistitaulukossa on tulevia rivejä (2030, 2034), joissa on vain
   isäntämaa. Ne jätettiin, koska isäntä on todellinen tieto. QA päättää, rikkovatko
   ne §1.2:n sääntöä "ei tulevaisuuden päiväyksiä".
8. /klubi/liity näyttää osoitteen info@lahdensuomalainenklubi.com (`lib/defaults.ts`).
   Osoitetta ei ole vanhalla sivustolla, joten isän pitää vahvistaa se.
9. CLAUDE.md:n komentotaulukossa on yhä rivi
   `npx sanity dataset import data/migration.ndjson production`. Se kannattaa
   päivittää muotoon `npm run migrate:all` (development). En muuttanut sitä, koska
   CLAUDE.md on projektin ohje.
