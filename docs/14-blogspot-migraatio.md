# 14 — Blogspot-migraatio: klubin blogi uutisiksi

> **Tarkoitus:** tuoda kaikki klubin Blogspot-blogin kirjoitukset
> (https://lahdensuomalainenklubi.blogspot.com/) sivuston uutisiksi niin, että
> blogista voidaan luopua ilman, että sisältöä, kuvia tai vanhoja linkkejä
> katoaa. Laadittu 2026-09-28. Täydentää docs/12:ta, jonka §0 rajasi blogin
> ensimmäisen migraation ulkopuolelle.

---

## 0. Lähtötilanne ja päätökset

**Blogista ei ollut tuotu mitään.** Sivuston 222 uutista tulevat vanhan sivuston
`kommentit*.htm`- ja `blogi*.htm`-sivuilta. Ne olivat sivuston oma "blogi" eivätkä
Blogspotin kopio. Kaikkien 528 kirjoituksen leipätekstiä verrattiin olemassa
oleviin uutisiin (4 sanan jaksot): **0 osumaa**. Otsikkoarkiston 300
Blogspot-linkkiä oli jäsennetty, mutta niitä ei tuotu (docs/06).

| Kysymys | Päätös | Perustelu |
|---|---|---|
| Sisältötyyppi | **`uutinen`** (ei uutta tyyppiä) | Blogi on klubin uutiskanava. Samassa listassa, arkistossa, haussa, sitemapissa ja RSS:ssä kuin muut uutiset. |
| Lähde | **Bloggerin JSON-syöte**, paikallinen kopio `data/blogspot/` | Syöte antaa koko sisällön, tunnisteet, pysyvän id:n ja aikaleimat rakenteisena. Parseri ajetaan kopiota vasten, ei verkkoa (docs/12 §0). |
| Tunniste | `_id` = `uutinen-blogspot-<Bloggerin id>` | Id ei muutu, vaikka otsikkoa muokattaisiin blogissa → uudelleenajo päivittää, ei monista. |
| Slug | `yyyy-mm-dd-otsikko` kuten muissa uutisissa | Yhtenäiset osoitteet. Lasketaan julkaisujärjestyksessä: uusi kirjoitus ei muuta vanhoja. |
| Kategoriat | Johdetaan blogin tunnisteista taulukolla (`parse-blogspot.ts` → `LABEL_CATEGORIES`), vain yksiselitteiset | Blogissa on 670 tunnistetta (enimmäkseen nimiä). Uudet kategoriat **Palloveikkaus** ja **Matkakuvaus**. Alkuperäiset tunnisteet säilyvät kentässä `blogspot.tunnisteet`. |
| Kommentit (2 140) | **Ei tuoda**. Arkistoidaan paikallisesti (`data/blogspot/comments.json`). | Sivustolla ei ole kommentointia, ja kommenteissa on jäsenten nimiä. Ks. §8: veikkaukset annetaan kommentteina, joten tämä on käyttöönoton ehto. |
| Klubin logo kirjoituksissa | **Pudotetaan** (99 esiintymää) | Logo oli allekirjoituksena noin 70 kirjoituksessa. Uudella sivustolla se on sivupohjassa. |
| Datasetti | `development` kuten docs/12 | `production` päivitetään vasta §6:n mukaisesti. |

---

## 1. Mitä blogissa on (mitattu 2026-09-28)

| | |
|---|---:|
| Kirjoituksia | **528** (31.1.2007 – 27.9.2026), 16–44 vuodessa |
| Kuvia | 748 viittausta, **675 uniikkia** (222 Mt kokoon 2048 px) |
| Kommentteja | **2 140** |
| Tunnisteita | 670 |
| Datataulukoita | 1 (muut `<table>`:t ovat kuvan ja kuvatekstin kääreitä) |
| Upotuksia (iframe, video) | 0 (YouTube-linkkejä 7) |

Suurimmat aiheet tunnisteiden mukaan: ruokailu (114, "TOP 5 ravintolat"),
Huuhkajat (116), palloveikkaus (75 + veikkaus 38), ottelutapahtumat (46),
matkakuvaukset (23), klubin tapahtumat (vappu, mölkky, joulu, kesäjuhla, vuosikokous).

**Blogi on yhä käytössä:** uusin kirjoitus on julkaistu 27.9.2026. Siksi putki on
toistettava (§6).

---

## 2. Putki

Sama malli kuin docs/12 §2:

```
Blogger (JSON-syöte)
   │  npm run blogspot:fetch            scripts/fetch-blogspot.ts        (verkko)
   ▼
data/blogspot/{posts,comments,images}.json + images/     ← paikallinen kopio, gitignore
   │  scripts/parse-blogspot.ts                                          (offline)
   ▼
data/normalized/blogspot.json (+ -report.json)           ← CMS-riippumaton
   │  scripts/import-blogspot.ts        + data/blogspot-alts.json (kuvaukset)
   ▼
data/migration-blogspot.ndjson (+ blogspot-map.json)
   │  scripts/sanity-import.ts          (--replace, tai --missing §6)
   ▼
Sanity development
   │  scripts/patch-blogspot-links.ts   muiden dokumenttien blogilinkit → /uutiset/…
   │  npm run redirects                 /blogspot/<polku> → /uutiset/<slug>
   ▼
npm run verify:blogspot
```

Komennot:

| Tehtävä | Komento |
|---|---|
| Hae blogi paikalliseksi kopioksi | `npm run blogspot:fetch` |
| Koko tuonti (ensimmäinen kerta, `--replace`) | `npm run migrate:blogspot && npm run redirects` |
| Uudet kirjoitukset, säilytä Studion muokkaukset | `npm run sync:blogspot` (→ development) |
| Uudet kirjoitukset productioniin (kuivaharjoitus) | `npm run sync:blogspot:production` |
| … ja vienti (varmuuskopio + `--missing` + tarkistus) | `npm run sync:blogspot:production -- --vie` |
| Tarkista | `npm run verify:blogspot` |

### 2.1 HTML → Portable Text (`parse-blogspot.ts`)

- Kaksi peräkkäistä `<br>`:ää on kappaleraja, yksi `<br>` rivinvaihto kappaleen
  sisällä. Palloveikkauksen sarjataulukot ("01. Ilpo -24 (1)") säilyvät riveinä.
- `<table class="tr-caption-container">` on kuva ja kuvateksti. Kuvatekstiksi tulee
  solun ensimmäinen rivi. Jos kirjoittaja on kirjoittanut tekstiä soluun rivinvaihdon
  jälkeen (esim. "Maailma TOP 5 ravintolat 2020"), se on leipätekstiä kuvan perässä.
- Kokonaan lihavoitu lyhyt rivi ilman loppuvälimerkkiä on väliotsikko `h2`
  (matkakuvausten "Liikkuminen", "Ruokailu"). Wordista liitetty `<h1>`
  luettelorivin ympärillä ei ole otsikko.
- Wordin jäänteet (`<xml>`, `<style>`, `<o:p>`, `font-family`-kääreet) ohitetaan.
- Ainoa datataulukko ("Kuuluuko Islanti tappio …") on muunnettu riveiksi, joissa
  solujen erottimena on ` · `, ja merkitty tarkistettavaksi.
- Kansikuva on kirjoituksen ensimmäinen elementti, jos se on kuva ja kirjoituksessa
  on tekstiä. Pelkän kuvan kirjoituksissa (tervehdykset) kuva jää leipätekstiin,
  koska skeema vaatii sisällön.
- Tiivistelmä: lähteen kokonaiset virkkeet (`scripts/lib/summary.ts`, sama sääntö
  kuin uutisputkessa). Numeroidut rivit eivät kelpaa virkkeiksi. Tarkistettavaksi
  merkitään vain kirjoitus, jossa on proosaa (≥ 200 merkkiä vähintään 60 merkin
  riveinä) mutta ei kelvollista virkettä. Aikataulut ja nimilistat eivät tarvitse
  tiivistelmää.

### 2.2 Linkit (`import-blogspot.ts`)

- Blogin kirjoitus → `/uutiset/<slug>` (linkit kirjoitusten välillä säilyvät sivustolla)
- Blogin muut sivut (tunnisteet, arkistot) → `/uutiset`
- Vanhan sivuston `.htm` → `lib/redirects.ts`:n kohde
- Muut sellaisenaan

---

## 3. Tunnisteet ja alkuperä

Jokaisella tuodulla uutisella on vain luettava kenttä **`blogspot`** (Studiossa
SEO-välilehdellä, "Alkuperäinen Blogspot-kirjoitus"):

| Kenttä | Käyttö |
|---|---|
| `id` | Bloggerin kirjoitus-id: synkronoinnin avain |
| `url` | Alkuperäinen osoite (tieto, ei näytetä kävijälle) |
| `polku` | `/2019/03/milano-euroopan-renessanssin.html`: ohjausten avain (§5) |
| `tunnisteet` | Blogin tunnisteet sellaisenaan |
| `kommentteja` | Kommenttien määrä blogissa |

`legacyUrl` on vanhan sivuston `.htm`-polulle, joten sitä ei käytetä.
`verify-migration.ts` hyväksyy `blogspot.id`:n alkuperäksi, ja
`verify-content-routes.ts` käy nämäkin dokumentit läpi.

---

## 4. Kuvat

- Haetaan Bloggerin kokoparametrilla **2048 px**. Alkuperäiset ovat jopa 4608 px,
  mutta Sanity skaalaa kuvat CDN:ssä, joten isommat tiedostot vain veisivät tilaa.
- Klubin logo (kaksi eri tiedostoa, tunnistetaan sisällön sha1:stä) pudotetaan.
  Pudotukset on kirjattu `blogspot-report.json` → `pudotetutKuvat`.
- **Alt-tekstin lähteet** tärkeysjärjestyksessä (`import-blogspot.ts` → `resolveAlt`):
  1. kirjoittajan kuvateksti, jos siinä on muutakin kuin päiväys (322 kuvaa)
  2. **`data/blogspot-alts.json`**: kuvaus, joka on kirjoitettu katsomalla kuva
     (327 kuvaa). Tiedostonimet, otsikko ja tunnisteet on käytetty kontekstina.
     Henkilöitä ei ole tunnistettu ulkonäöstä, vaan nimi on mukana vain, jos
     tiedostonimi, otsikko tai kuvassa näkyvä teksti kertoo sen. Tiedosto on
     versionhallinnassa ja sitä voi korjata käsin.
  3. lähteen `alt`-attribuutti
  4. tiedostonimi (`scripts/lib/derive-alt.ts`)
  5. kirjoituksen otsikko, jolloin kuva merkitään tarkistettavaksi

---

## 5. Vanhat blogiosoitteet ja linkit

**Ongelma:** blogspot.com-osoitteista ei voi tehdä palvelinohjausta (301), koska
palvelin on Googlen.

**Ratkaisu:** Bloggerin teemaan lisätään yksi yleinen skripti, joka vie kävijän
uudelle sivustolle samaan polkuun `/blogspot`-etuliitteellä. Uusi sivusto kääntää
polun uutiseksi staattisella 308-ohjauksella (`lib/redirects.ts` →
`blogspotRedirects`, generoitu Sanityn `blogspot.polku`-kentistä). Kartoitus pysyy
kokonaan tällä sivustolla: teemaan ei tarvitse koskaan lisätä yksittäisiä osoitteita.

```
lahdensuomalainenklubi.blogspot.com/2019/03/milano-euroopan-renessanssin.html
  → (teeman skripti)  www.lahdensuomalainenklubi.com/blogspot/2019/03/milano-euroopan-renessanssin.html
  → (308)             www.lahdensuomalainenklubi.com/uutiset/2019-03-10-milano-euroopan-…
```

Ohjauslistan jälkeen tuodut kirjoitukset ja blogin muut sivut (etusivu, tunnisteet,
arkistot) hoitaa reitti `app/blogspot/[[...polku]]/route.ts`: se hakee kirjoituksen
Sanitystä `blogspot.polku`-kentällä (308 uutiseen) ja ohjaa muut `/uutiset`-listaan
(307, väliaikainen, jotta myöhemmin tuotu kirjoitus ei jää selaimen välimuistissa
uutislistan taakse). Uusi kirjoitus toimii siis heti viennin jälkeen ilman deployta.
Staattinen lista ei enää sisällä yleissääntöä `/blogspot/:polku*`, koska
next.config-ohjaukset käsitellään ennen reittejä ja se nappaisi uudetkin kirjoitukset.
Mobiiliparametri `?m=1` ei haittaa.

**Teeman muutos (tehdään käyttöönotossa §6, ei ennen):** Blogger → Teema → Muokkaa
HTML:ää → heti `<head>`-tagin jälkeen:

```html
<script>//<![CDATA[
location.replace("https://www.lahdensuomalainenklubi.com/blogspot" + location.pathname);
//]]></script>
```

Google seuraa JavaScript-ohjauksia ja siirtää sivun arvon uuteen osoitteeseen.
Oikea 301 olisi parempi, mutta Blogspotissa se ei ole mahdollista.

**Sivuston sisäiset blogilinkit:** `patch-blogspot-links.ts` kääntää muiden
dokumenttien blogilinkit uutispoluiksi (nyt 23 linkkiä: Klubin toiminta → Matkailu
→ vuosien "Matkakuvaus"-linkit). Se ajetaan myös `migrate:klubi`n lopussa, koska
klubiputki palauttaa alkuperäiset osoitteet. `klubiToiminta.vuodet[].linkki.url`
hyväksyy nyt myös sisäisen polun.

**Otsikkoarkisto:** `import-uutiset.ts --otsikkoarkisto` loisi 300 linkkityngän
samoista kirjoituksista. **Älä käytä lippua**, koska kirjoitukset ovat nyt sivustolla
kokonaisina.

---

## 6. Rinnakkaiselo ja käyttöönotto

Blogi on käytössä, kunnes uusi sivusto julkaistaan ja isä siirtyy kirjoittamaan
Studioon. Siihen asti:

1. **Ennen julkaisua** `npm run migrate:blogspot` voidaan ajaa milloin tahansa.
   Deterministiset id:t ja `--replace` korvaavat edellisen ajon tuloksen.
2. **Kun tuotuja uutisia on muokattu Studiossa**, käytä `npm run sync:blogspot`.
   Se hakee blogin uudelleen ja tuo vain puuttuvat kirjoitukset (`--missing`),
   joten muokkaukset säilyvät. Blogissa muokattuja vanhoja kirjoituksia se ei
   päivitä, ja se on tarkoituksellista.
3. **Productioniin** (isä kirjoittaa vielä blogiin ennen käyttöönottoa):
   1. `npm run sync:blogspot` (blogi → development, ohjauslista päivittyy)
   2. `npm run sync:blogspot:production`: kuivaharjoitus listaa puuttuvat
      kirjoitukset ja kommentit. Mitään ei kirjoiteta.
   3. `npm run sync:blogspot:production -- --vie`: varmuuskopio (`npm run backup`,
      keskeyttää jos epäonnistuu) → vienti `--missing` → tarkistus, että jokainen
      viety dokumentti on productionissa. Tuotannossa jo olevia ei kosketa.
   4. Commitoi `lib/redirects.ts`, jos se muuttui (ei kiireellinen: reitti hoitaa
      uuden kirjoituksen ohjauksen jo ennen deployta).
4. **Käyttöönottopäivä:**
   1. Viimeinen `npm run sync:blogspot`, `npm run verify:blogspot` ja
      `npm run sync:blogspot:production -- --vie`
   2. Deploy
   3. **Ehdoton edellytys ennen vaihetta 5:** domain `www.lahdensuomalainenklubi.com`
      osoittaa Verceliin (docs/17 §C), ja
      `curl -I https://www.lahdensuomalainenklubi.com/blogspot/2019/03/milano-euroopan-renessanssin.html` → 308 uutiseen.
      Jos teeman skripti asennetaan ennen domainin siirtoa, blogin kävijät ohjautuvat
      vanhalle sivustolle, jossa polkua ei ole (404) (docs/16, blogi-1).
   4. Blogiin viimeinen kirjoitus "Klubin blogi on muuttanut" + linkki
   5. Teeman ohjausskripti (§5)
   6. Isä julkaisee tästä eteenpäin Studiossa (docs/09 "Uutisen lisääminen")

> **Varoitus: dev → production -vienti.** CLAUDE.md:n `dataset import … --replace`
> korvaa productionin koko sisällön. Kun isä on aloittanut muokkaamisen
> productionissa, sama komento tuhoaisi hänen muutoksensa. Ensimmäisen julkaisun
> jälkeen uudet migraatiot pitää viedä productioniin dokumenttikohtaisesti
> (`--missing`), ei koko datasettia korvaten.

---

## 7. Tarkistus (`npm run verify:blogspot`)

Käy läpi **kaikki** kirjoitukset, ei otosta:

1. Kattavuus: jokainen blogin kirjoitus on Sanityssa, eikä ylimääräisiä ole.
2. Teksti: lähteen sanoista vähintään 98 % löytyy uutisesta (otsikko, leipäteksti,
   kuvatekstit).
3. Kuvat: määrä = lähteen kuvat − pudotetut logot. Jokaisella on asset ja kuvaava alt.
4. Ei riippuvuuksia blogiin: ei Bloggerin kuvaosoitteita eikä blogilinkkejä missään
   dokumentissa (paitsi alkuperäkenttä).
5. Slugit ovat yksikäsitteisiä kaikkien uutisten kesken.
6. Ei mojibakea.

Lisäksi `verify:content` (jokainen uutinen → HTTP 200) ja `verify:redirects`
(myös 528 blogiohjausta) kattavat blogin dokumentit.

---

## 8. Avoin päätös: kommentit ja veikkaukset

Suunnitelma: **docs/15-veikkaus-ja-kommentit.md**. Blogin kommentit eivät ole sivuseikka. **Palloveikkaus ja voittajaveikkaukset
toimivat kommenttien varassa**: jäsenet jättävät veikkauksensa kommenttina
(esim. "Voittajaveikkaus MM 2026", 9 veikkausta). Uudella sivustolla ei ole
kommentointia. Siksi blogin ohjausta (§5) ei voi ottaa käyttöön ennen kuin
veikkaukselle on korvaaja. Vaihtoehdot:

| Vaihtoehto | Hyvät puolet | Huonot puolet |
|---|---|---|
| **A. Veikkauslomake sivustolle** (skeema `veikkaus`, lomake kuten jäsenhakemus ja ravintola-arvostelut, isä hyväksyy Studiossa) | Kaikki yhdessä paikassa, ei ulkoisia palveluita | Rakennettava (≈ 1 sprintti) |
| B. Blogi jää pelkäksi veikkauskanavaksi, ohjaus vain muille sivuille | Ei rakennettavaa | Kaksi paikkaa, kirjoitukset kahdessa paikassa |
| C. Veikkaukset sähköpostilla tai WhatsAppilla, isä kokoaa tilanteen | Ei rakennettavaa | Käsityötä isälle |

Vanhat kommentit ovat tallessa paikallisessa kopiossa (`data/blogspot/comments.json`,
ei versionhallinnassa). Jos ne halutaan sivustolle (esim. vanhojen
veikkauskierrosten veikkaukset historiana), ne voidaan tuoda myöhemmin
kirjoituskohtaisena arkistona. Kommentoijien nimet pitää silloin huomioida.

---

## 9. Tila

| | |
|---|---|
Mitattu 2026-09-28 development-datasetista ja tuotantobuildista (`next start -p 3100`).

| | |
|---|---|
| Tuonti `development`-datasettiin | ✅ 528 dokumenttia + kuvat |
| `verify:blogspot` | ✅ 528/528, tekstin kattavuus pienin 100,0 %, kuvia 649 (0 ongelmaa), Bloggerin kuvaosoitteita 0, blogilinkkejä muualla 0, päällekkäisiä slugeja 0, mojibake 0 |
| `verify:migration` | ✅ ei kriittisiä. Uutisten needsReview 37/750 = 4,9 % (blogista 6) |
| `verify:content` | ✅ 1 482/1 482 dokumenttia → HTTP 200 ja otsikko näkyy (uutisia 750) |
| `verify:redirects` | ✅ 727/727 (199 vanhaa + 528 blogin), 0 rikki, 0 ilman sisältöä. 1 tyhjätila `/yhteystiedot`, ennallaan |
| Sisäiset blogilinkit | ✅ 23 käännetty (Klubin toiminta → Matkailu). Toinen ajo: 0 |
| Alt-tekstit | 649/649 kuvaavia (322 kuvatekstistä, 327 katsomalla), 0 otsikosta johdettua |
| Toistettavuus | kaksi ajoa → tavulleen sama NDJSON (sha256 `5b4c305c…`) |
| type-check, lint, build | ✅ puhtaat |
| Production | ✅ 528 kirjoitusta ja 502 kommenttia (28.9.). Uudet: `sync:blogspot:production` (§6.3). 30.9.: 1 uusi (29.9.) odottaa vientiä |
| Blogin ohjaus käyttöön | ⏳ käyttöönotossa (§6), edellyttää §8:n päätöstä |

Korjauksia ajon aikana: kahdesti koodattu entiteetti (`fish &amp;amp; chips`) puretaan
parserissa. `sanity-import.ts` ja `patch-blogspot-links.ts` käyttävät
`.env.local`-tokenin puuttuessa Sanity CLI:n kirjautumista
(`scripts/lib/sanity-token.ts`).
