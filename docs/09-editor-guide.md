# 09 — Sivuston päivittäjän opas (isälle)

> **Tämä opas on tarkoitettu Lahden Suomalainen Klubi ry:n sihteerille / sivuston päivittäjälle.** Et tarvitse ohjelmointitaitoja. Kaikki sisältö muokataan visuaalisessa editorissa (Sanity Studio).

## Tärkeät linkit

| | |
|---|---|
| Julkinen sivusto | https://www.lahdensuomalainenklubi.com |
| Sisältöeditori (Studio) | https://www.lahdensuomalainenklubi.com/studio |
| Apu / yhteyshenkilö | (poika, puh / sähköposti) |

## Kirjautuminen Studioon

1. Avaa `https://www.lahdensuomalainenklubi.com/studio`
2. Klikkaa **"Continue with Google"** ja kirjaudu yhdistyksen Google-tilillä — tai sähköpostilinkillä
3. Näet Studion etusivun: vasemmalla valikko, oikealla muokattava sisältö

> **Vinkki:** Tallenna Studio kirjanmerkkeihin.

## Studion rakenne (vasen valikko)

- **Sivun asetukset**
  - **Etusivu** — etusivun lohkot ja hero-otsikko
  - **Navigaatio** — yläpalkin linkit
  - **Yhteystiedot** — osoite, sähköposti, sosiaaliset mediat
  - **Sivuston asetukset** — logo, oletustekstit
- **Tapahtumat** — yhdistyksen tapahtumakalenteri
- **Uutiset** — tiedotteet, blogimerkinnät
- **Galleria-albumit** — kuvasarjat tapahtumista
- **Sivut** — muut staattiset sivut (esim. yhdistys, säännöt)
- **Hallitus** — hallituksen jäsenet
- **Ravintolat**
  - **Kaikki ravintolat** — arvostelut
  - **Käyttäjäarvostelut** — yleisön lähettämät, moderoit nämä
  - **Kaupungit** — luokittelu
- **Jalkapalloarkisto**
  - **Tilastot** — FIFA-ranking, mestarit, valmentajat jne.
  - **Stadionit**

## Yleiset toimenpiteet

### Tapahtuman lisääminen

1. Klikkaa vasemmasta valikosta **"Tapahtumat"**
2. Klikkaa oikealla yläkulmassa **"Create"** → **"Tapahtuma"**
3. Täytä:
   - **Tapahtuman nimi** (esim. "Vappu 2026")
   - **Polku (slug)** — generoituu automaattisesti, voit jättää
   - **Alkamisaika** ja päättymisaika
   - **Paikka** (vapaaehtoinen)
   - **Kansikuva** (raahaa kuva tai klikkaa "Upload")
   - **Kuvaus** — kirjoita normaalia tekstiä, voit lihavoida, lisätä otsikoita, listoja
   - **Ilmoittautumislinkki** tai sähköposti (vapaaehtoinen)
4. Klikkaa **"Publish"** (vihreä nappi alhaalla oikealla)

> **Vinkki:** Voit tallentaa luonnoksena ("Save draft") ja palata myöhemmin.

### Uutisen lisääminen

1. **"Uutiset"** → **"Create"** → **"Uutinen"**
2. Otsikko, slug (auto), julkaisuaika (oletus: nyt)
3. **Lyhenne** — max 200 merkkiä, näkyy uutislistalla
4. **Kansikuva**, **sisältö** (rich text)
5. Kategoriat: valitse listalta
6. **Publish**

### Kuvan vaihtaminen

1. Avaa dokumentti (esim. tapahtuma)
2. Klikkaa kuvaa
3. Klikkaa **"Replace"** ja valitse uusi kuva
4. Täytä **vaihtoehtoinen teksti (alt)** — kuvaile mitä kuvassa näkyy
5. **Publish**

### Etusivun muokkaaminen

1. **"Sivun asetukset" → "Etusivu"**
2. **Hero-alueessa**:
   - Muuta otsikkoa, kuvausta, taustakuvaa
3. **Lohkot**-osiossa voit:
   - Vetää lohkoja järjestyksen muuttamiseksi
   - Klikata "X" lohkon vieressä piilottaaksesi sen tilapäisesti
   - Lisätä uuden lohkon klikkaamalla **"Add item"**
4. **Publish**

### Yhteystietojen päivitys

1. **"Sivun asetukset" → "Yhteystiedot"**
2. Muokkaa osoite, sähköposti, puhelin, sosiaaliset mediat
3. **Publish** — muutos näkyy footerissa ja /yhteystiedot-sivulla heti

### Käyttäjäarvostelun moderointi (ravintolat)

1. Sähköposti tulee, kun joku lähettää arvostelun
2. Avaa Studio → **"Ravintolat" → "Käyttäjäarvostelut"**
3. Listalla näkyy "⏳ Odottaa hyväksyntää" -merkityt
4. Klikkaa avataksesi, lue kommentti
5. Vaihda **Tila**-kenttä joko **"Hyväksytty (julkinen)"** tai **"Hylätty"**
6. **Publish**
7. Hyväksytyt näkyvät ravintolan sivulla automaattisesti seuraavaan minuuttiin mennessä

## Tyypilliset virhetilanteet

| Tilanne | Mitä tehdä |
|---|---|
| "Cannot publish: missing required field" | Punaiset kentät ovat pakollisia. Vieritä alas, täytä, yritä uudelleen |
| Kuva ei näy julkisella sivulla | Tarkista, että dokumentti on julkaistu (vihreä "Published"-tila). Odota 1 minuutti välimuistin päivittymistä |
| Linkki ei toimi | URL-kentässä tarvitaan koko polku `https://...` |
| En löydä luomaani tapahtumaa | Listanäkymässä järjestys on uusin alkamisaika ensin. Menneet tapahtumat näkyvät alempana |

## Mitä EI saa tehdä

- **Älä poista** "Etusivu", "Navigaatio", "Yhteystiedot" tai "Sivuston asetukset" -dokumenttia — ne on lukittu syystä, mutta jos jokin menee pieleen, soita pojalle
- **Älä muokkaa** "slug"-kenttää julkaistun sivun jälkeen — se rikkoo linkit. Jos pakottavasti tarpeen, kerro pojalle joka tekee redirectin
- **Älä lähetä** isoja yli 5 MB kuvia — pakkaa ensin esim. tinypng.com:lla

## Tuki

Jos jokin menee pieleen tai et tiedä miten jokin asia tehdään: ota yhteyttä poikaan. Sanityssa kaikki muutokset ovat **palautettavissa** (versiohistoria), joten älä pelkää kokeilla.

---

*Tämä opas päivitetään aina kun Studio saa uusia ominaisuuksia. Versio 1.0.*
