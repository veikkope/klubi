# 19 — Tilastotaulukoiden editori

> Tila 30.9.2026: toteutettu haarassa `feat/taulukkoeditori`. Korjaa auditoinnin
> havainnon cms-5 (docs/16 §5).

## 1. Ongelma

Jalkapalloarkiston ja klubin taulukot (187 kpl, suurin 31 saraketta × 87 riviä,
yhteensä ~17 400 täytettyä solua) tallennetaan `jalkapalloTilasto`-dokumenttiin:

```
columns[] { _key, key, label, type }
rows[]    { _key, cells[] { _key, key, value } }
```

Sanityn oletussyötteessä jokainen solu oli oma avain–arvo-olionsa. Esimerkiksi
palloveikkauksen yksi rivi vaati 31 erikseen avattavaa soluobjektia, joten
taulukoiden päivittäminen oli sihteerille käytännössä mahdotonta.

## 2. Ratkaisu

Sama editori on käytössä myös tekstin **Taulukko**-lohkossa (sivu, uutinen,
tapahtuma, klubin toiminta; docs/24 askel 6, docs/05 `rikasSisalto`).

`rows`-kentällä on oma syöte, taulukkolaskennan kaltainen ruudukko
(`sanity/components/taulukkoeditori/`). **Tietomalli on ennallaan**, joten
migraatiota ei tarvita, ja GROQ-kyselyt ja sivuston `StatTable` toimivat
sellaisenaan. `columns`-kenttä on piilotettu, koska sarakkeita hallitaan
ruudukon otsikkoriviltä.

| Toiminto | Miten |
|---|---|
| Solun muokkaus | Napsauta ja kirjoita. Tallentuu, kun solusta poistutaan |
| Liikkuminen | Enter / Shift+Enter alas ja ylös, nuolet, Tab. Esc peruu muutoksen |
| Liitä Excelistä | Napsauta solua ja Ctrl+V: alue täytetään siitä alkaen, ja rivejä lisätään tarvittaessa |
| Tuo Excelistä | Dialogi: liitä alue tai CSV, esikatselu, sitten *lisää rivit loppuun* tai *korvaa koko taulukko* |
| Kopioi Exceliin | Koko taulukko sarkaineroteltuna leikepöydälle |
| Rivit | ⋮-valikko rivinumeron vieressä: lisää ylle tai alle, siirrä, poista (poiston voi kumota ilmoituksesta) |
| Sarakkeet | ⋮-valikko otsikossa: nimi ja tyyppi, lisää vasemmalle tai oikealle, siirrä, poista (vahvistus) |
| Haku | Suodattaa rivit, joiden jossain solussa on hakusana |

Ruudukossa otsikkorivi ja ensimmäinen sarake pysyvät paikallaan vieritettäessä.
Värit tulevat Sanity UI:n teemasta, joten vaalea ja tumma tila toimivat.

## 3. Arvojen muunnokset (`lib/taulukko.ts`)

Tallennusmuoto on koneluettava, mutta sihteeri kirjoittaa ja näkee arvot
suomalaisittain:

| Sarake | Kirjoitetaan / näkyy | Tallennetaan |
|---|---|---|
| Päivämäärä | 26.9.2026 · 9/2026 · 30.1.–1.2.2009 | 2026-09-26 · 2026-09 · 2009-01-30/2009-02-01 |
| Numero, vuosi | 61 035 | 61035 |
| Teksti, linkki | sellaisenaan | sellaisenaan (reunojen välilyönnit pois) |

Tunnistamaton arvo tallennetaan sellaisenaan, koska arkistossa on tarkoituksella
tekstiä myös numero- ja päivämääräsarakkeissa. Solu saa silloin aaltoviivan ja
selityksen (työkaluvihje), mutta tallennus ei esty. Tyhjä solu poistetaan
`cells`-taulukosta, kuten tuonnissa. Kun sarakkeen tyyppi vaihdetaan,
olemassa olevat arvot muunnetaan uuteen muotoon siltä osin kuin ne tunnistetaan.

Sivuston `StatTable` käyttää samoja päivämääräfunktioita (`parseIso`,
`formatIso`, `formatInterval`), joten editori ja sivu näyttävät arvot samoin.

Tarkistettu tuotannon varmuuskopiota (30.9.2026) vasten: kaikki 17 432 arvoa
kulkevat näyttömuodon kautta takaisin muuttumattomina. Vain kaksi
päivämääräsarakkeen arvoa ei ole tunnistettava päivämäärä, ja ne saavat
varoituksen.

## 4. Tekninen rakenne

- **`konteksti.tsx`**: `TaulukkoKontekstiInput` on taulukon sisältävän objektin
  juurisyöte (`components.input` tyypeillä `jalkapalloTilasto` ja tekstin
  `taulukko`-lohko, docs/24 askel 6; aiemmin nimeltään `TilastoDokumenttiInput`).
  Se välittää objektin `onChange`-funktion kontekstissa. Kentän oma `onChange`
  näkee vain `rows`-polun, mutta sarakemuutokset koskevat myös `columns`-kenttää.
  Objektin `onChange` ottaa patchit objektin omasta juuresta, joten samat patchit
  toimivat dokumentissa ja tekstilohkossa. Ilman kontekstia editori näyttää
  Sanityn oletussyötteen.
- **Kentät** `columns` ja `rows` määritellään kerran (`sanity/schemas/objects/
  taulukkoKentat.ts`: `sarakkeetKentta`, `rivitKentta`), ja tallennusmuoto on
  sama molemmissa käyttöpaikoissa.
- **`patchit.ts`**: muutokset pieninä, `_key`-polkuihin kohdistuvina patcheina
  (`set`, `unset`, `insert`, `setIfMissing`). Yksi solu, rivi tai sarake kerrallaan,
  ei koko taulukon ylikirjoitusta, joten samanaikaiset muokkaukset eivät kumoa
  toisiaan ja versiohistoriasta näkee, mikä muuttui. Ainoa koko taulukon
  korvaus on tuonnin *Korvaa koko taulukko*, ja siihen tarvitaan erillinen valinta.
- **`TaulukkoEditori.tsx`**: ruudukko. Sarakkeet luetaan rivien rinnalta
  suhteellisella polulla `useFormValue([...props.path.slice(0, -1), "columns"])`,
  joten editori toimii sekä dokumentin juuressa että tekstin taulukkolohkossa
  (lohko avautuu dialogiin, `options.modal` `width: "auto"`). Solut ovat hallitsemattomia syötteitä
  (`defaultValue`, avaimena tallennettu arvo), joten kirjoittaminen ei renderöi
  taulukkoa uudelleen. Rivit on muistettu (`memo`), ja toiminnot luodaan kerran
  ja lukevat tuoreen tilan vasta tapahtumahetkellä, joten solun tallennus
  renderöi uudelleen vain muuttuneen rivin.
- **`SarakeDialogi.tsx`**, **`TuontiDialogi.tsx`**: dialogit (Sanity UI).
- Sarakeavain (`key`) muodostetaan nimestä kerran (`sarakeavain`), ja se pysyy,
  vaikka nimeä muutettaisiin. Tuonnissa samanniminen sarake säilyttää avaimensa
  ja tyyppinsä.

`@sanity/ui` on suora riippuvuus samalla pääversiolla (3.x) kuin `sanity`
käyttää. Kopioita saa olla vain yksi (`npm ls @sanity/ui` → deduped), muuten
teeman konteksti ei periydy.

## 5. Testit

`npm run test:taulukko`:

- muunnokset suuntaan ja toiseen, virheelliset päivämäärät, Excelin
  lainaussäännöt (rivinvaihto, sarkain ja lainausmerkki solussa), erottimen
  tunnistus (sarkain, suomalaisen Excelin `;`, `,`) ja tyyppien arvaus
- editorin patchit ajettuina Sanityn omalla mutaatiomoottorilla
  (`@sanity/mutator`): solu, tyhjennys, puuttuva solu, rivi ilman soluja,
  lisäys, siirto, poisto, sarakkeen tyypin vaihto ja poisto, tyhjä dokumentti
  ja korvaus

Lisäksi ruudukko renderöitiin palvelimella tuotannon suurimmalla taulukolla
(31 × 87 = 2 697 solua) ilman virheitä.

## 6. Rajaukset

- Kumoa (Ctrl+Z) ei kata solujen muutoksia. Rivin poiston voi kumota
  ilmoituksesta, ja muuten käytetään versiohistoriaa.
- Useamman solun valinta hiirellä ja täyttö vetämällä puuttuvat. Alueet
  liitetään Excelistä.
- Haun aikana alueen liittäminen ei lisää uusia rivejä, ja rivien siirto on
  pois käytöstä, koska järjestys olisi epäselvä.
