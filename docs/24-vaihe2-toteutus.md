# 24. Vaihe 2: kehys Studioon, toteutussuunnitelma

*Laadittu 8.10.2026. Integroitu viiden kokonaisuuden (A–E) arkkitehtisuunnitelmista. Tila: suunnitelma, mitään ei ole vielä toteutettu.*

Lähteet: docs/23 (§0 päätökset 7.10.2026 ja §4 tiekartta), docs/09, docs/05 ja nykyinen koodi (main, bf05473). Ristiriidat on ratkaistu koodia vasten. Tarkistetut kohdat on lueteltu luvussa 1.

> **Jatketaan tästä (tila 8.10.2026):**
> 1. **Ennen toteutusta käsitellään kriitikon vakavat löydökset K1–K4 (Liite A).** Kukin korjataan omaan askeleeseensa tai perustellaan, miksi ei:
>    - K1 (askel 3): osiosivujen siemen ei saa muuttaa nykyisiä Google-kuvauksia.
>    - K2 (askel 8): vanha osoite ei saa kadota webhookissa.
>    - K3 (askel 9): poiston turvan ohje on ristiriidassa askeleen 8 kanssa.
>    - K4 (askeleet 4 ja 6): tietosuojatekstit julkisessa datasetissä ja orpojen tiedostojen siivous.
> 2. **Käyttäjän päätökset (luku 6):** muutetaanko Lyhenne valinnaiseksi (askel 2b), ja kuka saa UptimeRobot-hälytykset.
> 3. **Toteutus askel kerrallaan luvun 3 järjestyksessä:**
>    - Kukin askel tehdään omana committinaan. Toteuttajana on agentti, ja sen jälkeen riippumaton tarkastaja käy askeleen läpi.
>    - Kehittäjä varmistaa jokaisen askeleen: type-check, lint, test ja puhdas build productionin datalla.
>    - Productioniin kirjoitetaan vain luvun 5 mukaisesti.
> 4. **Paikallinen ympäristö:** `.env.local` osoittaa `production`-datasettiin ilman lukutokenia, joten paikallinen sivu näyttää tyhjältä ja paikallinen Studio muokkaa productionia. Buildia varten anna lukutoken ympäristömuuttujana, esim. `SANITY_API_READ_TOKEN=<Sanity CLI:n authToken> npm run build`. Aja aina puhdas build (`rm -rf .next`), koska Turbopackin välimuisti palautti kerran vanhentuneet esirenderöidyt sivut.
> 5. **Arkkitehtien yksityiskohdat:** `docs/24-liite-arkkitehdit.md`. Ristiriitatilanteessa tämä dokumentti voittaa.

---

## 0. Periaatteet, jotka koskevat jokaista askelta

1. **Sitovat päätökset (docs/23 §0):**
   - Sanity Free -taso: ei Releases-julkaisuja, ajastusta, Media Librarya eikä AI Assistia, ja datasetti on julkinen 26.10. jälkeen.
   - Kaikki 24 listasivua tuodaan Sanityyn.
   - Tekstilohkoja tehdään kaikki kuusi.
   - Osoitteen muutos sallitaan: vanha osoite ohjautuu automaattisesti, ja isä voi tehdä lyhytosoitteita.
   - Alatunniste seuraa päävalikkoa.
   - Johdantokenttiä ei yhdistetä, vain niiden ohjeita selkeytetään.
   - Ei tiedotebanneria, ei uusia pelaajaosioita eikä `arkistoOsio`-tyyppiä.
   - Ei uusia editorin singletoneja.
2. **Production on isän.** Dataan tehdään vain dokumenttikohtaisia patcheja tai `--missing`- tai `createIfNotExists`-lisäyksiä. Ne ajetaan aina ensin developmentiin, sitten kuivaharjoituksena productioniin ja vasta sitten oikeasti, varmuuskopion jälkeen. Toteutusaskeleet **eivät kirjoita** productioniin. Kirjoitukset ovat erikseen luvussa 5.
3. **Kaksoisluku.** Koodi, joka odottaa uutta datamuotoa, toimii myös vanhalla datalla. Järjestys on deploy, sitten patch, sitten vanhan kentän poisto erillisenä myöhempänä askeleena.
4. **Next 16 poikkeaa koulutusdatasta.** Ennen metadata-, välimuisti-, redirect- tai notFound-muutoksia luetaan:
   - `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
   - `…/08-caching.md`
   - `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`
   - `…/02-guides/caching-without-cache-components.md`
5. **Yhteiset hyväksymiskriteerit (kaikki askeleet):**
   - `npm run type-check`, `npm run lint`, `npm test` ja `npm run build` menevät läpi.
   - Kun skeema tai kyselyt muuttuvat, ajetaan `npm run typegen`, ja `sanity/sanity.types.ts` on mukana samassa commitissa.
   - docs/09 on päivitetty samassa commitissa. Uudet komennot on lisätty CLAUDE.md:n komentotaulukkoon ja `npm test` -ketjuun.
   - Commit tehdään ilman `--no-verify`-valitsinta.
   - **Tuotannon kaltainen tarkistus:** development on tuore productionin kopio (docs/23 Y4). Lisäksi ajetaan `NEXT_PUBLIC_SANITY_DATASET=production npm run build` (vain luku). Näin varmistetaan, että koodi toimii productionin *nykyisellä* datalla ennen tuotantomuutoksia (varatekstit ja vanha linkkimuoto).
   - Saavutettavuus: `npm run test:saavutettavuus` niille sivuille, joihin askel vaikuttaa (WCAG 2.1 AA).
6. **Testit:** puhtaat säännöt ovat `lib/`-moduuleissa ja testit muodossa `scripts/test-*.ts` (node:assert/strict ja repon `test()`-apuri).

---

## 1. Integraattorin ratkaisut: ristiriidat ja karsinta

Koodista tarkistetut tosiasiat:
- `sanity/structure.ts`:ssä ei ole yhtään `.id()`-kutsua.
- `lib/linkki.ts`:llä ei ole tuonteja.
- Uutisen Lyhenne on pakollinen, paitsi kun kenttä `ulkoinenLinkki` on täytetty (`uutinen.ts:68-84`).
- `LinkButton` avaa `https:`-alkuiset osoitteet itse uuteen välilehteen (`components/ui/button.tsx:85`).
- Webhookin käsittelijä lukee vain kentät `_type` ja `slug` (`route.ts:41-44`).
- `notFound()`-kutsuja on 22 kappaletta 19 tiedostossa.
- `JULKINEN_RAVINTOLA` on tiedostossa `lib/ravintola-arvosana.ts:151`.
- docs/23 §4 sijoittaa Y26:n, Y27:n askeleet 1–2, Y40:n ja Y42:n **vaiheeseen 3**.

| # | Ristiriita tai kysymys | Ratkaisu | Perustelu |
|---|---|---|---|
| R1 | A:n suunnitelmassa ovat mukana Y26 (osiovälilehdet navigaatiosta, alasivulistaus) ja Y27:n askel 2 (tekstisivut arkiston alle). B toteaa niiden kuuluvan vaiheeseen 3. | **Siirretään vaiheeseen 3** (luku 7). A:sta jäävät Y22, Y25 ja arkiston korttiteksti. A:n `haeNavigaatio`, `osionValilehdet`, `OsionValilehdet`, `alasivutQuery`, `VARATUT_ARKISTON_POLUT`, `onKoodinPolku` ja async-muotoinen `ArkistoPage` jätetään pois. | Tiekartta (docs/23 §4). Productionin Klubi-alavalikko on täsmälleen sama kuin `klubiNav`, joten Y26 ei muuttaisi nyt mitään näkyvää. Poisto kaventaa A:n työtä 17 tiedostosta. |
| R2 | `haeNavigaatio()` on määritelty sekä A:ssa (ilman `piilotaTyhjat`) että B:ssä (React `cache`, ratkaistu ja suodatettu). | **Vain B:n versio** (askel 4), koska R1 poisti A:n käytön. | Yksi lähde Headerille ja Footerille. |
| R3 | Linkin rajapinta: C odotti `linkinOsoite → {href, uusiValilehti}` ja fragmenttia `linkkiProjektio`. D odotti `linkinHref`, `LINKKI_PROJEKTIO` ja kenttiä `kohde.sivu`/`kohde.url`. | **B:n malli on sitova:** kentät `tyyppi`, `kohde`, `href` ja `tiedosto`, funktio `linkinOsoite(l): string \| null` ja GROQ-fragmentti `linkkiProjektio` (§2.2). Painike käyttää `LinkButton`ia, joka tunnistaa ulkoisen osoitteen itse. | Yksi nimi joka käytölle. Uutta välilehtilippua ei tarvita. |
| R4 | Tekstieditorin linkki: C oletti uuden annotaation `sisainenLinkki`, B laajentaa nykyistä `link`-annotaatiota. | **B:n ratkaisu:** `link`-annotaatio saa saman kenttäjoukon (`tekstinLinkki`). Erillistä annotaatiota ei tehdä. | Yksi linkkipainike isälle. Vanhat 31 linkkiä ovat kelvollisia ilman migraatiota. |
| R5 | Liitetiedosto: B:ssä `LIITTEEN_TIEDOSTOTYYPIT` ja `tiedostonKuvaus` (lib/linkki.ts), C:ssä `lib/liite.ts` ja `liitetiedostoKentta()`. | **Yksi moduuli `lib/liite.ts`** ja kenttätehdas `liitetiedostoKentta()` (`sanity/schemas/objects/liite.ts`). Ne tehdään askeleessa 4, koska linkkiobjektin Tiedosto-vaihtoehto tarvitsee ne ensin. C:n liitelohko käyttää samoja. Tiedoston kuvaus tehdään yhdellä funktiolla `liitteenTiedot()` (muoto "PDF, 240 kt", "Word", "Excel"). | Sama sallittujen päätteiden lista, julkisuusvaroitus ja kokovaroitus kaikkialla. |
| R6 | D:n `ohjaus.kohde` on tyyppiä `linkki`, jolloin polku olisi muotoa `kohde.kohde`. | Kentän nimi on **`ohjaus.minne`** (otsikko "Minne ohjataan"). | Selkeät valintapolut esikatselussa. |
| R7 | D:n lyhytosoitteen lähde ja A:n `onKoodinPolku`. | `onKoodinPolku` jätetään pois (R1). `tarkistaOhjauksenLahde` hylkää täsmälleen `KOODIIN_SIDOTUT_SIVUT`-polut ja varatut alut (`studio`, `api`, `_next`, `blogspot`). Muut olemassa olevat sivut tunnistetaan Studion HEAD-tarkistuksella. | A:n etuliitesääntö olisi estänyt kelvolliset ohjaukset, esim. `/uutiset/vanha-juttu`. |
| R8 | Studion rakenne: A nimeää uudelleen "Sivun asetukset" ja siirtää Yhteystiedot Klubiin, D lisää ohjaukset asetuksiin, E linkittää polkuihin. Tunnisteita ei ole. | **Kiinteät `.id()`-tunnisteet (§2.6)** lisätään askeleessa 3. E:n "täydennä perustiedot" -linkit käyttävät `IntentLink`iä (dokumentin muokkaus), eivät rakennepolkuja. | Linkit eivät hajoa, kun otsikoita muutetaan. |
| R9 | A:ssa osiosivujen alaryhmä "Klubi" sekä uusi Klubi-ryhmä. | Klubin viisi sivua löytyvät **vain** Klubi-ryhmästä. "Osioiden sivut" sisältää Uutiset ja tapahtumat, Ravintolat ja Jalkapalloarkiston. | Yksi paikka kullekin asialle. |
| R10 | E:n sanasto (Polku → "Osoite sivustolla", SEO → "Hakukoneet ja jako") ja A–D:n uudet tekstit. | **Sanasto tehdään ensimmäisenä (askel 1).** Kaikki myöhemmät askeleet kirjoittavat uusilla nimillä. Linkin vaihtoehdot ovat B:n mukaiset: "Sivuston sivu / Muu osoite / Tiedosto". "Muu osoite" kattaa myös suhteelliset polut. | Ei kahta uudelleennimeämiskierrosta. |
| R11 | `tiivistelmaField`: A tarvitsee osiosivuille pakollisen tiivistelmän, E sivukohtaiset otsikot ja kuvaukset. | Allekirjoitus `tiivistelmaField(group?, { title?, description?, validation? })` tehdään askeleessa 1. | Yksi tehdas. |
| R12 | Sivun Ingressi: A piilottaa sen osiosivuilta, E piilottaa sen aina kun se on tyhjä. | E:n `hidden: ({ value }) => !value` riittää. A:n `OsioSivunKentta` ei sisällä ingressiä. | Yksinkertaisempi. |
| R13 | C1:n ja A:n rinnakkaisuus: molemmat muuttavat tiedostoa `sivu.ts`, ja A muuttaisi tiedostoa `queries.ts` (`allSivuSlugsQuery`). | C1 vaihtaa `rikasSisalto`-tyypin vain uutiseen, tapahtumaan ja klubin toimintaan. `sivu.body` vaihdetaan askeleessa 6. A suodattaa catch-allin `generateStaticParams`-tuloksen JavaScriptissä, ei kyselyssä. | Askeleet 2 ja 3 voi tehdä rinnakkain ilman yhteisiä kooditiedostoja. |
| R14 | Mallipohjat: A:lla `lukittu-sivu`, E:llä viisi pohjaa ja kaksi eri suodatinta. | Yksi tiedosto **`sanity/pohjat.ts`** (`pohjat(prev)` ja `PIILOTETUT_POHJAT`), jonka askel 3 luo ja askel 10 laajentaa. | Yksi paikka. |
| R15 | Toimintojen kääreet sivulla (A: lukittu, D: vanhat osoitteet, Kopioi pohjaksi). | Järjestys `lukitulleSivulle(varoitaVanhoistaOsoitteista(t))` ja `lukitulleSivulle(kopioiPohjaksi(t))` (§2.8). | Lukitulla sivulla toiminto on aina estetty. |
| R16 | Linkki ravintolaan, joka odottaa toista arvioijaa, veisi 404-sivulle. B piilotti vain ajastetut uutiset. | `kohdeProjektio` palauttaa `piilossa` myös tapauksessa `_type == "ravintola" && !JULKINEN_RAVINTOLA`. | Kävijä ei koskaan näe rikkinäistä linkkiä. |
| R17 | Lyhenteen muuttaminen valinnaiseksi (C) ja Y10:n ohjeteksti (E). | **Avoin päätös** (luku 6). Askel 1 kirjoittaa ohjeen nykyisen säännön mukaan. Jos muutos hyväksytään, se tehdään erillisenä askeleena 2b. | Muuttaa käytöstä, ei vain ohjetta. |
| R18 | `sivustonTila` ja kielto tehdä uusia singletoneja. | **Hyväksytään perusteltuna poikkeuksena:** järjestelmäloki, jota cron kirjoittaa ja jota isä ei muokkaa eikä näe sisältöpuussa, kuten `varmuuskopio`. Ilman sitä Studio ei näe ajastettujen tehtävien tulosta ilman Vercel-pääsyä. Pistetunnus `sivustonTila.*` ei näy julkisesta datasetistä. | docs/23 Y33. |
| R19 | E:n Aloitus käyttäisi Management- ja Hooks-rajapintoja selaimesta (taso, token, webhook). | **Karsitaan.** Aloitus lukee vain datasetin, ja kiintiö lasketaan dataseteistä. Lomakkeiden tokenin vika näkyy, koska yöllisen huollon kirjaus vanhenee (punainen). Kehittäjällä on jo `npm run tarkista:sanity-taso`. | CORS- ja oikeusriski, eikä isä voi itse korjata näitä vikoja. |
| R20 | Karsinnat (luku 7). | Pois jäävät: Y40 kategorian selitys, Y42 media-plugin, `ARKISTON_OSIOT`-yhdistäminen, Aloituksen Luo uusi- ja Tee näin -osiot, `ottelu-huuhkajat`-pohja, merkki "Odottaa hyväksyntää" ja `verify-redirects --sanity`. | Hyöty isän itsenäisyydelle on pieni suhteessa työhön, tai asia on tiekartassa vaiheessa 3. |

---

## 2. Yhteiset rajapinnat (sopimus)

### 2.1 Moduulit, omistajat ja käyttäjät

| Tiedosto | Viennit | Tekee (askel) | Käyttää |
|---|---|---|---|
| `sanity/schemas/objects/sanasto.ts` | `OSOITE_OTSIKKO = "Osoite sivustolla"`, `HAKUKONEET_RYHMA = { name: "seo", title: "Hakukoneet ja jako" }` | 1 | kaikki skeemamuutokset |
| `sanity/schemas/objects/contentMeta.ts` | `tiivistelmaField(group?, { title?, description?, validation? })` (1); `aiemmatPolutField(group?, kuvaus?)`, `AIEMMAT_TUNNISTEET_KUVAUS` ja uusi `polkuMuuttunut` (8) | 1, 8 | 3, 8 |
| `lib/sisaltolohkot.ts` | `RIKKAAT_LOHKOT`, `PERUSLOHKOT`, `type RikasLohko`, `KUVAN_MIN_LEVEYS_SISALTO = 600`, `kuvanMitat`, `sisallonKuvat`, `ensimmainenIsoKuva` (2); `HUOMION_SAVYT`, `huomionSavy` (6); `korttiOte`, `korttiTeksti` (2b) | 2, 6 | 2, 6 |
| `lib/osiosivut.ts` | `OSIOSIVUT`, `OsioSivuSlug`, `OSIOSIVU_SLUGIT`, `osioSivuId`, `osioSivu`, `johdantoPakollinen`, `piilotaKentta`, `ratkaiseOsioSivu`, `osioSivuSiemen`, `luokitteleOsioSivut`, tyypit `OsioSivu`, `OsioSivuDoc`, `OsioSivunTekstit` | 3 | 3, 4 (patch), 8 |
| `lib/path.ts` | `KOODIIN_SIDOTUT_SIVUT` = 30 osiosivua ja tietosuoja (3); exportattu `TYPE_BASE`, `polunKohteet(polku)` (4) | 3, 4 | 4, 5, 8 |
| `lib/liite.ts` | `LIITTEEN_PAATTEET`, `LIITTEEN_ACCEPT = ".pdf,.docx,.xlsx,application/pdf"`, `tiedostonPaate`, `tarkistaLiitetiedosto`, `tiedostonTyyppi`, `tiedostonKoko`, `liitteenTiedot`, `tiedostonOsoite`, `LIITE_ISO_TAVUA = 15 MiB` | 4 | 4, 6 |
| `lib/linkki.ts` | nykyiset `tarkistaLinkki` ja `sisainenPolku` sekä `LINKIN_KOHDETYYPIT`, `LinkinTyyppi`, `LinkinKohde`, `LinkinTiedosto`, `LinkkiData`, `linkinTyyppi`, `linkinOsoite`, `linkinKuvaus`, `ratkaiseLinkit`, `kohteenTilaViesti` | 4 | 4, 6, 8 |
| `lib/navigaatio.ts` | `RaakaNavigaatioKohta`, `ratkaiseNavigaatio`, `onYleissivuAlavalikossa`, `alatunnisteenSarakkeet`, `SIVUSTO_SARAKE`, `YLEISESITTELY` | 4 | 4 |
| `sanity/schemas/objects/linkki.ts` | tyyppi `linkki`, `linkkiKentat({ pakollinen })`, `vaadiLinkki`, `linkinEsikatselu` | 4 | 4, 6 (painike), 8 (ohjaus) |
| `sanity/schemas/objects/liite.ts` | `liitetiedostoKentta(overrides?)` (4); lohkotyyppi `liite` (6) | 4, 6 | 4, 6 |
| `sanity/schemas/objects/portableText.ts` | `tekstiLohko` (2), `tekstinLinkki` (4) | 2, 4 | `portableText`, `rikasSisalto` |
| `sanity/lib/queries/linkki.ts` | `kohdeProjektio`, `linkkiProjektio` (GROQ) | 4 | 4, 6, 8 |
| `sanity/lib/queries/kuvat.ts` | `runko`: kuvasarja (2), markDefs (4), liite ja painike (6); `korttikuva()` (2) | 2, 4, 6 | kaikki tekstikentät |
| `sanity/lib/queries/uutiskortti.ts` | `uutisKortinPerus`, `uutisKortti` | 2 | listat, etusivu |
| `sanity/lib/osiosivu.ts` | `osioSivuQuery`, `osioSivujenKortitQuery`, `haeOsioSivu(slug)` | 3 | 26 reittiä |
| `sanity/lib/navigaatio.ts` | `haeNavigaatio()` (React `cache`, ratkaistu, `stegaClean` tehty, `piilotaTyhjat` tehty) | 4 | Header, Footer |
| `lib/upotus.ts` | `tulkitseUpotus`, `upotuksenVirhe`, `poimiOsoite`, `UPOTUSPALVELUT`, `UpotusPalvelu` | 6 | 6 |
| `lib/ohjaukset.ts` | `OHJATTAVAT_TYYPIT`, `TUNNISTE_TYYPIT`, `OHJAUKSELTA_VARATUT`, `normalisoiPolku`, `omaPolku`, `ratkaiseOhjaus`, `tarkistaOhjauksenLahde`, `yhdistaAiemmatPolut`, `osoitteenMuutos`, `polunMuutosViesti` (8); `vanhatOsoitteet`, `KOPIOSTA_POISTETTAVAT`, `tyhjennaKopiosta` (9) | 8, 9 | 8, 9 |
| `sanity/lib/ohjaus.ts` | `ohjaaTaiEiLoydy(polku): Promise<never>` (server-only) | 8 | **jokainen** dynaaminen reitti |
| `lib/sivuston-tila.ts` | `TILA_ID`, tyypit `Tila`, `TilaRivi`, `AjonTulos`, `AjoDokumentti`, säännöt `varmuuskopionTila`, `huollonTila`, `otteluhaunTila`, `kiintionTila`, `julkaisemattomienTila`, `kokonaistila`, `huoltoajonKirjaus`, `puuttuvatPerustiedot`, `DATASETIT`, `KIINTIO = 10_000` | 7 | 7 |
| `sanity/lib/tehtavat.ts` | `TEHTAVAT`, `TARKISTETTAVAT_TYYPIT` (siirto tiedostosta structure.ts), `ALOITUS_KYSELY` | 7 | structure, Aloitus |
| `sanity/lib/kirjaa-ajo.ts` | `kirjaaAjo(client, id, tehtava, kirjaus)` | 7 | cronit |
| `lib/pohjat.ts`, `sanity/pohjat.ts` | `TAYTA`, `taytettavatKohdat`, `taytaVielaSaanto`, pohjafunktiot (10); `pohjat(prev)`, `PIILOTETUT_POHJAT` (3, laajennus 10) | 3, 10 | sanity.config |
| `lib/tilamerkit.ts`, `sanity/merkit.tsx` | `onAjastettu`, `onTarkistettava`, `onJulkinenRavintola`, `merkitTyypille` | 10 | sanity.config |
| `lib/tilasto-kategoriat.ts`, `lib/sijainnit.ts` | `TILASTO_KATEGORIAT`, `TILASTORYHMAT`, `kategorianNimi`, `dokumentinSijainnit` | 11 | jalkapalloTilasto, presentation |

Tuontisäännöt:
- `lib/`-moduulit käyttävät vain suhteellisia tuonteja ja `import type` -tuonteja, jotta ne toimivat tsx-skripteissä.
- `lib/osiosivut.ts` tuo vain tiedoston `./ravintola-arvosana`. Se ei saa tuoda tiedostoja `./path` tai `./nav-sections`, koska path.ts tuo osiosivut.ts:n (kehä).
- `sanity/lib/queries/linkki.ts` ei saa tuoda tiedostoa `kuvat.ts`, koska kuvat.ts tuo linkki.ts:n.

### 2.2 Linkkiobjekti (B, sitova kaikille)

**Kentät** (`linkkiKentat({ pakollinen })`):

| nimi | tyyppi | otsikko | näkyy |
|---|---|---|---|
| `tyyppi` | string, radio vaakasuunnassa: `sivu` = Sivuston sivu, `osoite` = Muu osoite, `tiedosto` = Tiedosto | Mihin linkki vie? | aina |
| `kohde` | reference, kohteina `LINKIN_KOHDETYYPIT` = sivu, uutinen, tapahtuma, ravintola, klubiToiminta, arvokisa, galleriaAlbumi, stadion, pelaaja; `options: { disableNew: true, filter: "defined(slug.current)" }`. **Vahva viittaus.** | Sivu | kun tyyppi on sivu **tai** kentällä on arvo |
| `href` | string | Osoite | kun `linkinTyyppi(parent) === "osoite"` |
| `tiedosto` | `liitetiedostoKentta({ name: "tiedosto" })` | Tiedosto | kun tyyppi on tiedosto |

**Vanha data:** objekti, jolla ei ole `tyyppi`-kenttää mutta on `href`, tulkitaan tyypiksi "osoite". Valikon, pikalinkkien ja tekstieditorin vanhat merkkijonot ovat siis valmiiksi kelvollisia.

**GROQ** (`sanity/lib/queries/linkki.ts`):
```ts
export const kohdeProjektio = /* groq */ `{ _id, _type, "slug": slug.current, "nimi": coalesce(title, name),
  "piilossa": (_type == "uutinen" && !${JULKAISTU}) || (_type == "ravintola" && !${JULKINEN_RAVINTOLA}) }`;
export const linkkiProjektio = /* groq */ `tyyppi, href,
  "kohde": kohde->${kohdeProjektio},
  "tiedosto": tiedosto.asset->{ url, originalFilename, extension, size }`;
```

**Href lasketaan koodissa** `linkinOsoite(l)`-funktiolla (`documentHref`, lib/path.ts). Säännöt:
- `sivu`: palautetaan `kohde && !kohde.piilossa ? documentHref(kohde) : null`.
- `osoite`: palautetaan `href`, jos `tarkistaLinkki(href) === true`.
- `tiedosto`: palautetaan `tiedostonOsoite(tiedosto)`.
- Muuten palautetaan `null`.

Jos tulos on `null`, kävijä näkee pelkän tekstin (tekstieditori) tai kohta jää pois (listat).

### 2.3 Lohkojen tyyppinimet (rikasSisalto)

| Tyyppinimi | Kentät | Askel |
|---|---|---|
| `imageWithAlt` | ennallaan, alt pakollinen | – |
| `kuvasarja` | `kuvat: galleriaKuva[]`, `kuvaus: string`, `asettelu: "ruudukko" \| "kokonaisena"` | 2 |
| `youtubeVideo`, `kokoonpano` | ennallaan | – |
| `upotus` | `osoite: text`, `otsikko: string`, `kuvateksti?: string` | 6 |
| `huomio` | `savy: "tieto" \| "tarkea"`, `otsikko?`, `teksti: text` | 6 |
| `painike` | `teksti: string`, `linkki: linkki` | 6 |
| `liite` | `otsikko: string`, `tiedosto: file` | 6 |
| `taulukko` | `otsikko`, `columns[]`, `rows[]` (sama malli kuin jalkapalloTilastossa) | 6 |

`rikasSisalto`-tyyppiä käyttävät `uutinen.body`, `tapahtuma.description`, `klubiToiminta.kuvaus` (askel 2) ja `sivu.body` (askel 6). Muut 8 tekstikenttää pysyvät `portableText`-tyyppisinä.

### 2.4 Osiosivut

- `_id = osioSivuId(slug) = "sivu-" + slug.replaceAll("/", "-")`. Tämä vastaa productionin dokumentteja `sivu-klubi` ja `sivu-klubi-palloveikkaus`.
- 30 polkua: klubi, klubi/toiminta, klubi/hallitus, klubi/palloveikkaus, klubi/yhteystiedot, uutiset, uutiset/arkisto, uutiset/tunnisteet, tapahtumat, galleria, ottelut, ravintolat, ravintolat/odottavat, jalkapalloarkisto ja 16 sivua `jalkapalloarkisto/{huuhkajat, arvokisat, mestarit, eurocupit, vuoden-pelaajat, euroopan-paras, maailman-parhaat, valmentajat, fifa-ranking, lupaavat, saavutukset, jarkytykset, ulkomaiset-mestarit, palloliitto, stadionit, tilastot}`.
- `KOODIIN_SIDOTUT_SIVUT = [...OSIOSIVUT.map(o => o.slug), TIETOSUOJA_SLUG]`, yhteensä 31.

### 2.5 Välimuistitagit ja webhook (`app/api/revalidate/route.ts`)

| Tagi | Käyttäjät | Tyhjennetään, kun | Askel |
|---|---|---|---|
| `sivu`, `sivu:<slug>` | osiosivut (nykyinen) | sivu muuttuu | 3 (ei muutosta) |
| `linkit` | navigaatio, etusivu, klubin toiminta | mikä tahansa `LINKIN_KOHDETYYPIT`-tyyppi muuttuu (RIIPPUVAT yhdistetään) | 4 |
| `ohjaus` | ohjauskartta (404-haara) | `ohjaus` tai mikä tahansa `OHJATTAVAT_TYYPIT`-tyyppi muuttuu | 8 |
| (ohitus) | – | `sivustonTila` ja `varmuuskopio` palauttavat 200 ilman tyhjennystä | 7 |

Tekstieditorin linkkien kohteiden polunmuutos päivittyy muissa dokumenteissa 60 sekunnin viiveellä (`fetch.ts`). Tämä hyväksytään.

Webhookin projektio askeleesta 8 alkaen (sama kaikille, docs/17 §D):
```groq
{ _id, _type, "slug": slug.current, "operaatio": delta::operation(),
  "ennen": before(){ "slug": slug.current, category, huuhkajatOsio, mestaruusmaa } }
```

### 2.6 Studion rakenne ja kiinteät tunnisteet (askel 3 luo, muut täydentävät)

```
tehtavat            Tehtävät sinulle        → arvostelut, kommentit, julkaisemattomat, ajastetut, tarkistettavat   (rekisteri: askel 7)
asetukset           Sivuston asetukset      → etusivu, navigaatio, ohjaukset (askel 8: lyhytosoitteet, muuttuneet), varmuuskopiot
tarkistettavat      Tarkistettavat
— erotin —
uutiset, uutiskategoriat, kommentit, ottelut, tapahtumat, galleria
sivut               Sivut (omat sivut, ilman osiosivuja ja palloveikkauksen alasivuja)
— erotin —
klubi               Klubi → esittely | toiminta (toiminta-sivu, toimintamuodot) | hallitus (hallitus-sivu, nykyinen, entiset)
                           | palloveikkaus (palloveikkaus-sivu, veikkausten-alasivut) | yhteystiedot (yhteystiedot-tiedot, yhteystiedot-sivu)
— erotin —
ravintolat          … arvosanat (askel 10: arvosanat-ravintoloittain, arvosanat-kaikki)
jalkapalloarkisto   … tilastot (askel 11: tilastot-<ryhmä>, tilastot-kaikki)
osiosivut           Osioiden sivut → osiosivut-uutiset, osiosivut-ravintolat, osiosivut-jalkapalloarkisto
```

Lukitun sivun kohdan id on `osioSivuId(slug)`. Studio-polut ovat muotoa `/studio/structure/tehtavat;julkaisemattomat`. Yksittäinen dokumentti avataan `IntentLink`illä (`intent="edit"`, `params={{ id, type }}`).

### 2.7 `sanity.config.ts`: toimintojen ja pohjien kokoonpano (lopputila)

- `schema.templates: pohjat` (sanity/pohjat.ts). Pohja suodattaa singletonit, `varmuuskopio`n ja `sivustonTila`n sekä lisää pohjat `lukittu-sivu` (3), `uutinen-vuosikokous`, `uutinen-palloveikkaus-tilanne`, `uutinen-palloveikkaus-kausi`, `klubiArvio-ravintolalle` (10) ja `jalkapalloTilasto-kategoria` (11).
- `newDocumentOptions` (global) suodattaa `PIILOTETUT_POHJAT` = lukittu-sivu, klubiArvio-ravintolalle ja jalkapalloTilasto-kategoria, koska ne vaativat parametrin.
- `document.actions`:
  - `sivustonTila` → `[]` (7).
  - `sivu`:
    - `delete` ja `unpublish` → `lukitulleSivulle(varoitaVanhoistaOsoitteista(t))`
    - `duplicate` → `lukitulleSivulle(kopioiPohjaksi(t))`
    - perään `PalautaVarmuuskopiosta`
  - Oletushaara:
    - `delete` ja `unpublish` → `varoitaVanhoistaOsoitteista(t)`
    - `duplicate` → `kopioiPohjaksi(t)`
    - perään `PalautaVarmuuskopiosta` (9)
  - Arvostelu-, kommentti-, varmuuskopio- ja singleton-haarat ovat ennallaan.
- `document.badges` (10) ja `presentationTool({ resolve: { locations } })` (11).
- `plugins: [aloitus(), structureTool(…), presentationTool(…), visionTool(…), fiFILocale()]` (7).

### 2.8 Yhteiset tiedostot ja konfliktisääntö

Seuraavia tiedostoja muokkaavat useat askeleet, mutta muutokset ovat rivien lisäyksiä:
- `package.json` (skriptit, `npm test` -ketju)
- `CLAUDE.md` (komentotaulukko)
- `sanity/schemas/index.ts` (tyyppirekisteri)
- `docs/09`, `docs/05` ja `docs/23 §0` (kunkin askeleen oma luku tai rivi)

Ne **eivät estä rinnakkaisuutta**. Rinnakkaiset haarat yhdistetään järjestyksessä ja rebasetaan, ja näiden tiedostojen konfliktit ratkaistaan yhdistämällä molemmat rivit. Kaikki muut tiedostot on lueteltu askeleittain. Kahta askelta, joilla on yhteinen kooditiedosto, ei tehdä rinnakkain.

---

## 3. Toteutusjärjestys

```
1 Sanasto ──┬─► 2 Kuvasarja (C1) ──┐
            └─► 3 Osiosivut (A) ───┴─► 4 Linkit + alatunniste (B1) ─┬─► 5 patch:linkit -skripti (B2)
                                                                    ├─► 6 Tekstilohkot (C2) ──┐
                                                                    └─► 7 Sivuston tila (E2) ─┴─► 8 Ohjaukset (D1) ─► 9 Poiston turva (D2)
                                                                                                   ─► 10 Pohjat + merkit (E3) ─► 11 Taulukon sijainti (E4)
12 Ohjausgeneraattorin pienet korjaukset (D3): milloin tahansa, rinnakkain minkä tahansa kanssa
(2b Lyhenne valinnaiseksi: vain jos päätös 6.1 on kyllä, askeleen 2 jälkeen)
```

| Askel | Kokonaisuus | Työ (pv) | Riippuu | Rinnakkain |
|---|---|---|---|---|
| 1 | E: sanasto, johdantojen ohjeet, lohkon piilotus (Y38, Y10) | 1 | – | 12 |
| 2 | C1: rikasSisalto ja kuvasarja, korttikuva, jakokuva (Y9) | 2 | 1 | 3, 12 |
| 2b | C: Lyhenne valinnaiseksi ja tekstin alku kortissa (päätös 6.1) | 0,25 | 2 | 3 |
| 3 | A: osiosivut, Klubi-ryhmä, korttiteksti (Y22, Y25) | 4 | 1 | 2, 12 |
| 4 | B1: linkkiobjekti, alatunniste, tekstieditorin linkki (Y17 2–3, Y23) | 3,5 | 2, 3 | 12 |
| 5 | B2: `patch:linkit`-skripti | 1 | 4 | 6, 7, 12 |
| 6 | C2: liite, huomio, painike, taulukko, upotus (Y14, Y15) | 3,5 | 4 | 5, 7, 12 |
| 7 | E2: sivuston tila ja Aloitus (Y33) | 2 | 4 | 5, 6, 12 |
| 8 | D1: automaattiset ohjaukset ja lyhytosoitteet (Y18) | 3,5 | 6, 7 | 12 |
| 9 | D2: poiston turva ja Kopioi pohjaksi (Y20) | 1 | 8 | 12 |
| 10 | E3: valmiit pohjat, tilamerkit, arvosanat ravintoloittain (Y37) | 1 | 9 | 12 |
| 11 | E4: taulukon sijainti ja tilastoryhmät (Y36) | 1 | 10 | 12 |
| 12 | D3: ohjausgeneraattorin oletus production, crawl-status gitiin (Y19:n loppu) | 0,25 | – | kaikki |

Yhteensä noin 24 työpäivää: noin 5 viikkoa yhdellä toteuttajalla tai noin 3,5 viikkoa kahdella. Järjestys noudattaa docs/23:n sidottua järjestystä osiosivut → linkit → lohkot → ohjaukset. Kuvasarja on aikaistettu, koska blogi on katkaistu (Y9 kuului vaiheeseen 1C).

---

## 4. Askeleet

### Askel 1: Sanasto, johdantojen ohjeet ja lohkon aito piilotus (E: Y38, Y10)

**Tavoite:** Studion kentät puhuvat isän kieltä, johdantokenttien työnjako on ohjeissa oikein, ja etusivun lohkon voi piilottaa poistamatta sitä. Muutos ei kirjoita dataa.

**Tiedostot:**
- uusi `sanity/schemas/objects/sanasto.ts`
- `sanity/schemas/objects/contentMeta.ts` ja `seoFields.ts`
- `sanity/schemas/documents/{arvokisa, galleriaAlbumi, jalkapalloTilasto, klubiToiminta, pelaaja, ravintola, sivu, stadion, tapahtuma, uutinen, kaupunki, uutisKategoria, hallitusJasen}.ts`
- `sanity/schemas/singletons/{etusivu, yhteystiedot}.ts`
- `sanity/lib/queries/etusivu.ts` ja `sanity/lib/queries/ottelut.ts` (kommentti)
- `sanity/structure.ts` (vain Klubin toiminnan järjestys)
- `docs/09`, `docs/05`

**Toteutus:**
1. `sanasto.ts`: `OSOITE_OTSIKKO` ja `HAKUKONEET_RYHMA`. Ryhmän nimi pysyy `seo`, joten dataa ei muuteta.
2. Nimet ja kuvaukset:

| Paikka | Uusi otsikko | Uusi kuvaus |
|---|---|---|
| slug 10 tyypissä | Osoite sivustolla | Tyyppikohtainen, esim. uutinen: "Muodostuu otsikosta: paina Luo. Uutisen osoite on /uutiset/tämä-osa. (Aiemmin kentän nimi oli Polku.)" ja vastaavasti /tapahtumat/, /ravintolat/, /galleria/, /jalkapalloarkisto/arvokisat/, …/pelaajat/, …/stadionit/, /klubi/toiminta/. Taulukko: "Taulukon tunniste osoitteessa." Ohjauksesta ei mainita vielä mitään (askel 8). |
| sivu.slug | Osoite sivustolla | "Vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. Alasivulle kauttaviiva: klubi/historia → /klubi/historia. Klubi-osion pääsivujen ja tietosuojaselosteen osoitteet on lukittu." |
| ryhmä `seo` (10 tyyppiä) | Hakukoneet ja jako | – |
| seoTitle | Otsikko hakutuloksissa (valinnainen) | "Näkyy Googlessa ja selaimen välilehdellä. Jos tyhjä, käytetään otsikkoa." |
| seoDescription | Kuvaus hakutuloksissa (valinnainen) | "Teksti Googlen hakutuloksen alla. Jos tyhjä, käytetään sivun alussa näkyvää tekstiä (Tiivistelmä, Lyhenne tai Ingressi). Enintään 160 merkkiä." |
| sivu.hero | Iso kuva sivun yläosassa | "Valinnainen. Näkyy otsikon takana koko leveydellä ja somejaoissa." |
| kaupunki.slug | Osoite suodattimessa | "Muodostuu nimestä: paina Luo. Esim. /ravintolat?kaupunki=lahti." Virhe: "Paina Luo, niin osoite muodostuu nimestä." |
| uutisKategoria.slug | Osoite suodattimessa | "Muodostuu nimestä: paina Luo. Osoite on /uutiset?kategoria=tämä-osa." |
| uutinen.blogspot.polku | Osoite vanhassa blogissa | ennallaan |
| yhteystiedot.socials[].url | Verkko-osoite | "Alkaa https://" |
| klubiToiminta.jarjestys | Järjestys listassa | "Pienempi luku näkyy Toiminta-sivulla ja Studion listassa ylempänä." |
| klubiToiminta.vuodet[].jarjestysnumero | Monesko kerta | "Tavallisena lukuna, esim. 37. Sivulla näkyy (37.)." |
| hallitusJasen.order | Järjestys hallitussivulla | "1 = ensimmäisenä (yleensä puheenjohtaja)." Ordering-otsikko on sama. |
| jalkapalloTilasto.jarjestys | Järjestys sivulla | ennallaan |

3. `structure.ts`: Klubin toiminnan listan järjestys `defaultOrdering([{ field: "jarjestys", direction: "asc" }, { field: "title", direction: "asc" }])`, sama kuin sivustolla (`queries/klubi.ts:131`).
4. **Y10:**
   - `tiivistelmaField(group?, { title?, description?, validation? })`. Oletuskuvaus: "Näkyy sivun alussa isommalla tekstillä ja on se teksti, jonka hakukone todennäköisimmin lainaa. 2–3 virkettä."
   - Uutisen tiivistelmä: otsikko "Tiivistelmä jutun alussa (valinnainen)", kuvaus "Näkyy jutun alussa isommalla tekstillä ja hakukoneissa. Jos tämä on täytetty, se näkyy jutun alussa Lyhenteen sijaan. Uudessa jutussa voit jättää tämän tyhjäksi: silloin alussa näkyy Lyhenne."
   - `uutinen.excerpt`: otsikko "Lyhenne (uutislista ja etusivu)", kuvaus "1–2 virkettä, jotka näkyvät uutislistassa ja etusivun kortissa. Näkyy myös jutun alussa, jos Tiivistelmä on tyhjä. Enintään 200 merkkiä. Ei pakollinen, jos uutinen on pelkkä linkki alkuperäiseen kirjoitukseen." Sääntö pysyy ennallaan.
   - Sivun tiivistelmä: otsikko "Tiivistelmä sivun alussa", kuvaus "2–3 virkettä, jotka näkyvät sivun alussa isommalla tekstillä ja hakukoneissa."
   - `sivu.ingress`: otsikko "Ingressi (vanha kenttä)", kuvaus "Näkyy sivun alussa vain, jos Tiivistelmä on tyhjä. Kirjoita johdanto Tiivistelmään.", `hidden: ({ value }) => !value`. Productionissa Ingressi on vain tietosuojasivulla, joten se näkyy siellä edelleen.
5. **Lohkon piilotus:**
   - Jaettu kenttä `piilota` lisätään ensimmäiseksi kaikkiin 7 etusivun lohkotyyppiin. Otsikko "Piilota lohko sivulta", tyyppi boolean, `initialValue: false`, kuvaus "Lohko säilyy tässä listassa asetuksineen, mutta ei näy etusivulla. Ota rasti pois, niin lohko palaa."
   - Esikatselun alaotsikon eteen tulee "Piilotettu · ".
   - `blocks`-kentän kuvaus: "Järjestä lohkot vetämällä kahvasta (⋮⋮). Jos haluat lohkon pois sivulta väliaikaisesti, avaa se ja rastita Piilota lohko sivulta. Roskakori poistaa lohkon asetuksineen."
   - `etusivuQuery`: `blocks[]{` muutetaan muotoon `blocks[piilota != true]{`.
   - `ottelujenSeuratQuery` **ei** suodata piilotettuja lohkoja. Siihen lisätään kommentti.
   - Seurat-kentän kuvaukseen lisätään: "Lista ohjaa myös Ottelut-sivua, vaikka lohko olisi piilotettu."

**Testit:** ei uusia puhtaita sääntöjä. Yhteiset kriteerit (§0.5) ja typegen.

**Hyväksymiskriteerit:**
- Studiossa (development) jokainen muutettu otsikko näkyy.
- Piilotettu lohko ei renderöidy etusivulla, ja /ottelut säilyttää seuralistansa.
- Tietosuojasivun Ingressi näkyy edelleen, ja tyhjä Ingressi on piilossa muilla sivuilla.
- Production-build (vain luku) toimii.

**docs/09:**
- Läpi oppaan: "Polku" muutetaan muotoon "Osoite sivustolla" ja "SEO" muotoon "Hakukoneet ja jako".
- Kohdan "Uutisen kirjoittaminen" kohta 3 korjataan (Y10), ja lisätään taulukko "Mikä teksti näkyy missä" (jutun alku, uutislista ja etusivu, hakutulos).
- "Etusivun muokkaaminen", kohta 4: "piilota rastilla, roskakori poistaa".
- Klubin toiminta: "Monesko kerta". Hallitus: "Järjestys hallitussivulla". Taulukko: "Järjestys sivulla".
- Uusi kohta "Aiemmin ladatun kuvan käyttö": kuvakenttä → Valitse → Selaa kuvia → hakukenttä (Y42-linjaus, ei pluginia).

**docs/05:** `etusivu.blocks[].piilota` ja `tiivistelmaField`-ohitukset.

---

### Askel 2: rikasSisalto ja kuvasarja, korttikuvan varakäytös ja jakokuva (C1: Y9)

**Tavoite:** Isä raahaa kuvasarjan uutiseen, tapahtumaan tai klubin toimintaan yhdellä yhteisellä kuvauksella. Uutinen ilman kansikuvaa saa listoihin ja jakoon tekstin ensimmäisen ison kuvan. Dataa ei muuteta.

**Tiedostot:**
- uudet:
  - `lib/sisaltolohkot.ts`
  - `sanity/schemas/objects/rikasSisalto.ts`
  - `sanity/schemas/objects/kuvasarja.ts`
  - `sanity/lib/queries/uutiskortti.ts`
  - `components/kuvasarja.tsx`
  - `scripts/test-lohkot.ts`
- `sanity/schemas/objects/portableText.ts` (`tekstiLohko`-vienti, `of` muodostetaan `PERUSLOHKOT`-listasta, käytös ennallaan)
- `sanity/schemas/objects/galleriaKuva.ts`
- `sanity/schemas/documents/{uutinen, tapahtuma, klubiToiminta}.ts`
- `sanity/schemas/index.ts`
- `sanity/lib/queries/{kuvat, uutiset, etusivu, lehtileikkeet}.ts` ja `sanity/lib/queries.ts` (recentUutisetQuery)
- `lib/seo.ts`
- `components/portable-text.tsx`, `components/gallery/album-grid.tsx`
- `package.json`: devDependency `groq-js` `^1.30.3` (sama versio kuin node_modulesissa, MIT, Sanityn oma) ja skripti `test:lohkot`
- `docs/09`, `docs/05`, `CLAUDE.md`

**Toteutus:**
1. **`lib/sisaltolohkot.ts`:**
   - `RIKKAAT_LOHKOT = ["imageWithAlt", "kuvasarja", "youtubeVideo", "kokoonpano"]`. Askel 6 lisää loput Studion valikon järjestyksessä: imageWithAlt, kuvasarja, youtubeVideo, upotus, huomio, painike, liite, taulukko, kokoonpano.
   - `PERUSLOHKOT = ["imageWithAlt", "kokoonpano", "youtubeVideo"]`.
   - `kuvanMitat` siirretään tänne tiedostosta lib/seo.ts.
   - `sisallonKuvat(lohkot)` litistää kuvasarjojen kuvat mukaan ja ottaa vain kuvat, joilla on asset. `ensimmainenIsoKuva(lohkot, min = 600)`.
2. **`rikasSisalto`:** `defineType({ name: "rikasSisalto", title: "Sisältö", type: "array", of: [tekstiLohko, ...RIKKAAT_LOHKOT.map(type => defineArrayMember({ type }))] })`.
3. **Kenttätyypin vaihto:** `uutinen.body`, `tapahtuma.description` ja `klubiToiminta.kuvaus` saavat tyypin `"rikasSisalto"`. Validoinnit pysyvät ennallaan. `sivu.body` vaihdetaan vasta askeleessa 6.
4. **Uutisen kansikuva:**
   - kuvaus: "Näkyy uutislistassa, etusivulla ja kun linkki jaetaan. Jos jätät tyhjäksi, käytetään tekstin ensimmäistä isoa kuvaa."
   - varoitus (`.warning()`), kun ei ole kansikuvaa eikä `ensimmainenIsoKuva(body)` löydä kuvaa: "Uutisessa ei ole kansikuvaa eikä isoa kuvaa tekstissä. Listassa näkyy pelkkä teksti ja jaossa klubin logo."
5. **`kuvasarja`** (ikoni ImagesIcon, otsikko "Kuvasarja (useita kuvia)"):

| Kenttä | Otsikko | Kuvaus | Validointi |
|---|---|---|---|
| `kuvat` (galleriaKuva[], `layout: "grid"`) | Kuvat | "Raahaa kaikki kuvat tähän kerralla tietokoneen kansiosta (puhelimessa: Lataa → valitse useita). Järjestä raahaamalla." | virhe `required().min(1)` "Lisää kuvasarjaan kuvia."; varoitus `min(2)` "Yhdelle kuvalle käytä lohkoa Kuva."; varoitus `max(60)` "Yli 60 kuvaa: harkitse galleria-albumia." |
| `kuvaus` | Mitä kuvissa on (yhteinen kuvaus) | 'Esim. "Klubin vappu 2026 Lahden torilla". Näkyy kuvien alla, ja ruudunlukija käyttää sitä kuvien kuvauksena, jos kuvalla ei ole omaa kuvausta ("Klubin vappu 2026, kuva 3/9").' | virhe 3–120 merkkiä "Kirjoita kuvasarjalle lyhyt kuvaus (3–120 merkkiä)." |
| `asettelu` (radio) | Kuvien muoto | vaihtoehdot "Tasainen ruudukko (kuvat rajataan neliöiksi)" = `ruudukko` ja "Kokonaiset kuvat (kuvakaappaukset, lehtileikkeet, kaaviot)" = `kokonaisena`, oletuksena ruudukko | – |

   - Esikatselu: otsikkona kuvaus tai "Kuvasarja", alaotsikkona `Kuvasarja · N kuvaa`, mediana ensimmäinen kuva.
   - `galleriaKuva.alt`-kentän kuvaus: 'Suositeltava, ei pakollinen. Esim. "Klubilaiset Lahden stadionin katsomossa". Ilman kuvausta sivu käyttää albumin nimeä tai kuvasarjan kuvausta ja kuvan numeroa.' Kuvatekstin kuvaus: "Näkyy suurennetun kuvan alla."
6. **GROQ** (`kuvat.ts`):
   ```ts
   export const runko = `..., _type == "imageWithAlt" => { ${lqip} },
     _type == "kuvasarja" => { "kuvat": kuvat[defined(asset)]{ ${kuva}, ${vari} } }`;
   export function korttikuva(kentta = "coverImage", runkoKentta = "body") {
     const iso = `asset->metadata.dimensions.width >= ${KUVAN_MIN_LEVEYS_SISALTO}`;
     return `"${kentta}": coalesce(select(defined(${kentta}.asset) => ${kentta}),
       ${runkoKentta}[(_type == "imageWithAlt" && ${iso}) || (_type == "kuvasarja" && count(kuvat[${iso}]) > 0)][0]{
         "k": select(_type == "kuvasarja" => kuvat[${iso}][0], @) }.k){${kuva}}`;
   }
   ```
   - `uutiskortti.ts`: `uutisKortinPerus` (nykyiset kortin kentät ilman kuvaa) ja `uutisKortti = perus + korttikuva()`.
   - Uutiskorttia käyttävät `uutinenCardFields`, etusivun nostoKortti, `recentUutisetQuery` ja `lehtileikkeet.ts`. Samalla korjataan lehtileikkeet.ts:n `categories` muotoon `uutisenKategoriat`, koska vanha kenttä poistui 4.10.
   - `uutinenDetailQuery` käyttää perusosaa ja muotoa `coverImage{${kuva}}` **ilman** varakuvaa, jotta sama kuva ei näy kahdesti.
7. **Renderöinti:**
   - `portable-text.tsx`: `const lohkot = { … } satisfies Record<RikasLohko, PortableTextTypeComponent<any>>`. Tyyppitarkistus varmistaa käännösaikana, että jokaisella lohkolla on renderöijä.
   - `components/kuvasarja.tsx` (palvelinkomponentti): `stegaClean(asettelu)`, ja rakenne `<figure className="mt-8"><AlbumGrid images albumTitle={kuvaus || "Kuvasarja"} kokonaisena sarakkeet={3} />{kuvaus && <figcaption className="mt-2 text-sm text-muted">}</figure>`.
   - `AlbumGrid` saa propin `sarakkeet?: 3 | 4` (oletus 4). Arvolla 3: `grid-cols-2 sm:grid-cols-3` ja `sizes="(min-width: 768px) 240px, 50vw"`.
   - Alt-varateksti ja lightboxin fokuksen palautus ovat valmiina.
8. **Jakokuva** (`lib/seo.ts`): `jakokuvaSisallosta` käy läpi `sisallonKuvat(sisalto)` (≥600 px) ennen YouTubea.

**Testit** (`scripts/test-lohkot.ts`, `npm run test:lohkot`):
- Listat:
  - `RIKKAAT_LOHKOT` ilman toistoja
  - `PERUSLOHKOT` ⊂ `RIKKAAT_LOHKOT` oikeassa järjestyksessä
- Kuvien poiminta:
  - `kuvanMitat("image-abc-2016x1512-jpg")` → {w: 2016, h: 1512}
  - tiedostoviittaus tai undefined → null
  - `sisallonKuvat`: tulos [A, B, D], kun kuvalla C ei ole assetia
  - `ensimmainenIsoKuva`: 397 px:n kuva ohitetaan ja kuvasarjan 1645 px:n kuva valitaan
- Lukuaika ei muutu, kun tekstissä on kuvasarja.
- **groq-js** (`parse` ja `evaluate`) aineistolla, jossa on kuva-assetit ja uutiset:
  - (a) kansikuva voittaa
  - (b) tekstikuvista valitaan ensimmäinen ≥600 px
  - (c) kuvasarjan ensimmäinen iso kuva
  - (d) ei kuvia → null
  - (e) `runko` lisää kuvasarjan kuviin `lqip` ja `vari`, ja imageWithAltin `lqip` säilyy

**Hyväksymiskriteerit:**
- Ennen deployta ajetaan lukutarkistus (luku 5, P2). Tulos on 0.
- Developmentin Studiossa:
  - 10 kuvaa raahataan kerralla, myös puhelimella.
  - Uutisen voi julkaista ilman kansikuvaa, ja vain varoitus näkyy.
  - Uutinen 16deaa03… (YouTube) ja sivu toriparkki eivät näytä Invalid-varoitusta.
- Sivustolla:
  - "Suomi - Englanti 13.10.2024" saa listassa kuvan.
  - Uutissivulla ei ole kaksoiskuvaa.
  - og:image on ennallaan.
- Näppäimistö: ruutu → lightbox → Esc palauttaa fokuksen.
- `test:saavutettavuus` sivuille /uutiset ja testiuutiselle.

**docs/09:**
- "Uutisen kirjoittaminen": kansikuva valinnainen ja varakuva. Kuvajutuissa ohjataan kuvasarjaan.
- Uusi luku "Tekstin lisäosat (+ -valikko)", jossa toistaiseksi Kuvasarja (raahaus, yhteinen kuvaus, kuvien muoto).
- Jakokuva: "ensimmäinen kuva tekstin seassa tai kuvasarjassa".
- Maininta: uudet lohkot toimivat vain uutisissa, tapahtumissa ja klubin toiminnassa, sivuilla askeleesta 6 alkaen.

**docs/05:** `rikasSisalto`, käyttöpaikat ja alt-käytäntö (yksittäisen kuvan alt on pakollinen, kuvasarjassa yhteinen kuvaus).

**Askel 2b (vain, jos päätös 6.1 on kyllä):**
- `uutinen.excerpt`: sääntö muotoon `rule.max(200).warning("Lyhenne näkyy listassa enintään noin 200 merkin pituisena.")`. Kuvaus: "Valinnainen. 1–2 virkettä uutislistalle. Jos jätät tyhjäksi, listalla näkyy tekstin alku."
- `uutisKortinPerus`: `"excerpt": coalesce(excerpt, tiivistelma)` ja `"ote": select(!defined(excerpt) && !defined(tiivistelma) => pt::text(body[_type == "block" && style == "normal" && !defined(listItem)][0...3]))`.
- `korttiOte` (välilyönnit yhdeksi, enintään 200 merkkiä sanarajalla ja perään "…") ja `korttiTeksti`.
- Kortit: `news-card.tsx`, `hero.tsx` ja `uutiset-block.tsx`. `UutinenCard.ote?`.
- Meta-kuvauksen viimeinen vara on `korttiOte(news.ote)`.
- Testit: `korttiOte` ja groq-js (f).

---

### Askel 3: Osioiden sivut ja Klubi-ryhmä (A: Y22, Y25, arkiston korttiteksti)

**Tavoite:** Isä muokkaa Studiossa kaikkien 30 koodireitin otsikon, johdannon (Tiivistelmä) ja hakukonetekstit sekä arkiston 16 kortin tekstin. Klubi-ryhmä vastaa sivuston rakennetta. Sivu ei koskaan hajoa: jos dokumentti puuttuu, käytetään koodin oletustekstiä.

**Tiedostot:**
- uudet:
  - `lib/osiosivut.ts`
  - `sanity/lib/osiosivu.ts`
  - `sanity/components/osiosivu/OsioSivunOhje.tsx`
  - `sanity/pohjat.ts`
  - `scripts/luo-osiosivut.ts`
  - `scripts/test-osiosivut.ts`
- `lib/path.ts`
- `sanity/schemas/documents/sivu.ts`, `sanity/schemas/documents/jalkapalloTilasto.ts` (vain kategorian "muu" kuvaus)
- `sanity/structure.ts`, `sanity.config.ts`, `sanity/actions/lukittu-sivu.tsx`
- `sanity/lib/queries/klubi.ts` (klubiSivuQuery: + `seoTitle`, `seoDescription`, `_updatedAt`)
- `app/sitemap.ts`
- `app/(public)/`:
  - `[...slug]/page.tsx` (vain `generateStaticParams`)
  - `uutiset/page.tsx`, `uutiset/arkisto/page.tsx`, `uutiset/tunnisteet/page.tsx`
  - `tapahtumat/page.tsx`, `galleria/page.tsx`, `ottelut/page.tsx`
  - `ravintolat/page.tsx`, `ravintolat/odottavat/page.tsx`
  - `klubi/page.tsx`, `klubi/toiminta/page.tsx`, `klubi/hallitus/page.tsx`, `klubi/yhteystiedot/page.tsx`, `klubi/palloveikkaus/page.tsx`, `klubi/_components/klubi-sivu.tsx`
  - `jalkapalloarkisto/page.tsx` ja arkiston 16 alasivun `page.tsx`
- `scripts/test-sivupolku.ts`, `package.json`
- `docs/09`, `docs/05`, `CLAUDE.md`

**Toteutus:**

1. **`lib/osiosivut.ts`.** Rajapinta on A:n suunnitelman mukainen, mutta `OsioSivunKentta` on `"hero" | "body" | "tilastot"` (R12) ja `StudionRyhma` on `"klubi" | "uutiset" | "ravintolat" | "jalkapalloarkisto"`:
   ```ts
   interface OsioSivu { slug; ryhma; nimi; kentat: readonly OsioSivunKentta[];
     oletus: { title: string; lead: string | null; description: string | null; seoTitle?: string; kortti?: string }; ohje?: string }
   ratkaiseOsioSivu(doc, o): { title, lead, description, seoTitle, korttiteksti, updatedAt, loytyi }
   ```
   `ratkaiseOsioSivu`-säännöt (`t(x)` on trimmattu arvo, ja tyhjä on null):
   - `title = t(title) ?? oletus.title`
   - `lead = t(tiivistelma) ?? t(ingress) ?? oletus.lead`
   - `description`: kun dokumentti on olemassa, `t(seoDescription) ?? lead ?? oletus.description`; kun dokumenttia ei ole, `oletus.description ?? oletus.lead`
   - `seoTitle = t(seoTitle) ?? oletus.seoTitle ?? title`
   - `korttiteksti = t(korttiteksti) ?? oletus.kortti ?? null`
   - `stegaClean`-kutsu tehdään `buildMetadata`-funktiossa, kuten nyt.

   `osioSivuSiemen` jättää pois avaimet, joiden arvo on undefined. `luokitteleOsioSivut` poistaa `drafts.`-etuliitteen ja tunnistaa ristiriidan kahdessa tapauksessa: rekisterin _id:llä on dokumentti väärällä polulla, tai rekisterin polulla on dokumentti väärällä _id:llä.

   **Rekisteri** (30 kpl, tekstit kopioidaan sanatarkasti sivutiedostoista ja vakiot poistetaan):

| slug | ryhmä | nimi Studiossa | kentat | oletus (title / lead / description) | ohje |
|---|---|---|---|---|---|
| klubi | klubi | Esittely | body, hero | "Klubi" / null / null | – |
| klubi/toiminta | klubi | Toiminta | body | "Toiminta" / null / null | "Toimintamuodot tulevat sivulle automaattisesti (Klubi → Toiminta → Toimintamuodot)." |
| klubi/hallitus | klubi | Hallitus | body | "Hallitus" / null / null | "Nykyiset hallituksen jäsenet tulevat sivulle automaattisesti (Klubi → Hallitus)." |
| klubi/palloveikkaus | klubi | Palloveikkaus | body, hero, tilastot | "Palloveikkaus" / null / null | "Veikkausten alasivut (osoite klubi/palloveikkaus/…) tulevat sivulle korteiksi." |
| klubi/yhteystiedot | klubi | Yhteystiedot | – | TITLE / null / DESCRIPTION (yhteystiedot/page.tsx:28-30) | "Osoite, sähköposti ja some muokataan kohdassa Klubi → Yhteystiedot → Osoite, sähköposti ja some." |
| uutiset | uutiset | Uutiset | – | "Uutiset" / LEAD :42 / null | "Uutislista tulee automaattisesti. Kun kävijä valitsee kategorian, sivun otsikko ja kuvaus tulevat kategoriasta (Uutiskategoriat)." |
| uutiset/arkisto | uutiset | Uutisarkisto | – | "Uutisarkisto" / LEAD :27 / null | "Vuodet tulevat sivulle automaattisesti." |
| uutiset/tunnisteet | uutiset | Uutisten tunnisteet | – | "Tunnisteet" / LEAD :24 / null, seoTitle "Uutisten tunnisteet" | "Tunnisteet tulevat sivulle automaattisesti uutisista." |
| tapahtumat | uutiset | Tapahtumat | – | "Tapahtumat" / LEAD :25 / null | "Tapahtumat tulevat sivulle automaattisesti. Kun yhtään tapahtumaa ei ole, osio on piilossa valikosta ja hakukoneilta." |
| galleria | uutiset | Galleria | – | galleria :19-21 / null | "Albumit tulevat sivulle automaattisesti. Kun yhtään albumia ei ole, osio on piilossa valikosta ja hakukoneilta." |
| ottelut | uutiset | Ottelut | – | "Ottelut" / LEAD :19 / null | "Ottelut tulevat sivulle automaattisesti. Seurat valitaan kohdassa Sivuston asetukset → Etusivu → Otteluohjelma-lohko." |
| ravintolat | ravintolat | Ravintola-arviot | – | TITLE :45 / **null** / metatietojen teksti :98-101 | "Jos jätät Tiivistelmän tyhjäksi, sivusto kirjoittaa johdannon itse ravintoloiden määrästä (esim. 'Klubi on arvioinut 573 ravintolaa vuodesta 1997 alkaen…'). Kirjoittamasi teksti korvaa sen." |
| ravintolat/odottavat | ravintolat | Odottavat toista arvioijaa | – | TITLE / LEAD (VAHIMMAISARVIOIJAT interpoloituna) / null | "Sivu ei näy hakukoneissa. Jos kahden klubilaisen sääntö muuttuu, päivitä myös tämä teksti." |
| jalkapalloarkisto | jalkapalloarkisto | Jalkapalloarkisto (etusivu) | – | "Jalkapalloarkisto" / lead :39 / description :36 | "Osioiden kortit tulevat sivulle automaattisesti. Kortin teksti muokataan kunkin osion omalla sivulla kentässä Teksti arkiston etusivun kortissa." |
| jalkapalloarkisto/* (16) | jalkapalloarkisto | sivun otsikko | – | kunkin page.tsx:n title / lead / description (arvokisat ja stadionit: description = null); **kortti** = nykyisen kortin body (jalkapalloarkisto/page.tsx:52-171) | "Taulukot tulevat sivulle automaattisesti (Jalkapalloarkisto → Tilastot)." |

   Litmanen ei ole osiosivu. Sen kortin teksti korjataan koodissa muotoon "Jari Litmasen ura, lehtileikkeet, patsas ja loukkaantumiset."

2. **`lib/path.ts`:** `KOODIIN_SIDOTUT_SIVUT = [...OSIOSIVUT.map(o => o.slug), TIETOSUOJA_SLUG]`. Klubin `FALLBACK_TITLE`-vakiot korvataan muodolla `osioSivu(SLUG)!.oletus.title`.

3. **`sivu.ts`** (apuri `slugOf(document)`):
   1. Uusi ensimmäinen kenttä **`osionOhje`**: string, otsikko "Tietoa sivusta", `readOnly`, group sisalto, `hidden: ({ document }) => !osioSivu(slugOf(document))`, `components.input: OsioSivunOhje`.
      - Komponentti piirtää `<Card tone="primary" padding={3} radius={2} border><Stack space={3}><Text size={1}>`.
      - Teksti: "Tämä on sivuston osion sivu osoitteessa /{slug}. Sivun lista tai taulukot tulevat automaattisesti. Tässä muokkaat otsikkoa, Tiivistelmää (näkyy otsikon alla johdantona) ja hakukonetekstejä (välilehti Hakukoneet ja jako). Sivua ei voi poistaa eikä sen osoitetta muuttaa." Perään tulee `o.ohje`.
   2. Osoitteen kuvaukseen lisätään: "Osioiden sivujen (esim. /uutiset), Klubin pääsivujen ja tietosuojaselosteen osoitteet on lukittu, koska sivusto hakee ne osoitteen perusteella."
   3. `kieli`: `hidden`, kun kyseessä on osiosivu.
   4. Tiivistelmä: `tiivistelmaField("sisalto", { title: "Tiivistelmä sivun alussa", description: …, validation })`. Validoinnissa ovat varoitus `max(300)` ja virhe "Tiivistelmä on tällä sivulla pakollinen: se näkyy otsikon alla johdantona ja hakukoneissa.", kun `johdantoPakollinen(o)` pätee ja kenttä on tyhjä.
   5. Uusi **`korttiteksti`** (text, 2 riviä) tiivistelmän jälkeen:
      - otsikko "Teksti arkiston etusivun kortissa"
      - kuvaus "Yksi lyhyt virke, joka näkyy Jalkapalloarkiston etusivulla tämän osion kortissa. Jos jätät tyhjäksi, käytetään sivuston oletustekstiä."
      - `max(140).warning("Suositus: alle 140 merkkiä, kortti on pieni.")`
      - `hidden`, kun `!osioSivu(slug)?.oletus.kortti && !value`
   6. Kentät hero, body ja tilastot: `hidden: ({ document, value }) => piilotaKentta(slugOf(document), "<kenttä>", value)`. Olemassa oleva data pysyy aina näkyvissä.
   7. Esikatselun alaotsikko: `Osion sivu · /${slug}`.
4. **`lukittu-sivu.tsx`:** `duplicate` estetään lukituilta sivuilta.
5. **Mallipohja** `lukittu-sivu` (tiedostossa `sanity/pohjat.ts`): parametri `slug`, arvo `osioSivuSiemen`-funktiosta (title, slug, tiivistelma, korttiteksti). Pohja on piilossa globaalista Luo-valikosta.
6. **Rakenne** (§2.6):
   - Apuri `lukittuSivu(S, slug, otsikko?)`: `S.listItem().id(osioSivuId(slug)).child(S.document().schemaType("sivu").documentId(osioSivuId(slug)).initialValueTemplate("lukittu-sivu", { slug }))`.
   - Sivut-listan suodatin `_type == "sivu" && !(slug.current in $lukitut) && !(defined(slug.current) && string::startsWith(slug.current, "klubi/palloveikkaus/"))` ja parametri `lukitut: [...OSIOSIVU_SLUGIT]`. Tietosuoja jää Sivut-listaan.
   - Klubi-ryhmä:
     - Esittely
     - Toiminta: "Toiminta-sivun otsikko ja johdanto" ja Toimintamuodot
     - Hallitus: "Hallitus-sivun otsikko ja johdanto", Nykyinen hallitus ja Entiset jäsenet
     - Palloveikkaus: "Palloveikkaus-sivu" ja "Veikkausten alasivut" (suodatin `string::startsWith(slug.current, $etuliite)`, järjestys `_createdAt asc`)
     - Yhteystiedot: "Osoite, sähköposti ja some" (singleton `yhteystiedot`) ja "Yhteystiedot-sivun otsikko ja johdanto"
   - "Osioiden sivut": lapsilistan otsikko "Osioiden sivut: otsikot ja johdannot".
   - "Sivun asetukset" nimetään uudelleen muotoon "Sivuston asetukset" (Etusivu, Navigaatio, Varmuuskopiot).
   - Kaikkiin kohtiin lisätään §2.6:n tunnisteet.
7. **Haku** `sanity/lib/osiosivu.ts`:
   ```ts
   osioSivuQuery = defineQuery(`*[_type == "sivu" && slug.current == $slug][0]{ _updatedAt, title, tiivistelma, ingress, korttiteksti, seoTitle, seoDescription }`)
   osioSivujenKortitQuery = defineQuery(`*[_type == "sivu" && slug.current in $slugit]{ "slug": slug.current, korttiteksti }`)
   haeOsioSivu(slug) // sanityFetch, tags ["sivu", `sivu:${slug}`], fallback null → ratkaiseOsioSivu
   ```
8. **Reitit:**
   - Yleinen malli: `const OSIO = "<slug>" as const`, async `generateMetadata` → `buildMetadata({ title: s.seoTitle, description: s.description, path, …nykyiset noIndex-ehdot })`, sivun runko `title={s.title} lead={s.lead}` ja JSON-LD `s.title`/`s.description`.
   - **ottelut, uutiset/arkisto, uutiset/tunnisteet:** `export const metadata` vaihdetaan muotoon `generateMetadata()` (lue ensin Next 16:n metadata-ohje).
   - **uutiset:** `titleFor(…, perus = s.title)`. Kategoria- ja hakulogiikka pysyvät ennallaan.
   - **ravintolat:** `lead = s.lead ?? buildLead(facets)`.
   - **ravintolat/odottavat, tapahtumat ja galleria:** noIndex-ehdot säilyvät.
   - **Arkiston 16 alasivua:** synkroninen `generateMetadata` muutetaan asynkroniseksi. `ArkistoPage` pysyy synkronisena, eikä välilehtiin kosketa.
   - **Klubin sivut:** `fetchKlubiSivu` säilyy, ja tekstit lasketaan `ratkaiseOsioSivu(sivu, osioSivu(SLUG)!)`-kutsulla. `KlubiSivuPage` saa propin `tekstit: OsioSivunTekstit`.
   - **klubi/yhteystiedot:** saa uuden valinnaisen johdannon.
   - **Arkiston etusivu:**
     - `haeOsioSivu("jalkapalloarkisto")` ja `osioSivujenKortitQuery` haetaan rinnakkain nykyisen yhteenvetokyselyn kanssa, tagi `sivu`.
     - Kortin slug johdetaan kortin hrefistä.
     - Kortin teksti valitaan järjestyksessä: dokumentin korttiteksti, sitten `oletus.kortti`, sitten koodin teksti (Litmanen).
   - **Catch-all:** `generateStaticParams` suodattaa tuloksen JavaScriptissä: `slugit.filter(s => !OSIOSIVU_SLUGIT.has(s))`. Kyselyä ei muuteta.
   - **Sitemap:** `sivuRows = sivut.filter(r => r.slug && !OSIOSIVU_SLUGIT.has(r.slug))`. Näin ravintolat/odottavat (noindex) ja koodireitit eivät tule sitemapiin kahteen kertaan.
9. **`jalkapalloTilasto`, kategorian "muu" kuvaus (Y27 askel 1, vain ohje):** "Muu tilasto saa oman sivun osoitteeseen /jalkapalloarkisto/tilastot/… Uusi pysyvä arkiston osio vaatii kehittäjän."
10. **`scripts/luo-osiosivut.ts`** (`npm run luo:osiosivut`, malli patch-uutiskategoriat.ts):
    - Liput `--vie` ja `--production`. Oletuksena development ja kuivaharjoitus.
    - `perspective: "raw"`.
    - Haku `*[_type == "sivu" && (slug.current in $slugit || _id in $idt || _id in $luonnosIdt)]{ _id, "slug": slug.current }`.
    - `luokitteleOsioSivut` → tuloste "Luotavia N / 30, jo olemassa M (…), ristiriitoja 0" ja jokaiselta luotavalta "polku · otsikko · johdannon 60 ensimmäistä merkkiä".
    - Ristiriita lopettaa ajon koodilla 1.
    - Productionissa ensin `npm run backup`. Jos se epäonnistuu, ajo lopetetaan.
    - Kirjoitus on yksi transaktio, jossa `createIfNotExists(osioSivuSiemen(o))` ja `commit({ visibility: "sync" })`.
    - Tarkistus: 30/30 julkaistua, ja otsikko ja tiivistelmä vastaavat siementä.
    - Ajo on idempotentti: toisella kerralla tuloste on "Ei luotavaa".

**Testit:**

`scripts/test-osiosivut.ts` (`npm run test:osiosivut`):
1. Rekisteri:
   - 30 kohtaa, polut ja _id:t uniikkeja
   - `osioSivuId("klubi/palloveikkaus") === "sivu-klubi-palloveikkaus"`
2. Lukitus:
   - jokainen polku on joukossa `KOODIIN_SIDOTUT_SIVUT` ja läpäisee `tarkistaSivunPolku`n
   - Klubin vakiot löytyvät rekisteristä
3. Jokaisella polulla on `app/(public)/<slug>/page.tsx`.
4. **Kattavuus:** jokainen staattinen `page.tsx` hakemistossa `app/(public)` on rekisterissä tai poikkeuslistalla. Poikkeukset ovat "", "uutiset/tunniste" ja neljä Litmanen-sivua.
5. **Ei näkyvää muutosta:** `ratkaiseOsioSivu(osioSivuSiemen(o), o)` on sama kuin `ratkaiseOsioSivu(null, o)` (pois lukien `loytyi` ja `updatedAt`).
6. `ratkaiseOsioSivu`:
   - null → oletukset
   - otsikkona pelkkiä välilyöntejä → oletus
   - Ingressi on Tiivistelmän varana
   - seoDescription voittaa leadin
   - ravintoloiden lead on null
   - tunnisteiden seoTitle on "Uutisten tunnisteet"
   - korttitekstin vara on oletus.kortti
7. `johdantoPakollinen` on false kuudelle sivulle (klubi ×5 ja ravintolat) ja true 24:lle.
8. Pituudet:
   - lead ≤ 300 ja kortti ≤ 140
   - odottavien johdannossa on `String(VAHIMMAISARVIOIJAT)`
9. `osioSivuSiemen`:
   - ei undefined-avaimia
   - korttiteksti vain arkiston 16 sivulla
   - slug muodossa `{ _type: "slug", current }`
10. `luokitteleOsioSivut`:
    - productionin 8 sivua → 28 luotavaa, 2 olemassa, 0 ristiriitaa
    - kaksi ristiriitatapausta havaitaan
    - `drafts.sivu-klubi` lasketaan olemassa olevaksi
11. `piilotaKentta`:
    - (uutiset, body, undefined) → true
    - (uutiset, body, […]) → false
    - (klubi, body, undefined) → false
    - (toriparkki, body, undefined) → false

`scripts/test-sivupolku.ts`: kaikki 31 lukittua kelpaavat, myös `ravintolat/odottavat` ja `uutiset/arkisto`. Muut nykyiset tapaukset ennallaan.

**Hyväksymiskriteerit:**
- Ilman dokumentteja (production-build, vain luku) jokainen listasivu näyttää täsmälleen nykyisen tekstin.
- Developmentissa ajetaan `npm run luo:osiosivut -- --vie` (28 dokumenttia). Sen jälkeen Studio avaa kaikki 30 kohtaa, ja muokattu otsikko näkyy sivulla minuutin kuluessa.
- **Varatekstin testi:** poista `sivu-galleria` developmentista, tarkista sivu ja aja skripti uudelleen.
- Build ei tuota catch-all-parametreja koodireiteille.
- `verify:content-routes` menee läpi.
- `test:saavutettavuus` sivuille /, /klubi, /klubi/hallitus, /jalkapalloarkisto, /uutiset ja /ravintolat.

**docs/09:**
- Studion valikko: Sivuston asetukset, Sivut (omat sivut), Klubi-ryhmä ja Osioiden sivut.
- Kaikki maininnat "Sivun asetukset → Yhteystiedot" muutetaan muotoon "Klubi → Yhteystiedot → Osoite, sähköposti ja some".
- Uusi luku **"Osioiden sivut: otsikko, johdanto ja hakukoneteksti"**:
  - neljä askelta: valitse sivu, muokkaa Otsikkoa ja Tiivistelmää, kirjoita hakutuloksen teksti välilehdellä Hakukoneet ja jako, Julkaise
  - Sivua ei voi poistaa eikä sen osoitetta muuttaa.
  - Välilehtien ja korttien otsikot ovat valikkonimiä ja pysyvät ennallaan.
  - Arkiston kortin teksti muokataan osion sivulla.
  - Ravintolasivun tyhjä Tiivistelmä tarkoittaa, että sivusto laskee johdannon itse.
- Hallitus ja Toiminta: johdanto muokataan Klubi-ryhmän kautta.
- Palloveikkauksen alasivut löytyvät kohdasta Klubi → Palloveikkaus → Veikkausten alasivut.
- "Mitä EI saa tehdä": osioiden sivut lisätään lukittuihin.
- "Täytä itse": Hallitus- ja Toiminta-sivun johdanto.

**docs/05:** osiosivun käsite, kentät `korttiteksti` ja `osionOhje`, pakollinen tiivistelmä ja `lukittu-sivu`-pohja. Singletonien hallinnan kuvaus korjataan vastaamaan structure.ts:ää.

---

### Askel 4: Linkkiobjekti, tekstieditorin linkki ja alatunniste valikosta (B1: Y17 2–3, Y23)

**Tavoite:** Jokainen linkki valitaan kolmesta vaihtoehdosta (Sivuston sivu, Muu osoite, Tiedosto), ja sivulinkki seuraa kohteen osoitteen muutosta. Alatunniste johdetaan päävalikosta. Studio varoittaa julkaisemattomasta tai ajastetusta kohteesta sekä tilanteesta, jossa sivulle olisi parempi valinta. Vanha data toimii sellaisenaan.

**Tiedostot:**
- uudet:
  - `lib/liite.ts`, `lib/navigaatio.ts`
  - `sanity/schemas/objects/linkki.ts`, `sanity/schemas/objects/liite.ts` (vain `liitetiedostoKentta`)
  - `sanity/lib/queries/linkki.ts`, `sanity/lib/navigaatio.ts`
  - `scripts/test-navigaatio.ts`
- `lib/linkki.ts`, `lib/path.ts`, `lib/types.ts`, `lib/defaults.ts` (kommentti), `lib/palautus.ts`
- `sanity/lib/linkin-kohde.ts`
- `sanity/schemas/index.ts`, `sanity/schemas/singletons/navigaatio.ts`, `sanity/schemas/singletons/etusivu.ts`, `sanity/schemas/documents/klubiToiminta.ts`, `sanity/schemas/objects/portableText.ts`
- `sanity/actions/palauta-varmuuskopiosta.tsx`
- `sanity/lib/queries.ts` (navigationQuery), `sanity/lib/queries/{etusivu, klubi, kuvat, ravintolat}.ts`
- `components/layout/{header, header-client, footer}.tsx`, `components/portable-text.tsx`
- `app/(public)/page.tsx`, `app/(public)/klubi/toiminta/[slug]/page.tsx`, `app/api/revalidate/route.ts`
- `scripts/test-linkki.ts`, `scripts/test-palautus.ts`, `package.json`, `sanity/sanity.types.ts`
- `docs/09`, `docs/05`, `CLAUDE.md`

**Toteutus:**
1. **`lib/path.ts`:**
   - Exportataan `TYPE_BASE`.
   - Uusi `polunKohteet(polku)`, documentRoute-funktion käänteinen. Se palauttaa [], kun polku ei ala yhdellä kauttaviivalla, sisältää `?` tai `#` tai on "/". Litmasen polku tuottaa `{ pelaaja, LITMANEN_SLUG }`. Jokainen `TYPE_BASE`-merkintä tuottaa `{ tyyppi, slug: x }`, kun polku on muotoa `base/x` ilman kauttaviivaa x:ssä. Lisäksi aina `{ sivu, polku ilman alun "/" }`.
2. **`lib/liite.ts`** (R5):
   - `tiedostonOsoite`: PDF sellaisenaan, muihin `?dl=<encodeURIComponent(alkuperäinen nimi)>`.
   - `liitteenTiedot({ extension, size })`: "PDF, 240 kt", "Excel, 2,4 Mt" tai "Word".
   - `tarkistaLiitetiedosto` palauttaa tekstin "Sallitut tiedostot: PDF, Word (.docx) ja Excel (.xlsx). Tallenna tiedosto ensin johonkin näistä muodoista."
   - `liitetiedostoKentta()` (`sanity/schemas/objects/liite.ts`):
     - `type: "file"`, `options: { accept: LIITTEEN_ACCEPT, storeOriginalFilename: true }`
     - kuvaus: "PDF, Word (.docx) tai Excel (.xlsx). Tiedosto on julkinen: kuka tahansa, jolla on linkki, voi avata sen. Älä liitä jäsenluetteloita, pöytäkirjoja, joissa on henkilötietoja, tai muuta luottamuksellista."
     - validointi: päätteen virhe ja asynkroninen kokovaroitus (yli 15 Mt): "Tiedosto on iso (x Mt). Pienennä PDF (esim. Wordissa Tallenna nimellä → PDF → Pienin koko)."
     - `pakollinen` (virhe "Lisää tiedosto.") vain, kun kenttä on aktiivinen
3. **`lib/linkki.ts`:** rajapinta §2.1 ja §2.2. `kohteenTilaViesti(tila, nyt)`:
   - julkaistu → null
   - vain luonnos → varoitus "“{nimi}” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen."
   - kohdetta ei ole → virhe "Valittua sivua ei enää ole. Valitse toinen sivu."
   - uutisen julkaisuaika on tulevaisuudessa → varoitus "Uutinen tulee näkyviin {d.M.yyyy} klo {H.mm}. Linkki näkyy sivustolla siitä alkaen."

   `linkinKuvaus` tuottaa Studion alaotsikon: "→ /klubi", "→ https://…", "Tiedosto: saannot.pdf" tai "Valitse, mihin linkki vie".
4. **Skeema `linkki`** (§2.2). Kuvaukset:
   - `tyyppi`: "Sivuston sivu pysyy kunnossa, vaikka sivun osoite muuttuisi. Muu osoite on toinen sivusto, sähköposti tai puhelinnumero."
   - `kohde`: "Kirjoita sivun, uutisen, ravintolan tai muun sisällön nimen alkua ja valitse listasta."
   - `href`: "Toinen sivusto (https://…), sähköposti (mailto:nimi@esimerkki.fi) tai puhelin (tel:+358…). Sivuston omalle sivulle valitse Sivuston sivu. Osoite /… vain silloin, kun sivua ei löydy listasta (esim. /uutiset/arkisto/2016)."

   Validointi palauttaa `true`, kun kenttä ei ole aktiivinen. Poikkeus on `kohde`: jos kentällä on arvo mutta tyyppi on muu kuin sivu, se varoittaa "Tätä valintaa ei käytetä, koska linkki vie nyt muualle. Tyhjennä se (kolme pistettä → Tyhjennä), muuten valittua sivua ei voi poistaa."

   Muut validoinnit:
   - `kohde`: kun tyyppi on sivu ja kenttä on pakollinen, virhe "Valitse sivu, johon linkki vie."; asynkroninen `kohteenTila`.
   - `href`: kun kenttä on pakollinen, virhe "Kirjoita osoite, esim. https://www.palloliitto.fi."; `tarkistaLinkki`; nykyinen HEAD-varoitus; uusi `sivullaOnValinta`-varoitus "Tälle sivulle on parempi valinta: vaihda kohdaksi Sivuston sivu ja valitse “{nimi}”. Linkki pysyy silloin kunnossa, vaikka sivun osoite muuttuisi."

   Studion kyselyt ovat 60 sekuntia välimuistissa (tiedosto `sanity/lib/linkin-kohde.ts`). `initialValue: "sivu"` asetetaan vain, kun linkki on pakollinen. Nimetty tyyppi `linkki` on valinnainen, ja `vaadiLinkki` antaa virheen "Valitse, mihin linkki vie.".
5. **Käyttöpaikat:**
   - **navigaatio:** kohdat `{ label, ...linkkiKentat({ pakollinen: true }), highlight, children[{ label, ...linkkiKentat({ pakollinen: true }) }] }`.
     - `items`-kuvaus: "Järjestä raahaamalla. Enintään 7 päälinkkiä. Sama valikko näkyy sivun alareunassa (alatunniste): kohdat, joilla on alavalikko, omina sarakkeinaan ja muut sarakkeessa Sivusto. Tyhjät osiot (esim. Tapahtumat ilman tapahtumia) piiloutuvat itsestään."
     - `children`: "Näkyy valikossa avautuvana listana ja alatunnisteessa omana sarakkeenaan."
   - **etusivu:**
     - Pikalinkit: `{ label, ...linkkiKentat({ pakollinen: true }), primary }`.
     - Esittely-lohkoon `ctaLinkki: linkki` (otsikko "Linkin kohde"), varoituksena "Lisää linkin kohde tai poista linkin teksti.".
     - Jalkapalloarkisto-lohkoon `ctaLinkki` (otsikko "Napin kohde", kuvaus "Jätä tyhjäksi, niin nappi vie jalkapalloarkiston etusivulle.").
     - Vanha `ctaHref`: `deprecated`, `readOnly`, `hidden`.
     - Askeleen 1 `piilota`-kenttä säilyy kaikissa lohkoissa.
   - **klubiToiminta.vuodet[].linkki:** `{ teksti, ...linkkiKentat({ pakollinen: false }) }` ilman oletusarvoa. Vanha `url` on `deprecated`, `readOnly` ja `hidden`. Teksti-kentän varoitus "Linkin teksti on kirjoitettu, mutta kohde puuttuu.".
   - **portableText.ts:** `export const tekstinLinkki = { name: "link", type: "object", title: "Linkki", icon: LinkIcon, fields: [...linkkiKentat({ pakollinen: true }), newTab] }`.
     - `newTab` näkyy vain osoitteelle ja tiedostolle.
     - `href` muuttuu tyypistä url tyypiksi string, data on sama.
     - Sama annotaatio tulee `tekstiLohko`on, joten se on käytössä molemmissa tekstityypeissä.
6. **GROQ:**
   - `navigationQuery`: `*[_type == "navigaatio"][0]{ items[]{ label, highlight, ${linkkiProjektio}, children[]{ label, ${linkkiProjektio} } } }`.
   - etusivu: `heroCtas[]{ label, primary, ${linkkiProjektio} }`, `ctaLinkki{ ${linkkiProjektio} }` ja `ctaHref` (kaksoisluku).
   - klubin toiminta: `linkki{ teksti, url, ${linkkiProjektio} }`.
   - `runko` laajenee: `_type == "block" => { "markDefs": markDefs[]{ ..., _type == "link" => { "kohde": kohde->${kohdeProjektio}, "tiedosto": tiedosto.asset->{ url, originalFilename, extension, size } } } }`.
   - `ravintolat.ts:416`: `review` muutetaan muotoon `review[]{${runko}}`.
   - Toteuttaja tarkistaa komennolla `grep -rn "PortableText value="`, että jokainen tekstikenttä kulkee `runko`-fragmentin kautta.
7. **`lib/navigaatio.ts`:**
   - `ratkaiseNavigaatio`:
     - alalinkit ratkaistaan `ratkaiseLinkit`-funktiolla
     - pääkohta, jolla ei ole hrefiä mutta on alalinkkejä, saa ensimmäisen alalinkin hrefin
     - pääkohta, jolla ei ole hrefiä eikä alalinkkejä, pudotetaan
     - tyhjä alavalikko → `undefined`
   - `alatunnisteenSarakkeet` (kutsutaan `piilotaTyhjat`-kutsun **jälkeen**):
     - alavalikottomat kohdat sarakkeeseen "Sivusto", ensimmäisenä
     - jokainen alavalikollinen kohta omana sarakkeenaan
     - jos `!onYleissivuAlavalikossa(item)`, ensimmäiseksi linkiksi "Yleisesittely"
   - `onYleissivuAlavalikossa` siirretään tiedostosta header-client.tsx.
8. **`sanity/lib/navigaatio.ts`:** `haeNavigaatio = cache(async () => …)`:
   - `sanityFetch` (tagit `["navigaatio", "linkit"]`, varana `defaultNavigation`) ja `haeTyhjatOsiot()`
   - sitten `ratkaiseNavigaatio`, hrefeille `stegaClean` ja lopuksi `piilotaTyhjat`
   - Header ja Footer kutsuvat tätä.
9. **Footer:**
   - `linkColumns` poistetaan, ja tilalle tulee `alatunnisteenSarakkeet(await haeNavigaatio())`.
   - **Yksi** `<nav aria-label="Alatunnisteen valikko" className="contents">`. Jokainen sarake on `div`, jossa `h2` (nykyinen tyyli) ja `ul`.
   - Ruudukko `lg:grid-cols-[minmax(0,1.6fr)_repeat(var(--sarakkeet),minmax(0,1fr))]`, jossa `--sarakkeet` = sarakkeiden määrä + 1.
   - Yhteystiedot-sarake ja alarivi (Tietosuojaseloste, Ylläpito) pysyvät ennallaan.
   - Productionin datalla tulos on Sivusto (Ottelut, Ravintola-arviot, Uutiset), Jalkapallo (6), Klubi (5) ja Yhteystiedot.
10. **Renderöinti:**
    - `portable-text.tsx` `marks.link`: `href = stegaClean(linkinOsoite(value))`. Jos href on null, palautetaan `<>{children}</>`. Tiedostolinkin perään tulee `<span className="text-sm text-muted"> ({liitteenTiedot(…)})</span>`.
    - Etusivun sivukomponentti: `heroCtas = ratkaiseLinkit(data.heroCtas)` ja lohkoille `ctaHref: block.ctaLinkki ? linkinOsoite(block.ctaLinkki) ?? undefined : block.ctaHref`. Tagit muotoon `["etusivu", "linkit"]`.
    - Klubin toiminnan sivu: `linkinOsoite({ ...l, href: l?.href ?? l?.url })`. Sisäinen osoite renderöidään `<Link>`-komponentilla, ulkoinen `<a>`-elementillä. Linkin teksti on `teksti || kohde?.nimi || href`. Tagiksi lisätään `"linkit"`.
11. **Webhook:** `Object.fromEntries(LINKIN_KOHDETYYPIT.map(t => [t, ["linkit"]]))` yhdistetään `RIIPPUVAT`-taulukkoon. Päällekkäiset avaimet yhdistetään.
12. **Palautus:** `heikennaPuuttuvatViittaukset(doc, olemassa)` lisää kaikkiin `{ _ref }`-viittauksiin, joiden kohdetta ei ole, merkinnän `_weak: true`. `palauta-varmuuskopiosta.tsx` hakee ensin `*[_id in $refit]._id`.

**Testit:**

`scripts/test-linkki.ts`, laajennus:
- `linkinTyyppi`: kaikki muodot.
- `linkinOsoite`:
  - uutinen, sivu klubi, sivu klubi/palloveikkaus, Litmanen, toimintamuoto ja arvokisa
  - piilossa oleva kohde, kohde ilman slugia ja tyyppi ilman reittiä → null
  - tyypin sivu vanhaa hrefiä ei käytetä
  - osoite: "/ottelut", https ja mailto kelpaavat; "www.x.fi" ja "uutiset" → null
  - tiedosto: PDF ja `docx?dl=`
- `liitteenTiedot` ja `tiedostonKoko`.
- `ratkaiseLinkit`.
- Jokaisella `LINKIN_KOHDETYYPIT`-tyypillä on `documentRoute`.
- `polunKohteet`:
  - kierros `documentHref` → `polunKohteet`
  - "/klubi/historia"
  - Litmanen
  - "/uutiset?sivu=2", "/a#b", "https://x", "/" ja "//x" → []
- `kohteenTilaViesti`: 5 tapausta.
- `linkinKuvaus`.

`scripts/test-navigaatio.ts` (uusi, `npm run test:navigaatio`):
1. Productionin 16 kohdan fixture sekamuodossa → täsmälleen nykyiset hrefit.
2. Puuttuvien kohteiden säännöt.
3. Vanha muoto ja `defaultNavigation`.
4. `onYleissivuAlavalikossa`.
5. `alatunnisteenSarakkeet` productionin datalla.
6. Yleisesittely-sääntö.
7. Ei alavalikottomia kohtia tai tyhjä valikko.
8. `piilotaTyhjat` ja sen jälkeen sarakkeet.

`scripts/test-palautus.ts`: `heikennaPuuttuvatViittaukset` (puuttuva viittaus heikennetään, olemassa olevaa ei; sisäkkäiset rakenteet ja markDefs).

**Hyväksymiskriteerit:**
- Production-build (vain luku, vanha data) näyttää valikon, etusivun ja klubin toiminnan ennallaan. Alatunniste noudattaa valikkoa.
- Developmentin Studio:
  - uusi valikkokohta → Sivuston sivu → "Matkailu" → alaotsikko "→ /klubi/toiminta/matkailu"
  - Muu osoite "/klubi" → varoitus "parempi valinta"
  - julkaisematon kohde → varoitus
  - kun uutista, johon Matkailu viittaa, yritetään poistaa, avautuu suomenkielinen ikkuna, jossa viittaaja on listattu
  - tyypin vaihto ei jätä piilotettuja virheitä
- `test:saavutettavuus`: alatunnisteessa on yksi nav-landmark, ja otsikkojärjestys on kunnossa. Tarkistus myös 320 px leveydellä.

**docs/09:**
- Uusi alaluku **"Linkit"**: "Mihin linkki vie?", kolme vaihtoehtoa, tiedoston julkisuus ja keltaiset varoitukset.
- "Valikon muokkaaminen" kirjoitetaan uudelleen, ja **alatunnisteen** kappale lisätään.
- Etusivu: pikalinkit ja "Linkin kohde".
- Klubin toiminta: vuoden linkki.
- Uutisen linkki: maalaa → ketjukuvake → "Mihin linkki vie?".
- Tyypilliset tilanteet:
  - "En voi poistaa sivua tai uutista, tai sen julkaisua ei voi perua": ikkunan teksti suomeksi ja toimintaohje "Avaa listassa näkyvä dokumentti napsauttamalla, vaihda tai poista linkki ja paina Julkaise. Poista sen jälkeen. Älä paina Poista joka tapauksessa, koska se ei onnistu."
  - "Linkki katosi valikosta tai tekstistä."
  - "Linkki ei toimi" päivitetään.

**docs/05:** `linkki` ja navigaation kentät.

---

### Askel 5: Linkkien migraatioskripti (B2)

**Tavoite:** Merkkijonolinkit muutetaan viittauksiksi dokumenttikohtaisilla patcheilla. Vanhat arvot jätetään paikalleen, jotta Vercelin Instant Rollback on turvallinen.

**Tiedostot:** uudet `scripts/lib/linkit-migraatio.ts`, `scripts/patch-linkit.ts` ja `scripts/test-linkit-migraatio.ts`; `package.json` (`patch:linkit`, `test:linkit-migraatio`), `CLAUDE.md`, `docs/23 §0`.

**Toteutus** (malli patch-uutiskategoriat.ts):
- Liput `--vie`, `--production` ja `--poista-vanhat`. `perspective: "raw"`, ja productionissa ensin `npm run backup`.
- `muunnaLinkki(vanha, hakemisto)`:
  - sisäinen polku ilman `?`/`#`, jolle löytyy julkaistu dokumentti → `{ tyyppi: "sivu", kohde: { _type: "reference", _ref } }`
  - muuten `{ tyyppi: "osoite" }` (klubin toiminnassa lisäksi `href: url`)
  - jo muunnettu → null
- `tekstinLinkkienMuutokset(doc, hakemisto)` palauttaa polut muodossa `body[_key=="…"].markDefs[_key=="…"]`. Vain sisäiset dokumenttipolut, myös sisäkkäiset kentät.
- Hakemisto: `*[_type in $tyypit && defined(slug.current) && !(_id in path("drafts.**"))]{ _id, _type, "slug": slug.current }` → avain `documentHref`.
- Isännät (myös luonnokset): navigaatio, etusivu, klubin toimintamuodot, joilla on linkki, sekä tekstieditorin dokumentit.
- Muutokset:
  - navigaatiosta ja `heroCtas`-kohdista rakennetaan koko taulukko uudelleen, ja `href` säilyy
  - `set` kentille `blocks[_key==…].ctaLinkki`, `vuodet[_key==…].linkki.*` ja markDefs, ja `href`, `url` ja `ctaHref` säilyvät
  - jokaisessa patchissa `ifRevisionId`, yksi transaktio per dokumentti
- **Invariantti ennen kirjoitusta:** jokaiselle muunnetulle arvolle `documentHref(kohde) === vanha href`. Jos ehto ei täyty, skripti pysähtyy kirjoittamatta mitään.
- Tuloste on taulukko, ja kuivaharjoituksessa sama kirjoitetaan tiedostoon `data/linkit-migraatio.tsv`.
- Kirjoituksen jälkeen haetaan uudelleen sivuston kyselyillä, ja `linkinOsoite` verrataan alkuperäiseen. Jos ne eroavat, lopetuskoodi on 1 ja tuloste "Aja uudelleen tai palauta varmuuskopiosta".
- `--poista-vanhat` poistaa:
  - `href`, kun tyyppi on sivu tai tiedosto
  - `url`, kun `defined(linkki.tyyppi)`
  - `ctaHref`, kun `defined(ctaLinkki)`
- Skripti on idempotentti.

**Testit** (`test-linkit-migraatio.ts`):
- `muunnaLinkki`:
  - "/klubi" → sivu-klubi
  - "/ottelut" ilman dokumenttia → osoite; kun `sivu-ottelut` on olemassa → viittaus
  - "#"-linkki → osoite
  - YouTube-url
  - jo muunnettu → null
- `tekstinLinkkienMuutokset`: fixture, jossa on sisäinen, ulkoinen ja sisäkkäinen linkki.

**Hyväksymiskriteerit:**
- Developmentissa `npm run patch:linkit` ja sitten `-- --vie`. Valikko, alatunniste, etusivu, /klubi, /klubi/toiminta/matkailu ja uutinen 2008-06-01-voittajaveikkaus-em-2008 näyttävät saman kuin ennen.
- Studion lomakkeissa näkyy "Sivuston sivu" ja kohde.

**docs/09:** ei muutoksia (askel 4 kattaa). Lisätään docs/23 §0:n "Toteutettu" ja luvut.

---

### Askel 6: Tekstilohkot (C2: Y14, Y15)

**Tavoite:** Uutiseen, sivuun, tapahtumaan ja klubin toimintaan voi lisätä liitteen, huomiolaatikon, painikkeen, pienen taulukon (Excelistä liittäen) sekä kartan, lomakkeen tai Vimeo-videon, joka ladataan vasta painalluksesta. Sivun `body` muuttuu tyyppiin `rikasSisalto`.

**Tiedostot:**
- uudet:
  - `lib/upotus.ts`
  - `sanity/schemas/objects/{huomio, painike, taulukko, taulukkoKentat, upotus}.ts`
  - `components/{liite-kortti, huomiolaatikko, upotus}.tsx`
  - `scripts/test-upotus.ts`
- `lib/sisaltolohkot.ts`
- `sanity/schemas/objects/{rikasSisalto, liite}.ts`
- `sanity/schemas/documents/{sivu, jalkapalloTilasto}.ts`
- `sanity/schemas/index.ts`
- `sanity/components/taulukkoeditori/{TaulukkoEditori.tsx, konteksti.tsx}`
- `sanity/lib/queries/kuvat.ts`
- `components/portable-text.tsx`
- `scripts/test-lohkot.ts`, `package.json`
- `docs/09`, `docs/05`, `docs/19`, `CLAUDE.md`

**Toteutus:**
1. **`RIKKAAT_LOHKOT`** lopulliseen järjestykseen (§2.3). `rikasSisalto` saa `options.insertMenu`:
   ```ts
   { filter: false, views: [{ name: "list" }], groups: [
     { name: "kuvat", title: "Kuvat ja video", of: ["imageWithAlt", "kuvasarja", "youtubeVideo", "upotus"] },
     { name: "tiedotteet", title: "Tiedotteet ja tiedostot", of: ["huomio", "painike", "liite"] },
     { name: "taulukot", title: "Taulukot", of: ["taulukko", "kokoonpano"] } ] }
   ```
   Jos tekstieditorin työkalupalkki ei näytä ryhmiä (alpha-rajapinta), järjestys ja ikonit riittävät. Tulos kirjataan docs/05:een.
2. **`sivu.body`** muutetaan tyypiksi `"rikasSisalto"`. Askeleen 3 `hidden: piilotaKentta(…, "body", …)` säilyy.
3. **`liite`** (DocumentPdfIcon, otsikko "Liite (PDF, Word, Excel)"):
   - `otsikko`: "Linkin teksti", kuvaus 'Mikä tiedosto on, esim. "Vuosikokouskutsu 2027" tai "Klubin säännöt". Sivulla näkyy myös tiedoston tyyppi ja koko.', virhe 3–100 merkkiä "Kirjoita liitteelle nimi (3–100 merkkiä)."
   - `tiedosto`: `liitetiedostoKentta()`, pakollinen ("Valitse tiedosto.")
   - Esikatselu: `Liite · ${liitteenTiedot(…)}`.
4. **`huomio`** (InfoOutlineIcon, otsikko "Huomiolaatikko"):
   - `savy` (radio): "Tiedote (sininen)" = `tieto` ja "Tärkeä (keltainen)" = `tarkea`, oletus tieto. Kuvaus "Tiedote tavalliseen ilmoitukseen. Tärkeä vain, kun lukijan pitää toimia (määräaika, muutos, peruutus)."
   - `otsikko` "Otsikko (valinnainen)", enintään 80 merkkiä.
   - `teksti` (text, 4 riviä): kuvaus "Lyhyt ja selkeä, muutama rivi. Rivinvaihdot säilyvät. Linkin tai ilmoittautumisen saat lisäämällä laatikon alle Painikkeen." Virheet "Kirjoita laatikkoon teksti." ja "Enintään 600 merkkiä.", varoitus 400 merkistä "Lyhyt teksti erottuu parhaiten."
5. **`painike`** (ArrowRightIcon):
   - `teksti` "Painikkeen teksti", kuvaus 'Lyhyt toiminto, esim. "Ilmoittaudu" tai "Lue säännöt".', virhe "Kirjoita painikkeelle teksti." ja varoitus 40 merkistä "Lyhyt teksti mahtuu puhelimessa yhdelle riville."
   - `linkki` (tyyppi `linkki`, otsikko "Mihin painike vie"), validointi `vaadiLinkki`.
6. **`taulukko`** (ThListIcon):
   - `components.input: TaulukkoKontekstiInput` (uusi nimi tyypille `TilastoDokumenttiInput`) ja `options.modal: { type: "dialog", width: "auto" }`. Jos dialogi on liian kapea, `width: 3`.
   - `otsikko` "Taulukon otsikko", kuvaus 'Näkyy taulukon yläpuolella ja kertoo ruudunlukijalle, mistä taulukossa on kyse, esim. "Mölkkyturnauksen tulokset 2026".', pakollinen ("Kirjoita taulukolle otsikko.").
   - `sarakkeetKentta()` ja `rivitKentta({ description: "Kirjoita kuten Excelissä, tai kopioi alue Excelistä ja liitä soluun (Ctrl+V). Sarakkeen nimi ja tyyppi muutetaan otsikon ⋮-valikosta.", validation: min(1) "Lisää taulukkoon vähintään yksi rivi." })` tiedostosta `taulukkoKentat.ts`.
   - `jalkapalloTilasto` käyttää samoja kenttiä parametrilla `{ group: "data" }`, ja tallennusmuoto pysyy samana.
   - `TaulukkoEditori.tsx:84`: `useFormValue([...props.path.slice(0, -1), "columns"])`.
7. **`upotus`** (PinIcon, otsikko "Kartta, lomake tai Vimeo-video"):
   - `osoite` (text, 3 riviä) "Upotuskoodi tai osoite": kuvaus "Google Maps: Jaa → Upota kartta → Kopioi HTML. Google Forms: Lähetä → <> → Kopioi. Vimeo: videon osoite. Liitä koko koodi tähän. Sivulla näkyy ensin painike, ja palvelu ladataan vasta, kun lukija painaa sitä."; validointi `required` ("Liitä upotuskoodi tai osoite.") ja `upotuksenVirhe`.
   - `otsikko` "Mitä upotuksessa on", pakollinen ("Kirjoita upotukselle otsikko."), ruudunlukijan teksti.
   - `kuvateksti` (valinnainen).
8. **`lib/upotus.ts`**, säännöt:
   - Maps: `/maps/embed` sellaisenaan, suhde 4/3. `maps?…&output=embed` → `avaaOsoite` ilman `output`-parametria.
   - Mapsin jakolinkit → virhe "Tämä on Google Mapsin jakolinkki, jota ei voi upottaa. Avaa kartta, valitse Jaa → Upota kartta → Kopioi HTML ja liitä koko koodi tähän."
   - Forms `/forms/d/e/<id>/viewform` → `?embedded=true`, korkeus iframesta tai 900 (rajat 400–3000).
     - `/edit` → "Tämä on lomakkeen muokkausosoite. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi ja liitä koodi tähän."
     - `forms.gle` → "Lyhytlinkkiä ei voi upottaa. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi."
   - Vimeo → `player.vimeo.com/video/<id>?dnt=1[&h=…]`, suhde 16/9.
   - YouTube → "YouTube-videolle on oma lohko: valitse + -valikosta YouTube-video."
   - `http:` muutetaan `https:`ksi. `javascript:` ja `data:` → null.
   - Muut → "Tätä palvelua ei voi upottaa. Sallitut: Google Maps -kartta, Google Forms -lomake ja Vimeo-video. Muulle sivulle voit lisätä tekstiin linkin tai painikkeen."
   - `UPOTUSPALVELUT`: tekstit nayta, avaa ja latausteksti (C:n suunnitelman mukaan, esim. "Kartta ladataan Google Mapsista. Google voi tallentaa evästeitä laitteellesi.").
9. **GROQ `runko`:** lisätään `_type == "liite" => { "liitetiedosto": tiedosto.asset->{ url, originalFilename, extension, size } }` ja `_type == "painike" => { "linkki": linkki{ ${linkkiProjektio} } }`.
10. **Renderöijät** (`satisfies Record<RikasLohko, …>`):
    - **LiiteKortti:**
      - linkki `tiedostonOsoite`-funktiolla, ilman `target`- ja `download`-attribuuttia
      - koko teksti linkin sisällä (WCAG 2.4.4), `min-h-11`
      - lucide `FileText` (aria-hidden) ja muoto "otsikko (PDF, 240 kt)"
    - **Huomiolaatikko:**
      - `savy = huomionSavy(stegaClean(savy))`
      - `<div role="note" aria-label={otsikko || nimi}>`, jossa `border-l-4` ja tausta: brass ja brass-tint (Tärkeä) tai navy ja blue-tint (Tiedote)
      - ikoni `Info` tai `TriangleAlert`, joten merkitys ei ole pelkässä värissä
      - otsikko on `<p className="font-semibold">`, ei h-tagia
      - kontrastit yli 12:1 (teksti) ja yli 7:1 (ikoni)
    - **Painike:** `const href = linkinOsoite(value.linkki)` → `<p className="mt-6"><LinkButton href={stegaClean(href)} size="lg">`. Ilman hrefiä tai tekstiä palautetaan null.
    - **Taulukko:** `StatTable` (`caption` = otsikko, `captionVisible`), vain kun sarakkeita on.
    - **Upotus** ("use client", YouTube-lohkon malli):
      - `tulkitseUpotus(stegaClean(osoite))`
      - säiliö varaa tilan valmiiksi
      - ennen latausta kortti, jossa otsikko, latausteksti, `<button aria-describedby>` ja "Avaa palvelussa" -linkki (toimii ilman JavaScriptiä)
      - latauksen jälkeen `<iframe title={otsikko} loading="lazy" referrerPolicy …>`, ja fokus siirtyy iframeen
      - CSP sallii iframet (`next.config.ts:40`)

**Testit:**
- `scripts/test-upotus.ts` (`npm run test:upotus`): kaikki C:n tapaukset, mukaan lukien `https://www.google.com.evil.example/maps/embed` → null, ja korkeuden raja 3000.
- `test-lohkot.ts`, laajennus:
  - `huomionSavy`
  - `tarkistaLiitetiedosto` (pdf, docx ja xlsx kelpaavat, exe tuottaa virheen, undefined → true)
  - lukuaika ei muutu huomio- ja taulukkolohkojen kanssa
  - groq-js: `runko` tuottaa liitteelle kentät `liitetiedosto.extension` ja `size`, ja painikkeen linkki puretaan

**Hyväksymiskriteerit:**
- Lukutarkistus P6 = 0.
- Developmentin Studio:
  - Kaikki 9 lohkoa toimivat uutisessa ja sivulla.
  - Excel-alue liitetään taulukkoon dialogissa.
  - jalkapalloTilaston editori toimii kuten ennen.
  - Tiedostot: pdf, docx ja exe (virhe) sekä yli 15 Mt:n PDF (varoitus).
  - Upotukset: Maps, Forms, Vimeo, YouTube ja vieras palvelu, kaikki virheet suomeksi.
- Developmentin testisivu `lohkotesti`, jossa ovat kaikki lohkot: `SIVUT="/lohkotesti,/uutiset" npm run test:saavutettavuus`. Lisäksi näppäimistöllä painike → iframe-fokus. Testisivu poistetaan lopuksi.
- Esikatselussa (stega) sävy ja upotus toimivat.

**docs/09:**
- Luku "Tekstin lisäosat (+ -valikko)", taulukko lohko | milloin | miten | huomioita.
  - **Liite:** julkinen, ei henkilötietoja, PDF Wordista, ei skannattuja kuvia. Väärän tiedoston poisto: poista lohko, julkaise ja poista tiedosto tiedostovalitsimesta. Tarkka polku varmistetaan toteutuksessa, ja jos poisto ei onnistu, ohje on "pyydä kehittäjää".
  - **Huomiolaatikko:** sävyt ja milloin Tärkeä.
  - **Painike.**
  - **Taulukko** ja ero Sivu → Taulukot -kenttään.
  - **Kartta, lomake tai Vimeo:** tarkat napsautuspolut.
- Tyypilliset tilanteet: "Upotus ei kelpaa".
- Taulukon muokkaaminen: sama editori on myös tekstin Taulukko-lohkossa.
- "Täytä itse": tietosuojaselosteeseen kappale ulkoisista upotuksista.

**docs/05:**
- Lohkot kenttineen ja upotusten sallittu lista.
- Taulukko on tekstiin upotettu eikä viittaus (poikkeus docs/23 Y15:n kohdasta 3). Perustelu: oma sisältö upotetaan, uudelleenkäytettävä tilasto viitataan Taulukot-kentällä.

**docs/19:** editori toimii myös tekstin Taulukko-lohkossa, ja syöte on `TaulukkoKontekstiInput`.

---

### Askel 7: Sivuston tila ja Aloitus (E2: Y33, karsittu)

**Tavoite:** Studio avautuu Aloitukseen. Siinä on liikennevalot (varmuuskopio, yöllinen huolto, otteluohjelman haku, julkaisemattomat muutokset ja dokumenttikiintiö), odottavien tehtävien laskurit ja puuttuvat perustiedot. Lisäksi ohje UptimeRobotista. Sähköpostia Studiosta ei lähetetä (päätös 7.10.).

**Tiedostot:**
- uudet:
  - `sanity/schemas/documents/sivustonTila.ts`
  - `lib/sivuston-tila.ts`
  - `sanity/lib/kirjaa-ajo.ts`, `sanity/lib/tehtavat.ts`
  - `sanity/plugins/aloitus.tsx`
  - `sanity/components/aloitus/{Aloitus, SivustonTila, Odottaa, Puuttuvat}.tsx`, `useSivustonTila.ts`
  - `scripts/test-sivuston-tila.ts`, `scripts/test-aloitus.ts`
- `sanity/schemas/index.ts`, `sanity.config.ts`, `sanity/pohjat.ts`, `sanity/structure.ts`
- `app/api/huolto/route.ts`, `app/api/varmuuskopio/route.ts`, `app/api/revalidate/route.ts`
- `lib/ottelut.ts`, `lib/varmuuskopio.ts`, `lib/palautus.ts`
- `scripts/test-varmuuskopio.ts`, `scripts/test-palautus.ts`, `package.json`
- `docs/09`, `docs/17`, `docs/05`, `CLAUDE.md`

**Toteutus:**
1. **`sivustonTila`** (R18):
   - ActivityIcon, `readOnly`. Kentät `tehtava` (huolto tai varmuuskopio), `aika`, `onnistui`, `viimeisinOnnistunut` ja `tulokset[]{ nimi, tila: ok|huomio|virhe, viesti, maara }`.
   - Tunnukset `TILA_ID = { huolto: "sivustonTila.huolto", varmuuskopio: "sivustonTila.varmuuskopio" }`.
   - Ei rakenteessa, ei pohjaa, toiminnot `[]`.
   - `kuuluuKopioon` palauttaa false ja `EI_PALAUTETA` sisältää tyypin.
   - Webhook ohittaa tyypit `sivustonTila` ja `varmuuskopio` (200, `{ revalidated: false }`).
2. **`kirjaaAjo`:** `createIfNotExists` ja `patch.set(kirjaus)`, `commit({ visibility: "async" })`. Virhe kirjataan `console.error`illa, eikä se kaada ajoa.
   - **Huolto:**
     - tulokset `arvosanat` (huomio, kun korjattiin yli 0) ja `kuvat`
     - uusi `otteluhaku` = `tarkistaOtteluhaku()`, joka **ei** vaikuta `onnistui`-arvoon eikä HTTP-koodiin
     - lopuksi `kirjaaAjo`
   - **Varmuuskopio:** onnistuminen ja `catch`-haara kirjataan. Client luodaan `try`-lohkon ulkopuolella.
   - **`lib/ottelut.ts`:**
     - `fetchTaso(…, { tuore })` (`cache: "no-store"`, `AbortSignal.timeout(15_000)`)
     - `haeVeikkausliigaTuore()`
     - `tarkistaOtteluhaku(nyt)` → `{ lahde, maara, tulevia, virhe }`; virhe palautetaan, ei heitetä
3. **`lib/sivuston-tila.ts`**, säännöt ja tekstit E:n suunnitelman mukaan. Karsittu: ei Management API -rivejä (taso, lomakkeet, webhook).
   - `varmuuskopionTila`:
     - ok, kun kopio on enintään 8 päivää vanha: "Viimeisin kopio ma 5.10.2026 (3 päivää sitten), 5544 dokumenttia."
     - virhe, kun yli 8 päivää: "Viikkovarmuuskopiota ei ole tehty N päivään.", ohje "Ajastus ei ole käynyt tai se epäonnistui. Kerro tukihenkilölle: Vercel → Cron Jobs → /api/varmuuskopio. Sisältösi on tallessa, mutta palautus vanhaan versioon ei ole mahdollinen ilman tuoretta kopiota."
     - virhe, kun epäonnistunut ajo on uudempi kuin viimeisin kopio
   - `huollonTila`:
     - tuntematon ennen ensimmäistä ajoa
     - virhe, kun ajosta on yli 30 tuntia: "Yöllinen huolto ei ole käynyt N vuorokauteen.", ohje "Ravintoloiden arvosanat ja arvostelukuvien siivous odottavat. Kerro tukihenkilölle." **Tämä rivi paljastaa myös, jos kirjoittava token on menettänyt oikeutensa (Y2).**
     - huomio, kun arvosanoja korjattiin yli 0
     - ok: "Viimeksi tänä aamuna klo 5.02. …"
   - `otteluhaunTila`:
     - virhe ja ohje "Ottelut-sivulla ja etusivulla näkyvät vain Studioon lisätyt ottelut. Lisää tärkeät ottelut käsin (Ottelut → +) ja kerro tukihenkilölle."
     - 0 ottelua maalis–lokakuussa → huomio
     - 0 ottelua marras–helmikuussa → ok "Talvitauko: …"
   - `kiintionTila(kaytossa, KIINTIO)`: ok alle 80 %, huomio 80 %:sta (ohje Y4), virhe 95 %:sta.
   - `julkaisemattomienTila`.
   - `kokonaistila`: pahin tila; tuntematon ei nosta tilaa.
   - `huoltoajonKirjaus`.
   - `puuttuvatPerustiedot` palauttaa tekstit "Klubin sähköpostiosoite puuttuu (Yhteystiedot).", "Postiosoite puuttuu (Yhteystiedot).", "Puhelinnumero puuttuu (Yhteystiedot).", "Hallituksen jäseniä ei ole lisätty (Hallitus)." ja "Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot)."
   - Kiintiö: `DATASETIT = ["production", "development"]`, ja kustakin lasketaan `count(*[!(_type match "sanity.*") && !(_id in path("_.**"))])` Studion istunnolla. Datasetin virhe ohitetaan, ja teksti on silloin "(vain tämä datasetti)".
4. **`sanity/lib/tehtavat.ts`:**
   - `TEHTAVAT` (arvostelut, kommentit, julkaisemattomat, ajastetut ja tarkistettavat, joista jokaisella `suodatin` ja `laskuri`) sekä `TARKISTETTAVAT_TYYPIT` (siirretään tiedostosta structure.ts). Julkaisemattomien `pois`-joukkoon lisätään `sivustonTila`.
   - `ALOITUS_KYSELY` = laskurit ja seuraavat:
     ```groq
     "varmuuskopio": *[_type == "varmuuskopio" && !(_id in path("drafts.**"))] | order(paiva desc)[0]{ paiva, dokumentteja },
     "huolto": *[_id == $huoltoId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
     "varmuuskopioAjo": *[_id == $varmuuskopioId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
     "perustiedot": { "sahkoposti": defined(*[_id == "yhteystiedot"][0].email), "osoite": …, "puhelin": …,
       "hallitus": count(*[_type == "hallitusJasen" && nykyinen != false && !(_id in path("drafts.**"))]),
       "esittelykuva": defined(*[_id == "etusivu"][0].blocks[_type == "esittely"][0].image.asset) }
     ```
   - `structure.ts` rakentaa Tehtävät sinulle -listan muodossa `TEHTAVAT.map(…)`, ja jokaisella kohdalla on `.id(t.id)`.
5. **Aloitus-työkalu:**
   - `definePlugin({ name: "klubi-aloitus", tools: [{ name: "aloitus", title: "Aloitus", icon: HomeIcon, component: Aloitus }] })` ensimmäiseksi pluginiksi, jolloin se on oletusnäkymä. Vision-suodatin säilyy.
   - Rakenne:
     - `<Heading as="h1">Hei! Tästä pääset alkuun</Heading>` ja johdanto "Tällä sivulla näet, onko sivustolla kaikki kunnossa ja mikä odottaa sinua."
     - **Sivuston tila** (h2):
       - Päivitä-painike
       - yhteenvetokortti: "Kaikki kunnossa" (positive), "Huomioitavaa" (caution) tai "Vaatii toimia" (critical)
       - rivit järjestyksessä varmuuskopio, huolto, otteluhaku, julkaisemattomat ja kiintiö
       - tila näkyy **aina tekstinä ja ikonina**, ei pelkkänä värinä
       - lataus: `aria-live="polite"` "Tarkistetaan sivuston tilaa…"
     - **Odottaa sinua** (h2): kortit `Grid columns={[1, 2, 3]}`, linkki `/studio/structure/tehtavat;<id>`, `aria-label="{otsikko}: {n}"`. Kun luku on 0, teksti on "Ei odottavia".
     - **Täydennä perustiedot** (h2, vain jos jotain puuttuu): `IntentLink intent="edit"` yhteystietoihin ja etusivulle, ja hallitukseen `/studio/structure/klubi;hallitus`.
   - Data haetaan kerran avattaessa ja Päivitä-painikkeesta. Kuuntelua ei ole.
6. **UptimeRobot** (vain ohje, docs/17 uusi §E "Valvonta"):
   - Free-tili, 5 minuutin väli.
   - Monitorit:
     - HTTPS-monitori etusivulle
     - Keyword-monitori avainsanalla "Lahden Suomalainen Klubi"
     - HTTPS-monitori osoitteeseen /studio
   - Hälytysten vastaanottajat: avoin päätös 6.2.
   - Cronien hiljaista pysähtymistä UptimeRobot ei huomaa. Sen huomaa Aloituksen punainen rivi.

**Testit:**
- `test-sivuston-tila.ts`: E:n tapaukset varmuuskopiolle, huollolle, otteluhaulle, kiintiölle, julkaisemattomille, kokonaistilalle, `huoltoajonKirjaus`-funktiolle ja `puuttuvatPerustiedot`-funktiolle, aika `nyt = 2026-10-08T12:00Z`.
- `test-aloitus.ts`: TEHTAVAT-tunnisteet ovat uniikkeja, `laskuri` alkaa merkkijonolla `count(`, ja `pois` sisältää `sivustonTila`.
- `test-varmuuskopio.ts`: `sivustonTila` ei kuulu kopioon. `test-palautus.ts`: tyyppiä ei palauteta.

**Hyväksymiskriteerit:**
- Development: `/studio` avautuu Aloitukseen.
- Huollon ja varmuuskopion käsiajo onnistuu: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/huolto` luo tilan, ja Aloitus näyttää sen.
- Kopio ei sisällä `sivustonTila`a.
- Rooli viewer: rivit näkyvät ilman virheitä.
- Näppäimistö ja puhelimen leveys toimivat.

**docs/09:**
- Alkuun luku "Aloitus ja sivuston tila": taulukko rivi | mitä se tarkoittaa | mitä teet, kun se on punainen tai keltainen. Lisäksi "Sisältösi ei katoa, vaikka rivi olisi punainen." sekä Odottaa sinua ja Täydennä perustiedot.
- Tyypilliset tilanteet: "Aloituksessa punainen rivi → lue ohje, kerro tukihenkilölle."

**docs/05:** `sivustonTila` (järjestelmäloki).

---

### Askel 8: Automaattiset ohjaukset ja lyhytosoitteet (D1: Y18)

**Tavoite:**
- Julkaistun dokumentin osoitteen muutos ohjaa vanhan osoitteen uuteen (308) automaattisesti webhookin kautta.
- Isä tekee lyhytosoitteita ja ohjauksia (307) kohdassa Sivuston asetukset → Ohjaukset ja lyhytosoitteet.
- Ohjaus ratkaistaan vain 404-haarassa.

**Tiedostot:**
- uudet:
  - `lib/ohjaukset.ts`
  - `sanity/lib/ohjaus.ts`, `sanity/lib/aiemmat-polut.ts`, `sanity/lib/ohjauksen-lahde.ts`, `sanity/lib/queries/ohjaukset.ts`
  - `sanity/schemas/documents/ohjaus.ts`
  - `scripts/test-ohjaukset.ts`, `scripts/e2e-ohjaukset.ts`
- `sanity/schemas/objects/contentMeta.ts`
- `sanity/schemas/documents/{sivu, uutinen, tapahtuma, ravintola, galleriaAlbumi, klubiToiminta, arvokisa, pelaaja, stadion, jalkapalloTilasto, kaupunki, uutisKategoria}.ts`
- `sanity/schemas/index.ts`, `sanity/structure.ts`
- `app/api/revalidate/route.ts`
- 19 reittitiedostoa, joissa on `notFound()`
- `sanity/lib/queries/ravintolat.ts`, `components/ravintola-filters.tsx`, `app/(public)/ravintolat/page.tsx`
- `lib/palautus.ts`, `sanity/actions/palauta-varmuuskopiosta.tsx`
- `scripts/test-palautus.ts`
- `package.json` (`test:ohjaukset`, `e2e:ohjaukset`, devDependency `@sanity/webhook` `^4.0.4`, sama kuin next-sanityn)
- `sanity/sanity.types.ts`
- `docs/09`, `docs/07`, `docs/05`, `docs/17`, `CLAUDE.md`

**Toteutus:**
1. **`lib/ohjaukset.ts`** (tuo tiedostot `./path` ja `./site`). Funktiot ja algoritmit D:n suunnitelman mukaan:
   - `normalisoiPolku`, `omaPolku`.
   - `ratkaiseOhjaus`:
     - ohjaus voittaa aiemman polun
     - ketjua seurataan enintään 5 hyppyä, ja tulos on yksi ohjaus lopulliseen kohteeseen
     - silmukka → null ja `console.error`
     - ulkoinen kohde päättää ketjun
     - `mailto:` → null
     - isän ohjauksilla `pysyva: false`
   - `yhdistaAiemmatPolut`: kun osoite palaa aiempaan, se poistuu listalta.
   - `osoitteenMuutos`, `polunMuutosViesti`.
   - **Muutos (R7):** `tarkistaOhjauksenLahde` hylkää myös polut, jotka ovat täsmälleen `KOODIIN_SIDOTUT_SIVUT`-joukossa: `Osoitteessa /${polku} on jo sivu. Valitse toinen osoite.`
   - Muut virhetekstit D:n mukaan:
     - "Kirjoita osoite, esim. /jasenmaksu."
     - "Osoite alkaa kauttaviivalla, esim. /jasenmaksu."
     - "Kirjoita vain sivuston osoitteen loppuosa, esim. /jasenmaksu, ei koko osoitetta."
     - "Etusivua ei voi ohjata."
     - "Osoitteessa ei voi olla ?- tai #-merkkiä."
     - "Poista kauttaviiva osoitteen lopusta."
     - `Käytä pieniä kirjaimia: …`
     - `Virheellinen kohta "…". Käytä vain kirjaimia a–z, numeroita ja yksittäisiä yhdysmerkkejä (ä → a, ö → o).`
     - "Osoite on liian pitkä."
     - `Osoite /… on sivuston oma, eikä sitä voi ohjata.`
   - `OHJATTAVAT_TYYPIT` = `LINKIN_KOHDETYYPIT` ja `jalkapalloTilasto`. `TUNNISTE_TYYPIT` = `uutisKategoria` ja `kaupunki`.
2. **`polunMuutosViesti`** (sanastossa "osoite"), yksi `.info()`-sääntö:
   - Ohjattavat tyypit: `Julkaistu osoite on "${julkaistu}". Kun julkaiset, vanha osoite ohjautuu automaattisesti uuteen, joten vanhat linkit toimivat edelleen.`
   - Tilasto ilman omaa sivua: `… Taulukko näkyy samalla sivulla kuin ennenkin. Vain suora linkki tähän taulukkoon (#${julkaistu}) vie jatkossa sivun alkuun.`
   - uutisKategoria ja kaupunki: tunnistetekstit D:n mukaan.
   - `polkuMuuttunut(rule)` palauttaa yhden säännön. Kaikki 11 käyttöpaikkaa pysyvät ennallaan.
3. **`aiemmatPolutField(group?, kuvaus?)`:**
   - Otsikko "Aiemmat osoitteet", `string[]` tags, `readOnly`, piilossa kun lista on tyhjä.
   - Kuvaus "Osoitteet, joissa tämä on aiemmin ollut. Ne ohjautuvat tänne automaattisesti. Sivusto lisää osoitteen itse, kun muutat osoitetta ja julkaiset."
   - Tunnistetyypeillä `AIEMMAT_TUNNISTEET_KUVAUS`.
   - Lisätään 10 tyyppiin ryhmään `seo` (tapahtumaan ja galleria-albumiin ilman ryhmää), kaupunkiin ja uutisKategoriaan (korvaa nykyisen muokattavan kentän, data ennallaan).
   - Osoitekenttien kuvauksiin lisätään: "Jos muutat julkaistun … osoitetta, vanha osoite ohjautuu uuteen automaattisesti."
4. **`ohjaus`-tyyppi** (ArrowRightIcon, otsikko "Ohjaus tai lyhytosoite"):
   - `lahde` "Osoite sivustolla": kuvaus D:n mukaan, `initialValue: "/"`. Validointi: `tarkistaOhjauksenLahde`, `lahdeOnVapaa` (virhe) ja `lahdeKorvaaAutomaattisen` (varoitus).
   - **`minne`** (tyyppi `linkki`, R6) "Minne ohjataan": kuvaus "Valitse sivuston sivu listasta, kirjoita ulkoinen osoite (https://…) tai valitse tiedosto. Kohteen voi vaihtaa milloin vain." Validointi `vaadiLinkki`, `kohdeEiItseensa` (virhe) ja `kohdeOnOhjaus` (varoitus).
   - `muistiinpano` "Muistiinpano (ei näy sivustolla)", enintään 300 merkkiä.
   - Esikatselu: select `lahde`, `minne.kohde.title`, `minne.kohde.name`, `minne.href`, `minne.tiedosto.asset.originalFilename` ja `muistiinpano` → `→ …`.
   - Studion tarkistukset (`ohjauksen-lahde.ts`):
     - Duplikaatti: `Osoitteelle … on jo ohjaus. Avaa se listasta ja muuta sen kohdetta.`
     - HEAD-pyyntö (`redirect: "manual"`, 60 s välimuisti) palauttaa 200: `Osoitteessa … on jo sivu. Ohjaus toimii vain osoitteissa, joissa ei ole sivua. Valitse toinen osoite.`
     - Vastaus `opaqueredirect`, eikä kyse ole omasta ohjauksesta tai aiemmasta polusta: `Osoitteella … on jo kiinteä ohjaus (vanhan sivuston osoite). Valitse toinen osoite.`
     - `lahdeKorvaaAutomaattisen`: `Tämä osoite ohjautuu nyt automaattisesti sivulle "…". Ohjauksesi korvaa sen.`
     - `kohdeEiItseensa`: "Ohjaus ei voi osoittaa itseensä."
     - `kohdeOnOhjaus`: `Kohde … on itsekin ohjaus. Valitse suoraan lopullinen sivu.`
5. **Rakenne:** kohtaan `asetukset` lisätään `ohjaukset` "Ohjaukset ja lyhytosoitteet":
   - `lyhytosoitteet`: `documentTypeList("ohjaus")`, järjestys `lahde asc`
   - `muuttuneet` "Muuttuneet osoitteet (automaattiset)": suodatin `_type in $tyypit && count(aiemmatPolut) > 0`, järjestys `_updatedAt desc`, ei pohjia
6. **Kysely ja ratkaisu:**
   ```groq
   { "ohjaukset": *[_type == "ohjaus" && defined(lahde)] | order(_id asc){ _id, lahde, minne{ ${linkkiProjektio} } },
     "dokumentit": *[_type in ["sivu","uutinen","tapahtuma","ravintola","galleriaAlbumi","klubiToiminta","arvokisa","pelaaja","stadion","jalkapalloTilasto"]
       && count(aiemmatPolut) > 0 && !(_type == "uutinen" && !${JULKAISTU}) && !(_type == "ravintola" && !${JULKINEN_RAVINTOLA})]
       { ${routableProjection}, aiemmatPolut, _updatedAt } }
   ```
   - Kysely on parametriton: yksi välimuistiavain kaikille 404-vastauksille, tagi `ohjaus`.
   - `ohjaaTaiEiLoydy(polku)` (`server-only`):
     - `sanityFetch` → `kohdeHref = linkinOsoite(o.minne)`
     - `ratkaiseOhjaus(polku, stegaClean(kartta))`
     - sitten `permanentRedirect` tai `redirect`, muuten `notFound()`
7. **22 kohtaa:** `if (!x) notFound();` muutetaan muotoon `if (!x) return ohjaaTaiEiLoydy(<polku>);`. Polut D:n taulukon mukaan, catch-all `toHref(joinSlug(slug))`. generateMetadata-funktioihin ei kosketa.
8. **Webhook** (§2.5):
   - `WebhookPayload`-tyyppiin lisätään kentät `_id`, `operaatio` ja `ennen`.
   - Ennen tagien tyhjennystä, kun operaatio on `update` ja tyyppi on ohjattava tai tunniste: `await tallennaAiempiOsoite(...)`.
     - Kirjoittava client (kuten `laskeArvosanat`).
     - `osoitteenMuutos` ja `yhdistaAiemmatPolut`.
     - Transaktiossa `set aiemmatPolut` julkaistuun versioon **ja** mahdolliseen luonnokseen, `visibility: "sync"`.
     - Onnistuessa lisätään tagi `ohjaus`.
   - `OHJATTAVAT_TYYPIT` → aina tagi `ohjaus`.
   - Vanha projektio → `console.warn` "webhookin projektiosta puuttuu operaatio: aiempia osoitteita ei tallenneta (docs/07 Ajonaikaiset ohjaukset)".
   - Patch laukaisee uuden webhookin. Sen `before().slug` on sama kuin nykyinen, joten silmukkaa ei synny.
   - Kommenttilohko `route.ts:11-22` päivitetään.
9. **Kaupunki:**
   - Ravintoloiden kaupunkiprojektioon lisätään `aiemmatPolut`, ja facets-tietoihin `aiemmatTunnisteet`.
   - Uusi `korjaaKaupunki(f, facets)`. Ravintolasivulla: `sovitaAlue(korjaaKaupunki(parseRavintolaFilters(sp), facets), facets)`.
10. **Palautus:** `luonnosVarmuuskopiosta(doc, nykyinen?)` yhdistää aiemmatPolut-kentän, ja kutsuja välittää kohteen `props.published`.

**Testit:**

`scripts/test-ohjaukset.ts` (`npm run test:ohjaukset`), D:n tapaukset 1–22 ja 24 sekä R7-lisäys (`/uutiset` → virhe, `/uutiset/vanha-juttu` kelpaa). Lisäksi:
- **Rakennetesti 23:**
  - `app/(public)`-kansion koodiriveillä ei ole kutsua `notFound(`
  - kommenttirivit ja tiedosto `sanity/lib/ohjaus.ts` ohitetaan
  - viesti: "Käytä ohjaaTaiEiLoydy(polku) notFound():n sijaan (docs/07): muuten lyhytosoitteet ja muuttuneet osoitteet eivät toimi tässä reitissä."
- Kyselyn tyyppilista vastaa joukkoa `OHJATTAVAT_TYYPIT`.

Muut testit:
- `test-palautus.ts`: aiemmatPolut yhdistetään.
- `korjaaKaupunki` testataan samassa tiedostossa.
- `scripts/e2e-ohjaukset.ts`:
  - kaksi tilaa: `-- --paikallinen` (development ja localhost, webhook simuloidaan allekirjoituksella `@sanity/webhook` `encodeSignatureHeader`) ja production (aito webhook)
  - askeleet 1–7 D:n mukaan
  - erityisesti askel 5: kohteen vaihdon jälkeen ISR-välimuistiin tallennettu 307 vaihtuu 120 sekunnissa (riski R1)
  - siivous `finally`-lohkossa

**Hyväksymiskriteerit:**
- `npm run e2e:ohjaukset -- --paikallinen` on vihreä.
- Studio (development):
  - "/uutiset" → "Osoitteessa on jo sivu"
  - "/arvostelu.htm" → kiinteä ohjaus
  - duplikaatti ja "/Jasenmaksu" tuottavat virheen
  - osoitteen muutos näyttää sinisen tiedon
- Build ja `verify:redirects` menevät läpi, ja `/uutiset/eiole` antaa yhä 404:n.

**docs/09:**
- Uusi luku **"Osoitteen muuttaminen"** (D:n teksti, kohta Sivuston asetukset). Lukittuja sivuja ovat osiosivut, Klubin sivut, tietosuoja ja Litmanen.
- Uusi luku **"Lyhytosoite esitteeseen (esim. /jasenmaksu)"**, viisi askelta, sekä ohjeet ohjauksen poistoon ja virheeseen "Osoitteessa on jo sivu".
- "Mitä EI saa tehdä": kohta "Älä muuta julkaistun sivun Polkua" poistetaan, lukitut sivut jäävät, ja Aiemmat osoitteet "täyttyy automaattisesti".
- Tyypilliset tilanteet: kolme riviä.
- Uutiskategorian osoite: vanhat linkit ohjautuvat automaattisesti.
- Askeleen 4 lisäys "Muu osoite -linkit eivät seuraa" poistetaan, koska nyt ne seuraavat ohjauksen kautta.

**Muut dokumentit:**
- **docs/07:** uusi luku "Ajonaikaiset ohjaukset (Sanity)": järjestys, tilakoodit, kartta ja välimuisti, projektio, ketjut, rakennetesti ja Y19:n johtopäätös.
- **docs/17 §D:** webhookin projektio, jota käytetään myös, jos webhook luodaan uudelleen.
- **CLAUDE.md:** käytäntö "Uusi dynaaminen reitti: kun sisältöä ei löydy, kutsu `return ohjaaTaiEiLoydy(polku)`, älä `notFound()`. Testi valvoo tätä."

---

### Askel 9: Poiston turva ja Kopioi pohjaksi (D2: Y20)

**Tavoite:** Poisto ja julkaisun peruminen varoittavat, jos dokumenttiin ohjautuu vanhoja osoitteita, ja neuvovat tekemään ohjauksen. Kopioi toimii muodossa "Kopioi pohjaksi", joka jättää osoitteen ja vanhan sivuston tiedot pois.

**Tiedostot:** uusi `sanity/actions/vanhat-osoitteet.tsx`; `lib/ohjaukset.ts` (`vanhatOsoitteet`, `KOPIOSTA_POISTETTAVAT`, `tyhjennaKopiosta`), `sanity.config.ts`, `scripts/test-ohjaukset.ts`, `docs/09`.

**Toteutus:**
- **`varoitaVanhoistaOsoitteista(t)`:** lukittu-sivu.tsx-malli, eli alkuperäinen toiminto kutsutaan aina.
  - Dialogi `confirm`, `tone: "critical"`. Painikkeet "Poista silti" tai "Piilota silti" ja "Peruuta".
  - Tekstit D:n mukaan, ohjeena "Sivuston asetukset → Ohjaukset ja lyhytosoitteet → uusi …".
  - Lista `<ul>`, enintään 5 osoitetta ja "ja N muuta".
  - Vahvistuksen jälkeen Sanityn oma viittausdialogi avautuu perään.
- **`kopioiPohjaksi(t)`:** `mapDocument: tyhjennaKopiosta` (Sanityn @beta-rajapinta, merkintä docs/07:ään päivitystarkistusta varten).
  - Teksti "Kopioi pohjaksi".
  - title-teksti "Tekee kopion samalla sisällöllä ilman osoitetta ja vanhan sivuston tietoja. Anna kopiolle oma otsikko ja paina osoitteen kohdalla Luo ennen julkaisua."
- **Kytkentä** §2.7:n mukaan.

**Testit:**
- `vanhatOsoitteet`: legacyUrl, muut legacy-osoitteet, blogspot-polku `/blogspot…`, aiemmatPolut, kategorian `/uutiset?kategoria=…` ja tyhjä dokumentti.
- `tyhjennaKopiosta` ei muuta alkuperäistä dokumenttia.

**Hyväksymiskriteerit:**
- Developmentissa vanhan blogiuutisen poisto näyttää osoitteet.
- Kopioi pohjaksi tuottaa kopion ilman slugia, legacyUrlia ja blogspot-tietoa.
- Lukitulla sivulla Kopioi on yhä estetty.

**docs/09:**
- Kopioi-kiellon rivit korvataan tekstillä "Kopioi pohjaksi (⋯-valikko) tekee kopion ilman osoitetta ja vanhan blogin tietoja. Anna kopiolle uusi otsikko ja paina osoitteen kohdalla Luo."
- Uusi kohta "Poistettu tai yhdistetty sivu": tee ensin ohjaus.

---

### Askel 10: Valmiit pohjat, tilamerkit ja arvosanat ravintoloittain (E3: Y37)

**Tavoite:** Vuosikokouskutsu, palloveikkauksen tilanne ja uusi palloveikkauskausi aloitetaan pohjasta, ja unohtunut [täytä: …] -kohta estää julkaisun. Merkit näyttävät dokumentin tilan. Klubilaisen arvosana lisätään ravintolan kautta, jolloin ravintola ja päivä ovat valmiina.

**Tiedostot:** uudet `lib/pohjat.ts`, `lib/tilamerkit.ts`, `sanity/merkit.tsx`, `scripts/test-pohjat.ts` ja `scripts/test-tilamerkit.ts`; `sanity/pohjat.ts`, `sanity.config.ts`, `sanity/structure.ts`, `sanity/schemas/documents/uutinen.ts`, `package.json`, `docs/09` ja `CLAUDE.md`.

**Toteutus:**
1. **`lib/pohjat.ts`:**
   - `TAYTA = /\[täytä:[^\]]*\]/gi`, `taytettavatKohdat` (merkkijono tai blockien spanit) ja `taytaVielaSaanto` → "Täytä vielä hakasulkeissa olevat kohdat: …".
   - `vuosikokousNumero(v) = v - 2007`.
   - Pohjien arvot E:n suunnitelman mukaan:
     - **vuosikokous:** otsikko `Lahden Suomalainen Klubi ry - vuosikokous ${vuosi}`, Lyhenne `Lahden Suomalainen Klubi ry:n ${N}. vuosikokous pidetään [täytä: …] klo [täytä: kellonaika] [täytä: paikka].`, kategoria Tapahtumat (haetaan slugilla `tapahtumaraportti`), tunnisteet ja neljä kappaletta
     - **palloveikkauksen tilanne**
     - **uusi kausi** (`kommentointi: { kaytossa: true, tyyppi: "sarjajarjestys" }`)
   - Kaikilla blockeilla on `_key`, `markDefs` ja `marks`.
2. **`sanity/pohjat.ts`:**
   - `uutinen-vuosikokous`, `uutinen-palloveikkaus-tilanne` ja `uutinen-palloveikkaus-kausi`. Kategoriat haetaan slugilla ajonaikaisesti (`getClient`).
   - `klubiArvio-ravintolalle` (parametri `ravintolaId`, ja `paiva` on tämä päivä).
   - Varmistetaan, säilyvätkö kenttätason oletusarvot (esim. `kommentointi.kaytossa`). Ellei, ne lisätään pohjaan.
3. **`uutinen.ts`:** `taytaVielaSaanto` kenttiin title, excerpt ja body (virhetaso). Productionissa sanaa "täytä" ei esiinny yhdessäkään uutisessa.
4. **Merkit** (`document.badges`), aina tekstinä:
   - "Ei vielä sivustolla": kaikki sisältötyypit paitsi singletonit, varmuuskopio, sivustonTila ja arvostelu, kun dokumentti on luonnos eikä sitä ole julkaistu. Väri warning, title "Paina Julkaise, niin tämä tulee sivustolle."
   - "Ajastettu" (uutinen, primary): "Tulee sivustolle {pvm klo}".
   - "Tarkistettava": `TARKISTETTAVAT_TYYPIT`, "Lue kohta Mitä tarkistaa."
   - "Odottaa toista arvioijaa" (ravintola): `onJulkinenRavintola`-pariteetti `JULKINEN_RAVINTOLA`-ehdon kanssa.
   - "Piilotettu" (kommentti, danger).
   - "Entinen jäsen" (hallitusJasen).
5. **Arvosanat ravintoloittain** (`ravintolat;arvosanat`):
   - `arvosanat-ravintoloittain`: `documentTypeList("ravintola")` → `.child(id => documentList` suodattimella `ravintola._ref == $id`, järjestys `paiva desc`, pohja `klubiArvio-ravintolalle`. `drafts.`-etuliite poistetaan id:stä.
   - `arvosanat-kaikki`: nykyinen lista.

**Testit:**
- `test-pohjat.ts`:
  - vuosikokouksen numero
  - pohjan kentät ja `_key`-avaimet
  - Lyhenne enintään 200 merkkiä
  - `tapahtumatId` null → kategoriat []
  - `taytettavatKohdat` (2 / 1 / 0 / 0 / 0)
  - säännöt
- `test-tilamerkit.ts`:
  - `onAjastettu`
  - `onTarkistettava`
  - `onJulkinenRavintola`: viisi tapausta
  - `merkitTyypille`

**Hyväksymiskriteerit:**
- Developmentissa kolme uutispohjaa luovat uutisen, ja [täytä]-kohta estää julkaisun.
- Merkit näkyvät uutisessa, ravintolassa, kommentissa ja jäsenessä.
- Ravintolan + avaa arvosanan valmiiksi täytettynä.

**docs/09:**
- Alaluku "Valmiit pohjat" (Studion + -valikko → Vuosikokouskutsu ja muut).
- Uusi kohta "Merkit dokumentin yläreunassa".
- Ravintolan arvosana: Ravintolat → Klubilaisten arvosanat → Ravintoloittain → ravintola → +.
- Tyypilliset tilanteet: "Unohdin [täytä]-kohdan".

---

### Askel 11: Taulukon sijainti ja tilastoryhmät (E4: Y36)

**Tavoite:** Jokaisen 187 taulukon kohdalla Studio näyttää, millä sivulla taulukko näkyy (Näkyy sivulla), tai sanoo, ettei se näy missään. Tilastot on ryhmitelty, ja ryhmän + täyttää kategorian valmiiksi.

**Tiedostot:**
- uudet: `lib/tilasto-kategoriat.ts`, `lib/sijainnit.ts`, `scripts/test-sijainnit.ts`
- `sanity/schemas/documents/jalkapalloTilasto.ts`
- `sanity/presentation.ts`, `sanity.config.ts`, `sanity/pohjat.ts`, `sanity/structure.ts`
- `sanity/lib/queries/sitemap.ts` (`VIITTAAJA`-vienti)
- `package.json` (`rxjs` `^7.8.2` suoraksi riippuvuudeksi, `test:sijainnit`)
- `docs/09`, `CLAUDE.md`

**Toteutus:**
- **`TILASTO_KATEGORIAT`** (nykyiset 23 samassa järjestyksessä, kentät ryhma ja `vaatiiViittaajan`) ja `TILASTORYHMAT`: Klubin omat tilastot, Huuhkajat, Karsinnat, Arvokisat ja Muut arkiston taulukot.
- Skeema `options.list` muodostetaan näistä. Kategorian kuvaus: "Ratkaisee, millä sivulla taulukko näkyy. Tarkka sivu näkyy lomakkeen yläreunassa (Näkyy sivulla). Klubin omat tilastot ja pelaajatilastot näkyvät vasta, kun ne on lisätty sivun, klubin toiminnan tai pelaajan Taulukot-kenttään."
- Esikatselu: `kategorianNimi` ja osion nimi.
- **`dokumentinSijainnit(doc)`** E:n taulukon mukaan:
  - Tilasto ilman sijaintia: `{ locations: [], message: "Taulukko ei näy vielä millään sivulla. Lisää se sivun, klubin toiminnan tai pelaajan Taulukot-kenttään ja julkaise.", tone: "caution" }`.
  - ottelu → /ottelut ja /.
  - hallitusJasen → /klubi/hallitus, entiselle jäsenelle viesti.
  - kommentti → uutinen.
  - klubiArvio → ravintola.
  - uutisKategoria → `/uutiset?kategoria=s`.
  - ohjaus → lähdepolku.
- **`presentation.ts`:** funktiomuotoinen `locations`, `documentStore.listenQuery(SIJAINTI_KYSELY, { id: getPublishedId(id) }, { perspective: "drafts" }).pipe(map(dokumentinSijainnit))`. `VIITTAAJA` on yhteinen sitemapin kanssa.
- **Rakenne:**
  - `tilastot`: `tilastot-<ryhmä>` = `documentList` suodattimella `category in $kategoriat` ja pohjilla `jalkapalloTilasto-kategoria` ({ category }).
  - Lisäksi `tilastot-kaikki`.

**Testit** (`test-sijainnit.ts`):
- 23 uniikkia kategoriaa, ja jokaisella on ryhmä ja sijaintisääntö.
- `kategorianNimi`.
- Sijainnit kaikille tyypeille (E:n lista ja ohjaus).

**Hyväksymiskriteerit:**
- Developmentissa Näkyy sivulla -linkki näkyy viidelle taulukolle (klubi/sivu, klubi/toiminta, huuhkajat, karsinta ja arvokisa) sekä ottelulle, kommentille ja arvosanalle.
- Ryhmän + täyttää kategorian.

**docs/09:** "Taulukon muokkaaminen" ja "Huuhkajat-taulukon lisääminen": Näkyy sivulla, huomio "ei näy vielä millään sivulla" ja ryhmän +.

---

### Askel 12: Ohjausgeneraattorin pienet korjaukset (D3: Y19:n loppu)

**Tiedostot:** `scripts/generate-redirects.ts` (oletuksena `"production"`, vain luku, ja kommentti rivillä 4 korjataan), `.gitignore` (`!/data/crawl-status.tsv`), `data/crawl-status.tsv` (5,6 kt, gitiin) ja `docs/07`.

**Hyväksymiskriteeri:** `npm run redirects -- --offline` tuottaa saman `lib/redirects.ts`:n kuin nyt, eli `git diff` on tyhjä.

Ajonaikaista legacyUrl-hakua ei tehdä: kaikilla 188 .htm-osoitteella ja 530 blogipolulla on staattinen ohjaus, ja kaikki 689 kohdetta vastaavat 200:lla.

---

## 5. Tuotantomuutokset (kehittäjä tekee erikseen, ei toteutusaskeleissa)

Jokainen kirjoitus tehdään ensin developmentiin, sitten kuivaharjoituksena productioniin ja vasta sitten oikeasti. Skriptit ajavat `npm run backup` itse ennen kirjoitusta productioniin ja keskeyttävät, jos varmuuskopio epäonnistuu. `--replace`-ajoja ei tehdä missään vaiheessa.

| # | Milloin | Toimenpide | Production-kirjoitukset |
|---|---|---|---|
| P1 | askel 1 | `npm run backup`, deploy | 0 |
| P2 | ennen askeleen 2 deployta | Lukutarkistus: `count(*[_type == "uutinen" && count(body[!(_type in $sallitut)]) > 0] + *[_type == "tapahtuma" && count(description[!(_type in $sallitut)]) > 0] + *[_type == "klubiToiminta" && count(kuvaus[!(_type in $sallitut)]) > 0])` ja `$sallitut` = `["block", …RIKKAAT_LOHKOT]`. Tilanne 8.10.: **0**. Sitten `npm run backup` ja deploy. Deployn jälkeen tarkistetaan: ei Invalid-varoituksia, 46 kuvatonta uutista saa korttikuvan, og:image ennallaan ja `test:saavutettavuus` productionia vasten (`BASE_URL`). | 0 |
| P3 | askeleen 3 deployn jälkeen, **samana päivänä** | 1) Deploy: koodi lukee dokumentin, jos sellainen on, ja muuten oletuksen. 2) `npm run luo:osiosivut -- --production`, odotettu tulos 28 luotavaa, 2 olemassa (sivu-klubi, sivu-klubi-palloveikkaus), 0 ristiriitaa. 3) `npm run luo:osiosivut -- --production --vie`. 4) `verify:content-routes`, `verify:migration` (tarkista, ettei sivujen määrälle ole kiinteää odotusta), `test:saavutettavuus` ja silmämääräisesti /uutiset, /jalkapalloarkisto, /klubi/hallitus ja /ravintolat. | **+28** julkaistua `sivu`-dokumenttia `createIfNotExists`-kutsulla, sisältödokumentteja 3847 → 3875. Peruutus: poistetaan 28 dokumenttia tunnuksen perusteella. |
| P4 | askel 4 | `npm run backup`, deploy. Vanha data toimii (kaksoisluku). Tarkistetaan, että valikko ja etusivu ovat ennallaan ja alatunniste on valikon mukainen. | 0 |
| P5 | askeleen 5 jälkeen, **vasta P3:n ja P4:n jälkeen** | `npm run patch:linkit -- --production` (kuivaharjoitus), sitten `-- --production --vie`. Odotettu tulos 8.10. datalla, kun osiosivut ovat olemassa: **6 dokumenttia, 53 arvoa, 52 viittausta ja 1 osoite** (navigaatio 16 viittausta, etusivu 3, Matkailu 23, Mölkky 1 osoite, sivu-klubi 9 markDefiä, uutinen-blogspot-2702900233159075591 1). Kuivaharjoitus vahvistaa luvut. 21 tekstieditorin linkkiä jää vanhaan muotoon (19 ulkoista, ankkuri ja /uutiset/arkisto/2016). Vanhat href-, url- ja ctaHref-arvot säilyvät. Jos P5 ajetaan ennen P3:a, aja se uudelleen P3:n jälkeen (idempotentti). | 6 dokumentin patch (ifRevisionId) |
| P6 | ennen askeleen 6 deployta | Lukutarkistus kuten P2, mutta `sivu.body` ja koko `RIKKAAT_LOHKOT`-lista. Odotettu tulos 0. Sitten `npm run backup` ja deploy. | 0 |
| P7 | askel 7 | `npm run backup`, deploy. Huolto ja varmuuskopio ajetaan käsin Vercelissä (Cron Jobs → Run) tai odotetaan yöhön. GROQ-tarkistus: productionissa on täsmälleen 2 `sivustonTila`-dokumenttia. UptimeRobot-tili ja kolme monitoria. | **+2** järjestelmädokumenttia (automaattiset) |
| P8 | askel 8 | 1) `npm run backup`. 2) **Ennen deployta** webhookin "Sivuston päivitys (revalidate)" projektio vaihdetaan muotoon §2.5 (sanity.io/manage → API → Webhooks → Edit). Nykyinen käsittelijä ohittaa lisäkentät. Tarkistetaan Attempts-lokista, että vastaus on 200. Paluu: `{_type, "slug": slug.current}`. 3) Deploy. 4) Varmuuskopion jälkeen, kun webhook-jono on tyhjä: `npm run e2e:ohjaukset`. Testi luo ja poistaa testisivun ja ohjauksen (netto 0), ja testisivu näkyy 2–4 minuuttia. 5) Isä tekee ensimmäisen lyhytosoitteen (esim. /jasenmaksu). | e2e netto 0. Sen jälkeen webhook kirjoittaa `aiemmatPolut`-kentän aina, kun isä muuttaa osoitetta (muutamia kertoja vuodessa). |
| P9 | askeleet 9–12 | `npm run backup`, deploy | 0 |
| P10 | 26.10.2026 illalla (Free-siirto) | Nykyiseen Y2-testiin (docs/17 §D) lisätään: 1) Aloituksessa huolto on ok seuraavana aamuna. 2) Yhden osoitteen muutos tallentaa `aiemmatPolut`-kentän. 3) Anonyymi `count(*[_type == "sivustonTila"])` julkisesta datasetistä palauttaa 0. Jos tulos ei ole 0, se kirjataan docs/17:ään, koska tiedot eivät ole arkaluonteisia. | 0 |
| P11 | noin 2 viikkoa P5:n jälkeen | `npm run patch:linkit -- --production --vie --poista-vanhat` (kuivaharjoitus kertoo määrät). Sen jälkeen koodimuutos: `url` ja `ctaHref` sekä niiden kaksoisluku poistetaan, kun `count(*[_type == "klubiToiminta" && count(vuodet[defined(linkki.url)]) > 0])` ja `count(*[_type == "etusivu" && count(blocks[defined(ctaHref)]) > 0])` palauttavat 0. Myös `linkkiValidointi` poistetaan. `linkinTyyppi`-funktion oletus jää. | samat 6 dokumenttia |

**Deploy-järjestyksen sidokset:**
- P3:n koodi ennen P3:n luontiajoa.
- P4 ennen P5:tä.
- P3 ennen P5:tä (muuten koodireitit jäävät osoitteiksi).
- Webhookin projektio ennen askeleen 8 deployta.
- P11 vasta vakaan jakson jälkeen.

**Dokumenttikiintiö:**
- Production noin 3 875 + 2 ja development vastaava, eli yhteensä noin 7 700 / 10 000.
- docs/23 Y4:n mukainen developmentin tyhjennys julkaisun jälkeen pienentää tätä.

---

## 6. Avoimet päätökset käyttäjälle

1. **Muutetaanko uutisen Lyhenne valinnaiseksi (askel 2b)?** Jos Lyhenne ja Tiivistelmä puuttuvat, listalla näkyy tekstin alku (enintään 200 merkkiä). Nykyiset 756 uutista eivät muutu, koska jokaisella on lyhenne.
   - **Suositus: kyllä.** Isän kirjoittaminen nopeutuu, ja päätös 7.10. kielsi vain kenttien yhdistämisen.
   - Jos vastaus on ei, askel 2b jätetään pois, eikä mikään muu muutu.
2. **UptimeRobotin tili ja hälytysten vastaanottajat:** kenen sähköpostilla tili luodaan (klubin yhteinen osoite?), ja saavatko hälytykset isä, tukihenkilö vai molemmat? Tukihenkilö on yhä nimeämättä (docs/23 §0).

---

## 7. Myöhemmin (karsittu tai siirretty, perusteluineen)

| Asia | Miksi ei nyt | Milloin |
|---|---|---|
| Y26 osiovälilehdet navigaatiosta ja alasivulistaus "Lisää aiheesta" (A:n suunnitelma §5.3–5.5 on valmis pohja) | Tiekartan vaihe 3. Productionin valikko on sama kuin koodilista, joten näkyvää hyötyä ei nyt ole. 17 tiedoston muutos. | Vaihe 3, kun isä tekee ensimmäisen Klubin alasivun |
| Y27 askel 2: tekstisivut arkiston alle ja lisälinkit, `ARKISTON_OSIOT`-yhdistäminen | Vaihe 3. Kiertotie "Muu tilasto" on ohjeessa. | Vaihe 3 |
| Huuhkajat-osioiden (7), eurocupien (6) ja mestaruusmaiden (3) alasivujen johdannot | Eivät kuulu päätettyyn 24:ään. Samaa rekisterimallia voi käyttää (noin 0,5 pv, 16 dokumenttia). | Jos isä haluaa muokata niitä |
| Y40 kategorian selitys (`kaytto`) ja tehtävä "Uutiskategoriat ilman selitystä" | Vaihe 3, "tarpeen mukaan". Isä tuntee omat kategoriansa. Arvostelu-kategorian merkitys on yhä auki. | Kun kategorioita siivotaan |
| Y42 `sanity-plugin-media` | Käyttämättömiä kuvia on 3/1719. Plugin toisi ristiriidan käyttökohtaisen alt-tekstin kanssa sekä uusia dokumentteja kiintiöön. Opas neuvoo oletusvalitsimen haun (askel 1). | Kun käyttämättömiä kuvia on yli 200 tai isä pyytää kuvien tunnisteita |
| Aloituksen Management API -rivit (Sanityn taso, lomaketoken, webhook-yritykset), Luo uusi -painikkeet ja Tee näin -ohjeet | CORS- ja oikeusriski, eikä isä voi itse korjata näitä vikoja. Tokenin vika näkyy huollon rivissä. Studion + -valikko näyttää pohjat, ja ohjeet ovat docs/09:ssä. | Jos tukihenkilö haluaa näkymän |
| `verify-redirects --sanity` | Askeleen 8 e2e-testi kattaa ketjun. | Kun aiempia osoitteita on kertynyt kymmeniä |
| Raahattava järjestys (`@sanity/orderable-document-list`) | Vaatisi orderRank-migraation. Lista on nyt samassa järjestyksessä kuin sivusto (askel 1). | Jos numerojärjestys hankaloittaa |
| Pohja `ottelu-huuhkajat` ja merkki "Odottaa hyväksyntää" | Hyöty on lähes olematon (arvostelut ovat aina luonnoksia, ja Ottelut-lista riittää). | – |
| Tyhjätilatekstit kentiksi | Hylätty: ne kirjoitettiin jo kävijälle sopiviksi (Y24), ja tyhjät osiot piiloutuvat. | – |

---

## 8. Tärkeimmät riskit ja niiden hallinta

| Riski | Hallinta |
|---|---|
| Rinnakkaisten haarojen yhdistäminen tiedostoissa `structure.ts`, `sanity.config.ts`, `sivu.ts`, `revalidate/route.ts` ja `palautus.ts` | Järjestys luvussa 3. Rinnakkain tehdään vain askeleita, joilla on yhteisiä ainoastaan rekisteritiedostoja (§2.8). |
| Next 16 tallentaa ISR-välimuistiin myös sivutason ohjauksen (havaittu X-Vercel-Cache: HIT), joten lyhytosoitteen kohteen vaihto voisi viivästyä | Askeleen 8 e2e-testin askel 5 varmistaa tagilla tyhjenemisen. Varasuunnitelma: catch-allin `revalidate` 3600 → 300 s. |
| Vahvat viittaukset estävät viitatun sivun poiston, mikä voi hämmentää isää | Sanityn poistoikkuna on suomeksi ja listaa viittaajat. docs/09:ssä on rivi, ja askeleen 9 varoitus täydentää. Palautus heikentää puuttuvat viittaukset. |
| Webhook luodaan joskus uudelleen vanhalla projektiolla | `console.warn` ja projektio dokumentoitu docs/17:ään. Tarkistus myös 26.10. (P10). |
| Rajapinnat ovat @beta- tai alpha-tasoisia: `insertMenu`, `document.badges` ja `mapDocument` | Säännöt ovat testattuina `lib/`-moduuleissa, ja käyttöliittymä on eristetty omiin tiedostoihinsa. Tarkistus Sanityn pääversiopäivityksessä (merkintä docs/07:ään). |
| Liite jää julkiseksi Sanityn CDN:ään, vaikka lohko poistetaan | Varoitus kentässä ja poisto-ohje docs/09:ssä. |
| Alatunnisteen sisältö muuttuu kävijälle (Uutisarkisto, Tapahtumat ja Kuvagalleria jäävät pois) | Päätöksen 7.10. mukaista. Ruudukko ja 320 px leveys testataan. |
| Kenttien uudelleennimeäminen vanhentaa isän muistikuvat | Kuvauksissa on väliaikaisesti "(Aiemmin kentän nimi oli Polku.)", ja opas päivitetään samassa commitissa. |

---

## Liite A. Riippumattoman kriitikon löydökset (8.10.2026)

> Käsitellään ennen toteutusta: jokainen vakava löydös korjataan suunnitelmaan tai perustellaan, miksi ei.

**Arvio:** Suunnitelma on pääosin hyvin perusteltu, ja tarkistamani väitteet pitävät koodia ja productionia vasten:
- structure.ts:ssä ei ole .id()-kutsuja.
- lib/linkki.ts:ssä ei ole tuonteja.
- LinkButton on rivillä 85.
- JULKINEN_RAVINTOLA on rivillä 151.
- Webhook lukee vain _type- ja slug-kentät. Webhookissa on includeDrafts:false ja apiVersion v2021-03-25, joten delta::operation() ja before() toimivat.
- Productionissa on 8 sivua. Osiosivujen id-törmäyksiä ei ole: sivu-klubi ja sivu-klubi-palloveikkaus ovat olemassa, muut 28 eivät.
- Navigaatiossa on 16 linkkiä.
- Tekstilinkkejä on 31, joista 12 on sisäisiä. P5:n luvut (10 muunnettavaa ja 21 jäävää) täsmäävät.
- Pakettien versiot täsmäävät: groq-js 1.30.3, @sanity/webhook 4.0.4 (encodeSignatureHeader löytyy) ja rxjs 7.8.2.
- DuplicateActionin mapDocument (@beta) ja presentationin funktiomuotoinen locations ovat olemassa Sanity 5.31.2:ssa.

Kaksoisluku, deploy → patch -järjestys, varmuuskopioiden käyttö ja suunnitelmassa jo tehdyt karsinnat ovat kestäviä.

Ennen toteutusta pitää korjata neljä asiaa:
1. Osiosivujen siemen muuttaisi noin 15 sivun Google-kuvauksen, ja suunnitelman oma testi kaatuisi.
2. Webhookin aiemmatPolut-kirjoitus voi kadottaa vanhan osoitteen kolmella tavalla: puuttuva luonnos, kilpailutilanne julkaisun kanssa ja rinnakkaiset ajot.
3. Askeleen 9 ohje 'tee ensin ohjaus' ei onnistu askeleen 8 omilla tarkistuksilla, ja nykyinen osoite puuttuu listasta.
4. Liitteiden ja 'ei näy sivustolla' -kenttien tietosuojateksti on väärä julkisessa datasetissä. Lisäksi orpojen tiedostojen siivous puuttuu.

Pienemmistä:
- options.insertMenu ei vaikuta tekstieditoriin.
- Kuvasarjan asettelu ei toimi.
- Väärä npm-skriptin nimi (verify:content-routes).
- Linkit-tagi tyhjentää koko sivuston välimuistin.

Ylisuunnittelua on lähinnä askeleissa 10 ja 11. Merkit toistavat Sanityn omaa tilanäkymää, eikä kiintiörivillä ole todennettua pohjaa. Kokonaisuus pysyy isälle ymmärrettävänä, ja askelten tiedostokonfliktit on rajattu oikein.

### Vakavat

**K1. Askel 3: ratkaiseOsioSivu, osioSivuSiemen, testi 5 ja P3**
- Ongelma: Kun dokumentti on olemassa, sääntö antaa description = seoDescription ?? lead. Siemen ei kuitenkaan sisällä seoDescriptionia. Tarkistin koodista, että arkiston etusivulla ja useimmilla alasivuilla meta-kuvaus on eri teksti kuin johdanto: esim. jalkapalloarkisto/page.tsx:36 vs. :39, mestarit/page.tsx:21 vs. :23 ja huuhkajat/page.tsx:38 vs. :40. Kun P3 on ajettu, noin 15 sivun Google-kuvaus vaihtuu johdannoksi, joka on yli 160 merkkiä ja katkeaa. Lisäksi suunnitelman oma testi 5 ('Ei näkyvää muutosta': siemen = null) kaatuu näillä sivuilla, eli suunnitelma on tässä ristiriidassa itsensä kanssa.
- Korjaus: osioSivuSiemen asettaa seoDescription = oletus.description aina, kun se on olemassa ja eroaa oletus.leadistä. Silloin isä näkee tekstin välilehdellä Hakukoneet ja jako ja voi muokata sitä. Pidä testi 5 ennallaan ja lisää siihen vertailu nimenomaan arkiston sivuille. Vaihtoehtoinen sääntö description = t(seoDescription) ?? oletus.description ?? lead ei sovi, koska isän muokkaama Tiivistelmä ei silloin koskaan päätyisi kuvaukseksi.

**K2. Askel 8: webhookin tallennaAiempiOsoite**
- Ongelma: Kolme tapaa, joilla vanha osoite voi kadota hiljaa. (1) Saman transaktion patch luonnokseen, jota ei ole olemassa, kaataa koko transaktion. Julkaisun jälkeen luonnosta ei yleensä ole, joten tämä on tavallisin tapaus. (2) Kilpailutilanne: isä avaa luonnoksen ennen kuin webhook ehtii patchata. Luonnoksesta puuttuu silloin uusi aiemmatPolut-arvo, ja seuraava julkaisu korvaa julkaistun version, jolloin vanha polku häviää. (3) Kaksi nopeaa julkaisua (A→B ja B→C) ajavat kaksi webhookia rinnakkain. Molemmat lukevat listan ja tekevät setin, jolloin toinen polku katoaa (lost update). Webhookissa on includeDrafts:false ja apiVersion v2021-03-25 (tarkistettu hooks-rajapinnasta), joten delta::operation() ja before() toimivat.
- Korjaus: Hae ensin, mitkä id:t ovat olemassa (julkaistu ja luonnos), ja patchaa vain ne. Käytä atomista muotoa setIfMissing({aiemmatPolut: []}) + insert('after', 'aiemmatPolut[-1]', [vanha]) + unset('aiemmatPolut[@ == "<uusi>"]') tai ifRevisionId ja uudelleenyritystä, ei koko listan settiä. Lisää projektioon ennen.aiemmatPolut. Jos jokin ennen-listan polku puuttuu nykyisestä, webhook palauttaa sen (itsekorjaava). Testaa tämä yhdistämissääntö tiedostossa test-ohjaukset.ts ja lisää kilpailutilanne e2e-askeleeksi.

**K3. Askel 9: poiston turva ja ohje 'tee ensin ohjaus'**
- Ongelma: Ohje on mahdoton toteuttaa askeleen 8 tarkistuksilla. Niin kauan kuin dokumentti on olemassa, HEAD palauttaa sen nykyiselle osoitteelle 200, ja lahdeOnVapaa antaa virheen 'Osoitteessa on jo sivu'. Vanhat .htm- ja blogspot-osoitteet hylätään puolestaan 'kiinteänä ohjauksena'. Isä ei siis voi tehdä ohjausta ennen poistoa. Lisäksi vanhatOsoitteet listaa legacyUrl-, blogspot- ja aiemmatPolut-osoitteet, mutta ei dokumentin nykyistä osoitetta. Juuri siihen staattiset ohjaukset (lib/redirects.ts) kuitenkin osoittavat, joten nykyinen osoite on ainoa, jolle isän ohjaus pitää tehdä.
- Korjaus: Dialogi näyttää ensimmäisenä nykyisen osoitteen ja kertoo, että vanhat osoitteet kulkevat sen kautta. Järjestys docs/09:ssä ja dialogissa: 1) poista tai piilota, 2) tee ohjaus nykyisestä osoitteesta (Sivuston asetukset → Ohjaukset ja lyhytosoitteet). Webhook tyhjentää välimuistin, joten HEAD antaa 404 sekunneissa. Lisää e2e-testiin askel poisto → ohjaus.

**K4. Askeleet 4 ja 6: liitetiedostot ja muut 'ei näy' -kentät julkisessa datasetissä**
- Ongelma: Kentän kuvaus 'kuka tahansa, jolla on linkki, voi avata sen' on 26.10. jälkeen väärä. Julkisesta datasetistä kuka tahansa voi listata kaikki tiedostot anonyymisti kyselyllä *[_type == "sanity.fileAsset"]{url, originalFilename}. Listassa ovat myös tiedostot, jotka on poistettu lohkosta tai korvattu, ja storeOriginalFilename paljastaa alkuperäisen nimen (esim. jasenluettelo_2026.pdf). Riskitaulukko käsittelee vain CDN-linkin. Samasta syystä ohjaus.muistiinpano ('ei näy sivustolla') on julkisesti luettavissa.
- Korjaus: Kentän kuvaukseksi: 'Tiedosto on julkinen: se löytyy sivuston tietokannasta, vaikka et linkittäisi sitä.' Lisää yöhuoltoon orpojen fileAssettien siivous (viittaamaton yli 7 päivää; malli tiedostosta arvostelukuvat-siivous.ts, säännöt lib-moduuliin ja testi), älä poista varmuuskopiotiedostoja. Muistiinpanon kuvaukseen: 'Näkyy kaikille, jotka lukevat sivuston tietokantaa. Älä kirjoita henkilötietoja.' Lisää tietosuojaselosteeseen ja docs/09:ään tiedostojen julkisuus.

### Pienet

- Askel 2: kuvasarja.tsx välittää AlbumGridille propin kokonaisena ehdoitta, joten Kuvien muoto -valinta ei vaikuta mihinkään. Pitää olla kokonaisena={stegaClean(asettelu) === "kokonaisena"}. Lisäksi AlbumGridin ul on kovakoodattu muotoon grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 (album-grid.tsx:50), joten myös lg-luokka pitää ehdollistaa.
- Askel 6: options.insertMenu ei vaikuta tekstieditoriin. Tarkistettu sanity 5.31.2:sta: tekstieditorin työkalupalkki rakentaa valikon funktiolla getInsertMenuItems(schemaTypes), joka ei lue optionsia (index.js:33077). Vain taulukkokenttä (array input) lukee insertMenu-asetuksen. Poista asetus suunnitelmasta ja luota järjestykseen ja ikoneihin. Huom: 9 lohkopainiketta voi täyttää työkalupalkin, joten tarkista puhelimen leveys.
- Askel 4, tagi 'linkit': tagi on Headerissa ja Footerissa, eli joka sivun layoutissa. Siksi minkä tahansa yhdeksän tyypin muutos tyhjentää koko sivuston välimuistin parametrilla expire:0 (kävijä odottaa renderöinnin). Tähän kuuluvat myös webhookin automaattiset ravintolan arvosanapatchit. Koska fetchin revalidate on jo 60 s, yksinkertaisin ratkaisu on jättää 'linkit' pois navigaatiosta ja hyväksyä sama minuutin viive kuin tekstilinkeillä. Vaihtoehtoisesti tyhjennä 'linkit' vain slugin muuttuessa tai poistossa, mikä vaatii ennen-projektion. Siirrä silloin webhookin projektiomuutos P8:sta P4:ään.
- Askel 3: osiosivujen haun tagit ['sivu', 'sivu:<slug>'] saavat minkä tahansa sivun ja jokaisen jalkapalloTilaston muutoksen (RIIPPUVAT jalkapalloTilasto → sivu) tyhjentämään kaikki 30 listasivua. Pelkkä 'sivu:<slug>' riittää. Arkiston korttitekstien haulle riittävät slugikohtaiset tagit.
- Askeleet 3 ja P3: npm-skriptiä verify:content-routes ei ole olemassa. Oikea nimi on npm run verify:content (package.json:33). Korjaa askeleen 3 hyväksymiskriteerit ja P3.
- Askel 9: KOPIOSTA_POISTETTAVAT-listaan pitää ottaa myös aiemmatPolut ja muutLegacyUrlit. Muuten kaksi dokumenttia väittää omakseen saman vanhan osoitteen, ja ratkaiseOhjaus valitsee niistä satunnaisesti. Lisäksi listaan kuuluvat blogspot-tiedot, needsReview ja tarkistettavaa, ravintolan automaattinenArvosana sekä uutisen publishedAt (muuten kopio saa vanhan päivän ja menee listassa vuosien taakse). Testaa jokainen kenttä.
- Askel 8, ratkaiseOhjaus: jos useampi dokumentti väittää samaa aiempaa polkua, valinta tarvitsee deterministisen järjestyksen (_updatedAt desc), ja sille tarvitaan testi. Normalisoi lisäksi prosenttikoodaus (decodeURIComponent) ennen vertailua.
- Askel 8, sivun osoitteen muutos: alasivujen slugit ovat erillisiä merkkijonoja. Kun klubi/historia muuttuu muotoon klubi/tarina, alasivu klubi/historia/x jää vanhan polun alle, ja murupolun yläsivu puuttuu. polunMuutosViesti voisi kertoa alasivujen määrän: 'Alasivujen osoitteet eivät muutu, muuta ne erikseen.'
- P5: patch:linkit jättää 21 tekstilinkkiä ilman tyyppi-kenttää, joten Studion radiopainikkeista mikään ei ole valittuna. Aseta tyyppi 'osoite' kaikille vanhoille linkkiobjekteille, myös markDefseille. Aja P5 heti P3:n ja P4:n jälkeen: askeleen 4 sivullaOnValinta-varoitus näyttää muuten navigaatiossa 16 keltaista varoitusta siihen asti.
- Askel 4, alatunniste: <nav className="contents"> on saavutettavuusriski, koska display:contents on WebKitissä pudottanut elementin roolin saavutettavuuspuusta. Rakenna mieluummin yksi nav, jossa on oma ruudukko (lg:col-span-N ja sisempi grid tai subgrid). Tarkista lisäksi VoiceOverilla, ennen kuin askel hyväksytään.
- Askel 4, alatunniste: Uutisarkisto ja Kuvagalleria poistuvat alatunnisteesta. Arkistoon linkitetään /uutiset-sivulta, mutta Galleria on ensimmäisen albumin jälkeen vain etusivun lohkon takana. Lisää docs/09:ään ohje: 'Kun julkaiset ensimmäisen albumin tai tapahtuman, lisää osio valikkoon.'
- Askel 7, kiintiörivi: docs/23 Y4 päättelee vain epäsuorasti, että assetit eivät kuulu laskentaan. Productionissa on 5565 dokumenttia, joista 1721 on sanity.*-tyyppisiä. Vihreä valo voi siis olla väärä. Tarkista sanity.io/manage → Usage ennen 26.10. ja kirjaa tulos. Siihen asti teksti on 'arvio' ja tila enintään huomio, ei ok.
- Askel 7, sivustonTila: piilota tyyppi myös Studion haulta ja viittausvalitsimista (__experimental_omnisearch_visibility: false). Suodata sivustonTila ja varmuuskopio pois jo webhookin filter-ehdossa, kun projektio muutetaan, niin turhat kutsut jäävät pois.
- Askel 6, upotus: renderöi vain tulkitseUpotuksen palauttama src, ei liitettyä HTML:ää. Lisää iframeen sandbox="allow-scripts allow-same-origin allow-forms allow-popups" ja suppea allow-attribuutti. Tämä on lisäturva, jos sallittujen listaan tulee virhe.
- Askel 11: presentationin funktiomuotoinen locations korvaa koko nykyisen objektikartan, joten lehtileike- ja etusivu-resolverit (sanity/presentation.ts:38-49) pitää siirtää dokumentinSijainnit-funktioon ja testata.
- Askel 10, ylisuunnittelu: Sanityn oma tilanäkymä (luonnos tai julkaistu) näyttää jo, onko dokumentti julkaistu, joten 'Ei vielä sivustolla' ja 'Entinen jäsen' toistavat olemassa olevaa tietoa. Pidä vain Ajastettu, Tarkistettava ja Odottaa toista arvioijaa. Lisäksi riskitaulukon tasomerkinnät pitää korjata: document.badges on vakaa (DocumentBadgeComponent), mapDocument on @beta (tarkistettu) ja insertMenu on @alpha.
- Luku 1: notFound-kutsuja on 21, ja ne ovat 18 tiedostossa. Lisäksi klubi-sivu.tsx:19:ssä on yksi kommentti. Korjaa luku. Rakennetesti ohittaa kommentit oikein.
- Askel 10: TAYTA-regex on muotoa /…/gi. Jos sitä käytetään .test()-kutsussa, globaali lippu tekee lastIndexistä tilallisen, ja joka toinen tarkistus voi mennä ohi. Käytä match- tai matchAll-kutsua tai regexiä ilman g-lippua.
