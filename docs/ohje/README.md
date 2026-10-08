# Ylläpito-ohjeen lähde: kirjoitusohje

Tämä kansio on sihteerin ylläpito-ohjeen **ainoa lähde**. Sama lähde tuottaa:

- Studion **Ohjeet**-työkalun (`/studio/ohjeet`) ja dokumentin **Ohje**-paneelin,
- tulostettavan oppaan ja pikaoppaan (PDF),
- testin `npm run test:ohje`.

Suunnitelma ja perustelut: `docs/25-yllapito-ohjeen-uudistus.md`. Laatukriteerit, mallit ja
Studion nimet: `docs/25-liite-analyysi.md`. Lue molemmat ennen kirjoittamista.

## Kansiot ja tiedostot

```
docs/ohje/
  pikaopas.md            1 A4: kolme sääntöä + viisi tehtävää + "Jos hätä tulee"
  alkuun/                Studion osat, Aloitus, luonnos/julkaisu/peruminen, haku, esikatselu
  tekstit/               kuvat, linkit, upotukset, huomiolaatikko, painike, liite, taulukko
  uutiset/
  arkisto/               jalkapalloarkisto: tilastot, arvokisat, pelaajat, stadionit, Litmanen
  ravintolat/
  ottelut/               ottelut, tapahtumat, galleria
  klubi/
  sivusto/               etusivu, valikko, sivut, osioiden sivut, osoitteet, lyhytosoitteet, jakokuva
  turvaverkko/           varmuuskopiot, palautukset, tarkistettavat, täytä itse, tietosuoja
  vianetsinta/           yksi oire per tiedosto
  hakuteos/              valikon kartta, tilamerkit, sanasto, tukihenkilö, mitä ei saa tehdä
```

Yksi tiedosto = yksi kortti. Tiedostonimi on kortin tunnus: pienet kirjaimet, ä→a, ö→o,
väliviivat (`tilastotaulukon-paivitys.md`). Osio tulee kansiosta.

## Frontmatter

```yaml
---
otsikko: Päivitä tilastotaulukko        # tekeminen lukijan sanoin (verbi), ei ominaisuuden nimi
jarjestys: 10                           # järjestys osion sisällä (10, 20, 30 …)
kesto: noin 5 minuuttia                 # vain tehtäväkorteissa
avainsanat: [tilasto, taulukko, Huuhkajat, pisteet, sijat, prosentit]  # lukijan omat sanat
tyypit: [jalkapalloTilasto]             # skeematyypit, joiden Ohje-paneelissa kortti näkyy
kuvat:                                  # kuvatilaukset, ks. "Kuvat"
  - id: tilasto-01-ryhma
    nakyma: "Jalkapalloarkisto → Tilastot → Huuhkajat, taulukkolista"
    avaa: studio:rakenne/jalkapalloarkisto/tilastot   # mistä kuvaaja aloittaa
    merkinnat:
      1: "Jalkapalloarkisto vasemmassa valikossa"
      2: "Tilastot"
    alt: "Studion valikko. 1: Jalkapalloarkisto. 2: Tilastot."
paivitetty: 2026-10-08
---
```

## Tehtäväkortin rakenne

Otsikot täsmälleen tässä järjestyksessä (`##`). Kortin otsikko tulee frontmatterista, ei `#`-riviä.

```markdown
## Milloin
1–3 virkettä: missä tilanteessa tätä tarvitaan ja missä tulos näkyy sivustolla.

## Ennen kuin aloitat            ← vain jos tarvitaan
- …

## Askeleet

![Alt-teksti](../../../public/studio-ohje/tilasto-01-ryhma.webp)

1. Vasemmasta valikosta valitse **Jalkapalloarkisto**. ①
2. Valitse **Tilastot**. ②
   Askelkohtainen tulos sisennettynä, vain kun ruudulla tapahtuu jotain huomattavaa.

## Tulos
- Mitä lukija näkee, kun onnistui (Studiossa ja sivustolla).

## Lisävalinnat                  ← vain jos tarvitaan; linkit muihin kortteihin
- [Ajasta uutinen](../uutiset/ajasta-uutinen.md)

## Jos jokin menee vikaan
- **Julkaise** ei toimi ja kentän ympärillä on punaista: … (1–3 yleisintä)

Katso myös: [Kortti](../osio/kortti.md) · [Kortti](../osio/kortti.md)
```

Vianetsintäkortit: otsikko on oire tai virheteksti täsmälleen ruudun sanoin. Rakenne:
`**Mitä näet:**` · `**Miksi:**` (yksi virke) · `**Näin korjaat:**` (numeroitu) · `**Ei auttanut?**`.
Hakuteoskortit ovat vapaamuotoisia (taulukot, listat).

## Kirjoitussäännöt

1. **Lihavointi = vain Studiossa näkyvä nimi**, täsmälleen kuten ruudulla (kirjainkoko,
   sulkeet ja välimerkit mukaan lukien): `**Tiivistelmä jutun alussa (valinnainen)**`.
   Polku nuolilla: `**Klubi → Hallitus → Entiset jäsenet**`. `test:ohje` tarkistaa jokaisen
   lihavoinnin koodia vasten. Muuhun korostukseen käytä huomautuslaatikkoa.
2. **Huomautuslaatikot:** `> [!TIP]` vinkki · `> [!NOTE]` hyvä tietää · `> [!WARNING]` todellinen
   vaara (julkinen tiedosto, pysyvä poisto). Kerro ensin, mikä on peruttavissa, sitten varoitus.
3. **Askel = yksi toiminto**, paikka ensin: "Oikeassa alakulmassa paina **Julkaise**."
   Enintään 7–10 askelta; muuten jaa kahdeksi kortiksi.
4. **Selkeä kieli:** virkkeet alle 15 sanaa (yläraja 25), sinuttelu, käskymuoto ("Paina",
   "Kirjoita"). Ei teknisiä sanoja (dataset, token, webhook, migraatio, GROQ, CORS, repo,
   skeema, dokumentti*). Ei viittauksia `docs/`-tiedostoihin, koodiin tai historiaan
   ("kenttä oli ennen…").
   *"Dokumentti" vain, kun Studio itse käyttää sanaa ruudulla.
5. **Apu = tukihenkilö.** Ei nimiä, ei GitHub-tunnuksia, ei sähköposteja (repo on julkinen).
   "Kerro tukihenkilölle rivin otsikko ja teksti."
6. **Julkaise vasta lopuksi.** Muutokset tallentuvat itsestään luonnokseksi. Ohje ei neuvo
   painamaan **Julkaise** kesken työn.
7. **Ympyränumerot** ①②③… askeleen lopussa = kuvan merkintä samalla numerolla.
8. **Linkit:**
   - toiseen korttiin: suhteellinen polku `[Ajasta uutinen](../uutiset/ajasta-uutinen.md)`
   - Studion näkymään: `[Avaa Uutiset](studio:rakenne/uutiset)` (rakenteen id-polku `structure.ts`:stä),
     `studio:luo/uutinen`, `studio:luo/uutinen?pohja=<pohjan id>`, `studio:muokkaa/<singletonin id>`,
     `studio:aloitus`
   - sivustolle: `https://www.lahdensuomalainenklubi.com/…`
9. **Ei englantia**, ellei ruudulla oikeasti lue englanniksi.

## Kuvat

Kirjoittaja **tilaa** kuvat frontmatterin `kuvat`-listassa ja viittaa niihin tekstissä
`![alt](../../../public/studio-ohje/<id>.webp)`. Kuvaskripti (`npm run ohjekuvat`, manifesti
`scripts/ohjekuvat/`) ottaa kuvat Studiosta development-datasetistä keksityllä esimerkkidatalla
ja piirtää numeroidut merkinnät. Kuvaa ei tarvitse olla olemassa, kun kortti kirjoitetaan.

- 1–3 kuvaa per kortti: lähtönäkymä + yksi jokaista uutta näkymää kohden.
- Kuvassa ei tekstiä eikä nuolia, vain numerot. Teksti toimii ilman kuvaa.
- Alt-teksti alle 155 merkkiä: näkymä ja merkinnät.
- Ei henkilötietoja: esimerkkidata on keksittyä ("Testi Klubilainen", `@esimerkki.fi`).

## Kun Studio muuttuu

1. Päivitä kortit, joita muutos koskee (`tyypit`-kenttä auttaa löytämään ne).
2. `npm run ohjekuvat` (kehityspalvelin development-datasetillä) ja tarkista muuttuneet kuvat.
3. `npm run ohje` (koostaa Studion ohjeen ja tulostettavan HTML:n), `npm run ohje:pdf`.
4. `npm run test:ohje`.
