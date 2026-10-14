# 001: Sanityn kiintiö: haut CDN:n kautta, botit pois rajausyhdistelmistä

**Tila:** Hyväksytty · **Päivä:** 2026-10-14 · **Päättäjä:** kehittäjä

## Konteksti
14.10.2026 Sanityn ilmaistason suoran rajapinnan kuukausikiintiö (250 000
pyyntöä) loppui: 254,5k / 250k. Sanity vastasi kaikkiin rajapintapyyntöihin
`402 plan_limit_reached`, ja lähes kaikki sivut antoivat 500-virheen
(Ravintola-arviot, Uutiset, arvostelu). CDN-kiintiö (1 000 000) on erillinen
ja toimi yhä, mutta siitäkin oli käytetty 530k.

Kulutus lokakuussa (Sanityn Usage-näkymä): kehityspäivät (1.–9.10., piikit
4.10. 52k ja 8.10. 44k: buildit productionin datalla, e2e- ja savutestit,
migraatiot) ja tuotannon jatkuva kuorma, joka hiljaisinakin päivinä oli
7–25k päivässä. Kiintiö kestää noin 8k päivässä. Syyt koodissa:

- `sanityFetch` haki ajon aikana aina suoraan rajapinnasta (`useCdn: false`).
- Jokaisen haun `revalidate` oli 60 s, joten jokainen katsottu sivu haettiin
  uudelleen minuutin välein.
- Ravintolahakemiston rajaukset (`alue`, `maakunta` monivalintana, `maa`,
  `kaupunki`, `arvosana`, `jarjesta`, `sivu`) ja hakusanat tuottavat
  rajattomasti osoitteita, joita ei ole välimuistissa. Botit, myös sallitut
  tekoälycrawlerit, seuraavat niitä.
- Kehityspalvelin ja paikalliset buildit lukevat samaa projektia (kiintiö on
  projektikohtainen, ei datasettikohtainen).

Tavoite: pysyä ilmaistasolla ilman, että kävijän kokemus heikkenee.

## Päätös
`sanityFetch` hakee oletuksena Sanityn CDN:n kautta, ja välimuistissa olevan
tuloksen tarkistusväli on 5 min (`TARKISTUSVALI_S`). Julkaisun päivittää
edelleen webhook heti. Suora rajapinta on varattu kommenteille (lähettäjä
näkee viestinsä heti `updateTag`illa, tarkistusväli 1 h), luonnosnäkymälle ja
kirjoituksille. Jos suoran rajapinnan kiintiö silti loppuu, `sanityFetch`
siirtyy automaattisesti CDN:ään (402 → CDN), jolloin sivut näkyvät eivätkä
kaadu. Lomakkeet kertovat kiintiövirheestä selvästi, eivätkä pyydä
yrittämään hetken päästä. `robots.txt` estää ravintolahakemiston rajaukset
(`/ravintolat?`, `/ravintolat/odottavat?`) ja hakutulokset (`q=`).

## Seuraukset
- Kävijälle ei näkyvää muutosta: sivut tulevat edelleen välimuistista.
- Julkaisu näkyy yleensä sekunneissa kuten ennenkin. Harvoin CDN palauttaa
  julkaisun jälkeen vielä vanhan tuloksen (4.10. mitattu ~10 min poistetulle
  ravintolalle); tarkistusväli korjaa sen itsestään.
- Ajastettu uutinen, etusivun noston päättyminen ja ottelulistat päivittyvät
  viiden minuutin kuluessa (ennen minuutin). Ohjekortit ja kentän kuvaus
  päivitetty.
- Valikon linkin kohteen osoitteen muutos näkyy valikossa 5 min viiveellä;
  vanha osoite ohjautuu sillä välin.
- Kehityspalvelin käyttää myös CDN:ää, joten kehitys ei kuluta suoran
  rajapinnan kiintiötä (skriptit kuluttavat edelleen).
- Kun suoran rajapinnan kiintiö on täynnä, kirjoitukset (arvostelut,
  kommentit, webhookin arvosanalaskenta, cronit) eivät toimi kuun loppuun.
  Siksi kiintiötä seurataan: sanity.io/manage → Usage.
- Hakemiston rajausnäkymät eivät ole hakukoneissa. Ravintolat ovat
  sitemapissa omilla sivuillaan, ja uutisten kategoria- ja sivulistat ovat
  edelleen sallittuja.

## Hylätyt vaihtoehdot
- **Maksullinen Growth-taso** — tavoite on pysyä ilmaisena; ongelma oli
  turhassa kuormassa, ei aidossa tarpeessa.
- **Pelkkä tarkistusvälin pidennys suoralla rajapinnalla** — ei auta botteihin
  (jokainen uusi yhdistelmä on välimuistin ohitus) eikä palauta sivuja ennen
  kuun vaihdetta.
- **Tunnin tarkistusväli CDN:llä** — ajastettu uutinen ja etusivun nosto
  myöhästyisivät tunnin. Viisi minuuttia on CDN-kiintiössä reilusti varaa.
- **Webhookin viivästetty toinen päivitys CDN-viiveen varalta** — vaatisi
  pitkään odottavan funktion tai erillisen ajastuksen; viiden minuutin
  tarkistusväli hoitaa saman yksinkertaisemmin.
- **`nofollow` rajauslinkkeihin** — `robots.txt` estää indeksoinnin jo; nofollow
  on vain vihje eikä estä haettaessa.
