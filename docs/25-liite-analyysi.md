# 25 — Liite: ylläpito-ohjeen analyysi (8.10.2026)

Vaiheen 1 tuotokset. Osa 1: laatukriteerit ja mallit. Osa 2: kattavuusauditointi (opas vs. koodi, Studion nimet). Käyttöanalyysin johtopäätökset ovat docs/25:ssä (vain roolitasolla).

## Analyysi 1: Erinomaisen ylläpito-ohjeen laatukriteerit

Ohjetutkija, 8.10.2026. Kohde: Lahden Suomalaisen Klubin sihteerin Studio-ohje (Ohjeet-työkalu + PDF).
Lukija: iäkkäämpi, ei tekninen, käyttää Studiota harvakseltaan (kerran viikossa – kerran kuussa), usein
yksin, joskus puhelimella. Hän lukee ohjetta **kesken työn**, ei etukäteen.

Lähteet on numeroitu [L1]–[L16] lopussa. Merkintä *(tuntemus)* tarkoittaa, että väite perustuu alan
vakiintuneeseen tietoon eikä tämän tutkimuksen aikana avattuun sivuun.

---

### 1. Laatukriteerit (tarkistuslista)

| # | Kriteeri | Miksi | Lähde |
|---|---|---|---|
| 1 | **Yksi kortti = yksi tehtävä**, jonka otsikko on tekemistä ilmaiseva verbi tai teonnimi lukijan sanoin ("Kirjoita uutinen", "Vaihda kuva"), ei ominaisuuden nimi ("Tekstin lisäosat"). | Lukija hakee tavoitteensa, ei järjestelmän käsitteitä. Minimalismin ensimmäinen periaate: ankkuroi ohje todelliseen tehtävään. | [L1] Carroll / van der Meij, [L2] DITA task, [L4] Microsoft |
| 2 | **Tehtäväkortin kiinteä rakenne**: Milloin – Ennen kuin aloitat – Askeleet – Tulos – Jos jokin menee vikaan – Katso myös. Sama järjestys joka kortissa. | Toistuva rakenne opitaan kerran; lukija tietää, mistä kohdasta löytää esim. vianetsinnän. DITA: prereq, context, steps, result, troubleshooting. | [L2], [L9] Mailchimp (structured content), [L11] quick reference -pohja |
| 3 | **Yksi toiminto per askel**, enintään n. 2 lyhyttä virkettä. Vapaaehtoiset ja harvinaiset asiat erillisiksi korteiksi tai "Lisävalinnat"-osioon askelten jälkeen. | Iäkäs lukija pitää kirjaa siitä, missä askeleessa on; monitoiminen askel katkaisee seurannan. | [L4] Microsoft ("Use a separate step for each instruction"), [L2] (`step` = yksi `cmd`) |
| 4 | **Enintään 7–10 askelta** per kortti. Jos enemmän, jaa kahdeksi kortiksi (esim. "Kirjoita uutinen" + "Lisää uutiseen kuvia"). | Mahtuu yhdelle näytölle/tulostesivulle; ohjeen ja Studion välillä vaihdellessa paikka ei huku. | [L4] ("Try to fit all the steps on the same screen"), [L11] ("Cap the steps at ten") |
| 5 | **Paikka ensin, toiminto sitten**: "Vasemmasta valikosta valitse **Uutiset**." – "Oikeassa alakulmassa paina **Julkaise**." | Lukija katsoo ensin oikeaan kohtaan ja toimii vasta sitten; päinvastainen järjestys johtaa väärään painallukseen. | [L4] ("Make sure that customers know where the action should take place before you describe the action") |
| 6 | **Käyttöliittymän nimet täsmälleen kuten ruudulla**, lihavoituna, aina samassa muodossa. Ei englanninkielisiä rinnakkaisnimiä, ellei ruudulla oikeasti lue englanniksi. Nimet tarkistetaan automaattisesti koodia vasten (`test:ohje`). | Lukija vertaa sanaa ruutuun kirjain kirjaimelta. Yksikin poikkeama ("Korvaa" vs "Replace") pysäyttää. | [L4], [L3] Google (johdonmukaisuus), docs/25 vaihe 5 |
| 7 | **Selkeä yleiskieli, lähellä selkokieltä**: lyhyet virkkeet (tavoite alle 15 sanaa, ehdoton yläraja n. 25), yksi asia virkkeessä, tuttu sana vieraan sijaan, verbit substantiivien sijaan, sinuttelu ja käsky ("Paina", "Kirjoita"). | Yli 65-vuotiaista 15–20 % hyötyy selkokielestä; virkakielen selkeysvaatimus (hallintolaki 9 §) koskee samaa periaatetta. | [L5] Kotus, [L6] Selkokeskus / selkomittari, [L7] Helsingin verkkokirjoitusohje |
| 8 | **Ei teknistä sanastoa eikä kehittäjäviitteitä** (docs/17, CORS, token, webhook, migraatio, dataset, GROQ, repository). Välttämättömät käsitteet (luonnos, julkaisu, versiohistoria) selitetään kerran **sanastossa** ja käytetään sitten johdonmukaisesti. | Ei-tekninen lukija ei voi toimia sanoilla, joita ei ymmärrä; kehittäjäviitteet ovat lukijalle melua. | [L1] ("slash everything that does not directly help the immediate goal"), [L5], [L6] |
| 9 | **Tulos kerrotaan jokaisen tehtävän lopussa**: mitä lukija näkee, kun onnistui ("Uutinen näkyy etusivulla minuutin kuluessa. Listassa nimen vieressä ei enää ole kynämerkkiä."). Tarvittaessa myös askelkohtainen tulos. | Ilman tulosta aloittelija ei tiedä, onnistuiko; epävarmuus johtaa toistoon tai soittoon. | [L2] (`result`, `stepresult`), [L11] ("done when") |
| 10 | **Virheistä toipuminen kortissa itsessään**: 1–3 todennäköisintä ongelmaa "Jos näet …, tee …" -muodossa, sekä rauhoittava lause ("Mitään ei katoa, voit kokeilla uudelleen"). | Minimalismi: tue virheen huomaamista, tunnistamista ja korjaamista siellä, missä se syntyy. Iäkkäät tekevät enemmän virheitä ja tarvitsevat selkeät virheohjeet. | [L1], [L2] (`steptroubleshooting`), [L8] NN/g |
| 11 | **Erillinen vianetsintäosio, joka on järjestetty oireen mukaan**, otsikkona **täsmälleen ruudulla näkyvä virheteksti tai havainto** ("Julkaise-painike on harmaa", "Punainen teksti: Täytä vielä hakasulkeissa olevat kohdat"). Oire → (lyhyt syy) → numeroidut korjausaskeleet → milloin kääntyä tukihenkilön puoleen. | Lukija hakee virheilmoituksen sanoilla, ei ominaisuuden nimellä. Yksi ongelma per kohta. | [L12] Elastic, [L13] New Relic / troubleshooting-mallit |
| 12 | **Pikaopas yhdelle sivulle**: 5 yleisintä tehtävää, kullekin 3–6 avainaskelta, sekä "Jos hätä tulee" -laatikko (versiohistoria, Hylkää muutokset, tukihenkilö). Tulostetaan ja pidetään näppäimistön vieressä. | Usein toistuvat tehtävät tarvitsevat vain muistinvirkistyksen, ei koko korttia. Pikaopas ei saa vaatia sisällysluetteloa. | [L11] ("if it needs a table of contents, it is not quick") |
| 13 | **Kuvakaappaus jokaisessa kortissa vähintään kerran** (lähtönäkymä), numeroiduin merkinnöin, jotka vastaavat askelnumeroita. Kuva rajataan olennaiseen. | Ruutu ja ohje pitää pystyä yhdistämään silmällä; iäkäs lukija ei löydä "toistokolmiota työkalupalkin oikeasta reunasta" pelkän sanallisen kuvauksen avulla. | [L3] Google images, [L10] screenshot-käytännöt |
| 14 | **Teksti toimii ilman kuvaa**: kuva tukee, ei korvaa. Kaikki ohjeen sisältö on myös tekstinä; kuvassa ei ole selittävää tekstiä, vain numerot. | Saavutettavuus (ruudunlukija, heikko näkö, tulostus mustavalkoisena) ja ylläpidettävyys (teksti on haettavissa ja testattavissa). | [L3] ("Avoid embedding explanatory text in graphics"), [L14] WordPress ("not everyone will be able to see your screenshots") |
| 15 | **Alt-teksti jokaisessa kuvassa**: lyhyt (alle n. 155 merkkiä) kuvaus siitä, mitä kuva näyttää ja mihin merkinnät osoittavat. Ei "Kuva, jossa…". | WCAG 1.1.1; ruudunlukija; myös hakuun. | [L3], [L15] WCAG |
| 16 | **Kuvat pysyvät ajan tasalla automaattisesti** (skripti, development-datasetti, sama ikkunakoko ja data joka ajolla) ja kuvissa ei ole henkilötietoja (repo on julkinen). | Vanhentunut kuva on pahempi kuin ei kuvaa: lukija luottaa kuvaan enemmän kuin tekstiin. | [L3] ("Regularly update screenshots"; "Never include personally identifying information"), docs/25 |
| 17 | **Kontekstuaalinen ohje**: Studion näkymästä pääsee suoraan kyseisen tehtävän korttiin (esim. linkki "Ohje: uutisen kirjoittaminen" uutislomakkeessa tai kentän kuvauksessa), ja kortista pääsee suoraan oikeaan Studion näkymään (painike "Avaa Uutiset Studiossa"). | Ohje tavoittaa lukijan siellä ja silloin kun tarve syntyy; vähentää siirtymiä ja eksymistä. Sanity-tasolla tämä onnistuu intent-linkeillä ja Structure-polulla *(tuntemus: `IntentLink`/`useIntentLink`, `/studio/structure/…`)*. | [L16] contextual help -mallit, [L1] ("immediate opportunity to act") |
| 18 | **Haku, joka löytää lukijan omilla sanoilla**: jokaisella kortilla synonyymit/avainsanat ("blogi", "juttu", "tiedote" → Uutinen; "nappi" → Painike; "poistin vahingossa" → Palauta). Haku kattaa myös vianetsinnän virhetekstit. | Lukija ei tiedä Studion termiä. Vanhaa blogia käyttänyt sanoo "kirjoitus", ei "uutinen". | [L9] Mailchimp (searchable guide), [L12]/[L13] (otsikot lukijan sanoin) |
| 19 | **Tärkein ensin ja vain tarpeellinen**: tausta, historia ("kenttä oli aiemmin nimeltään…", "lista siivottiin 1.10.") ja automaation selitykset pois tehtäväkorteista; ne kuuluvat hakuteokseen tai poistetaan. | Verkkolukija lukee 20–28 % tekstistä; iäkäs lukija tarvitsee enemmän aikaa skannaukseen. | [L7], [L8], [L1] |
| 20 | **Hakuteososa erillään tehtävistä**: "Mikä teksti näkyy missä", Studion valikko, tilamerkit, sanasto, linkkityypit. Tehtäväkortti viittaa hakuteokseen yhdellä linkillä, ei kopioi sitä. | Käsite- ja viitetieto häiritsee tehtävän suorittamista; DITA erottaa concept-, task- ja reference-aiheet. | [L2] |
| 21 | **Lue-ja-tee-vuorottelu tuettu**: korttia voi pitää auki Studion vieressä (sivupaneeli tai oma välilehti), askeleet voi rastia tehdyiksi, ja kortin alussa kerrotaan arvioitu kesto ("noin 5 min"). | Vähentää muistikuormaa ja paikan hukkaamista; GOV.UK step-by-step toimii tarkistuslistana. | [L17] GOV.UK step by step, [L1] |
| 22 | **Tulostettavuus**: A4, vähintään 12 pt (mieluiten 13–14 pt) leipäteksti, rivinväli n. 1,4, vasen tasaus (ei tasapalstaa), korkea kontrasti, ei tietoa pelkän värin varassa (kuvan numerot erottuvat myös harmaasävyinä), jokainen kortti alkaa uudelta sivulta, sivunumerot ja päiväys/versio alatunnisteessa, sisällysluettelo + hakemisto. | Iäkkäät tarvitsevat isomman tekstin; tulosteelta ei voi zoomata eikä hakea. | [L8] NN/g (≥12 pt, kontrasti), [L6] Selkokeskus (ulkoasu), [L15] WCAG 1.4.1 |
| 23 | **Studion sisäinen ohje on saavutettava**: suurennettavissa 200 %:iin ilman sisällön katoamista, kontrasti vähintään 4,5:1, näppäimistöllä käytettävä, isot klikkausalueet, ei toimintoja, jotka vaativat hiiren viemistä kohteen päälle (hover). | Iäkkäiden näkö ja hienomotoriikka heikkenevät; tooltipit ovat hankalia ja puuttuvat kosketusnäytöltä. | [L8], [L15] WCAG 1.4.3, 1.4.4, 2.1.1 |
| 24 | **Rauhoittava, ei pelotteleva sävy**: kerro mikä on peruttavissa ("Luonnos ei näy kävijöille", "Versiohistoriasta saat edellisen version") ennen varoituksia. Varoitukset vain todellisista vaaroista (julkiset tiedostot, pysyvä poisto) ja yhtenäisellä merkinnällä. | Ahdistunut käyttäjä ei uskalla kokeilla; minimalismi kannustaa tutkimaan. Liika varoittelu turruttaa. | [L1] ("encourage and support exploration"), [L5] |
| 25 | **Ohjeelle on omistaja ja ylläpitorutiini**: versio ja päiväys näkyvät, Studio-muutoksen yhteydessä ajetaan kuvaskripti ja nimitesti, ja muutokset kirjataan erilliseen "Mitä uutta" -listaan (ei itse kortteihin). | Ohje vanhenee käyttöliittymän muuttuessa; muutoshistoria ei kuulu tehtävätekstiin. | [L3], [L9] (structured content), docs/25 |

---

### 2. Tehtäväkortin malli: "Uutisen kirjoittaminen"

> Pohja. Rakenne on kiinteä; hakasulkeissa ovat kirjoittajan ohjeet. Kortin pituus tavoitteena yksi
> A4-sivu kuvineen. Studio-nimet on tarkistettava koodista ennen julkaisua.

```markdown
## Kirjoita uutinen

Avainsanat: uutinen, juttu, kirjoitus, blogi, tiedote, julkaise uutinen
Kesto: noin 10 minuuttia
[Painike: Avaa Uutiset Studiossa]   ← intent-linkki uuden uutisen lomakkeeseen

### Milloin
Kun haluat kertoa klubin asioista sivustolla: tapahtumasta, matkasta, ottelusta
tai tiedotteesta. Uutinen näkyy etusivulla ja uutislistassa.

Vuosikokouskutsu tai palloveikkaus? Käytä valmista pohjaa: *Aloita uutinen pohjasta*.

### Ennen kuin aloitat
- Sinulla on otsikko ja teksti valmiina (voit kirjoittaa myös suoraan Studioon).
- Halutessasi yksi kuva tietokoneella tai puhelimessa.

### Askeleet

[KUVA: uutinen-01-lista.png — Studion Sisältö-näkymä, vasen valikko ja Uutiset-lista.
 Merkinnät: (1) Uutiset valikossa, (2) +-painike listan yläreunassa]

1. Vasemmasta valikosta valitse **Uutiset**. ①
2. Listan yläreunassa paina **+**. ②
   Tyhjä uutislomake avautuu oikealle.

[KUVA: uutinen-02-lomake.png — uutislomakkeen yläosa.
 Merkinnät: (3) Otsikko, (4) Osoite sivustolla ja Luo-painike, (5) Sisältö]

3. Kirjoita kenttään **Otsikko** uutisen otsikko. ③
4. Kentän **Osoite sivustolla** vieressä paina **Luo**. ④
   Kenttään ilmestyy otsikosta tehty osoite.
5. Kirjoita tai liitä teksti kenttään **Sisältö**. ⑤
   Kirjoita alkuun pari virkettä, jotka kertovat, mistä jutussa on kyse.
6. Halutessasi lisää kuva kenttään **Kansikuva**: raahaa kuva kenttään ja
   kirjoita **Vaihtoehtoinen teksti**, esim. "Klubilaiset Lahden torilla vappuna".
7. Kohdassa **Kategoriat** rastita sopiva aihe, esim. *Tapahtumat*.

[KUVA: uutinen-03-julkaise.png — lomakkeen alapalkki.
 Merkintä: (8) Julkaise-painike oikeassa alakulmassa]

8. Oikeassa alakulmassa paina **Julkaise**. ⑧

### Tulos
- Painikkeessa lukee hetken **Julkaistu**.
- Uutinen näkyy sivustolla etusivulla ja Uutiset-sivulla minuutin kuluessa.
- Tarkista: avaa www.lahdensuomalainenklubi.com/uutiset.

### Lisävalinnat (ei pakollisia)
- Julkaise myöhemmin → *Ajasta uutinen*
- Lisää kuvia tekstin sekaan tai kuvasarja → *Lisää kuvia uutiseen*
- Lisää YouTube-video → *Lisää video*
- Lyhyt teksti uutislistaan → *Lyhenne ja tiivistelmä* (hakuteos)

### Jos jokin menee vikaan
- **Julkaise-painike ei toimi ja kentän ympärillä on punaista:** jokin pakollinen
  kenttä on tyhjä. Vieritä ylös, täytä punainen kenttä ja paina **Julkaise** uudelleen.
- **Uutinen ei näy sivustolla:** tarkista, että painoit **Julkaise** (pelkkä
  kirjoittaminen tallentaa vain luonnoksen). Odota minuutti ja päivitä sivu.
- **Kirjoitit väärin ja julkaisit jo:** korjaa teksti ja paina **Julkaise** uudelleen.
- **Haluat perua koko julkaisun:** katso *Piilota tai poista uutinen*.

Mikään ei katoa: keskeneräinen uutinen säilyy luonnoksena, vaikka suljet selaimen.

Katso myös: *Aloita uutinen pohjasta* · *Ajasta uutinen* · *Lisää kuvia uutiseen*
Päivitetty: 8.10.2026
```

Huomioita pohjasta:
- Askeleet 1–8 mahtuvat yhdelle näytölle; vapaaehtoiset haarat ovat linkkejä omiin kortteihinsa.
- Kuvan merkintänumero = askelnumero (①…⑧). Kaikilla askelilla ei tarvitse olla merkintää.
- Askelkohtainen tulos (sisennetty rivi) vain, kun ruudulla tapahtuu jotain huomattavaa.

---

### 3. Pikaoppaan ja vianetsinnän mallit

#### 3.1 Pikaopas (1 A4, tulostettava, myös Ohjeet-työkalun etusivu)

```markdown
## Pikaopas: sivuston päivittäminen
Studio: www.lahdensuomalainenklubi.com/studio  · Kirjaudu omalla tunnuksellasi

### Kolme sääntöä
1. Kirjoittamasi tallentuu itsestään luonnokseksi. Kävijät eivät näe sitä.
2. Sivustolle muutos menee vasta, kun painat oikeasta alakulmasta **Julkaise**.
3. Virheen voi aina perua: kellokuvake oikeassa yläkulmassa → edellinen versio.

### Viisi yleisintä tehtävää
| Haluan… | Näin teen | Ohjekortti |
|---|---|---|
| kirjoittaa uutisen | **Uutiset** → **+** → Otsikko → **Luo** → Sisältö → **Julkaise** | s. 5 |
| lisätä ottelun | **Ottelut** → **+** → Aika, Koti, Vieras → **Julkaise** | s. 9 |
| hyväksyä arvostelun | **Tehtävät sinulle** → **Arvostelut odottavat** → lue → **Julkaise** | s. 12 |
| vaihtaa kuvan | avaa sivu → kuva → **Korvaa** → kuvaus → **Julkaise** | s. 15 |
| piilottaa kommentin | **Kommentit ja veikkaukset** → kommentti → **Piilota sivulta** | s. 18 |

[Lopullinen viisikko valitaan käyttöanalyysin (analyysi 3) perusteella.]

### Jos hätä tulee
- Muutos ei näy → painoitko **Julkaise**? Odota minuutti.
- Julkaisu ei onnistu → täytä punaiset kentät.
- Tein virheen → kellokuvake → palauta edellinen versio (3 päivää),
  vanhemmat: **⋯** → **Palauta varmuuskopiosta**.
- Poistin vahingossa → **Sivuston asetukset** → **Varmuuskopiot** → **Palauta poistettu**.
- Aloituksessa punainen rivi → sisältösi on tallessa. Kerro tukihenkilölle rivin teksti.

Tukihenkilö: (yhteystiedot annettu erikseen)      Versio 3.0 · 10/2026
```

Säännöt: ei sisällysluetteloa, ei kappaleita, vähintään 12 pt tulosteessa, yksi sivu. Pikaoppaan
polut ovat sama nimitesti kuin korteissa.

#### 3.2 Vianetsinnän malli (yksi kohta per oire)

```markdown
### Punainen teksti: "Täytä vielä hakasulkeissa olevat kohdat"

Avainsanat: hakasulkeet, täytä, pohja, julkaisu ei onnistu

**Mitä näet:** Kentän alla on punainen teksti, ja **Julkaise**-painike ei toimi.
[KUVA: vika-taytä-01.png — kenttä punaisella reunalla ja virheteksti. Merkintä (1) virheteksti]

**Miksi:** Aloitit uutisen pohjasta, ja tekstiin jäi kohta, jossa lukee [täytä: …].

**Näin korjaat:**
1. Lue virheteksti: se kertoo, mistä kohdasta on kyse.
2. Etsi tekstistä hakasulkeet [ ].
3. Kirjoita tilalle oikea tieto ja poista hakasulkeet.
4. Paina **Julkaise**.

**Ei auttanut?** Ota kuvakaappaus ja lähetä se tukihenkilölle. Luonnos säilyy sillä välin.
```

Vianetsintäosion järjestys:
1. **"En löydä…"** (paikkaa ei löydy: valikko, painike, kenttä)
2. **"Muutos ei näy sivustolla"** (yleisin huoli)
3. **Punaiset virhetekstit** aakkosjärjestyksessä täsmälleen ruudun sanoin
4. **Keltaiset varoitukset** (ei estä julkaisua: "Voit jatkaa")
5. **Aloituksen punaiset ja keltaiset rivit**
6. **Tein virheen / poistin vahingossa** (palautukset)

Otsikko = näkyvä oire tai teksti sellaisenaan. Syy enintään yksi virke. Yleisin ratkaisu ensin.
Jokainen kohta päättyy "Ei auttanut?" -riviin.

---

### 4. Kuvakäytännöt

| Asia | Käytäntö | Perustelu |
|---|---|---|
| **Määrä** | 1–3 kuvaa per tehtäväkortti: aina lähtönäkymä, lisäksi kuva jokaista **uutta näkymää** kohden (lista → lomake → alapalkki). Ei kuvaa jokaisesta askeleesta. Pikaoppaassa 0–1 kuvaa (Studion yleisnäkymä numeroituna). Vianetsinnässä 1 kuva oireesta. | Liikaa kuvia pidentää korttia ja vanhenee; kuva tarvitaan, kun näkymä vaihtuu. [L3], [L10] |
| **Rajaus** | Rajaa tehtävän kannalta olennaiseen alueeseen + sen verran ympäristöä, että lukija tunnistaa paikan (esim. lomakkeen yläosa ja valikon reuna). Ensimmäinen kuva voi olla koko Studio-ikkuna orientaatioksi. Ei selaimen palkkeja, ei käyttöjärjestelmää. | Fokus ja kestävyys käyttöliittymämuutoksia vastaan. [L3] ("crop … future-proofs images") |
| **Ikkunakoko** | Kiinteä, esim. 1280×800 CSS-px, deviceScaleFactor 2 (terävä tuloste). Puhelinkortteihin erikseen 390×844. Sama Studio-teema (vaalea) ja sama testidata joka ajolla. | Toistettavuus: skriptin uusi ajo tuottaa vertailukelpoiset kuvat. |
| **Merkinnät** | Numeroitu ympyrä (esim. halkaisija 28–32 px, valkoinen numero tummalla, ohut valkoinen reunus) kohteen viereen + tarvittaessa ohut kehys (pyöristetty suorakulmio, 3 px) kohteen ympärille. **Yksi korostusväri**, joka ei esiinny Studiossa (esim. tumma oranssi #C2410C tai magenta) ja erottuu harmaasävyinä. Ei nuolia, ei sumennusta, ei tekstiä kuvassa. Numero = askelnumero. Enintään 4–5 merkintää per kuva. | Yhtenäinen tyyli, saavutettavuus ja käännettävyys; teksti kuuluu leipätekstiin. [L3], [L10] |
| **Koko näytössä** | Ohjeet-työkalussa kuva enintään sisältöpalstan levyinen (n. 760–860 px), klikattaessa suurenee. PDF:ssä palstan levyinen, vähintään n. 120 mm. Ei pikkukuvia, joita pitää avata. | Iäkäs lukija ei tulkitse pieniä kuvia; [L14] WordPress: kuvat täysikokoisina. |
| **Tiedostomuoto ja nimi** | PNG (tai WebP verkossa), nimeäminen `kortti-nn-kuvaus.png` (esim. `uutinen-02-lomake.png`). Merkintöjen sijainnit lasketaan DOM-elementeistä (Playwright `boundingBox`), ei kovakoodatuista pikseleistä. | Automaattinen uudelleenajo kestää asettelun muutokset. |
| **Alt-teksti** | Lyhyt, kuvaa näkymän ja merkinnät: "Uutislista. 1: Uutiset vasemmassa valikossa. 2: Plus-painike listan yläreunassa." Alle n. 155 merkkiä; pidempi selitys on tekstissä. | WCAG 1.1.1; [L3]. |
| **Henkilötiedot** | Vain development-datasetin keksittyä testidataa (esim. "Testi Klubilainen"); ei oikeita kommentoijia, sähköposteja tai tukihenkilön nimeä. Kirjautuneen käyttäjän avatar/nimi peitetään 100 % peittävällä laatikolla tai käytetään testitunnusta. | Repo on julkinen; [L3]: peitä täysin, älä sumenna. |
| **Ajantasaisuus** | `npm run ohjekuvat` ajetaan jokaisen Studio-muutoksen jälkeen; skripti vertaa uusia kuvia vanhoihin (pikseliero) ja listaa muuttuneet kortit tarkistettaviksi. Kuvan alla/metatiedoissa päiväys. | Vanhentunut kuva johtaa harhaan. [L3] |
| **Teema ja kieli** | Studio aina suomeksi ja vaalealla teemalla, selaimen zoom 100 %. | Vastaa sihteerin näkymää. |

---

### 5. Arvio nykyisestä docs/09-editor-guide.md:stä

Yleiskuva: sisältö on **asiallisesti erittäin perusteellinen** ja hyvin faktantarkka, ja siinä on jo
hyviä aineksia (numeroidut askeleet monessa kohdassa, "Tyypilliset tilanteet" -taulukko, rauhoittavat
lauseet kuten r. 49, Studio-nimet lihavoituina). Mutta se on kirjoitettu **kattavaksi viitedokumentiksi
kehittäjän näkökulmasta**, ei tehtäväohjeeksi iäkkäälle lukijalle. 1 214 riviä (~40 000 tokenia), ei
yhtään kuvaa. Kymmenen suurinta ongelmaa:

1. **Ei yhtään kuvaa; sijainnit kuvataan sanallisesti ja hankalasti.** Esim. r. 213–215 "paina kentän
   työkalupalkin oikeasta reunasta toistokolmiota ▷ (kapealla näytöllä **⋯**-painikkeesta *Näytä
   lisää* → *YouTube-video*)", r. 379–380 "kuvaketta, jossa on kaksi kuvaa päällekkäin", r. 1066,
   r. 873 "**⌄**-valikko". Rikkoo kriteerejä 13–14. Juuri näissä kohdissa kuva numeroinnilla poistaisi
   arvailun.

2. **Askeleet sisältävät kokonaisia lukuja.** "Uutisen kirjoittaminen" askel 4 (r. 205–229) on 25 riviä:
   kansikuva, kuvat tekstissä, kuvasarja, YouTube (myös aloituskohta), linkit ja luettelo siitä, missä
   tekstikentissä lisäosat toimivat. Askel 3 (r. 201–204) selittää Lyhenteen ja Tiivistelmän
   keskinäisen logiikan. Liitteen askel 4 (r. 326–339) on 14-rivinen erikoismenettely. Rikkoo
   kriteerejä 3–4. Lukija hukkaa paikkansa.

3. **Tehtävät, käsitteet ja hakuteos sekaisin; tärkein ei ole ensin.** Ennen ensimmäistä tehtävää
   (r. 193) lukija kahlaa Aloituksen tilarivit (r. 38–70), tilamerkit (r. 89–104), linkkityyppien
   teorian (r. 106–148) ja koko Studion valikon (r. 150–189). "Mikä teksti näkyy missä" -taulukko
   (r. 233–239) ja Jakokuva-osio (r. 398–420) ovat tehtävien keskellä. Rikkoo kriteerejä 19–20.

4. **Teknistä ja kehittäjän sanastoa.** r. 33–35 "Administrator", "(docs/17 §A3)", "API, CORS,
   tokenit, webhookit"; r. 97 ja 1077 "migraatio"; r. 58 "dokumenttikiintiö … 10 000 dokumentin
   rajasta"; r. 1207–1208 "tämän repositorion ((repon osoite)) ja ohjeen docs/17 §A3";
   r. 1213 "sanity.io/manage → **Members** → **Invite**"; r. 750 "footerissa". "Dokumentti" esiintyy
   läpi oppaan selittämättä. Rikkoo kriteeriä 8.

5. **Muutoshistoriaa ja väliaikaisia huomautuksia tehtäväteksteissä.** r. 8–10 versiohuomautus,
   r. 199 "(Kentän nimi oli aiemmin *Polku*.)", r. 766–769 "kunnes kehittäjä vaihtaa ne
   sivuvalinnoiksi", r. 806–807 "kehittäjä siirtää ne uuteen muotoon", r. 1085 "Lista siivottiin
   1.10.2026". Nämä vanhenevat nopeasti ja hämmentävät. Rikkoo kriteerejä 19 ja 25.

6. **Tulos puuttuu useimmista tehtävistä.** Esim. Uutisen kirjoittaminen päättyy "6. **Julkaise**."
   (r. 231) kertomatta, mistä tietää onnistuneensa; samoin Uusi sivu (r. 605), Kuvan vaihtaminen
   (r. 689), Valikon muokkaaminen (r. 764). Vain osassa on tulos (esim. r. 551, r. 804). Rikkoo
   kriteeriä 9.

7. **Vianetsintä on hajallaan eikä järjesty ruudulla näkyvän oireen mukaan.** Yleinen taulukko on
   lopussa (r. 1120–1138), mutta virheilmoitukset on myös ripoteltu: linkkien varoitukset r. 134–148,
   lyhytosoitteen virheet r. 660–665, "Esikatselutila"-palkki arvostelujen hyväksymisen keskellä
   (r. 859–862), poistoikkunat r. 669–675. Taulukon solut ovat pitkiä (r. 1130 yli 80 sanaa). Rikkoo
   kriteerejä 10–11.

8. **Epäjohdonmukaiset nimet ja englanninkieliset rinnakkaisnimet.** Kuvan kuvaus on milloin
   "Vaihtoehtoinen teksti" (r. 291), "Vaihtoehtoinen teksti (alt)" (r. 687), "alt-teksti" (r. 955),
   "Mitä kuvassa on" (r. 387, 711) tai "Kuvaus" (r. 881). Englanniksi: "Julkaise (Publish)" (r. 74),
   "**Korvaa** (Replace)" (r. 686), "*Embed on my site*" (r. 364). Valikkopolkujen merkintätapa
   vaihtelee (r. 647 vs. r. 750). Rikkoo kriteeriä 6, eikä nimiä voi nyt testata automaattisesti.

9. **Pitkät ja monimutkaiset virkkeet; reunatapaukset pääpolulla.** Esim. r. 992–1000 (taulukon
   sijainti: kolme ehtoa sisäkkäin, lainaus lainauksen sisällä), r. 239 (neljän tason varajärjestys),
   r. 128–130, r. 624–626 (Aiemmat osoitteet: viisi dokumenttityyppiä ja kaksi sijaintia yhdessä
   virkkeessä), r. 667–682 (poisto + kaksi ikkunaa + ohjaus). Selkokielen tavoite (alle 15 sanaa)
   ylittyy usein moninkertaisesti. Rikkoo kriteeriä 7.

10. **Ei pikaopasta eikä priorisointia; harvinainen ja yleinen samalla painolla.** Kaikki ~40 aihetta
    ovat samalla otsikkotasolla (###) samassa jonossa: harvinaiset (Kokoonpano pelikentälle r. 1060,
    Maailman parhaat r. 967, Kansojen liiga r. 1051) yhtä näkyvästi kuin viikoittaiset (uutinen,
    ottelu, arvostelun hyväksyminen). Ensimmäistä kertaa avaava ei tiedä, mistä aloittaa. Lisäksi
    ohje nojaa hover-vihjeisiin (r. 93 "Kun viet osoittimen merkin päälle", r. 277), jotka eivät toimi
    puhelimessa ja ovat iäkkäälle hankalia. Rikkoo kriteerejä 12 ja 23.

Muita havaintoja (ei kymmenen joukossa): varoitusten sävy on paikoin pelottava ja toistuva ("Tiedosto
on julkinen" kolmesti: r. 119, 297, 322); ohjauksen kohteen "Muu osoite"-säännöt (r. 114–117)
edellyttävät URL-käsitteiden ymmärtämistä; "Täytä itse" -tarkistuslista (r. 1089–1109) on
kehittäjän tehtävälista eikä kuulu käyttäjäohjeeseen.

---

### Lähteet

- [L1] Carroll & van der Meij: minimalismin periaatteet. https://tecfa.unige.ch/themes/sa2/act-app-dos2-fic-minimali.htm ; https://aura-lab.siue.edu/theories/minimalism/ ; Williams & Farkas, *Minimalism Reconsidered*: https://faculty.washington.edu/farkas/dfpubs/Williams-Farkas-MinimalismReconsidered.pdf
- [L2] OASIS DITA 1.3 task topic ja taskbody (prereq, context, steps, step/cmd, stepresult, steptroubleshooting, result). https://docs.oasis-open.org/dita/dita/v1.3/os/part2-tech-content/archSpec/technicalContent/dita-task-topic.html ; https://dita-lang.org/dita-techcomm/langref/technicalcontent/taskbody
- [L3] Google developer documentation style guide: Images (rajaus, alt ≤155 merkkiä, numeroidut merkinnät, ei tekstiä kuvaan, henkilötiedot 100 % peittävällä, päivitys). https://developers.google.com/style/images
- [L4] Microsoft Writing Style Guide: Writing step-by-step instructions. https://learn.microsoft.com/en-us/style-guide/procedures-instructions/writing-step-by-step-instructions
- [L5] Kotimaisten kielten keskus: hyvä virkakieli, *Hyvään virkakieleen* -ohjelma, eOppiva-kurssit. https://kotus.fi/files/8228/Hyvaan_virkakieleen_2020.pdf ; https://www.eoppiva.fi/kokoelmat/hyva-virkakieli/
- [L6] Selkokeskus: selkokieli, selkomittari, kohderyhmät (yli 65-vuotiaista 15–20 %). https://selkokeskus.fi ; tutkimuskatsaus: https://journal.fi/pk/article/download/75679/49889/146730 *(selkokeskuksen kirjoitusohjesivua ei saatu auki; ulkoasusäännöt tuntemuksen varassa)*
- [L7] Helsingin kaupunki: Verkkokirjoittamisen ohjeet (lyhyet virkkeet, 2–3 virkettä kappaleessa, tärkein ensin, lukijat lukevat 20–28 %). https://www.hel.fi/fi/paatoksenteko-ja-hallinto/helfin-sisallontuottajan-opas/kirjoittamisen-tueksi/verkkokirjoittamisen-ohjeet
- [L8] Nielsen Norman Group: Usability for Senior Citizens (onnistumisprosentti 55 % vs 75 %, fonttikoko, kontrasti, virheilmoitukset). https://www.nngroup.com/articles/usability-for-senior-citizens/
- [L9] Mailchimp Content Style Guide: Creating Structured Content; haettava ohje. https://styleguide.mailchimp.com/creating-structured-content/
- [L10] Kuvakaappauskäytännöt (yksi korostusväri ja muoto, minimaaliset merkinnät, rajaus). https://www.docsie.io/blog/glossary/annotated-screenshots/ ; https://www.screensnap.pro/blog/technical-documentation-screenshots-guide
- [L11] Quick reference guide -mallit (yksi tehtävä, 1–2 sivua, enintään 10 askelta, rakenne title–when–before–steps–done when–troubleshooting). https://docsio.co/blog/quick-reference-guide-template ; https://www.glitter.io/blog/process-documentation/quick-reference-guide-template
- [L12] Elastic docs: troubleshooting content type (oire käyttäjän näkökulmasta, yleisin ratkaisu ensin, yksi ongelma per sivu). https://www.elastic.co/docs/contribute-docs/content-types/troubleshooting
- [L13] New Relic: troubleshooting docs template (problem–solution–cause, tarkka virheteksti otsikkoon). https://docs.newrelic.com/docs/style-guide/writing-docs/article-templates/troubleshooting-docs-guide/
- [L14] WordPress Documentation Team: Handbooks style and formatting guide (kuvat täysikokoisina, teksti ei saa nojata kuviin). https://make.wordpress.org/docs/handbook/documentation-team-handbook/handbooks-style-and-formatting-guide/
- [L15] WCAG 2.1: 1.1.1, 1.4.1, 1.4.3, 1.4.4, 2.1.1. https://www.w3.org/TR/WCAG21/ *(tuntemus)*
- [L16] Kontekstuaalisen ohjeen mallit (inline-ohje, ohjevalikko, syvälinkit). https://www.chameleon.io/blog/contextual-help-ux ; Sanity Studio tools: https://www.sanity.io/docs/studio/tools-cheat-sheet
- [L17] GOV.UK Design System: Step by step navigation (numeroitu polku, tarkistuslista, koko polku näkyy ennen aloitusta). https://design-system.service.gov.uk/patterns/step-by-step-navigation

## Analyysi 2: kattavuusauditointi (opas docs/09 vs. koodi), 8.10.2026

Lähteet: `docs/09-editor-guide.md` (v2.4, 1213 riviä), `sanity.config.ts`, `sanity/structure.ts`,
`sanity/schemas/**`, `sanity/pohjat.ts`, `sanity/merkit.ts`, `sanity/actions/**`, `sanity/components/**`,
`sanity/plugins/aloitus.tsx`, `sanity/lib/tehtavat.ts`, `lib/sivuston-tila.ts`, `lib/sijainnit.ts`,
`lib/osiosivut.ts`, `lib/pohjat.ts`, `lib/tilasto-kategoriat.ts`, Sanityn suomennos
`node_modules/@sanity/locale-fi-fi/dist/*` (v1.1.40, Sanity ^5.25), docs/23, docs/24, git log -30.
Repoon ei tehty muutoksia. "Opas:N" = docs/09:n rivi N.

Merkinnät: **K** = kyllä (ohje on ja vastaa koodia), **O** = osittain (mainittu, mutta askel, nimi
tai polku puuttuu tai on epätarkka), **E** = ei mainita.

---

### A) Tehtäväinventaario

Polku on Studion vasemman valikon nimillä (`sanity/structure.ts`). "→ välilehti X" = lomakkeen ryhmä.

#### A1. Kirjautuminen, Aloitus, yleiset

| # | Tehtävä | Studion polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 1 | Kirjautuminen omalla tunnuksella | /studio | K | 24–31 |
| 2 | Aloituksen lukeminen: Sivuston tila (5 riviä, yhteenveto) | Yläpalkki **Aloitus** → *Sivuston tila* | K | 38–61 |
| 3 | Tilan päivitys kesken käytön | Aloitus → **Päivitä** | K | 42 |
| 4 | Odottavat tehtävät korteista | Aloitus → *Odottaa sinua* → kortti | K | 63–66 |
| 5 | Puuttuvat perustiedot (sähköposti, osoite, puhelin, hallitus, Klubista-kuva) | Aloitus → *Täydennä perustiedot* → linkki | K | 68–70 |
| 6 | Julkaisemattomat muutokset rivin linkistä | Aloitus → *Avaa julkaisemattomat muutokset* | O (linkin nimeä ei) | 57 |
| 7 | Tehtävälistojen käyttö | **Tehtävät sinulle** → Arvostelut odottavat hyväksyntää / Uudet kommentit (7 päivää) / Julkaisemattomat muutokset / Ajastetut uutiset / Vaatii tarkistuksen (kaikki) | K | 152–160 |
| 8 | Julkaiseminen | Dokumentti → **Julkaise** | K | 74–76 |
| 9 | Muutoksen hylkääminen (luonnoksen peruminen) | Dokumentti → toimintovalikko → **Hylkää muutokset** (+ Sanityn vahvistus "Hylätäänkö muutokset?") | O (vahvistusikkunaa ei) | 157–158, 335, 1177 |
| 10 | Esikatselu | Yläpalkki **Esikatselu**; lomakkeen *Käytetty yhdellä sivulla* | O (Esikatselu-työkalun käyttöä ei ohjeisteta) | 79–83 |
| 11 | Esikatselutilasta poistuminen sivustolla | Sivuston palkki **Poistu esikatselusta** | K | 859–862 |
| 12 | Versiohistoriasta palautus (< 3 pv) | Dokumentti → historia → Palauta | O (kuvake/sijainti tarkistamatta, ks. B) | 84–87, 1133 |
| 13 | Tilamerkkien tulkinta (Ajastettu, Tarkistettava, Odottaa toista arvioijaa, Piilotettu) | Dokumentin alapalkki | K | 89–104 |
| 14 | Studion haku (dokumentin etsiminen nimellä) | Yläpalkin haku | O (vain tietosuojapyynnössä) | 1115 |
| 15 | Studion käyttö puhelimella | – | O (sivumainintoja) | 195, 278–280, 383 |
| 16 | Uuden käyttäjän kutsuminen | sanity.io/manage → Members → Invite | K | 34–35, 1212–1213 |

#### A2. Linkit ja tekstieditori

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 17 | Linkin kohteen valinta (Sivuston sivu / Muu osoite / Tiedosto) | mikä tahansa linkkikenttä → **Mihin linkki vie?** | K | 106–148 |
| 18 | Käyttämättömän sivuvalinnan tyhjennys | kentän ⋯ → **Tyhjennä** | K | 143–145 |
| 19 | Käyttämättömän tiedoston tyhjennys linkistä | kentän ⋯ → **Tyhjennä kenttä** (varoitus linkki.ts:142) | E | – |
| 20 | Tekstilinkki | tekstikenttä → ketjukuvake → Mihin linkki vie? | K | 221–223 |
| 21 | Tekstilinkin avaaminen uuteen välilehteen | linkki → **Avaa uuteen välilehteen** | E | – |
| 22 | Tekstin muotoilu (Otsikko 2–4, Lainaus, Luettelo, Numeroitu, Lihava, Kursiivi, Alleviivattu) | tekstieditorin työkalupalkki | O ("otsikoita, listoja") | 208 |
| 23 | Kuva tekstiin | työkalupalkki → *Kuva* | K | 209, 291 |
| 24 | Kuvasarja | työkalupalkki → *Kuvasarja (useita kuvia)* | K | 377–396 |
| 25 | YouTube-video | työkalupalkki → *YouTube-video* | K | 213–220 |
| 26 | Kartta, lomake tai Vimeo | työkalupalkki → *Kartta, lomake tai Vimeo-video* | K | 354–375 |
| 27 | Huomiolaatikko | työkalupalkki → *Huomiolaatikko* | K | 295, 301–308 |
| 28 | Painike | työkalupalkki → *Painike* | K | 296, 310–312 |
| 29 | Liite (PDF, Word, Excel) | työkalupalkki → *Liite (PDF, Word, Excel)* | K | 297, 314–339 |
| 30 | Liitetiedoston pikapoisto (henkilötiedot) | Liite → Tiedosto → Valitse → rivin valikko → Poista | K | 331–339 |
| 31 | Tekstin taulukko | työkalupalkki → *Taulukko* | K | 298, 341–352 |
| 32 | Kokoonpano pelikentällä | työkalupalkki → *Kokoonpano pelikentällä* | K | 299, 1060–1073 |
| 33 | Kuvan kuvateksti | kuva → **Kuvateksti (valinnainen)** | E | – |
| 34 | Kuvan rajaus ja tarkennuspiste (hotspot, kaikissa kuvissa `options.hotspot`) | kuva → rajaustyökalu | E | (413 neuvoo vain "tärkein kohta keskellä") |

#### A3. Uutiset, kategoriat, tunnisteet, kommentit

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 35 | Uutisen kirjoittaminen | **Uutiset** → + → pohja *Uutinen* | O (askel 1 ei kerro, että + avaa pohjavalikon) | 193–231 |
| 36 | Mikä teksti näkyy missä (Tiivistelmä/Lyhenne/Kuvaus hakutuloksissa) | Uutinen | K | 233–244 |
| 37 | Ajastus | Uutinen → **Julkaisuaika** → Julkaise | K | 246–250 |
| 38 | Valmiit pohjat (Vuosikokouskutsu, Palloveikkauksen tilanne, Palloveikkaus: uusi kausi) | Uutiset → + / yläpalkin **Luo** | K | 252–272 |
| 39 | Jakokuva | (automaattinen) | K | 398–420 |
| 40 | Uusi uutiskategoria | **Uutiskategoriat** → + / uutisen *Lisää uusi kategoria* | K | 422–432 |
| 41 | Kategorian nimen/osoitteen vaihto, poisto | Uutiskategoriat → kategoria | K | 434–438 |
| 42 | Kategorian hakukonekuvaus | Uutiskategoria → **Kuvaus hakukoneille (valinnainen)** | E | (595 viittaa) |
| 43 | Tunnisteet | Uutinen → **Tunnisteet** | K | 455–482 |
| 44 | Uutisen lähde (palloliitto.fi ym.) | Uutinen → **Lähde** (Lähteen nimi / osoite / päiväys) | E | – |
| 45 | Linkki alkuperäiseen kirjoitukseen | Uutinen → **Alkuperäinen kirjoitus (linkki)** | E | – |
| 46 | Hakutuloksen otsikko | välilehti *Hakukoneet ja jako* → **Otsikko hakutuloksissa (valinnainen)** | E | – |
| 47 | Veikkaus/kommentointi uutisen alle (Sarjajärjestys, Voittajaveikkaus, Kommentti) | Uutinen → välilehti **Kommentit ja veikkaus** | O (**Ohje jäsenille**, **Montako sijaa veikataan**, **Kysy myös maalikuningasta** vain epäsuorasti) | 484–502 |
| 48 | Kommenttien valvonta | **Kommentit ja veikkaukset** → Uusimmat / Uutisittain / Piilotetut | K | 504–508 |
| 49 | Kommentin piilotus ja palautus | Kommentti → **Piilota sivulta** / **Näytä sivulla** | K | 510–513 |
| 50 | Kommentin pysyvä poisto | Kommentti → ⋯ → **Poista pysyvästi** | K | 515–516, 1116 |
| 51 | Kopioi pohjaksi | Dokumentti → ⋯ → **Kopioi pohjaksi** | K | 518–523, 628–633 |

#### A4. Ottelut, tapahtumat, galleria

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 52 | Ottelun lisääminen | **Ottelut** → + | O (kenttänimet väärin, ks. B2) | 525–537 |
| 53 | Ottelun muokkaus/poisto, pelattu ottelu | Ottelut → ottelu | O (vain "Ottelu on jo pelattu" -maininta) | 83 |
| 54 | Etusivun ja /ottelut-sivun seuralista | Sivuston asetukset → Etusivu → välilehti Lohkot → *Otteluohjelma ja tapahtumat* → **Näytä myös näiden seurojen ottelut** | O (polku vajaa, ks. B3) | 539–544, 739–740 |
| 55 | Tapahtuman lisääminen | **Tapahtumat** → + | O (kenttänimet, Ilmoittautuminen-välilehti, Juhlatapahtuma puuttuvat) | 546–565 |
| 56 | Galleria-albumi | **Galleria-albumit** → + | O (**Liittyvä tapahtuma**, **Kuvateksti** puuttuvat) | 706–714 |
| 57 | Tyhjä osio esiin valikkoon (Tapahtumat, Galleria) | Navigaatio | K | 553–557, 776–780 |

#### A5. Sivut, osioiden sivut, Klubi

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 58 | Uusi sivu | **Sivut** → + | K | 597–605 |
| 59 | Sivun taulukot | Sivu → **Taulukot** | K | 607–609 |
| 60 | Sivun kieli | Sivu → **Sisällön kieli** | K | 611–612 |
| 61 | Sivun yläkuva | Sivu → **Iso kuva sivun yläosassa** | E (vain jakokuvan yhteydessä "sivun yläkuva") | 404–405 |
| 62 | Osion sivun otsikko, johdanto, hakukoneteksti | **Osioiden sivut** → Uutiset ja tapahtumat / Ravintolat / Jalkapalloarkisto → sivu | K | 567–595 |
| 63 | Arkiston etusivun korttiteksti | Osioiden sivut → Jalkapalloarkisto → sivu → **Teksti arkiston etusivun kortissa** | K | 589–590 |
| 64 | Klubi-sivun esittely ja kuva | **Klubi → Esittely** | O (valikkokuvaus, ei ohjetta) | 178 |
| 65 | Toiminta-sivun johdanto | **Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto** | K | 811 |
| 66 | Klubin toiminta: uusi vuosi | **Klubi → Toiminta → Toimintamuodot** → toiminta → välilehti **Vuosittain** | K | 795–807 |
| 67 | Uusi toimintamuoto | Klubi → Toiminta → Toimintamuodot → + | E | – |
| 68 | Toimintamuodon järjestys | Toimintamuoto → **Järjestys listassa** | K | 809–810 |
| 69 | Toimintamuodon taulukot ja kuvat | Toimintamuoto → **Tilastotaulukot** (välilehti Vuosittain), **Kuvat** | E | – |
| 70 | Hallituksen uusi jäsen | **Klubi → Hallitus → Nykyinen hallitus** → + | K | 784–786 |
| 71 | Jäsen jää hallituksesta | jäsen → **Nykyinen jäsen** pois | K | 788–790 |
| 72 | Hallitus-sivun johdanto | **Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto** | K | 792–793 |
| 73 | Palloveikkaus-sivu | **Klubi → Palloveikkaus → Palloveikkaus-sivu** | O (mainittu, ei ohjetta) | 182, 979 |
| 74 | Uusi veikkauksen alasivu | **Klubi → Palloveikkaus → Veikkausten alasivut** → + | K | 974–982 |
| 75 | Yhteystiedot | **Klubi → Yhteystiedot → Osoite, sähköposti ja some** | K | 748–751, 1093–1095 |
| 76 | Yhteystiedot-sivun johdanto | **Klubi → Yhteystiedot → Yhteystiedot-sivun otsikko ja johdanto** | O (vain valikkolistassa) | 183–184 |

#### A6. Sivuston asetukset

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 77 | Etusivun yläosa (Pääjuttu, Pääjuttu näkyy asti, Taustakuva, Pikalinkit, laskuri) | **Sivuston asetukset → Etusivu** → välilehti **Yläosa** | K | 716–733 |
| 78 | Klubin nimi yläosassa (etusivun H1) | Etusivu → Yläosa → **Klubin nimi yläosassa** | E | – |
| 79 | Etusivun hakukonekuvaus (pakollinen) | Etusivu → välilehti Hakukoneet ja jako → **Etusivun kuvaus hakukoneille** | O | 733 |
| 80 | Lohkojen järjestys, piilotus, poisto | Etusivu → välilehti **Lohkot** | K | 734–740 |
| 81 | Uuden lohkon lisääminen ja lohkotyypit (Jutut, Otteluohjelma ja tapahtumat, Tulevat tapahtumat, Esittelyteksti (Klubista), Ravintola-arviot, Jalkapalloarkisto-nosto, Galleria-nosto) | Lohkot → + | O (vain "+"; tyyppien nimet ja asetukset puuttuvat) | 734 |
| 82 | Lohkojen asetukset (Näytettävien määrä, Otsikko, Yläotsake, Kaupunki (suodatin), Näytä vain Huuhkajien ja valittujen seurojen ottelut, Napin teksti) | Lohko → kentät | O (vain Esittelyteksti ja Jalkapalloarkisto-nosto) | 741–745 |
| 83 | Valikon muokkaus, alavalikko | **Sivuston asetukset → Navigaatio** | K | 753–780 |
| 84 | Alatunniste | (johdetaan valikosta) | K | 771–775 |
| 85 | Lyhytosoite | **Sivuston asetukset → Ohjaukset ja lyhytosoitteet → Lyhytosoitteet ja ohjaukset** → + | K | 642–665 |
| 86 | Muuttuneet osoitteet -lista | … → **Muuttuneet osoitteet (automaattiset)** | K | 624–626 |
| 87 | Osoitteen muuttaminen | Dokumentti → **Osoite sivustolla** → Julkaise | K | 614–640 |
| 88 | Poisto/julkaisun peruminen, kun vanhoja osoitteita on | ⋯ → Poista / Poista julkaisu → **Poista silti** / **Poista julkaisu silti** → Sanityn **Poista nyt** / **Peruuta julkaisu nyt** | K | 667–682 |
| 89 | Viittauksen estämän poiston selvitys | Sanityn ikkuna "Et ehkä voi poistaa…" | K | 1130 |
| 90 | Varmuuskopiot: tila ja lataus talteen | **Sivuston asetukset → Varmuuskopiot** → kopio → tiedostokentän ⋯ → **Lataa** | K | 1153–1164 |
| 91 | Vanhan version palautus (> 3 pv) | Dokumentti → ⋯ → **Palauta varmuuskopiosta** | K | 1166–1181 |
| 92 | Poistetun palautus | Varmuuskopiot → kopio → välilehti **Palauta poistettu** → Palauta → Avaa | K | 1183–1191 |

#### A7. Ravintolat

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 93 | Klubilaisen pisteet | **Ravintolat → Klubilaisten arvosanat → Ravintoloittain** → ravintola → + | K | 820–824 |
| 94 | Uusintakäynti | sama → arvosana | K | 825–828 |
| 95 | Klubilaisen arvosanan poisto (arvosana palautuu "Aiempi arvosana" -tasolle, ravintola voi pudota piiloon) | arvosana → ⋯ → Poista | E | – |
| 96 | Uusi klubilainen / lopettaa | **Ravintolat → Klubilaiset** | K | 829–834 |
| 97 | Odottavat toista arvioijaa | **Ravintolat → Ravintolat: odottavat toista arvioijaa** | O (polku väärin, ks. B4) | 838–844 |
| 98 | Arvostelun hyväksyntä | **Ravintolat → Arvostelut: odottavat hyväksyntää** → Julkaise | K | 854–875 |
| 99 | Arvostelun hylkäys | ⋯ → **Hylkää arvostelu** → Vahvista | K | 873–875 |
| 100 | Sopimattoman kuvan poisto arvostelusta | Kuvat → ⋯ → Poista | K | 879–880 |
| 101 | Uusi ravintola arvostelusta | → **Hyväksy ja luo ravintola** → Vahvista | K | 888–912 |
| 102 | Julkaistun arvostelun muokkaus/poisto | **Ravintolat → Arvostelut: kaikki** → ⋯ → **Poista arvostelu** | O (lista "Arvostelut: kaikki" puuttuu) | 884, 1116 |
| 103 | Käynnit | Ravintola → välilehti **Arvostelu** → **Käynnit** | K | 850–852 |
| 104 | Ravintolan tietojen täydennys (kuva, osoite) | **Ravintolat → Kaikki ravintolat** → ravintola | O | 908–909 |
| 105 | Ravintolan kortin tekstit (Tuomio yhdellä rivillä, Matka stadionille…, Sanallinen arvostelu, Ottelupäivänä, Plussat, Miinukset, Hintaluokka, Käynnin yhteys) | Ravintola → välilehdet Perustiedot/Arvostelu | E | – |
| 106 | Ravintola lopettanut | Ravintola → **Toiminta loppunut** + **Lisätieto lopettamisesta** | E | – |
| 107 | Ravintolan sijainti (Kaupunki, Katuosoite, Postinumero, Karttapaikka) | Ravintola → välilehti **Sijainti** | E | – |
| 108 | Uusi kaupunki, maakunta | **Ravintolat → Kaupungit** → + | K | 919–935 |
| 109 | Ravintola käsin ilman arvostelua | Kaikki ravintolat → + | E | – |
| 110 | Arvostelulomakkeen jakaminen klubilaisille (/ravintolat/arvostele, kotinäytön sovellus) | sivusto | E | (843–844 sivuaa) |

#### A8. Jalkapalloarkisto

| # | Tehtävä | Polku | Oppaassa | Opas-rivi |
|---|---|---|---|---|
| 111 | Tilastotaulukon muokkaus | **Jalkapalloarkisto → Tilastot** → ryhmä → taulukko → välilehti **Tilastodata** | K | 984–1030 |
| 112 | Uusi taulukko ryhmään | Tilastot → ryhmä → + | K | 1002–1005 |
| 113 | Taulukon sivun selvitys | *Käytetty yhdellä sivulla* | K | 992–1000 |
| 114 | Huuhkajat-taulukko | **Jalkapalloarkisto → Tilastot → Huuhkajat** → + | K | 1032–1045 |
| 115 | Kansojen liigan kausi | taulukko → **Kauden ottelut ja tulokset** | K | 1051–1058 |
| 116 | Karsintasarjan taulukko | Tilastot → **Karsinnat** → + | O | 1047–1049 |
| 117 | Ulkomaiset mestarit -taulukko | Tilastot → Muut arkiston taulukot → **Maa Ulkomaiset mestarit -sivulla** | E | – |
| 118 | Taulukon Johdanto, Lisätiedot taulukon jälkeen, Tiedot päivitetty, Lähteet | taulukko | O (vain Lisätiedot kokoonpanossa) | 1065 |
| 119 | Järkytykset, Maailman parhaat | Tilastot → Muut arkiston taulukot | K | 961–972 |
| 120 | Uusi arvokisa (esim. EM 2028) | **Jalkapalloarkisto → Arvokisat** → + | E | – |
| 121 | Uusi/muokattu pelaaja (Ura, Seurat, Saavutukset ja palkinnot, Uutisten tunniste) | **Jalkapalloarkisto → Pelaajat** | O (vain Litmanen) | 943–946 |
| 122 | Uusi stadion | **Jalkapalloarkisto → Stadionit** → + | E | – |
| 123 | Litmanen: uusi lehtijuttu | **Jalkapalloarkisto → Lehtileikkeet** → + | K | 948–952 |
| 124 | Litmanen: patsaskuva | Pelaajat → Jari Litmanen → välilehti **Patsas** | K | 954–955 |
| 125 | Tarkistettavat | **Tarkistettavat** → tyyppi | K | 1075–1087 |
| 126 | Tietosuojapyyntö | haku → Poista pysyvästi / Poista arvostelu | K | 1111–1118 |

**Yhteensä 126 tehtävää: K 76, O 30, E 20.**

---

### B) Virheet: opas ei vastaa koodia

| # | Opas-rivi | Mitä oppaassa lukee | Mitä koodissa on |
|---|---|---|---|
| B1 | 29–30 | "Yläpalkissa ovat **Aloitus**, **Sisältö** ja **Esikatselu**." | Ylläpitäjä (opas:33 kertoo roolin Administrator) näkee myös työkalun **Kyselyt (kehittäjä)** (`sanity.config.ts:122`, rajaus `:127–130`). Lisäksi `sanity.config.ts:126` kommentti sanoo "sihteerin (Editor)", mikä on ristiriidassa oppaan rivin 33 kanssa. |
| B2 | 531 | "**Aika** (päivä ja kellonaika), **Koti** ja **Vieras**" | Kentät ovat **Alkamisaika**, **Kotijoukkue**, **Vierasjoukkue** (`sanity/schemas/documents/ottelu.ts:45, 52, 61`). |
| B3 | 542–543 | "Valinnat löytyvät kohdasta **Etusivu → Otteluohjelma ja tapahtumat**" | Polku: **Sivuston asetukset → Etusivu** → välilehti **Lohkot** → lohko *Otteluohjelma ja tapahtumat* (`structure.ts:409–418`, `etusivu.ts:50, 213`). |
| B4 | 839–840 | "listassa **Ravintolat → Odottavat toista arvioijaa**" | Valikon kohta on **Ravintolat: odottavat toista arvioijaa** (`structure.ts:589`); vain avautuvan listan otsikko on "Odottavat toista arvioijaa" (`:594`). |
| B5 | 186 | "klubilaisten arvosanat (**Ravintoloittain** tai **Kaikki**)" | Kohta on **Kaikki (uusin ensin)** (`structure.ts:136`). Rivi 824 on oikein. |
| B6 | 185–187 | Ravintolat-luettelosta puuttuvat valikon kohdat; Jalkapalloarkisto: "tilastot, arvokisat, pelaajat ja stadionit" | Ravintolat sisältää myös *Ravintolat: odottavat toista arvioijaa*, *Arvostelut: kaikki* ja *Klubilaiset* (`structure.ts:589, 615, 623`); Jalkapalloarkistossa on myös **Lehtileikkeet** (`structure.ts:640`). |
| B7 | 766–769 | "Vanhat linkit näkyvät kohdassa **Muu osoite** (esim. `/ottelut`), kunnes kehittäjä vaihtaa ne sivuvalinnoiksi; siihen asti … keltainen 'Tälle sivulle on parempi valinta'." | Vanhentunut: P5 ajettiin productioniin 8.10.2026 klo 14.16 (navigaatio 16 viittausta, docs/24 rivi 10 ja P5-rivi). Valikon linkit ovat nyt *Sivuston sivu* -viittauksia. |
| B8 | 806–807 | "Vanhojen vuosien linkit toimivat …, vaikka kohta **Mihin linkki vie?** on niissä vielä tyhjä: kehittäjä siirtää ne uuteen muotoon." | Vanhentunut: P5 antoi kaikille vanhoille linkkiobjekteille `tyyppi` (viittaus tai `osoite`) (docs/24 P5). Kenttä ei ole enää tyhjä. Vanha `url` on piilotettu, lukittu kenttä **Vanha osoite** (`klubiToiminta.ts:148–152`), joka poistetaan P11:ssä aikaisintaan 22.10. |
| B9 | 995–997 | "lisää se sivun, klubin toiminnan tai pelaajan kohtaan **Taulukot**" (sama teksti myös Studiossa `lib/sijainnit.ts:99`) | Vain sivulla kenttä on **Taulukot** (`sivu.ts:175`). Klubin toiminnassa ja pelaajalla se on **Tilastotaulukot** (`klubiToiminta.ts:178` välilehti *Vuosittain*, `pelaaja.ts:217` välilehti *Ura*), samoin arvokisassa (`arvokisa.ts:139`). Korjattava sekä oppaasta että Studion viestistä. |
| B10 | 1173–1174 | Rivillä lukee "**sama kuin nykyinen**", ja "Paina sopivan viikon kohdalla **Palauta**". | Teksti on "sama kuin nykyinen julkaistu" tai "sama kuin <päivä>", eikä niillä riveillä ole Palauta-painiketta. Lisäksi rivit "Ei mukana: dokumenttia ei silloin ollut julkaistuna." ja "Tämän kopion lataus epäonnistui." (`palauta-varmuuskopiosta.tsx:121–131, 139`). |
| B11 | 945 | lehtileikkeet, joiden *Sivu* on "Lehtileikkeet" | Vaihtoehdon nimi on **Lehtileikkeet (ura ja elämä)** (`lehtileike.ts:9`). |
| B12 | 85 | "**Historia säilyy vain 3 päivää** (Sanityn ilmainen taso)." | Pitää paikkansa vasta 26.10.2026 jälkeen, jos Free valitaan: projekti on Growth-kokeilussa (maxRetentionDays 90) 26.10. asti (docs/23 Y1). Ohjeessa ei kerrota kokeilusta. Ehdollinen virhe, korjataan päätöksen mukaan. |
| B13 | 84 | "oikean yläkulman **kellokuvakkeesta**" | Ei varmistettavissa koodista. Suomennoksessa on alapalkin painike **Tarkastele muutoksia** (`structure-CObGzIgV.js:664`) ja paneelin välilehdet **Historia** / **Tarkista muutokset** (`:265`). Tarkistettava selaimessa (Sanity 5.x). |
| B14 | 335, 873, 515, 1172 | Toimintovalikon nimi vaihtelee: "nuolta (tai ⋯)", "**⌄**-valikko", "⋯", "Julkaise-painikkeen vieressä ⋯" | Sama Sanityn painike, työkaluvihje **Asiakirjatoiminnot** (`structure-CObGzIgV.js:222`). Yksi nimi ja kuva kautta oppaan. |
| B15 | 1150 | "**Älä muuta** kenttiä **Vanha osoite** tai **Alkuperäinen Blogspot-kirjoitus**." | Molemmat ovat lukittuja (`contentMeta.ts:56`, `uutinen.ts:307`), joten niitä ei voi muuttaa. Myös **Muut vanhat osoitteet** on lukittu (`contentMeta.ts:74`). Kehotus on harhaanjohtava: kerro, että ne ovat vain luettavia. |
| B16 | 729 (ristiriita Studion kanssa) | Opas: Pikalinkit "Seuraavaksi-korttiin" (oikein, `components/blocks/hero.tsx:37, 129`) | Studion kuvaus `etusivu.ts:102`: "Näkyvät yläosassa tuoreimpien juttujen alla". Studion teksti vanhentunut; korjataan skeemaan. |
| B17 | 549 | "Nimi, osoite sivustolla (*Luo*) …" | Kenttä on **Tapahtuman nimi** (`tapahtuma.ts:27`). Ilmoittautumiskentät ovat omalla välilehdellään **Ilmoittautuminen** (`tapahtuma.ts:21, 94, 101`), mitä ohje ei kerro. |
| B18 | 708 | "Anna nimi …" | **Albumin nimi** (`galleriaAlbumi.ts:21`); kansikuva on pakollinen (`:50`). |
| B19 | 652 | "**Muistiinpano**" | Otsikko on **Muistiinpano (ei näy sivuilla)** (`ohjaus.ts:55`). |
| B20 | 237, 203 | "**Tiivistelmä**" (uutinen) | Uutisen kentän nimi on **Tiivistelmä jutun alussa (valinnainen)** (`uutinen.ts:62`); sivulla **Tiivistelmä sivun alussa** (`sivu.ts:120`). Testiä varten nimet kirjoitettava täsmälleen. |
| B21 | 197 + 272 | "**Uutiset** → **+** (Luo uusi)" | Koska uutisella on 4 pohjaa (`pohjat.ts:99, 111, 122` + oletus), + avaa ensin pohjavalikon; valinta **Uutinen** kerrotaan vasta rivillä 272. |
| B22 | 22, 50, 1195 ym. | "Kerro **kehittäjälle**", "Apu: Kehittäjä" | docs/24 §6 päätös 3: puhutaan **tukihenkilöstä** ilman nimiä. Studio käyttää myös sanaa "kehittäjä" (`lib/sivuston-tila.ts:40, 109`). Termi yhtenäistettävä (päätös uudistuksessa). Rivi 1208 sisältää `(repon osoite)` (käyttäjätunnus). |
| B23 | 662–663 | Ohjauksen virheet "on jo sivu", "kiinteä ohjaus" | Oikein, mutta lista on vajaa: "Osoitteelle … on jo ohjaus. Avaa se listasta ja muuta sen kohdetta." (`sanity/lib/ohjauksen-lahde.ts:54`), "Kohde … on itsekin ohjaus" (`:115`), "Osoite /… on sivuston oma, eikä sitä voi ohjata." (`lib/ohjaukset.ts:208`), "Etusivua ei voi ohjata." (`:197`). |
| B24 | 55 | Varmuuskopio-rivillä vain punainen tila | Rivi voi olla myös keltainen (Huomio): kopio on tallessa, mutta vanhojen kopioiden kierto epäonnistui (`lib/sivuston-tila.ts:140–150`). |

---

### C) Puuttuvat: ominaisuudet ilman ohjetta

1. **Uusi arvokisa** (Jalkapalloarkisto → Arvokisat → +): Kisatyyppi, Vuosi, Isäntämaa(t), Alku-/Loppupäivä, välilehti *Tulokset* (Voittaja, Hopea, Pronssi, Suomen sijoitus, Tilastotaulukot) (`arvokisa.ts`). docs/23 listaa tämän onnistuvaksi tehtäväksi.
2. **Uusi pelaaja / pelaajan muokkaus** yleisesti: välilehdet Perustiedot/Ura/Patsas, Seurat, Saavutukset ja palkinnot, **Uutisten tunniste** (`pelaaja.ts:182`).
3. **Uusi stadion** (Jalkapalloarkisto → Stadionit → +; Kaupunki, Kapasiteetti, Rakennusvuosi, Karttapaikka).
4. **Karsintasarjan taulukko** askel askeleelta (Tilastot → Karsinnat → +) ja **Ulkomaiset mestarit** (`Maa Ulkomaiset mestarit -sivulla`, `jalkapalloTilasto.ts:114`).
5. **Tilaston muut kentät**: Johdanto, Tiedot päivitetty, Lähteet (`jalkapalloTilasto.ts:135, 152, 176`).
6. **Ravintolan tiedot**: Tuomio yhdellä rivillä, Matka stadionille tai ottelu-yhteys, Sanallinen arvostelu, Ottelupäivänä, Plussat, Miinukset, Hintaluokka, Käynnin yhteys, Kuvat, välilehti Sijainti, **Toiminta loppunut** (`ravintola.ts`). Ravintolan luonti käsin ilman arvostelua.
7. **Arvostelut: kaikki** -lista ja julkaistun arvostelun muokkaus.
8. **Klubilaisen arvosanan poisto** ja sen vaikutus (kahden klubilaisen sääntö, "Aiempi arvosana" palautuu, `ravintola.ts:139–145`).
9. **Ravintola-arvostelulomake** klubilaisille: osoite /ravintolat/arvostele, kotinäytön sovelluskuvake, nimen valinta (`app/(sovellus)/ravintolat/arvostele`).
10. **Etusivun lohkot**: lohkotyyppien nimet ja kunkin asetukset (Näytettävien määrä, Otsikko, Yläotsake, Kaupunki (suodatin, valinnainen), Näytä vain Huuhkajien ja valittujen seurojen ottelut, Otteluiden/Tapahtumien otsikko ja määrä, Napin teksti); **Klubin nimi yläosassa**.
11. **Uusi toimintamuoto** (Toimintamuodot → +) ja toimintamuodon **Kuvat**, **Tilastotaulukot**, vuosimerkinnän kentät (Päivämäärä, Otsikko, Paikka, Osallistujat, Kuvaus, Kuvat).
12. **Klubi → Esittely** ja **Palloveikkaus-sivu** muokkaus (Pääsisältö, Iso kuva sivun yläosassa, Taulukot).
13. **Sivun yläkuva** (Iso kuva sivun yläosassa) tavallisille sivuille.
14. **Uutisen lisäkentät**: Lähde, Alkuperäinen kirjoitus (linkki), Otsikko hakutuloksissa, Ohje jäsenille.
15. **Uutiskategorian Kuvaus hakukoneille**.
16. **Tapahtuma**: Juhlatapahtuma (korostus), välilehti Ilmoittautuminen, kalenteritiedosto (.ics) syntyy automaattisesti.
17. **Galleria**: Liittyvä tapahtuma, kuvan Kuvateksti.
18. **Kuvan rajaus ja tarkennuspiste** (hotspot kaikissa kuvakentissä) sekä **Kuvateksti (valinnainen)**.
19. **Tekstilinkin Avaa uuteen välilehteen** ja tekstityylit (Otsikko 2–4, Lainaus).
20. **Esikatselu-työkalun käyttö** (yläpalkin Esikatselu, sivun valinta, luonnokset), myös tila "Ratkaistaan sijainteja…".
21. **Sanityn kokeiluominaisuudet** (Growth 26.10. asti): Studion omat kommentit, tehtävät ja ajastettu julkaisu ("Aikatauluta", "Julkaisut") näkyvät nyt, mutta katoavat Free-tasolla. Ohjeen pitää kieltää niiden käyttö tai selittää ero oman Julkaisuaika-ajastuksen ja Sanityn ajastuksen välillä (docs/23 Y1).
22. **Vianetsintä**: Studio kaatuu tai näyttää "Jokin meni pieleen", Studio ei aukea, punainen validointivirhe, jonka tekstiä ei ole oppaassa (esim. tunnisteiden virheet `lib/tunnisteet.ts:201–212`, kaupungin maan muoto `kaupunki.ts:46–52`, kokoonpanon rivimäärät `kokoonpano.ts:74, 90`).
23. **Tyhjennä kenttä** -varoitus linkin tiedostolle ("Tiedosto on yhä tallessa…", `linkki.ts:142`).
24. **Sanityn Hylkää muutokset -vahvistus** ("Hylätäänkö muutokset?") ja **Kopioi pohjaksi** -toiminnon puuttuminen kommenteilta ja asetusdokumenteilta.
25. **Aloituksen tilan nimet** riveillä: *Kunnossa*, *Huomio*, *Vaatii toimia*, *Ei vielä tietoa*, kiintiöllä *Arvio* (`SivustonTila.tsx:15–18, 98`): opas puhuu väreistä, ei sanoista, vaikka rivi näyttää sanan.

---

### D) Studion käyttöliittymänimet (test:ohje-testiä varten)

Muoto: `nimi` — tiedosto:rivi. (S) = Sanityn oma suomennettu teksti, tarkista versiopäivityksessä.

#### D1. Työkalut ja Aloitus
- `Aloitus` — sanity/plugins/aloitus.tsx:12
- `Sisältö` — sanity.config.ts:109
- `Esikatselu` — sanity.config.ts:111
- `Kyselyt (kehittäjä)` — sanity.config.ts:122
- `Hei! Tästä pääset alkuun` — sanity/components/aloitus/Aloitus.tsx:22
- `Sivuston tila` — sanity/components/aloitus/SivustonTila.tsx:42
- `Päivitä` — SivustonTila.tsx:44
- `Kaikki kunnossa` / `Huomioitavaa` / `Vaatii toimia` / `Tilaa ei vielä tiedetä` — SivustonTila.tsx:22–25
- `Kunnossa` / `Huomio` / `Vaatii toimia` / `Ei vielä tietoa` — SivustonTila.tsx:15–18; `Arvio` — :98
- `Avaa julkaisemattomat muutokset` — SivustonTila.tsx:30
- `Odottaa sinua` — sanity/components/aloitus/Odottaa.tsx:14; `Ei odottavia` — :37
- `Täydennä perustiedot` — sanity/components/aloitus/Puuttuvat.tsx:24
- Rivit: `Varmuuskopio` lib/sivuston-tila.ts:117, `Yöllinen huolto` :156, `Otteluohjelman haku` :220, `Dokumenttikiintiö (arvio)` :258, `Julkaisemattomat muutokset` :278

#### D2. Valikko (sanity/structure.ts ja sanity/lib/tehtavat.ts)
- `Tehtävät sinulle` — structure.ts:76
- `Arvostelut odottavat hyväksyntää` tehtavat.ts:73 · `Uudet kommentit (7 päivää)` :83 · `Julkaisemattomat muutokset` :94 · `Ajastetut uutiset` :103 · `Vaatii tarkistuksen (kaikki)` :113
- `Sivuston asetukset` structure.ts:409 · `Etusivu` :417 · `Navigaatio` :422 · `Ohjaukset ja lyhytosoitteet` :371 · `Lyhytosoitteet ja ohjaukset` :379 · `Muuttuneet osoitteet (automaattiset)` :388 · `Varmuuskopiot` :428 (lista `Varmuuskopiot (viikoittain, automaattinen)` :432)
- `Tarkistettavat` :442 (lista `Vaatii tarkistuksen` :446; alakohdat tehtavat.ts:25–35: Uutiset, Ravintolat, Tilastot, Stadionit, Klubin toiminta, Pelaajat, Lehtileikkeet, Arvokisat, Sivut, Tapahtumat, Galleria-albumit)
- `Uutiset` :467 · `Uutiskategoriat` :476 · `Kommentit ja veikkaukset` :489 (`Uusimmat` :496, `Uutisittain` :505, `Piilotetut` :524) · `Ottelut` :537 · `Tapahtumat` :542 · `Galleria-albumit` :549 · `Sivut` :554
- `Klubi` :221 → `Esittely` :227 · `Toiminta` :230 (`Toiminta-sivun otsikko ja johdanto` :236, `Toimintamuodot` :240) · `Hallitus` :254 (`Hallitus-sivun otsikko ja johdanto` :260, `Nykyinen hallitus` :263, `Entiset jäsenet` :275) · `Palloveikkaus` :289 (`Palloveikkaus-sivu` :295, `Veikkausten alasivut` :300) · `Yhteystiedot` :317 (`Osoite, sähköposti ja some` :325, `Yhteystiedot-sivun otsikko ja johdanto` :328)
- `Ravintolat` :581 → `Kaikki ravintolat` :587 · `Ravintolat: odottavat toista arvioijaa` :589 · `Arvostelut: odottavat hyväksyntää` :600 · `Arvostelut: kaikki` :615 · `Klubilaisten arvosanat` :106 (`Ravintoloittain` :114, `Valitse ravintola` :118, `Kaikki (uusin ensin)` :136) · `Klubilaiset` :623 · `Kaupungit` :624
- `Jalkapalloarkisto` :630 → `Tilastot` :157 (ryhmät lib/tilasto-kategoriat.ts:59–63: `Klubin omat tilastot`, `Huuhkajat`, `Karsinnat`, `Arvokisat`, `Muut arkiston taulukot`; `Kaikki tilastot` structure.ts:187) · `Arvokisat` :637 · `Pelaajat` :638 · `Lehtileikkeet` :640 · `Stadionit` :647
- `Osioiden sivut` :344 (lista `Osioiden sivut: otsikot ja johdannot` :348) → `Uutiset ja tapahtumat` :336, `Ravintolat` :337, `Jalkapalloarkisto` :338; sivujen nimet lib/osiosivut.ts:109–286 ja arkiston `title`-arvot :303–444
- Varmuuskopion välilehdet `Tiedot` :661, `Palauta poistettu` :662

#### D3. Toiminnot, painikkeet ja ikkunat
- `Piilota sivulta` / `Näytä sivulla` — sanity/actions/kommentin-moderointi.tsx:49
- `Poista pysyvästi` — kommentin-moderointi.tsx:100
- `Hylkää arvostelu` / `Poista arvostelu` — sanity/actions/hylkaa-arvostelu.tsx:89
- `Hyväksy ja luo ravintola` — sanity/actions/hyvaksy-ja-luo-ravintola.tsx:157
- `Palauta varmuuskopiosta` — sanity/actions/palauta-varmuuskopiosta.tsx:195 (ikkunan otsikko :201, `Palauta` :141, `sama kuin nykyinen julkaistu` :128)
- `Kopioi pohjaksi` — sanity/actions/vanhat-osoitteet.tsx:178
- `Poista silti` / `Poista julkaisu silti` / `Peruuta` — vanhat-osoitteet.tsx:132–133; `Nykyinen osoite:` :57
- Palauta poistettu: `Hae nimellä, esim. vuosikokous` palauta-poistettu.tsx:136, `Palauta` :169, `Avaa` :164
- Lukitun sivun selite "Sivusto käyttää tätä sivua kiinteällä osoitteella…" — sanity/actions/lukittu-sivu.tsx:33
- Taulukkoeditori: `Etsi taulukosta` TaulukkoEditori.tsx:379, `Lisää sarake` :390, `Tuo Excelistä` :398, `Kopioi Exceliin` :406, `Lisää rivi` :505, `Kumoa` :274, `Lisää rivi yläpuolelle` :634, `Lisää rivi alapuolelle` :635, `Siirrä ylös`/`Siirrä alas` :637–638, `Poista rivi` :640, `Muokkaa nimeä ja tyyppiä` :780, `Lisää sarake vasemmalle`/`oikealle` :782–783, `Poista sarake` :788; TuontiDialogi.tsx: `Tuo taulukko Excelistä` :113, `Lisää rivit taulukon loppuun` :161, `Korvaa koko taulukko (sarakkeet ja rivit)` :165
- Kategoriat: `Lisää uusi kategoria` — sanity/components/kategoriat/KategoriatInput.tsx:107
- Tunnisteet: `Kirjoita tunniste ja paina Enter` TunnisteetInput.tsx:215, `Suosituimmat:` :254
- Pohjat: `Vuosikokouskutsu` sanity/pohjat.ts:99, `Palloveikkauksen tilanne` :111, `Palloveikkaus: uusi kausi` :122
- Sivuston palkki: `Esikatselutila: …` components/esikatselu-palkki.tsx:30, `Poistu esikatselusta` :37
- (S) Sanity, node_modules/@sanity/locale-fi-fi/dist/structure-CObGzIgV.js: `Julkaise` :62, `Hylkää muutokset` :38, `Poista` :18, `Poista julkaisu` :102, `Kopioi` :46, `Poista dokumentti?` :348, `Poista nyt` :326, `Peruuta dokumentin julkaisu?` :350, `Peruuta julkaisu nyt` :332, `Poista joka tapauksessa` :318, "Et ehkä voi poistaa…" :372, "…Tämä yleensä tarkoittaa, että muut dokumentit viittaavat siihen." :574, `Luo` (paneeli) :509, `Historia` :265, `Tarkastele muutoksia` :664, `Asiakirjatoiminnot` :222
- (S) studio-BP5dvHRO.js: `Luo` (osoite) :1191, `Korvaa` :770, `Valitse` :77, `Ladatut kuvat` :145, `Lataa lisää` :118, `Tyhjennä` :1081, `Tyhjennä kenttä` :760, `Lataa` :764, `Aseta nykyiseen aikaan` :207, `Lisää kohde` :679, `Näytä lisää` :383, `Poista` (kuvat) :67, `Luo` (yläpalkki) :1265
- (S) presentation-uQtZDGd3.js: `Käytetty yhdellä sivulla` :28, `Käytetty {{count}} sivulla` :30

#### D4. Tilamerkit (sanity/merkit.ts)
- `Ajastettu` :25 · `Tarkistettava` :31 · `Odottaa toista arvioijaa` :39 · `Piilotettu` :46
- Listojen merkinnät: `⚠` (needsReview, esim. uutinen.ts:355), `🚫` (kommentti.ts:127), `Ajastettu <aika>` (uutinen.ts:353), `UUSI: <nimi>` ja `Ei klubilainen` (ravintolaKayttajaArvostelu.ts:220–222), `Piilotettu` (etusivu.ts:25), `Osion sivu · /…` (sivu.ts:211), `Entinen · …` (hallitusJasen.ts:73)

#### D5. Välilehdet ja kentät
- Yhteiset: `Osoite sivustolla` sanity/schemas/objects/sanasto.ts:13 · `Hakukoneet ja jako` sanasto.ts:16 · `Otsikko hakutuloksissa (valinnainen)` seoFields.ts:8 · `Kuvaus hakutuloksissa (valinnainen)` seoFields.ts:16 · `Vanha osoite` contentMeta.ts:51 · `Muut vanhat osoitteet` :68 · `Mitä tarkistaa` :85 · `Vaatii tarkistuksen` :98 · `Aiemmat osoitteet` :142
- Linkki: `Mihin linkki vie?` linkki.ts:42 · `Sivuston sivu` :48 · `Muu osoite` :49 · `Tiedosto` :50 · `Sivu` :59 · `Osoite` :97 · `Avaa uuteen välilehteen` portableText.ts:23
- Kuvat: `Vaihtoehtoinen teksti (alt)` imageWithAlt.ts:11 · `Kuvateksti (valinnainen)` :24 · `Mitä kuvassa on (alt)` galleriaKuva.ts:19 · `Kuvauspäivä` paivattyKuva.ts:34
- Lisäosat: `Kuvasarja (useita kuvia)` kuvasarja.ts:14, `Kuvat` :20, `Mitä kuvissa on (yhteinen kuvaus)` :34, `Kuvien muoto` :44 · `YouTube-video` youtubeVideo.ts:15, `Videon osoite` :21, `Videon otsikko` :37 · `Kartta, lomake tai Vimeo-video` upotus.ts:16, `Upotuskoodi tai osoite` :22, `Mitä upotuksessa on` :35 · `Huomiolaatikko` huomio.ts:12, `Sävy` :18, `Otsikko (valinnainen)` :31, `Tiedote (sininen)`/`Tärkeä (keltainen)` lib/sisaltolohkot.ts:113–114 · `Painike` painike.ts:13, `Painikkeen teksti` :19, `Mihin painike vie` :29 · `Liite (PDF, Word, Excel)` liite.ts:97, `Linkin teksti` :103, `Tiedosto` :41 · `Taulukko` taulukko.ts:17, `Taulukon otsikko` :27 · `Kokoonpano pelikentällä` kokoonpano.ts:13, `Rivit hyökkäyksestä maalivahtiin` :26, `Selite (valinnainen)` :104
- Uutinen (uutinen.ts): välilehdet `Sisältö` :29, `Kommentit ja veikkaus` :30; `Otsikko` :36, `Tiivistelmä jutun alussa (valinnainen)` :62, `Julkaisuaika` :70, `Lyhenne (uutislista ja etusivu)` :82, `Kansikuva` :98, `Sisältö` :118, `Alkuperäinen kirjoitus (linkki)` :136, `Lähde` :147, `Kategoriat` :173, `Tunnisteet` :185, `Salli kommentit` :220, `Lomakkeen tyyppi` :226, `Veikkaus sulkeutuu` :241, `Joukkueet` :248, `Montako sijaa veikataan` :272, `Kysy myös maalikuningasta` :281, `Ohje jäsenille` :288, `Alkuperäinen Blogspot-kirjoitus` :302, `Blogin tunnisteet` :321
- Sivu (sivu.ts): `Tietoa sivusta` :61, `Sisällön kieli` :100, `Tiivistelmä sivun alussa` :120, `Teksti arkiston etusivun kortissa` :135, `Iso kuva sivun yläosassa` :147, `Ingressi (vanha kenttä)` :156, `Pääsisältö` :168, `Taulukot` :175
- Etusivu (etusivu.ts): `Yläosa` :49, `Lohkot` :50, `Klubin nimi yläosassa` :56, `Pääjuttu (valinnainen)` :65, `Pääjuttu näkyy asti` :75, `Näytä seuraava Huuhkajien ottelu ja laskuri` :84, `Taustakuva (valinnainen)` :93, `Pikalinkit` :101, `Etusivun kuvaus hakukoneille` :130, `Etusivun lohkot (järjestyksessä)` :186, `Piilota lohko sivulta` :15, `Jutut (uusimmat uutiset)` :194, `Otteluohjelma ja tapahtumat` :213, `Näytä vain Huuhkajien ja valittujen seurojen ottelut` :223, `Näytä myös näiden seurojen ottelut` :231, `Tulevat tapahtumat` :257, `Esittelyteksti (Klubista)` :271, `Linkin teksti` :280, `Linkin kohde` :283, `Ravintola-arviot` :306, `Jalkapalloarkisto-nosto` :323, `Napin kohde` :348, `Galleria-nosto` :364
- Navigaatio: `Päänavigaation linkit` navigaatio.ts:24, `Otsikko` :32, `Alavalikko` :47
- Yhteystiedot: `Katuosoite` yhteystiedot.ts:12, `Yleinen sähköposti` :33, `Puhelin` :39, `Y-tunnus` :44, `IBAN` :49, `Sosiaaliset mediat` :54
- Ohjaus: `Minne ohjataan` ohjaus.ts:42, `Muistiinpano (ei näy sivuilla)` :55
- Hallitus: `Nimi` hallitusJasen.ts:12, `Rooli` :18, `Nykyinen jäsen` :25, `Järjestys hallitussivulla` :55
- Klubin toiminta: `Perustiedot`/`Vuosittain` klubiToiminta.ts:34–35, `Järjestys listassa` :66, `Vuosittaiset merkinnät` :81, `Vuosi` :90, `Monesko kerta` :104, `Linkki` :121, `Linkin teksti` :129, `Tilastotaulukot` :178
- Tapahtuma: `Ilmoittautuminen` tapahtuma.ts:21, `Tapahtuman nimi` :27, `Alkamisaika` :44, `Päättymisaika` :51, `Juhlatapahtuma` :72, `Kansikuva` :81, `Kuvaus` :87, `Ilmoittautumislinkki` :94
- Galleria: `Albumin nimi` galleriaAlbumi.ts:21, `Liittyvä tapahtuma (valinnainen)` :42, `Kansikuva` :48, `Kuvat` :54
- Ottelu: `Alkamisaika` ottelu.ts:45, `Kotijoukkue` :52, `Vierasjoukkue` :61, `Kilpailu` :69, `Stadion` :75, `Klubi paikalla` :81, `Vierasmatka` :89; virhe "Tarkoititko…" :19
- Uutiskategoria: `Nimi` uutisKategoria.ts:25, `Osoite suodattimessa` :45, `Kuvaus hakukoneille (valinnainen)` :58, `Järjestys suodattimessa` :66
- Ravintola (ravintola.ts): `Perustiedot`/`Arvostelu`/`Sijainti` :40–42, `Arvosana lasketaan klubilaisten arvosanoista` :123, `Aiempi arvosana` :140, `Tuomio yhdellä rivillä` :201, `Käynnit` :258, `Toiminta loppunut` :283
- Arvostelu: `Klubilainen` ravintolaKayttajaArvostelu.ts:44, `Kävijän ehdottama uusi ravintola` :60, `Ravintola` :93, `Kuvat` :160
- Klubilaisen arvosana: `Ravintola` klubiArvio.ts:35, `Klubilainen` :42, `Päivä` :70 · Klubilainen: `Nimi` klubilainen.ts:22, `Näytä arvostelulomakkeella` :47 · Kaupunki: `Nimi` kaupunki.ts:15, `Osoite suodattimessa` :23, `Maa` :37, `Maakunta` :59
- Tilasto (jalkapalloTilasto.ts): `Tilastodata` :29, `Kategoria` :52, `Osio Huuhkajat-sivulla` :69, `Kauden ottelut ja tulokset` :89, `Maa Ulkomaiset mestarit -sivulla` :114, `Lisätiedot taulukon jälkeen` :143, `Järjestys sivulla` :160, `Kuvat` :169
- Pelaaja: `Ura` pelaaja.ts:29, `Patsas` :30, `Tilastotaulukot` :217, `Kuvat` :225 · Lehtileike: `Sivu` lehtileike.ts:57, vaihtoehdot `Lehtileikkeet (ura ja elämä)`/`Patsas`/`Terveys ja loukkaantumiset` :9–11, `Julkaisupäivä` :66
- Viestit: "Taulukko ei näy vielä millään sivulla…" lib/sijainnit.ts:99 ja :101, "Ottelu on jo pelattu…" :104, "Täytä vielä hakasulkeissa olevat kohdat: …" lib/pohjat.ts:46, linkin varoitukset lib/linkki.ts:337, 346, 349 ja sanity/lib/linkin-kohde.ts:37, 111, ohjauksen viestit sanity/lib/ohjauksen-lahde.ts:54, 61, 74, 85

---

### E) Asiat, joihin sihteeri tarvitsee yhä kehittäjää (ohjeen kerrottava)

| # | Asia | Mainitaanko oppaassa | Lähde |
|---|---|---|---|
| E1 | Sanityn projektiasetukset (API, CORS, tokenit, webhookit) | Kyllä (34–36) | docs/17 |
| E2 | Aloituksen punaiset rivit: varmuuskopio, huolto, otteluhaku (Vercel Cron Jobs) | Kyllä (49–58) | lib/sivuston-tila.ts:109 |
| E3 | Dokumenttikiintiö yli 80 % | Kyllä (58) | lib/sivuston-tila.ts:272 |
| E4 | Koko sivuston palautus, kuvien varmuuskopio | Kyllä (1163–1164, 1191) | docs/17 §D |
| E5 | Tiedoston pikapoisto epäonnistuu | Kyllä (338–339) | – |
| E6 | **Growth-kokeilu päättyy 26.10.2026**: hallituksen päätös, Free-siirron vaikutukset (historia 3 pv, roolit, kokeilun ominaisuudet katoavat) | **Ei** | docs/23 Y1, docs/24 P10 |
| E7 | **Logon vaihto** ei onnistu Studiossa (tietoinen päätös, "kirjataan oppaaseen") | **Ei** | docs/23 Y41, structure.ts:45–48 |
| E8 | **Seuran sarjan vaihto** (esim. FC Lahti Ykkösliigaan) ja otteluhaun lähteet: haku kattaa vain Veikkausliigan | **Ei** | docs/23 Y29 |
| E9 | **Uusi jalkapalloarkiston osio tai tekstisivu arkiston alle**, uusi listasivu/osion sivu (kiertotie "Muu tilasto") | **Ei** | docs/23 Y27, lib/osiosivut.ts |
| E10 | **Uusi pelaajaosio Litmasen tapaan** (lehtileikkeen pelaajaksi kelpaa vain Litmanen) | O (949 sivuaa) | docs/23 Y28 |
| E11 | **Koko sivuston tiedotebanneri** | **Ei** | docs/23 Y13 |
| E12 | **Lukittujen sivujen** osoitteen muutos tai poisto, **kiinteän (vanhan sivuston) ohjauksen** muutos | O (kertoo, ettei onnistu, ei kuka voi) | 662–663, 638–640; lib/redirects.ts |
| E13 | **Tunnisteen nimeäminen uudelleen kaikkiin uutisiin** (massamuutos, `patch:tunnisteet`) | **Ei** | lib/tunnisteet.ts |
| E14 | Muiden upotuspalvelujen (Facebook, Instagram) tai tiedostotyyppien salliminen | O (kertoo, ettei onnistu) | 374, 1132 |
| E15 | Huuhkajat-osioiden, eurocupien ja mestaruusmaiden alasivujen johdannot | **Ei** | docs/24 §7 |
| E16 | Klubin alasivut Klubi-osion välilehtiin / "Lisää aiheesta" (Y26) | **Ei** | docs/24 §7 |
| E17 | Sivuston uudelleenjulkaisu, lokit, ympäristömuuttujat, ajastukset (Vercel) | O (vain punaisten rivien kautta) | docs/23 Y5 |
| E18 | Domainin uusinta, sähköposti | Kyllä (1209–1211) | docs/17 |
| E19 | Studio kaatuu tai näyttää virheen (8.10. löytyi kaksi tuotantokaatumista) | **Ei** | git b8d4ae8 |
| E20 | Vanhojen linkkikenttien poisto (P11) | Ei tarvitse oppaaseen (kehittäjän sisäinen); B8:n teksti poistetaan | docs/24 P11 |

---

### Tiivistelmä (10 riviä)

1. Inventaariossa on 126 sihteerin tehtävää Studiossa ja sivustolla: 76 on ohjeistettu oikein (K), 30 osittain (O) ja 20 puuttuu (E).
2. Virheitä on 24 (B1–B24). Näistä 6 on testin kannalta suoria nimivirheitä: ottelun kentät (Aika/Koti/Vieras), "Ravintolat → Odottavat toista arvioijaa", "Kaikki", Lehtileikkeet-vaihtoehto, Tiivistelmä- ja Muistiinpano-kenttien nimet.
3. Kaksi kappaletta on vanhentunut P5:n (8.10.) jälkeen: valikon vanhat linkit (opas:766–769) ja toimintamuotojen vuosilinkit (opas:806–807).
4. Opas ja Studion oma viesti (lib/sijainnit.ts:99) puhuvat "Taulukot-kentästä", vaikka klubin toiminnassa ja pelaajalla kenttä on "Tilastotaulukot".
5. Toimintovalikon nimi vaihtelee (⋯, ⌄, nuoli). Historian "kellokuvake" ja yläpalkin työkalut (Kyselyt (kehittäjä) näkyy ylläpitäjälle) pitää tarkistaa selaimessa.
6. Puutteita on 25 aihetta (C). Isoimmat: arvokisat, pelaajat, stadionit, ravintolan kortin kentät ja Toiminta loppunut, etusivun lohkotyypit ja niiden asetukset, uusi toimintamuoto, kuvan rajaus ja kuvateksti, arvostelulomakkeen jakaminen klubilaisille sekä vianetsintä Studion kaatuessa.
7. D-luettelossa on noin 300 käyttöliittymänimeä tiedosto:rivi-viittein. Sanityn omat suomennokset on merkitty (S) ja niiden lähteenä on locale-fi-fi 1.1.40.
8. Kehittäjää tarvitaan yhä 20 asiassa (E). Oppaasta puuttuvat kokonaan Growth-kokeilun päättyminen 26.10., logon vaihto, seuran sarjan vaihto, uudet arkisto-osiot, tiedotebanneri, tunnisteiden massamuutos ja Studion kaatuminen.
9. Termi "kehittäjä" on ristiriidassa docs/24 §6:n päätöksen kanssa ("tukihenkilö") sekä oppaassa että Studion teksteissä (lib/sivuston-tila.ts).
10. Repoon ei tehty muutoksia. Studion kaksi vanhentunutta tekstiä kannattaa korjata skeemaan samalla: etusivu.ts:102 (Pikalinkit) ja lib/sijainnit.ts:99.
