# 15 — Veikkaus ja kommentit

> **Tarkoitus:** korvata Blogspot-blogin kommentit, joilla klubin jäsenet ovat
> jättäneet veikkauksensa. Veikkaus on jätetty suoraan kirjoituksen alle, ja se
> on näkynyt heti. Tämän on toimittava uudella sivustolla yhtä helposti ennen
> kuin blogi voidaan ohjata sivustolle (docs/14 §5–6, §8).
>
> Laadittu 2026-09-28. Päätökset (käyttäjä 2026-09-28): kommentit **ja**
> veikkauslomake, suojana **klubin yhteinen koodisana**, vanhoista kommenteista
> tuodaan **veikkauskirjoitusten** kommentit.
>
> **Muutos 2026-09-30 (käyttäjä):** koodisana poistettiin kokonaan. Lomakkeessa on
> vain nimi, veikkaus ja kommentti. Suojana ovat piilokenttä, tulvasuoja ja isän
> jälkimoderointi. Alla olevat koodisanaa koskevat kohdat on päivitetty.

---

## 1. Miten kommentteja käytetään (blogin kommenttiarkisto, mitattu)

Kommentteja vuodesta 2020: 209.

| Käyttö | Kommentteja | Sisältö | Esimerkki |
|---|---:|---|---|
| **Palloveikkaus** (kauden alussa) | 58 | Veikkausliigan 12 joukkueen loppusijoitukset | "Ilpon: 1. Hjk 2. Kups 3. Ilves … 12. IFK Mariehamn" |
| **Voittajaveikkaus** (EM/MM) | 38 | 4 parasta + maalikuningas | "1. Espanja 2. Ranska 3. Englanti 4. Portugali. Maalikuningas Mbappé. T. Kalle" |
| **Suomen / Maailman paras avaus** | 41 | Avauskokoonpano vapaana tekstinä | |
| Tapahtumat, avoin palsta | ~30 | Vapaa kommentti | |

- Kirjoittajia on noin 10 jäsentä. Noin kolmasosa (76/209) kirjoittaa anonyymina ja
  allekirjoittaa itse ("T. Kalle", "Ilpon:").
- Veikkaus jätetään mediaanina 5 päivän kuluessa kirjoituksesta.
- Isä laskee palloveikkauksen tilanteen käsin ja julkaisee sen uutisena
  ("Palloveikkaus tilanne 2026 / 25"). Näin tehdään edelleen (§7 vaihe 2).

Johtopäätös: tarvitaan **kaksi asiaa**: tavallinen kommenttikenttä (paras avaus,
tapahtumat) ja **rakenteinen veikkaus** kahteen toistuvaan veikkaustyyppiin, jotta
isän ei tarvitse tulkita vapaata tekstiä ("Kups", "KuPS", "Kuopion PS").

---

## 2. Käyttäjäkokemus

**Jäsen** avaa uutisen "Palloveikkaus 2027":

```
┌ Jätä veikkauksesi ─────────────────────────── Veikkaus sulkeutuu 5.4.2027 klo 18 ┐
│ Nimi          [ Ilpo                ]                                            │
│ 1.  [ HJK            ▾ ]  ↑ ↓                                                     │
│ 2.  [ KuPS           ▾ ]  ↑ ↓           (12 riviä, joukkueet isän syöttämästä    │
│ …                                        listasta; sama joukkue ei kahdesti)     │
│ Kommentti (vapaaehtoinen) [                                   ]                  │
│                                                   [ Lähetä veikkaus ]            │
└──────────────────────────────────────────────────────────────────────────────────┘
Veikkaukset (9)
  Ilpo · 30.3.2027      1. HJK  2. KuPS  3. Ilves  …
  Kalle · 30.3.2027     1. HJK  2. KuPS  3. Ilves  …
```

- Lähetyksen jälkeen veikkaus näkyy **heti** listassa, eikä sivua tarvitse ladata uudelleen.
- Nimi muistetaan selaimessa, joten seuraavalla kerralla se on valmiina.
- Sulkeutumisajan jälkeen lomakkeen tilalla lukee "Veikkaus on sulkeutunut", ja
  veikkaukset näkyvät edelleen.
- Tavallisessa uutisessa (esim. "Suomen paras avaus", kesäjuhla) on sama lomake
  ilman veikkausosaa: nimi ja kommentti.
- Kommentointi on käytössä vain niissä uutisissa, joissa isä on sen kytkenyt päälle.

**Isä** (Studio):
1. Uusi uutinen "Palloveikkaus 2027" → välilehti **Kommentit ja veikkaus** →
   "Salli kommentit" ✓, tyyppi **Sarjajärjestys**, joukkueet (12 riviä), sulkeutuu 5.4.
   Seuraavaan kauteen voi kopioida edellisen kauden joukkueet (Duplicate).
2. Voittajaveikkaus: tyyppi **Voittajaveikkaus**, sijoituksia 4, "Kysy maalikuningas" ✓.
3. Valikossa **Kommentit** näkyvät uusimmat ensin. Asiattoman viestin saa piiloon
   valinnalla "Piilota", eikä mitään tarvitse poistaa.

---

## 3. Sisältömalli (Sanity)

### 3.1 `uutinen.kommentointi` (uusi objektikenttä, oma välilehti)

| Kenttä | Tyyppi | Huomio |
|---|---|---|
| `kaytossa` | boolean | Oletus ei |
| `tyyppi` | `kommentti` \| `sarjajarjestys` \| `voittajaveikkaus` | Oletus `kommentti` |
| `sulkeutuu` | datetime | Valinnainen. Sen jälkeen ei uusia kommentteja |
| `vaihtoehdot` | string[] | Sarjajärjestys: joukkueet (pakollinen, 2–20, uniikit) |
| `sijoituksia` | number | Voittajaveikkaus: montako sijaa (oletus 4) |
| `maalikuningas` | boolean | Voittajaveikkaus: kysytäänkö maalikuningas |
| `ohje` | text | Valinnainen ohje lomakkeen yläpuolelle |

### 3.2 Uusi dokumenttityyppi `kommentti`

| Kenttä | Tyyppi | Huomio |
|---|---|---|
| `uutinen` | reference → uutinen | pakollinen |
| `nimi` | string 2–40 | Näkyy julkisesti. Sähköpostia ei kysytä, kuten blogissakaan |
| `teksti` | text ≤ 1000 | Vapaaehtoinen, jos veikkaus on annettu |
| `veikkaus.jarjestys` | string[] | Sarjajärjestys tai sijoitukset. Arvot tarkistetaan palvelimella `vaihtoehdot`-listaa vasten |
| `veikkaus.maalikuningas` | string ≤ 60 | |
| `lahetetty` | datetime | Palvelin asettaa |
| `piilotettu` | boolean | Isän moderointi jälkikäteen |
| `lahde` | `sivusto` \| `blogspot` | Vanhat tuodut kommentit: `blogspot` + `blogspotId` |

Rakenteinen `jarjestys` mahdollistaa vaiheen 2 automaattisen pistelaskun ilman,
että vaiheen 1 dataa tarvitsee muuttaa.

### 3.3 Koodisana (poistettu 2026-09-30)

Alun perin lähetys vaati klubin yhteisen koodisanan (`secrets.kommenttikoodi`).
Ominaisuus poistettiin käyttäjän päätöksellä: skeema, Studion valikko ja lomakkeen
kenttä on poistettu. Suojana ovat piilokenttä, tulvasuoja ja jälkimoderointi.

---

## 4. Tekninen toteutus

Sama malli kuin nykyiset lomakkeet (`app/(public)/ravintolat/arvostele/actions.ts`,
jäsenhakemus): **Server Action**, validointi kokonaan palvelimella, kirjoitustoken
vain palvelimella.

1. **Lähetys** (`app/(public)/uutiset/[slug]/kommentti-actions.ts`):
   - piilokenttä (hunajapurkki) → hiljainen hylkäys
   - kommentointi päällä, `sulkeutuu` ei ohitettu
   - veikkauksen arvot sallittujen listasta, ei tuplia, kaikki sijat täytetty
   - tulvasuoja: sama nimi samaan uutiseen korkeintaan kerran 30 sekunnissa
   - `client.create()` → `revalidateTag("kommentit:<uutisen id>")`, joten sivu päivittyy heti
2. **Näyttö**: uutissivun ISR säilyy (`revalidate = 3600`). Kommenttilista haetaan
   omalla tagilla, joten uusi kommentti tyhjentää vain sen välimuistin.
3. **Lomake**: saavutettava. Sarjajärjestyksessä on `<select>` per sija ja ↑/↓-napit,
   ei pelkkää vedä ja pudota. Virheet kentän vieressä, `aria-live`-tilaviesti.
   Toimii ilman JavaScriptiä (Server Action + progressive enhancement).
4. **Studio**: `kommentti` omaan valikkoon (uusin ensin, suodatus uutisen mukaan),
   uutisen esikatseluun kommenttimäärä.
5. **Webhook**: `app/api/revalidate` tunnistaa `kommentti`-tyypin (isän piilotus
   näkyy heti).

---

## 5. Vanhojen kommenttien tuonti

Blogspot-putkeen (`import-blogspot.ts`) lisätään kommenttivaihe. Vain
**veikkauskirjoitusten** kommentit tuodaan: kategoria `palloveikkaus` tai otsikko
"paras avaus". Ne ovat klubin veikkaushistoriaa.

- `_id` = `kommentti-blogspot-<kommentin id>` → toistettava kuten kirjoitukset
- `nimi` = kirjoittaja. "Anonymous" → "Nimetön", ja allekirjoitus säilyy tekstissä
  ("T. Kalle"). Nimiä ei päätellä tekstistä.
- teksti vapaana (vanhoja veikkauksia ei jäsennetä rakenteiseksi: muoto vaihtelee)
- `lahde: "blogspot"`, alkuperäinen aikaleima
- Vanhojen kirjoitusten `kommentointi.kaytossa` = false: vanhat näkyvät, uusia ei voi jättää

Mitattu: **502 kommenttia 124 kirjoituksessa** (189 anonyymia). Muut kommentit (tapahtumat,
avoin palsta) jäävät paikalliseen arkistoon.

---

## 6. Tietosuoja

- Kerätään vain nimi (näkyy julkisesti) ja teksti. Ei sähköpostia, eikä IP-osoitetta tallenneta.
- Lomakkeessa lukee: "Nimesi ja veikkauksesi näkyvät sivulla julkisesti."
- Jäsen voi pyytää poistamaan kommenttinsa, ja isä poistaa sen Studiossa (docs/09).
- Vanhat tuodut kommentit ovat olleet julkisia blogissa samoilla nimillä.

---

## 7. Vaiheet

| Vaihe | Sisältö | Arvio |
|---|---|---|
| **1** | Skeemat (§3), lomake ja lista (§4), Studio, vanhojen veikkauskommenttien tuonti (§5), editorin ohje (docs/09) | 1 sprintti |
| **1b** | Blogin ohjaus käyttöön (docs/14 §6): viimeinen `sync:blogspot`, teemaan ohjausskripti | vaiheen 1 julkaisun jälkeen, kun isä on kokeillut |
| 2 (myöhemmin) | Automaattinen palloveikkauksen tilanne: sarjataulukko Veikkausliigan tuloksista (docs/13 syöte), pisteet = sijoituserojen summa. Isä ei enää laske käsin. | erillinen päätös |

**Hyväksymiskriteerit (vaihe 1):**
- Jäsen jättää palloveikkauksen puhelimella alle minuutissa, ja se näkyy heti sivulla.
- Suljettu veikkaus, puuttuva sija tai sama joukkue kahdesti → selkeä
  suomenkielinen virhe kentän vieressä, eikä mitään tallennu.
- Isä piilottaa kommentin Studiossa → poistuu sivulta minuutissa.
- Vanhat veikkauskommentit näkyvät omien kirjoitustensa alla.
- type-check, lint, build puhtaat; saavutettavuus (näppäimistö, ruudunlukija) tarkistettu.

---

## 8. Tila (vaihe 1 toteutettu 2026-09-28)

| | |
|---|---|
| Skeemat | `kommentti`, `uutinen.kommentointi` (koodisana-singleton poistettu 2026-09-30) |
| Lomake | `app/(public)/uutiset/_kommentit/`: Server Action, validointi `validointi.ts`, lomake `kommentti-lomake.tsx`, lista `kommentit-osio.tsx` |
| Välimuisti | lista haetaan ohi CDN:n tagilla `kommentit:<uutisen id>`; lähetyksen jälkeen `updateTag` → näkyy lähettäjälle heti. Webhook tyhjentää tagin `kommentti` (piilotus näkyy heti), ilman webhookia 60 s |
| Yksikkötestit | `npm run test:kommentit` 12/12 |
| Päästä päähän (HTTP, ilman JavaScriptiä, `next start`) | 15/15: väärä koodi, sama sija kahdesti, puuttuva nimi, kelvollinen (koodi eri kirjainkoolla), tulvasuoja, hunajapurkki, näkyy heti oikeassa järjestyksessä, voittajaveikkauksen 3 tapausta, sulkeutunut hylätään, piilotettu katoaa (30 s), vanhat kommentit oikean kirjoituksen alla (7/7) |
| Vanhat kommentit | 502 / 2 140 tuotu (124 veikkauskirjoitusta), `kommentti-blogspot-<id>`, tuonti `--missing` |
| Korjattu samalla | `lib/format.ts`: päivämäärät ja kellonajat Suomen aikaan. Vercel toimii UTC-ajassa, joten tapahtumien kellonajat olisivat näkyneet 2–3 h väärin |
| Ei testattu | ulkoasu ja näppäimistökäyttö selaimessa (selainlaajennus ei ollut käytettävissä). Tarkistettava käsin ennen julkaisua: puhelin, ↑/↓-napit, ruudunlukijan ilmoitus siirrosta |
| Käyttöönotto | isä kytkee kommentoinnin uutiselle Studiossa (docs/09) |
