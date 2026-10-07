# 24-liite: Arkkitehtien suunnitelmat (vaihe 2, 8.10.2026)

> Integroitu ja sitova versio on docs/24-vaihe2-toteutus.md. Tämä liite sisältää arkkitehtien yksityiskohdat toteuttajien tueksi. Ristiriitatilanteessa docs/24 voittaa.

---

# A. Listasivut ja osiosivut Studioon (Y22, Y25, Y26, Y27 askeleet 1–2)

**Yhteenveto:** Muutoksen jälkeen isä voi itse muokata Studiossa kaikkien 30 koodireitin otsikon, otsikon alla näkyvän johdannon (Tiivistelmä) ja hakukonetekstit (SEO-otsikko ja SEO-kuvaus). Näitä ovat 24 listasivua, Ravintola-arviot ja Yhteystiedot, joissa koodissa on vain hakukonekuvaus, sekä Klubin neljä pääsivua (Esittely, Toiminta, Hallitus, Palloveikkaus). Sivut löytyvät uudesta Studion kohdasta "Osioiden sivut", ja Klubin sivut lisäksi uudesta "Klubi"-ryhmästä. Klubi-ryhmässä on Studiossa sama rakenne kuin sivustolla: Esittely, Toiminta, Hallitus, Palloveikkaus ja Yhteystiedot. Hallitus- ja Toiminta-sivun johdannot ovat nyt näkyvissä. Hän voi myös:
- muokata jalkapalloarkiston etusivun korttien tekstejä
- tehdä tekstisivun jalkapalloarkiston alle (esim. jalkapalloarkisto/naisten-maajoukkue). Sivu näkyy arkiston etusivulla korttina, ja sivulle voi liittää taulukoita.
- lisätä Klubi-osioon sivun (esim. klubi/jasenyys), joka näkyy Klubin välilehdissä ja "Lisää klubista" -listassa heti, kun hän lisää sen Navigaation Klubi-alavalikkoon
- lisätä jalkapalloarkiston välilehtien loppuun linkin Jalkapallo-alavalikon kautta
- tehdä sivun alle alasivuja, jotka listautuvat yläsivulle automaattisesti

Osioiden sivuja ei voi poistaa, piilottaa, kopioida eikä niiden osoitetta voi muuttaa. Jos dokumentti puuttuu, sivu näyttää koodin oletustekstin, joten sivu ei koskaan hajoa.

Edelleen kehittäjää vaativat:
- uuden listasivun tai reitin tekeminen
- välilehtien ja korttien otsikot (koodissa, kuten valikkonimetkin)
- arkiston koodiosioiden järjestys
- Huuhkajat-osioiden, eurocupien ja mestaruusmaiden alasivujen johdannot (eivät kuulu 24:ään)
- tyhjätilatekstit (tietoinen päätös)
- Litmanen-sivujen otsikot (sisältö tulee pelaaja- ja lehtileikedokumenteista)

Valikon linkit muuttuvat valinnoiksi listasta vasta kokonaisuudessa B. Tämä kokonaisuus luo B:lle viittauskohteet kaikille 13 valikon koodireitille.

**Työmäärä:** 6 päivää

## Nykytila

KOODI (luettu 8.10.2026):
- Kovakoodatut tekstit: 24 näkyvää johdantoa ja 2 pelkkää hakukonekuvausta.
  - Isot vakiot LEAD/TITLE: uutiset/page.tsx:42, tapahtumat/page.tsx:25, ottelut/page.tsx:19 (staattinen `export const metadata`, rivi 25), uutiset/arkisto/page.tsx:27 (staattinen metadata :31), uutiset/tunnisteet/page.tsx:24 (staattinen metadata :28; otsikko "Tunnisteet", metatiedoissa "Uutisten tunnisteet"), ravintolat/odottavat/page.tsx:16-21 (interpoloi VAHIMMAISARVIOIJAT, noIndex), jalkapalloarkisto/arvokisat/page.tsx:36-37, jalkapalloarkisto/stadionit/page.tsx:31-32.
  - Pienet vakiot `title`/`lead`/`description`: galleria/page.tsx:19-20, jalkapalloarkisto/page.tsx:36-39 (hub) ja 15 arkistosivua: eurocupit:32-35, euroopan-paras:20-23, fifa-ranking:20-23, huuhkajat:37-40, jarkytykset:20-23, lupaavat:21-24, maailman-parhaat:20-23, mestarit:20-23, palloliitto:20-23, saavutukset:20-23, tilastot:27-30, ulkomaiset-mestarit:31-34, valmentajat:20-23, vuoden-pelaajat:21-24.
  - Pelkkä hakukonekuvaus: klubi/yhteystiedot/page.tsx:28-29, ravintolat/page.tsx:96-101. Ravintolasivun johdanto lasketaan datasta (`buildLead`, :55), eikä sitä saa kovakoodata (kommentti :47-53).
- Valmis malli on olemassa: Klubin pääsivut hakevat sisältönsä lukitulta sivu-dokumentilta.
  - `KOODIIN_SIDOTUT_SIVUT` (lib/path.ts:126-132) = klubi, klubi/hallitus, klubi/toiminta, klubi/palloveikkaus, tietosuoja.
  - `fetchKlubiSivu` (app/(public)/klubi/_components/klubi-sivu.tsx:25) ja `klubiSivuQuery` (sanity/lib/queries/klubi.ts:47). Otsikko lasketaan `sivu?.title || FALLBACK_TITLE` ja johdanto `tiivistelma || ingress` (hallitus/page.tsx:68-69, toiminta/page.tsx:65-66, klubi/page.tsx:79-80).
  - Lukittu polku on readOnly (sivu.ts:66, contentMeta.ts:102 `koodiinSidottuSlug`). Poisto ja julkaisun peruminen on estetty (sanity/actions/lukittu-sivu.tsx, sanity.config.ts:61-69).
  - Polkutarkistus `tarkistaSivunPolku` (lib/sivupolku.ts:50) ja testi (scripts/test-sivupolku.ts).
- Sitemap jättää pois sivut, joiden polku on STATIC_ROUTES-listassa (app/sitemap.ts:207, 240). /ravintolat/odottavat ei ole siellä, joten sen sivu-dokumentti päätyisi nykyisellä logiikalla sitemapiin.
- Catch-all `generateStaticParams` listaa kaikki sivu-slugit (app/(public)/[...slug]/page.tsx:24, `allSivuSlugsQuery` sanity/lib/queries.ts:73). Siinä ei ole välilehtiä eikä alasivulistausta. Murupolku hakee esi-isäsivut sivu-dokumenteista (:162-178).
- Osionavigaatiot ovat koodissa: `arkistoNav` (18 kohtaa), `klubiNav` (5) ja `litmanenNav` (lib/nav-sections.ts:19-55).
  - Arkiston hubin 17 korttia ovat erillinen koodilista (jalkapalloarkisto/page.tsx:52-171). Kortit voivat erkaantua välilehdistä, ja Litmasen kuvaus on vanhentunut.
  - Klubin "Lisää klubista" johdetaan klubiNavista (klubi/page.tsx:43, 182).
  - SectionNav-käyttöjä on 17 tiedostossa: ArkistoPage, klubi-sivut ja litmanen-sivut.
- Header hakee navigaation (components/layout/header.tsx:14-33: stegaClean + piilotaTyhjat). Navigaatio on merkkijonolinkkejä (sanity/schemas/singletons/navigaatio.ts).
- lib/sivupolku.ts:17-39: `jalkapalloarkisto` on varattu ylätason polku, joten tekstisivua ei voi tehdä arkiston alle. Klubin varatut alapolut ovat erillisessä joukossa. Arkiston kansioista karsinnat/ ja pelaajat/ sisältävät vain [slug]-alikansion.
- Studio (sanity/structure.ts):
  - "Sivun asetukset" sisältää Etusivun, Navigaation, Yhteystiedot ja Varmuuskopiot.
  - "Sivut" on tasainen lista (`lista(S,"sivu")`, :244).
  - "Klubin toiminta" (:248) ja "Hallitus" (:249-279) ovat erillään. Klubi-ryhmää ja osiosivujen kohtaa ei ole.
  - Mallipohjat suodatetaan sanity.config.ts:22-26.
  - DocumentBuilder tukee `.initialValueTemplate(id, params)` (node_modules/sanity/lib/_chunks-dts/types.d.ts:388).
- Välimuisti:
  - Sivu-muutos tyhjentää tagit "sivu" ja "sivu:<slug>", navigaatio tagin "navigaatio" (app/api/revalidate/route.ts:89-91). Uusia RIIPPUVAT-merkintöjä ei tarvita.
  - Kaikki listasivut käyttävät `revalidate = 3600`, ja sanityFetch käyttää välimuistia 60 s (sanity/lib/fetch.ts:104).
- Staattisia (public)-sivuja on 36. Niistä 30 saa osiosivun, ja 6 ei saa: etusivu, uutiset/tunniste (pelkkä uudelleenohjaus) ja neljä Litmanen-sivua.

PRODUCTION (luettu GROQ:lla 8.10.2026, sama tilanne developmentissa):
- 8 sivu-dokumenttia: sivu-english, sivu-klubi, sivu-klubi-palloveikkaus, sen 3 alasivua (arvokisat, maaottelut, veikkausliiga), sivu-tietosuoja ja sivu-toriparkki.
  - Tunnukset noudattavat kaavaa "sivu-" + polku, jossa "/" on korvattu "-":lla.
  - klubi/hallitus- ja klubi/toiminta-dokumentteja ei ole, joten Y25:n johdannot ovat piilossa.
  - Sivuilla ei ole luonnoksia, eikä mikään dokumentti viittaa sivuihin.
- Navigaatio:
  - Jalkapallo: Jalkapalloarkisto, Huuhkajat, Arvokisat, Suomen mestarit, Litmanen, Stadionit. Kaikki ovat arkistoNavissa.
  - Muut päälinkit: Ottelut, Ravintola-arviot, Uutiset.
  - Klubi: Esittely, Toiminta, Hallitus, Palloveikkaus, Yhteystiedot. Täsmälleen sama kuin klubiNav.
  - Välilehtien johtaminen navigaatiosta ei siis muuta mitään näkyvää.
- Tapahtumia, gallerioita ja hallituksen jäseniä on 0 kutakin, klubiToimintoja 9, dokumentteja yhteensä 3847 ja luonnoksia 4.

## Suunnitelma

# A. Osioiden sivut Studioon: toteutussuunnitelma

## 0. Arkkitehtuuripäätös ja perustelu

**Valinta: lukitut `sivu`-dokumentit kiinteillä poluilla (docs/23 "lukitut osiosivut").** Uutta `osiosivu`-tyyppiä ei tehdä.

Perustelut:
1. **Malli on jo käytössä ja testattu.** Klubin 4 pääsivua ja tietosuoja toimivat näin: `KOODIIN_SIDOTUT_SIVUT`, readOnly-polku, poisto- ja piilotusesto, polkutarkistus, `documentRoute` (sivu → /slug), Esikatselun "Näkyy sivulla" -linkki ja verify-content-routes. Kaikki laajenevat automaattisesti, kun lista kasvaa.
2. **B:n linkkiobjekti saa yhden viittauskohteen** (`sivu`) sekä vapaille sivuille että koodireiteille. Valikon 13 koodireittiä saavat viittauskohteen (docs/23 Y17: "Edellytys: valikon 13 koodireittiä tarvitsevat ensin dokumentin").
3. **Isä ei opettele uutta lomaketta.** Listasivuilla turhat kentät piilotetaan, ja lomakkeen alkuun tulee sivukohtainen ohjelaatikko.
4. **Murupolku korjaantuu kaupan päälle.** Catch-all hakee esi-isät sivu-dokumenteista, joten tuleva sivu jalkapalloarkisto/x saa linkitetyn murun "Jalkapalloarkisto".
5. Erillinen tyyppi toisi kaksi rinnakkaista mekanismia: Klubin sivut ovat jo `sivu`-dokumentteja. Lisäksi sille tarvittaisiin omat reititys-, sitemap-, esikatselu- ja linkkihaarat.

Sanityn ohje sallii tunnetut _id:t Structuren hallitsemille singleton-tyyppisille dokumenteille. Osioiden sivut ovat juuri sellaisia, ja repon nykyinen käytäntö on `sivu-klubi`.

**Muut päätökset:**
- **Koodin teksti jää varaksi kenttäkohtaisesti.** Jos dokumenttia tai kenttää ei ole, käytetään oletusta. Varmistus: Tiivistelmä on pakollinen niillä sivuilla, joilla koodissa on johdanto, joten tyhjää johdantoa ei voi julkaista.
- **Tyhjätilatekstejä ei tehdä kentiksi.** Y24 kirjoitti ne jo kävijälle sopiviksi. Tapahtumat ja Galleria piiloutuvat tyhjinä. Arkiston tyhjätilat näkyvät vain, jos kaikki taulukot poistetaan. 24 harvoin näkyvää kenttää olisivat lomakkeella vain kohinaa, ja CLAUDE.md sallii käyttöliittymätekstit koodissa.
- **Välilehtien ja korttien otsikot pysyvät koodissa** navigaationimien tapaan. Kortin **teksti** on Sanityssa (kenttä `korttiteksti`), ja Klubin välilehdet johdetaan navigaatiosta (Y26).
- **Järjestyskenttää sivuille ei tehdä** (Y26 ehdotti sitä):
  - välilehtien järjestys tulee navigaatiosta, jossa sitä muutetaan raahaamalla
  - alasivukorttien järjestys on luontijärjestys, kuten palloveikkauksessa jo nyt.
- **Luontimekanismi:** skripti käyttää `createIfNotExists`-kutsua kiinteillä _id:illä. Semantiikka on sama kuin `--missing`-ajossa, mutta lisäksi tarkistetaan, ettei samalla polulla ole jo muuta dokumenttia. Malli on repon `patch-uutiskategoriat.ts` (kuivaharjoitus, `--vie`, `--production`, automaattinen varmuuskopio).

## 1. Rekisteri: `lib/osiosivut.ts` (uusi, puhdas moduuli)

Ainoa tuonti on `VAHIMMAISARVIOIJAT` tiedostosta `./ravintola-arvosana`, joka sisältää vain tyyppituonteja. Moduuli ei saa tuoda tiedostoja `./path` eikä `./nav-sections`, koska path.ts tuo tämän (kehäriippuvuus).

```ts
export type OsioSivunKentta = "hero" | "ingress" | "body" | "tilastot";
export type StudionRyhma = "klubi" | "uutiset" | "ravintolat" | "jalkapalloarkisto";
export interface OsioSivu {
  slug: string;                 // "uutiset", "jalkapalloarkisto/mestarit"
  ryhma: StudionRyhma;          // Studion "Osioiden sivut" -alaryhmä
  nimi: string;                 // nimi Studion listassa, esim. "Uutiset"
  kentat: readonly OsioSivunKentta[]; // sivulla näkyvät valinnaiset kentät; [] = vain otsikko + johdanto + SEO
  oletus: {
    title: string;
    lead: string | null;        // null = ei koodijohdantoa (johdanto valinnainen)
    description: string | null; // null, kun sama kuin lead
    seoTitle?: string;          // vain kun eroaa otsikosta (tunnisteet)
    kortti?: string;            // arkiston etusivun kortin teksti → korttiteksti-kenttä näkyviin
  };
  ohje?: string;                // sivukohtainen lisäohje Studion ohjelaatikkoon
}
export const OSIOSIVUT: readonly OsioSivu[] = [ /* 30 kpl, taulukko alla */ ];
export type OsioSivuSlug = (typeof OSIOSIVUT)[number]["slug"]; // `as const satisfies`
export const OSIOSIVU_SLUGIT: ReadonlySet<string>;
export function osioSivuId(slug: string): string;        // "sivu-" + slug.replaceAll("/", "-")
export function osioSivu(slug: string | null | undefined): OsioSivu | undefined;
export function johdantoPakollinen(o: OsioSivu): boolean; // o.oletus.lead !== null
export function piilotaKentta(slug: string | undefined, kentta: OsioSivunKentta, arvo: unknown): boolean;
//   true, kun slug on osiosivu, kentta ei ole o.kentat:ssa eikä arvoa ole (olemassa oleva data pysyy näkyvissä)

export interface OsioSivuDoc { _updatedAt?: string|null; title?: string|null; tiivistelma?: string|null; ingress?: string|null;
  korttiteksti?: string|null; seoTitle?: string|null; seoDescription?: string|null }
export interface OsioSivunTekstit { title: string; lead: string | null; description: string | null;
  seoTitle: string; korttiteksti: string | null; updatedAt: string | null; loytyi: boolean }
export function ratkaiseOsioSivu(doc: OsioSivuDoc | null, o: OsioSivu): OsioSivunTekstit;
export function osioSivuSiemen(o: OsioSivu): { _id: string; _type: "sivu"; title: string; slug: { _type: "slug"; current: string };
  tiivistelma?: string; seoTitle?: string; seoDescription?: string; korttiteksti?: string };
export function luokitteleOsioSivut(olemassa: { _id: string; slug: string | null }[]):
  { luotavat: OsioSivu[]; olemassa: OsioSivu[]; ristiriidat: string[] };
```

**`ratkaiseOsioSivu`-säännöt.** Merkintä `t(x)` tarkoittaa trimmattua arvoa, joka on tyhjänä `null`.
- `title = t(doc?.title) ?? oletus.title`
- `lead = t(doc?.tiivistelma) ?? t(doc?.ingress) ?? oletus.lead`
- `description`:
  - kun dokumentti on olemassa: `t(seoDescription) ?? lead ?? oletus.description`
  - kun dokumenttia ei ole: `oletus.description ?? oletus.lead`
  - Tämä täyttää seoFieldsin lupauksen "jos tyhjä, käytetään ingressiä".
- `seoTitle = t(doc?.seoTitle) ?? oletus.seoTitle ?? title`
- `korttiteksti = t(doc?.korttiteksti) ?? oletus.kortti ?? null`
- `loytyi = doc !== null`

`stegaClean` ei kuulu tänne. buildMetadata puhdistaa merkkijonot jo nyt (lib/seo.ts:133).

**`osioSivuSiemen`:** jätä pois avaimet, joiden arvo on undefined. Lisäksi:
- `tiivistelma = oletus.lead`, jos se ei ole null
- `seoDescription = oletus.description`, jos se ei ole null
- `seoTitle = oletus.seoTitle`
- `korttiteksti = oletus.kortti`

**`luokitteleOsioSivut`:**
- Ristiriita syntyy, jos (a) rekisterin _id:llä on dokumentti eri polulla tai (b) rekisterin polulla on dokumentti eri _id:llä.
- Luonnokset: `drafts.`-etuliite poistetaan ennen vertailua.

### Rekisterin sisältö (30 merkintää)

Tekstit **kopioidaan sanatarkasti** mainituista tiedostoista. Merkkijonojen `+`-liitokset yhdistetään, ja vakiot poistetaan sivutiedostoista. Merkintä "desc = lead" tarkoittaa, että `description: null`.

| # | slug | ryhmä | nimi Studiossa | kentat | lähde (title / lead / description) | kortti | ohje |
|---|---|---|---|---|---|---|---|
| 1 | klubi | klubi | Esittely | body, hero | "Klubi" / null / null | – | "Klubin välilehdet ja Lisää klubista -linkit tulevat Navigaation Klubi-alavalikosta." |
| 2 | klubi/toiminta | klubi | Toiminta | body | "Toiminta" / null / null | – | "Toimintamuodot tulevat sivulle automaattisesti (Klubi → Toiminta → Toimintamuodot)." |
| 3 | klubi/hallitus | klubi | Hallitus | body | "Hallitus" / null / null | – | "Nykyiset hallituksen jäsenet tulevat sivulle automaattisesti (Klubi → Hallitus)." |
| 4 | klubi/palloveikkaus | klubi | Palloveikkaus | body, hero, tilastot | PALLOVEIKKAUS_TITLE "Palloveikkaus" / null / null | – | "Veikkausten alasivut (polku klubi/palloveikkaus/…) tulevat sivulle korteiksi." |
| 5 | klubi/yhteystiedot | klubi | Yhteystiedot | – | yhteystiedot/page.tsx:28-30 TITLE / null / DESCRIPTION | – | "Osoite, sähköposti ja some muokataan kohdassa Klubi → Yhteystiedot → Osoite, sähköposti ja some." |
| 6 | uutiset | uutiset | Uutiset | – | "Uutiset" / LEAD :42 / desc = lead | – | "Uutislista tulee automaattisesti. Kun kävijä valitsee kategorian, sivun otsikko ja kuvaus tulevat kategoriasta (Uutiskategoriat)." |
| 7 | uutiset/arkisto | uutiset | Uutisarkisto | – | "Uutisarkisto" / LEAD :27 / desc = lead | – | "Vuodet tulevat sivulle automaattisesti." |
| 8 | uutiset/tunnisteet | uutiset | Uutisten tunnisteet | – | "Tunnisteet" / LEAD :24 / desc = lead; **seoTitle "Uutisten tunnisteet"** | – | "Tunnisteet tulevat sivulle automaattisesti uutisista." |
| 9 | tapahtumat | uutiset | Tapahtumat | – | "Tapahtumat" / LEAD :25 / desc = lead | – | "Tapahtumat tulevat sivulle automaattisesti. Kun yhtään tapahtumaa ei ole, osio on piilossa valikosta ja hakukoneilta." |
| 10 | galleria | uutiset | Galleria | – | galleria :19-21 / desc = lead | – | "Albumit tulevat sivulle automaattisesti. Kun yhtään albumia ei ole, osio on piilossa valikosta ja hakukoneilta." |
| 11 | ottelut | uutiset | Ottelut | – | "Ottelut" / LEAD :19 / desc = lead | – | "Ottelut tulevat sivulle automaattisesti. Seurat valitaan kohdassa Sivuston asetukset → Etusivu → Otteluohjelma-lohko." |
| 12 | ravintolat | ravintolat | Ravintola-arviot | – | TITLE :45 / **null** / metatietojen teksti :98-101 | – | "Jos jätät Tiivistelmän tyhjäksi, sivusto kirjoittaa johdannon itse ravintoloiden määrästä (esim. 'Klubi on arvioinut 573 ravintolaa vuodesta 1997 alkaen…'). Kirjoittamasi teksti korvaa sen." |
| 13 | ravintolat/odottavat | ravintolat | Odottavat toista arvioijaa | – | TITLE / LEAD (VAHIMMAISARVIOIJAT interpoloituna) / desc = lead | – | "Sivu ei näy hakukoneissa. Jos kahden klubilaisen sääntö muuttuu, päivitä myös tämä teksti." |
| 14 | jalkapalloarkisto | jalkapalloarkisto | Jalkapalloarkisto (etusivu) | – | arkistoTitle "Jalkapalloarkisto" / lead :39 / description :36 | – | "Osioiden kortit tulevat sivulle automaattisesti. Kortin teksti muokataan kunkin osion omalla sivulla. Arkiston alle tehdyt omat sivut (polku jalkapalloarkisto/…) tulevat korttien perään." |
| 15–30 | jalkapalloarkisto/{huuhkajat, arvokisat, mestarit, eurocupit, vuoden-pelaajat, euroopan-paras, maailman-parhaat, valmentajat, fifa-ranking, lupaavat, saavutukset, jarkytykset, ulkomaiset-mestarit, palloliitto, stadionit, tilastot} | jalkapalloarkisto | sivun otsikko | – | kunkin page.tsx:n title / lead / description (arvokisat ja stadionit: TITLE/LEAD, desc = lead) | **kyllä**: nykyinen kortin `body` (jalkapalloarkisto/page.tsx:52-171) | "Taulukot tulevat sivulle automaattisesti (Jalkapalloarkisto → Tilastot)." Tilastot-sivulla lisäksi: "Kokonaan oman tekstisivun voit tehdä polulle jalkapalloarkisto/…" |

Yhteistä kaikille riveille:
- Studion ryhmät ovat merkinnässä 6–11 "Uutiset, tapahtumat ja ottelut".
- `ohje`-teksteissä mainitut Studion nimet ovat lopullisia (ks. §4).
- Litmasen kortti jää koodiin, koska Litmanen ei ole osiosivu. Kortin teksti korjataan muotoon "Jari Litmasen ura, lehtileikkeet, patsas ja loukkaantumiset."

**lib/path.ts:** `KOODIIN_SIDOTUT_SIVUT = [...OSIOSIVUT.map((o) => o.slug), TIETOSUOJA_SLUG]` (31 kpl).
- Vakiot KLUBI_SIVU_SLUG ym. säilyvät, ja testi varmistaa, että ne löytyvät rekisteristä.
- Klubisivujen `FALLBACK_TITLE`-vakiot korvataan muodolla `osioSivu(SLUG)!.oletus.title`.

## 2. Sanity-skeema: `sanity/schemas/documents/sivu.ts`

Apuri: `const slugOf = (d?: SanityDocumentLike) => (d?.slug as {current?: string} | undefined)?.current;`

1. **Uusi ensimmäinen kenttä `osionOhje`** (string, ei dataa):
   - `title: "Tietoa sivusta"`, `readOnly: true`, `group: "sisalto"`
   - `hidden: ({document}) => !osioSivu(slugOf(document))`
   - `components: { input: OsioSivunOhje }`
   - Komponentti on tiedostossa `sanity/components/osiosivu/OsioSivunOhje.tsx`:
     - lukee polun: `useFormValue(["slug","current"])`
     - piirtää `<Card tone="primary" padding={3} radius={2} border>` ja sen sisään `<Stack space={3}><Text size={1}>…</Text></Stack>`
   - Perusteksti: "Tämä on sivuston osion sivu osoitteessa /{slug}. Sivun lista tai taulukot tulevat automaattisesti. Tässä muokkaat otsikkoa, Tiivistelmää (näkyy otsikon alla johdantona) ja hakukonetekstejä (välilehti SEO). Sivua ei voi poistaa eikä sen osoitetta muuttaa."
   - Perustekstin perään tulee `o.ohje`, kun se on annettu.
   - Ei vuorovaikutteisia elementtejä. Sanity UI:n värit täyttävät kontrastivaatimuksen.
2. **title** pysyy ennallaan (pakollinen).
3. **slug:**
   - Kuvaus: "… Osioiden sivujen (esim. /uutiset), Klubin pääsivujen ja tietosuojaselosteen polut on lukittu, koska sivusto hakee ne polun perusteella."
   - Validointi ennallaan. Lista laajenee automaattisesti.
4. **kieli:** `hidden: ({document}) => Boolean(osioSivu(slugOf(document)))`
5. **tiivistelma:** käytetään `tiivistelmaField("sisalto")`, ja validointi korvataan:
   ```ts
   validation: (rule) => [
     rule.max(300).warning("Suositus: alle 300 merkkiä — tiivistelmä, ei johdanto."),
     rule.custom((arvo, { document }) => {
       const o = osioSivu(slugOf(document));
       return o && johdantoPakollinen(o) && !String(arvo ?? "").trim()
         ? "Tiivistelmä on tällä sivulla pakollinen: se näkyy otsikon alla johdantona ja hakukoneissa."
         : true;
     }),
   ]
   ```
6. **Uusi `korttiteksti`** (heti tiivistelmän jälkeen):
   - `type: "text"`, `rows: 2`, `group: "sisalto"`
   - `title: "Teksti arkiston etusivun kortissa"`
   - `description: "Yksi lyhyt virke, joka näkyy Jalkapalloarkiston etusivulla tämän osion kortissa. Jos jätät tyhjäksi, käytetään sivuston oletustekstiä."`
   - `validation: (r) => r.max(140).warning("Suositus: alle 140 merkkiä, kortti on pieni.")`
   - `hidden: ({document, value}) => !osioSivu(slugOf(document))?.oletus.kortti && !value`
7. **hero, ingress, body ja tilastot:** kullekin `hidden: ({document, value}) => piilotaKentta(slugOf(document), "<kenttä>", value)`. Vapailla sivuilla kaikki näkyvät kuten ennen.
8. **preview:** `subtitle: osioSivu(subtitle) ? \`Osion sivu · /${subtitle}\` : …`
9. **`sanity/actions/lukittu-sivu.tsx`:** lukittujen sivujen estoon lisätään `duplicate`, sanity.config.ts:n sivu-haarassa `action === "delete" || "unpublish" || "duplicate"`. Kopio toisi samalla polulla dokumentin, jonka polku hylätään.
10. **Mallipohja `lukittu-sivu`** (sanity.config.ts `schema.templates`). Pohja lisätään suodatetun listan perään, ja `newDocumentOptions` piilottaa sen globaalista Luo-valikosta (`templateId !== "lukittu-sivu"`).
    ```ts
    { id: "lukittu-sivu", title: "Osion sivu", schemaType: "sivu",
      parameters: [{ name: "slug", type: "string" }],
      value: ({ slug }: { slug: string }) => { const o = osioSivu(slug); const s = o ? osioSivuSiemen(o) : null;
        return { title: s?.title, slug: { _type: "slug", current: slug }, tiivistelma: s?.tiivistelma, korttiteksti: s?.korttiteksti }; } }
    ```
    Pohja täyttää lomakkeen koodin teksteillä, jos dokumentti puuttuisi datasetistä, esimerkiksi tuoreessa developmentissa.
11. **`jalkapalloTilasto`, kategorian "muu" kuvaus (Y27 askel 1):** "Muu tilasto saa oman sivun osoitteeseen /jalkapalloarkisto/tilastot/… Kokonaan oman tekstisivun arkistoon voit tehdä Sivuihin polulle jalkapalloarkisto/… ja lisätä siihen taulukoita."

## 3. Polkusäännöt (Y27 askel 2): `lib/sivupolku.ts`

- Poista `"jalkapalloarkisto"` joukosta `VARATUT_YLATASON_POLUT`.
- Uusi `VARATUT_ARKISTON_POLUT: ReadonlySet<string>` = jalkapalloarkisto/ + kukin kansio: arvokisat, eurocupit, euroopan-paras, fifa-ranking, huuhkajat, jarkytykset, karsinnat, litmanen, lupaavat, maailman-parhaat, mestarit, palloliitto, pelaajat, saavutukset, stadionit, tilastot, ulkomaiset-mestarit, valmentajat, vuoden-pelaajat.
- `tarkistaSivunPolku`:
  1. Lukitut sivut hyväksytään ensin, kuten nyt.
  2. Sen jälkeen silmukka käy läpi joukot `[...VARATUT_KLUBIN_POLUT, ...VARATUT_ARKISTON_POLUT]` ehdolla `slug === v || slug.startsWith(v + "/")`.
- Tulos: `jalkapalloarkisto/naisten-maajoukkue` kelpaa. Muotoja `jalkapalloarkisto/mestarit/x`, `jalkapalloarkisto/karsinnat` ja `jalkapalloarkisto/pelaajat` ei hyväksytä. `jalkapalloarkisto` kelpaa, koska se on lukittu.
- Uusi vienti D:lle: `export function onKoodinPolku(polku: string): boolean`. Palauttaa true, kun polku on lukittu sivu, ylätason varattu tai varattu alapolku.
- Tiedostojen `docs/09` ja `sivu.ts` slug-kuvaukset päivitetään.

## 4. Studion rakenne: `sanity/structure.ts`

Apuri:
```ts
const lukittuSivu = (S: StructureBuilder, slug: string, otsikko?: string) =>
  S.listItem().id(osioSivuId(slug)).title(otsikko ?? osioSivu(slug)!.nimi).icon(DocumentIcon)
    .child(S.document().schemaType("sivu").documentId(osioSivuId(slug)).initialValueTemplate("lukittu-sivu", { slug }));
```

Uusi järjestys:
1. Tehtävät sinulle (E:n)
2. **Sivuston asetukset**, nimetty uudelleen. Sisältö: Etusivu, Navigaatio, Varmuuskopiot. Yhteystiedot siirtyy Klubiin.
3. Tarkistettavat
4. — erotin —
5. Uutiset, Uutiskategoriat, Kommentit ja veikkaukset, Ottelut, Tapahtumat, Galleria-albumit
6. **Sivut (omat sivut)**:
   ```ts
   S.documentList().title("Sivut").schemaType("sivu")
     .filter(`_type == "sivu" && !(slug.current in $lukitut) && !(defined(slug.current) && string::startsWith(slug.current, "klubi/palloveikkaus/"))`)
     .params({ lukitut: [...OSIOSIVU_SLUGIT] })
     .initialValueTemplates([S.initialValueTemplateItem("sivu")])
   ```
   Tietosuoja jää tähän, koska sitä ei ole OSIOSIVU_SLUGIT-joukossa. `defined`-suoja tarvitaan, koska `!null` suodattaisi polut puuttuvat luonnokset pois.
7. — erotin —
8. **Klubi** (`UsersIcon`, Y25), korvaa kohdat "Klubin toiminta" ja "Hallitus":
   - Esittely → `lukittuSivu(S, "klubi", "Esittely")`
   - Toiminta → lista: `lukittuSivu(S,"klubi/toiminta","Toiminta-sivun otsikko ja johdanto")`, `lista(S,"klubiToiminta","Toimintamuodot")`
   - Hallitus → lista: `lukittuSivu(S,"klubi/hallitus","Hallitus-sivun otsikko ja johdanto")`, Nykyinen hallitus, Entiset jäsenet (nykyiset määritykset siirretään sellaisinaan)
   - Palloveikkaus → lista: `lukittuSivu(S,"klubi/palloveikkaus","Palloveikkaus-sivu")` ja "Veikkausten alasivut", joka on documentList, schemaType sivu, filter `_type == "sivu" && defined(slug.current) && string::startsWith(slug.current, $etuliite)`, params `{etuliite:"klubi/palloveikkaus/"}`, defaultOrdering `_createdAt asc`
   - Yhteystiedot (EnvelopeIcon) → lista: "Osoite, sähköposti ja some" (`S.document().schemaType("yhteystiedot").documentId("yhteystiedot")`), `lukittuSivu(S,"klubi/yhteystiedot","Yhteystiedot-sivun otsikko ja johdanto")`
9. — erotin —
10. Ravintolat, Jalkapalloarkisto (ennallaan)
11. **Osioiden sivut** (`DocumentsIcon`), lapsilistan otsikko "Osioiden sivut: otsikot ja johdannot". Alaryhmät rekisterin järjestyksessä, ja kunkin kohdat ovat `lukittuSivu(S, o.slug)`:
    - Klubi
    - Uutiset, tapahtumat ja ottelut
    - Ravintolat
    - Jalkapalloarkisto (17)

`sanity/structure.ts`:n kommenteissa ja docs/05 §"Singletonien hallinta" nimi "Sivun asetukset" vaihdetaan muotoon "Sivuston asetukset".

## 5. Sivuston koodi

### 5.1 Haku: `sanity/lib/osiosivu.ts` (uusi)
```ts
export const osioSivuQuery = defineQuery(`*[_type == "sivu" && slug.current == $slug][0]{
  _updatedAt, title, tiivistelma, ingress, korttiteksti, seoTitle, seoDescription }`);
export const osioSivujenKortitQuery = defineQuery(`*[_type == "sivu" && slug.current in $slugit]{ "slug": slug.current, korttiteksti }`);
export async function haeOsioSivu(slug: OsioSivuSlug): Promise<OsioSivunTekstit> {
  const doc = await sanityFetch<OsioSivuDoc | null>({ query: osioSivuQuery, params: { slug },
    tags: ["sivu", `sivu:${slug}`], fallback: null });
  return ratkaiseOsioSivu(doc, osioSivu(slug)!);
}
```
generateMetadata ja sivu kutsuvat tätä kumpikin. Next yhdistää identtiset fetch-kutsut, kuten fetchKlubiSivussa jo nyt.

### 5.2 Listasivut (26 tiedostoa)
Jokaisessa sivutiedostossa:
- vakiot TITLE/LEAD/title/lead/description poistetaan
- `const OSIO = "<slug>" as const`
- `generateMetadata` on async ja käyttää `const s = await haeOsioSivu(OSIO)`
- metatiedot: `buildMetadata({ title: s.seoTitle, description: s.description, path, …nykyiset noIndex-ehdot })`
- sivulla PageHeader tai ArkistoPage: `title={s.title} lead={s.lead}`
- JSON-LD (`collectionPageSchema`/`datasetSchemas`): `title: s.title, description: s.description`

Erikoistapaukset:
- **ottelut, uutiset/arkisto, uutiset/tunnisteet:** `export const metadata` vaihdetaan muotoon `export async function generateMetadata()`. Tarkista ensin `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`.
- **uutiset:** `titleFor(category, page, haku, perus = s.title)` ilman kategoriaa. Kategoriaton kuvaus on `s.description`, ja PageHeader saa `lead={s.lead}`. Kategoria- ja hakulogiikka pysyvät ennallaan.
- **ravintolat:** `lead = s.lead ?? buildLead(facets)` ja `description = s.description`. Oletuksen description on nykyinen metatietojen teksti.
- **ravintolat/odottavat:** `noIndex: true` säilyy.
- **tapahtumat ja galleria:** `noIndex: tyhja` säilyy.
- **arkistosivut (15):** synkroninen `generateMetadata(): Metadata` muuttuu asynkroniseksi. Sivun runko on muuten ennallaan.
- **klubi, toiminta, hallitus, palloveikkaus:** dokumenttihaku (`fetchKlubiSivu`, joka hakee bodyn ja heron) jää. Otsikko ja johdanto lasketaan muodossa `ratkaiseOsioSivu(sivu, osioSivu(SLUG)!)`, jolloin vara ja SEO-säännöt ovat samat kuin muilla. `KlubiSivuPage` saa propsin `tekstit: OsioSivunTekstit` `fallbackTitle`:n tilalle.
- **klubi/yhteystiedot:** `PageHeader title={s.title} lead={s.lead}` (johdanto on uusi ja valinnainen).

### 5.3 Välilehdet navigaatiosta (Y26) ja arkiston lisälinkit (Y27)

**`sanity/lib/navigaatio.ts` (uusi):** `export async function haeNavigaatio(): Promise<NavigationData>`. Funktio hakee navigaation (`navigationQuery`, tags ["navigaatio"], fallback defaultNavigation) ja tekee hrefeille stegaCleanin. Logiikka siirretään tiedostosta header.tsx:14-32 ilman piilotaTyhjat-käsittelyä, jonka Header tekee yhä itse. **B laajentaa tätä funktiota** linkkiobjektien purkamiseen.

**`lib/osionavigaatio.ts` (uusi, puhdas):**
```ts
export type OsionTunnus = "klubi" | "jalkapalloarkisto";
export const OSIOT: Record<OsionTunnus, { polku: string; aria: string; perus: SectionNavItem[]; tapa: "valikko" | "perus+valikko" }> = {
  klubi: { polku: "/klubi", aria: "Klubin osiot", perus: klubiNav, tapa: "valikko" },
  jalkapalloarkisto: { polku: "/jalkapalloarkisto", aria: "Jalkapalloarkiston osiot", perus: arkistoNav, tapa: "perus+valikko" },
};
export function osioPolulle(slugTaiPolku: string): OsionTunnus | null; // "klubi" tai "klubi/…" → klubi; "jalkapalloarkisto…" → jalkapalloarkisto
export function osionValilehdet(osio: OsionTunnus, nav: NavigationData | null): SectionNavItem[];
export function suoratAlasivut<T extends { slug: string }>(rivit: T[], vanhempi: string): T[]; // syvyys täsmälleen +1
```

`osionValilehdet`-algoritmi:
1. `paa` = navigaation päälinkki, jonka normalisoitu polku on `OSIOT[osio].polku`. Normalisointi käyttää `sisainenPolku`-funktiota tiedostosta lib/linkki.ts: query ja hash pois, loppukauttaviiva pois.
2. `lapset` = `paa.children`, joilla on otsikko ja sisäinen polku. Ulkoiset, mailto- ja tel-linkit suodatetaan pois. Tulokseksi `{label, href}`, ja duplikaatit poistetaan normalisoidun polun mukaan.
3. Tapa `valikko` (Klubi): jos `lapset` on epätyhjä, palautetaan `lapset`, muuten `perus`.
4. Tapa `perus+valikko` (Arkisto): `[...perus, ...lapset.filter(ei perus-listassa)]`.

**`components/layout/osion-valilehdet.tsx` (uusi, async-palvelinkomponentti):**
```tsx
export async function haeOsionValilehdet(osio: OsionTunnus) { return osionValilehdet(osio, await haeNavigaatio()); }
export async function OsionValilehdet({ osio, className }: { osio: OsionTunnus; className?: string }) {
  return <SectionNav items={await haeOsionValilehdet(osio)} label={OSIOT[osio].aria} className={className} />;
}
```

Korvattavat käytöt:
- `<SectionNav items={klubiNav} …/>` tiedostoissa klubi/page.tsx, toiminta/page.tsx, toiminta/[slug]/page.tsx, hallitus/page.tsx, yhteystiedot/page.tsx ja klubi-sivu.tsx → `<OsionValilehdet osio="klubi" className="mt-8" />`
- `ArkistoPage` muuttuu async-komponentiksi: `<OsionValilehdet osio="jalkapalloarkisto" />`
- Litmanen-sivut (3), stadionit (2), arvokisat (2) ja pelaaja-profiili.tsx: arkistoNavin tilalle sama komponentti
- klubi/page.tsx:n "Lisää klubista": `(await haeOsionValilehdet("klubi")).filter((i) => i.href !== "/klubi")`
- Etusivun jalkapalloarkisto-block.tsx jää koodilistaan (ei muutosta).

**Yksi arkistolista (Y27 askel 1), `lib/nav-sections.ts`:**
```ts
export interface ArkistonOsio { href: string; valilehti: string; slug?: string /* osiosivu */; kortti?: { otsikko: string; eyebrow: string; categories?: string[]; teksti?: string /* vain Litmanen */ } }
export const ARKISTON_OSIOT: ArkistonOsio[] = [ /* nykyinen arkistoNav-järjestys; kortti-tiedot jalkapalloarkisto/page.tsx:52-171 */ ];
export const arkistoNav: SectionNavItem[] = ARKISTON_OSIOT.map(({ valilehti, href }) => ({ label: valilehti, href }));
```
Yleiskatsauksella ei ole korttia. Litmasella on `kortti.teksti` mutta ei slugia.

### 5.4 Arkiston etusivu: `jalkapalloarkisto/page.tsx`
- `sections` poistetaan, ja kortit luetaan listasta `ARKISTON_OSIOT.filter((o) => o.kortti)`.
- Haetaan rinnakkain:
  - `haeOsioSivu("jalkapalloarkisto")`
  - `arkistoSummaryQuery`
  - `osioSivujenKortitQuery` (slugit = osioiden slugit, tags ["sivu"])
  - `alasivutQuery` (`etuliite: "jalkapalloarkisto/"`, `lukitut: [...KOODIIN_SIDOTUT_SIVUT]`, tags ["sivu"]), joka suodatetaan `suoratAlasivut(rivit, "jalkapalloarkisto")`-kutsulla
- Kortin teksti: rivin korttiteksti, jos se on annettu, muuten `osioSivu(slug)?.oletus.kortti`, muuten `kortti.teksti`.
- Omat sivut tulevat koodiosioiden perään samanlaisina Card-kortteina ilman yläotsaketta: CardTitle = sivun title, CardBody = tiivistelma, `href = toHref(slug)`, `CardArrow label="Avaa sivu"`.
- Merkki "N osiota" sisältää myös omat sivut.

**`sanity/lib/queries.ts`, uusi yleinen alasivukysely:**
```groq
*[_type == "sivu" && defined(slug.current) && string::startsWith(slug.current, $etuliite) && !(slug.current in $lukitut)]
  | order(_createdAt asc, title asc){ _id, title, "slug": slug.current, tiivistelma, "taulukoita": count(tilastot) }
```
`klubiAlasivutQuery` muutetaan aliakseksi tälle. `fetchVeikkaukset` (palloveikkaus/alasivut.ts) välittää parametrin `lukitut: []`, jolloin tulos pysyy ennallaan.

### 5.5 Catch-all: `app/(public)/[...slug]/page.tsx`
- `allSivuSlugsQuery` muutetaan muotoon `*[_type == "sivu" && defined(slug.current) && !(slug.current in $osiosivut)][].slug.current`, params `{ osiosivut: [...OSIOSIVU_SLUGIT] }`. Koodireiteille ei luoda rinnakkaisia staattisia parametreja.
- `const osio = osioPolulle(joinSlug(slug))`. Jos osio on annettu, otsikon jälkeen renderöidään `<OsionValilehdet osio={osio} className="mt-8" />`:
  - ilman heroa samaan Containeriin leadin jälkeen
  - hero-versiossa heron jälkeen uuteen `<Container className="pt-8">`
- **Alasivut (Y26):** rinnakkainen haku `alasivutQuery` (`etuliite: slug + "/"`, `lukitut: KOODIIN_SIDOTUT_SIVUT`, tags ["sivu"]) ja suodatus `suoratAlasivut`. Bodyn jälkeen, ennen Taulukkoja, tulee osio:
  `<section aria-labelledby="alasivut"><h2 id="alasivut" className="font-display text-3xl leading-tight">Lisää aiheesta</h2><ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">`, ja jokainen kortti on Card kuten kohdassa 5.4.
- Murupolku pysyy ennallaan: osiosivut tuovat sen linkit esiin.
- **D:n 404-haara** lisätään `if (!sivu) notFound()` -kohtaan. Tämä kokonaisuus ei koske siihen.

### 5.6 Sitemap: `app/sitemap.ts`
`sivuRows = sivut.filter((row) => row.slug && !OSIOSIVU_SLUGIT.has(row.slug))`. Kommentti päivitetään.

Tämä estää /ravintolat/odottavat-sivun (noindex) ja koodireittien päätymisen sitemapiin kahteen kertaan. Tietosuoja ja vapaat sivut, myös jalkapalloarkisto/…, pysyvät sitemapissa.

### 5.7 Välimuisti ja webhook
Muutoksia ei tarvita:
- Sivu-muutos tyhjentää tagin "sivu", johon kuuluvat listasivut, arkiston kortit ja catch-allin alasivut.
- Navigaation muutos tyhjentää tagin "navigaatio", johon välilehdet kuuluvat.

Kun B tekee navigaatiosta viittauksia, tarvitaan RIIPPUVAT-merkintä `sivu: ["navigaatio"]`. Se on B:n vastuulla.

## 6. Migraatio: `scripts/luo-osiosivut.ts`, npm `luo:osiosivut`

```
npm run luo:osiosivut                          # development, kuivaharjoitus
npm run luo:osiosivut -- --vie                 # development, kirjoitus
npm run luo:osiosivut -- --production          # production, kuivaharjoitus
npm run luo:osiosivut -- --production --vie    # varmuuskopio + luonti + tarkistus
```

1. Client luodaan samoin kuin tiedostossa patch-uutiskategoriat.ts: `sanityWriteToken()`, apiVersion "2025-08-15", `perspective: "raw"`.
2. Haku: `*[_type == "sivu" && (slug.current in $slugit || _id in $idt || _id in $luonnosIdt)]{ _id, "slug": slug.current }`.
3. `luokitteleOsioSivut` tuottaa tulosteen: "Luotavia 28 / 30, jo olemassa 2 (klubi, klubi/palloveikkaus), ristiriitoja 0". Jokainen luotava tulostetaan muodossa `polku · otsikko · johdannon alku 60 merkkiä`.
4. Ristiriita keskeyttää ajon (exit 1) ennen kirjoitusta ja kertoo, mikä dokumentti on polulla.
5. Ilman `--vie` ajo päättyy kuivaharjoitukseen.
6. Productionissa ajetaan `spawnSync("npm", ["run","backup"])`. Jos varmuuskopio epäonnistuu, ajo päättyy eikä mitään kirjoiteta.
7. Kirjoitus on yksi transaktio: `tx.createIfNotExists(osioSivuSiemen(o))` jokaiselle luotavalle ja sitten `commit({ visibility: "sync" })`.
8. Tarkistus:
   - `count(*[_type == "sivu" && slug.current in $slugit && !(_id in path("drafts.**"))]) == 30`
   - kunkin luodun dokumentin `title` ja `tiivistelma` vastaavat siementä
   - Tuloste: "✓ production: 28 osiosivua luotu, 30/30 olemassa." Muuten exit 1.
9. Ajo on idempotentti: uusi ajo kertoo "Ei luotavaa".

**Järjestys:**

1. **development:** toteutus ja `npm run luo:osiosivut -- --vie`. Lisäksi tarkistetaan, että Studio avaa kaikki 30 kohtaa ja että listasivujen tekstit ovat samat kuin ennen.
2. **Varatekstin testi:** pura yksi dokumentti developmentissa, esim. `sivu-galleria` (vain development), tarkista sivu ja luo dokumentti uudelleen skriptillä.
3. **Deploy.** Koodi lukee dokumentin, jos sellainen on, ja muuten oletuksen, joten productionissa mikään ei muutu vielä.
4. **Samana päivänä** ajetaan `npm run luo:osiosivut -- --production` (odotettu tulos 28 luotavaa, 2 olemassa, 0 ristiriitaa) ja sen jälkeen `-- --production --vie`.
5. Ajetaan `npm run verify:content-routes`, `npm run verify:migration` (tarkista, ettei sivujen määrälle ole kiinteää odotusta) ja `npm run test:saavutettavuus`. Lisäksi silmämääräinen tarkistus: /uutiset, /jalkapalloarkisto, /klubi/hallitus ja /ravintolat.
6. **Peruutus:** poista 28 dokumenttia _id:n perusteella (lista skriptin tulosteesta). Koodi palaa oletuksiin. Varmuuskopio on otettu.

Vanhaa kenttää ei poisteta eikä aseteta deprecated-tilaan: koodin oletus jää pysyväksi varaksi.

## 7. Testit

Uudet testit lisätään `npm test` -ketjuun ja CLAUDE.md:n komentotaulukkoon.

**`scripts/test-osiosivut.ts`** (`npm run test:osiosivut`):
1. 30 merkintää, polut ja _id:t uniikkeja. `osioSivuId("klubi/palloveikkaus") === "sivu-klubi-palloveikkaus"`, ja `osioSivuId("klubi") === "sivu-klubi"` vastaa productionin tunnuksia.
2. Jokainen polku on joukossa `KOODIIN_SIDOTUT_SIVUT`, ja `tarkistaSivunPolku(slug) === true`. Joukko sisältää KLUBI_SIVU_SLUG, HALLITUS_SIVU_SLUG, TOIMINTA_SIVU_SLUG ja PALLOVEIKKAUS_SLUG.
3. Jokaiselle polulle on olemassa `app/(public)/<slug>/page.tsx`.
4. Jokainen staattinen `page.tsx` hakemiston app/(public) alla (polussa ei `[`-segmenttejä, `_`-kansiot ohitetaan) on rekisterissä tai poikkeuslistassa `["", "uutiset/tunniste", "jalkapalloarkisto/litmanen", "jalkapalloarkisto/litmanen/lehtileikkeet", "jalkapalloarkisto/litmanen/patsas", "jalkapalloarkisto/litmanen/loukkaantumiset"]`. Uusi koodireitti ei siis jää vahingossa pois.
5. **Ei näkyvää muutosta:** jokaisella merkinnällä `ratkaiseOsioSivu(osioSivuSiemen(o), o)` on sama kuin `ratkaiseOsioSivu(null, o)`, kun kenttiä `loytyi` ja `updatedAt` ei verrata.
6. `ratkaiseOsioSivu`:
   - null → oletukset
   - välilyönneistä koostuva otsikko → oletus
   - tyhjällä tiivistelmällä käytetään ingressiä
   - seoDescription voittaa leadin
   - kun dokumentti on olemassa eikä seoDescriptionia ole, käytetään leadia
   - ravintolat: lead null, kun dokumentilla ei ole tiivistelmää
   - tunnisteet: seoTitle "Uutisten tunnisteet"
   - korttitekstin vara on oletus.kortti
7. `johdantoPakollinen` on false kohteille klubi, klubi/toiminta, klubi/hallitus, klubi/palloveikkaus, klubi/yhteystiedot ja ravintolat, ja true lopuille 24:lle.
8. Oletusten pituudet: lead enintään 300 ja kortti enintään 140 merkkiä. Odottavat-johdanto sisältää luvun `String(VAHIMMAISARVIOIJAT)`.
9. `osioSivuSiemen`:
   - avaimia, joiden arvo on undefined, ei ole
   - seoDescription puuttuu, kun `description === null`
   - korttiteksti on vain arkiston 16 osiolla
   - slug-objektin muoto on `{_type:"slug", current}`
10. `luokitteleOsioSivut`:
    - productionin 8 sivua → 28 luotavaa, 2 olemassa, 0 ristiriitaa
    - `{_id:"sivu-uutiset", slug:"uutiset-vanha"}` → ristiriita
    - `{_id:"x", slug:"uutiset"}` → ristiriita
    - `drafts.sivu-klubi` → olemassa
11. `piilotaKentta`:
    - ("uutiset","body",undefined) → true
    - ("uutiset","body",[…]) → false
    - ("klubi","body",undefined) → false
    - ("toriparkki","body",undefined) → false
12. `ARKISTON_OSIOT`:
    - jokaisella slugillisella on osiosivu, jonka `oletus.kortti` on annettu
    - jokaisella rekisterin jalkapalloarkisto/*-merkinnällä on ARKISTON_OSIOT-rivi
    - arkistoNavin pituus on 18 ja järjestys on ennallaan

**`scripts/test-osionavigaatio.ts`** (`npm run test:osionavigaatio`):
1. Productionin navigaatio fixtuurina (kopio kohdan "nykytila" rakenteesta):
   - klubi → täsmälleen klubiNav (otsikot ja hrefit)
   - jalkapalloarkisto → täsmälleen arkistoNav (ei lisäyksiä)
2. Klubi-alavalikkoon lisätty /klubi/jasenyys tulee välilehdeksi omalle paikalleen.
3. Alavalikon https://-, mailto:- ja tel:-linkit suodatetaan pois.
4. Seuraavissa tapauksissa käytetään klubiNavia:
   - nav null
   - Klubi-päälinkkiä ei ole
   - children null tai tyhjä
5. Arkisto:
   - /jalkapalloarkisto/naisten-maajoukkue lisätään viimeiseksi
   - /jalkapalloarkisto/mestarit/ (loppukauttaviiva) ja /jalkapalloarkisto/mestarit?x=1 eivät duplikoidu
6. `osioPolulle`:
   - "klubi" → klubi
   - "klubi/historia" → klubi
   - "jalkapalloarkisto/naisten" → jalkapalloarkisto
   - "toriparkki" → null
   - "klubikerho" → null (pelkkä etuliite ei riitä)
7. `suoratAlasivut`: vain syvyys +1, ja vanhempi itse jätetään pois.

**`scripts/test-sivupolku.ts`** (päivitys):
- `jalkapalloarkisto/naisten-maajoukkue` ja `jalkapalloarkisto/naisten-maajoukkue/2024` kelpaavat.
- `jalkapalloarkisto/mestarit/x`, `jalkapalloarkisto/karsinnat`, `jalkapalloarkisto/pelaajat`, `jalkapalloarkisto/litmanen/patsas` ja `uutiset/oma` eivät kelpaa.
- Kaikki 31 lukittua kelpaavat, myös `ravintolat/odottavat` ja `uutiset/arkisto`.
- Reittikansiotestissä ohitetaan klubi ja jalkapalloarkisto ylätasolla. Hakemiston `app/(public)/jalkapalloarkisto` reittikansiot tarkistetaan VARATUT_ARKISTON_POLUT-joukkoa vasten samalla tavalla kuin klubi.

**Muut tarkistukset:** `npm run type-check`, `npm run lint` ja `npm run build`. Buildissa ei saa olla catch-all-parametreja koodireiteille.

Lisäksi `npm run test:saavutettavuus` sivuille /, /klubi, /klubi/hallitus, /jalkapalloarkisto ja /uutiset sekä developmentin testisivulle `jalkapalloarkisto/testisivu`, jolla on alasivu. Testisivu poistetaan testin jälkeen.

## 8. Dokumentaatio (samassa muutoksessa)

**docs/09-editor-guide.md:**
- *Studion valikko:* Sivuston asetukset (Etusivu, Navigaatio, Varmuuskopiot), Sivut (omat sivut, esim. säännöt ja tietosuojaseloste), uusi Klubi-ryhmä (Esittely, Toiminta, Hallitus, Palloveikkaus, Yhteystiedot) ja uusi Osioiden sivut. Kaikki maininnat "Sivun asetukset → Yhteystiedot" vaihdetaan muotoon "Klubi → Yhteystiedot → Osoite, sähköposti ja some", ja muut "Sivun asetukset" muotoon "Sivuston asetukset".
- **Uusi luku "Osioiden sivut: otsikko, johdanto ja hakukoneteksti":**
  1. Osioiden sivut → valitse ryhmä ja sivu, esim. Uutiset ja tapahtumat → Tapahtumat.
  2. Muokkaa Otsikkoa ja Tiivistelmää. Tiivistelmä näkyy otsikon alla.
  3. Välilehdellä SEO voit kirjoittaa hakutuloksen tekstin.
  4. Julkaise.

  Luvussa kerrotaan lisäksi:
  - Sivua ei voi poistaa eikä sen osoitetta muuttaa.
  - Välilehtien ja arkiston korttien otsikot pysyvät ennallaan (ne ovat valikkonimiä).
  - Arkiston osion kortin tekstiä muokataan kentässä "Teksti arkiston etusivun kortissa".
  - Ravintola-arvioiden tyhjä Tiivistelmä tarkoittaa, että sivusto laskee johdannon itse.
- *Hallituksen jäsenet ja Klubin toiminta:* johdanto muokataan kohdassa Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto (vastaavasti Toiminta).
- *Valikon muokkaaminen:* lisätään kaksi tietoa:
  - Klubi-alavalikko on samalla Klubi-osion välilehdet ja "Lisää klubista" -lista.
  - Jalkapallo-alavalikkoon lisätty uusi linkki tulee myös arkiston välilehtien loppuun.
- *Uusi sivu:*
  - Sivu polulla jalkapalloarkisto/… tulee arkiston etusivulle korttina. Taulukot lisätään sivun kohtaan Taulukot.
  - Sivu polulla klubi/… näkyy Klubin välilehdissä, kun lisäät sen Klubi-alavalikkoon.
  - Sivun alle tehdyt alasivut (polku `<sivu>/<alasivu>`) listautuvat sivun loppuun otsikolla "Lisää aiheesta".
- *Palloveikkauksen sivut:* sijainti on Klubi → Palloveikkaus → Veikkausten alasivut.
- *Mitä EI saa tehdä:* lukittujen luetteloon lisätään osioiden sivut.
- *Täytä itse:* Hallitus- ja Toiminta-sivun johdanto (vapaaehtoinen).

**Muut dokumentit:**
- **docs/05-content-models.md** §1 `sivu`:
  - osiosivun käsite, kentät `korttiteksti` (text, max 140, vain arkiston osioilla) ja `osionOhje` (ei dataa), pakollinen tiivistelmä osiosivuilla ja `lukittu-sivu`-pohja
  - §"Singletonien hallinta" korjataan vastaamaan structure.ts:ää
- **docs/23-yllapidettavyys.md** §0 "Toteutettu": Y22, Y25, Y26 ja Y27 askeleet 1–2 sekä dokumenttimäärä 28.
- **CLAUDE.md:** komentotaulukkoon `luo:osiosivut`, `test:osiosivut` ja `test:osionavigaatio`.

## 9. Tiedostolista

**Uudet:**
- lib/osiosivut.ts
- lib/osionavigaatio.ts
- sanity/lib/osiosivu.ts
- sanity/lib/navigaatio.ts
- components/layout/osion-valilehdet.tsx
- sanity/components/osiosivu/OsioSivunOhje.tsx
- scripts/luo-osiosivut.ts
- scripts/test-osiosivut.ts
- scripts/test-osionavigaatio.ts

**Muutettavat:**
- Sanity ja Studio:
  - sanity/schemas/documents/sivu.ts
  - sanity/schemas/documents/jalkapalloTilasto.ts (vain kategoriakuvaus)
  - sanity/structure.ts
  - sanity.config.ts
  - sanity/actions/lukittu-sivu.tsx
  - sanity/lib/queries.ts
  - sanity/lib/queries/klubi.ts
- lib/:
  - lib/path.ts
  - lib/sivupolku.ts
  - lib/nav-sections.ts
- Komponentit ja sitemap:
  - components/layout/header.tsx
  - app/sitemap.ts
- Reitit, app/(public)/:
  - [...slug]/page.tsx
  - uutiset/page.tsx, uutiset/arkisto/page.tsx, uutiset/tunnisteet/page.tsx
  - tapahtumat/page.tsx, galleria/page.tsx, ottelut/page.tsx
  - ravintolat/page.tsx, ravintolat/odottavat/page.tsx
  - klubi/page.tsx, klubi/toiminta/page.tsx, klubi/toiminta/[slug]/page.tsx, klubi/hallitus/page.tsx, klubi/yhteystiedot/page.tsx
  - klubi/palloveikkaus/page.tsx, klubi/palloveikkaus/alasivut.ts, klubi/_components/klubi-sivu.tsx
  - jalkapalloarkisto/page.tsx, jalkapalloarkisto/_tilastot/arkisto-page.tsx
  - jalkapalloarkiston 15 alasivua (eurocupit, euroopan-paras, fifa-ranking, huuhkajat, jarkytykset, lupaavat, maailman-parhaat, mestarit, palloliitto, saavutukset, tilastot, ulkomaiset-mestarit, valmentajat, vuoden-pelaajat, arvokisat)
  - jalkapalloarkisto/stadionit/page.tsx ja [slug]/page.tsx, jalkapalloarkisto/arvokisat/[slug]/page.tsx
  - Litmanen-sivut: lehtileikkeet, loukkaantumiset, patsas
  - jalkapalloarkisto/_pelaaja/pelaaja-profiili.tsx
- Testit ja paketti:
  - scripts/test-sivupolku.ts
  - package.json
- Dokumentaatio:
  - docs/09-editor-guide.md
  - docs/05-content-models.md
  - docs/23-yllapidettavyys.md
  - CLAUDE.md

## 10. Riippuvuudet muihin kokonaisuuksiin (yhteenveto)
- **A → B:** A luo viittauskohteet `sivu-<polku>` ja funktion `haeNavigaatio()`. B:n tuotantopatch (navigaation linkit viittauksiksi) ajetaan vasta, kun A:n `luo:osiosivut --production --vie` on ajettu.
- **A ↔ C:** C vaihtaa sivu.bodyn tyypiksi rikasSisalto. Kentän `hidden: piilotaKentta(…,"body",…)`-määrityksen on säilyttävä.
- **A ↔ D:** D:n 404-haara ja A:n välilehdet ja alasivut ovat samassa catch-all-tiedostossa. Sama koskee sivu.ts:ää, jos D lisää sinne kentän aiemmatPolut.
- **A ↔ E:** structure.ts on yhteinen tiedosto. Jos E nimeää kenttiä uudelleen (Y38), esimerkiksi "SEO" → "Hakukoneet ja jako", OsioSivunOhjeen tekstit ja docs/09 päivitetään samassa muutoksessa.

## Tarvitsee muilta

- B (linkkiobjekti): haeNavigaatio() (sanity/lib/navigaatio.ts, A luo) palauttaa B:n laajennuksen jälkeenkin muodon NavigationData = { items: { label: string; href: string | null; children?: { label: string; href: string | null }[] }[] }. Hrefit ovat valmiiksi purettuja merkkijonoja: sisäinen polku `documentHref`-funktiolla tai ulkoinen URL. osionValilehdet ja Header lukevat vain tätä muotoa.
- B: RIIPPUVAT-merkintä `sivu: ["navigaatio"]` tiedostoon app/api/revalidate/route.ts, kun valikko viittaa sivuihin. Polku on lukittu, mutta otsikon tai vapaan sivun polun muutos vaikuttaa valikkoon.
- B: navigaation tuotantopatch ajetaan vasta, kun A:n `npm run luo:osiosivut -- --production --vie` on ajettu. Koodireittien viittauskohteet ovat dokumentteja `sivu-uutiset`, `sivu-ottelut`, `sivu-ravintolat`, `sivu-jalkapalloarkisto`, `sivu-jalkapalloarkisto-huuhkajat` ja niin edelleen (osioSivuId).
- C (lohkot): kun sivu.body vaihtuu rikasSisalto-tyypiksi, A:n `hidden: ({document, value}) => piilotaKentta(slugOf(document), "body", value)` säilytetään. Runko-fragmentin muutos koskee klubiSivuQuery- ja sivuWithAncestorsQuery-kyselyjä. A:n alasivuosio ("Lisää aiheesta") on catch-allissa bodyn jälkeen.
- D (ohjaukset): catch-all-sivun 404-haara (`if (!sivu) notFound()`) on D:n. A muuttaa samaa tiedostoa (välilehdet, alasivut, allSivuSlugsQuery), joten yhdistäminen tehdään järjestyksessä. D:n `aiemmatPolut` ja ohjausdokumentin lähdepolun validointi käyttävät A:n vientiä `onKoodinPolku(polku)` (lib/sivupolku.ts) ja `KOODIIN_SIDOTUT_SIVUT`. Lukittuja sivuja ei ohjata eikä niiden polkua voi ottaa ohjauksen lähteeksi.
- E (tila ja käytettävyys): structure.ts on yhteinen tiedosto. E ei siirrä A:n Klubi-ryhmää, Osioiden sivut -ryhmää eikä Sivut-suodatinta. Y38:n kenttien uudelleennimeämiset ("Polku (slug)" → "Osoite sivustolla", SEO-välilehti) päivitetään samassa muutoksessa OsioSivunOhjeen tekstiin ja docs/09:n osiosivulukuun. Jos E lisää tilamerkit (Y37), merkki "Osion sivu" voidaan johtaa A:n funktiosta osioSivu(slug).

## Tarjoaa muille

- lib/osiosivut.ts: OSIOSIVUT (30 merkintää: OsioSivu { slug, ryhma, nimi, kentat, oletus { title, lead, description, seoTitle?, kortti? }, ohje? }), OsioSivuSlug, OSIOSIVU_SLUGIT: ReadonlySet<string>, osioSivuId(slug) = "sivu-" + slug.replaceAll("/","-"), osioSivu(slug), johdantoPakollinen(o), piilotaKentta(slug, kentta, arvo), ratkaiseOsioSivu(doc, o): OsioSivunTekstit { title, lead, description, seoTitle, korttiteksti, updatedAt, loytyi }, osioSivuSiemen(o), luokitteleOsioSivut(rivit)
- lib/path.ts: KOODIIN_SIDOTUT_SIVUT laajennettuna, 31 kpl (30 osiosivua + tietosuoja). Rajapinta on ennallaan.
- Sanity-dokumentit B:n linkkiobjektin viittauskohteiksi: 28 uutta sivu-dokumenttia kiinteillä tunnuksilla (sivu-uutiset, sivu-uutiset-arkisto, sivu-uutiset-tunnisteet, sivu-tapahtumat, sivu-galleria, sivu-ottelut, sivu-ravintolat, sivu-ravintolat-odottavat, sivu-klubi-hallitus, sivu-klubi-toiminta, sivu-klubi-yhteystiedot, sivu-jalkapalloarkisto, sivu-jalkapalloarkisto-<osio> ×16) sekä olemassa olevat sivu-klubi ja sivu-klubi-palloveikkaus
- sanity/lib/osiosivu.ts: haeOsioSivu(slug): Promise<OsioSivunTekstit>, osioSivuQuery, osioSivujenKortitQuery (defineQuery)
- sanity/lib/navigaatio.ts: haeNavigaatio(): Promise<NavigationData> (stegaClean tehty, tagi "navigaatio"). Header ja välilehdet käyttävät tätä, ja B laajentaa sen purkamaan linkkiobjektit.
- lib/osionavigaatio.ts: OsionTunnus ("klubi" | "jalkapalloarkisto"), OSIOT, osioPolulle(slug), osionValilehdet(osio, nav): SectionNavItem[], suoratAlasivut(rivit, vanhempi)
- components/layout/osion-valilehdet.tsx: <OsionValilehdet osio className /> ja haeOsionValilehdet(osio)
- lib/nav-sections.ts: ARKISTON_OSIOT: ArkistonOsio[] { href, valilehti, slug?, kortti? { otsikko, eyebrow, categories?, teksti? } } (yksi lista välilehdille ja korteille); arkistoNav johdetaan siitä
- lib/sivupolku.ts: VARATUT_ARKISTON_POLUT; tarkistaSivunPolku (jalkapalloarkisto/* sallittu, paitsi koodin alapolut); onKoodinPolku(polku): boolean D:n ohjausvalidointiin
- sanity/lib/queries.ts: alasivutQuery (parametrit $etuliite, $lukitut) yleisenä alasivukyselynä; klubiAlasivutQuery on sen alias
- Studio: mallipohja "lukittu-sivu" (parametri slug); structure-ryhmät "Klubi" ja "Osioiden sivut"; "Sivun asetukset" nimetään uudelleen "Sivuston asetukset" (Etusivu, Navigaatio, Varmuuskopiot); Sivut-lista suodatettuna (ilman osiosivuja ja palloveikkauksen alasivuja)
- sivu-skeeman uudet kentät: korttiteksti (text, enintään 140, vain arkiston osioilla), osionOhje (vain näyttö, ei dataa)

## Tuotantomuutokset

- Ennen kirjoitusta: deploy koodista, joka lukee dokumentin, jos sellainen on, ja käyttää muuten koodin oletustekstiä. Koodi ei kirjoita productioniin, eikä näkyvä teksti muutu.
- Kuivaharjoitus `npm run luo:osiosivut -- --production` (vain luku). Odotettu tulos: 28 luotavaa, 2 olemassa (sivu-klubi, sivu-klubi-palloveikkaus), 0 ristiriitaa. Jos ristiriitoja on, ajo pysähtyy.
- `npm run luo:osiosivut -- --production --vie`: ajaa ensin automaattisesti `npm run backup` (varmuuskopio kuvineen kansioon varmuuskopiot/) ja keskeyttää, jos kopio epäonnistuu.
- Sama komento luo yhdessä transaktiossa 28 julkaistua sivu-dokumenttia createIfNotExists-kutsulla, jonka semantiikka on sama kuin --missing-ajon. Tunnukset: sivu-klubi-toiminta, sivu-klubi-hallitus, sivu-klubi-yhteystiedot, sivu-uutiset, sivu-uutiset-arkisto, sivu-uutiset-tunnisteet, sivu-tapahtumat, sivu-galleria, sivu-ottelut, sivu-ravintolat, sivu-ravintolat-odottavat, sivu-jalkapalloarkisto ja 16 sivua sivu-jalkapalloarkisto-*. Sisältö on nykyiset koodin tekstit (title, tiivistelma, seoTitle/seoDescription vain kun ne eroavat, korttiteksti 16 arkistosivulla).
- Olemassa olevia dokumentteja ei patchata eikä poisteta. Dokumenttien määrä kasvaa 3847 → 3875, mikä mahtuu hyvin Free-tason 10 000 dokumentin rajaan.
- Skripti tarkistaa lopuksi: 30/30 polkua löytyy julkaistuna, ja luotujen dokumenttien otsikot ja johdannot vastaavat koodin oletuksia.
- Peruutus tarvittaessa: poistetaan 28 luotua dokumenttia tunnuksen perusteella (tunnukset ovat skriptin tulosteessa). Koodi palaa oletusteksteihin, ja varmuuskopio on olemassa.
- Ennen productionia sama ajo tehdään developmentiin (`npm run luo:osiosivut -- --vie`, 28 dokumenttia) ja varatekstin testi vain developmentissa.

## Riskit

- Isä muuttaa osiosivun otsikon, mutta murupolku, välilehti ja arkiston kortin otsikko pysyvät koodin nimissä, ja syntyy hämmennystä. Lievennys: ohjelaatikko ja docs/09 kertovat, että välilehdet ja korttien otsikot ovat valikkonimiä. Klubin välilehtien nimiä muutetaan Navigaatiossa.
- Klubin välilehdet johdetaan valikosta. Jos isä poistaa Klubi-alavalikosta kohdan, se katoaa myös välilehdistä. Tämä on tarkoituksellista, ja docs/09 kertoo sen. Jos koko Klubi-päälinkki poistetaan tai sen osoite muuttuu, käytetään koodin klubiNav-listaa (testattu).
- Kenttien piilotus riippuu polusta. Koska osiosivujen polku on lukittu, piilotus pysyy vakaana. Olemassa oleva data näkyy aina, koska kenttä piilotetaan vain, kun siinä ei ole arvoa.
- Rinnakkaisten kokonaisuuksien yhdistämisristiriidat tiedostoissa sivu.ts, structure.ts, [...slug]/page.tsx ja header.tsx (B, C, D ja E koskevat samoihin). Lievennys: A toteutetaan ensin (docs/23:n järjestys osiosivut → linkit → lohkot → ohjaukset), ja muut tekevät muutoksensa A:n päälle.
- Jos deployn ja luontiajon väliin jää aikaa ja isä avaa Studiossa osiosivun, jota ei vielä ole, mallipohja lukittu-sivu luo sen koodin teksteillä. Silloin luontiajo ohittaa dokumentin, mikä on oikein. Ristiriitaa tulee vain, jos samalla polulla on dokumentti eri tunnuksella, ja silloin skripti pysähtyy.
- Next 16 -muutokset: kolme sivua vaihtaa staattisen metadatan generateMetadata-funktioon, ja ArkistoPage muuttuu async-komponentiksi. Toteuttajan on luettava node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md ja 08-caching.md ja ajettava npm run build ennen deployta.
- Ravintolasivun johdanto: kun isä kirjoittaa Tiivistelmän, laskettu ravintolamäärä katoaa johdannosta. Tämä on tarkoituksellista, ja asia kerrotaan ohjelaatikossa.
- Odottavat-sivun teksti sisältää säännön "2 klubilaista" kiinteänä. Jos sääntö muuttuu (Y31: pysyvä), teksti pitää päivittää käsin. Ohjelaatikko muistuttaa tästä.
- Isä voi tehdä arkiston alle sivun, jonka nimi on lähellä koodiosiota (esim. jalkapalloarkisto/mestarit-2). Se on sallittua. Polku jalkapalloarkisto/mestarit itse on varattu, ja Studio estää sen.

## Avoimet päätökset

- Huuhkajat-osioiden (7), eurocup-kilpailujen (6) ja ulkomaisten mestaruusmaiden (3) alasivujen johdannot ovat yhä koodissa (lib/huuhkajat-osiot.ts, eurocupit/competitions.ts, lib/ulkomaiset-mestarit.ts). Ne eivät kuulu päätettyyn 24 listasivuun. Siirretäänkö ne myöhemmin samalla rekisterimallilla (noin 0,5 päivää, 16 dokumenttia lisää), vai jäävätkö ne koodiin?

---

# B. Linkit viittauksiksi ja alatunniste valikosta (docs/23 Y17 askeleet 2–3, Y23)

**Yhteenveto:** Toteutuksen jälkeen isä voi tehdä seuraavaa: (1) Linkkiä tehdessään hän valitsee "Mihin linkki vie?" kolmesta vaihtoehdosta: Sivuston sivu (valitaan listasta kirjoittamalla nimen alkua), Muu osoite (https://, mailto:, tel:) tai Tiedosto (PDF, Word tai Excel). Sama lomake on valikossa, sen alavalikoissa, etusivun pikalinkeissä, Esittely- ja Jalkapalloarkisto-lohkon napissa, klubin toiminnan vuosilinkeissä ja tekstieditorin linkkipainikkeessa. Tekstieditorissa on edelleen vain yksi linkkipainike. (2) Kun sivun tai uutisen polku muuttuu, viittauksella tehty linkki seuraa sitä itsestään. Kirjoitusvirhettä ei voi syntyä. (3) Alatunniste seuraa päävalikkoa: alavalikolliset kohdat näkyvät omina sarakkeinaan ja muut kohdat Sivusto-sarakkeessa. Yhteystiedot, Tietosuojaseloste ja Ylläpito pysyvät paikallaan, ja tyhjät osiot piiloutuvat kuten ennenkin. (4) Studio varoittaa, jos valittua sivua ei ole vielä julkaistu, jos uutinen on ajastettu tai jos "Muu osoite" vie sivulle, jolle olisi parempi valita Sivuston sivu. Jos isä yrittää poistaa sivun tai perua sen julkaisun, kun siihen linkitetään, suomenkielinen ikkuna näyttää, mistä siihen viitataan. Opas kertoo, miten tilanteessa toimitaan.

Edelleen ei onnistu: Sivuston sivu -valinnalla ei voi linkittää sivun kohtaan (#ankkuri), kyselyyn (?sivu=2), yksittäiseen taulukkoon tai koodireittiin, jolla ei ole dokumenttia (esim. /uutiset/arkisto/2016). Niihin käytetään Muu osoite -vaihtoehtoa. Klubin ja arkiston osiovälilehdet ovat yhä koodissa (Y26 ja Y27 kuuluvat vaiheeseen 3). Sivua, johon linkitetään, ei voi poistaa, ennen kuin linkki on poistettu tai vaihdettu. Tämä on tarkoituksellista.

**Työmäärä:** 5 päivää

## Nykytila

KOODI (luettu 8.10.2026, main bf05473):
- Linkkikentät ovat merkkijonoja. Valikko: sanity/schemas/singletons/navigaatio.ts:28 (items[].href) ja :49 (children[].href), validointina `linkkiValidointi`. Etusivu: sanity/schemas/singletons/etusivu.ts:72 (heroCtas[].href), :230 (esittely.ctaHref) ja :277 (jalkapalloarkisto.ctaHref, initialValue "/jalkapalloarkisto"). Klubin toiminta: sanity/schemas/documents/klubiToiminta.ts:114-146 (vuodet[].linkki {url: url-tyyppi allowRelative, teksti}). Tekstieditori: sanity/schemas/objects/portableText.ts:31-58, jossa on vain annotaatio `link` {href: url allowRelative, newTab}.
- Validointi: contentMeta.ts:139-148 (`linkkiValidointi`, `valinnainenLinkkiValidointi`), lib/linkki.ts (`tarkistaLinkki` ja `sisainenPolku`, puhdas moduuli, testit scripts/test-linkki.ts) sekä sanity/lib/linkin-kohde.ts (Y17 askel 1: HEAD-pyyntö sivustolle, keltainen varoitus).
- Reitit: lib/path.ts `documentRoute`, `documentHref` ja `TYPE_BASE` (rivit 75-84, ei exportattu). Pelaaja jari-litmanen → /jalkapalloarkisto/litmanen. `routableProjection` sisältää raskaan references()-alikyselyn, jota tarvitaan vain jalkapalloTilastolle.
- GROQ: navigationQuery sanity/lib/queries.ts:25-34, etusivuQuery sanity/lib/queries/etusivu.ts:64 (heroCtas) ja :82 (ctaHref), klubiToimintaBySlugQuery sanity/lib/queries/klubi.ts:163 (`linkki{ url, teksti }`). Runko-fragmentti sanity/lib/queries/kuvat.ts:29 (`..., _type == "imageWithAlt" => {lqip}`) on käytössä 20 kyselykohdassa. ravintolat.ts:416 projisoi `review`-kentän raakana ilman runkoa.
- Renderöinti: components/layout/header.tsx:13-34 (hakee navigaation tagilla "navigaatio", stegaClean hrefeille, piilotaTyhjat) ja header-client.tsx:336 `hasOverviewChild`. components/layout/footer.tsx:23-42 sisältää kovakoodatut sarakkeet Jalkapallo (Ottelut, Uutiset, Jalkapalloarkisto, Uutisarkisto) ja Klubi (Ravintola-arviot, Tapahtumat, Klubista, Kuvagalleria). Alarivillä :163-168 ovat Tietosuojaseloste (TIETOSUOJA_PATH) ja Ylläpito (/studio). Alatunniste hakee vain yhteystiedot. components/portable-text.tsx:74-95 `link` → <a>/<Link>. components/blocks/hero.tsx:63 ja :279-282 (pikalinkit), esittely-block.tsx:21 ja :65, jalkapalloarkisto-block.tsx:60-76 (oletus /jalkapalloarkisto, suodattaa arkistoNavin). app/(public)/page.tsx:40-44 (tags ["etusivu"]) ja :118. app/(public)/klubi/toiminta/[slug]/page.tsx:228-236 (<a href={linkki.url}>).
- Tyhjät osiot: lib/osiot.ts:40 `piilotaTyhjat` (href-pohjainen, toimii myös ratkaistuille hrefeille) ja sanity/lib/tyhjat-osiot.ts.
- Välimuisti: sanity/lib/fetch.ts asettaa `revalidate: 60` ja tagit. app/api/revalidate/route.ts:28-37 sisältää RIIPPUVAT-taulukon. Webhookin payload on {_type, slug}. Linkin kohteen polun muutos ei tyhjennä valikon tai etusivun välimuistia, mutta 60 sekunnin ikkuna korjaa sen.
- Studio: sanity.config.ts käyttää fiFILocalea, joten poistoikkuna on suomeksi: "Et ehkä voi poistaa “X”, koska seuraavat asiakirjat viittaavat siihen:" + "Poista joka tapauksessa". Virheilmoitus kuuluu: "Virhe tapahtui yrittäessä poistaa tätä dokumenttia. Tämä yleensä tarkoittaa, että muut dokumentit viittaavat siihen." Peru julkaisu toimii samoin. Lukittujen sivujen kääre on sanity/actions/lukittu-sivu.tsx. Palautus varmuuskopiosta (lib/palautus.ts:67 `luonnosVarmuuskopiosta`) kirjoittaa viittaukset sellaisinaan.
- Kovakoodattu varavalikko on lib/defaults.ts:14-45. lib/nav-sections.ts:52 `klubiNav` toistaa Klubi-alavalikon (Y26, ei tämän kokonaisuuden asia).

PRODUCTION (GROQ ja export 8.10.2026, 5569 dokumenttia, luonnoksia navigaatiosta, etusivusta tai klubiToiminnasta 0):
- Navigaatio: 5 päälinkkiä ja 11 alalinkkiä, eli 16 merkkijonoa, kaikki sisäisiä. Productionissa valikon nimi on nyt "Klubi", ei "Klubista". Dokumenttiin osoittaa 4: /klubi ×2 (sivu-klubi), /klubi/palloveikkaus (sivu-klubi-palloveikkaus) ja /jalkapalloarkisto/litmanen (pelaaja-jari-litmanen). Koodireittejä on 12: /jalkapalloarkisto ×2, /huuhkajat, /arvokisat, /mestarit, /stadionit, /ottelut, /ravintolat, /uutiset, /klubi/toiminta, /klubi/hallitus ja /klubi/yhteystiedot. Sivu-dokumentit klubi/toiminta ja klubi/hallitus puuttuvat (A tai Y25 luo ne).
- Etusivu: heroCtas 2 (/uutiset koodireitti, /klubi → sivu-klubi) ja esittely.ctaHref 1 (/klubi). Jalkapalloarkisto-lohkolla ei ole ctaHrefiä.
- klubiToiminta-matkailu: 23 vuosilinkkiä /uutiset/<slug>, ja jokainen vastaa julkaistua uutista (tarkistettu: 0 puuttuu). klubiToiminta-molkky: 1 ulkoinen (https://youtu.be/…).
- Tekstieditorin linkkejä on 31 (markDef `link`): 19 ulkoista (15 uutisissa, 4 tilastoissa) ja 12 sisäistä. Sisäisistä dokumenttiin osoittaa 10: sivu-klubi.body 9 kpl /klubi/toiminta/<slug> ja uutinen-blogspot-2702900233159075591.body 1 kpl /jalkapalloarkisto/arvokisat/em-2008. Koodireitteihin tai ankkureihin osoittaa 2: arvokisa-em-2008.kuvaus /jalkapalloarkisto/arvokisat#em-kisojen-mitalistit ja jalkapalloTilasto-venajan-mestarit.lisatiedot /uutiset/arkisto/2016.
- Yhteensä 74 linkkiä (54 sisäistä ja 20 ulkoista; Y17 sanoi 75, joten yksi on poistunut). Dokumenttiin osoittavia on 39 viidessä dokumentissa: navigaatio 4, etusivu 2, matkailu 23, sivu-klubi 9 ja uutinen 1. Y17:n luku 38 laski /klubin valikossa luultavasti vain kerran. Tapahtumia ja galleria-albumeita on 0. Development on tuore kopio (5569 dokumenttia, samat linkit).

## Suunnitelma

# B. Linkit viittauksiksi ja alatunniste valikosta: toteutussuunnitelma

## 0. Ratkaisun ydin ja perustelut

1. **Yksi kenttäjoukko kaikille linkeille:** `tyyppi` (Sivuston sivu / Muu osoite / Tiedosto), `kohde` (viittaus), `href` (muu osoite) ja `tiedosto` (file). Malli on Sanityn "toggle pattern": radio ja ehdolliset kentät. Joukko on käytössä kahdessa muodossa:
   - **levitettynä** (`...linkkiKentat()`) olemassa olevaan objektiin, jossa on jo tekstikenttä: valikon kohta, alavalikon kohta, etusivun pikalinkki, tekstieditorin linkkiannotaatio `link` ja klubin toiminnan vuosilinkki. Valikossa, pikalinkeissä ja tekstieditorissa vanha kenttä on jo nimeltään `href`, joten **vanha data on suoraan kelvollinen "Muu osoite" -linkki**. Erillistä deprecated-kenttää ei tarvita, eikä 21:tä tekstieditorin linkkiä tarvitse migroida.
   - **nimettynä objektityyppinä `linkki`** itsenäisiin linkkikenttiin: etusivun lohkojen `ctaLinkki`. Myöhemmin samaa tyyppiä käyttävät C:n painike ja D:n ohjaus.
2. **Href lasketaan koodissa** `documentHref`-funktiolla (lib/path.ts). GROQ palauttaa vain kohteen `{_id, _type, slug}`. Reittisäännöt pysyvät yhdessä paikassa (docs/23 hylkäsi GROQ-laskennan).
3. **Tekstieditorissa ei tehdä erillistä `sisainenLinkki`-annotaatiota.** Olemassa oleva `link`-annotaatio saa saman kenttäjoukon. Isälle jää yksi linkkipainike, jossa on sama kolmen vaihtoehdon valinta kuin muualla, ja vanhat linkit toimivat ilman migraatiota. Tämä poikkeaa Y17:n sanamuodosta tarkoituksella, koska tulos on yksinkertaisempi.
4. **Alatunniste johdetaan päävalikosta** puhtaalla funktiolla. Erillistä listaa tai singletonia ei tehdä (päätös 7.10.).
5. **Viittaukset ovat vahvoja** (oletus). Sanity estää viitatun sivun poiston ja julkaisun perumisen, ja suomenkielinen ikkuna kertoo syyn. Kohteen tila (julkaisematon, poistettu, ajastettu) näkyy Studiossa varoituksena, ja sivustolla linkki piilotetaan, jos kohdetta ei voi näyttää.
6. **Kaksoisluku koko siirtymän ajan:** patch lisää uudet kentät mutta jättää vanhat arvot (`href`, `url`, `ctaHref`) paikalleen, jotta Vercelin Instant Rollback vanhaan koodiin toimii. Vanhat arvot poistetaan erillisellä `--poista-vanhat`-ajolla vasta vakaan jakson jälkeen (sama malli kuin patch-uutiskategoriat.ts).

## 1. Puhtaat säännöt (lib/), testattavat

### 1.1 `lib/path.ts` (laajennus)
- Exportataan `TYPE_BASE` sellaisenaan.
- Uusi funktio, documentRoute-funktion käänteinen:
```ts
/** Polun mahdolliset dokumentit (tyyppi + slug), esim. "/uutiset/x" → [{uutinen, x}, {sivu, "uutiset/x"}].
 *  Kysely- tai ankkuriosaa sisältävä, ulkoinen tai "/" → []. */
export function polunKohteet(polku: string): { tyyppi: string; slug: string }[]
```
Säännöt:
- Polku, joka ei ala yhdellä "/":lla, sisältää `?` tai `#`, tai on "/" → [].
- Jos polku on `LITMANEN_PATH`, lisätään `{pelaaja, LITMANEN_SLUG}`.
- Jokaiselle TYPE_BASE-merkinnälle: jos polku on `${base}/<x>` ja x:ssä ei ole "/", lisätään `{tyyppi, slug: x}`.
- Aina lisätään `{sivu, polku ilman alun "/"-merkkiä}`.
- Käyttäjät: Studion "parempi valinta" -varoitus, migraatioskripti ja myöhemmin D:n ohjaukset.

### 1.2 `lib/linkki.ts` (laajennus; nykyiset `tarkistaLinkki` ja `sisainenPolku` säilyvät)
```ts
import { documentHref } from "./path";

/** Tyypit, joihin "Sivuston sivu" voi osoittaa. Jokaisella on documentRoute ilman parent-hakua. */
export const LINKIN_KOHDETYYPIT = ["sivu","uutinen","tapahtuma","ravintola","klubiToiminta","arvokisa","galleriaAlbumi","stadion","pelaaja"] as const;
export type LinkinTyyppi = "sivu" | "osoite" | "tiedosto";
export const LIITTEEN_TIEDOSTOTYYPIT = ".pdf,.docx,.xlsx"; // C käyttää samaa
export type LinkinKohde = { _id: string; _type: string; slug?: string | null; nimi?: string | null; piilossa?: boolean | null };
export type LinkinTiedosto = { url?: string | null; originalFilename?: string | null; extension?: string | null; size?: number | null };
/** GROQ-fragmentin `linkki` tuottama muoto (sanity/lib/queries/linkki.ts). */
export type LinkkiData = { tyyppi?: LinkinTyyppi | null; href?: string | null; kohde?: LinkinKohde | null; tiedosto?: LinkinTiedosto | null };

/** Vanha data ilman tyyppiä on "Muu osoite", jos hrefillä on arvo. Tyhjä → null. */
export function linkinTyyppi(l: { tyyppi?: string | null; href?: string | null } | null | undefined): LinkinTyyppi | null
/** Kävijän linkki tai null (kohde puuttuu tai on piilossa, osoite virheellinen, tiedosto puuttuu). */
export function linkinOsoite(l: LinkkiData | null | undefined): string | null
/** PDF sellaisenaan; muihin ?dl=<alkuperäinen nimi>, jotta Word- tai Excel-tiedosto latautuu oikealla nimellä. */
export function tiedostonOsoite(t: LinkinTiedosto | null | undefined): string | null
/** "PDF, 240 kt" / "XLSX, 2,4 Mt" / "PDF" / null. Saavutettavuus: tiedostotyyppi linkin tekstiin. C käyttää latauskortissa. */
export function tiedostonKuvaus(t: LinkinTiedosto | null | undefined): string | null
/** Studion esikatselun alaotsikko: "→ /klubi", "→ https://…", "Tiedosto: saannot.pdf", "Valitse, mihin linkki vie". */
export function linkinKuvaus(raaka: { tyyppi?: string|null; href?: string|null; kohdeTyyppi?: string|null; kohdeSlug?: string|null; tiedostonNimi?: string|null }): string
/** Listat (pikalinkit, alavalikot): ratkaisee hrefin ja pudottaa kohdat, joilla ei ole linkkiä. */
export function ratkaiseLinkit<T extends LinkkiData>(lista: T[] | null | undefined): (Omit<T, "href"> & { href: string })[]
/** Viittauksen tila Studiota varten (puhdas; haku sanity/lib/linkin-kohde.ts). */
export function kohteenTilaViesti(tila: { julkaistu: { _type: string; publishedAt?: string | null; nimi?: string | null } | null; luonnos: boolean; nimi?: string | null }, nyt: Date): { taso: "virhe" | "varoitus"; viesti: string } | null
```
`linkinOsoite`-säännöt:
- **sivu:** palautetaan `kohde && !kohde.piilossa ? documentHref({_id, _type, slug}) : null`.
- **osoite:** palautetaan `href`, jos `tarkistaLinkki(href) === true`, muuten null.
- **tiedosto:** palautetaan `tiedostonOsoite(tiedosto)`.
- **null:** palautetaan null.
- Ylimääräiset (vanhentuneet) kentät jätetään huomiotta.

### 1.3 `lib/navigaatio.ts` (uusi, puhdas; vain suhteelliset ja `import type` -tuonnit)
```ts
import type { NavigationItem } from "./types";
import { linkinOsoite, ratkaiseLinkit, type LinkkiData } from "./linkki";
export type RaakaNavigaatioKohta = LinkkiData & { label: string; highlight?: boolean | null; children?: (LinkkiData & { label: string })[] | null };
export function ratkaiseNavigaatio(items: RaakaNavigaatioKohta[] | null | undefined): NavigationItem[]
export function onYleissivuAlavalikossa(item: NavigationItem): boolean // siirretään header-client.tsx:336:sta
export const SIVUSTO_SARAKE = "Sivusto";
export const YLEISESITTELY = "Yleisesittely";
export type AlatunnisteenSarake = { otsikko: string; linkit: { label: string; href: string }[] };
export function alatunnisteenSarakkeet(items: NavigationItem[]): AlatunnisteenSarake[]
```
- **ratkaiseNavigaatio:** alalinkit ratkaistaan `ratkaiseLinkit`-funktiolla. Pääkohta, jolla ei ole hrefiä mutta on alalinkkejä, saa ensimmäisen alalinkin hrefin. Pääkohta, jolla ei ole hrefiä eikä alalinkkejä, pudotetaan. Tyhjä alavalikko muutetaan muotoon `children: undefined`.
- **alatunnisteenSarakkeet:**
  1. Alavalikottomat pääkohdat kootaan nav-järjestyksessä sarakkeeseen "Sivusto" (sarake jätetään pois, jos se on tyhjä).
  2. Jokainen alavalikollinen kohta saa oman sarakkeen `{otsikko: label, linkit: children}`. Jos `!onYleissivuAlavalikossa(item)`, ensimmäiseksi linkiksi lisätään `{label: "Yleisesittely", href: item.href}`.
  3. Järjestys: Sivusto ensin, sitten alavalikolliset nav-järjestyksessä.
  4. Funktiota kutsutaan vasta `piilotaTyhjat`-kutsun jälkeen. Jos kaikki alalinkit piilotettiin, kohta on silloin alavalikoton ja siirtyy Sivusto-sarakkeeseen.

### 1.4 Etusivu ja klubin toiminta: ratkaisu sivun datakerroksessa (ei uutta moduulia)
- `app/(public)/page.tsx`: kun data on haettu, `heroCtas = ratkaiseLinkit(data.heroCtas)` (Hero käyttää yhä `{label, href}`). Lohkoille `ctaHref: block.ctaLinkki ? linkinOsoite(block.ctaLinkki) ?? undefined : block.ctaHref` (kaksoisluku).
- Klubin toiminnan sivulla `const href = linkinOsoite({ ...vuosi.linkki, href: vuosi.linkki?.href ?? vuosi.linkki?.url })`. Vanha `url` luetaan vain, kun `tyyppi` puuttuu, koska linkinTyyppi palauttaa silloin "osoite". Linkin teksti on `teksti || kohde?.nimi || href`.

## 2. Skeemat

### 2.1 `sanity/schemas/objects/linkki.ts` (uusi)
```ts
import { LinkIcon } from "@sanity/icons";
export function linkkiKentat({ pakollinen }: { pakollinen: boolean }): FieldDefinition[]
export const linkki = defineType({ name: "linkki", title: "Linkki", type: "object", icon: LinkIcon,
  fields: linkkiKentat({ pakollinen: false }), preview: linkinEsikatselu("Linkki") });
/** Isäntäkentän sääntö, kun nimetty linkki on pakollinen (C:n painike, D:n ohjaus). */
export const vaadiLinkki = (rule: Rule) => rule.custom((arvo) => onLinkkiTaytetty(arvo) || "Valitse, mihin linkki vie.");
/** Esikatselu: select {otsikko, tyyppi, href, kohdeTyyppi: "kohde._type", kohdeSlug: "kohde.slug.current", kohdeNimi: "kohde.title", tiedostonNimi: "tiedosto.asset.originalFilename"} → linkinKuvaus. */
export function linkinEsikatselu(otsikkoKentta: string)
```
Kentät (`linkkiKentat`):

| nimi | tyyppi | otsikko | kuvaus | piilotus | validointi |
|---|---|---|---|---|---|
| `tyyppi` | string, radio, vaakasuunta: Sivuston sivu=`sivu`, Muu osoite=`osoite`, Tiedosto=`tiedosto` | Mihin linkki vie? | "Sivuston sivu pysyy kunnossa, vaikka sivun osoite muuttuisi. Muu osoite on toinen sivusto, sähköposti tai puhelinnumero." | – | – (`initialValue: "sivu"` vain, kun `pakollinen`) |
| `kohde` | reference to `LINKIN_KOHDETYYPIT`, `options: { disableNew: true, filter: "defined(slug.current)" }` | Sivu | "Kirjoita sivun, uutisen, ravintolan tai muun sisällön nimen alkua ja valitse listasta." | näkyvissä, kun tyyppi = sivu **tai** kentällä on arvo | ks. alla |
| `href` | string | Osoite | "Toinen sivusto (https://…), sähköposti (mailto:nimi@esimerkki.fi) tai puhelin (tel:+358…). Sivuston omalle sivulle valitse Sivuston sivu. Osoite /… vain silloin, kun sivua ei löydy listasta (esim. /uutiset/arkisto/2016)." | näkyvissä vain, kun `linkinTyyppi(parent) === "osoite"` | ks. alla |
| `tiedosto` | file, `options.accept: LIITTEEN_TIEDOSTOTYYPIT` | Tiedosto | "PDF-, Word- tai Excel-tiedosto. Tiedosto on julkinen: kuka tahansa linkin saanut voi avata sen. Älä lisää henkilötietoja, kuten pöytäkirjoja tai jäsenluetteloita." | näkyvissä vain, kun tyyppi = tiedosto | ks. alla |

Validointisäännöt. Kaikki säännöt palauttavat `true`, kun kenttä ei ole aktiivinen. Poikkeus on `kohde`, jonka vanhentunut arvo halutaan näkyviin, koska se estäisi kohteen poiston.

**kohde, virhetaso:**
- Tyyppi on sivu, `pakollinen` on päällä ja kohde puuttuu: "Valitse sivu, johon linkki vie."
- Asynkroninen tarkistus (`kohteenTilaViesti`, jolla taso "virhe"): "Valittua sivua ei enää ole. Valitse toinen sivu."

**kohde, varoitustaso:**
- Kohdetta ei ole julkaistu, mutta luonnos on olemassa: "“{nimi}” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen."
- Kohde on ajastettu uutinen: "Uutinen tulee näkyviin {d.M.yyyy} klo {H.mm}. Linkki näkyy sivustolla siitä alkaen."
- Linkin tyyppi ei ole sivu, mutta kohteella on arvo: "Tätä valintaa ei käytetä, koska linkki vie nyt muualle. Tyhjennä se (kolme pistettä → Tyhjennä), muuten valittua sivua ei voi poistaa."

**href:**
- Virhe: kenttä on pakollinen ja tyhjä: "Kirjoita osoite, esim. https://www.palloliitto.fi."
- Virhe: `tarkistaLinkki` palauttaa nykyiset viestinsä.
- Varoitus: `linkinKohdeVaroitus`, nykyinen HEAD-tarkistus.
- Uusi varoitus `sivullaOnValinta`: "Tälle sivulle on parempi valinta: vaihda kohdaksi Sivuston sivu ja valitse “{nimi}”. Linkki pysyy silloin kunnossa, vaikka sivun osoite muuttuisi."

**tiedosto:**
- Virhe: kenttä on pakollinen ja tyhjä: "Lisää tiedosto."

Pakollisuus (`pakollinen`) koskee vain aktiivista kenttää.

### 2.2 `sanity/lib/linkin-kohde.ts` (laajennus)
- `kohteenTila(ref: {_ref?: string; _weak?: boolean}, context)`: kysely `context.getClient({apiVersion}).fetch('{"julkaistu": *[_id == $id][0]{_type, publishedAt, "nimi": coalesce(title, name)}, "luonnos": defined(*[_id == "drafts." + $id][0]._id), "nimi": coalesce(*[_id == "drafts." + $id][0].title, *[_id == "drafts." + $id][0].name)}', {id})` → `kohteenTilaViesti(..., new Date())`.
- `sivullaOnValinta(href, context)`: kutsuu `polunKohteet(sisainenPolku(href))` ja tekee kyselyn `*[!(_id in path("drafts.**")) && ((_type == $t0 && slug.current == $s0) || …)][0]{"nimi": coalesce(title, name)}`. Löytyneestä palautetaan varoitus. Kyselyä ei tehdä, jos polussa on `?` tai `#`.
- Molemmat säännöt muistiin per arvo 60 sekunniksi, samaan tapaan kuin nykyinen `valimuisti`.

### 2.3 Käyttökohteet
- **`sanity/schemas/index.ts`:** lisätään `linkki` schemaTypes-listaan (objektit).
- **`navigaatio.ts`:**
  - Päälinkin kentät: `label` (Otsikko, pakollinen), `...linkkiKentat({pakollinen: true})`, `highlight` (ennallaan) ja `children`.
  - Alalinkin kentät: `label` ja `...linkkiKentat({pakollinen: true})`.
  - Esikatselu `linkinEsikatselu("label")`; nykyinen ★-korostus säilyy prepare-funktiossa.
  - `items`-kentän kuvaus: "Järjestä raahaamalla. Enintään 7 päälinkkiä. Sama valikko näkyy sivun alareunassa (alatunniste): kohdat, joilla on alavalikko, omina sarakkeinaan ja muut sarakkeessa Sivusto. Tyhjät osiot (esim. Tapahtumat ilman tapahtumia) piiloutuvat itsestään."
  - `children`-kentän kuvaus: "Näkyy valikossa avautuvana listana ja alatunnisteessa omana sarakkeenaan."
  - `initialValue` säilyy (vanha muoto kelpaa).
- **`etusivu.ts`:**
  - heroCtas-kohta: `label`, `...linkkiKentat({pakollinen: true})` ja `primary` (piilossa). Kuvaus: 'Näkyvät yläosassa tuoreimpien juttujen alla, esim. "Palloveikkaus". Enintään neljä.'
  - esittely: uusi kenttä `ctaLinkki` (type `linkki`, otsikko "Linkin kohde") sekä varoitussääntö lohkolle: jos `ctaLabel` on täytetty mutta linkki ei ole täytetty, "Lisää linkin kohde tai poista linkin teksti."
  - jalkapalloarkisto: `ctaLinkki` (otsikko "Napin kohde", kuvaus "Jätä tyhjäksi, niin nappi vie jalkapalloarkiston etusivulle.").
  - Vanha `ctaHref` molemmissa lohkoissa: `deprecated: {reason: 'Korvattu kentällä "Linkin kohde".'}`, `readOnly: true`, `hidden: true` ja `initialValue: undefined`. Jalkapalloarkiston `initialValue: "/jalkapalloarkisto"` poistetaan, koska oletus on komponentissa.
- **`klubiToiminta.ts`, vuodet[].linkki:**
  - Kentät: `teksti`, `...linkkiKentat({pakollinen: false})` ilman initialValuea, joten radio on aluksi tyhjä ja kentät piilossa, kunnes isä valitsee.
  - Vanha `url`: deprecated ("Korvattu kentillä Mihin linkki vie ja Sivu/Osoite."), `readOnly` ja `hidden: true`.
  - Teksti-kenttään varoitus: jos teksti on mutta linkkiä ei, "Linkin teksti on kirjoitettu, mutta kohde puuttuu."
  - Kuvaus: 'Linkki lisätietoon, esim. matkakuvaus uutisissa tai video. Kirjoita linkin teksti, esim. "Matkakuvaus".'
- **`portableText.ts`:**
  - Annotaatio määritellään exportattuna vakiona `tekstinLinkki = { name: "link", type: "object", title: "Linkki", icon: LinkIcon, fields: [...linkkiKentat({pakollinen: true}), newTab] }`.
  - `newTab` ennallaan: "Avaa uuteen välilehteen". Kenttä näkyy vain, kun tyyppi on osoite tai tiedosto.
  - `href` muuttuu tyypistä url tyypiksi string. Data on sama, ja tarkistaLinkki korvaa uri()-säännön.
  - C:n `rikasSisalto` käyttää samaa `tekstinLinkki`-vakiota.
- **`contentMeta.ts`:** `linkkiValidointi` ja `valinnainenLinkkiValidointi` poistetaan siivousvaiheessa, kun niillä ei ole käyttäjiä. href-sääntö kootaan linkki.ts:ssä samoista osista.

## 3. GROQ

- **Uusi `sanity/lib/queries/linkki.ts`:**
```ts
import { JULKAISTU } from "./julkaisu";
/** Linkin kentät projektioon: `items[]{ label, ${linkki} }` tai `ctaLinkki{ ${linkki} }`. Href lasketaan koodissa (lib/linkki.ts linkinOsoite). */
export const linkki = /* groq */ `
  tyyppi,
  href,
  "kohde": kohde->{ _id, _type, "slug": slug.current, "nimi": coalesce(title, name),
    "piilossa": _type == "uutinen" && !${JULKAISTU} },
  "tiedosto": tiedosto.asset->{ url, originalFilename, extension, size }
`;
```
- **navigationQuery** (queries.ts):
```groq
*[_type == "navigaatio"][0]{ items[]{ label, highlight, ${linkki}, children[]{ label, ${linkki} } } }
```
- **etusivuQuery:**
  - `heroCtas[]{ label, primary, ${linkki} }`
  - blocksiin lisätään `ctaLinkki{ ${linkki} }`; `ctaHref` säilyy kaksoisluvun ajan.
- **klubiToimintaBySlugQuery:** `linkki{ teksti, url, ${linkki} }`.
- **runko (kuvat.ts:29):**
```ts
export const runko = `..., _type == "imageWithAlt" => { ${lqip} },
  _type == "block" => { "markDefs": markDefs[]{ ..., _type == "link" => {
    "kohde": kohde->{ _id, _type, "slug": slug.current, "nimi": coalesce(title, name), "piilossa": _type == "uutinen" && !${JULKAISTU} },
    "tiedosto": tiedosto.asset->{ url, originalFilename, extension, size } } } }`;
```
  Kohteen projektio on sama kuin `linkki`-fragmentissa. Toistoa vältetään vakiolla `linkinKohde`, joka exportataan linkki.ts:stä ja tuodaan kuvat.ts:ään.
- **ravintolat.ts:416:** `review,` → `review[]{${runko}},`.
- Toteuttaja tarkistaa: `grep -rn "PortableText value="` ja jokaisen kentän projektio. Kaikki muut kulkevat jo rungon kautta (lista nykytilassa).
- Muuta: `npm run typegen` ja `sanity/sanity.types.ts` commitoidaan. `lib/types.ts`:
  - `HeroCta = LinkkiData & { label: string; primary?: boolean }`
  - EtusivuBlockin esittely- ja jalkapalloarkisto-lohkoihin `ctaLinkki?: LinkkiData | null`
  - `KlubiToiminta.vuodet[].linkki: (LinkkiData & { teksti?: string|null; url?: string|null }) | null` (klubi.ts:109)

## 4. Komponentit ja reitit

- **`sanity/lib/navigaatio.ts` (uusi, palvelin):**
```ts
export const haeNavigaatio = cache(async (): Promise<NavigationItem[]> => { /* sanityFetch({query: navigationQuery, tags: ["navigaatio","linkit"], fallback: defaultNavigation}) + haeTyhjatOsiot() → ratkaiseNavigaatio → stegaClean hrefeihin (label jää) → piilotaTyhjat */ });
```
  `cache` tulee Reactista. Header ja Footer kutsuvat samaa funktiota, joten kysely tehdään yhden renderöinnin aikana kerran.
- **`components/layout/header.tsx`:** `const items = await haeNavigaatio()`. Muu koodi poistuu (stegaClean ja piilotaTyhjat siirtyvät apuriin).
- **`header-client.tsx`:** `hasOverviewChild` korvataan importilla `onYleissivuAlavalikossa` (lib/navigaatio). Muuten ennallaan.
- **`components/layout/footer.tsx`:**
  - `linkColumns` poistetaan.
  - `const [contact, items] = await Promise.all([… contact …, haeNavigaatio()])` ja `const sarakkeet = alatunnisteenSarakkeet(items)`.
  - Rakenne: logo ja sen jälkeen **yksi** `<nav aria-label="Alatunnisteen valikko" className="contents">`. Jokainen sarake on `<div className="flex flex-col gap-2.5">`, jossa `<h2>` (nykyinen tyyli), `<ul>` ja `<li><Link href className={linkClass}>`. Avaimena `${href}|${label}`. Näin syntyy yksi landmark entisten kahden nimetyn navin tilalle (WCAG 1.3.1 / 2.4.1).
  - Yhteystiedot-sarake ennallaan.
  - Ruudukko: `lg:grid-cols-[minmax(0,1.6fr)_repeat(var(--sarakkeet),minmax(0,1fr))]` ja `style={{ "--sarakkeet": sarakkeet.length + 1 } as React.CSSProperties}`. Kapealla `sm:grid-cols-2` ennallaan.
  - Alarivi (Tietosuojaseloste `TIETOSUOJA_PATH`, Ylläpito `/studio`) on ennallaan ja kiinteä (päätökset Y21 ja "Ylläpito säilyy").
  - Kommentti päivitetään: "Linkkisarakkeet johdetaan päävalikosta (docs/23 Y23)".
  - Tulos productionin datalla: Sivusto (Ottelut, Ravintola-arviot, Uutiset) | Jalkapallo (6) | Klubi (5) | Yhteystiedot. Pois jäävät Uutisarkisto (linkki on /uutiset-sivulla), Tapahtumat ja Kuvagalleria (tyhjiä, ja etusivun lohkot linkittävät niihin, kun sisältöä on).
- **`components/portable-text.tsx`, `marks.link`:**
  - `const href = linkinOsoite(value)`. Jos se on null, palautetaan `<>{children}</>`, eli kävijä näkee tekstin ilman rikkinäistä linkkiä.
  - Href puhdistetaan `stegaClean`-funktiolla.
  - Tiedostolinkkiin lisätään `{kuvaus && <span className="text-sm text-muted"> ({tiedostonKuvaus(value.tiedosto)})</span>}`.
  - Ulkoinen ja newTab-linkki ennallaan, sisäinen kulkee `<Link>`-komponentin kautta.
- **`app/(public)/page.tsx`:** etusivun linkkien ratkaisu kuten kohdassa 1.4, ja tags muotoon `["etusivu", "linkit"]`.
- **`app/(public)/klubi/toiminta/[slug]/page.tsx`:** ratkaisu kuten kohdassa 1.4. Sisäinen href renderöidään `<Link>`-komponentilla, ulkoinen `<a>`-elementillä (nykyinen luokka). Tags muotoon `["klubiToiminta", `klubiToiminta:${slug}`, "linkit"]`.
- **`app/api/revalidate/route.ts`:** RIIPPUVAT-tauluun yhdistetään jokaiselle `LINKIN_KOHDETYYPIT`-tyypille tagi "linkit":
```ts
const LINKIT = Object.fromEntries(LINKIN_KOHDETYYPIT.map((t) => [t, ["linkit"]]));
```
  Avaimet yhdistetään, jos ne ovat päällekkäisiä. Kommentti: "Linkin kohteen polku näkyy valikossa, alatunnisteessa, etusivulla ja klubin toiminnassa." Tekstieditorin linkit muissa dokumenteissa päivittyvät 60 sekunnin ikkunassa (`fetch.ts`), ja tämä kirjataan oppaaseen.
- **`lib/defaults.ts`:** ennallaan, koska vanha href-muoto kelpaa. Kommenttiin lisätään, että alatunniste johdetaan tästä, kun Sanity puuttuu.

## 5. Palautus varmuuskopiosta ja viittaukset (pieni lisäys, B:n aiheuttama riski)
- `lib/palautus.ts`: lisätään `heikennaPuuttuvatViittaukset(doc, olemassa: ReadonlySet<string>)`. Funktio käy rekursiivisesti jokaisen `{_ref}`-kohdan läpi, ja jos kohdetta ei ole, lisää `_weak: true`. Ilman tätä Content Lake hylkää luonnoksen, jos varmuuskopion valikko tai teksti viittaa sen jälkeen poistettuun sivuun.
- `sanity/actions/palauta-varmuuskopiosta.tsx`: ennen kirjoitusta haetaan `*[_id in $refit]._id` ja kutsutaan funktiota. Studion kenttä näyttää silloin oman ilmoituksensa ("Viitattu asiakirja ei ole enää olemassa"), ja kohde-sääntö antaa virheen "Valittua sivua ei enää ole".
- Testit lisätään tiedostoon `scripts/test-palautus.ts`.

## 6. Migraatio (patch), vaihe vaiheelta

**Skripti:** `scripts/patch-linkit.ts`, npm-skripti `"patch:linkit": "tsx scripts/patch-linkit.ts"`. Rakenne kuten `patch-uutiskategoriat.ts`:
- Liput: oletus development ja kuivaharjoitus, `--vie`, `--production` ja `--poista-vanhat`.
- Tokenina `sanityWriteToken()`, `perspective: "raw"`.
- Productionissa ensin `npm run backup`; jos se epäonnistuu, skripti pysähtyy.

**Puhtaat muunnokset** tiedostossa `scripts/lib/linkit-migraatio.ts` (testataan test-linkki.ts:ssä):
```ts
export type Hakemisto = Map<string /* documentHref */, string /* julkaistu _id */>;
/** Merkkijonolinkki → uudet kentät. Sisäinen polku, jolle löytyy dokumentti (ei ? eikä #) → {tyyppi:"sivu", kohde:{_type:"reference", _ref}}. Muuten {tyyppi:"osoite"} (+ href: url, kun lähde on klubiToiminnan url). Jo muunnettu (tyyppi määritelty eikä "osoite", tai osoite jolle ei löydy dokumenttia) → null. */
export function muunnaLinkki(vanha: { tyyppi?: string|null; href?: string|null; url?: string|null }, hakemisto: Hakemisto): Record<string, unknown> | null
/** Tekstieditorin linkit: palauttaa [{polku: "body[_key==\"b1\"].markDefs[_key==\"m1\"]", uusi: {...vanha markDef, tyyppi, kohde}}] vain sisäisille dokumenttipoluille. Kulkee kaikkien kenttien ja sisäkkäisten taulukoiden läpi (pelaaja ym.). */
export function tekstinLinkkienMuutokset(doc: Record<string, unknown>, hakemisto: Hakemisto): { polku: string; uusi: Record<string, unknown> }[]
```

**Kulku:**
1. **Hakemisto:** `*[_type in $tyypit && defined(slug.current) && !(_id in path("drafts.**"))]{_id, _type, "slug": slug.current}` → `documentHref`-avain → `_id`.
2. **Isännät** (myös `drafts.`-versiot):
   - `navigaatio`, `etusivu`
   - `*[_type == "klubiToiminta" && count(vuodet[defined(linkki.url) || defined(linkki.href)]) > 0]`
   - tekstieditorin dokumentit: `*[_type in ["sivu","uutinen","tapahtuma","ravintola","klubiToiminta","arvokisa","stadion","pelaaja","jalkapalloTilasto","lehtileike","etusivu"]]`, käydään läpi JS:ssä (export 8.10. oli noin 10 Mt, joten tämä on kevyttä).
3. **Muutokset:**
   - navigaatio: koko `items`-taulukko rakennetaan uudelleen. Jokaiseen kohtaan ja alakohtaan lisätään `muunnaLinkki`-funktion kentät, ja **`href` säilyy**.
   - etusivu: koko `heroCtas` rakennetaan uudelleen ja `set({"blocks[_key==\"…\"].ctaLinkki": {...}})`. `ctaHref` säilyy.
   - klubiToiminta: `set({"vuodet[_key==\"…\"].linkki.tyyppi": …, ".kohde"|".href": …})`, ja `url` säilyy.
   - tekstieditori: `set({[polku]: uusi})`. Avaimet `_key` ja `href` säilyvät.
   - Jokaisessa patchissa `ifRevisionId(_rev)`, yksi transaktio per dokumentti.
4. **Invarianttitarkistus ennen kirjoitusta** (myös kuivaharjoituksessa): jokaiselle muunnetulle arvolle `documentHref(kohde) === vanha href`. Jos ehto ei täyty, skripti pysähtyy eikä kirjoita mitään. Kävijä ei siis näe mitään muutosta.
5. **Tuloste:** taulukko `dokumentti | kenttä | vanha → uusi (sivu: _id / osoite)` ja yhteenveto. Kuivaharjoituksessa sama tiedostoon `data/linkit-migraatio.tsv` (gitignoressa).
6. **Kirjoituksen jälkeen:** haetaan isännät uudelleen sanityFetchin kyselyillä (navigationQuery, etusivuQuery, klubiToimintaBySlugQuery ja runko) ja verrataan `linkinOsoite`-tulosta alkuperäisiin hreffeihin. Kaikkien pitää täsmätä, muuten skripti palaa koodilla 1 ja tulostaa "Aja uudelleen tai palauta varmuuskopiosta".
7. **`--poista-vanhat`** (vasta vakaan jakson jälkeen, ks. vaihe 5): poistetaan navigaatiosta ja heroCtas-kohdista `href`, kun `tyyppi in ["sivu","tiedosto"]`. Tekstieditorin markDefeistä `href` poistetaan samalla ehdolla. klubiToiminnasta poistetaan `linkki.url`, kun `defined(linkki.tyyppi)`, ja etusivulta `blocks[].ctaHref`, kun `defined(ctaLinkki)`.
8. **Idempotenssi:** skriptin voi ajaa uudelleen. Kun A on luonut osiosivut, uusi ajo muuntaa "osoite"-tyyppiset koodireittilinkit (/uutiset, /ottelut, /jalkapalloarkisto…) viittauksiksi samoissa dokumenteissa.

**Vaiheet ja odotetut määrät** (tilanne 8.10.2026 ilman A:ta):
1. **PR 1 (koodi):** kaikki kohdat 1–5, 7 ja 8. Vanha data on kelvollista, joten Studio ja sivusto näyttävät saman kuin ennen. `npm test`, `npm run type-check`, `npm run lint` ja `npm run build`. **Deploy** ja tarkistus tuotannossa: valikko ja etusivu ennallaan, alatunniste valikon mukainen.
2. **Development:** `npm run patch:linkit` (kuivaharjoitus), sitten `npm run patch:linkit -- --vie`. Lisäksi `npm run dev` development-datasetillä: valikko, alatunniste, etusivu, /klubi, /klubi/toiminta/matkailu ja uutinen 2008-06-01-voittajaveikkaus-em-2008. Studiossa tarkistetaan lomakkeet ja esikatselun alaotsikot.
3. **Production:** ensin `-- --production` (kuivaharjoitus, odotettu tuloste alla), sitten `-- --production --vie` (varmuuskopio, patch, tarkistus). Odotettu tuloste:

| dokumentti | sivu-viittauksia | osoitteita |
|---|---|---|
| navigaatio | 4 | 12 |
| etusivu (heroCtas 1+1, esittely 1) | 2 | 1 |
| klubiToiminta-matkailu | 23 | 0 |
| klubiToiminta-molkky | 0 | 1 |
| sivu-klubi (tekstieditorin markDefs) | 9 | 0 |
| uutinen-blogspot-2702900233159075591 | 1 | 0 |

   Yhteensä **6 dokumenttia ja 53 arvoa: 39 viittausta ja 14 osoitetta**. Koskematta jäävät 21 tekstieditorin linkkiä: 19 ulkoista sekä arvokisa-em-2008:n ankkurilinkki ja venajan-mestareiden /uutiset/arkisto/2016. Ne ovat vanhaa muotoa (href, ei tyyppiä) ja näkyvät Studiossa Muu osoite -kenttänä.
   Jos A on tehty ensin, navigaation ja pikalinkkien koodireittejä muuttuu viittauksiksi enintään 11 lisää samoissa dokumenteissa. Uusia dokumentteja ei tule.
4. **Kun A on julkaistu** (jos A tehtiin B:n jälkeen): kuivaharjoitus ja `--production --vie` uudelleen.
5. **Noin 2 viikon kuluttua** (vaiheen 3 siivous tai Y41): `-- --production --vie --poista-vanhat`. Poistettavia arvoja on samoissa 6 dokumentissa: navigaation href 4, heroCtas href 1, tekstieditorin href 10, url 24 ja ctaHref 1. Määrät ovat suuremmat, jos A ehti ensin.
   Sen jälkeen PR 2: `url`- ja `ctaHref`-kentät sekä niiden kaksoisluku poistetaan koodista, kun tarkistuskyselyt `count(*[_type=="klubiToiminta" && count(vuodet[defined(linkki.url)])>0])` ja `count(*[_type=="etusivu" && count(blocks[defined(ctaHref)])>0])` palauttavat 0. Lisäksi poistetaan käyttämättömät `linkkiValidointi`-exportit. `linkinTyyppi`-funktion oletus jää pysyväksi, koska ulkoiset tekstieditorin linkit ovat vanhaa muotoa.

Webhookin asetuksiin (projektio) ja datasetin skeemaan ei tehdä muutoksia.

## 7. Testit
**`scripts/test-linkki.ts`** (laajennus, `npm run test:linkki`):
1. `linkinTyyppi`: {tyyppi:"sivu"} → sivu; {href:"/x"} → osoite; {} → null; {tyyppi:null, href:"https://a.fi"} → osoite.
2. `linkinOsoite`, sivu: uutinen 2008-x → /uutiset/2008-x; sivu klubi → /klubi; sivu klubi/palloveikkaus → /klubi/palloveikkaus; pelaaja jari-litmanen → /jalkapalloarkisto/litmanen; klubiToiminta matkailu → /klubi/toiminta/matkailu; arvokisa em-2008 → /jalkapalloarkisto/arvokisat/em-2008.
3. Sivu-tyyppi, kun kohde on null, piilossa tai ilman slugia, tai kohteen tyypillä ei ole reittiä (kaupunki) → null. Tyyppi sivu, mutta vain vanha href → null (vanhaa hrefiä ei käytetä).
4. Osoite: "/ottelut", "https://x.fi", "mailto:a@b.fi" säilyvät; "www.x.fi" ja "uutiset" → null; tyhjä → null.
5. Tiedosto: pdf → url sellaisenaan; docx → `url?dl=Jäsenhakemus.docx` (encodeURIComponent); ilman urlia → null.
6. `tiedostonKuvaus`: {pdf, 245760} → "PDF, 240 kt"; {xlsx, 2_500_000} → "XLSX, 2,4 Mt"; {pdf} → "PDF"; null → null.
7. `ratkaiseLinkit` pudottaa kohdat, joiden href on null, ja säilyttää labelin ja järjestyksen.
8. Jokaisella `LINKIN_KOHDETYYPIT`-tyypillä on `documentRoute({_id:"x", _type, slug:"testi"})` ≠ null.
9. `polunKohteet`:
   - kierros: jokaiselle TYPE_BASE-tyypille `polunKohteet(documentHref({_type, slug:"testi"}))` sisältää {tyyppi, "testi"}
   - "/klubi/historia" → sisältää {sivu, "klubi/historia"}
   - LITMANEN_PATH → {pelaaja, jari-litmanen}
   - "/uutiset?sivu=2", "/a#b", "https://x", "/" ja "//x" → []
10. `kohteenTilaViesti`: julkaistu → null; vain luonnos → varoitus "ei ole vielä julkaistu"; ei mitään → virhe "ei enää ole"; uutinen, jonka publishedAt on huomenna → varoitus, jossa on päivämäärä muodossa d.M.yyyy; menneisyydessä → null.
11. `linkinKuvaus`: sivu, osoite, tiedosto ja tyhjä.
12. `muunnaLinkki`:
    - "/klubi" → sivu-klubi
    - "/ottelut" ilman dokumenttia → osoite
    - "/jalkapalloarkisto/arvokisat#em" → osoite
    - url "https://youtu.be/x" → {tyyppi:"osoite", href}
    - jo muunnettu → null
    - "/uutiset" sen jälkeen, kun A on luonut sivu-uutiset → sivu
13. `tekstinLinkkienMuutokset`: fixture, jossa on 2 lohkoa, sisäinen ja ulkoinen linkki sekä sisäkkäinen kenttä → vain sisäinen, ja polku on muotoa `body[_key=="…"].markDefs[_key=="…"]`.

**`scripts/test-navigaatio.ts`** (uusi, `"test:navigaatio": "tsx scripts/test-navigaatio.ts"`, lisätään `npm test` -ketjuun):
1. Productionin fixture (16 kohtaa sekamuodossa: 4 viittausta ja 12 osoitetta) → `ratkaiseNavigaatio` antaa täsmälleen nykyiset hrefit.
2. Alalinkin kohde puuttuu → alalinkki pudotetaan. Päälinkin kohde puuttuu → ensimmäisen alalinkin href. Päälinkin kohde puuttuu eikä alalinkkejä ole → kohta pudotetaan.
3. Vanha muoto ({label, href}) ja `defaultNavigation` ennallaan.
4. `onYleissivuAlavalikossa`.
5. `alatunnisteenSarakkeet` productionin datalla → [Sivusto: Ottelut, Ravintola-arviot, Uutiset], [Jalkapallo: 6], [Klubi: 5].
6. Päälinkki, joka ei ole alavalikossa → ensimmäiseksi linkiksi "Yleisesittely".
7. Ei alavalikottomia kohtia → Sivusto-sarake puuttuu. Tyhjä valikko → [].
8. `piilotaTyhjat` ja sen jälkeen sarakkeet: alavalikko, jonka ainoa linkki on /tapahtumat ja joka on tyhjä, siirtyy Sivusto-sarakkeeseen.

**`scripts/test-palautus.ts`:** heikennaPuuttuvatViittaukset. Puuttuva viittaus saa `_weak`-merkinnän, olemassa oleva ei. Sisäkkäiset taulukot ja tekstieditorin markDefs käsitellään.

**Käsin tai e2e:**
- `npm run test:saavutettavuus` etusivulle, /klubi- ja /uutiset/…-sivulle. Alatunnisteessa on yksi nav-landmark, ja otsikot ovat järjestyksessä.
- Studiossa:
  - Uusi valikkokohta: Sivuston sivu → valitse "Matkailu" → esikatselussa "→ /klubi/toiminta/matkailu".
  - Muu osoite "/klubi" → varoitus "parempi valinta".
  - Julkaisematon sivu → varoitus.
  - Yritä poistaa uutinen, johon Matkailu viittaa → suomenkielinen ikkuna, jossa Matkailu näkyy listassa.

## 8. docs/09 (samassa PR:ssä kuin PR 1) ja muut dokumentit
1. **Uusi alaluku "Linkit" Perusasioiden jälkeen:**
   - "Jokaisessa linkissä valitset ensin **Mihin linkki vie?**:
     - **Sivuston sivu**: kirjoita sivun, uutisen tai ravintolan nimen alkua ja valitse listasta. Linkki pysyy kunnossa, vaikka sivun osoite muuttuisi.
     - **Muu osoite**: toinen sivusto (https://…), sähköposti (mailto:…) tai puhelin (tel:…).
     - **Tiedosto**: PDF, Word tai Excel. Tiedosto on julkinen, joten älä liitä henkilötietoja.
   - Keltaiset varoitukset: sivua ei ole julkaistu, uutinen on ajastettu, tai 'Tälle sivulle on parempi valinta'."
2. **"Valikon muokkaaminen"** kirjoitetaan uudelleen:
   - Kohdat 3 (Sivuston sivu -valinta) ja 5 (alavalikko).
   - Uusi kohta: "**Alatunniste** (sivun alareuna) seuraa valikkoa: alavalikolliset kohdat näkyvät omina sarakkeinaan ja muut sarakkeessa Sivusto. Yhteystiedot tulevat Yhteystiedoista. Tietosuojaseloste- ja Ylläpito-linkit ovat aina mukana."
3. **"Etusivun muokkaaminen":** Pikalinkit sekä Esittely- ja Jalkapalloarkisto-lohkon "Linkin kohde".
4. **"Klubin toiminta: uusi vuosi":** linkin teksti ja "Mihin linkki vie?" (esim. matkakuvaus: Sivuston sivu → uutinen).
5. **"Uutisen kirjoittaminen", kohta 4:** "Linkki: maalaa sana → ketjukuvake → valitse Mihin linkki vie?"
6. **"Tyypilliset tilanteet", uudet rivit:**
   - "**En voi poistaa sivua tai uutista, tai sen julkaisua ei voi perua.**" Ikkuna sanoo: "Et ehkä voi poistaa …, koska seuraavat asiakirjat viittaavat siihen", tai tulee ilmoitus "Tämä yleensä tarkoittaa, että muut dokumentit viittaavat siihen". Johonkin (esim. valikkoon tai Matkailu-sivulle) on tehty linkki tälle sivulle. Toimintaohje: "Avaa listassa näkyvä dokumentti napsauttamalla, vaihda tai poista linkki ja paina Julkaise. Poista sen jälkeen. Älä paina Poista joka tapauksessa, koska se ei onnistu."
   - "**Linkki katosi valikosta tai tekstistä.**" Kohdesivua ei ole julkaistu, tai uutinen on ajastettu. Linkki palaa, kun sivu julkaistaan.
   - Nykyinen rivi "Linkki ei toimi" päivitetään.
7. **"Mitä EI saa tehdä", polkukohta:** "Sivuston sivu -valinnalla tehdyt linkit seuraavat polun muutosta itsestään. Muu osoite -linkit ja Googlen vanhat linkit eivät seuraa." Lisäys poistetaan, kun D on valmis.
8. **Muut dokumentit:**
   - docs/05: `linkki`-objekti ja navigaation kentät.
   - docs/23 §0: "Toteutettu" (Y17 askeleet 2–3 ja Y23) ja luvut 6 dokumenttia / 53 arvoa.
   - CLAUDE.md: komentotaulukkoon `patch:linkit` (kuvaus kuten muilla patcheilla) ja `test:navigaatio`.

## 9. Tiedostolista

**Uudet:**
- `sanity/schemas/objects/linkki.ts`
- `sanity/lib/queries/linkki.ts`
- `sanity/lib/navigaatio.ts`
- `lib/navigaatio.ts`
- `scripts/lib/linkit-migraatio.ts`
- `scripts/patch-linkit.ts`
- `scripts/test-navigaatio.ts`

**Muutettavat:**
- `lib/linkki.ts`, `lib/path.ts`, `lib/types.ts`, `lib/defaults.ts` (kommentti), `lib/palautus.ts`
- `sanity/lib/linkin-kohde.ts`
- `sanity/schemas/index.ts`, `sanity/schemas/singletons/navigaatio.ts`, `sanity/schemas/singletons/etusivu.ts`, `sanity/schemas/documents/klubiToiminta.ts`, `sanity/schemas/objects/portableText.ts`, `sanity/schemas/objects/contentMeta.ts` (siivous PR 2:ssa)
- `sanity/actions/palauta-varmuuskopiosta.tsx`
- `sanity/lib/queries.ts`, `sanity/lib/queries/etusivu.ts`, `sanity/lib/queries/klubi.ts`, `sanity/lib/queries/kuvat.ts`, `sanity/lib/queries/ravintolat.ts`
- `sanity/sanity.types.ts` (typegen)
- `components/layout/header.tsx`, `components/layout/header-client.tsx`, `components/layout/footer.tsx`, `components/portable-text.tsx`
- `app/(public)/page.tsx`, `app/(public)/klubi/toiminta/[slug]/page.tsx`, `app/api/revalidate/route.ts`
- `scripts/test-linkki.ts`, `scripts/test-palautus.ts`
- `package.json` (`patch:linkit`, `test:navigaatio`, test-ketju)
- `docs/09-editor-guide.md`, `docs/05-content-models.md`, `docs/23-yllapidettavyys.md`, `CLAUDE.md`

## 10. Järjestys ja riippuvuudet muihin
A (osiosivut) on mieluiten julkaistu ennen vaihetta 3, mutta B ei ole siitä riippuvainen, koska skripti on idempotentti ja ajetaan uudelleen. C rakentaa painikkeen ja liitteen B:n `linkki`-tyypin, `tekstinLinkki`-annotaation, `LIITTEEN_TIEDOSTOTYYPIT`-vakion ja `tiedostonKuvaus`-funktion varaan. D:n `ohjaus` käyttää `linkki`-tyyppiä (`vaadiLinkki`) ja `polunKohteet`-funktiota. E:n (Y20) poistokääre täydentää vakio-ikkunaa.

## Tarvitsee muilta

- A (osiosivut): listasivut sivu-dokumentteina, joilla on kiinteä _id, lukittu slug KOODIIN_SIDOTUT_SIVUT-listassa ja otsikko (esim. sivu "uutiset", "ottelut", "jalkapalloarkisto", "jalkapalloarkisto/huuhkajat", "jalkapalloarkisto/arvokisat", "jalkapalloarkisto/mestarit", "jalkapalloarkisto/stadionit", "ravintolat", "klubi/toiminta", "klubi/hallitus" ja mahdollisesti "klubi/yhteystiedot"). Kun ne on julkaistu productioniin, patch:linkit muuntaa valikon 12 ja etusivun 1 koodireittilinkkiä viittauksiksi. Ilman niitä linkit pysyvät Muu osoite -linkkeinä. B ei muuta A:n dokumentteja. A:n pitää vain varmistaa, että documentRoute({_type:"sivu", slug}) antaa koodireitin polun, mikä toteutuu jo nyt.
- A/Y25: klubi/hallitus- ja klubi/toiminta-sivujen dokumentit, jotta valikon Hallitus- ja Toiminta-kohdat voivat olla viittauksia.
- C (tekstilohkot): rikasSisalto käyttää B:n exportoimaa tekstinLinkki-annotaatiota (ei omaa linkkimäärittelyä), ja sen GROQ-projektiot kulkevat runko-fragmentin kautta, jotta linkkien kohteet puretaan.
- D (ohjaukset), valinnainen: webhookin projektioon "vanhaSlug": before().slug.current. B toimii ilman sitä ("linkit"-tagi tyhjennetään aina linkin kohdetyypin muuttuessa). D:n automaattiset ohjaukset pitävät myös Muu osoite -linkit toimivina polun muuttuessa.
- E (tila/käytettävyys, Y20): Poisto- ja Peru julkaisu -kääre voi täydentää Sanityn vakio-ikkunaa B:n viittausten kohdalla (esim. "Tähän sivuun linkitetään: Navigaatio, Klubin toiminta: Matkailu – vaihda linkki ensin"). B ei tee käärettä, koska vakio-ikkuna on suomeksi ja docs/09 ohjeistaa.

## Tarjoaa muille

- Sanity-objektityyppi `linkki` (sanity/schemas/objects/linkki.ts): kentät tyyppi: "sivu" | "osoite" | "tiedosto", kohde: reference, href: string ja tiedosto: file. Itsessään valinnainen; pakollisuus tulee isäntäkentän säännöllä `vaadiLinkki`.
- `linkkiKentat({ pakollinen: boolean })`: sama kenttäjoukko levitettäväksi objektiin, jolla on oma tekstikenttä. `linkinEsikatselu(otsikkoKentta)`: esikatselun select ja prepare.
- `tekstinLinkki` (sanity/schemas/objects/portableText.ts): tekstieditorin annotaatio `link`, jossa on linkkiKentat ja newTab. C:n rikasSisalto käyttää samaa.
- lib/linkki.ts: LINKIN_KOHDETYYPIT, LIITTEEN_TIEDOSTOTYYPIT (".pdf,.docx,.xlsx") ja tyypit LinkkiData, LinkinKohde, LinkinTiedosto ja LinkinTyyppi. Funktiot linkinTyyppi, linkinOsoite(l): string | null, tiedostonOsoite, tiedostonKuvaus ("PDF, 240 kt"), linkinKuvaus, ratkaiseLinkit ja kohteenTilaViesti.
- lib/path.ts: `polunKohteet(polku): {tyyppi, slug}[]` (documentRoute-funktion käänteinen; D:n ohjausten polkutarkistukseen) ja exportattu TYPE_BASE.
- lib/navigaatio.ts: ratkaiseNavigaatio, onYleissivuAlavalikossa, alatunnisteenSarakkeet (Y26:n osiovälilehdet voivat myöhemmin johtaa samasta) ja RaakaNavigaatioKohta.
- sanity/lib/navigaatio.ts: `haeNavigaatio()` (React cache): ratkaistu, stegaClean-puhdistettu ja tyhjistä osioista suodatettu valikko.
- sanity/lib/queries/linkki.ts: GROQ-fragmentit `linkki` ja `linkinKohde`. Runko-fragmentti purkaa tekstieditorin linkkien kohteet ja tiedostot.
- sanity/lib/linkin-kohde.ts: Studion säännöt kohteenTila ja sivullaOnValinta (varoitus, kun /polulle olisi oma dokumentti).
- Välimuistitagi "linkit": tyhjenee, kun minkä tahansa LINKIN_KOHDETYYPIT-dokumentin julkaisu muuttuu (RIIPPUVAT).
- lib/palautus.ts: `heikennaPuuttuvatViittaukset(doc, olemassa)`.

## Tuotantomuutokset

- Ennen jokaista kirjoitusta skripti ajaa `npm run backup` (production → varmuuskopiot/). Jos varmuuskopio epäonnistuu, mitään ei kirjoiteta.
- Vaihe 3, `npm run patch:linkit -- --production --vie` (PR 1:n deployn jälkeen): 6 dokumenttia ja 53 arvoa (tilanne 8.10.2026 ilman A:ta). navigaatio: 16 kohtaa, joista 4 sivuviittausta (/klubi ×2, /klubi/palloveikkaus, /jalkapalloarkisto/litmanen) ja 12 tyyppiä osoite. etusivu: heroCtas 1 sivu ja 1 osoite sekä esittely.ctaLinkki 1 sivu. klubiToiminta-matkailu: 23 sivuviittausta uutisiin. klubiToiminta-molkky: 1 osoite (YouTube). sivu-klubi: 9 tekstieditorin markDefiä → klubiToiminta-viittaukset. uutinen-blogspot-2702900233159075591: 1 markDef → arvokisa-em-2008. Vanhat href-, url- ja ctaHref-arvot jätetään paikalleen. Jokaisessa patchissa ifRevisionId, ja ennen kirjoitusta tarkistetaan, että jokaisen viittauksen documentHref on sama kuin vanha href.
- Vaihe 4, ehdollinen: jos A:n osiosivut julkaistaan B:n jälkeen, sama komento uudelleen. Enintään 11 navigaation ja 1 pikalinkin osoitetta muuttuu viittaukseksi samoissa dokumenteissa (ei uusia dokumentteja).
- Vaihe 5, noin 2 viikon kuluttua, `npm run patch:linkit -- --production --vie --poista-vanhat`: samat 6 dokumenttia. Poistetaan navigaation href 4, heroCtas href 1, tekstieditorin href 10, klubiToiminta url 24 ja etusivu ctaHref 1 (enemmän, jos A ehti ensin). Sen jälkeen PR 2 poistaa vanhat kentät ja kaksoisluvun koodista.
- Ei uusia dokumentteja, ei --replace-ajoa, ei webhookin asetusmuutosta eikä datasetin näkyvyysmuutosta. Kaikki vaiheet ajetaan ensin developmentiin (oletus ilman --production-lippua).

## Riskit

- Vahvat viittaukset estävät viitatun sivun tai uutisen poiston ja julkaisun perumisen, esimerkiksi 23 matkakuvausta Matkailu-sivulta. Isä voi hämmentyä, vaikka ikkuna on suomeksi ja listaa viittaajat. Torjunta: docs/09:n rivi ohjeineen ja sääntö, joka varoittaa käyttämättömästä kohde-valinnasta. E:n Y20-kääre voi parantaa viestiä.
- Palautus varmuuskopiosta epäonnistuu, jos palautettava dokumentti viittaa sen jälkeen poistettuun dokumenttiin, koska Content Lake hylkää vahvan viittauksen puuttuvaan kohteeseen. Torjunta: kohta 5, heikennaPuuttuvatViittaukset ja testit.
- Vercelin Instant Rollback vanhaan koodiin rikkoisi viittauksiksi muutetut linkit, jos vanhat arvot olisi poistettu. Torjunta: patch säilyttää href-, url- ja ctaHref-arvot, ja --poista-vanhat ajetaan vasta vakaan jakson jälkeen.
- Isä voi muokata samaa dokumenttia kesken patchin, jolloin ifRevisionId hylkää muutoksen. Skripti tulostaa tämän, ja ajo toistetaan. Luonnokset patchataan samalla tavalla, jotta vanhan muotoisen luonnoksen julkaisu ei palauta merkkijonoja. Kaksoisluku sietää senkin.
- Runko-fragmentin muutos koskee kaikkia 20 tekstieditorin kyselyä. Kirjoitusvirhe GROQissa kaataa sivuja buildissa. Torjunta: npm run build, verify:content-routes ja ravintola-arvion review-projektion lisäys. Tekstieditorin linkkien kohteiden polunmuutos näkyy muissa dokumenteissa 60 sekunnin viiveellä (ei webhookia).
- Alatunnisteen sisältö muuttuu kävijälle näkyvästi: Uutisarkisto, Tapahtumat ja Kuvagalleria jäävät pois, ja 9 linkkiä tulee lisää. Sarakkeiden määrä vaihtelee valikon mukaan. Tämä on päätöksen 7.10. mukaista. Torjunta: CSS-muuttujaan perustuva ruudukko, saavutettavuustesti ja tarkistus 320 px leveydellä.
- Sanityn esikatselun select viittauksen läpi (kohde._type) on tarkistettava Studiossa. Jos se ei toimi, alaotsikkona näytetään kohteen nimi ilman polkua (näkyvä, ei toiminnallinen riski).
- Piilotettujen kenttien validointi ajetaan Sanityssa myös piilossa. Siksi jokainen sääntö palauttaa true, kun kenttä ei ole aktiivinen. Unohtunut tarkistus näkyisi isälle käsittämättömänä virheenä piilossa olevasta kentästä. Torjunta: Studiotesti kaikilla kolmella tyypillä ja tyypin vaihdolla.
- Viittausvalitsimen haku kattaa noin 1400 dokumenttia (uutiset ja ravintolat). Samannimisiä osumia voi olla monta, joten isä voi valita väärän. Torjunta: esikatselu näyttää tyypin, ja tallennuksen jälkeen alaotsikko näyttää polun.
- Ajastettuun uutiseen osoittava linkki on piilossa julkaisuaikaan asti ja palaa noin minuutin viiveellä. Tästä varoitetaan Studiossa ja oppaassa.

## Avoimet päätökset



---

# C. Tekstilohkot ja kuvasarja (Y9, Y14, Y15): rajattu `rikasSisalto`-tyyppi (sivu, uutinen, tapahtuma, klubin toiminta) ja sen kuusi uutta lohkoa: kuvasarja, liite, huomiolaatikko, painike, taulukko sekä kartta tai upotus. Lisäksi uutiskortin kuvan ja otteen varakäytös sekä jakokuvan laajennus kuvasarjaan.

**Yhteenveto:** Toteutuksen jälkeen isä voi tehdä uutisen, sivun, tapahtuman ja klubin toiminnan tekstiin nämä asiat. (1) Kuvasarja: kaikki kuvat raahataan kerralla, ja yksi yhteinen kuvaus riittää julkaisuun. Kuvakohtaiset kuvaukset ovat suositus, eivät pakko. Ilman niitä kuvan alt-teksti on muotoa "Klubin vappu 2026, kuva 3/9". (2) PDF-, Word- tai Excel-liite (esim. vuosikokouskutsu), joka näkyy latauslinkkinä tiedoston tyypin ja koon kanssa. (3) Huomiolaatikko kahdella sävyllä (Tiedote ja Tärkeä). (4) Painike (Ilmoittaudu, Lue säännöt), kun B:n linkkiobjekti on valmis. (5) Pieni taulukko samalla Excel-tyyppisellä editorilla kuin tilastoissa, liitä-toiminto mukaan lukien. (6) Google Maps -kartta, Google Forms -lomake tai Vimeo-video. Ne latautuvat vasta painalluksesta, samoin kuin YouTube-video. Uutisen voi julkaista ilman kansikuvaa ja Lyhennettä: listassa ja etusivulla näkyy silloin tekstin ensimmäinen iso kuva ja tekstin alku. Jakokuva löytää kuvan myös kuvasarjasta. Productioniin ei kirjoiteta mitään, koska tietomuoto on yhteensopiva. Isä ei edelleenkään voi lisätä tekstiin vapaata HTML:ää, iframea muusta palvelusta, sarakeasetteluja, taustavärejä eikä uusia lohkotyyppejä. Muun kuin sallitun palvelun upotus vaatii kehittäjän. Lohkot eivät näy ravintola-arviossa, lehtileikkeessä, tilastojen johdannoissa tai muissa tavallisen `portableText`-kentän paikoissa (päätös Y15). Tekstin yksittäisen kuvan alt-teksti pysyy pakollisena (CLAUDE.md). Pikatienä on kuvasarja. Poistettu liite jää julkiseksi tiedostoksi, kunnes se poistetaan tiedostovalitsimesta (ohje docs/09:ssä).

**Työmäärä:** 7 päivää

## Nykytila

SKEEMA
- `sanity/schemas/objects/portableText.ts:5-73`: yksi jaettu `portableText` (block + `imageWithAlt` + `kokoonpano` + `youtubeVideo`), linkkiannotaatio merkkijonona (`tarkistaLinkki` ja `linkinKohdeVaroitus`). Käytössä 12 kentässä: arvokisa.ts:131, jalkapalloTilasto.ts:151 ja 226, klubiToiminta.ts:56, lehtileike.ts:87, pelaaja.ts:175 ja 195, ravintola.ts:219, sivu.ts:116, stadion.ts:79, tapahtuma.ts:85, uutinen.ts:95 ja etusivu.ts:226.
- Kuvatyypit: `imageWithAlt.ts` (alt pakollinen, 3–200 merkkiä, virhe), `galleriaKuva.ts` (alt pelkkä varoitus, kuvateksti valinnainen, varalla "albumin nimi + numero"; kuvia voi raahata useita kerralla, `galleriaAlbumi.ts:50-57` `options.layout: "grid"`), `paivattyKuva.ts`. Tiedostokenttä on vain varmuuskopiossa (`varmuuskopio.ts:29`).
- `uutinen.ts:72-87`: Lyhenne (`excerpt`) pakollinen custom-säännöllä. `uutinen.ts:88-93`: Kansikuva ilman ohjetta. `uutinen.ts:92-106`: body. `tapahtuma.ts:82-88`: description pakollinen. `klubiToiminta.ts:53-58`: kuvaus.
- Taulukkoeditori `sanity/components/taulukkoeditori/`. Patchit ovat suhteellisia kontekstin tarjoavaan objektiin (`patchit.ts:37`, `["rows",…]`, `["columns",…]`). Ainoa absoluuttinen polku on `TaulukkoEditori.tsx:84` `useFormValue(["columns"])`. Konteksti `konteksti.tsx` `TilastoDokumenttiInput` (ObjectInputProps.onChange). Tietomalli `columns[]{key,label,type}` ja `rows[]{cells[]{key,value}}`, puhdas logiikka `lib/taulukko.ts`, renderöijä `components/ui/stat-table.tsx` (caption ja th scope).
- Sanity 5.31.2: `ArrayOptions.insertMenu` (alpha, groups/views) ja `ObjectOptions.modal {type, width}` ovat olemassa (`@sanity/types` index.d.ts:694-715, 731-739, 895-906). Insert-valikkoa luetaan taulukkosyötteessä. PTE:n työkalupalkin ryhmittelyä ei ole varmistettu.
- Ikonit (`@sanity/icons`): ImagesIcon, DocumentPdfIcon, InfoOutlineIcon, WarningOutlineIcon, ThListIcon, PinIcon, EarthGlobeIcon, LaunchIcon ja ArrowRightIcon ovat olemassa. TableIcon ei ole.

RENDERÖINTI
- `components/portable-text.tsx:47-136`: komponenttikartta (imageWithAlt figure, kokoonpano, youtubeVideo client-komponentille vain data). Otsikkotasojen siirto `ylinTaso` ja ingressi `kappaleIngressilla`.
- `components/youtube-video.tsx`: julkisivumalli (esikatselu, painike, iframe vasta klikistä, fokus iframeen, ilman JS:ää linkki). Upotuksen malli on tämä.
- `components/gallery/album-grid.tsx`: client, button-ruudut, `albumTitle`-varateksti ("Avaa kuva 3/8 albumista X") ja `kokonaisena`-tila. Kiinteä `grid-cols-2 sm:3 lg:4`. `lightbox.tsx:227-231` alt-varateksti `${albumTitle}, kuva i/n`. Kuvasarja käyttää näitä sellaisenaan.
- `components/ui/button.tsx` `LinkButton` (ulkoinen avautuu aina uuteen välilehteen, `UusiValilehti`).
- Värit `app/globals.css:24-73`: blue-tint #e6e9fb, brass-tint #f3ead8, brass-tint-text #5c4315, foreground #1b1d26, navy #141f4d, brass #b8862e. Tummaa tilaa sivustolla ei ole.

KYSELYT
- `sanity/lib/queries/kuvat.ts:29` `runko = ..., _type == "imageWithAlt" => { lqip }`. Käytössä 19 kyselykohdassa. Neljän rikkaan tyypin rungot: `queries.ts:62` (sivu catch-all), `klubi.ts:54` (klubiSivu), `klubi.ts:150` (klubiToiminta.kuvaus), `uutiset.ts:164` (uutinen), `uutiset.ts:254` (tapahtuma.description). Lisäksi `etusivu.ts:79` (esittelylohko, pysyy perustyyppinä).
- Uutiskortti: `uutiset.ts:77-85` `uutinenCardFields` (`coverImage{kuva}`, excerpt, tiivistelma), jota myös `uutinenDetailQuery` (`:162`) käyttää. Samaa projektiota on käsin kolmessa paikassa: `etusivu.ts:26-34` nostoKortti, `queries.ts:80-91` recentUutisetQuery ja `lehtileikkeet.ts:85-96`. Kortteja käyttävät `components/news-card.tsx:25-42`, `components/blocks/hero.tsx:174, 216`, `components/blocks/uutiset-block.tsx:80-122`. Uutissivulla iso kansikuva näkyy vain, kun `coverImage.asset` on olemassa (`uutiset/[slug]/page.tsx:196`).
- Jakokuva `lib/seo.ts:93-113` `jakokuvaSisallosta`: vain `imageWithAlt` ≥600 px (mitat viittauksesta, `kuvanMitat` :62-66), sitten YouTube. Kuvasarjaa ei ole.
- Lukuaika ja ingressi `lib/artikkeli.ts`: vain `_type == "block"`, joten uudet lohkot eivät vaikuta. Haku `uutiset.ts:126` `pt::text(body)`. ICS `tapahtumat/[slug]/ics/route.ts:41` `toPlainText` ohittaa objektit.
- Stega on päällä luonnosnäkymässä (`sanity/lib/fetch.ts:87`). Renderöijät puhdistavat href:t `stegaClean`illa (esim. `hero.tsx:282`).
- Webhook `app/api/revalidate/route.ts:28-37` RIIPPUVAT. Inline-lohkot eivät tarvitse uusia riippuvuuksia.
- CSP `next.config.ts:40` vain `frame-ancestors 'self'`, joten iframet eivät esty.
- Varmuuskopio `lib/varmuuskopio.ts:31` ohittaa vain `varmuuskopio-`-alkuiset tiedostot. Liitetiedostojen metatiedot ovat kopiossa.
- Testit `scripts/test-*.ts` (assert/strict, `test()`-apuri), CI `.github/workflows/tarkistukset.yml`: type-check, lint ja `npm test`. `groq-js` 1.30.3 on node_modulesissa vain välillisenä riippuvuutena. `sanity/extract.json` ei ole gitissä.

PRODUCTION (luettu GROQ:lla 8.10.2026, perspective raw)
- Uutisia 753 (ilman luonnoksia), sivuja 8, tapahtumia 0, toimintamuotoja 9, kuvia 1719 ja tiedostoja 2 (varmuuskopioita).
- Neljän rikkaan tyypin rungoissa esiintyvät lohkot: block, imageWithAlt ja youtubeVideo (1 uutinen 16deaa03…). Kokoonpanoa ei ole niissä yhtään (1 kpl jalkapalloTilastossa). Kenttätyypin vaihto ei siis vaadi datamuutosta.
- 215 uutista ilman kansikuvaa, joista 46:lla on kuva tekstissä. Kaikkien 46:n ensimmäinen tekstikuva on vähintään 600 px leveä (945–2048 px), ja kaikki ovat Blogspot-tuonteja, joissa teksti alkoi tekstillä (`parse-blogspot.ts:531`). Korttikuvan varakäytös testattiin productionia vasten ("Suomi - Englanti 13.10.2024" → Cole Palmer -kuva 1645×2048).
- 17 uutisessa on vähintään 5 tekstikuvaa (enintään 12). 29.9. tuodun jutun 8 kuvalla on sama alt. Tämä on kuvasarjan kohderyhmä.
- Lyhenne puuttuu 0 uutiselta. Lyhenteen muuttaminen valinnaiseksi ei siis muuta nykyistä näkymää. `pt::text(body[_type=="block" && style=="normal" && !defined(listItem)][0...3])` toimii productionissa ja antaa saman tekstin kuin migraation lyhenne.

## Suunnitelma

# C. Tekstilohkot ja kuvasarja: toteutussuunnitelma

## 0. Periaatteet ja rajaus (sitovat)

- **Ei uusia lohkoja jaettuun `portableText`iin** (docs/23 Y15 ja liitteen hylätyt ratkaisut). Tehdään uusi taulukkotyyppi `rikasSisalto`, jota käyttävät vain `sivu.body`, `uutinen.body`, `tapahtuma.description` ja `klubiToiminta.kuvaus`. Muut 8 käyttöpaikkaa (lehtileike, ravintola, tilastojen johdanto ja lisätiedot, arvokisa, pelaaja, stadion, etusivun esittely) pysyvät ennallaan.
- **Ei datamigraatiota.** Portable Text -taulukko tallentuu ilman taulukon tyyppinimeä. Productionin rungoissa on vain lohkot block, imageWithAlt ja youtubeVideo, jotka kaikki ovat mukana `rikasSisalto`ssa. Kenttätyypin vaihto on pelkkä skeemamuutos.
- **Lohkoja on yhdeksän**, kuusi niistä uusia: Kuva, Kuvasarja, YouTube-video, Kartta tai upotus, Huomiolaatikko, Painike, Liite, Taulukko ja Kokoonpano. Kokoonpano säilyy, koska se on ollut uutisessa ennenkin, eikä mahdollisuutta poisteta. Ei sarakeasetteluja, taustavärejä eikä vapaata HTML:ää.
- **Taulukko on upotettu (inline), ei viittaus `jalkapalloTilasto`on.** Tämä poikkeaa docs/23:n Y15 (3) -kohdasta. Perustelut: (a) viittauksella isän pitäisi luoda erillinen dokumentti otsikkoineen, polkuineen ja kategorioineen. (b) Uutisen pieni taulukko kuuluu vain sille uutiselle (sisältömallinnuksen sääntö: oma sisältö upotetaan, uudelleenkäytettävä viitataan). (c) Olemassa olevan editorin saa käyttöön yhdellä rivin muutoksella. Uudelleenkäytettävät tilastot näytetään sivulla edelleen Sivu → Taulukot -kentällä (Y16).
- **Alt-käytäntö:** tekstin yksittäinen Kuva (`imageWithAlt`) pitää alt-tekstin pakollisena (CLAUDE.md). Kuvasarja käyttää valmista `galleriaKuva`-tyyppiä, jossa alt on suositus. Yhteinen kuvaus on pakollinen ja toimii jokaisen kuvan varatekstinä ("Klubin vappu 2026, kuva 3/9"). Gallerian ratkaisu on jo hyväksytty, joten jokaisella kuvalla on aina merkityksellinen alt.
- **Upotukset vain sallitusta listasta:** Google Maps, Google Forms ja Vimeo. YouTubelle on oma lohkonsa. Iframe ladataan vasta painalluksesta (YouTube-lohkon malli).
- Toteutusvaiheet: **C1** (ei riipu muista, tehdään heti, koska blogi on katkaistu): rikasSisalto, kuvasarja, korttikuvan ja otteen varakäytös, jakokuva, liite, huomiolaatikko, taulukko ja upotus. **C2** (B:n `linkki`-objektin jälkeen): painike. C2 lisää yhden lohkon ja yhden runko-haaran.

## 1. Uudet ja muutettavat tiedostot

| Tiedosto | Muutos |
|---|---|
| `lib/sisaltolohkot.ts` | UUSI. Lohkolistat, kuvien poiminta, kuvan mitat, ote ja huomion sävyt (puhdas) |
| `lib/liite.ts` | UUSI. Liitteen säännöt (puhdas) |
| `lib/upotus.ts` | UUSI. Sallittujen upotusten tulkinta (puhdas) |
| `sanity/schemas/objects/portableText.ts` | `tekstiLohko` exportiksi, `of` rakennetaan `PERUSLOHKOT`-listasta |
| `sanity/schemas/objects/rikasSisalto.ts` | UUSI |
| `sanity/schemas/objects/kuvasarja.ts` | UUSI |
| `sanity/schemas/objects/liite.ts` | UUSI (lohko ja `liitetiedostoKentta`-tehdas) |
| `sanity/schemas/objects/huomio.ts` | UUSI |
| `sanity/schemas/objects/taulukko.ts` | UUSI |
| `sanity/schemas/objects/taulukkoKentat.ts` | UUSI. Jaetut `columns`- ja `rows`-kentät |
| `sanity/schemas/objects/upotus.ts` | UUSI |
| `sanity/schemas/objects/painike.ts` | UUSI (C2) |
| `sanity/schemas/objects/galleriaKuva.ts` | Kuvauksen teksti yleiseksi (albumi tai kuvasarja) |
| `sanity/schemas/documents/{sivu,uutinen,tapahtuma,klubiToiminta}.ts` | `type: "rikasSisalto"`. Uutiseen kansikuvan ja Lyhenteen ohjeet ja säännöt |
| `sanity/schemas/documents/jalkapalloTilasto.ts` | `columns` ja `rows` jaetuista määrittelyistä, konteksti-input nimetään uudelleen |
| `sanity/schemas/index.ts` | Uudet tyypit rekisteriin |
| `sanity/components/taulukkoeditori/TaulukkoEditori.tsx` | `useFormValue` suhteelliseksi |
| `sanity/components/taulukkoeditori/konteksti.tsx` | `TilastoDokumenttiInput` → `TaulukkoKontekstiInput` |
| `sanity/lib/queries/kuvat.ts` | `runko` laajennus ja `korttikuva()` |
| `sanity/lib/queries/uutiskortti.ts` | UUSI. Jaettu uutiskortin projektio |
| `sanity/lib/queries/uutiset.ts`, `etusivu.ts`, `sanity/lib/queries.ts`, `lehtileikkeet.ts` | Uutiskortti jaetusta fragmentista. Detail-kysely ilman varakuvaa |
| `lib/seo.ts` | Jakokuva kuvasarjasta, `kuvanMitat` tuodaan `lib/sisaltolohkot`ista |
| `lib/types.ts` | `UutinenCard.ote?: string \| null` |
| `components/portable-text.tsx` | Uudet renderöijät ja tyypitetty kattavuus |
| `components/kuvasarja.tsx`, `components/liite-kortti.tsx`, `components/huomiolaatikko.tsx`, `components/upotus.tsx` | UUSIA |
| `components/gallery/album-grid.tsx` | Prop `sarakkeet?: 3 \| 4` |
| `components/news-card.tsx`, `components/blocks/hero.tsx`, `components/blocks/uutiset-block.tsx` | `korttiOte(news)` |
| `app/(public)/uutiset/[slug]/page.tsx` | Meta-kuvauksen viimeinen vara `news.ote` |
| `scripts/test-lohkot.ts`, `scripts/test-upotus.ts` | UUSIA |
| `package.json` | `test:lohkot`, `test:upotus`, `npm test` -ketjuun. devDependency `groq-js` (^1.30.3, Sanityn MIT-kirjasto, ei lukitse) |
| `docs/09-editor-guide.md`, `docs/05-content-models.md`, `docs/19-taulukkoeditori.md`, `docs/23-yllapidettavyys.md` (§0 Toteutettu), `CLAUDE.md` (komennot) | Dokumentaatio samassa muutoksessa |

## 2. Puhtaat kirjastot

### 2.1 `lib/sisaltolohkot.ts`
```ts
/** Rikkaan sisällön (sivu, uutinen, tapahtuma, klubin toiminta) muut kuin tekstilohkot, Studion valikon järjestyksessä. */
export const RIKKAAT_LOHKOT = [
  "imageWithAlt", "kuvasarja", "youtubeVideo", "upotus",
  "huomio", "liite", "taulukko", "kokoonpano",
  // C2: "painike" lisätään huomion jälkeen, kun B:n linkki-objekti on valmis
] as const;
export type RikasLohko = (typeof RIKKAAT_LOHKOT)[number];
/** Tavallinen `portableText` (arkisto, ravintola-arvio, lehtileike …): nykyiset kolme, järjestys ennallaan. */
export const PERUSLOHKOT = ["imageWithAlt", "kokoonpano", "youtubeVideo"] as const satisfies readonly RikasLohko[];

/** Tekstikuvalta vaadittu leveys kortti- ja jakokuvaksi (sama kuin lib/seo MIN_LEVEYS_SISALTO). */
export const KUVAN_MIN_LEVEYS_SISALTO = 600;

/** Kuvan mitat viittauksesta image-<hash>-<w>x<h>-<ext> (siirretään lib/seo.ts:stä). */
export function kuvanMitat(image: unknown): { w: number; h: number } | null;

type Lohko = { _type?: string; asset?: unknown; kuvat?: readonly { asset?: unknown }[] | null };
/** Tekstin kuvat järjestyksessä: yksittäiset kuvat ja kuvasarjojen kuvat litistettynä, vain ne, joilla on asset. */
export function sisallonKuvat<T extends Lohko>(lohkot: readonly T[] | null | undefined): unknown[];
/** Ensimmäinen kuva, jonka leveys viittauksesta on ≥ min; null jos ei ole. */
export function ensimmainenIsoKuva(lohkot, min = KUVAN_MIN_LEVEYS_SISALTO): unknown | null;

/** Kortin teksti, kun Lyhenne puuttuu: välilyönnit yhdeksi, enintään 200 merkkiä sanarajalla + "…". */
export function korttiOte(teksti: string | null | undefined, max = 200): string | null;
/** Kortin näkyvä teksti: excerpt (GROQ:ssa jo coalesce(excerpt, tiivistelma)), muuten korttiOte(ote). */
export function korttiTeksti(k: { excerpt?: string | null; ote?: string | null }): string | null;

export const HUOMION_SAVYT = [
  { value: "tieto", title: "Tiedote (sininen)", nimi: "Tiedote" },
  { value: "tarkea", title: "Tärkeä (keltainen)", nimi: "Tärkeä" },
] as const;
export type HuomionSavy = (typeof HUOMION_SAVYT)[number]["value"];
/** Tuntematon tai puuttuva arvo → "tieto". */
export function huomionSavy(arvo: unknown): HuomionSavy;
```

### 2.2 `lib/liite.ts`
```ts
export const LIITTEEN_PAATTEET = ["pdf", "docx", "xlsx"] as const;
export const LIITTEEN_ACCEPT = ".pdf,.docx,.xlsx,application/pdf";
/** Pääte viittauksesta file-<hash>-<ext>. */
export function tiedostonPaate(ref: string | null | undefined): string | null;
/** Studion validointi: true | virheteksti. */
export function tarkistaLiitetiedosto(arvo: { asset?: { _ref?: string } } | undefined): true | string;
//  → "Sallitut tiedostot: PDF, Word (.docx) ja Excel (.xlsx). Tallenna tiedosto ensin johonkin näistä muodoista."
export function tiedostonTyyppi(paate: string | null | undefined): string; // pdf→"PDF", docx→"Word", xlsx→"Excel", muu→ISOT KIRJAIMET
export function tiedostonKoko(tavut: number | null | undefined): string | null; // 512→"1 kt", 245760→"240 kt", 1250000→"1,2 Mt" (fi-FI, kt = 1024 B)
/** Linkin sulkeisiin tuleva teksti, esim. "PDF, 240 kt". */
export function liitteenTiedot(t: { extension?: string | null; size?: number | null }): string;
export const LIITE_ISO_TAVUA = 15 * 1024 * 1024; // varoitusraja
```

### 2.3 `lib/upotus.ts`
```ts
export type UpotusPalvelu = "google-maps" | "google-forms" | "vimeo";
export type Upotus = {
  palvelu: UpotusPalvelu;
  src: string;            // iframe src, aina https
  avaaOsoite: string;     // "Avaa palvelussa" -linkki
  suhde: "4/3" | "16/9" | null;
  korkeus: number | null; // px, kun suhde null (lomake)
};
export const UPOTUSPALVELUT: Record<UpotusPalvelu, { nimi: string; nayta: string; avaa: string; latausteksti: string }> = {
  "google-maps":  { nimi: "Google Maps",  nayta: "Näytä kartta",  avaa: "Avaa Google Mapsissa",  latausteksti: "Kartta ladataan Google Mapsista. Google voi tallentaa evästeitä laitteellesi." },
  "google-forms": { nimi: "Google Forms", nayta: "Näytä lomake",  avaa: "Avaa lomake Googlessa", latausteksti: "Lomake ladataan Googlelta. Google voi tallentaa evästeitä laitteellesi." },
  vimeo:          { nimi: "Vimeo",        nayta: "Näytä video",   avaa: "Avaa Vimeossa",         latausteksti: "Video ladataan Vimeosta. Vimeo voi tallentaa evästeitä laitteellesi." },
};
/** Iframe-koodista src (myös &amp;) ja height, tai pelkkä osoite trimmattuna. */
export function poimiOsoite(syote: string | null | undefined): { url: string; korkeus: number | null } | null;
export function tulkitseUpotus(syote: string | null | undefined): Upotus | null;
/** Studion virheteksti tai null, kun kelpaa. */
export function upotuksenVirhe(syote: string | null | undefined): string | null;
```
Säännöt (testattavat):
- **Google Maps:** host `www.google.com`, `google.com` tai `maps.google.com` ja polku `/maps/embed` (kyselyosa säilyy) → `suhde "4/3"`, `avaaOsoite = src`. `…/maps?…&output=embed` → src sellaisenaan, `avaaOsoite` ilman `output`-parametria.
- **Mapsin jakolinkit** (`maps.app.goo.gl`, `goo.gl/maps`, `google.com/maps/place|@|dir`) → virhe: "Tämä on Google Mapsin jakolinkki, jota ei voi upottaa. Avaa kartta, valitse Jaa → Upota kartta → Kopioi HTML ja liitä koko koodi tähän."
- **Google Forms:** `docs.google.com/forms/d/e/<id>/viewform` (myös ilman `embedded`) → `src = https://docs.google.com/forms/d/e/<id>/viewform?embedded=true`, `avaaOsoite` ilman `embedded`-parametria, `korkeus = iframe height ?? 900` (rajat 400–3000), `suhde null`.
- **Formsin muut osoitteet:** `/forms/d/<id>/edit` → virhe "Tämä on lomakkeen muokkausosoite. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi ja liitä koodi tähän." `forms.gle/…` → virhe "Lyhytlinkkiä ei voi upottaa. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi."
- **Vimeo:** `vimeo.com/<numero>[/<hash>]` tai `player.vimeo.com/video/<numero>[?h=<hash>]` → `src = https://player.vimeo.com/video/<id>?dnt=1[&h=<hash>]`, `avaaOsoite = https://vimeo.com/<id>`, `suhde "16/9"`.
- **YouTube** (`tulkitseYoutube` ≠ null) → virhe "YouTube-videolle on oma lohko: valitse + -valikosta YouTube-video."
- `http:` → hyväksytään ja muutetaan https:ksi. `javascript:`, `data:` ja muut → null.
- **Muut** → virhe "Tätä palvelua ei voi upottaa. Sallitut: Google Maps -kartta, Google Forms -lomake ja Vimeo-video. Muulle sivulle voit lisätä tekstiin linkin tai painikkeen."
- Tyhjä → null (pakollisuus hoidetaan säännöllä `required`).

## 3. Skeemat

### 3.1 `portableText.ts` (refaktorointi, käytös ennallaan)
- Siirrä nykyinen block-jäsen vakioksi `export const tekstiLohko = defineArrayMember({ type: "block", … })` sellaisenaan (tyylit, listat ja linkkiannotaatio).
- `of: [tekstiLohko, ...PERUSLOHKOT.map((type) => defineArrayMember({ type }))]`. Järjestys pysyy (kuva, kokoonpano, video).
- B lisää annotaation `sisainenLinkki` `tekstiLohko`on, jolloin se tulee molempiin tyyppeihin.

### 3.2 `rikasSisalto.ts`
```ts
export const rikasSisalto = defineType({
  name: "rikasSisalto",
  title: "Sisältö",
  type: "array",
  of: [tekstiLohko, ...RIKKAAT_LOHKOT.map((type) => defineArrayMember({ type }))],
  options: {
    insertMenu: {
      filter: false,
      groups: [
        { name: "kuvat", title: "Kuvat ja video", of: ["imageWithAlt", "kuvasarja", "youtubeVideo", "upotus"] },
        { name: "tiedotteet", title: "Tiedotteet ja tiedostot", of: ["huomio", "painike", "liite"] },
        { name: "taulukot", title: "Taulukot", of: ["taulukko", "kokoonpano"] },
      ],
      views: [{ name: "list" }],
    },
  },
});
```
Studiossa tarkistetaan, näyttääkö tekstieditorin työkalupalkki ryhmät. Jos ei näytä, järjestys ja ikonit riittävät, eikä muuta tehdä (vain kirjaus docs/05:een).

### 3.3 Dokumenttien kentät
- `sivu.ts:113-118` body, `uutinen.ts:92-106` body, `tapahtuma.ts:82-88` description ja `klubiToiminta.ts:53-58` kuvaus: `type: "portableText"` → `type: "rikasSisalto"`. Muuten ennallaan (validoinnit, otsikot, ryhmät).
- **uutinen.coverImage** (Y9 2): description "Näkyy uutislistassa, etusivulla ja kun linkki jaetaan. Jos jätät tyhjäksi, käytetään tekstin ensimmäistä isoa kuvaa." Validointi: `rule.custom((arvo, ctx) => arvo?.asset || ensimmainenIsoKuva((ctx.document as {body?: unknown[]})?.body) ? true : "Uutisessa ei ole kansikuvaa eikä isoa kuvaa tekstissä. Listassa näkyy pelkkä teksti ja jaossa klubin logo.").warning()`.
- **uutinen.excerpt** (Y9 3, katso avoin päätös): poista custom-sääntö "Lyhenne on pakollinen", jätä `rule.max(200).warning("Lyhenne näkyy listassa enintään noin 200 merkin pituisena.")`. Uusi description: "Valinnainen. 1–2 virkettä uutislistalle. Jos jätät tyhjäksi, listalla näkyy tekstin alku." E:llä on oikeus muotoilla teksti Y10:n ohjeuudistuksessa. Kentän nimi ja sijainti eivät muutu.

### 3.4 `kuvasarja.ts`
```ts
defineType({
  name: "kuvasarja", title: "Kuvasarja (useita kuvia)", type: "object", icon: ImagesIcon,
  fields: [
    defineField({
      name: "kuvat", title: "Kuvat", type: "array", of: [{ type: "galleriaKuva" }],
      options: { layout: "grid" },
      description: "Raahaa kaikki kuvat tähän kerralla tietokoneen kansiosta (puhelimessa: Lataa → valitse useita). Järjestä raahaamalla.",
      validation: (r) => [
        r.required().min(1).error("Lisää kuvasarjaan kuvia."),
        r.min(2).warning("Yhdelle kuvalle käytä lohkoa Kuva."),
        r.max(60).warning("Yli 60 kuvaa: harkitse galleria-albumia."),
      ],
    }),
    defineField({
      name: "kuvaus", title: "Mitä kuvissa on (yhteinen kuvaus)", type: "string",
      description: 'Esim. "Klubin vappu 2026 Lahden torilla". Näkyy kuvien alla, ja ruudunlukija käyttää sitä kuvien kuvauksena, jos kuvalla ei ole omaa kuvausta (“Klubin vappu 2026, kuva 3/9”).',
      validation: (r) => r.required().min(3).max(120).error("Kirjoita kuvasarjalle lyhyt kuvaus (3–120 merkkiä)."),
    }),
    defineField({
      name: "asettelu", title: "Kuvien muoto", type: "string",
      options: { list: [
        { title: "Tasainen ruudukko (kuvat rajataan neliöiksi)", value: "ruudukko" },
        { title: "Kokonaiset kuvat (kuvakaappaukset, lehtileikkeet, kaaviot)", value: "kokonaisena" },
      ], layout: "radio" },
      initialValue: "ruudukko",
    }),
  ],
  preview: {
    select: { kuvaus: "kuvaus", kuvat: "kuvat", media: "kuvat.0" },
    prepare: ({ kuvaus, kuvat, media }) => ({
      title: kuvaus || "Kuvasarja",
      subtitle: `Kuvasarja · ${kuvat?.length ?? 0} kuvaa`,
      media: media ?? ImagesIcon,
    }),
  },
})
```
`galleriaKuva.ts`: alt-kentän description → "Suositeltava, ei pakollinen. Esim. "Klubilaiset Lahden stadionin katsomossa". Ilman kuvausta sivu käyttää albumin nimeä tai kuvasarjan kuvausta ja kuvan numeroa." Kuvatekstin description → "Näkyy suurennetun kuvan alla."

### 3.5 `liite.ts`
```ts
export const liitetiedostoKentta = (overrides?: Partial<FileDefinition>) => defineField({
  name: "tiedosto", title: "Tiedosto", type: "file",
  options: { accept: LIITTEEN_ACCEPT, storeOriginalFilename: true },
  description: "PDF, Word (.docx) tai Excel (.xlsx). Tiedosto on julkinen: kuka tahansa, jolla on linkki, voi avata sen. Älä liitä jäsenluetteloita, pöytäkirjoja, joissa on henkilötietoja, tai muuta luottamuksellista.",
  validation: (r) => [
    r.required().error("Valitse tiedosto."),
    r.custom(tarkistaLiitetiedosto),
    r.custom(async (arvo, ctx) => { /* ctx.getClient({apiVersion:"2025-02-19"}).fetch("*[_id==$id][0].size",{id}) > LIITE_ISO_TAVUA → "Tiedosto on iso (x Mt). Pienennä PDF (esim. Wordissa Tallenna nimellä → PDF → Pienin koko)." */ }).warning(),
  ],
  ...overrides,
});
export const liite = defineType({
  name: "liite", title: "Liite (PDF, Word, Excel)", type: "object", icon: DocumentPdfIcon,
  fields: [
    defineField({ name: "otsikko", title: "Linkin teksti", type: "string",
      description: 'Mikä tiedosto on, esim. "Vuosikokouskutsu 2027" tai "Klubin säännöt". Sivulla näkyy myös tiedoston tyyppi ja koko.',
      validation: (r) => r.required().min(3).max(100).error("Kirjoita liitteelle nimi (3–100 merkkiä).") }),
    liitetiedostoKentta(),
  ],
  preview: {
    select: { otsikko: "otsikko", ext: "tiedosto.asset.extension", koko: "tiedosto.asset.size", nimi: "tiedosto.asset.originalFilename" },
    prepare: ({ otsikko, ext, koko, nimi }) => ({ title: otsikko || nimi || "Liite", subtitle: `Liite · ${liitteenTiedot({ extension: ext, size: koko })}`, media: DocumentPdfIcon }),
  },
});
```
B käyttää samaa `liitetiedostoKentta()`-tehdasta linkki-objektin Tiedosto-vaihtoehdossa.

### 3.6 `huomio.ts`
```ts
defineType({
  name: "huomio", title: "Huomiolaatikko", type: "object", icon: InfoOutlineIcon,
  fields: [
    defineField({ name: "savy", title: "Sävy", type: "string",
      options: { list: HUOMION_SAVYT.map(({ title, value }) => ({ title, value })), layout: "radio", direction: "horizontal" },
      initialValue: "tieto",
      description: "Tiedote tavalliseen ilmoitukseen. Tärkeä vain, kun lukijan pitää toimia (määräaika, muutos, peruutus)." }),
    defineField({ name: "otsikko", title: "Otsikko (valinnainen)", type: "string",
      description: 'Esim. "Jäsenmaksu 2027".', validation: (r) => r.max(80) }),
    defineField({ name: "teksti", title: "Teksti", type: "text", rows: 4,
      description: "Lyhyt ja selkeä, muutama rivi. Rivinvaihdot säilyvät. Linkin tai ilmoittautumisen saat lisäämällä laatikon alle Painikkeen.",
      validation: (r) => [r.required().error("Kirjoita laatikkoon teksti."), r.max(600).error("Enintään 600 merkkiä."), r.max(400).warning("Lyhyt teksti erottuu parhaiten.")] }),
  ],
  preview: { select: { otsikko: "otsikko", teksti: "teksti", savy: "savy" },
    prepare: ({ otsikko, teksti, savy }) => ({ title: otsikko || teksti?.slice(0, 60) || "Huomiolaatikko",
      subtitle: `Huomiolaatikko · ${HUOMION_SAVYT.find((s) => s.value === savy)?.nimi ?? "Tiedote"}`,
      media: savy === "tarkea" ? WarningOutlineIcon : InfoOutlineIcon }) },
})
```

### 3.7 `taulukkoKentat.ts` ja `taulukko.ts`
- `taulukkoKentat.ts` exporttaa `sarakkeetKentta()` ja `rivitKentta()`. Ne ovat `jalkapalloTilasto.ts:155-219`:n määrittelyt sellaisinaan (`columns` hidden, `rows` + `components.input: TaulukkoEditori`). Ottavat `group`-parametrin. jalkapalloTilasto käyttää niitä `{ group: "data" }`-parametrilla, ja tallennusmuoto pysyy samana.
- `konteksti.tsx`: `TilastoDokumenttiInput` → `TaulukkoKontekstiInput`, sisältö ennallaan. Kommentiksi "objektin (dokumentti tai tekstin taulukkolohko) juurisyöte".
- `TaulukkoEditori.tsx:84`: `const sarakkeet = useFormValue([...props.path.slice(0, -1), "columns"])`. Muuta ei muuteta, koska patchit ovat jo suhteellisia.
```ts
export const taulukko = defineType({
  name: "taulukko", title: "Taulukko", type: "object", icon: ThListIcon,
  components: { input: TaulukkoKontekstiInput },
  options: { modal: { type: "dialog", width: "auto" } },
  fields: [
    defineField({ name: "otsikko", title: "Taulukon otsikko", type: "string",
      description: 'Näkyy taulukon yläpuolella ja kertoo ruudunlukijalle, mistä taulukossa on kyse, esim. "Mölkkyturnauksen tulokset 2026".',
      validation: (r) => r.required().min(3).max(120).error("Kirjoita taulukolle otsikko.") }),
    sarakkeetKentta(),
    rivitKentta({ description: "Kirjoita kuten Excelissä, tai kopioi alue Excelistä ja liitä soluun (Ctrl+V). Sarakkeen nimi ja tyyppi muutetaan otsikon ⋮-valikosta.",
      validation: (r) => r.min(1).error("Lisää taulukkoon vähintään yksi rivi.") }),
  ],
  preview: { select: { otsikko: "otsikko", rivit: "rows", sarakkeet: "columns" },
    prepare: ({ otsikko, rivit, sarakkeet }) => ({ title: otsikko || "Taulukko",
      subtitle: `Taulukko · ${rivit?.length ?? 0} riviä, ${sarakkeet?.length ?? 0} saraketta`, media: ThListIcon }) },
});
```

### 3.8 `upotus.ts`
```ts
defineType({
  name: "upotus", title: "Kartta, lomake tai Vimeo-video", type: "object", icon: PinIcon,
  fields: [
    defineField({ name: "osoite", title: "Upotuskoodi tai osoite", type: "text", rows: 3,
      description: "Google Maps: Jaa → Upota kartta → Kopioi HTML. Google Forms: Lähetä → <> → Kopioi. Vimeo: videon osoite. Liitä koko koodi tähän. Sivulla näkyy ensin painike, ja palvelu ladataan vasta, kun lukija painaa sitä.",
      validation: (r) => [r.required().error("Liitä upotuskoodi tai osoite."), r.custom((v: string | undefined) => upotuksenVirhe(v) ?? true)] }),
    defineField({ name: "otsikko", title: "Mitä upotuksessa on", type: "string",
      description: 'Esim. "Kartta: Klubin tila, Vapaudenkatu 12" tai "Ilmoittautuminen pikkujouluihin". Ruudunlukija lukee tämän.',
      validation: (r) => r.required().min(3).max(120).error("Kirjoita upotukselle otsikko.") }),
    defineField({ name: "kuvateksti", title: "Kuvateksti (valinnainen)", type: "string" }),
  ],
  preview: { select: { otsikko: "otsikko", osoite: "osoite" },
    prepare: ({ otsikko, osoite }) => { const u = tulkitseUpotus(osoite);
      return { title: otsikko || "Upotus", subtitle: u ? UPOTUSPALVELUT[u.palvelu].nimi : "Osoite puuttuu tai ei kelpaa",
        media: u?.palvelu === "google-maps" ? PinIcon : EarthGlobeIcon }; } },
})
```

### 3.9 `painike.ts` (C2, B:n jälkeen)
```ts
defineType({
  name: "painike", title: "Painike", type: "object", icon: ArrowRightIcon,
  fields: [
    defineField({ name: "teksti", title: "Painikkeen teksti", type: "string",
      description: 'Lyhyt toiminto, esim. "Ilmoittaudu" tai "Lue säännöt".',
      validation: (r) => [r.required().error("Kirjoita painikkeelle teksti."), r.max(40).warning("Lyhyt teksti mahtuu puhelimessa yhdelle riville.")] }),
    defineField({ name: "linkki", title: "Mihin painike vie", type: "linkki",  // B:n objekti
      validation: (r) => r.required().error("Valitse, mihin painike vie.") }),
  ],
  preview: { select: { teksti: "teksti" }, prepare: ({ teksti }) => ({ title: teksti || "Painike", subtitle: "Painike", media: ArrowRightIcon }) },
})
```
Lisää `"painike"` `RIKKAAT_LOHKOT`iin (`huomio`n jälkeen) ja `schemas/index.ts`:ään.

## 4. GROQ

### 4.1 `sanity/lib/queries/kuvat.ts`
```ts
/** Portable Text: kuviin esikatselu, kuvasarjan kuviin väri + esikatselu, liitteeseen tiedoston tiedot. */
export const runko = `...,
  _type == "imageWithAlt" => { ${lqip} },
  _type == "kuvasarja" => { "kuvat": kuvat[defined(asset)]{ ${kuva}, ${vari} } },
  _type == "liite" => { "liitetiedosto": tiedosto.asset->{ url, originalFilename, extension, size } }`;
// C2: + `,_type == "painike" => { "linkki": linkki{ ${linkkiProjektio} } }` (B:n fragmentti)

/** Uutiskortin kuva: kansikuva, muuten tekstin ensimmäinen ≥600 px kuva (myös kuvasarjasta). */
export function korttikuva(kentta = "coverImage", runkoKentta = "body"): string {
  const iso = `asset->metadata.dimensions.width >= ${KUVAN_MIN_LEVEYS_SISALTO}`;
  return `"${kentta}": coalesce(
    select(defined(${kentta}.asset) => ${kentta}),
    ${runkoKentta}[(_type == "imageWithAlt" && ${iso}) || (_type == "kuvasarja" && count(kuvat[${iso}]) > 0)][0]{
      "k": select(_type == "kuvasarja" => kuvat[${iso}][0], @)
    }.k
  ){${kuva}}`;
}
```
Haara `imageWithAlt` on testattu productionia vasten (8.10.2026). `kuvat`-avain ylikirjoittaa `...`-levityksen (GROQ: myöhempi avain voittaa), mikä varmistetaan groq-js-testissä.

### 4.2 `sanity/lib/queries/uutiskortti.ts` (uusi)
```ts
/** Uutiskortin yhteiset kentät ilman kuvaa. */
export const uutisKortinPerus = `_id, title, "slug": slug.current, publishedAt, tiivistelma,
  "excerpt": coalesce(excerpt, tiivistelma),
  "ote": select(!defined(excerpt) && !defined(tiivistelma) =>
    pt::text(body[_type == "block" && style == "normal" && !defined(listItem)][0...3])),
  ${uutisenKategoriat}`;
/** Listat, etusivu, haku, tunnisteet: kuva varakäytöksen kanssa. */
export const uutisKortti = `${uutisKortinPerus}, ${korttikuva()}`;
```
- `uutiset.ts`: `uutinenCardFields = uutisKortti`. `uutinenDetailQuery` = `${uutisKortinPerus}, coverImage{${kuva}}, _updatedAt, body[]{${runko}}, …`, jottei uutissivun iso kansikuva toista tekstin kuvaa.
- `etusivu.ts:26-34` nostoKortti, `queries.ts:80-91` recentUutisetQuery ja `lehtileikkeet.ts:85-96` käyttävät `uutisKortti`a (`lehtileikkeet.ts`:n `categories` → `uutisenKategoriat` samalla, koska vanha kenttä on poistunut 4.10.).
- Tapahtumaan ja muihin tyyppeihin ei tule korttikuvan varakäytöstä (ei tarvetta: 0 tapahtumaa).
- Haku `uutiset.ts:126` ennallaan (`excerpt` raakana suodattimessa).

### 4.3 Rungot
Viisi kyselyä (`queries.ts:62`, `klubi.ts:54`, `klubi.ts:150`, `uutiset.ts:164`, `uutiset.ts:254`) käyttävät jo `${runko}`a, joten muutosta ei tarvita. A:n uudet listasivukyselyt käyttävät samaa `body[]{${runko}}`-muotoa.

## 5. Renderöinti

### 5.1 `components/portable-text.tsx`
```ts
const lohkot = {
  imageWithAlt: …nykyinen…,
  kokoonpano: kokoonpanoLohko(0),
  youtubeVideo: …nykyinen…,
  kuvasarja: ({ value }) => <Kuvasarja value={{ kuvat: value?.kuvat ?? [], kuvaus: value?.kuvaus, asettelu: value?.asettelu }} />,
  liite: ({ value }) => <LiiteKortti otsikko={value?.otsikko} tiedosto={value?.liitetiedosto} />,
  huomio: ({ value }) => <Huomiolaatikko savy={value?.savy} otsikko={value?.otsikko} teksti={value?.teksti} />,
  taulukko: ({ value }) => value?.columns?.length ? (
    <div className="mt-8"><StatTable caption={value.otsikko ?? "Taulukko"} captionVisible columns={value.columns} rows={value.rows ?? []} /></div>) : null,
  upotus: ({ value }) => <Upotus value={{ osoite: value?.osoite, otsikko: value?.otsikko, kuvateksti: value?.kuvateksti }} />,
  // C2: painike: ({ value }) => { const l = linkinOsoite(value?.linkki); return l && value?.teksti ? <p className="mt-6"><LinkButton href={l.href} external={l.uusiValilehti} size="lg">{value.teksti}</LinkButton></p> : null; },
} satisfies Record<RikasLohko, PortableTextTypeComponent<any>>;
```
Kartta `components.types = lohkot`. `satisfies` takaa käännösaikana, että jokaisella `RIKKAAT_LOHKOT`-jäsenellä on renderöijä (CI: type-check). `ylinTaso` ja `kappaleIngressilla` pysyvät ennallaan. Client-komponenteille välitetään vain dataa (kuten YouTube-videolle).

### 5.2 `components/kuvasarja.tsx` (palvelinkomponentti)
- Props `{ value: { kuvat: AlbumImage[]; kuvaus?: string | null; asettelu?: string | null } }`.
- `const kuvaus = value.kuvaus?.trim() || "Kuvasarja"` ja `kokonaisena = stegaClean(value.asettelu) === "kokonaisena"`.
- Renderöi `<figure className="mt-8"><AlbumGrid images={kuvat} albumTitle={kuvaus} kokonaisena={kokonaisena} sarakkeet={3} /><figcaption className="mt-2 text-sm text-muted">{value.kuvaus}</figcaption></figure>`. Figcaption vain, kun kuvaus on olemassa.
- Alt-varateksti on valmiina AlbumGridissä (aria-label "Avaa kuva 3/9 albumista Klubin vappu 2026") ja Lightboxissa (`Klubin vappu 2026, kuva 3/9`).
- `album-grid.tsx`: uusi prop `sarakkeet?: 3 | 4` (oletus 4). Arvolla 3: `grid-cols-2 sm:grid-cols-3` ja `sizes="(min-width: 768px) 240px, 50vw"`. Muuten ennallaan.

### 5.3 `components/liite-kortti.tsx`
- Props `{ otsikko?: string | null; tiedosto?: { url?: string; originalFilename?: string; extension?: string; size?: number } | null }`. Palauttaa null, jos url puuttuu.
- `<p className="mt-6"><a href={url} className="group inline-flex min-h-11 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground no-underline hover:border-accent">`, lucide `FileText` (aria-hidden), `<span><span className="font-semibold text-accent underline …">{otsikko || originalFilename}</span> <span className="text-sm text-muted">({liitteenTiedot(tiedosto)})</span></span></a></p>`.
- Koko teksti on linkin sisällä (WCAG 2.4.4). Ei `target=_blank`. Ei `download`-attribuuttia (ristiorigin).

### 5.4 `components/huomiolaatikko.tsx`
- `savy = huomionSavy(stegaClean(props.savy))`.
- `<div role="note" aria-label={otsikko || nimi} className={cn("mt-8 rounded-lg border-l-4 px-5 py-4", savy === "tarkea" ? "border-brass bg-brass-tint" : "border-navy bg-blue-tint")}>`.
- Ikoni lucide `Info` tai `TriangleAlert` (aria-hidden, `text-navy` tai `text-brass-tint-text`). Otsikko `<p className="font-semibold text-heading">`, ei h-tagia, jotta otsikkohierarkia ei muutu. Teksti `<p className="mt-1 whitespace-pre-line text-lg leading-relaxed text-foreground">`.
- Kontrastit: #1b1d26 vaalealla sinisellä #e6e9fb ja vaalealla messingillä #f3ead8 ovat yli 12:1. Ikonit #141f4d ja #5c4315 ovat yli 7:1. Sävy ei ole pelkkä väri: ikoni ja aria-label (WCAG 1.4.1).

### 5.5 `components/upotus.tsx` ("use client", YouTube-lohkon malli)
- Props `{ value: { osoite?: string; otsikko?: string; kuvateksti?: string } }`. `const u = tulkitseUpotus(stegaClean(value.osoite))`. Jos `u` puuttuu, palautetaan null.
- Tila `ladattu`. Säiliö varaa saman tilan kuin iframe: `aspect-[4/3]` tai `aspect-video`, tai `style={{height: u.korkeus}}`.
- Ennen latausta näkyy kortti (`rounded-xl border bg-surface p-6`): otsikko (`font-display text-lg`), palvelun latausteksti (`text-sm text-muted`), `<button>` ensisijaisella tyylillä teksti `UPOTUSPALVELUT[p].nayta` ja `aria-describedby` lataustekstiin, sekä linkki `avaa` (target _blank, `UusiValilehti`). Ilman JavaScriptiä toimii linkki.
- Latauksen jälkeen: `<iframe ref src={u.src} title={otsikko} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy={palvelu==="google-maps" ? "no-referrer-when-downgrade" : "strict-origin-when-cross-origin"} allow={vimeo ? "autoplay; fullscreen; picture-in-picture" : undefined} allowFullScreen />`. Fokus siirretään iframeen `useEffect`illä.
- `<figure className="mt-8">` ja figcaption kuvatekstille.

### 5.6 Uutiskortit ja meta
- `components/news-card.tsx:42`, `hero.tsx:216-223` ja `uutiset-block.tsx:99-122`: `news.excerpt` → `korttiTeksti(news)`. Tyhjänä elementtiä ei renderöidä.
- `lib/types.ts` `UutinenCard`: lisää `ote?: string | null`.
- `uutiset/[slug]/page.tsx:89`: `resolveDescription(news.seoDescription, news.tiivistelma, news.excerpt, korttiOte(news.ote))`. Ingressilogiikka (`:117-122`) toimii sellaisenaan.

### 5.7 Jakokuva `lib/seo.ts`
- `kuvanMitat` siirretään `lib/sisaltolohkot.ts`:ään ja tuodaan sieltä.
- `jakokuvaSisallosta`: `for (const kuva of sisallonKuvat(sisalto)) { const j = jakokuvaLahteesta(kuva, MIN_LEVEYS_SISALTO); if (j) return j; }`, jonka jälkeen YouTube kuten ennen. `SisaltoLohko`-tyyppiin lisätään `kuvat?`. `MIN_LEVEYS_SISALTO = KUVAN_MIN_LEVEYS_SISALTO`.

### 5.8 Lukuaika ja haku
Ennallaan tarkoituksella. Lukuaika laskee vain tekstikappaleet (taulukot, huomiolaatikot ja kuvatekstit selataan). Testiin lisätään tapaus, joka varmistaa tämän. Haku etsii otsikosta, lyhenteestä, tekstistä ja tunnisteista. Huomiolaatikon teksti ei ole haussa: hyväksytty rajaus, josta ei tehdä erillistä muutosta.

## 6. Välimuisti ja webhook
- Uudet lohkot ovat dokumentin sisällä (inline), joten `RIIPPUVAT`-muutoksia ei tarvita. Liitteen tiedot tulevat assetista, joka ei muutu.
- C2 Painike: viitatun dokumentin polun muutos päivittää painikkeen. B hoitaa tämän linkkiobjektin yhteydessä kaikille viittaajille. Muuten viive on 60 s.

## 7. Testit

### `scripts/test-lohkot.ts` (`npm run test:lohkot`, mukaan `npm test` -ketjuun)
1. `RIKKAAT_LOHKOT` ilman toistoja. `PERUSLOHKOT` ⊂ `RIKKAAT_LOHKOT` ja järjestys `["imageWithAlt","kokoonpano","youtubeVideo"]`.
2. `kuvanMitat`: `image-abc-2016x1512-jpg` → {w:2016,h:1512}. `file-abc-pdf` ja undefined → null.
3. `sisallonKuvat`: [block, imageWithAlt A, kuvasarja{B,C(ilman asset)}, imageWithAlt D] → [A,B,D]. null → [].
4. `ensimmainenIsoKuva`: [397 px kuva, kuvasarja{1645 px}] → kuvasarjan kuva. Vain pieniä → null.
5. `korttiOte`: null → null. "Ohjelma:\n\n10:00 Lähtö…" → "Ohjelma: 10:00 Lähtö…" (välilyönnit). 250 merkin teksti → ≤200 merkkiä, päättyy "…" eikä katkea kesken sanan. `korttiTeksti({excerpt:"A", ote:"B"})` → "A". `({ote:"B"})` → "B".
6. `huomionSavy`: "tarkea" → "tarkea". "x", undefined → "tieto".
7. Liite: `tiedostonPaate("file-9f8e-pdf")` → "pdf". `tarkistaLiitetiedosto` hyväksyy pdf, docx ja xlsx, `…-exe` → virheteksti, undefined → true. `tiedostonKoko(512)` "1 kt", `(245760)` "240 kt", `(1250000)` "1,2 Mt". `liitteenTiedot({extension:"pdf",size:245760})` "PDF, 240 kt", `({extension:"docx"})` "Word".
8. Lukuaika: runko, jossa 200 sanaa tekstiä sekä huomio- ja taulukkolohko, antaa saman tuloksen kuin pelkkä teksti.
9. **groq-js** (`import { parse, evaluate } from "groq-js"`): aineisto, jossa `sanity.imageAsset`-dokumentit (`metadata.dimensions.width`, `lqip`, `palette`) ja uutiset:
   - (a) kansikuva on → kansikuva.
   - (b) ei kansikuvaa, 397 px tekstikuva ja sen jälkeen 2016 px → 2016 px.
   - (c) ensimmäisenä kuvasarja [300 px, 1500 px] → 1500 px.
   - (d) ei kuvia → null.
   - (e) `runko` lisää kuvasarjan kuviin `vari` ja `lqip`, liitteeseen `liitetiedosto.extension` ja `size`, ja kuvan `lqip` säilyy.
   - (f) `uutisKortti`: `excerpt` puuttuu ja `tiivistelma` on → excerpt = tiivistelma ja ote = null. Molemmat puuttuvat → ote = kolmen ensimmäisen normaalin kappaleen teksti.

### `scripts/test-upotus.ts` (`npm run test:upotus`, mukaan `npm test` -ketjuun)
- Maps: koko iframe-koodi (`<iframe src="https://www.google.com/maps/embed?pb=!1m18…" width="600" height="450" …>`) → src säilyy, suhde 4/3. `&amp;` puretaan. `http://maps.google.com/maps?q=Lahti&output=embed` → https, avaaOsoite ilman output-parametria.
- Mapsin jakolinkit `https://maps.app.goo.gl/AbC`, `https://www.google.com/maps/place/Lahti/@60.98,25.66,13z` → null ja jakolinkkivirhe.
- Forms: iframe-koodi `height="1200"` → korkeus 1200, src päättyy `embedded=true`. Pelkkä `viewform`-osoite → embedded lisätään, korkeus 900. `forms.gle/x` → lyhytlinkkivirhe. `/edit` → muokkausosoitevirhe. Korkeus 10000 → 3000.
- Vimeo: `https://vimeo.com/76979871`, `https://vimeo.com/76979871/abc123`, `https://player.vimeo.com/video/76979871?h=abc123` → src `…/video/76979871?dnt=1[&h=abc123]`.
- YouTube-osoite → YouTube-virhe.
- `javascript:alert(1)`, `data:text/html,…`, `https://evil.example/maps/embed`, `https://www.google.com.evil.example/maps/embed` → null ja muut-virhe.
- Tyhjä tai välilyönnit → null ja virhe null.

### Käännösaikainen tarkistus
`satisfies Record<RikasLohko, …>` tiedostossa `portable-text.tsx` (type-check CI:ssä).

### Käsin (ennen productionia, development-datasetissä)
1. `npm run typegen`, `npm run type-check`, `npm run lint` ja `npm test`.
2. Studio (`/studio`, development): uutiseen kaikki 8 lohkoa. Tarkista:
   - raahaa 10 kuvaa kerralla kuvasarjaan, myös puhelimen selaimella (useamman kuvan valinta)
   - liitä Excel-alue taulukkoon (Ctrl+V) dialogissa ja muokkaa sarakkeita (⋮)
   - PDF, docx ja exe-tiedostot (virhe), yli 15 Mt PDF (varoitus)
   - Maps-, Forms-, Vimeo- ja YouTube-osoitteet sekä vieras osoite (virheet suomeksi)
   - julkaise ilman Lyhennettä ja kansikuvaa (vain kansikuvan varoitus, julkaisu onnistuu)
   - insert-valikon ryhmät (kirjaa tulos)
   - jalkapalloTilaston taulukkoeditori toimii kuten ennen
3. Sivusto (development, `npm run dev`): luo development-datasettiin testisivu polulla `lohkotesti`, jossa ovat kaikki lohkot. Ajo `SIVUT="/lohkotesti,/uutiset" npm run test:saavutettavuus`. Näppäimistöllä: kuvasarjan ruutu → lightbox → Esc palauttaa fokuksen, upotuksen painike → fokus iframeen, liitelinkki. Poista testisivu developmentista testin jälkeen.
4. Esikatselu (Presentation, luonnos): huomiolaatikon sävy ja upotus toimivat stega-merkkien kanssa (`stegaClean`).

## 8. Käyttöönotto ja tuotanto
Productioniin ei kirjoiteta mitään.
1. `npm run backup` (CLAUDE.md: aina ennen isompaa muutosta, myös pelkässä skeemamuutoksessa).
2. Lukutarkistus productionista ennen deployta. Tämän pitää olla 0, muuten kenttätyypin vaihto ei ole turvallinen:
   `count(*[_type in ["sivu","uutinen"] && count(body[!(_type in ["block","imageWithAlt","kuvasarja","youtubeVideo","upotus","huomio","liite","taulukko","kokoonpano"])]) > 0] + *[_type=="tapahtuma" && count(description[!(_type in [...])]) > 0] + *[_type=="klubiToiminta" && count(kuvaus[!(_type in [...])]) > 0])`
   Tila 8.10.: 0.
3. Push mainiin. Vercel deployaa, ja Studio on sivuston mukana (`/studio`), joten erillistä `sanity deploy`ta ei tarvita.
4. Deployn jälkeen (vain luku):
   - Avaa Studiossa productionin uutinen 16deaa03… (YouTube) ja sivu `toriparkki` (54 kuvaa): ei "Invalid"-varoituksia.
   - Etusivun ja /uutiset-sivun kortit: aiemmin kuvattomilla Blogspot-jutuilla (esim. "Suomi - Englanti 13.10.2024") on nyt kuva. Uutissivulla ei ole kaksoiskuvaa.
   - Jakokuva ennallaan (`curl -s …/uutiset/<slug> | grep og:image`).
   - `npm run test:saavutettavuus` productionia vasten (`BASE_URL`).
5. **Palautus:** git revert ja deploy. Jos isä ehti lisätä uusia lohkoja, Studio näyttää ne tuntemattomina tyyppeinä eikä sivusto renderöi niitä (Portable Text ohittaa tuntemattomat lohkot). Data ei katoa ja palautuu näkyviin, kun lohkot tuodaan uudelleen. Tämä kirjataan docs/23:een.

## 9. Dokumentaatio (samassa muutoksessa)

**docs/09-editor-guide.md:**
- *Uutisen kirjoittaminen*, kohta 3: "Lyhenne on valinnainen; tyhjänä listalla näkyy tekstin alku." Kohta 4: "Kansikuva on valinnainen; tyhjänä listassa ja jaossa käytetään tekstin ensimmäistä isoa kuvaa. Varoitus kertoo, jos kuvaa ei ole lainkaan." Kuvajutuille ohjataan kuvasarjaan. Lause "Video toimii samoin kaikissa tekstikentissä" tarkennetaan: YouTube toimii kaikissa, mutta uudet lohkot vain uutisissa, sivuilla, tapahtumissa ja klubin toiminnassa.
- **Uusi osio "Tekstin lisäosat (+ -valikko)"**, jossa taulukko: lohko, milloin, miten ja huomioita.
  - **Kuvasarja:** raahaa kuvat ja kirjoita yhteinen kuvaus. Kuvakohtaiset kuvaukset ovat suositus. Kuvien muoto (ruudukko vai kokonaiset).
  - **Liite:** linkin teksti ja tiedosto. Julkinen, ei henkilötietoja. PDF Wordista: Tallenna nimellä → PDF. Ei skannattuja kuvia, koska ruudunlukija ei lue niitä. Väärän tiedoston poisto: poista lohko, julkaise, ja poista sitten tiedosto tiedostovalitsimesta (toteutusvaiheessa varmistetaan tarkka polku; ellei onnistu: "pyydä kehittäjää poistamaan tiedosto").
  - **Huomiolaatikko:** sävyt ja milloin Tärkeä.
  - **Painike:** C2.
  - **Taulukko:** viittaus kohtaan *Taulukon muokkaaminen*. Ero Sivu → Taulukot -kenttään: pieni taulukko tähän juttuun vs. tilasto, jota näytetään monessa paikassa.
  - **Kartta, lomake tai Vimeo:** tarkat napsautuspolut Mapsissa ja Formsissa. Lyhytlinkit eivät käy.
- *Jakokuva*, kohta 2: "ensimmäinen kuva tekstin seassa tai kuvasarjassa".
- *Tyypilliset tilanteet*: rivi "Upotus ei kelpaa → katso viesti; kopioi upotuskoodi palvelun Jaa- tai Upota-valikosta".
- *Taulukon muokkaaminen*: maininta, että sama editori on tekstin Taulukko-lohkossa.

**docs/05:** uusi kohta "`rikasSisalto`": käyttöpaikat, lohkot kenttineen, alt-käytäntö, upotusten sallittu lista ja perustelu taulukon inline-mallille. `portableText`-kappaleeseen maininta, että lohkot ovat vain rikkaassa tyypissä.

**docs/19:** §2 tai uusi §: editori myös tekstin Taulukko-lohkossa. `useFormValue` suhteellinen, konteksti `TaulukkoKontekstiInput`.

**docs/23 §0 "Toteutettu":** Y9, Y14 ja Y15 (C1), päivämäärä ja tiivistelmä. Poikkeus Y15 (3):sta (inline-taulukko) perusteluineen.

**CLAUDE.md:** komentotaulukkoon `npm run test:lohkot` ja `npm run test:upotus`.

**Tietosuojaseloste** (sisältö, isä tai hallitus): kappale ulkoisista upotuksista (Google ja Vimeo ladataan vasta lukijan painalluksesta). Kirjataan Täytä itse -listaan, ei koodimuutos.

## 10. Työjärjestys toteuttajalle
1. `lib/sisaltolohkot.ts`, `lib/liite.ts`, `lib/upotus.ts` ja testit (punaiseksi, sitten vihreäksi). `groq-js` devDependencyksi.
2. Skeemat: portableText-refaktori ja rikasSisalto. Uudet objektit, taulukkoKentat ja editorin polkukorjaus. Dokumenttien kentät.
3. GROQ: runko, korttikuva ja uutiskortti. Detail-kysely.
4. Renderöijät, AlbumGridin `sarakkeet` ja uutiskorttien teksti. seo.ts.
5. typegen, type-check, lint ja test. Käsitestit (§7). Saavutettavuustesti.
6. Dokumentaatio (§9). Commit ilman `--no-verify`.
7. C2 B:n jälkeen: painike.ts, `RIKKAAT_LOHKOT`, runko-haara, renderöijä, testitapaus (B:n `linkinOsoite`) ja docs/09-rivi.

## Tarvitsee muilta

- B (linkki-objekti), vain C2 Painike: Sanity-objektityyppi nimeltä `linkki`, jonka voi käyttää kentässä `type: "linkki"` (valinta Sivuston sivu / Ulkoinen osoite / Tiedosto; viittaus `options.disableNew`; valinnainen ankkuri; uusi välilehti). Painike käyttää sitä sellaisenaan.
- B: GROQ-fragmentti `linkkiProjektio` (esim. `sanity/lib/queries/linkki.ts`), joka purkaa viittauksen `routableProjection`-muotoon ja tiedoston `asset->{url, originalFilename, extension, size}`-muotoon. Lisätään runkoon haaraksi `_type == "painike" => { "linkki": linkki{ ${linkkiProjektio} } }`. Fragmentin tiedosto ei saa tuoda `sanity/lib/queries/kuvat.ts`:ää (syklinen tuonti).
- B: puhdas resolveri `linkinOsoite(linkki): { href: string; uusiValilehti: boolean } | null` (esim. `lib/linkki.ts`). Se käyttää `documentHref`iä ja palauttaa stegaClean-puhdistetun href:n. Painikkeen renderöijä kutsuu sitä.
- B: Tiedosto-vaihtoehdon tiedostokenttänä käytetään C:n `liitetiedostoKentta()`-tehdasta ja `lib/liite.ts`:n sääntöjä, jotta sallitut päätteet, julkisuusvaroitus ja koon varoitus ovat samat.
- B: annotaatio `sisainenLinkki` lisätään C:n exporttaamaan `tekstiLohko`on (`sanity/schemas/objects/portableText.ts`), jolloin se tulee sekä `portableText`- että `rikasSisalto`-tyyppiin. markDefs-purku lisätään `runko`-fragmenttiin haaraksi `_type == "block" => { markDefs[]{ … } }` C:n haarojen rinnalle. Muutoksista sovitaan samassa tiedostossa.
- B: webhookin riippuvuudet linkkiviittauksille. Kun viitatun dokumentin polku muuttuu, sivu-, uutinen-, tapahtuma- ja klubiToiminta-tagit tyhjennetään (tai hyväksytään 60 s viive). Koskee myös painikkeita.
- A (osiosivut/listasivut Y22): listasivujen johdanto renderöidään jaetulla `<PortableText>`-komponentilla, ja kysely käyttää muotoa `body[]{${runko}}`. Lukitut listasivut ovat `sivu`-dokumentteja, ja niiden body on `rikasSisalto`. Jos A haluaa johdantoon pelkän tekstin (ei kuvasarjaa tai taulukkoa), A:n on kerrottava se C:lle. Silloin tarvitaan erillinen kenttä, ei uutta lohkojoukkoa.
- E (Studion käytettävyys, Y10/Y38): uutisen Lyhenne- ja Kansikuva-kenttien ohjetekstien lopullinen muotoilu sovitetaan Y10:n ohjeuudistukseen. C muuttaa Lyhenteen säännön valinnaiseksi ja lisää kansikuvan varoituksen. E voi muotoilla tekstit kentän nimeä ja käytöstä muuttamatta.
- E (Y42, sanity-plugin-media, jos otetaan käyttöön): käyttämättömien liitetiedostojen löytäminen ja poisto Studiossa. Kunnes plugin on käytössä, docs/09 ohjaa poistamaan tiedoston oletusvalitsimesta tai pyytämään kehittäjää.
- D (ohjaukset): ei riippuvuuksia. Liitteiden tiedosto-osoitteet ovat Sanityn CDN:ssä eivätkä kuulu ohjauksiin.

## Tarjoaa muille

- Skeematyyppi `rikasSisalto` (sanity/schemas/objects/rikasSisalto.ts): laajennettu tekstisisältö kenttiin sivu.body, uutinen.body, tapahtuma.description ja klubiToiminta.kuvaus. A:n lukitut listasivut (sivu) saavat sen automaattisesti.
- `tekstiLohko` (portableText.ts): yhteinen block-jäsen tyyleineen ja linkkiannotaatioineen. B lisää siihen `sisainenLinkki`-annotaation kerran molempiin tyyppeihin.
- lib/sisaltolohkot.ts: `RIKKAAT_LOHKOT`, `PERUSLOHKOT`, `type RikasLohko`, `KUVAN_MIN_LEVEYS_SISALTO` (600), `kuvanMitat(image)`, `sisallonKuvat(lohkot)`, `ensimmainenIsoKuva(lohkot, min)`, `korttiOte(teksti, max)`, `korttiTeksti({excerpt, ote})`, `HUOMION_SAVYT`, `huomionSavy(arvo)`
- lib/liite.ts: `LIITTEEN_PAATTEET`, `LIITTEEN_ACCEPT`, `tiedostonPaate(ref)`, `tarkistaLiitetiedosto(arvo)`, `tiedostonTyyppi(paate)`, `tiedostonKoko(tavut)`, `liitteenTiedot({extension,size})`, `LIITE_ISO_TAVUA`
- sanity/schemas/objects/liite.ts: `liitetiedostoKentta(overrides?)` (file-kenttä, accept, julkisuusvaroitus, päätteen virhe ja kokovaroitus). B:n linkki-objektin Tiedosto-vaihtoehto käyttää sitä.
- lib/upotus.ts: `tulkitseUpotus(syote): Upotus | null`, `upotuksenVirhe(syote): string | null`, `poimiOsoite(syote)`, `UPOTUSPALVELUT`, `type UpotusPalvelu = "google-maps" | "google-forms" | "vimeo"`
- GROQ (sanity/lib/queries/kuvat.ts): laajennettu `runko` (kuvasarja → kuvat[]{lqip, vari}, liite → `liitetiedosto{url, originalFilename, extension, size}`) ja `korttikuva(kentta = "coverImage", runkoKentta = "body")`
- GROQ (sanity/lib/queries/uutiskortti.ts): `uutisKortinPerus` (excerpt = coalesce(excerpt, tiivistelma) ja `ote`) sekä `uutisKortti` (perus ja korttikuva). Etusivu, listat ja tunnistesivut käyttävät näitä.
- Lohkojen tyyppinimet: `kuvasarja` {kuvat: galleriaKuva[], kuvaus: string, asettelu: "ruudukko" | "kokonaisena"}, `liite` {otsikko, tiedosto: file}, `huomio` {savy: "tieto" | "tarkea", otsikko?, teksti}, `taulukko` {otsikko, columns[], rows[]}, `upotus` {osoite, otsikko, kuvateksti?}, `painike` {teksti, linkki: linkki} (C2)
- sanity/schemas/objects/taulukkoKentat.ts: `sarakkeetKentta(opts)` ja `rivitKentta(opts)`. Taulukkoeditori toimii missä tahansa objektissa, jossa on rinnakkaiset `columns` ja `rows` ja juurisyötteenä `TaulukkoKontekstiInput` (uusi nimi `TilastoDokumenttiInput`ille).
- Komponentit: `<PortableText>` renderöi kaikki lohkot (kattavuus tarkistetaan käännösaikana), `<Kuvasarja>`, `<LiiteKortti>`, `<Huomiolaatikko>`, `<Upotus>`. `AlbumGrid` saa propin `sarakkeet?: 3 | 4`.
- `lib/seo.ts` `resolveOgImage`: löytää jakokuvan myös kuvasarjasta (sama sääntö kuin korttikuvassa, ≥600 px).

## Tuotantomuutokset

- EI KIRJOITUKSIA productioniin. Kenttätyypin vaihto (portableText → rikasSisalto) on yhteensopiva: productionin neljän tyypin rungoissa on vain lohkot block, imageWithAlt ja youtubeVideo (luettu 8.10.2026), ja ne kaikki sallitaan uudessa tyypissä. Muutettavia dokumentteja: 0.
- Ennen deployta: `npm run backup` (varmuuskopio varotoimena, ei kirjoitusta datasettiin).
- Ennen deployta lukutarkistus: neljän tyypin dokumentit, joiden rungossa on muu kuin sallittu lohkotyyppi. Odotettu tulos on 0, ja se oli 0 8.10.2026.
- Deployn jälkeen vain luku: Studiossa ei Invalid-varoituksia (uutinen 16deaa03… ja sivu toriparkki). Korttikuvan varakäytös näkyy 46 uutisessa, joilta puuttuu kansikuva mutta joiden tekstissä on vähintään 600 px kuva (kaikki 46 tarkistettu ≥600 px). Uutissivuilla ei ole kaksoiskuvaa, ja og:image on ennallaan. Saavutettavuustesti productionia vasten.
- Development-datasettiin (ei production) luodaan väliaikainen testisivu `lohkotesti` kaikkine lohkoineen saavutettavuus- ja käsitestiä varten. Sivu poistetaan testin jälkeen.
- Isän tehtävä, ei koodimuutos: tietosuojaselosteen sisältöön (production, sivu `tietosuoja`) kappale ulkoisista upotuksista (Google Maps, Google Forms, Vimeo ladataan vasta lukijan painalluksesta). Lisätään docs/09:n Täytä itse -listaan.

## Riskit

- Tekstieditorin työkalupalkki ei ehkä noudata `options.insertMenu`-ryhmiä (API on alpha, ja Sanity 5.31:n koodissa sitä luetaan varmuudella vain taulukkosyötteessä). Seuraus: 9 lohkoa näkyy yhtenä listana. Lievennys: järjestys yleisimmästä alkaen, selkeät suomenkieliset nimet ja ikonit. Tarkistetaan Studiossa ja kirjataan docs/05:een.
- Taulukkoeditori Portable Text -lohkon dialogissa: leveys ja vieritys voivat olla ahtaita (`modal.width: "auto"`). Suhteellinen `useFormValue`-polku (`[...props.path.slice(0,-1), "columns"]`) pitää testata sekä tilastodokumentissa että tekstilohkossa. Jos dialogi on liian kapea, kokeillaan `width: 3`.
- Poistettu liite jää julkiseksi tiedostoksi Sanityn CDN:ään, kunnes asset poistetaan, ja on myös varmuuskopion metatiedoissa. Jos isä lataa vahingossa jäsenluettelon, pelkkä lohkon poisto ei riitä. Lievennys: varoitus kentän ohjeessa, poisto-ohje docs/09:ssä ja Y42:n media-plugin myöhemmin. Oletusvalitsimen poistomahdollisuus varmistetaan toteutuksessa.
- Stega-merkit luonnosnäkymässä: `upotus.osoite`, `huomio.savy` ja `kuvasarja.asettelu` on puhdistettava `stegaClean`illa ennen tulkintaa, muuten esikatselussa upotus tai sävy ei toimi. Kuvasarjan kuvaus alt- ja aria-teksteissä sisältää näkymättömiä merkkejä vain esikatselussa (sama kuin nykyisissä kentissä).
- Kuvasarjan kuvissa alt on suositus eikä pakko (galleriaKuva-malli). Jos isä jättää kuvaukset tyhjiksi, ruudunlukija kuulee "Klubin vappu 2026, kuva 3/9". Ratkaisu on WCAG-yhteensopiva mutta heikompi kuin kuvakohtainen kuvaus. Hyväksytty kompromissi gallerian ennakkotapauksen mukaisesti.
- Korttikuvan varakäytös muuttaa 46 vanhan Blogspot-uutisen ulkoasua listoissa. Kuva voi olla kuvakaappaus (esim. Teksti-TV) tai muu kuin isän toivoma. Kaikki ovat ≥600 px, eli eivät suttuisia. Isä voi vaihtaa kuvan lisäämällä kansikuvan.
- Lyhenteen muuttaminen valinnaiseksi (jos hyväksytään): ilman Lyhennettä ja Tiivistelmää kortissa näkyy tekstin alku, joka voi olla esim. "Ohjelma: 10:00 Lähtö…" (sama tyyli kuin migraation lyhenteissä). Productionissa jokaisella uutisella on nyt lyhenne, joten vaikutus koskee vain uusia uutisia.
- Upotuspalvelujen osoitemuodot voivat muuttua (Google vaihtaa jakodialogin). Lievennys: tulkinta on yhdessä testatussa moduulissa (`lib/upotus.ts`), ja virheviestit ohjaavat käyttämään upotuskoodia. Kartta tai lomake voi lakata latautumasta ilman Studion virhettä, jos Google muuttaa iframe-käytäntöään.
- Palautus (git revert) uusien lohkojen käyttöönoton jälkeen: isän lisäämät lohkot näkyvät Studiossa tuntemattomina eivätkä renderöidy, mutta data säilyy.
- `groq-js` lisätään suoraksi devDependencyksi. Versio on sidottava node_modulesissa jo olevaan (1.30.3), jottei syntyy kaksi versiota. Kirjasto on MIT-lisensoitu Sanityn oma, joten CLAUDE.md:n lukituskielto ei koske sitä.
- Tyyppinimen vaihto typegenissä (body: PortableText → RikasSisalto) ei riko koodia, koska generoituja tyyppejä ei tuoda mihinkään (grep 8.10.2026). Typegen ajetaan silti, jotta sanity.types.ts pysyy ajan tasalla.

## Avoimet päätökset

- Muutetaanko uutisen Lyhenne valinnaiseksi (docs/23 Y9 kohta 3)? Silloin listalla näkyy tekstin alku (enintään 200 merkkiä), kun Lyhenne ja Tiivistelmä puuttuvat. Suositus: kyllä. Päätös 7.10. kielsi vain johdantokenttien yhdistämisen, ei tätä. Nykyiset 753 uutista eivät muutu, koska kaikilla on lyhenne. Jos vastaus on ei, kohta jätetään pois (uutiskortin `ote` ja Lyhenteen säännön muutos), ja kaikki muu toteutetaan ennallaan.

---

# D. Automaattiset ohjaukset, lyhytosoitteet ja poiston turva (docs/23 Y18, Y19 loppu, Y20)

**Yhteenveto:** Tämän jälkeen isä voi muuttaa julkaistun sivun, uutisen, tapahtuman, ravintolan, albumin, toimintamuodon, arvokisan, pelaajan, stadionin, erillissivuisen taulukon, uutiskategorian ja kaupungin osoitteen. Vanha osoite ohjautuu uuteen automaattisesti (308) heti julkaisun jälkeen. Kehittäjää ei tarvita, eikä mitään tarvitse muistaa. Studio kertoo tästä sinisellä tiedolla, ei enää keltaisella varoituksella "pyydä kehittäjää". Isä voi tehdä Studiossa lyhytosoitteita ja käsin tehtyjä ohjauksia (Sivun asetukset → Ohjaukset ja lyhytosoitteet), esim. /jasenmaksu, joka vie sivulle, PDF-liitteeseen tai ulkoiseen osoitteeseen (307, joten kohteen voi vaihtaa milloin vain). Studio estää lyhytosoitteen, jos osoitteessa on jo sivu tai kiinteä ohjaus, jos sama osoite on jo käytössä tai jos ohjaus osoittaa itseensä. Ketjun se näyttää varoituksena. Studio näyttää kaikki automaattisesti muuttuneet osoitteet yhdessä listassa. Poisto ja Peru julkaisu varoittavat, jos dokumenttiin ohjautuu vanhoja osoitteita (.htm, blogi, aiemmat osoitteet). Varoitus listaa osoitteet ja neuvoo tekemään ensin ohjauksen. Kopioi muuttuu muotoon "Kopioi pohjaksi", joka jättää osoitteen ja vanhan sivuston tiedot pois. Opas lakkaa kieltämästä Kopioi-toimintoa. Isä ei voi edelleenkään muokata .htm- ja blogiohjauksia (lib/redirects.ts pysyy staattisena, ja sen kaikki 689 kohdetta vastaavat 8.10. 200:lla), eikä hän voi ohjata osoitetta, jossa on olemassa oleva sivu tai koodin reitti. Ohjaus toimii vain osoitteissa, jotka muuten antaisivat 404:n. Lukittujen sivujen osoitteet pysyvät lukittuina.

**Työmäärä:** 5.5 päivää

## Nykytila

KOODI (luettu 8.10.2026, Next 16.3.7, Sanity 5.31.2):
- Ohjaukset ovat vain buildin aikana: next.config.ts:58-67 (`legacyRedirects` 200 kpl + `blogspotRedirects` 530 kpl lib/redirects.ts:ssä, 757 riviä, sekä 2 käsin tehtyä). proxy.ts:ää ja middleware.ts:ää ei ole. Vercelin raja on 1024, joten Sanityn ohjauksia ei voi lisätä sinne.
- Ajonaikaisia ohjauksia on kolme mallia: app/blogspot/[[...polku]]/route.ts:33-40 (blogspot.polku luetaan Sanitystä, permanentRedirect), app/(public)/uutiset/page.tsx:114-117 (kategorian `aiemmatPolut`, permanentRedirect) ja jalkapalloarkisto/pelaajat/[slug]/page.tsx:88 (permanentRedirect sivukomponentissa). Livenä tarkistettu: /jalkapalloarkisto/pelaajat/jari-litmanen → 308, X-Vercel-Cache: HIT (ISR välimuistittaa sivutason ohjauksen). /uutiset?kategoria=jasentieto → 308.
- uutisKategoria.aiemmatPolut (sanity/schemas/documents/uutisKategoria.ts:65-73) on muokattava tags-kenttä, ja siihen tallennetaan pelkkiä slugeja. Kysely sanity/lib/queries/kategoriat.ts:20-23. Productionissa yksi arvo: uutisKategoria-tapahtumaraportti ["jasentieto"].
- notFound()-kutsut (22 kpl) ovat app/(public):ssa: [...slug]/page.tsx:74, uutiset/[slug]:101, tapahtumat/[slug]:96, ravintolat/[slug]:127, galleria/[slug]:88, klubi/toiminta/[slug]:81, klubi/palloveikkaus/[osa]:64, jalkapalloarkisto/{arvokisat/[slug]:108, pelaajat/[slug]:91, stadionit/[slug]:92, karsinnat/[slug]:86, tilastot/[slug]:89, eurocupit/[slug]:65, huuhkajat/[osio]:72,90, ulkomaiset-mestarit/[maa]:66,80, litmanen/page:48}, uutiset/arkisto/[vuosi]:117 ja uutiset/tunniste/[tunniste]:59,110. Kaikki tuntemattomat polut päätyvät johonkin näistä: livenä /jalkapalloarkisto/eiole, /klubi/eiole, /tapahtumat/x/y ja /eiole.htm → 404 juuren [...slug]-reitin kautta. dynamicParams=false ei ole missään, ja loading.tsx-tiedostoja ei ole, joten redirect() antaa oikean HTTP-tilan.
- Polun muutos: contentMeta.ts:111-125 `polkuMuuttunut` antaa varoituksen "pyydä kehittäjää lisäämään ohjaus". Käytössä 11 tyypissä: arvokisa:44, galleriaAlbumi:28, jalkapalloTilasto:42, kaupunki:30, klubiToiminta:48, pelaaja:46, ravintola:56, sivu:74, stadion:35, tapahtuma:35 ja uutinen:44. Pelaajan Litmanen-slug ja KOODIIN_SIDOTUT_SIVUT ovat readOnly (lib/path.ts:123-129).
- Reittien yksi totuus on lib/path.ts `documentRoute`/`documentHref`/`routableProjection` (rivit 52-276). jalkapalloTilasto, jolla on parent, ja lehtileike ovat pelkkiä ankkureita, joten polku ei muutu.
- Webhook (luettu Management API:lla): yksi webhook "Sivuston päivitys (revalidate)", production, on create/update/delete, filter `defined(_type) && !(_type match "sanity.*")`, projection `{_type, "slug": slug.current}`, includeDrafts false, apiVersion v2021-03-25. Free-taso sallii 2 webhookia. app/api/revalidate/route.ts:41-44 lukee vain `_type` ja `slug`, joten lisäkentät eivät riko nykyistä käsittelijää. Kirjoittava client tehdään samalla tavalla kuin laskeArvosanat (rivit 48-63).
- Välimuisti: sanity/lib/fetch.ts:104 (`revalidate: 60`, tagit), client perspective "published" (sanity/lib/client.ts). Linkkien kohteen tarkistus Studiossa: sanity/lib/linkin-kohde.ts (HEAD, redirect "follow", credentials "omit").
- Dokumenttitoiminnot: sanity.config.ts:27-74. Poistoa, Peru julkaisua ja Kopioi-toimintoa ei kääritä muissa kuin erikoistyypeissä. Sivulla lukitulleSivulle (sanity/actions/lukittu-sivu.tsx) on käärimisen malli, ja kommentin-moderointi.tsx:66-115 on vahvistusdialogin malli. Sanityn DuplicateAction ottaa vastaan propin `mapDocument` (node_modules/sanity/lib/_chunks-es/structureTool.js:5710-5745, tyyppi DuplicateActionProps, @beta), joten "Kopioi pohjaksi" onnistuu käärimällä. Rule.info() on olemassa (@sanity/types index.d.ts:360).
- Generaattori: scripts/generate-redirects.ts:440 käyttää oletuksena yhä datasettiä `development` (Y19:n "heti"-kohta on tekemättä). data/crawl-status.tsv (5,6 kt) on .gitignoressa (rivi 57), eikä data/manual-redirects.csv:tä ole olemassa.
- Studion rakenne: sanity/structure.ts:131-158 "Sivun asetukset" (Etusivu, Navigaatio, Yhteystiedot, Varmuuskopiot).
PRODUCTION (vain GROQ-luku, 8.10.2026): 3847 dokumenttia, joista 4 luonnosta. 1487 dokumentilla on legacyUrl, muutLegacyUrlit tai blogspot.polku: uutinen 752, ravintola 498, jalkapalloTilasto 187, stadion 17, arvokisa 15, klubiToiminta 9, sivu 7, pelaaja 1 ja etusivu 1. legacyUrl on 957:llä, muutLegacyUrlit 8:lla ja blogspot 530:llä. Erillisiä vanhoja .htm-osoitteita on 188, ja jokaisella on staattinen ohjaus (0 puuttuu). Staattisten ohjausten 689 eri kohdetta vastaavat tuotannossa kaikki 200:lla. Ohjaus-tyyppiä ei ole (0), eikä aiemmatPolut-kenttää ole muilla kuin yhdellä kategorialla. Y19:n johtopäätös: ajonaikaista legacyUrl-hakua ei tarvita. Ketju staattinen → vanha polku → aiemmatPolut → uusi polku kattaa slugin muutokset, ja poiston kattaa Y20 sekä ohjaus kuolleesta polusta.

## Suunnitelma

# D. Automaattiset ohjaukset, lyhytosoitteet ja poiston turva: toteutussuunnitelma

## 0. Arkkitehtuuripäätökset ja perustelut

| Kysymys | Päätös | Miksi |
|---|---|---|
| Mihin vanha polku tallennetaan? | Dokumentin omaan kenttään `aiemmatPolut: string[]` (readOnly). Kentässä on täysi polku, esim. `/uutiset/vanha`. Uutiskategoriassa ja kaupungissa on pelkkä tunniste, kuten nykyisessä uutisKategoria-mallissa. | Elinkaari on sama kuin dokumentilla, joten orpoja ohjauksia ei synny. Kohde lasketaan aina dokumentin **nykyisestä** reitistä, joten ketjua ei synny (A→B→C: /A ja /B vievät suoraan /C:hen). Ei uusia dokumentteja: Free-tason kiintiö on 10 000, nyt käytössä noin 7700. Content modeling: tieto kuuluu yhdelle omistajalle, joten se upotetaan. |
| Kuka kirjoittaa sen? | Nykyinen webhook (app/api/revalidate). Projektioon lisätään `before()` ja `delta::operation()`. | Kattaa Studion, skriptit, palautukset ja API:n. Toimintoa julkaisuun ei tarvita (docs/23 hylkäsi sen). Uutta webhookia ei tehdä (Free: 2). |
| Lyhytosoitteet ja käsin tehdyt ohjaukset | Uusi dokumenttityyppi `ohjaus` (ei singleton). Kohde on kokonaisuuden B `linkki`-objekti (vahva viittaus, ulkoinen osoite tai tiedosto). | Tämä on isän oma, tarkoituksellinen päätös, joten se on oma dokumentti. Vahva viittaus estää kohteen poiston huomaamatta, ja Sanityn oma poistodialogi näyttää viittaajan. |
| Missä ohjaus ratkaistaan? | Vain 404-haarassa. Jokainen `notFound()` app/(public):ssa korvataan kutsulla `return ohjaaTaiEiLoydy(polku)`. proxy.ts:ää ei tehdä. | Next 16:n proxy ajetaan jokaiselle pyynnölle ennen renderöintiä (node_modules/next/dist/docs/01-app/02-guides/redirecting.md), ja docs/23 hylkäsi sen. next.config-ohjaukset luetaan buildin aikana. |
| API-kulutus | Ohjauskartta haetaan **parametrittomalla** GROQ-kyselyllä (kaikki ohjaukset ja kaikki dokumentit, joilla on aiemmatPolut). Välimuisti on Next Data Cache, tagi `ohjaus`, revalidate 60. Ratkaisu tehdään muistissa puhtaalla funktiolla. | Bottien satunnaiset 404:t (/wp-login.php ym.) eivät lisää Sanity-kutsuja, koska välimuistiavain on kaikille 404:ille sama. Free-tason API-kiintiötä ei voi ylittää (docs/23 Y4). |
| Tilakoodit | Automaattiset (aiemmatPolut): **308** (permanentRedirect). Isän ohjaukset: **307** (redirect). | Isä voi vaihtaa lyhytosoitteen kohdetta, joten selain ja hakukone eivät saa muistaa sitä pysyvänä. Vercel lähettää ISR-vastauksille `Cache-Control: public, max-age=0, must-revalidate` (tarkistettu), joten selain ei jää silmukkaan, jos osoite vaihdetaan takaisin. Isälle ei tule valintakenttää. |
| Ketjut ja silmukat | Ratkaisija seuraa ketjua muistissa enintään 5 askelta ja palauttaa yhden ohjauksen lopulliseen kohteeseen. Jos sama polku tulee vastaan uudelleen, tuloksena on 404 ja `console.error`. Studio estää itseensä osoittavan ohjauksen ja varoittaa ketjusta. | |
| Y19 ajonaikainen legacy | **Ei tehdä.** Kaikilla 188 .htm-osoitteella ja 530 blogipolulla on staattinen ohjaus, ja kaikki 689 kohdetta vastaavat 200:lla (8.10.2026). Slugin muutos hoituu ketjulla staattinen 308 → vanha polku → aiemmatPolut 308 → uusi polku, eli kaksi hyppyä. Hakukoneille se riittää. Tehdään vain Y19:n jäljellä olevat pienet kohdat (§9). | |
| Sivu ja ohjaus samassa osoitteessa | Sivu voittaa aina, koska ohjausta haetaan vain 404:ssä. Studio estää ohjauksen, jos osoitteessa on sivu. | |

## 1. Puhdas sääntömoduuli `lib/ohjaukset.ts` (uusi)

Riippuvuudettomat tuonnit suhteellisilla poluilla (lib/path.ts-malli), jotta moduulia voi käyttää Nextistä, Studiosta ja tsx-skripteistä.

```ts
import { documentRoute, documentHref, type RoutableDoc } from "./path";
import { siteUrl } from "./site";

/** Tyypit, joilla on oma sivu ja joiden vanha polku ohjataan automaattisesti. */
export const OHJATTAVAT_TYYPIT: ReadonlySet<string> = new Set([
  "sivu", "uutinen", "tapahtuma", "ravintola", "galleriaAlbumi",
  "klubiToiminta", "arvokisa", "pelaaja", "stadion", "jalkapalloTilasto",
]);
/** Tyypit, joiden aiemmatPolut ovat tunnisteita kyselyparametrissa (?kategoria=, ?kaupunki=). */
export const TUNNISTE_TYYPIT: ReadonlySet<string> = new Set(["uutisKategoria", "kaupunki"]);
/** Polun ensimmäiset osat, joihin ohjausta ei voi tehdä. */
export const OHJAUKSELTA_VARATUT = new Set(["studio", "api", "_next", "blogspot"]);
const OMAT_HOSTIT = new Set([new URL(siteUrl).host, new URL(siteUrl).host.replace(/^www\./, "")]);
const MAX_HYPYT = 5;

export type OhjausRivi = { _id: string; lahde: string; kohdeHref: string | null };   // kohdeHref = B:n linkinHref(kohde)
export type AiempiDokumentti = RoutableDoc & { aiemmatPolut: string[]; _updatedAt?: string };
export type OhjausKartta = { ohjaukset: OhjausRivi[]; dokumentit: AiempiDokumentti[] };
export type Ohjaustulos = { kohde: string; pysyva: boolean };

export function normalisoiPolku(polku: string): string | null;
//  - lisää alkuun "/", purkaa %-koodauksen try/catchilla (virheessä raakana), poistaa ?- ja #-osan,
//    pienentää kirjaimet, poistaa lopun kauttaviivat (paitsi "/"), yhdistää peräkkäiset kauttaviivat
//  - palauttaa null, jos tulos on "/" tai pidempi kuin 300 merkkiä

export function omaPolku(href: string): string | null;
//  - "/x" (ei "//") → "/x" (kysely ja ankkuri säilyvät)
//  - https://www.lahdensuomalainenklubi.com/x?y#z tai ilman www-alkua → "/x?y#z"
//  - muut → null (ulkoinen)

export function ratkaiseOhjaus(pyynto: string, kartta: OhjausKartta): Ohjaustulos | null;
//  Algoritmi:
//   p = normalisoiPolku(pyynto); jos null → null
//   ohjausMap = lahde(normalisoitu) → OhjausRivi (duplikaateista ensimmäinen _id-järjestyksessä)
//   aiemmatMap = normalisoitu aiempi polku → dokumentit (_updatedAt laskevasti)
//   vierailtu = {p}; nykyinen = p; tulos = null; pysyva = true
//   toista enintään MAX_HYPYT kertaa:
//     o = ohjausMap.get(nykyinen)
//     jos o: href = o.kohdeHref; jos !href → break
//            jos href ei ala "/" eikä "http://" tai "https://" → break (esim. mailto: ei kelpaa)
//            pysyva = false; oma = omaPolku(href)
//            jos oma === null → return { kohde: href, pysyva: false }   // ulkoinen, ketju päättyy
//            seuraava = normalisoiPolku(oma); tulos = oma
//     muuten: d = aiemmatMap.get(nykyinen)?.find(d => documentHref(d) !== null)
//            jos !d → break
//            href = documentHref(d)!; seuraava = normalisoiPolku(href); tulos = href
//     jos seuraava === null tai vierailtu.has(seuraava) → console.error("[ohjaus] silmukka", [...vierailtu]); return null
//     vierailtu.add(seuraava); nykyinen = seuraava
//   return tulos ? { kohde: tulos, pysyva } : null

export function tarkistaOhjauksenLahde(lahde: string | undefined): true | string;
//  Virheilmoitukset (järjestyksessä):
//   tyhjä → "Kirjoita osoite, esim. /jasenmaksu."
//   välilyönti alussa tai lopussa → "Poista välilyönnit osoitteen alusta ja lopusta."
//   ei ala "/" → 'Osoite alkaa kauttaviivalla, esim. /jasenmaksu.'
//   alkaa "http" tai sisältää "://" → "Kirjoita vain sivuston osoitteen loppuosa, esim. /jasenmaksu, ei koko osoitetta."
//   "/" → "Etusivua ei voi ohjata."
//   sisältää ? tai # → "Osoitteessa ei voi olla ?- tai #-merkkiä."
//   päättyy "/" → "Poista kauttaviiva osoitteen lopusta."
//   isoja kirjaimia → `Käytä pieniä kirjaimia: ${lahde.toLowerCase()}`
//   jokin osa ei vastaa /^[a-z0-9]+(?:-[a-z0-9]+)*$/ → `Virheellinen kohta "${osa}". Käytä vain kirjaimia a–z, numeroita ja yksittäisiä yhdysmerkkejä (ä → a, ö → o).`
//   yli 6 osaa tai yli 120 merkkiä → "Osoite on liian pitkä."
//   ensimmäinen osa OHJAUKSELTA_VARATUT-joukossa → `Osoite /${osa} on sivuston oma, eikä sitä voi ohjata.`

/** Webhook: uusi aiemmatPolut-lista tai null, jos muutosta ei tarvita. */
export function yhdistaAiemmatPolut(nykyiset: string[] | null | undefined, vanha: string | null, uusi: string | null): string[] | null;
//   lista = [...nykyiset ?? []]; jos vanha && vanha !== uusi && !lista.includes(vanha) → lista.push(vanha)
//   lista = lista.filter(x => x !== uusi)  (osoite vaihdettu takaisin aiempaan)
//   palauttaa null, jos lista on sama kuin nykyiset (sama järjestys ja pituus)

export type EnnenTiedot = { slug?: string | null; category?: string | null; huuhkajatOsio?: string | null; mestaruusmaa?: string | null };
/** Vanha ja uusi osoite: polkutyypeillä reitin polku ilman ankkuria, tunnistetyypeillä slug. */
export function osoitteenMuutos(tyyppi: string, ennen: EnnenTiedot, nyt: RoutableDoc): { vanha: string | null; uusi: string | null };
//   TUNNISTE_TYYPIT: { vanha: ennen.slug ?? null, uusi: nyt.slug ?? null }
//   OHJATTAVAT_TYYPIT: uusi = documentRoute(nyt)?.path ?? null
//      vanha = documentRoute({ ...nyt, slug: ennen.slug ?? null, category: ennen.category ?? null,
//               huuhkajatOsio: ennen.huuhkajatOsio ?? null, mestaruusmaa: ennen.mestaruusmaa ?? null })?.path ?? null
//   muut: { vanha: null, uusi: null }

/** Studion polkukentän tieto, kun julkaistu slug poikkeaa (polkuMuuttunut). */
export function polunMuutosViesti(tyyppi: string, category: string | undefined, julkaistu: string): { taso: "info" | "warning"; viesti: string };

/** Poisto- ja Peru julkaisu -varoituksen osoitteet (Y20). */
export function vanhatOsoitteet(doc: Record<string, unknown> | null | undefined): string[];
//   [legacyUrl, ...muutLegacyUrlit, blogspot.polku → "/blogspot" + polku,
//    ...aiemmatPolut (tunnistetyypeillä muodossa "/uutiset?kategoria=x" tai "/ravintolat?kaupunki=x")], tyhjät ja duplikaatit pois

/** "Kopioi pohjaksi": kentät, jotka eivät siirry kopioon. */
export const KOPIOSTA_POISTETTAVAT = ["slug", "legacyUrl", "muutLegacyUrlit", "blogspot", "aiemmatPolut", "needsReview", "tarkistettavaa"] as const;
export function tyhjennaKopiosta<T extends Record<string, unknown>>(doc: T): T;   // palauttaa uuden olion ilman noita kenttiä
```

`polunMuutosViesti`, tekstit (`julkaistu` on julkaistu slug):
- OHJATTAVAT_TYYPIT (paitsi alla oleva tilastopoikkeus): info: `Julkaistu polku on "${julkaistu}". Kun julkaiset, vanha osoite ohjautuu automaattisesti uuteen, joten vanhat linkit toimivat edelleen.`
- jalkapalloTilasto, jonka category ei ole `karsinta` eikä `muu` (TILASTO_CATEGORY_DETAIL): info: `Julkaistu polku on "${julkaistu}". Taulukko näkyy samalla sivulla kuin ennenkin. Vain suora linkki tähän taulukkoon (#${julkaistu}) vie jatkossa sivun alkuun.`
- uutisKategoria: info: `Julkaistu polku on "${julkaistu}". Kun julkaiset, vanhat linkit (/uutiset?kategoria=${julkaistu}) ohjautuvat automaattisesti uuteen.`
- kaupunki: info: `Julkaistu tunniste on "${julkaistu}". Kun julkaiset, ravintolahakemiston vanhat linkit (?kaupunki=${julkaistu}) ohjautuvat automaattisesti uuteen.`
- muut (varalla): warning: nykyinen teksti, josta on poistettu "pyydä kehittäjää…". Tilalle tulee `Palauta vanha polku tai tee ohjaus: Sivun asetukset → Ohjaukset ja lyhytosoitteet.`

## 2. Skeemat

### 2.1 `sanity/schemas/objects/contentMeta.ts`
Uusi kenttä:
```ts
export const aiemmatPolutField = (group?: string, kuvaus = AIEMMAT_KUVAUS) => defineField({
  name: "aiemmatPolut",
  title: "Aiemmat osoitteet",
  description: kuvaus,
  type: "array",
  of: [{ type: "string" }],
  options: { layout: "tags" },
  readOnly: true,
  hidden: ({ value }) => !Array.isArray(value) || value.length === 0,
  ...(group ? { group } : {}),
});
const AIEMMAT_KUVAUS = "Osoitteet, joissa tämä on aiemmin ollut. Ne ohjautuvat tänne automaattisesti. Sivusto lisää osoitteen itse, kun muutat polkua ja julkaiset.";
export const AIEMMAT_TUNNISTEET_KUVAUS = "Aiemmat tunnisteet. Vanhat linkit ohjautuvat tähän automaattisesti. Sivusto lisää tunnisteen itse, kun muutat sitä ja julkaiset.";
```
`polkuMuuttunut` muutetaan seuraavasti. Allekirjoitus ja kaikki 11 käyttöpaikkaa pysyvät ennallaan. Sääntö palauttaa kaksi sääntöä tason mukaan:
```ts
export const polkuMuuttunut = (rule: SlugRule) => {
  const viesti = (taso: "info" | "warning") => rule.custom(async (slug, context) => {
    const id = context.document?._id; if (!slug?.current || !id) return true;
    const julkaistu = await context.getClient({ apiVersion }).fetch<string | null>(`*[_id == $id][0].slug.current`, { id: id.replace(/^drafts\./, "") });
    if (!julkaistu || julkaistu === slug.current) return true;
    const t = polunMuutosViesti(context.document!._type, context.document?.category as string | undefined, julkaistu);
    return t.taso === taso ? t.viesti : true;
  });
  return [viesti("info").info(), viesti("warning").warning()];
};
```
Käyttöpaikoissa on nyt `[rule.required(), polkuMuuttunut(rule)]`. Muutoksen jälkeen palautus on taulukko, joten se levitetään: `[rule.required(), ...polkuMuuttunut(rule)]`. sivu.ts:73-74 ja uutinen.ts:44 vastaavasti. Kysely on välimuistissa Studion clientissa, joten tuplakysely on halpa. Jos taulukon levitys tuntuu rumalta, vaihtoehto on palauttaa yksi sääntö, jonka taso on aina `.info()`, ja varmistaa, ettei tason "warning" polkua ole (kaikki käyttäjät ovat OHJATTAVAT- tai TUNNISTE-tyyppejä). **Suositus: yksi `.info()`-sääntö.** Varoitushaara jää vain varalle, eikä sitä tarvita nykyisissä tyypeissä.

### 2.2 Kentän lisäys tyyppeihin
`aiemmatPolutField(...)` lisätään heti `muutLegacyUrlitField`/`legacyUrlField`-rivin jälkeen samaan ryhmään:
- sivu.ts:133 `aiemmatPolutField("seo")`, uutinen.ts:272 `("seo")`, arvokisa.ts:153 `("seo")`, jalkapalloTilasto.ts:264 `("seo")`, klubiToiminta.ts:180 `("seo")`, pelaaja.ts:231 `("seo")`, ravintola.ts:308 `("seo")`, stadion.ts:93 `("seo")`
- tapahtuma.ts:105 ja galleriaAlbumi.ts:61: legacyUrlField kutsutaan niissä ilman ryhmää, joten `aiemmatPolutField()` samoin
- kaupunki.ts: slug-kentän jälkeen `aiemmatPolutField(undefined, AIEMMAT_TUNNISTEET_KUVAUS)`
- uutisKategoria.ts:65-73: nykyinen kenttä korvataan kutsulla `aiemmatPolutField(undefined, AIEMMAT_TUNNISTEET_KUVAUS)`. Nimi ja datamuoto pysyvät samoina, mutta kenttä on nyt readOnly ja otsikko "Aiemmat osoitteet". slug-kentän kuvaus (rivit 45-47) muutetaan muotoon: "Muodostuu nimestä (paina Luo). Osoite on /uutiset?kategoria=polku. Jos muutat julkaistun kategorian polkua, vanhat linkit ohjautuvat uuteen automaattisesti."
- kaupunki.ts slug-kuvaukseen lisätään: "Jos muutat tunnistetta, vanhat linkit ohjautuvat automaattisesti."

Kokonaisuus E voi nimetä ryhmän "seo" uudelleen (Y38). Kenttä seuraa ryhmää, joten tästä ei synny ristiriitaa.

### 2.3 Uusi dokumenttityyppi `sanity/schemas/documents/ohjaus.ts`
```ts
export const ohjaus = defineType({
  name: "ohjaus",
  title: "Ohjaus tai lyhytosoite",
  type: "document",
  icon: ArrowRightIcon,               // @sanity/icons
  description: "Lyhyt osoite esitteeseen (esim. /jasenmaksu) tai vanhan, poistetun sivun osoite, joka ohjataan toiselle sivulle.",
  fields: [
    defineField({
      name: "lahde",
      title: "Osoite sivustolla",
      description: "Osoite, jonka kävijä kirjoittaa tai joka painetaan esitteeseen, esim. /jasenmaksu. Alkaa kauttaviivalla. Käytä vain pieniä kirjaimia a–z, numeroita ja yhdysmerkkejä. Ohjaus toimii vain osoitteessa, jossa ei ole sivua.",
      type: "string",
      initialValue: "/",
      validation: (rule) => [
        rule.required().custom((v) => tarkistaOhjauksenLahde(v as string | undefined)),
        rule.custom(lahdeOnVapaa),            // sanity/lib/ohjauksen-lahde.ts, virhe
        rule.custom(lahdeKorvaaAutomaattisen).warning(),
      ],
    }),
    defineField({
      name: "kohde",
      title: "Minne ohjataan",
      description: "Valitse sivuston sivu listasta, kirjoita ulkoinen osoite (https://…) tai valitse tiedosto. Kohteen voi vaihtaa milloin vain.",
      type: "linkki",                         // kokonaisuus B
      validation: (rule) => [rule.required().error("Valitse, minne osoite ohjataan."), rule.custom(kohdeEiItseensa), rule.custom(kohdeOnOhjaus).warning()],
    }),
    defineField({
      name: "muistiinpano",
      title: "Muistiinpano (ei näy sivustolla)",
      description: "Mihin osoitetta käytetään, esim. \"Jäsenmaksukirje 2027\". Auttaa muistamaan, voiko ohjauksen poistaa.",
      type: "text", rows: 2,
      validation: (rule) => rule.max(300),
    }),
  ],
  orderings: [{ title: "Osoite", name: "lahdeAsc", by: [{ field: "lahde", direction: "asc" }] }],
  preview: {
    select: { lahde: "lahde", sivu: "kohde.sivu.title", nimi: "kohde.sivu.name", url: "kohde.url", tiedosto: "kohde.tiedosto.asset.originalFilename", muistiinpano: "muistiinpano" },
    prepare: ({ lahde, sivu, nimi, url, tiedosto, muistiinpano }) => ({
      title: lahde || "Osoite puuttuu",
      subtitle: `→ ${sivu || nimi || tiedosto || url || "kohde puuttuu"}${muistiinpano ? ` · ${muistiinpano}` : ""}`,
    }),
  },
});
```
Valintapolut `kohde.sivu`, `kohde.url` ja `kohde.tiedosto` on **sovittava kokonaisuuden B kanssa** (ks. tarvitsee_muilta). Rekisteröinti: sanity/schemas/index.ts (import ja `schemaTypes`). Tyyppiä ei lisätä `singletonTypes`-joukkoon.

### 2.4 Studion tarkistukset `sanity/lib/ohjauksen-lahde.ts` (uusi, vain Studio)
- `lahdeOnVapaa(lahde, context)`:
  1. Jos `tarkistaOhjauksenLahde` ei hyväksy, palautetaan true (virheen näyttää ensimmäinen sääntö).
  2. Duplikaatti, GROQ `count(*[_type == "ohjaus" && lahde == $lahde && !(_id in [$id, "drafts." + $id])])`. Jos > 0: `Osoitteelle ${lahde} on jo ohjaus. Avaa se listasta ja muuta sen kohdetta.`
  3. `typeof window === "undefined"`: palautetaan true (CLI).
  4. `fetch(lahde, { method: "HEAD", redirect: "manual", credentials: "omit", cache: "no-store" })`, välimuisti 60 s kuten linkin-kohde.ts:ssä:
     - `status === 200` → `Osoitteessa ${lahde} on jo sivu. Ohjaus toimii vain osoitteissa, joissa ei ole sivua. Valitse toinen osoite.`
     - `type === "opaqueredirect"` → GROQ: onko julkaistulla ohjauksella sama lahde (`*[_id == $id][0].lahde == $lahde`)? Jos on, true (ohjaus itse). Muuten, onko jonkin dokumentin `aiemmatPolut` tämä osoite? Jos on, true (sen hoitaa varoitussääntö). Muuten → `Osoitteella ${lahde} on jo kiinteä ohjaus (vanhan sivuston osoite). Valitse toinen osoite.`
     - muut tai verkkovirhe → true
- `lahdeKorvaaAutomaattisen` (varoitus): GROQ `*[count(aiemmatPolut[@ == $lahde]) > 0][0]{ _type, "nimi": coalesce(title, name, nimi) }` → `Tämä osoite ohjautuu nyt automaattisesti sivulle "${nimi}". Ohjauksesi korvaa sen.`
- `kohdeEiItseensa` (virhe): jos kohde on B:n mukaan ulkoinen osoite ja `normalisoiPolku(omaPolku(url))` on sama kuin `normalisoiPolku(lahde)` → `Ohjaus ei voi osoittaa itseensä.`
- `kohdeOnOhjaus` (varoitus): jos kohde on oma polku ja se on toisen ohjauksen lähde → `Kohde ${polku} on itsekin ohjaus. Valitse suoraan lopullinen sivu.`
- Viittauskohteen polkua ei tarkisteta erikseen: jos se on sama kuin lähde, osoitteessa on sivu, ja kohta 4 antaa virheen.

### 2.5 Studion rakenne `sanity/structure.ts`
"Sivun asetukset" -listaan Varmuuskopioiden edelle (rivi 147):
```ts
S.listItem().title("Ohjaukset ja lyhytosoitteet").icon(LinkIcon).child(
  S.list().title("Ohjaukset ja lyhytosoitteet").items([
    S.listItem().title("Lyhytosoitteet ja ohjaukset").schemaType("ohjaus")
      .child(S.documentTypeList("ohjaus").title("Lyhytosoitteet ja ohjaukset").defaultOrdering([{ field: "lahde", direction: "asc" }])),
    S.listItem().title("Muuttuneet osoitteet (automaattiset)").icon(ArrowRightIcon).child(
      S.documentList().title("Muuttuneet osoitteet").apiVersion(apiVersion)
        .filter(`_type in $tyypit && count(aiemmatPolut) > 0`)
        .params({ tyypit: [...OHJATTAVAT_TYYPIT, ...TUNNISTE_TYYPIT] })
        .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
        .initialValueTemplates([])),
  ])),
```
Jos E nimeää "Sivun asetukset" uudelleen, tämä kohta siirtyy mukana.

## 3. Ratkaisu 404-haarassa

### 3.1 Kysely `sanity/lib/queries/ohjaukset.ts` (uusi)
```ts
import { defineQuery } from "next-sanity";
import { routableProjection } from "@/lib/path";
import { JULKAISTU } from "./julkaisu";
import { JULKINEN_RAVINTOLA } from "@/lib/ravintola-arvosana";
import { LINKKI_PROJEKTIO } from "./linkki";          // kokonaisuus B

/** Kaikki ohjaukset ja aiemmat osoitteet. Ei parametreja: yksi välimuistiavain kaikille 404:ille. */
export const ohjauskarttaQuery = defineQuery(`{
  "ohjaukset": *[_type == "ohjaus" && defined(lahde)] | order(_id asc){ _id, lahde, kohde{ ${LINKKI_PROJEKTIO} } },
  "dokumentit": *[_type in ["sivu","uutinen","tapahtuma","ravintola","galleriaAlbumi","klubiToiminta","arvokisa","pelaaja","stadion","jalkapalloTilasto"]
      && count(aiemmatPolut) > 0
      && !(_type == "uutinen" && !${JULKAISTU})
      && !(_type == "ravintola" && !${JULKINEN_RAVINTOLA})]{ ${routableProjection}, aiemmatPolut, _updatedAt }
}`);
```
Tyyppilista kirjoitetaan auki, koska defineQuery/typegen vaatii literaalin. Testi varmistaa, että lista vastaa `OHJATTAVAT_TYYPIT`-joukkoa (§7).

### 3.2 Palvelinapuri `sanity/lib/ohjaus.ts` (uusi, `import "server-only"`)
```ts
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { linkinHref } from "@/lib/linkki";          // B
export async function ohjaaTaiEiLoydy(polku: string): Promise<never> {
  const raaka = await sanityFetch<OhjausKarttaRaaka>({ query: ohjauskarttaQuery, tags: ["ohjaus"], fallback: { ohjaukset: [], dokumentit: [] } });
  const kartta: OhjausKartta = {
    ohjaukset: raaka.ohjaukset.map((o) => ({ _id: o._id, lahde: o.lahde, kohdeHref: o.kohde ? linkinHref(o.kohde) : null })),
    dokumentit: raaka.dokumentit,
  };
  const tulos = ratkaiseOhjaus(polku, stegaClean(kartta));   // luonnosnäkymässä stega pois
  if (tulos) (tulos.pysyva ? permanentRedirect : redirect)(tulos.kohde);
  notFound();
}
```
Virheitä ei kääritä: sanityFetch heittää, ja ISR yrittää uudelleen (docs/16, suorituskyky-6). Tapa on sama kuin muualla repossa.

### 3.3 Reittien muutos (22 kohtaa)
Jokainen `if (!x) notFound();` muutetaan muotoon `if (!x) return ohjaaTaiEiLoydy(<polku>);`. Return tarvitaan, jotta TypeScript kaventaa tyypin. `notFound`-tuonti poistetaan, kun sitä ei enää käytetä.

| Tiedosto:rivi | polku |
|---|---|
| [...slug]/page.tsx:74 | `toHref(joinSlug(slug))` |
| uutiset/[slug]/page.tsx:101 | `` `/uutiset/${slug}` `` |
| tapahtumat/[slug]/page.tsx:96 | `` `/tapahtumat/${slug}` `` |
| ravintolat/[slug]/page.tsx:127 | `` `/ravintolat/${slug}` `` |
| galleria/[slug]/page.tsx:88 | `` `/galleria/${slug}` `` |
| klubi/toiminta/[slug]/page.tsx:81 | `` `/klubi/toiminta/${slug}` `` |
| klubi/palloveikkaus/[osa]/page.tsx:64 | `` `/klubi/palloveikkaus/${osa}` `` |
| jalkapalloarkisto/arvokisat/[slug]:108, pelaajat/[slug]:91, stadionit/[slug]:92, karsinnat/[slug]:86, tilastot/[slug]:89, eurocupit/[slug]:65 | `` `/jalkapalloarkisto/<kansio>/${slug}` `` |
| huuhkajat/[osio]:72, 90 | `` `${HUUHKAJAT_PATH}/${osio}` `` |
| ulkomaiset-mestarit/[maa]:66, 80 | `` `/jalkapalloarkisto/ulkomaiset-mestarit/${maa}` `` |
| litmanen/page.tsx:48 | `LITMANEN_PATH` |
| uutiset/arkisto/[vuosi]:117 | `` `/uutiset/arkisto/${vuosi}` `` |
| uutiset/tunniste/[tunniste]:59, 110 | `` `/uutiset/tunniste/${tunniste}` `` |

generateMetadata-funktioita ei muuteta. Ne palauttavat jo `{}` tai noindex-metadatan.

### 3.4 Välimuisti `app/api/revalidate/route.ts`
- Tagi `ohjaus` lisätään, kun `body._type === "ohjaus"` (tulee jo `_type`-tagista) tai kun `OHJATTAVAT_TYYPIT.has(body._type)`, koska ohjauskartan reitit riippuvat näistä dokumenteista. Muoto: `if (OHJATTAVAT_TYYPIT.has(body._type)) tags.push("ohjaus");`.
- 404-sivun ISR-merkintä saa ohjauskartan tagin, koska haku tehdään renderöinnissä. Uudelleennimeäminen tyhjentää myös tyypin tagin (esim. "uutinen"), joten vanhan polun välimuistissa oleva 404 vanhenee.

## 4. Automaattinen tallennus webhookissa (Y18)

### 4.1 Webhookin uusi projektio (sanity.io/manage → API → Webhooks → "Sivuston päivitys (revalidate)" → Edit → Projection)
```
{
  _id,
  _type,
  "slug": slug.current,
  "operaatio": delta::operation(),
  "ennen": before(){ "slug": slug.current, category, huuhkajatOsio, mestaruusmaa }
}
```
Suodatin, tapahtumat ja API-versio pysyvät ennallaan. Projektiossa ei saa käyttää `*[...]`-alikyselyitä, koska ne epäonnistuvat webhookissa hiljaa (Sanityn skill, functions.md:521). Nykyinen käsittelijä lukee vain `_type` ja `slug`, joten **projektion voi vaihtaa ennen deployta**. Kommenttilohko route.ts:11-22 päivitetään vastaamaan uutta projektiota.

### 4.2 Palvelinlogiikka `sanity/lib/aiemmat-polut.ts` (uusi, server-only)
```ts
export async function tallennaAiempiOsoite(body: { _id: string; _type: string; ennen: EnnenTiedot }): Promise<boolean>
```
1. Tyypin on oltava OHJATTAVAT_TYYPIT- tai TUNNISTE_TYYPIT-joukossa. Muuten palautetaan false.
2. Kirjoittava client tehdään samoin kuin `laskeArvosanat`: `SANITY_API_WRITE_TOKEN`, `useCdn: false`, `perspective: "raw"`. Ilman tokenia `console.error` ja false.
3. `const nyt = await client.fetch(`*[_id == $id][0]{ ${routableProjection}, aiemmatPolut }`, { id })`, ja luonnoksen olemassaolo `defined(*[_id == "drafts." + $id][0]._id)` samalla kyselyllä: `{ "doc": …, "luonnos": … }`.
4. `const { vanha, uusi } = osoitteenMuutos(_type, ennen, nyt)` ja `const lista = yhdistaAiemmatPolut(nyt.aiemmatPolut, vanha, uusi)`. Jos lista on null, palautetaan false.
5. `client.transaction().patch(id, p => p.set({ aiemmatPolut: lista }))`. Jos luonnos on olemassa, lisäksi `.patch("drafts."+id, p => p.set({ aiemmatPolut: lista }))`, jottei seuraava julkaisu kumoa kenttää. Sitten `.commit({ visibility: "sync" })`.
6. `console.log("[revalidate] aiempi osoite tallennettu", id, vanha, "→", uusi)`, ja palautetaan true. Virheet otetaan kiinni, kirjataan `console.error`, ja palautetaan false. Välimuistin tyhjennys ei kaadu.

### 4.3 Kytkentä `app/api/revalidate/route.ts`
- `WebhookPayload` laajenee kentillä `_id?: string; operaatio?: "create" | "update" | "delete"; ennen?: EnnenTiedot | null`.
- **Ennen** tagien tyhjennystä: `if (body._id && body.operaatio === "update" && body.ennen && (OHJATTAVAT_TYYPIT.has(body._type) || TUNNISTE_TYYPIT.has(body._type))) { if (await tallennaAiempiOsoite(...)) tags.push("ohjaus"); }`. Kutsu odotetaan (await), jotta seuraava renderöinti näkee patchin.
- Jos projektio on vanha (`OHJATTAVAT_TYYPIT.has(_type) && body.operaatio === undefined`): `console.warn("[revalidate] webhookin projektiosta puuttuu operaatio: aiempia osoitteita ei tallenneta (docs/07 Ajonaikaiset ohjaukset).")`.
- Patch käynnistää uuden webhookin. Sen `before().slug` on sama kuin nykyinen, joten `yhdistaAiemmatPolut` palauttaa null eikä silmukkaa synny.

### 4.4 Varmuuskopiosta palautus ei saa pudottaa osoitteita (`lib/palautus.ts`)
`luonnosVarmuuskopiosta(doc, nykyinen?)` saa valinnaisen toisen parametrin `nykyinen?: { aiemmatPolut?: string[] }`. Tulokseen tulee yhdiste `aiemmatPolut = unique([...(doc.aiemmatPolut ?? []), ...(nykyinen?.aiemmatPolut ?? [])])`. Jos yhdiste on tyhjä, kenttää ei lisätä. Kutsuja sanity/actions/palauta-varmuuskopiosta.tsx välittää julkaistun version (`props.published`). Testi lisätään test-palautus.ts:ään. Varmuuskopion "Palauta poistettu" -välilehti palauttaa aiemmatPolut-kentän sellaisenaan (kopiossa).

## 5. Kaupungin tunnisteen muutos (?kaupunki=)
49 staattista .htm-ohjausta vie osoitteeseen `/ravintolat?kaupunki=…`, joten kaupungin tunnisteen muutos rikkoisi ne. Muutokset:
- `sanity/lib/queries/ravintolat.ts:318-325` places-projektioon `aiemmatPolut`. `buildRavintolatFacets` välittää sen `cities[]`-alkioihin muodossa `aiemmatTunnisteet: string[]`, ja `RavintolatFacetData`-tyyppi laajenee.
- `components/ravintola-filters.tsx`: uusi puhdas funktio `korjaaKaupunki(f, facets)`. Jos `f.kaupunki` ei ole minkään kaupungin slug, mutta jonkin kaupungin `aiemmatTunnisteet` sisältää sen, palautetaan `{ ...f, kaupunki: uusi }`.
- `app/(public)/ravintolat/page.tsx:117`: `sovitaAlue(korjaaKaupunki(parseRavintolaFilters(sp), facets), facets)`. Olemassa oleva `siistiRavintolaHref` (rivi 123-124) ohjaa siistiin osoitteeseen.
- Uutiskategoria toimii jo valmiiksi (kategoriat.ts:20, uutiset/page.tsx:114-117). Webhook vain täyttää kentän.

## 6. Poiston turva (Y20): `sanity/actions/vanhat-osoitteet.tsx` (uusi)

### 6.1 `varoitaVanhoistaOsoitteista(alkuperainen: DocumentActionComponent): DocumentActionComponent`
Lukittu-sivu.tsx-malli: alkuperäinen kutsutaan aina (hookit pysyvät samoina).
```tsx
const Kaare: DocumentActionComponent = (props) => {
  const tulos = alkuperainen(props);
  const [auki, setAuki] = useState(false);
  const doc = (props.published ?? props.draft) as Record<string, unknown> | null;
  const osoitteet = vanhatOsoitteet(doc);
  if (!tulos || tulos.disabled || !tulos.onHandle || osoitteet.length === 0) return tulos;
  const nykyinen = doc ? documentHref({ _id: props.id, _type: props.type, slug: (doc.slug as {current?: string})?.current, category: doc.category as string }) : null;
  const poisto = alkuperainen.action === "delete";
  return {
    ...tulos,
    onHandle: () => setAuki(true),
    dialog: auki ? {
      type: "confirm", tone: "critical",
      message: <Viesti osoitteet={osoitteet} nykyinen={nykyinen} poisto={poisto} />,
      confirmButtonText: poisto ? "Poista silti" : "Piilota silti",
      cancelButtonText: "Peruuta",
      onCancel: () => setAuki(false),
      onConfirm: () => { setAuki(false); tulos.onHandle?.(); },   // Sanityn oma dialogi (viittaukset) avautuu perään
    } : tulos.dialog,
  };
};
Kaare.action = alkuperainen.action; Kaare.displayName = `VanhatOsoitteet(${alkuperainen.displayName ?? alkuperainen.action})`;
```
`Viesti` on `@sanity/ui`:n `Stack` ja `Text`. Tekstit:
- Ensimmäinen kappale: `Tähän ${poisto ? "dokumenttiin" : "sivuun"} ohjautuu ${osoitteet.length} vanhaa osoitetta, esimerkiksi:`, sen jälkeen lista (enintään 5 osoitetta, sitten "ja N muuta").
- Toinen kappale: `${poisto ? "Jos poistat sen" : "Jos perut julkaisun"}, ne${nykyinen ? ` ja osoite ${nykyinen}` : ""} johtavat "Sivua ei löytynyt" -sivulle.`
- Kolmas kappale: `Jos sisältö on siirtynyt toiselle sivulle, tee ensin ohjaus: Sivun asetukset → Ohjaukset ja lyhytosoitteet → uusi, osoitteeksi ${nykyinen ?? "tämän sivun osoite"} ja kohteeksi uusi sivu. Silloin myös vanhat osoitteet ohjautuvat perille.`
Saavutettavuus: dialogi on Sanityn oma, ja lista on `<ul>`. Pelkkää väriä ei käytetä merkityksen välittämiseen.

### 6.2 `kopioiPohjaksi(alkuperainen)`
```tsx
const Kaare: DocumentActionComponent = (props) => {
  const tulos = (alkuperainen as DuplicateDocumentActionComponent)({ ...props, mapDocument: (d) => tyhjennaKopiosta(d) });
  if (!tulos) return tulos;
  return { ...tulos, label: tulos.disabled ? tulos.label : "Kopioi pohjaksi",
    title: tulos.title || "Tekee kopion samalla sisällöllä ilman osoitetta ja vanhan sivuston tietoja. Anna kopiolle oma otsikko ja paina polun kohdalla Luo ennen julkaisua." };
};
```
`mapDocument` on Sanityn @beta-ominaisuus (DuplicateActionProps). Kehittäjän muistiin: tarkista Sanityn pääversiopäivityksessä.

### 6.3 Kytkentä `sanity.config.ts`
- Sivun haara (rivit 61-68): `toiminto.action === "delete" || "unpublish"` → `lukitulleSivulle(varoitaVanhoistaOsoitteista(toiminto))`, ja `"duplicate"` → `kopioiPohjaksi(toiminto)`.
- Oletushaara (rivi 72): `input.map(t => t.action === "delete" || t.action === "unpublish" ? varoitaVanhoistaOsoitteista(t) : t.action === "duplicate" ? kopioiPohjaksi(t) : t)` ja `PalautaVarmuuskopiosta`.
- Ravintola-arvostelua, kommenttia, varmuuskopiota ja singletoneja ei muuteta. Ohjaus-tyyppi kulkee oletushaarassa, ja koska sillä ei ole vanhoja osoitteita, kääre ei tee mitään. Ohjauksen Kopioi on vaaraton, koska lähteen duplikaatin tarkistus estää julkaisun.
- Saapuvat viittaukset (valikko, ohjaukset, B:n linkkiobjektit) näkyvät ja estävät poiston Sanityn omassa poisto- ja piilotusdialogissa, kun linkit ovat viittauksia (B). Erillistä viittauslaskuria ei tehdä.

## 7. Testit

### 7.1 `scripts/test-ohjaukset.ts` → `npm run test:ohjaukset`, lisätään `npm test` -ketjuun
Malli on test-sivupolku.ts (node:assert/strict, `test(nimi, fn)`). Tapaukset:
1. normalisoiPolku: "/Jasenmaksu/" → "/jasenmaksu"; "jasenmaksu" → "/jasenmaksu"; "/a//b" → "/a/b"; "/%C3%A4" → "/ä"; "/%E0%A4%A" (rikki) ei kaadu; "/" → null; "/x?y=1#z" → "/x".
2. omaPolku: "/x?y#z" → "/x?y#z"; "https://www.lahdensuomalainenklubi.com/x" → "/x"; "https://lahdensuomalainenklubi.com/x" → "/x"; "https://palloliitto.fi/x" → null; "//evil.com" → null.
3. tarkistaOhjauksenLahde: kelpaavat "/jasenmaksu", "/klubi/saannot-2027", "/uutiset/vanha-juttu". Hylätyt (ja viestin alku tarkistetaan): "", "jasenmaksu", " /x", "/", "/Jasenmaksu", "/jäsenmaksu", "/x/", "/x?y", "/x#y", "/a--b", "/studio/x", "/api/x", "/blogspot/x", "https://www.lahdensuomalainenklubi.com/x", 7 osaa, 121 merkkiä.
4. ratkaiseOhjaus: lyhytosoite sivulle → { kohde: "/klubi/saannot", pysyva: false }.
5. Ulkoinen kohde "https://forms.gle/x" → sellaisenaan, pysyva false.
6. Kohde "mailto:x@y.fi" → null.
7. aiemmatPolut: uutinen { slug: "uusi", aiemmatPolut: ["/uutiset/vanha"] } → "/uutiset/vanha" → { "/uutiset/uusi", pysyva: true }; iso kirjain ja lopun kauttaviiva pyynnössä toimivat.
8. Monta uudelleennimeämistä: aiemmatPolut ["/a","/b"], nykyinen "/c" → /a ja /b → /c yhdellä hypyllä.
9. Ohjaus voittaa automaattisen: sama polku molemmissa → ohjauksen kohde.
10. Ketju: ohjaus /x → oma osoite /y, ohjaus /y → sivu /z → { kohde: "/z", pysyva: false }.
11. Ketju ohjauksesta aiempaan osoitteeseen: /x → /vanha, ja /vanha on dokumentin aiempi polku → nykyinen reitti.
12. Silmukka: /x → /y, /y → /x → null (ei kaadu, ei ikuista silmukkaa). Myös /x → /x → null.
13. Yli 5 hypyn ketju → viimeisin saavutettu kohde (ei silmukka). Assertoidaan, että tulos on 5. kohde.
14. Kohde = pyyntö (dokumentin nykyinen reitti on sama kuin pyydetty, esim. piilotettu uutinen) → null.
15. Kaksi dokumenttia samalla aiemmalla polulla → _updatedAt-järjestyksessä uusin voittaa.
16. jalkapalloTilasto (karsinta) → `/jalkapalloarkisto/karsinnat/<slug>`; tilasto ankkurilla → kohde sisältää "#slug".
17. yhdistaAiemmatPolut: (undefined, "/a", "/b") → ["/a"]; (["/a"], "/a", "/b") → null; (["/a"], "/b", "/a") → ["/b"] (paluu aiempaan poistaa sen listalta); (["/a"], null, "/c") → null; (["/a"], "/c", "/c") → null.
18. osoitteenMuutos: sivu slug "klubi/historia" → "klubi/tarina" → { vanha: "/klubi/historia", uusi: "/klubi/tarina" }; uutinen; jalkapalloTilasto, jonka kategoria muuttuu "muu" → "karsinta" (vanha /jalkapalloarkisto/tilastot/x, uusi /jalkapalloarkisto/karsinnat/x); tilasto parentilla → vanha === uusi (vain ankkuri); kaupunki ja uutisKategoria → slugit; tuntematon tyyppi → null/null.
19. polunMuutosViesti: OHJATTAVA → info ja sisältää "ohjautuu automaattisesti"; tilasto, kategoria "mestarit"/"champions" → info "#"; kaupunki → "?kaupunki="; tuntematon → warning.
20. vanhatOsoitteet: legacyUrl ja muutLegacyUrlit ja blogspot.polku ("/2019/05/x.html" → "/blogspot/2019/05/x.html") ja aiemmatPolut ilman duplikaatteja; uutisKategoria → "/uutiset?kategoria=jasentieto"; tyhjä doc → [].
21. tyhjennaKopiosta: poistaa kaikki KOPIOSTA_POISTETTAVAT-kentät ja säilyttää title, body ja _type. Alkuperäistä oliota ei muuteta.
22. Rakennetesti: `ohjauskarttaQuery`-merkkijonon tyyppilista vastaa `OHJATTAVAT_TYYPIT`-joukkoa.
23. Rakennetesti (kestävyys): app/(public)-kansion .ts- ja .tsx-tiedostoissa ei ole `notFound(` -kutsua koodirivillä. Rivit, jotka alkavat `*` tai `//`, ohitetaan, samoin sanity/lib/ohjaus.ts. Virheilmoitus: "Käytä ohjaaTaiEiLoydy(polku) notFound():n sijaan (docs/07): muuten lyhytosoitteet ja muuttuneet osoitteet eivät toimi tässä reitissä."
24. Rakennetesti: jokainen schemaTypes-tyyppi, joka käyttää `polkuMuuttunut`-sääntöä, on OHJATTAVAT_TYYPIT- tai TUNNISTE_TYYPIT-joukossa. Tarkistetaan lukemalla sanity/schemas/documents/*.ts-tiedostot merkkijonona ja etsimällä `polkuMuuttunut(`.

### 7.2 Täydennykset olemassa oleviin
- `scripts/test-palautus.ts`: `luonnosVarmuuskopiosta(doc, { aiemmatPolut: ["/a"] })` yhdistää, ja ilman toista parametria tulos on ennallaan.
- `scripts/test-...` ravintolasuodattimelle, jos sellainen on (muuten test-ohjaukset.ts): `korjaaKaupunki` vaihtaa vanhan tunnisteen uuteen, ei muuta tuntematonta ja ei muuta nykyistä.

### 7.3 Päästä päähän `scripts/e2e-ohjaukset.ts` → `npm run e2e:ohjaukset`
Malli on e2e-arvioijasaanto.ts. Kaksi tilaa:
- `-- --paikallinen`: datasetti `development`, sivusto http://localhost:3000 (`npm run dev` käynnissä). Webhook simuloidaan: POST `/api/revalidate`, body `{ _id, _type: "sivu", slug: "testi-ohjaus-uusi-poistetaan", operaatio: "update", ennen: { slug: "testi-ohjaus-poistetaan" } }`, otsake `sanity-webhook-signature: encodeSignatureHeader(body, Date.now(), SANITY_REVALIDATE_SECRET)` paketista `@sanity/webhook` (lisätään devDependencies `"@sanity/webhook": "^4.0.4"`, sama versio, jonka next-sanity jo asentaa).
- Oletus: production ja https://www.lahdensuomalainenklubi.com, aito webhook. Ennen ajoa `npm run backup`, ja webhook-jonon on oltava tyhjä.
Kulku:
1. Luodaan ja julkaistaan sivu `_id: "sivu-testi-ohjaus-poistetaan"`, slug `testi-ohjaus-poistetaan`, otsikko "Testisivu (poistetaan)". Odotetaan, että osoite vastaa 200.
2. Patchataan slug `testi-ohjaus-uusi-poistetaan` (julkaistu). Odotetaan, kunnes `aiemmatPolut == ["/testi-ohjaus-poistetaan"]` (enintään 120 s).
3. HEAD vanha osoite, redirect manual → 308 ja Location /testi-ohjaus-uusi-poistetaan. Uusi osoite → 200.
4. Luodaan ohjaus `_id: "ohjaus-testi-poistetaan"`, lahde `/testi-lyhytosoite-poistetaan`, kohde viittaus testisivuun → 307 ja Location sivulle.
5. Vaihdetaan ohjauksen kohde ulkoiseksi `https://www.palloliitto.fi/` → enintään 120 s sisällä 307 ja uusi Location. **Tämä varmistaa, että ISR-välimuistin ohjaus tyhjenee tagilla** (riski R1).
6. Palautetaan sivun slug alkuperäiseksi. Odotetaan, että aiemmatPolut on `["/testi-ohjaus-uusi-poistetaan"]` (paluu poisti vanhan). Vanha uusi osoite → 308 takaisin.
7. Siivous `finally`-lohkossa: poistetaan ohjaus ja sivu (julkaistu ja luonnos). Tarkistetaan, että molemmat osoitteet antavat 404.
Tuloste ✓/✗ jokaiselle askeleelle. Lopetuskoodi on 1, jos jokin epäonnistui.

### 7.4 Tarkistus `scripts/verify-redirects.ts`
Lisätään valinnainen osa `--sanity` (lukee datasettiä `SANITY_REDIRECTS_DATASET` tai production tokenilla kuten generate-redirects.ts:449). Jokaiselle ohjaus-dokumentille: HEAD lähde → 307. Jokaiselle aiemmatPolut-arvolle → 308 dokumentin nykyiseen reittiin, ja kohde 200. Raportoidaan ketjut (yli 1 hyppy), silmukat ja ohjaukset, joiden lähteessä on nykyään sivu (200 eikä ohjausta).

## 8. Dokumentaatio (samassa muutoksessa)

### docs/09-editor-guide.md
- **Studion valikko** (rivi 51 alkaen): "Sivun asetukset → Ohjaukset ja lyhytosoitteet".
- Uusi luku **"Osoitteen muuttaminen"** Yleiset toimenpiteet -lukuun:
  > Voit korjata julkaistun sivun, uutisen, tapahtuman tai ravintolan osoitteen: muuta Polku ja paina Julkaise. Studio kertoo sinisellä, että vanha osoite ohjautuu uuteen. Sivusto tekee ohjauksen itse muutamassa sekunnissa, ja vanhat linkit (Google, Facebook, esitteet) toimivat. Vanhat osoitteet näkyvät dokumentin kohdassa Aiemmat osoitteet (SEO-välilehti) ja koottuna kohdassa Sivun asetukset → Ohjaukset ja lyhytosoitteet → Muuttuneet osoitteet. Lukittujen sivujen (Klubi, Hallitus, Toiminta, Palloveikkaus, tietosuoja, Litmanen) osoitetta ei voi muuttaa.
- Uusi luku **"Lyhytosoite esitteeseen (esim. /jasenmaksu)"**:
  1. Sivun asetukset → Ohjaukset ja lyhytosoitteet → Lyhytosoitteet ja ohjaukset → **+**.
  2. **Osoite sivustolla**: esim. `/jasenmaksu` (pienet kirjaimet, ä → a).
  3. **Minne ohjataan**: valitse sivu listasta, kirjoita ulkoinen osoite tai valitse tiedosto.
  4. **Muistiinpano**: mihin osoitetta käytetään.
  5. **Julkaise**. Kokeile osoitetta selaimessa.
  Kohteen voi vaihtaa milloin vain, ja vanha esite vie silloin uuteen kohteeseen. Ohjauksen poisto: ⋯ → Poista. Punainen virhe "Osoitteessa on jo sivu" tarkoittaa, että osoite on käytössä: valitse toinen.
- **Poistettu tai yhdistetty sivu**: ennen poistoa tee ohjaus sivun osoitteesta uuteen sivuun. Poiston varoitus kertoo osoitteen.
- Rivit 227-229 (Kopioi-kielto) korvataan tekstillä: "Kopioi pohjaksi (⋯-valikko) tekee kopion ilman osoitetta ja vanhan blogin tietoja. Anna kopiolle uusi otsikko ja paina polun kohdalla Luo."
- **Mitä EI saa tehdä** (rivit 650-655): kohta "Älä muuta julkaistun sivun Polkua" poistetaan, ja lukittujen sivujen maininta säilytetään omana kohtanaan. Rivi 656 ("Älä muuta Vanha osoite…") säilyy, ja siihen lisätään Aiemmat osoitteet: "täyttyy automaattisesti, et voi muuttaa".
- **Tyypilliset tilanteet**: rivit "Vaihdoin sivun osoitteen → ei tarvitse tehdä mitään, vanha ohjautuu", "Poiston varoitus vanhoista osoitteista → tee ensin ohjaus, ks. Lyhytosoite" ja "Lyhytosoite ei toimi → osoitteessa on sivu, tai ohjaus on julkaisematta".
- Rivit 146-147 (uutiskategorian polku): vanhat linkit ohjautuvat automaattisesti.

### Muut dokumentit
- **docs/07-seo-redirects.md**: uusi luku "Ajonaikaiset ohjaukset (Sanity)": järjestys (next.config → reitti → 404-haara: ohjaus ennen aiemmatPolut-kenttää), tilakoodit, ohjauskartta ja välimuisti, webhookin projektio sellaisenaan, ketjut ja silmukat, rakennetesti, verify-redirects --sanity ja Y19:n johtopäätös (8.10.2026: 188/188 .htm ja 689/689 kohdetta 200).
- **docs/05-content-models.md**: uusi tyyppi `ohjaus` ja yhteinen kenttä `aiemmatPolut` (täysi polku vs. tunniste, readOnly, webhookin ylläpitämä).
- **docs/17** §D: webhookin projektio ja "jos webhook luodaan uudelleen, käytä tätä projektiota".
- **docs/23** §0 Toteutettu: Y18, Y19 (loppu) ja Y20 päivämäärineen.
- **CLAUDE.md**: komentotauluun `npm run test:ohjaukset` ja `npm run e2e:ohjaukset` (paikallinen ja production). Tärkeisiin käytäntöihin rivi: "Uusi dynaaminen reitti: kun sisältöä ei löydy, kutsu `return ohjaaTaiEiLoydy(polku)` (sanity/lib/ohjaus.ts), älä `notFound()`. Testi valvoo tätä."

## 9. Y19:n jäljellä olevat pienet kohdat
- `scripts/generate-redirects.ts:440`: oletus `"production"` (luku on turvallista). Kommentti rivillä 4 ("lukee Sanityn development-datasetin") korjataan.
- `.gitignore`: lisätään `!/data/crawl-status.tsv` rivin 57 jälkeen ja commitoidaan tiedosto (5,6 kt, ei henkilötietoja). Generaattori ja `--offline` pystyvät silloin ajamaan myös vanhan sivuston poistuttua. `data/normalized/blogspot-map.json` jää pois, koska Sanity on blogiohjausten lähde.
- Ajonaikaista legacyUrl-hakua **ei** tehdä (ks. §0).

## 10. Käyttöönotto vaiheittain (dev → prod)

1. **Koodi** (yksi PR): §1-§9. `npm run type-check`, `npm run lint`, `npm test` (sisältää test:ohjaukset), `npm run typegen` (uudet kyselyt ja tyyppi `ohjaus`) ja `npm run build`.
2. **Development**: `npm run dev`, sitten `npm run e2e:ohjaukset -- --paikallinen`. Lisäksi käsin Studiossa: virheet lyhytosoitteen lähteelle ("/uutiset" → "osoitteessa on jo sivu", "/arvostelu.htm" → kiinteä ohjaus, duplikaatti, "/Jasenmaksu"), poiston varoitus vanhalle uutiselle, Kopioi pohjaksi vanhalle blogiuutiselle (kopiossa ei ole slugia, legacyUrlia eikä blogspot-tietoa) ja polun muutoksen sininen tieto.
3. **Varmuuskopio**: `npm run backup` → varmuuskopiot/.
4. **Webhookin projektio** productionissa §4.1:n mukaan (sanity.io/manage). Nykyinen käsittelijä ohittaa lisäkentät. Tarkistetaan Attempts-lokista, että kutsu palaa 200:lla.
5. **Deploy** Verceliin (push main). Tarkistetaan, että tuotanto vastaa ja `/uutiset/eiole` on yhä 404.
6. **Productionin e2e**: `npm run e2e:ohjaukset`. Luo ja poistaa 1 sivun ja 1 ohjauksen, netto 0 dokumenttia.
7. **Ensimmäinen lyhytosoite isän kanssa** (isä tekee Studiossa), esim. /jasenmaksu.
8. docs/23 §0 kuitataan.

Datamigraatiota ei ole: uudet kentät ovat tyhjiä, ja uutisKategorian ainoa arvo ["jasentieto"] on jo oikeassa muodossa. Kaksoisluvun tarvetta ei synny. Käsittelijä hyväksyy sekä vanhan projektion (`{_type, slug}`) että uuden, ja Studio kirjoittaa uuden kentän vasta webhookin kautta.

## 11. Tiedostolista
**Uudet:**
- lib/ohjaukset.ts
- sanity/lib/ohjaus.ts
- sanity/lib/aiemmat-polut.ts
- sanity/lib/ohjauksen-lahde.ts
- sanity/lib/queries/ohjaukset.ts
- sanity/schemas/documents/ohjaus.ts
- sanity/actions/vanhat-osoitteet.tsx
- scripts/test-ohjaukset.ts
- scripts/e2e-ohjaukset.ts
- data/crawl-status.tsv (gitiin)

**Muutettavat:**
- sanity/schemas/objects/contentMeta.ts (aiemmatPolutField, polkuMuuttunut)
- sanity/schemas/documents/{sivu, uutinen, tapahtuma, ravintola, galleriaAlbumi, klubiToiminta, arvokisa, pelaaja, stadion, jalkapalloTilasto, kaupunki, uutisKategoria}.ts
- sanity/schemas/index.ts
- sanity/structure.ts
- sanity.config.ts
- app/api/revalidate/route.ts
- 18 reittitiedostoa §3.3:n taulukosta
- sanity/lib/queries/ravintolat.ts
- components/ravintola-filters.tsx
- app/(public)/ravintolat/page.tsx
- lib/palautus.ts
- sanity/actions/palauta-varmuuskopiosta.tsx
- scripts/test-palautus.ts
- scripts/verify-redirects.ts
- scripts/generate-redirects.ts
- .gitignore
- package.json (test:ohjaukset, e2e:ohjaukset, test-ketju, devDependency @sanity/webhook)
- sanity/sanity.types.ts (typegen)
- docs/09, docs/07, docs/05, docs/17, docs/23
- CLAUDE.md

## Tarvitsee muilta

- B (linkki-objekti): skeematyyppi `linkki`, jota voi käyttää kenttänä `kohde` ilman pakollista tekstikenttää. Siinä valinta sivu, ulkoinen tai tiedosto, ja sivu on VAHVA viittaus (ei weak) tyyppeihin sivu, uutinen, tapahtuma, ravintola, klubiToiminta, arvokisa, galleriaAlbumi, stadion ja pelaaja. Kenttien nimet on vahvistettava esikatselua varten: oletus `kohde.sivu`, `kohde.url`, `kohde.tiedosto.asset`.
- B: GROQ-fragmentti `LINKKI_PROJEKTIO` (tiedosto sanity/lib/queries/linkki.ts tai vastaava), joka purkaa viittauksen routableProjection-muotoon ja tiedoston asset->url-muotoon.
- B: puhdas funktio `linkinHref(linkki: LinkkiData): string | null` tiedostossa lib/linkki.ts. Se laskee sisäisen kohteen documentHref-funktiolla ja palauttaa ulkoisen ja tiedoston URL:n sellaisenaan, sekä TypeScript-tyypin `LinkkiData`.
- B: merkkijonolinkkien muuttaminen viittauksiksi. Vasta silloin Sanityn oma poistodialogi näyttää valikon ja tekstin linkit (Y20:n 'siihen viitataan' -osa). Ennen sitä aiemmatPolut-ohjaus pitää myös merkkijonolinkit toimivina.
- A (osiosivut): listasivujen lukitut sivu-dokumentit (KOODIIN_SIDOTUT_SIVUT laajenee), jotta isä voi ohjata lyhytosoitteen myös koodireitin osiosivulle (esim. /ottelut) viittauksella. D ei muuta lukittujen sivujen sääntöjä. Sovitaan, että sanity.config.ts:n sivuhaarassa kääreiden järjestys on lukitulleSivulle(varoitaVanhoistaOsoitteista(t)).
- E (Studion rakenne ja nimet): Sivun asetukset -ryhmän uusi nimi (Y25/Y38 'Sivuston asetukset') ja SEO-välilehden uusi nimi. D lisää ryhmään kohdan 'Ohjaukset ja lyhytosoitteet' ja kentän 'Aiemmat osoitteet' seo-ryhmään. Jos E tekee pohjat tai merkit (Y37), 'Kopioi pohjaksi' on D:n toiminto, ja E voi lisätä siihen esim. julkaisuajan nollauksen.
- E (valinnainen, Y33 Sivuston tila): voi näyttää revalidate-reitin varoituksen 'webhookin projektiosta puuttuu operaatio', jos webhook luodaan joskus uudelleen vanhalla projektiolla.

## Tarjoaa muille

- Dokumenttityyppi `ohjaus` (kentät `lahde: string`, `kohde: linkki`, `muistiinpano: text`) Studiossa kohdassa Sivun asetukset → Ohjaukset ja lyhytosoitteet
- Yhteinen kenttä `aiemmatPolutField(group?: string, kuvaus?: string)` (sanity/schemas/objects/contentMeta.ts): readOnly string[], kenttä `aiemmatPolut`. Täysi polku OHJATTAVAT_TYYPIT-tyypeillä, tunniste uutisKategorialla ja kaupungilla.
- lib/ohjaukset.ts: `OHJATTAVAT_TYYPIT`, `TUNNISTE_TYYPIT`, `normalisoiPolku(polku): string | null`, `omaPolku(href): string | null`, `ratkaiseOhjaus(pyynto, kartta: OhjausKartta): { kohde: string; pysyva: boolean } | null`, `tarkistaOhjauksenLahde(lahde): true | string`, `yhdistaAiemmatPolut(nykyiset, vanha, uusi): string[] | null`, `osoitteenMuutos(tyyppi, ennen: EnnenTiedot, nyt: RoutableDoc)`, `polunMuutosViesti(tyyppi, category, julkaistu)`, `vanhatOsoitteet(doc): string[]`, `KOPIOSTA_POISTETTAVAT`, `tyhjennaKopiosta(doc)`
- sanity/lib/ohjaus.ts: `ohjaaTaiEiLoydy(polku: string): Promise<never>`. Jokaisen uuden dynaamisen reitin on käytettävä tätä notFound():n sijaan (test-ohjaukset valvoo).
- sanity/lib/queries/ohjaukset.ts: `ohjauskarttaQuery` (parametriton, välimuistitagi `ohjaus`)
- Välimuistitagi `ohjaus`. revalidate-reitti tyhjentää sen ohjauksen ja kaikkien OHJATTAVAT_TYYPIT-tyyppien muuttuessa.
- Webhookin projektiosopimus `{_id, _type, "slug": slug.current, "operaatio": delta::operation(), "ennen": before(){ "slug": slug.current, category, huuhkajatOsio, mestaruusmaa }}`. Muut kokonaisuudet voivat lukea `operaatio`- ja `ennen`-kenttiä revalidate-reitissä.
- sanity/actions/vanhat-osoitteet.tsx: `varoitaVanhoistaOsoitteista(toiminto)` ja `kopioiPohjaksi(toiminto)`. Käärimismallit, joita E ja A voivat yhdistellä.
- `polkuMuuttunut(rule)` uusin merkityksin: sininen tieto 'vanha osoite ohjautuu automaattisesti'. Kokonaisuuksien ei enää tarvitse ohjata isää kehittäjälle polun muutoksessa.
- `korjaaKaupunki(filters, facets)` (components/ravintola-filters.tsx) ja facet-kenttä `aiemmatTunnisteet`
- `luonnosVarmuuskopiosta(doc, nykyinen?)`: palautus säilyttää aiemmatPolut-kentän

## Tuotantomuutokset

- 1. `npm run backup` ennen kaikkea muuta (varmuuskopiot/, kuvineen).
- 2. Webhookin 'Sivuston päivitys (revalidate)' projektio muutetaan Sanityn hallinnassa (sanity.io/manage → API → Webhooks → Edit) muotoon §4.1. Tämä on konfiguraatiomuutos, dokumentteja muuttuu 0. Tehdään ENNEN deployta: nykyinen käsittelijä lukee vain _type ja slug. Paluu: vanha projektio `{_type, "slug": slug.current}`.
- 3. Vercel-deploy (push main): skeemaan tulevat uudet kentät ja tyyppi `ohjaus`, ja uutisKategoria.aiemmatPolut muuttuu readOnly-kentäksi. Dokumentteja muuttuu 0. Ainoa olemassa oleva arvo (uutisKategoria-tapahtumaraportti: ["jasentieto"]) säilyy sellaisenaan.
- 4. `npm run e2e:ohjaukset` productionissa varmuuskopion jälkeen ja kun webhook-jono on tyhjä. Luo 2 dokumenttia (sivu-testi-ohjaus-poistetaan ja ohjaus-testi-poistetaan), tekee sivulle 2 polun muutosta (webhook kirjoittaa aiemmatPolut-kentän 2 kertaa) ja poistaa molemmat. Netto 0 dokumenttia. Testisivu näkyy sivustolla noin 2–4 minuuttia.
- 5. Käyttöönoton jälkeen webhook kirjoittaa productioniin automaattisesti: yhden `set aiemmatPolut` -patchin (julkaistu ja mahdollinen luonnos) aina, kun isä muuttaa julkaistun ohjattavan dokumentin, uutiskategorian tai kaupungin polkua. Odotettu määrä on muutamia vuodessa.
- 6. Isän ensimmäinen lyhytosoite (esim. /jasenmaksu) Studiossa: +1 ohjaus-dokumentti. Isä tekee tämän itse.
- Ei patch- eikä --missing-migraatioita, eikä --replace-ajoja. development-datasettiin kirjoittaa vain `e2e:ohjaukset -- --paikallinen` (luo ja poistaa 2 dokumenttia).

## Riskit

- R1: Next 16 välimuistittaa sivutason ohjauksen ISR:ssä. Tuotannossa nähty: X-Vercel-Cache: HIT pelaajat-ohjauksessa. Jos välimuistissa oleva 307 ei tyhjene tagilla `ohjaus`, lyhytosoitteen kohteen vaihto näkyy vasta revalidate-ajan jälkeen (3600 s catch-all-reitissä). Varmistetaan e2e-askeleessa 5. Varasuunnitelma: catch-all-reitin `revalidate` 3600 → 300 tai erillinen kevyt reitti.
- R2: `mapDocument` DuplicateActionin propina on Sanityn @beta-rajapinta. Jos se poistuu tulevassa versiossa, Kopioi pohjaksi kopioi taas vanhat osoitteet. Lievennys: test-ohjaukset tarkistaa vain tyhjennysfunktion. Lisätään CLAUDE.md:hen tai docs/07:ään muistiinpano tarkistaa tämä Sanityn pääversiopäivityksessä. Haitta olisi pieni, koska staattiset ohjaukset eivät muutu ja slugin uniikkiustarkistus estää saman osoitteen.
- R3: Jos webhook luodaan joskus uudelleen vanhalla projektiolla tai se epäonnistuu (Vercel alhaalla, Y2-token Viewer-roolissa), aiempia osoitteita ei tallenneta, ja vanha osoite antaa 404:n. Lievennys: route.ts kirjaa console.warn-varoituksen, projektio dokumentoidaan docs/17:ään ja verify-redirects --sanity -tarkistus. Sanity yrittää epäonnistunutta webhookia uudelleen. Y2 (kirjoittavan tokenin rooli Free-tasolla 26.10.) koskee myös tätä, ja 26.10. testiin lisätään polun muutos.
- R4: Ohjausta haetaan vain 404-haarassa. Jos tuleva koodireitti renderöi tyhjän sivun 200:lla notFound()-kutsun sijaan, sen alla oleva ohjaus ei toimi. Lievennys: rakennetesti 23 ja CLAUDE.md-sääntö. Studion HEAD-tarkistus estää ohjauksen osoitteeseen, joka vastaa jo 200:lla.
- R5: Kaksi hyppyä (staattinen .htm → vanha polku → uusi polku), kun migroidun dokumentin slugia muutetaan. Hakukoneet seuraavat ketjun, mutta suora ohjaus on parempi. Lievennys: kehittäjä voi ajaa `npm run redirects` (oletus production §9:n jälkeen), jolloin staattinen kohde päivittyy. Isälle tästä ei ole välitöntä haittaa.
- R6: Studion HEAD-tarkistus (redirect: manual) erottaa sivun ja ohjauksen, mutta ei kerro syytä, jos staattinen ohjaus ja aiempi polku osuvat samaan osoitteeseen. GROQ-lisätarkistus kattaa yleisimmät tapaukset. Väärä negatiivinen johtaa vain siihen, että ohjaus ei koskaan laukea (sivu tai kiinteä ohjaus voittaa), eikä mikään rikkoudu.
- R7: Ohjauskartta palautetaan kokonaisuudessaan jokaisessa 404-renderöinnissä. Se on nyt pieni (0 ohjausta ja 1 kategoria). Jos aiempia osoitteita kertyy satoja, vastaus on silti alle 100 kt, ja Next Data Cachen raja on 2 Mt. Tarkistetaan verify-redirects --sanity -ajossa.
- R8: Kaupungin tunnisteen muutos ohjaa ravintolahakemiston 307:llä (siistiRavintolaHref käyttää redirect()-kutsua), ei 308:lla. Hyväksyttävää, koska rajattu näkymä on jo noindex.

## Avoimet päätökset



---

# E. Sivuston tila -näkymä ja Studion käytettävyys (Y33, Y35 loppu, Y36, Y37, Y38, Y10 ohjeet, Y40, Y42)

**Yhteenveto:** Toteutuksen jälkeen Studio avautuu Aloitus-näkymään. Siinä näkyy ensin liikennevaloina sivuston tila: viimeisin varmuuskopio ja sen ikä, yöllisen huollon tulos, otteluohjelman haku, Sanityn päivitysviestit sivustolle (webhook), dokumenttikiintiö kaikista dataseteistä, julkaisemattomat muutokset, Sanityn taso ja lomakkeiden kirjoitusoikeus. Punaisen tai keltaisen rivin kohdalla on suomenkielinen ohje siitä, mitä tehdä. Saman näkymän muut osat ovat tehtävien laskurit linkkeineen, puuttuvat perustiedot (sähköposti, hallitus, esittelykuva), Luo uusi -painikkeet valmiisiin pohjiin ja lyhyt Tee näin -ohje, josta pääsee koko oppaaseen.

Isä voi tämän jälkeen:
- aloittaa vuosikokouskutsun, palloveikkauksen tilanteen, uuden palloveikkauskauden, Huuhkajien ottelun ja ravintolan klubiarvosanan valmiista pohjasta. Unohtunut [täytä: …] -kohta estää julkaisun.
- nähdä dokumentin yläreunan merkeistä, onko se Ajastettu, Tarkistettava, Ei vielä sivustolla, Odottaa toista arvioijaa, Piilotettu tai Entinen jäsen.
- nähdä jokaisen 187 taulukon kohdalla, millä sivulla se näkyy, ja avata sivun esikatseluun. Jos taulukko ei näy missään, Studio sanoo sen ääneen. Tilastot on Studiossa ryhmitelty, ja ryhmän +-painike täyttää kategorian valmiiksi.
- piilottaa etusivun lohkon poistamatta sitä.
- ymmärtää johdantokenttien työnjaon: Tiivistelmä, Lyhenne ja Ingressi sekä hakutulosten kuvaus.
- kirjoittaa kategorialle selityksen, joka näkyy uutisen valintaruudun alla.
- hakea Klubilaisten arvosanat ravintoloittain.
- lukea kentät ilman ammattikieltä: "Osoite sivustolla", "Hakukoneet ja jako", "Monesko kerta".

Sivuston kaatumisesta tulee sähköpostihälytys ilmaisesta UptimeRobotista (ohje docs/17).

Isä ei vieläkään voi:
- saada sähköposti-ilmoitusta Studion tilasta. Tila näkyy vain, kun hän avaa Studion. Kaatuminen hälyttää UptimeRobotin kautta.
- korjata itse punaisen rivin teknistä syytä (Vercelin muuttujat, tokenit, webhook). Tätä varten näkymä kertoo, mitä tukihenkilölle sanotaan.
- järjestää listoja raahaamalla. Järjestys annetaan yhä luvulla, mutta Studion lista on nyt samassa järjestyksessä kuin sivusto.
- tagata kuvia tai poistaa niitä kuvakirjastosta. Kuvakirjastoa ei asenneta (Y42: 3 käyttämätöntä kuvaa 1719:stä, oletusvalitsimen haku riittää).

Productionin dataan ei tehdä yhtään skriptipatchia. Ainoat uudet dokumentit ovat kaksi automaattista tila-dokumenttia (sivustonTila.huolto ja sivustonTila.varmuuskopio).

**Työmäärä:** 7 päivää

## Nykytila

Koodi (luettu 8.10.2026, commit bf05473):
- Studion asetukset: `sanity.config.ts:45-98`. Pluginit ovat structureTool, presentationTool, visionTool ja fiFILocale. Omaa työkalua tai dashboardia ei ole, joten Studio avautuu Sisältö-puuhun. `schema.templates` (`:26-29`) vain suodattaa singletonit ja varmuuskopion pois, eli valmiita pohjia ei ole. `document.badges` puuttuu. `tools` (`:93-98`) piilottaa Visionin roolin perusteella.
- `sanity/structure.ts:57-121` Tehtävät sinulle: 5 suodatettua listaa (arvostelut, kommentit 7 pv, julkaisemattomat, ajastetut, tarkistettavat). Laskureita ei ole, eikä listoilla ole eksplisiittisiä `.id()`-tunnisteita.
- `sanity/structure.ts:346-352`: Klubilaisten arvosanat ovat yhtenä listana, jossa on 1544 dokumenttia. `:365` Tilastot on yksi 187 taulukon lista. `:268` Klubin toiminnalla ei ole defaultOrderingia, vaikka sivusto järjestää `jarjestys asc, title asc` (`sanity/lib/queries/klubi.ts:131`).
- `sanity/presentation.ts:11-60`: sijaintilinkki on määritelty 9 tyypille, lehtileikkeelle ja etusivulle. Jalkapallotilastolta, ottelulta, hallituksen jäseneltä, kommentilta, klubiArviolta ja uutiskategorialta se puuttuu. Sijainnin laskenta on jo olemassa (`lib/path.ts:174-215` documentRoute/documentHref, viittaajan kautta `parent`). Viittaajan alikysely on `sanity/lib/queries/sitemap.ts:53-57`.
- `jalkapalloTilasto.ts:46-81`: kategoria on 23 kohdan lista, joka on kirjoitettu suoraan skeemaan. Esikatselu näyttää raa'an avaimen (`:267-269` subtitle: category). Kuvaus on "Vaikuttaa siihen, miten tilasto näytetään sivulla".
- Cronit: `vercel.json` ajaa /api/varmuuskopio maanantaisin klo 01 UTC ja /api/huolto päivittäin klo 02 UTC. `app/api/huolto/route.ts:29-75` ja `app/api/varmuuskopio/route.ts:31-112` palauttavat tuloksen vain HTTP-vastauksena, ja virhe näkyy vain Vercelin tunnin lokissa. Otteluhaun virhe on vain `console.error` (`lib/ottelut.ts:217-225`, `fetchExternal`). Tuloksia ei tallenneta mihinkään.
- Webhook: `app/api/revalidate/route.ts`. Ei kirjoita tilaa.
- Etusivu: `etusivu.ts:148-150` lupaa "Lisää, järjestä ja piilota lohkoja vetämällä", mutta piilotusta ei ole. `app/(public)/page.tsx:139-155` renderöi kaikki lohkot. `/ottelut` lukee seuralistan otteluohjelmalohkosta (`sanity/lib/queries/ottelut.ts:29`).
- Johdantokentät (Y10): uutisen alku on `tiivistelma ?? excerpt` (`app/(public)/uutiset/[slug]/page.tsx:117`), listat ja kortit käyttävät Lyhennettä (`components/news-card.tsx:42`, `components/blocks/uutiset-block.tsx:99-122`, `hero.tsx:216`), ja meta on `seoDescription → tiivistelma → excerpt` (`:80-84`). Sivu: `tiivistelma || ingress` (`app/(public)/[...slug]/page.tsx:85`), ja Ingressin kuvaus on "Näkyy hero-alueella" (`sivu.ts:107`). Oppaassa docs/09:87-88 lukee "Lyhenne näkyy … jutun alussa. Tiivistelmän voi jättää tyhjäksi", mikä on väärin aina, kun Tiivistelmä on täytetty.
- Ammattikieli (Y38): "Polku (slug)" 10 tyypissä (arvokisa:41, galleriaAlbumi:25, jalkapalloTilasto:39, klubiToiminta:45, pelaaja:41, ravintola:53, sivu:60, stadion:32, tapahtuma:32, uutinen:39), "SEO"-välilehti 10 tyypissä, `seoFields.ts:6,15` "SEO-otsikko (override)" ja "…ingressiä/excerptiä", `sivu.ts:100` "Yläbanneri (hero-kuva)", `uutinen.ts:72` "teaser", `kaupunki.ts:23,26` "Osoitetunniste" ja "Generate", `yhteystiedot.ts:75` "URL", `uutisKategoria.ts:42` "Polku". Otsikko "Järjestysnumero" on käytössä neljässä merkityksessä (`klubiToiminta.ts:61,99`, `hallitusJasen.ts:55`, `jalkapalloTilasto.ts:239`).
- Kategoriat (Y40): `uutisKategoria.ts` sisältää vain kentän "Kuvaus hakukoneille". `KategoriatInput.tsx` näyttää pelkän nimen. Tunnisteiden käyttömääräjärjestys on jo toteutettu (`sanity/components/tunnisteet/tunnisteet.ts:57-77`), joten Y40:n tunnisteosa on valmis.
- Kuvat (Y42): pluginia ei ole. `sanity-plugin-media` 6.3.2 (peer sanity ^5 || ^6, MIT) ja `@sanity/orderable-document-list` 2.0.25 (peer ^5) ovat yhteensopivia.
- Muut: varmuuskopion suodatin `lib/varmuuskopio.ts:26-34`, palautuksen poissulut `lib/palautus.ts:28` ja Sanity 5.31.2. Next 16 ei käytä cacheComponentsia, joten `unstable_cache` on yhä tuettu (`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`). Presentationin `resolve.locations` voi olla myös funktio `(params, {documentStore}) => Observable`, ja `DocumentLocationsState` tukee kenttiä `message` ja `tone` (`node_modules/sanity/lib/_chunks-dts/types2.d.ts:244-272`). Merkit renderöidään v5:n dokumenttipaneelissa (`structureTool.js` DocumentBadges, @beta).

Production (vain luku, 8.10.2026):
- 5569 dokumenttia, joista 3847 ilman asset-dokumentteja (1719 kuvaa ja 2 tiedostoa). Developmentissa on 5559, joista 3832 ilman assetteja. Yhteensä ilman assetteja on noin 7679, ja tilauksen `resources.documents.quota` on 10000. Datasetin kiintiö on 2, joten molemmat paikat ovat käytössä.
- Varmuuskopiot: 2026-09-30 (3787 dokumenttia) ja 2026-10-05 (5544 dokumenttia, 2,07 Mt). Viimeisin on 3 päivää vanha.
- Luonnoksia on 4: 3 uutista ja yksi previewUrlSecret.
- Webhook "Sivuston päivitys (revalidate)" (id OONFDb25fK90qTHD) on käytössä. Sen suodatin on `defined(_type) && !(_type match "sanity.*")`. Hooks API:n `/attempts` palauttaa 25 viimeisintä yritystä, ja niissä on 0 virhettä.
- Tilaus: growth-trial, status trialing, trialUntil 2026-10-26T14:30Z. Molemmat datasetit ovat yksityisiä.
- Uutiskategorioita on 10, eikä yhdelläkään ole kuvausta. Käyttömäärät: Ottelutapahtuma 54, Kannattajakulttuuri 0, Tiedote 0, Tapahtumat 125, Jalkapallo 497, Ravintola 145, Blogikirjoitus 95, Palloveikkaus 85, Matkakuvaus 23 ja Arvostelu 1.
- Tilastoja on 187, ja kaikilla on reitti: klubi→sivu 34, klubi→klubiToiminta 39, arvokisa→arvokisa 59, pelaaja→pelaaja 1. Muut kulkevat kategoriasivun kautta. Ilman viittaajaa olevia klubi- tai pelaaja-taulukoita ei ole.
- klubiArvio 1544 (570 ravintolalle) ja ravintolat 573. needsReview on 42 dokumentissa. Hallituksen jäseniä on 0. Yhteystiedoista puuttuvat sähköposti, osoite ja puhelin, ja etusivun esittelylohkosta puuttuu kuva.
- Etusivun lohkot ovat otteluohjelma, uutiset, ravintolatSpotlight ja esittely.
- Uutisissa on Tiivistelmä 550/756:ssa, Lyhenne 756/756:ssa ja SEO-kuvaus 0:ssa. Sivuilla Ingressi on vain tietosuojassa, ja Tiivistelmä on 7/8:ssa.
- Vuosikokousuutisten malli on "Lahden Suomalainen Klubi ry - vuosikokous 2026" / "…:n 19. vuosikokous pidetään lauantaina 25.04.2026 klo 11:30 …", kategoriana Tapahtumat. Palloveikkauksen malli on "Palloveikkaus tilanne 2026 / 25", kategoriat Jalkapallo ja Palloveikkaus.
- Kuvia, joihin mikään ei viittaa, on 3/1719. Sana "täytä" esiintyy 0 uutisessa.

## Suunnitelma

# E. Sivuston tila ja Studion käytettävyys: toteutussuunnitelma

## 0. Periaatteet ja järjestys

- **Ei uutta editorin singletonia.** Uusi tyyppi `sivustonTila` on koneen kirjoittama loki, ei asetussivu. Se on varmuuskopio-tyypin kaltainen: kaksi kiinteän tunnuksen dokumenttia (`sivustonTila.huolto` ja `sivustonTila.varmuuskopio`). Se ei näy sisältöpuussa, siitä ei luoda dokumentteja käsin, eikä sitä muokata. Perustelu: cronin tulos pitää tallentaa jonnekin, mitä Studio voi lukea ilman Vercel-pääsyä ja ilman maksullisia palveluita. Pistetunnus (`sivustonTila.`) on Sanityssa polkudokumentti, jota ei palauteta tunnistautumattomille, joten tieto ei näy julkisesta datasetistä 26.10. jälkeen. Tämä varmistetaan 26.10.
- **Kaikki muu luetaan suoraan.** Tieto luetaan Studiossa kirjautuneen käyttäjän istunnolla: varmuuskopiot, julkaisemattomat ja kiintiö datasetistä, webhook Hooks API:sta ja tilaus Management API:sta. Kirjoittavaa tokenia ei tarvita selaimessa.
- **Säännöt puhtaisiin lib-moduuleihin.** Tila-, merkki-, pohja- ja sijaintisäännöt testataan muodossa `scripts/test-*.ts`.
- **Toteutusjärjestys (isän hyöty / työ):**
  1. PR 1: Y38 piilotuskytkin ja Y10 ohjeet (0,5 pv)
  2. PR 2: Y33 tila (lib + cron + schema) (1 pv)
  3. PR 3: Y35 Aloitus-työkalu (1,5 pv)
  4. PR 4: Y37 pohjat, merkit ja arvosanat ravintoloittain (1 pv)
  5. PR 5: Y36 taulukon sijainti ja tilastoryhmät (1 pv)
  6. PR 6: Y40 kategorian käyttöselitys ja Y38 nimet (0,75 pv)
  7. docs/09, 17, 23, 05 ja CLAUDE.md päivitetään jokaisessa PR:ssä omalta osaltaan (yht. 0,75 pv). Testaus developmentissa ja tuotannon tarkistus 0,5 pv.
- **Productionin dataan ei tehdä skriptipatcheja.** Kaikki uudet kentät ovat valinnaisia, ja `undefined` tarkoittaa nykyistä käytöstä.

---

## 1. Y33 Sivuston tila

### 1.1 Uusi skeema `sanity/schemas/documents/sivustonTila.ts`

```ts
import { ActivityIcon } from "@sanity/icons";
defineType({
  name: "sivustonTila",
  title: "Sivuston tila (automaattinen)",
  type: "document",
  icon: ActivityIcon,
  readOnly: true,
  description: "Yöllisen huollon ja varmuuskopion kirjaama tulos. Näkyy Aloitus-näkymässä. Ei muokata käsin.",
  fields: [
    defineField({ name: "tehtava", title: "Tehtävä", type: "string",
      options: { list: [{ title: "Yöllinen huolto", value: "huolto" }, { title: "Viikkovarmuuskopio", value: "varmuuskopio" }] } }),
    defineField({ name: "aika", title: "Viimeisin ajo", type: "datetime" }),
    defineField({ name: "onnistui", title: "Onnistui", type: "boolean" }),
    defineField({ name: "viimeisinOnnistunut", title: "Viimeisin onnistunut ajo", type: "datetime" }),
    defineField({ name: "tulokset", title: "Tulokset", type: "array", of: [{ type: "object", name: "tilaTulos", fields: [
      { name: "nimi", title: "Mitä tarkistettiin", type: "string" },
      { name: "tila", title: "Tila", type: "string", options: { list: ["ok", "huomio", "virhe"] } },
      { name: "viesti", title: "Selitys", type: "text", rows: 2 },
      { name: "maara", title: "Määrä", type: "number" },
    ] }] }),
  ],
  preview: { select: { tehtava: "tehtava", aika: "aika", onnistui: "onnistui" },
    prepare: ({ tehtava, aika, onnistui }) => ({ title: tehtava === "varmuuskopio" ? "Viikkovarmuuskopio" : "Yöllinen huolto",
      subtitle: `${onnistui ? "Onnistui" : "Epäonnistui"} · ${aika ? new Date(aika).toLocaleString("fi-FI") : "ei ajettu"}` }) },
});
```

Kytkennät:
- `sanity/schemas/index.ts`: lisätään `schemaTypes`-listaan, ei `singletonTypes`-listaan.
- `sanity.config.ts`:
  - `schema.templates`-suodattimeen lisätään `&& schemaType !== "sivustonTila"`.
  - `document.actions`: `if (context.schemaType === "sivustonTila") return [];`
  - `newDocumentOptions`: suodatetaan pois.
- `lib/varmuuskopio.ts` `kuuluuKopioon`: lisätään `if (doc._type === "sivustonTila") return false;`. Testi tulee `scripts/test-varmuuskopio.ts`:hen.
- `lib/palautus.ts:28` `EI_PALAUTETA`: lisätään `"sivustonTila"`.
- `app/api/revalidate/route.ts`: alkuun `const OHITETTAVAT = new Set(["sivustonTila", "varmuuskopio"]);`. Jos `OHITETTAVAT.has(body._type)`, palautetaan `{ revalidated: false, syy: "järjestelmädokumentti" }` statuksella 200. Ne eivät näy sivustolla, ja näin vältetään turha tyhjennys.
- Structure: tyyppi ei näy missään listassa. Tehtävät sinulle -listan "Julkaisemattomat muutokset" -poissulkuun (`params.pois`) lisätään `"sivustonTila"`.

### 1.2 Puhdas sääntömoduuli `lib/sivuston-tila.ts`

Tiedosto tuo vain riippuvuudettomia moduuleja, joten sen voi ajaa tsx:llä.

```ts
export const TILA_ID = { huolto: "sivustonTila.huolto", varmuuskopio: "sivustonTila.varmuuskopio" } as const;
export const LOMAKETOKEN = "Vercel - lomakkeet";              // siirretään scripts/tarkista-sanity-taso.ts:stä
export const KIRJOITTAVAT_ROOLIT = new Set(["editor", "developer", "administrator"]);
export const OLETUSKIINTIO = 10_000;

export type Tila = "ok" | "huomio" | "virhe" | "tuntematon";
export type TilaRivi = { id: string; otsikko: string; tila: Tila; teksti: string; ohje?: string };
export type AjonTulos = { nimi: string; tila: "ok" | "huomio" | "virhe"; viesti: string; maara?: number };
export type AjoDokumentti = { aika?: string; onnistui?: boolean; viimeisinOnnistunut?: string; tulokset?: AjonTulos[] } | null;
```

Funktiot (kaikki saavat `nyt: Date` parametrina):

**`varmuuskopionTila(viimeisin: { paiva: string; dokumentteja?: number } | null, ajo: AjoDokumentti, nyt): TilaRivi`**, id `varmuuskopio`, otsikko "Varmuuskopio".
- ok, kun kopio on enintään 8 päivää vanha: "Viimeisin kopio ma 5.10.2026 (3 päivää sitten), 5544 dokumenttia."
- virhe, kun kopio on yli 8 päivää vanha tai kopiota ei ole: "Viikkovarmuuskopiota ei ole tehty 9 päivään."
  - ohje: "Ajastus ei ole käynyt tai se epäonnistui. Kerro tukihenkilölle: Vercel → Cron Jobs → /api/varmuuskopio. Sisältösi on tallessa, mutta palautus vanhaan versioon ei ole mahdollinen ilman tuoretta kopiota."
- Jos `ajo?.onnistui === false` ja ajo on uudempi kuin viimeisin kopio, tila on virhe, ja tekstiin lisätään ajon ensimmäisen tuloksen viesti.

**`huollonTila(ajo: AjoDokumentti, nyt): TilaRivi`**, id `huolto`, otsikko "Yöllinen huolto".
- tuntematon, kun `!ajo`: "Huoltoa ei ole vielä kirjattu. Tieto tulee ensimmäisen yön jälkeen."
- virhe, kun viimeisestä ajosta on yli 30 tuntia: "Yöllinen huolto ei ole käynyt 2 vuorokauteen."
  - ohje: "Ravintoloiden arvosanat ja arvostelukuvien siivous odottavat. Kerro tukihenkilölle."
- virhe, kun `onnistui === false`: tekstinä virheellisten tulosten viestit.
- ok: "Viimeksi tänä aamuna klo 5.02. Arvosanoja korjattu 0, vanhoja arvostelukuvia poistettu 0."
- Jos arvosanoja korjattiin yli 0, tila on huomio: "Huolto joutui korjaamaan N ravintolan arvosanan. Sanityn päivitysviesti sivustolle on voinut epäonnistua. Jos tämä toistuu, kerro tukihenkilölle."

**`otteluhaunTila(ajo: AjoDokumentti, nyt): TilaRivi`**, id `otteluhaku`, otsikko "Otteluohjelman haku". Lukee `ajo.tulokset`-kentän alkion `nimi === "otteluhaku"`.
- virhe, kun tila on virhe: "Otteluohjelman haku epäonnistui: {viesti}."
  - ohje: "Ottelut-sivulla ja etusivulla näkyvät vain Studioon lisätyt ottelut. Lisää tärkeät ottelut käsin (Ottelut → +) ja kerro tukihenkilölle."
- Kun määrä on 0 ja kuukausi on 3–10: huomio, "Haku onnistui, mutta otteluita ei löytynyt."
- Kun määrä on 0 ja kuukausi on 11–2: ok, "Talvitauko: uuden kauden otteluohjelmaa ei ole vielä julkaistu."
- Muuten ok: "Veikkausliiga: 198 ottelua, joista 12 tulevaa."

**`webhookinTila(hook: { isDisabled: boolean; isDisabledByUser: boolean } | null, yritykset: { createdAt: string; isFailure: boolean; resultCode: number | null }[], nyt): TilaRivi`**, id `webhook`, otsikko "Muutosten päivitys sivustolle".
- huomio, kun `!hook`: "Päivitysviestiä ei ole määritetty tälle datasetille. Muutokset näkyvät sivulla noin minuutin viiveellä."
- virhe, kun `hook.isDisabled`: "Sanityn päivitysviesti sivustolle on pois käytöstä."
  - ohje: "Muutokset näkyvät silti noin minuutin viiveellä, mutta ravintoloiden arvosanat päivittyvät vasta yöllä. Kerro tukihenkilölle: sanity.io/manage → API → Webhooks."
- huomio, kun uusin yritys `isFailure` tai virheitä on vähintään 3 viimeisistä 25:stä: "N viimeisimmästä päivityksestä epäonnistui (viimeisin {pvm})." ohje kuten edellä.
- ok: "Viimeisin päivitys {pvm klo}." Ilman yrityksiä: "Ei julkaisuja viime aikoina."

**`kiintionTila(kaytossa: number, raja: number): TilaRivi`**, id `kiintio`, otsikko "Dokumenttikiintiö".
- ok, kun käyttö on alle 80 %: "Noin 7 679 / 10 000 dokumenttia (77 %)."
- huomio 80 %:sta alkaen: ohje "Kun raja täyttyy, uusia uutisia ei voi tallentaa. Kerro tukihenkilölle: development-datasetin voi tyhjentää (docs/23 Y4)."
- virhe 95 %:sta alkaen.

**`julkaisemattomienTila(maara: number): TilaRivi`**, id `julkaisemattomat`, otsikko "Julkaisemattomat muutokset".
- ok, kun 0: "Kaikki muutokset on julkaistu."
- muuten huomio: "N dokumentissa on muutos, jota ei ole julkaistu. Sivustolla näkyy niissä yhä vanha versio." Rivi linkittää listaan.

**`tilauksenTila(t: { planNimi?: string; status?: string; trialUntil?: string | null }, datasetit: { name: string; aclMode: string }[], dataset: string, lomakeRoolit: string[] | null, nyt): TilaRivi[]`** palauttaa kaksi riviä:
- id `taso`, otsikko "Sanityn taso":
  - ok: "Free, datasetti julkinen."
  - huomio, kun kokeiluun on alle 21 päivää: "Growth-kokeilu päättyy 26.10.2026 klo 16.30."
- id `lomakkeet`, otsikko "Lomakkeiden tallennus":
  - ok, kun jokin rooli on joukossa `KIRJOITTAVAT_ROOLIT`.
  - virhe muuten: "Kommentit, arvostelut, huolto ja varmuuskopio eivät voi tallentaa."
    - ohje: "Kerro tukihenkilölle heti: token 'Vercel - lomakkeet' tarvitsee kirjoitusoikeuden (docs/23 Y2)."
  - tuntematon, kun `null` (ei oikeutta lukea): "Näkyy vain ylläpitäjälle."

**Muut funktiot:**
- **`kokonaistila(rivit: TilaRivi[]): Tila`**: pahin tila järjestyksessä virhe > huomio > ok. Tuntematon ei nosta tilaa.
- **`huoltoajonKirjaus(tulokset: AjonTulos[], onnistui: boolean, nyt: Date)`**: palauttaa `{ aika, onnistui, tulokset (_key = nimi), ...(onnistui ? { viimeisinOnnistunut: aika } : {}) }`.
- **`puuttuvatPerustiedot(p: { sahkoposti: boolean; osoite: boolean; puhelin: boolean; hallitus: number; esittelykuva: boolean }): { id: string; teksti: string; kohde: string }[]`** palauttaa nämä tekstit:
  - "Klubin sähköpostiosoite puuttuu (Yhteystiedot)."
  - "Postiosoite puuttuu (Yhteystiedot)."
  - "Puhelinnumero puuttuu (Yhteystiedot)."
  - "Hallituksen jäseniä ei ole lisätty (Hallitus)."
  - "Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot)."
- `pvmSuomeksi()` ja `ikaPaivina()` ovat apureita. Helsingin aikavyöhyke tulee `Intl`-rajapinnasta.

### 1.3 Cronit kirjaavat tuloksen

Yhteinen apuri `sanity/lib/kirjaa-ajo.ts`:

```ts
export async function kirjaaAjo(client: SanityClient, id: string, tehtava: "huolto" | "varmuuskopio", kirjaus: ReturnType<typeof huoltoajonKirjaus>): Promise<void> {
  try {
    await client.transaction()
      .createIfNotExists({ _id: id, _type: "sivustonTila", tehtava })
      .patch(id, (p) => p.set(kirjaus))
      .commit({ visibility: "async" });
  } catch (error) { console.error(`[${tehtava}] tilan kirjaus epäonnistui:`, error instanceof Error ? error.message : error); }
}
```

Kirjauksen virhe ei kaada ajoa. Jos kirjaus jää tekemättä, Aloitus näyttää vanhentuneen ajon punaisena.

**`app/api/huolto/route.ts`:**
- Nykyiset kaksi tehtävää kerätään `AjonTulos`-listaksi:
  - arvosanat: `{ nimi: "arvosanat", tila: virhe ? "virhe" : muutokset.length ? "huomio" : "ok", viesti: virhe ?? "Korjattu N", maara: N }`
  - kuvat: `{ nimi: "kuvat", … }`
- Uusi kolmas tehtävä on otteluhaku: `const haku = await tarkistaOtteluhaku();` → `{ nimi: "otteluhaku", tila: haku.virhe ? "virhe" : "ok", viesti: haku.virhe ?? `${haku.lahde}: ${haku.maara} ottelua, joista ${haku.tulevia} tulevaa`, maara: haku.maara }`.
- **Otteluhaku ei muuta `onnistui`-arvoa eikä HTTP-koodia.** Se on ulkoinen palvelu, ei huollon vika.
- Lopuksi `await kirjaaAjo(client, TILA_ID.huolto, "huolto", huoltoajonKirjaus(tulokset, onnistui, new Date()))`, sitten nykyinen vastaus.

**`app/api/varmuuskopio/route.ts`:**
- Onnistumisen jälkeen kirjataan `[{ nimi: "varmuuskopio", tila: "ok", viesti: `${maara} dokumenttia`, maara }]` arvolla onnistui true.
- `catch`-haarassa kirjataan `[{ nimi: "varmuuskopio", tila: "virhe", viesti: syy }]` arvolla onnistui false. Client luodaan `try`-lohkon ulkopuolella, jotta se on käytettävissä `catch`-haarassa.

**`lib/ottelut.ts`:**
- `fetchTaso(apiKey, { tuore = false } = {})`: kun `tuore`, fetchiin annetaan `cache: "no-store"` ja `signal: AbortSignal.timeout(15_000)`.
- Uusi `async function haeVeikkausliigaTuore(): Promise<Ottelu[]>` kutsuu `parseVeikkausliigaIcs(await fetchVeikkausliigaText(url))` ilman `unstable_cache`a.
- Uusi vienti:

```ts
export async function tarkistaOtteluhaku(nyt = new Date()): Promise<{ lahde: "Taso" | "Veikkausliiga"; maara: number; tulevia: number; virhe: string | null }>
```

Se käyttää samaa lähdevalintaa kuin `fetchExternal`. Virhe palautetaan, ei heitetä. `tulevia` lasketaan ehdolla `aika > nyt`.

### 1.4 Studion tilahaku `sanity/components/aloitus/useSivustonTila.ts`

```ts
export function useSivustonTila(): { rivit: TilaRivi[] | null; laskurit: Laskurit | null; puuttuvat: ReturnType<typeof puuttuvatPerustiedot>; lataa: () => void; ladataan: boolean }
```

- `const client = useClient({ apiVersion }).withConfig({ perspective: "raw" })`. `projectId` ja `dataset` tulevat Studion clientin konfiguraatiosta (`client.config()`).
- Yksi GROQ-kysely datasetistä on `ALOITUS_KYSELY` (sijainti `sanity/lib/tehtavat.ts`, ks. 2.1).
- Management-kutsut tehdään kirjautuneen käyttäjän istunnolla. Jokainen kutsu on omassa `try`-lohkossaan, ja 401/403 tuottaa tilan tuntematon ja tekstin "Näkyy vain ylläpitäjälle.":

```ts
const hallinta = client.withConfig({ apiVersion: "2021-06-07", useProjectHostname: false });
const tilaus = await hallinta.request({ uri: `/subscriptions/project/${projectId}` });   // plan.name, status, trialUntil, resources.documents.quota
const datasetit = await hallinta.request({ uri: `/projects/${projectId}/datasets` });
const tokenit = await hallinta.request({ uri: `/projects/${projectId}/tokens` });       // label === LOMAKETOKEN → roles[].name
const koukut = client.withConfig({ apiVersion: "2021-10-04", useProjectHostname: false });
const hookit = await koukut.request({ uri: `/hooks/projects/${projectId}` });           // valitaan: h.dataset === dataset && h.url.endsWith("/api/revalidate")
const yritykset = await koukut.request({ uri: `/hooks/projects/${projectId}/${hook.id}/attempts` });
```

- Kiintiö lasketaan jokaisesta datasetistä:

```ts
await Promise.all(datasetit.map((d) => client.withConfig({ dataset: d.name }).fetch(`count(*[!(_type match "sanity.*") && !(_id in path("_.**"))])`)))
```

  Summaa verrataan arvoon `tilaus.resources.documents.quota ?? OLETUSKIINTIO`. Jos datasetit eivät ole luettavissa, lasketaan vain nykyinen datasetti ja tekstiin lisätään "(vain tämä datasetti)".
- Haku tehdään kerran, kun näkymä avataan, ja uudelleen Päivitä-painikkeesta. Kuuntelua ei ole, jotta API-kiintiö säästyy (noin 15 pyyntöä avausta kohden).

### 1.5 Ulkoinen valvonta (vain ohje, docs/17 uusi §E "Valvonta")

**UptimeRobot Free** (ilmainen, ei-kaupalliseen käyttöön, 5 minuutin väli):
1. Tili luodaan klubin sähköpostilla.
2. Monitorit:
   - (a) HTTP(s) `https://www.lahdensuomalainenklubi.com/`
   - (b) Keyword-monitori samaan osoitteeseen, avainsana "Lahden Suomalainen Klubi". Se huomaa myös tyhjän sivun.
   - (c) HTTP(s) `https://www.lahdensuomalainenklubi.com/studio`
3. Hälytykset menevät sähköpostiin isälle ja tukihenkilölle.
4. Valinnaisesti julkinen tilasivu.

Kirjataan, että Vercelin cronien hiljaista pysähtymistä UptimeRobot ei huomaa. Sen huomaa Aloitus-näkymän punainen rivi.

---

## 2. Y35 Aloitus-työkalu

### 2.1 Jaettu tehtävärekisteri `sanity/lib/tehtavat.ts` (puhdas)

```ts
export type Tehtava = { id: string; otsikko: string; laskuri: string /* GROQ count, raw-perspektiivi */; suodatin: string /* structure, drafts-perspektiivi */; params?: Record<string, unknown>; tyyppi?: string; jarjestys?: { field: string; direction: "asc" | "desc" }[] };
export const TEHTAVAT: Tehtava[] = [
  { id: "arvostelut", otsikko: "Arvostelut odottavat hyväksyntää", tyyppi: "ravintolaKayttajaArvostelu",
    suodatin: `_type == "ravintolaKayttajaArvostelu" && _originalId in path("drafts.**")`,
    laskuri: `count(*[_type == "ravintolaKayttajaArvostelu" && _id in path("drafts.**")])`, jarjestys: [{ field: "submittedAt", direction: "desc" }] },
  { id: "kommentit", otsikko: "Uudet kommentit (7 päivää)", tyyppi: "kommentti",
    suodatin: `_type == "kommentti" && dateTime(lahetetty) > dateTime(now()) - 60*60*24*7`,
    laskuri: `count(*[_type == "kommentti" && !(_id in path("drafts.**")) && dateTime(lahetetty) > dateTime(now()) - 60*60*24*7])` },
  { id: "julkaisemattomat", otsikko: "Julkaisemattomat muutokset",
    suodatin: `_originalId in path("drafts.**") && !(_type match "sanity.*") && !(_type in $pois)`,
    laskuri: `count(*[_id in path("drafts.**") && !(_type match "sanity.*") && !(_type in $pois)])`,
    params: { pois: ["ravintolaKayttajaArvostelu", "varmuuskopio", "sivustonTila"] } },
  { id: "ajastetut", otsikko: "Ajastetut uutiset", tyyppi: "uutinen",
    suodatin: `_type == "uutinen" && dateTime(publishedAt) > dateTime(now())`,
    laskuri: `count(*[_type == "uutinen" && !(_id in path("drafts.**")) && dateTime(publishedAt) > dateTime(now())])` },
  { id: "tarkistettavat", otsikko: "Vaatii tarkistuksen (kaikki)",
    suodatin: `needsReview == true && _type in $tyypit`,
    laskuri: `count(*[needsReview == true && _type in $tyypit && !(_id in path("drafts.**"))])`,
    params: { tyypit: TARKISTETTAVAT_TYYPIT } },
  { id: "kategoriat", otsikko: "Uutiskategoriat ilman selitystä", tyyppi: "uutisKategoria",
    suodatin: `_type == "uutisKategoria" && !defined(kaytto)`,
    laskuri: `count(*[_type == "uutisKategoria" && !(_id in path("drafts.**")) && !defined(kaytto)])` },
];
```

- `TARKISTETTAVAT_TYYPIT` siirretään tänne tiedostosta `structure.ts:32-44`.
- **`ALOITUS_KYSELY`** kootaan TEHTAVAT-rekisteristä muotoon `{ "<id>": <laskuri>, … }`, ja siihen lisätään:

```groq
"varmuuskopio": *[_type == "varmuuskopio" && !(_id in path("drafts.**"))] | order(paiva desc)[0]{ paiva, dokumentteja },
"huolto": *[_id == $huoltoId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
"varmuuskopioAjo": *[_id == $varmuuskopioId][0]{ aika, onnistui, viimeisinOnnistunut, tulokset },
"perustiedot": {
  "sahkoposti": defined(*[_id == "yhteystiedot"][0].email),
  "osoite": defined(*[_id == "yhteystiedot"][0].address),
  "puhelin": defined(*[_id == "yhteystiedot"][0].phone),
  "hallitus": count(*[_type == "hallitusJasen" && nykyinen != false && !(_id in path("drafts.**"))]),
  "esittelykuva": defined(*[_id == "etusivu"][0].blocks[_type == "esittely"][0].image.asset)
}
```

  Parametreina ovat `$pois`, `$tyypit`, `$huoltoId` ja `$varmuuskopioId`.
- `structure.ts` `tehtavat(S)` rakennetaan `TEHTAVAT.map(...)`-kutsulla. Jokaiselle kohdalle annetaan `.id(t.id)`, ja ylätason kohdalle `.id("tehtavat")`. Linkit muotoa `/studio/structure/tehtavat;<id>` pysyvät näin vakaina. Toteuttaja varmistaa muodon napsauttamalla listaa developmentissa.

### 2.2 Työkalu `sanity/plugins/aloitus.tsx`

```ts
export const aloitus = definePlugin({ name: "klubi-aloitus", tools: [{ name: "aloitus", title: "Aloitus", icon: HomeIcon, component: Aloitus }] });
```

`sanity.config.ts`: `plugins: [aloitus(), structureTool(...), presentationTool(...), visionTool(...), fiFILocale()]`. Ensimmäinen työkalu on Studion oletusnäkymä, joten `/studio` avautuu Aloitukseen. `tools`-suodatin (Vision) säilyy ennallaan. Y7:n mahdollinen muutos tehdään samaan funktioon.

### 2.3 Komponentit `sanity/components/aloitus/`

**`Aloitus.tsx`**
- Ei propseja (`{ tool }` ohitetaan).
- Rakenne: `Card padding={[3,4,5]}` → `Container width={2}` → `Stack space={5}`:
  1. `<Heading as="h1" size={3}>Hei! Tästä pääset alkuun</Heading>` ja `<Text muted>` "Tällä sivulla näet, onko sivustolla kaikki kunnossa ja mikä odottaa sinua."
  2. `<SivustonTila rivit lataa ladataan />`
  3. `<Odottaa laskurit />`
  4. `<Puuttuvat puuttuvat />`, näkyy vain, kun lista ei ole tyhjä.
  5. `<LuoUusi />`
  6. `<TeeNain />`

**`SivustonTila.tsx`**
- Propsit: `{ rivit: TilaRivi[] | null; ladataan: boolean; lataa: () => void }`.
- Otsikko `<Heading as="h2">Sivuston tila</Heading>` ja Päivitä-painike (`Button mode="ghost" icon={RefreshIcon} text="Päivitä"`).
- Yhteenvetokortti näyttää `kokonaistila`-tuloksen:
  - ok: `tone="positive"`, "Kaikki kunnossa"
  - huomio: `tone="caution"`, "Huomioitavaa"
  - virhe: `tone="critical"`, "Vaatii toimia"
- Riveinä `Card tone border padding={3}`:
  - ikoni: CheckmarkCircleIcon, WarningOutlineIcon, ErrorOutlineIcon tai HelpCircleIcon
  - **tila on aina sekä tekstinä että ikonina**, ei pelkkänä värinä (WCAG 1.4.1)
  - `otsikko` (Text weight semibold), `teksti` ja `ohje` (Text size 1 muted)
- Rivi `julkaisemattomat` linkittää polkuun `/studio/structure/tehtavat;julkaisemattomat`.
- Lataus: `Spinner` ja `<Text aria-live="polite">Tarkistetaan sivuston tilaa…</Text>`.
- Rivien järjestys: varmuuskopio, huolto, otteluhaku, webhook, julkaisemattomat, kiintio, lomakkeet, taso.

**`Odottaa.tsx`**
- Propsit: `{ laskurit: Record<string, number> | null }`.
- Otsikko `<Heading as="h2">Odottaa sinua</Heading>`.
- `Grid columns={[1, 2, 3]}`: TEHTAVAT-kortit, joissa on luku ja otsikko. Kortti on linkki (`<a href>` + `useRouter().navigateUrl`, `aria-label="{otsikko}: {n}"`).
- Kun luku on 0, kortti on harmaa ja siinä lukee "Ei odottavia".

**`Puuttuvat.tsx`**
- Propsit: `{ puuttuvat }`.
- Otsikko "Täydennä perustiedot", ja jokainen kohta on linkki kohteeseen:
  - `/studio/structure/asetukset;yhteystiedot`
  - `…;hallitus`
  - `…;etusivu`
  - Polut tarkistetaan sen jälkeen, kun A on muuttanut ryhmän nimen.

**`LuoUusi.tsx`**
- Otsikko "Luo uusi". Painikkeet ovat `Button as={IntentLink}` ja `intent="create"`:

| Painikkeen teksti | params |
|---|---|
| Uutinen | `{ type: "uutinen" }` |
| Vuosikokouskutsu | `{ type: "uutinen", template: "uutinen-vuosikokous" }` |
| Palloveikkauksen tilanne | `{ type: "uutinen", template: "uutinen-palloveikkaus-tilanne" }` |
| Palloveikkaus: uusi kausi | `{ type: "uutinen", template: "uutinen-palloveikkaus-kausi" }` |
| Huuhkajien ottelu | `{ type: "ottelu", template: "ottelu-huuhkajat" }` |
| Ottelu | `{ type: "ottelu" }` |
| Tapahtuma | `{ type: "tapahtuma" }` |
| Sivu | `{ type: "sivu" }` |

- Lisäksi linkki "Klubilaisen arvosana → valitse ensin ravintola" kohteeseen `/studio/structure/ravintolat;arvosanatRavintoloittain`.

**`TeeNain.tsx`** ja `ohjeet.ts`
- Otsikko "Tee näin". `ohjeet.ts` on `export const OHJEET: { otsikko: string; askeleet: string[]; opas: string /* docs/09-otsikko */ }[]`.
- Jokainen ohje on `<details><summary>`-elementti, koska se toimii näppäimistöllä ja ruudunlukijalla, tai @sanity/ui:n vastine.
- Sisältö (UI-tekstiä, CLAUDE.md sallii):
  1. **Kirjoita uutinen:** Luo uusi → Uutinen. Kirjoita otsikko ja paina Osoite sivustolla -kohdan Luo. Kirjoita Lyhenne (näkyy uutislistassa) ja Sisältö. Rastita kategoriat ja paina Julkaise.
  2. **Ajasta uutinen:** Valitse Julkaisuaika tulevaisuuteen ja paina Julkaise heti. Uutinen tulee näkyviin itsestään.
  3. **Hyväksy ravintola-arvostelu:** Odottaa sinua → Arvostelut. Avaa arvostelu ja tarkista teksti ja kuvat. Paina Julkaise, tai uudelle ravintolalle Hyväksy ja luo ravintola. Asiaton: ⋯ → Hylkää arvostelu.
  4. **Lisää ottelu:** Luo uusi → Huuhkajien ottelu tai Ottelu. Seurojen ottelut tulevat itsestään.
  5. **Korjaa virhe:** Alle 3 päivää sitten: oikean yläkulman kellokuvake → valitse versio → Palauta. Vanhempi virhe: ⋯ → Palauta varmuuskopiosta.
  6. **Muutos ei näy sivulla:** Tarkista Odottaa sinua → Julkaisemattomat muutokset. Sivu päivittyy viimeistään minuutissa.
  7. **Sivuston tila on punainen:** Lue rivin ohje. Sisältösi on tallessa. Kerro tukihenkilölle rivin otsikko ja teksti.
- Lopussa linkki "Koko opas" osoitteeseen `https://github.com/veikkope/klubi/blob/main/docs/09-editor-guide.md` (`target="_blank"`, `rel="noopener"`) ja linkki "Avaa sivusto" (`/`).

**Saavutettavuus:**
- Otsikkohierarkia on h1 → h2.
- Kaikki toiminnot ovat linkkejä tai painikkeita, joilla on näkyvä teksti.
- Fokus näkyy (@sanity/ui:n oletus).
- Kontrastit tulevat @sanity/ui:n sävyistä.
- Asettelu toimii puhelimen leveydellä (Grid [1, 2, 3]).

### 2.4 "Tehtävät sinulle" ja Aloitus

Tehtävät sinulle säilyy sisältöpuun ylimpänä, koska se on itse lista. Aloitus näyttää laskurit ja vie listoihin. Uusi kohta "Uutiskategoriat ilman selitystä" (Y40) tulee samasta rekisteristä.

---

## 3. Y36 Taulukon sijainti Studiossa

### 3.1 `lib/tilasto-kategoriat.ts` (puhdas, uusi)

```ts
export type TilastoRyhma = "klubi" | "huuhkajat" | "karsinnat" | "arvokisat" | "muut";
export const TILASTO_KATEGORIAT: readonly { value: string; title: string; ryhma: TilastoRyhma; vaatiiViittaajan?: true }[] = [ /* nykyiset 23 jalkapalloTilasto.ts:52-75 samassa järjestyksessä */ ];
// klubi: { value: "klubi", title: "Klubin omat tilastot (veikkaus, mölkky, jouluruokailu)", ryhma: "klubi", vaatiiViittaajan: true }
// pelaaja: vaatiiViittaajan: true; huuhkajat → "huuhkajat"; karsinta → "karsinnat"; arvokisa → "arvokisat"; muut → "muut"
export const TILASTORYHMAT: { id: TilastoRyhma; otsikko: string }[] = [
  { id: "klubi", otsikko: "Klubin omat tilastot" }, { id: "huuhkajat", otsikko: "Huuhkajat" },
  { id: "karsinnat", otsikko: "Karsinnat" }, { id: "arvokisat", otsikko: "Arvokisat" }, { id: "muut", otsikko: "Muut arkiston taulukot" } ];
export function kategorianNimi(value?: string | null): string   // "Valmentajien palkat"; tuntematon → value ?? "Kategoria puuttuu"
```

- `jalkapalloTilasto.ts`:
  - `options.list` muodostetaan listasta `TILASTO_KATEGORIAT.map(({ title, value }) => ({ title, value }))`.
  - Kuvaukseksi tulee: "Ratkaisee, millä sivulla taulukko näkyy. Tarkka sivu näkyy lomakkeen yläreunassa (Näkyy sivulla). Klubin omat tilastot ja pelaajatilastot näkyvät vasta, kun ne on lisätty sivun, klubin toiminnan tai pelaajan Taulukot-kenttään."
- Esikatselu:
  - select: `{ title, category, huuhkajatOsio, needsReview }`
  - subtitle: `[kategorianNimi(category), osionNimi(huuhkajatOsio)].filter(Boolean).join(" · ")`
  - `osionNimi` tulee `HUUHKAJAT_OSIOT`-listasta.

### 3.2 `lib/sijainnit.ts` (puhdas, uusi): Näkyy sivulla -linkit kaikille tyypeille

```ts
export type SijaintiDoc = RoutableDoc & { nimi?: string | null; nykyinen?: boolean | null; aika?: string | null;
  uutinen?: { nimi?: string | null; slug?: string | null } | null; ravintola?: { nimi?: string | null; slug?: string | null } | null };
export function dokumentinSijainnit(doc: SijaintiDoc): { locations: { title: string; href: string }[]; message?: string; tone?: "caution" }
```

| Tyyppi | Sijainti |
|---|---|
| Kaikki nykyiset TYYPIT ja jalkapalloTilasto | `documentHref(doc)` (myös `parent`). Otsikkona `doc.nimi`. |
| jalkapalloTilasto, `documentHref` palauttaa null | `{ locations: [], message: "Taulukko ei näy vielä millään sivulla. Lisää se sivun, klubin toiminnan tai pelaajan Taulukot-kenttään ja julkaise.", tone: "caution" }` |
| ottelu | `[{ title: "Ottelut", href: "/ottelut" }, { title: "Etusivu", href: "/" }]` |
| hallitusJasen | nykyinen ≠ false: `[{ title: "Hallitus", href: "/klubi/hallitus" }]`, muuten message "Entinen jäsen: ei näy hallitussivulla." |
| kommentti | `uutinen.slug` → `/uutiset/{slug}`, otsikkona uutisen nimi |
| klubiArvio | `/ravintolat/{ravintola.slug}` |
| uutisKategoria | `/uutiset?kategoria={slug}` |
| lehtileike | nykyinen sääntö (`documentHref`, ankkuri) |
| etusivu | `/` |

### 3.3 `sanity/presentation.ts`: funktiomuotoinen resolver

```ts
import { getPublishedId } from "sanity";
import { map } from "rxjs";
export const SIJAINTI_KYSELY = `*[_id == $id][0]{ _id, _type, "slug": slug.current, "nimi": coalesce(title, name, nimi, otsikko),
  category, huuhkajatOsio, mestaruusmaa, osio, "pelaajaSlug": pelaaja->slug.current, nykyinen, aika,
  "uutinen": uutinen->{ "nimi": title, "slug": slug.current }, "ravintola": ravintola->{ "nimi": name, "slug": slug.current },
  "parent": ${VIITTAAJA} }`;
// VIITTAAJA viedään sanity/lib/queries/sitemap.ts:stä ja käytetään molemmissa:
// *[_type in ["arvokisa","pelaaja","klubiToiminta","sivu"] && references(^._id) && !(_id in path("drafts.**"))] | order(_type asc, _id asc)[0]{ _type, "slug": slug.current }
export const SIJAINTITYYPIT = new Set([...TYYPIT, "jalkapalloTilasto", "lehtileike", "ottelu", "hallitusJasen", "kommentti", "klubiArvio", "uutisKategoria"]);
export const locations: DocumentLocationResolver = (params, { documentStore }) => {
  if (params.type === "etusivu") return { locations: [{ title: "Etusivu", href: "/" }] };
  if (!SIJAINTITYYPIT.has(params.type)) return null;
  return documentStore.listenQuery(SIJAINTI_KYSELY, { id: getPublishedId(params.id) }, { perspective: "drafts" })
    .pipe(map((doc) => (doc ? dokumentinSijainnit(doc) : null)));
};
```

- `sanity.config.ts`: `resolve: { locations }` (tyyppi `PresentationPluginOptions["resolve"]`).
- `package.json`: lisätään `"rxjs": "^7.8.2"` dependencies-osioon. Paketti on jo asennettu Sanityn mukana, mutta suora tuonti vaatii eksplisiittisen riippuvuuden.

### 3.4 Structure: tilastot ryhmittäin

`structure.ts:365`:n `lista(S, "jalkapalloTilasto", "Tilastot")` korvataan alilistalla "Tilastot":
- Jokainen `TILASTORYHMAT`-ryhmä saa `S.listItem().id("tilastot-" + id).title(otsikko).child(S.documentList().title(otsikko).schemaType("jalkapalloTilasto").filter('_type == "jalkapalloTilasto" && category in $kategoriat').params({ kategoriat }).defaultOrdering([{ field: "title", direction: "asc" }]).initialValueTemplates(kategoriat.map((k) => S.initialValueTemplateItem("jalkapalloTilasto-kategoria", { category: k }))))`.
  - Ryhmän +-valikossa näkyvät sen kategoriat, ja kategoria tulee valmiiksi.
- Lisäksi "Kaikki tilastot" (`S.documentTypeList`).
- Pohja `jalkapalloTilasto-kategoria`: ks. 4.1.

---

## 4. Y37 Valmiit pohjat, tilamerkit ja klubiarvosanat ravintoloittain

### 4.1 Pohjat `sanity/pohjat.ts` ja puhtaat arvot `lib/pohjat.ts`

**`lib/pohjat.ts`:**

```ts
export const TAYTA = /\[täytä:[^\]]*\]/gi;
export function taytettavatKohdat(arvo: unknown): string[]          // merkkijono tai Portable Text -taulukko (spans[].text) → löydetyt "[täytä: …]"
export const taytaVielaSaanto = (arvo: unknown): true | string => { const k = taytettavatKohdat(arvo); return k.length ? `Täytä vielä hakasulkeissa olevat kohdat: ${k.join(", ")}` : true; };
export function vuosikokousNumero(vuosi: number): number            // vuosi - 2007 (2026 → 19)
export function vuosikokousPohja(vuosi: number, tapahtumatId: string | null, nyt: Date)
export function palloveikkausTilannePohja(vuosi: number, kategoriaIdt: string[], nyt: Date)
export function palloveikkausKausiPohja(vuosi: number, kategoriaIdt: string[], nyt: Date)
```

Pohjien arvot:

**`vuosikokousPohja`:**
- `title`: `Lahden Suomalainen Klubi ry - vuosikokous ${vuosi}`
- `publishedAt`: `nyt.toISOString()`
- `excerpt`: `Lahden Suomalainen Klubi ry:n ${N}. vuosikokous pidetään [täytä: viikonpäivä ja päivä, esim. lauantaina 24.4.${vuosi}] klo [täytä: kellonaika] [täytä: paikka].`
- `kategoriat`: `[{ _type: "reference", _ref: tapahtumatId, _key }]`, jos id löytyi
- `tunnisteet`: `["Lahden Suomalainen Klubi ry", "vuosikokous"]`
- `body`: 4 normaalikappaletta (`_type: "block"`, `style: "normal"`, `markDefs: []`, `_key`):
  1. sama kuin excerpt
  2. "Kokouksessa käsitellään sääntöjen määräämät vuosikokousasiat."
  3. "Tervetuloa!"
  4. "Lahden Suomalainen Klubi ry\nHallitus"

**`palloveikkausTilannePohja`:**
- `title`: `Palloveikkaus tilanne ${vuosi} / [täytä: kierros]`
- `excerpt`: `Klubin Palloveikkauksen tilanne [täytä: kierroksen jälkeen]: [täytä: sijoitukset]`
- `kategoriat`: Jalkapallo ja Palloveikkaus
- `tunnisteet`: `["Lahden Suomalainen Klubi ry", "palloveikkaus", "Veikkausliiga"]`
- `body`: 1 kappale "[täytä: sijoitukset riveittäin, Shift + Enter vaihtaa rivin]"

**`palloveikkausKausiPohja`:**
- `title`: `Palloveikkaus ${vuosi}`
- `excerpt`: `Veikkaa kaikkien Veikkausliigan joukkueiden sijoitus kauden ${vuosi} lopussa. Jokaisesta väärin sijoitetusta joukkueesta tulee miinuspisteitä väärin menneen sijoituksen verran.`
- `kategoriat`: Jalkapallo ja Palloveikkaus
- `kommentointi`: `{ kaytossa: true, tyyppi: "sarjajarjestys" }`. Joukkueet täytetään itse. Nykyinen validointi vaatii vähintään 2, ja `sulkeutuu` on tyhjä.
- `body`: kappale, joka on sama kuin excerpt, ja toinen kappale "Veikkaus sulkeutuu [täytä: päivä ja kellonaika]. Aseta sama aika kohtaan Kommentit ja veikkaus → Veikkaus sulkeutuu."

**`sanity/pohjat.ts`:**

```ts
export const POHJAT_PARAMETRILLA = new Set(["klubiArvio-ravintolalle", "jalkapalloTilasto-kategoria"]);
export const pohjat = (prev: Template[]): Template[] => [
  ...prev.filter(({ schemaType }) => !singletonTypes.has(schemaType) && schemaType !== "varmuuskopio" && schemaType !== "sivustonTila"),
  { id: "uutinen-vuosikokous", title: "Vuosikokouskutsu", schemaType: "uutinen",
    value: async (_p: unknown, { getClient }: { getClient: (o: { apiVersion: string }) => SanityClient }) => {
      const id = await getClient({ apiVersion }).fetch<string | null>(`*[_type == "uutisKategoria" && slug.current == "tapahtumaraportti" && !(_id in path("drafts.**"))][0]._id`);
      return vuosikokousPohja(new Date().getFullYear(), id, new Date()); } },
  { id: "uutinen-palloveikkaus-tilanne", title: "Palloveikkauksen tilanne", schemaType: "uutinen", value: /* sama haku slug in ["jalkapallo","palloveikkaus"] */ },
  { id: "uutinen-palloveikkaus-kausi", title: "Palloveikkaus: uusi kausi", schemaType: "uutinen", value: /* … */ },
  { id: "ottelu-huuhkajat", title: "Huuhkajien ottelu", schemaType: "ottelu", value: { koti: "Suomi" } },
  { id: "klubiArvio-ravintolalle", title: "Klubilaisen arvosana tälle ravintolalle", schemaType: "klubiArvio",
    parameters: [{ name: "ravintolaId", type: "string" }],
    value: ({ ravintolaId }: { ravintolaId: string }) => ({ ravintola: { _type: "reference", _ref: ravintolaId }, paiva: kopionPaiva(new Date()) }) },
  { id: "jalkapalloTilasto-kategoria", title: "Taulukko tähän ryhmään", schemaType: "jalkapalloTilasto",
    parameters: [{ name: "category", type: "string" }], value: ({ category }: { category: string }) => ({ category }) },
];
```

- `sanity.config.ts`: `schema: { types, templates: pohjat }`.
- `newDocumentOptions` global-kontekstissa suodattaa pois myös `POHJAT_PARAMETRILLA`-pohjat, jotka vaativat parametrin.
- Kategoriaviittaukset haetaan slugilla ajonaikaisesti, eikä id:tä kovakoodata.
- **Varmistus:** tuottaako mallipohja kenttätason oletusarvot (esim. `uutinen.kommentointi.kaytossa: false`)? Testataan developmentissa. Jos ei tuota, ne lisätään pohjaan.

**Julkaisun esto:** `uutinen.ts`
- `title`: `rule.required()`-sääntöön lisätään `rule.custom(taytaVielaSaanto)`
- `excerpt`: olemassa oleva custom ja lisäksi `rule.custom(taytaVielaSaanto)`
- `body`: olemassa oleva custom ja lisäksi `rule.custom(taytaVielaSaanto)`

Kaikki ovat virhetasoisia. Productionissa sanaa "täytä" on 0 uutisessa, joten vanhojen dokumenttien julkaisu ei esty. C:n `rikasSisalto` säilyttää säännön body-kentässä.

### 4.2 Tilamerkit `lib/tilamerkit.ts` (puhdas) ja `sanity/merkit.tsx`

```ts
export function onAjastettu(publishedAt: unknown, nyt: Date): boolean
export function onTarkistettava(doc?: { needsReview?: boolean } | null): boolean
export function onJulkinenRavintola(doc?: { automaattinenArvosana?: { arvioijia?: number } | null; ratingOverall?: number | null; stars?: number | null } | null): boolean
//  = arvioijia >= VAHIMMAISARVIOIJAT || (!automaattinenArvosana && (ratingOverall != null || stars != null))  — sama kuin JULKINEN_RAVINTOLA (lib/ravintola-arvosana.ts:151)
```

`sanity/merkit.tsx`, jossa jokainen merkki on `DocumentBadgeComponent` (`{ draft, published }`). `doc = draft ?? published`:

| Merkki | Tyypit | Ehto | label | color | title |
|---|---|---|---|---|---|
| EiVieläSivustolla | kaikki sisältötyypit paitsi singletonit, varmuuskopio, sivustonTila ja ravintolaKayttajaArvostelu | `draft && !published` | "Ei vielä sivustolla" | warning | "Paina Julkaise, niin tämä tulee sivustolle." |
| Ajastettu | uutinen | `onAjastettu(doc.publishedAt)` | "Ajastettu" | primary | "Tulee sivustolle {pvm klo}" |
| Tarkistettava | TARKISTETTAVAT_TYYPIT | `onTarkistettava(doc)` | "Tarkistettava" | warning | "Lue kohta Mitä tarkistaa." |
| OdottaaToistaArvioijaa | ravintola | `published && !onJulkinenRavintola(published)` | "Odottaa toista arvioijaa" | warning | "Ravintola näkyy sivustolla, kun kaksi klubilaista on arvioinut sen." |
| OdottaaHyvaksyntaa | ravintolaKayttajaArvostelu | `draft` | "Odottaa hyväksyntää" | warning | |
| Piilotettu | kommentti | `doc.piilotettu === true` | "Piilotettu" | danger | |
| EntinenJasen | hallitusJasen | `doc.nykyinen === false` | "Entinen jäsen" | ei väriä | |

`sanity.config.ts`: `document.badges: (prev, { schemaType }) => [...prev, ...merkitTyypille(schemaType)]`. Merkit kertovat tilan tekstinä, eivät pelkällä värillä.

### 4.3 Klubiarvosanat ravintoloittain (`structure.ts:346`)

"Klubilaisten arvosanat" korvataan alilistalla `.id("arvosanat")`:
- **"Ravintoloittain"** `.id("arvosanatRavintoloittain")`:

```ts
S.documentTypeList("ravintola").title("Valitse ravintola").defaultOrdering([{ field: "name", direction: "asc" }])
  .child((ravintolaId) => S.documentList().title("Klubilaisten arvosanat").schemaType("klubiArvio")
    .filter('_type == "klubiArvio" && ravintola._ref == $id').params({ id: ravintolaId.replace(/^drafts\./, "") })
    .defaultOrdering([{ field: "paiva", direction: "desc" }])
    .initialValueTemplates([S.initialValueTemplateItem("klubiArvio-ravintolalle", { ravintolaId: ravintolaId.replace(/^drafts\./, "") })]))
```

- **"Kaikki (uusin ensin)"**: nykyinen lista.
- Ravintolat-ryhmän ylätasolle `.id("ravintolat")`.

---

## 5. Y38 Ammattikieli pois ja aito piilotus

### 5.1 Etusivun lohkon piilotus (`etusivu.ts`)

- Jokaiseen 7 lohkotyyppiin (`uutiset`, `otteluohjelma`, `tapahtumat`, `esittely`, `ravintolatSpotlight`, `jalkapalloarkisto`, `galleria`) tulee ensimmäiseksi kentäksi jaettu `piilotaLohko`:

```ts
const piilotaLohko = defineField({ name: "piilota", title: "Piilota lohko sivulta", type: "boolean", initialValue: false,
  description: "Lohko säilyy tässä listassa asetuksineen, mutta ei näy etusivulla. Ota rasti pois, niin lohko palaa." });
```

- Esikatselu: `select`-osaan lisätään `piilota: "piilota"`, ja `prepare` lisää subtitlen alkuun "Piilotettu · ".
- `blocks`-kentän kuvaukseksi tulee: "Järjestä lohkot vetämällä kahvasta (⋮⋮). Jos haluat lohkon pois sivulta väliaikaisesti, avaa se ja rastita Piilota lohko sivulta. Roskakori poistaa lohkon asetuksineen."
- `sanity/lib/queries/etusivu.ts:66`: `blocks[]{` → `blocks[piilota != true]{`.
- `ottelujenSeuratQuery` (`queries/ottelut.ts:29`) **ei** suodata piilotusta, joten /ottelut-sivun seuralista toimii, vaikka lohko on piilossa. Tästä lisätään kommentti.
- Seurat-kentän kuvaukseen lisätään: "Lista ohjaa myös Ottelut-sivua, vaikka lohko olisi piilotettu."
- Dataa ei muuteta: `undefined` tarkoittaa näkyvää.

### 5.2 Nimet ja kuvaukset (sanasto, jota myös A–D noudattavat)

Uusi `sanity/schemas/objects/sanasto.ts` sisältää vakiot:

```ts
export const OSOITE_OTSIKKO = "Osoite sivustolla";
export const HAKUKONEET_RYHMA = { name: "seo", title: "Hakukoneet ja jako" } as const;
```

Ryhmän nimi `seo` säilyy, joten dataa ei muuteta.

| Paikka | Nyt | Uusi otsikko | Uusi kuvaus |
|---|---|---|---|
| slug 10 tyypissä (rivit 3.3:n listassa) | Polku (slug) | Osoite sivustolla | Tyyppikohtainen, esim. uutinen: "Muodostuu otsikosta: paina Luo. Uutisen osoite on /uutiset/tämä-osa. (Aiemmin kentän nimi oli Polku.)" ja vastaavasti /tapahtumat/, /ravintolat/, /galleria/, /jalkapalloarkisto/arvokisat/, /jalkapalloarkisto/pelaajat/, /jalkapalloarkisto/stadionit/, /klubi/toiminta/. Taulukko: "Taulukon tunniste osoitteessa." |
| sivu.slug | Polku (slug) | Osoite sivustolla | "Vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. Alasivulle kauttaviiva: klubi/historia → /klubi/historia. Klubi-osion pääsivujen ja tietosuojaselosteen osoitteet on lukittu." |
| ryhmä `seo`, 10 tyyppiä | SEO | Hakukoneet ja jako | |
| seoFields.seoTitle | SEO-otsikko (override) | Otsikko hakutuloksissa (valinnainen) | "Näkyy Googlessa ja selaimen välilehdellä. Jos tyhjä, käytetään otsikkoa." |
| seoFields.seoDescription | SEO-kuvaus (override) | Kuvaus hakutuloksissa (valinnainen) | "Teksti Googlen hakutuloksen alla. Jos tyhjä, käytetään sivun alussa näkyvää tekstiä (Tiivistelmä, Lyhenne tai Ingressi). Enintään 160 merkkiä." |
| sivu.hero | Yläbanneri (hero-kuva) | Iso kuva sivun yläosassa | "Valinnainen. Näkyy otsikon takana koko leveydellä ja somejaoissa." |
| kaupunki.slug | Osoitetunniste | Osoite suodattimessa | "Muodostuu nimestä: paina Luo. Esim. /ravintolat?kaupunki=lahti." |
| uutisKategoria.slug | Polku | Osoite suodattimessa | "Muodostuu nimestä: paina Luo. Osoite on /uutiset?kategoria=tämä-osa." |
| uutinen.blogspot.polku | Polku blogissa | Osoite vanhassa blogissa | ennallaan |
| yhteystiedot.socials[].url | URL | Verkko-osoite | "Alkaa https://" |
| klubiToiminta.jarjestys | Järjestysnumero | Järjestys listassa | "Pienempi luku näkyy Toiminta-sivulla ja Studion listassa ylempänä." |
| klubiToiminta.vuodet[].jarjestysnumero | Järjestysnumero | Monesko kerta | "Tavallisena lukuna, esim. 37. Sivulla näkyy (37.)." |
| hallitusJasen.order | Järjestysnumero | Järjestys hallitussivulla | "1 = ensimmäisenä (yleensä puheenjohtaja)." Orderingin otsikko "Järjestys hallitussivulla". |
| jalkapalloTilasto.jarjestys | Järjestysnumero | Järjestys sivulla | ennallaan |

- Muotoilun virheilmoitukset tarkistetaan: esim. kaupunki "Muodosta osoitetunniste nimestä." → "Paina Luo, niin osoite muodostuu nimestä."
- `structure.ts`: Klubin toiminta -lista saa `defaultOrdering([{ field: "jarjestys", direction: "asc" }, { field: "title", direction: "asc" }])` (sama kuin `queries/klubi.ts:131`).
- Raahattavaa järjestystä **ei** tehdä nyt: `@sanity/orderable-document-list` 2.0.25 on v5-yhteensopiva, mutta vaatisi orderRank-migraation ja kyselymuutokset 9 + 0 dokumentille. Hyöty on pieni. Kirjataan docs/23:een "myöhemmin, jos numerot hankaloittavat".

---

## 6. Y10 Johdantokenttien ohjeet (ei yhdistämistä, ei datamuutoksia)

- `contentMeta.ts` `tiivistelmaField(group?, { title?, description? } = {})` saa valinnaiset ohitukset. Oletuskuvaus selkeytetään: "Näkyy sivun alussa isommalla tekstillä ja on se teksti, jonka hakukone todennäköisimmin lainaa. 2–3 virkettä."
- **uutinen:**
  - `tiivistelmaField("sisalto", { title: "Tiivistelmä jutun alussa (valinnainen)", description: "Näkyy jutun alussa isommalla tekstillä ja hakukoneissa. Jos tämä on täytetty, se näkyy jutun alussa Lyhenteen sijaan. Uudessa jutussa voit jättää tämän tyhjäksi: silloin alussa näkyy Lyhenne." })`
  - excerpt: title "Lyhenne (uutislista ja etusivu)", description "1–2 virkettä, jotka näkyvät uutislistassa ja etusivun kortissa. Näkyy myös jutun alussa, jos Tiivistelmä on tyhjä. Enintään 200 merkkiä. Ei pakollinen, jos uutinen on pelkkä linkki alkuperäiseen kirjoitukseen."
- **sivu:**
  - `tiivistelmaField("sisalto", { title: "Tiivistelmä sivun alussa", description: "2–3 virkettä, jotka näkyvät sivun alussa isommalla tekstillä ja hakukoneissa." })`
  - ingress: title "Ingressi (vanha kenttä)", description "Näkyy sivun alussa vain, jos Tiivistelmä on tyhjä. Kirjoita johdanto Tiivistelmään." ja `hidden: ({ value }) => !value`. Productionissa vain tietosuojalla on Ingressi, joten se näkyy siellä edelleen.
- docs/09:87-88 korjataan. Lisätään taulukko "Mikä teksti näkyy missä": jutun alku, uutislista ja etusivu sekä hakutulos.

---

## 7. Y40 Kategorian selitys

- `uutisKategoria.ts` saa nimen jälkeen uuden kentän:

```ts
defineField({ name: "kaytto", title: "Mihin kategoriaa käytetään", type: "text", rows: 2,
  description: "Yksi lause, joka auttaa valitsemaan oikean kategorian, esim. \"Klubin omat tapahtumat: vappu, mölkky, jouluruokailu, vuosikokous.\" Näkyy vain Studiossa uutisen kategorioiden kohdalla, ei sivustolla.",
  validation: (rule) => [rule.max(160).warning("Pidä selitys lyhyenä (alle 160 merkkiä)."), rule.required().warning("Kirjoita lyhyt selitys, niin oikea kategoria on helppo valita.")] })
```

  Varoitus ei estä julkaisua.
- Esikatselun subtitle: `kaytto ?? "/uutiset?kategoria=…"`.
- `KategoriatInput.tsx`:
  - `KYSELY` hakee lisäksi `kaytto`.
  - Kortissa nimen alla näkyy `<Text size={0} muted>{k.kaytto}</Text>`, jos kenttä on täytetty.
  - Checkboxiin lisätään `aria-describedby`, joka osoittaa selitystekstiin.
- Tehtävät sinulle → "Uutiskategoriat ilman selitystä" (2.1) ohjaa isän täyttämään selitykset itse. **Ei tuotantopatchia.**
- Ehdotukset annetaan isälle oppaassa (docs/09 "Uusi uutiskategoria"):
  - Ottelutapahtuma: "Otteluraportit ja ottelupäivän tunnelmat."
  - Kannattajakulttuuri: "Katsomo, tifot ja kannattajien tapahtumat."
  - Tiedote: "Klubin viralliset ilmoitukset, esim. jäsenmaksu ja hallituksen päätökset."
  - Tapahtumat: "Klubin omat tapahtumat: vappu, mölkky, jouluruokailu, vuosikokous."
  - Jalkapallo: "Jalkapallo yleisesti: Huuhkajat, Veikkausliiga ja arvokisat."
  - Ravintola: "Ravintolakäynnit; arvosanat ovat Ravintolat-osiossa."
  - Blogikirjoitus: "Pidemmät pohdinnat ja mielipiteet."
  - Palloveikkaus: "Palloveikkauksen ja voittajaveikkausten tilanteet ja tulokset."
  - Matkakuvaus: "Vierasmatkojen ja klubimatkojen kuvaukset."
  - Arvostelu: päätetään erikseen (docs/23 §0).
- Tunnisteiden käyttömääräjärjestys on jo valmis (`tunnisteet.ts:57-77`), eikä sitä muuteta.

## 8. Y42 Kuvakirjasto: ei pluginia nyt (kirjataan päätöksenä)

**Perustelut:**
- Käyttämättömiä kuvia on 3/1719.
- Tilaa on käytetty 1,06 Gt / 100 Gt.
- Oletusvalitsin listaa ja hakee ladatut kuvat.
- `sanity-plugin-media` (MIT, v6.3.2, peer sanity ^5) ei lukitse palveluun, joten CLAUDE.md:n sääntö ei estä sitä. Se kuitenkin toisi:
  - toisen, asset-tason alt-tekstin, joka on ristiriidassa `imageWithAlt`-käyttökohtaisen altin kanssa (CLAUDE.md §4)
  - `media.tag`-dokumentit kiintiöön
  - massapoiston
  - uuden päivitettävän riippuvuuden

**Tehdään:** docs/09 saa kohdan "Aiemmin ladatun kuvan käyttö": kuvakenttä → Valitse → Selaa kuvia → hakukenttä (tiedostonimi).

**Uudelleenarvio**, jos käyttämättömiä kuvia on yli 200 tai isä pyytää kuville tunnisteita. Kirjataan docs/23 Y42:een.

---

## 9. Testit (uudet `scripts/test-*.ts`, assert/strict kuten `test-osiot.ts`)

### `scripts/test-sivuston-tila.ts` (`npm run test:sivuston-tila`)

**varmuuskopio**, kun nyt = 2026-10-08T12:00Z:
- paiva 2026-10-05 → ok, teksti sisältää "3 päivää"
- 2026-09-30 → ok (8 pv)
- 2026-09-29 → virhe
- null → virhe
- ajo.onnistui false, aika 2026-10-12 ja kopio 2026-10-05 → virhe

**huolto:**
- null → tuntematon
- aika nyt−2 h, onnistui true, korjattu 0 → ok
- nyt−31 h → virhe
- onnistui false → virhe ja virheviesti tekstissä
- arvosanat-tulos tila huomio (korjattu 2) → huomio

**otteluhaku:**
- virhe "Taso: HTTP 500" → virhe
- 0 ottelua 15.6. → huomio
- 0 ottelua 15.12. → ok, teksti sisältää "Talvitauko"
- 198/12 → ok

**webhook:**
- null → huomio
- isDisabled → virhe
- uusin isFailure → huomio
- 3/25 epäonnistui → huomio
- 0 yritystä → ok "Ei julkaisuja"
- kaikki 200 → ok

**kiintiö:**
- 7679/10000 → ok "77 %"
- 8000 → huomio
- 9500 → virhe
- raja 25000 → ok

**Muut:**
- julkaisemattomat: 0 → ok, 3 → huomio
- tilaus: trialing, kokeilu päättyy 18 päivän päästä → taso huomio; lomakeRoolit ["viewer"] → lomakkeet virhe; ["editor"] → ok; null → tuntematon
- kokonaistila: [ok, huomio, tuntematon] → huomio; [ok, virhe] → virhe; [ok, tuntematon] → ok
- huoltoajonKirjaus: onnistui true → viimeisinOnnistunut === aika; false → avainta ei ole; tulosten _key = nimi
- puuttuvatPerustiedot: kaikki puuttuu → 5 kohtaa; kaikki kunnossa → []

### `scripts/test-tilamerkit.ts` (`npm run test:tilamerkit`)

- onAjastettu: tuleva → true; mennyt, puuttuva ja virheellinen merkkijono → false
- onTarkistettava: true/false/undefined
- onJulkinenRavintola, pariteetti JULKINEN_RAVINTOLA-sääntöön:
  - arvioijia 1 → false
  - arvioijia 2 → true
  - ei automaattista ja ratingOverall 3.4 → true
  - ei automaattista ja stars 4 → true
  - automaattinen arvioijia 0 ja ratingOverall 4 → false
- merkitTyypille("uutinen") sisältää Ajastettu, Tarkistettava ja EiVieläSivustolla
- merkitTyypille("sivustonTila") on tyhjä
- merkitTyypille("etusivu") ei sisällä EiVieläSivustolla

### `scripts/test-pohjat.ts` (`npm run test:pohjat`)

- vuosikokousNumero(2026) → 19 ja vuosikokousNumero(2027) → 20
- vuosikokousPohja(2027, "uutisKategoria-tapahtumaraportti", nyt):
  - otsikko "Lahden Suomalainen Klubi ry - vuosikokous 2027"
  - excerpt alkaa "Lahden Suomalainen Klubi ry:n 20. vuosikokous"
  - excerpt.length ≤ 200
  - kategoriassa yksi viittaus, jolla on _key
  - jokaisella bodyn blockilla _key, markDefs ja children[].marks
- tapahtumatId null → kategoriat []
- taytettavatKohdat:
  - merkkijono, jossa on kaksi kohtaa → 2
  - Portable Text, jossa kohta toisessa spanissa → 1
  - "[1] viite" → 0
  - "(täytä)" → 0
  - null → 0
- taytaVielaSaanto: kaikki pohjat sisältävät kohtia, paitsi palloveikkausKausiPohjan excerpt; puhdas teksti → true
- palloveikkausKausiPohja: kommentointi.tyyppi === "sarjajarjestys"

### `scripts/test-sijainnit.ts` (`npm run test:sijainnit`)

**TILASTO_KATEGORIAT:**
- arvot ovat uniikkeja, niitä on 23 ja ne vastaavat nykyistä listaa
- jokaisella on ryhmä, joka löytyy TILASTORYHMAT-listasta
- jokaisella kategorialla on sijaintisääntö: avain TILASTO_CATEGORY_PAGE- tai TILASTO_CATEGORY_DETAIL-taulukossa, arvo huuhkajat tai ulkomaiset-mestarit, tai `vaatiiViittaajan`
- kategorianNimi("valmentajien-palkat") === "Valmentajien palkat"

**dokumentinSijainnit:**
- uutinen slug x → `/uutiset/x`
- tilasto klubi, parent sivu klubi/palloveikkaus/veikkausliiga → `/klubi/palloveikkaus/veikkausliiga#<slug>`
- tilasto klubi ilman parentia → locations [] ja tone "caution"
- tilasto huuhkajat osio X → `/jalkapalloarkisto/huuhkajat/X#slug`
- ottelu → `/ottelut` ja `/`
- hallitusJasen nykyinen false → message
- kommentti → uutisen polku
- klubiArvio → ravintolan polku
- uutisKategoria → `/uutiset?kategoria=s`
- lehtileike Litmanen → ankkuri `leike-…`

### Muut testit

- `scripts/test-varmuuskopio.ts` (lisäys): `kuuluuKopioon({ _id: "sivustonTila.huolto", _type: "sivustonTila" }) === false`.
- `scripts/test-palautus.ts` (lisäys): sivustonTila ei ole palautettava.
- `scripts/test-aloitus.ts` (`npm run test:aloitus`):
  - jokaisen OHJEET-kohdan `opas`-otsikko löytyy docs/09:n otsikoista (estää ohjeen ja oppaan erkaantumisen)
  - TEHTAVAT-tunnisteet ovat uniikkeja
  - jokainen `laskuri` alkaa merkkijonolla `count(` ja jokainen `suodatin` on epätyhjä
  - "julkaisemattomat"-tehtävän `params.pois` sisältää sivustonTila
- `package.json`: viisi uutta `test:*`-skriptiä lisätään `npm test` -ketjuun. CLAUDE.md:n komentotaulukkoon lisätään viisi riviä.
- Lopuksi `npm run type-check`, `npm run lint`, `npm run build` ja `npm run typegen` (uusi tyyppi ja kentät).

---

## 10. Käyttöönotto vaiheittain (development → production)

1. **Development (`.env.local` → development):**
   - `npm run dev`. Avaa /studio, jolloin Aloitus aukeaa.
   - Varmista, että Management- ja Hooks-kutsut toimivat kirjautuneena Administratorina. Kokeile myös roolilla viewer (tilapäinen testikäyttäjä), jolloin rivit näyttävät "Näkyy vain ylläpitäjälle".
   - Varmista polut `tehtavat;<id>` ja pohjat (vuosikokous, palloveikkaus, ottelu, ravintolan arvosana ja tilaston ryhmä) sekä se, että [täytä:]-kohta estää julkaisun.
   - Tarkista merkit uutisessa, ravintolassa, kommentissa ja hallituksen jäsenessä.
   - Tarkista Näkyy sivulla -linkit 5 taulukolle (klubi/sivu, klubi/toiminta, huuhkajat, karsinta, arvokisa), ottelulle, kommentille ja klubiArviolle.
   - Tarkista etusivun lohkon piilotus esikatselussa ja se, että /ottelut säilyttää seurat.
2. **Cronit developmentissa:**
   - `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/huolto`. Developmentiin syntyy `sivustonTila.huolto` (1 dokumentti), ja Aloitus näyttää sen.
   - Sama `/api/varmuuskopio`-reitille. Syntyy `sivustonTila.varmuuskopio` ja development-varmuuskopio, joka on olemassa olevaa toimintaa.
   - Tarkista, ettei kopio sisällä sivustonTila-dokumenttia.
3. **Varmuuskopio productionista** ennen deployta: `npm run backup`. Kirjoitusta ei ole, mutta tämä on käytäntö.
4. **Deploy** (push main → Vercel). Tarkista Vercelin build.
5. **Production:**
   - Ensimmäinen yöllinen huolto (02 UTC) luo `sivustonTila.huolto`. Ajastusta ei tarvitse odottaa: tukihenkilö voi ajaa sen Vercel → Cron Jobs → /api/huolto → Run.
   - `sivustonTila.varmuuskopio` syntyy maanantaina 12.10. klo 01 UTC tai käsiajolla.
   - Tarkista Aloitus productionissa: varmuuskopio 5.10. (ok, kunnes 13.10.), webhook ok, kiintiö noin 77 %, Growth-kokeilu huomio.
   - Tarkista GROQ:lla, että production sisältää täsmälleen 2 sivustonTila-dokumenttia.
6. **26.10. illalla (Free-siirron tarkistus):**
   - Aloitus → Sanityn taso: "Free". Lomakkeiden tallennus: ok.
   - Anonyymi kysely `count(*[_type == "sivustonTila"])` julkisesta datasetistä → 0 (pistetunnus on yksityinen). Jos tulos on muu kuin 0, kirjataan docs/17:ään. Tiedot eivät ole arkaluonteisia.
7. **UptimeRobot:** tili ja kolme monitoria (docs/17 §E). Hälytysten vastaanottajat ks. avoimet päätökset.
8. **Dokumentit** samassa muutoksessa: docs/09, docs/17 §E, docs/23 (Y33, Y35, Y36, Y37, Y38, Y10, Y40 ja Y42 tehdyiksi §0:n "Toteutettu"-listaan), docs/05 (sivustonTila, etusivu.blocks[].piilota, uutisKategoria.kaytto) ja CLAUDE.md (testikomennot).

**Paluu:** jos ominaisuus perutaan, revertoidaan koodi. Kaksi sivustonTila-dokumenttia voi jäädä tai ne poistetaan yhdellä `sanity documents delete sivustonTila.huolto sivustonTila.varmuuskopio --dataset production`. Muuta dataa ei ole muutettu.

## 11. docs/09-muutokset (isän opas, versio 2.4)

- **Alkuun uusi luku "Aloitus ja sivuston tila":**
  - Studio avautuu Aloitukseen.
  - Taulukko "Rivi – mitä se tarkoittaa – mitä teet, kun se on punainen tai keltainen". Rivit: Varmuuskopio, Yöllinen huolto, Otteluohjelman haku, Muutosten päivitys sivustolle, Julkaisemattomat muutokset, Dokumenttikiintiö, Lomakkeiden tallennus ja Sanityn taso.
  - "Sisältösi ei katoa, vaikka rivi olisi punainen."
  - Kerrotaan Odottaa sinua, Täydennä perustiedot ja Luo uusi.
- **"Studion valikko"** (:51-77):
  - Tilastot ryhmittäin
  - Ravintolat → Klubilaisten arvosanat → Ravintoloittain
  - Tehtävät sinulle -listaan Uutiskategoriat ilman selitystä
- **"Uutisen kirjoittaminen"** (:81-109):
  - Kohdan 3 korjaus (Y10) ja taulukko "Mikä teksti näkyy missä"
  - Polku → Osoite sivustolla
  - Uusi alaluku "Valmiit pohjat": vuosikokouskutsu, palloveikkauksen tilanne ja uusi kausi sekä [täytä: …] -kohdat
- **Uusi kohta "Merkit dokumentin yläreunassa":** 7 merkkiä selityksineen.
- **"Uusi uutiskategoria"** (:133-): kenttä Mihin kategoriaa käytetään ja ehdotustekstit (§7).
- **"Etusivun muokkaaminen"** (:306-327):
  - kohta 4 muotoon "piilota rastilla, roskakori poistaa"
  - SEO-välilehti → Hakukoneet ja jako
- **"Ravintolan arvosana ja klubilaisten pisteet"** (:365-): Pisteiden lisääminen: Ravintolat → Klubilaisten arvosanat → Ravintoloittain → ravintola → + (ravintola ja päivä valmiina).
- **"Taulukon muokkaaminen"** ja **"Huuhkajat-taulukon lisääminen"**:
  - Näkyy sivulla -linkki ja "Taulukko ei näy vielä millään sivulla" -huomio
  - ryhmän + täyttää kategorian
  - Järjestysnumero → Järjestys sivulla
- **"Klubin toiminta: uusi vuosi"** (:357-363): Järjestysnumero → Monesko kerta.
- **"Hallituksen jäsenet"** (:347-355): Järjestysnumero → Järjestys hallitussivulla.
- **Uusi kohta "Aiemmin ladatun kuvan käyttö"** (Y42).
- **"Tyypilliset tilanteet"** (:635-644), uudet rivit:
  - "Aloituksessa punainen rivi → lue ohje, kerro tukihenkilölle"
  - "Unohdin [täytä]-kohdan → Studio ei päästä julkaisemaan ennen kuin se on korjattu"
- **Läpi oppaan:** "Polku" → "Osoite sivustolla" ja "SEO" → "Hakukoneet ja jako" (kirjoitetaan vasta A:n ja D:n muutosten kanssa yhteensopivasti; "Mitä EI saa tehdä" -luvun polkuohje on D:n vastuulla).

## 12. Tiedostolista

**Uudet:**
- `lib/sivuston-tila.ts`
- `lib/tilamerkit.ts`
- `lib/pohjat.ts`
- `lib/tilasto-kategoriat.ts`
- `lib/sijainnit.ts`
- `sanity/lib/tehtavat.ts`
- `sanity/lib/kirjaa-ajo.ts`
- `sanity/schemas/documents/sivustonTila.ts`
- `sanity/schemas/objects/sanasto.ts`
- `sanity/pohjat.ts`
- `sanity/merkit.tsx`
- `sanity/plugins/aloitus.tsx`
- `sanity/components/aloitus/` (`Aloitus.tsx`, `SivustonTila.tsx`, `Odottaa.tsx`, `Puuttuvat.tsx`, `LuoUusi.tsx`, `TeeNain.tsx`, `ohjeet.ts`, `useSivustonTila.ts`)
- `scripts/test-sivuston-tila.ts`
- `scripts/test-tilamerkit.ts`
- `scripts/test-pohjat.ts`
- `scripts/test-sijainnit.ts`
- `scripts/test-aloitus.ts`

**Muutetut:**
- `sanity.config.ts`
- `sanity/structure.ts`
- `sanity/presentation.ts`
- `sanity/schemas/index.ts`
- `sanity/schemas/objects/contentMeta.ts`
- `sanity/schemas/objects/seoFields.ts`
- `sanity/schemas/singletons/etusivu.ts`
- `sanity/schemas/singletons/yhteystiedot.ts`
- `sanity/schemas/documents/` (uutinen, sivu, jalkapalloTilasto, uutisKategoria, klubiToiminta, hallitusJasen, kaupunki, arvokisa, galleriaAlbumi, pelaaja, ravintola, stadion, tapahtuma)
- `sanity/components/kategoriat/KategoriatInput.tsx`
- `sanity/lib/queries/etusivu.ts`
- `sanity/lib/queries/sitemap.ts` (`VIITTAAJA`-vienti)
- `sanity/lib/queries/ottelut.ts` (kommentti)
- `lib/ottelut.ts`
- `lib/varmuuskopio.ts`
- `lib/palautus.ts`
- `app/api/huolto/route.ts`
- `app/api/varmuuskopio/route.ts`
- `app/api/revalidate/route.ts`
- `scripts/tarkista-sanity-taso.ts` (tuo `LOMAKETOKEN` ja `KIRJOITTAVAT_ROOLIT` lib-moduulista)
- `scripts/test-varmuuskopio.ts`
- `scripts/test-palautus.ts`
- `package.json` (rxjs ja test-skriptit)
- `sanity/sanity.types.ts` ja `sanity/extract.json` (typegen)
- `docs/09-editor-guide.md`
- `docs/17-julkaisu-domain-ja-oikeudet.md`
- `docs/23-yllapidettavyys.md`
- `docs/05-content-models.md`
- `CLAUDE.md`

## Tarvitsee muilta

- A (osiosivut, Y22/Y25): A nimeää ryhmän "Sivun asetukset" uudelleen ja tuo Klubi-ryhmän samaan tiedostoon structure.ts, jota E muuttaa (Tehtävät-id:t, Tilastot-ryhmät, Arvosanat ravintoloittain, Klubin toiminnan järjestys). Sovittava yhdistämisjärjestys ja lopulliset structure-id:t (`asetukset`, `yhteystiedot`, `hallitus`, `etusivu`). Aloituksen Puuttuvat-linkit ja docs/09 käyttävät niitä.
- A: listasivujen johdanto kirjoitetaan sivu-tyypin `tiivistelma`-kenttään, ei `ingress`-kenttään. E piilottaa ingressin, kun se on tyhjä (`hidden: ({value}) => !value`). Lukitut osiosivut saavat Näkyy sivulla -linkin automaattisesti documentHrefin kautta, eikä E:n tarvitse tehdä muuta.
- A: jos A lisää osiosivuille kentän, joka piilottaa osion valikosta tai tyhjätilatekstin, sen nimet ja ohjeet noudattavat E:n sanastoa (sanity/schemas/objects/sanasto.ts).
- B (linkki-objekti, Y17): linkkiobjektin ja leipätekstin linkkiannotaation suomenkieliset nimet sanaston mukaan: "Verkko-osoite" (ei URL), "Sivuston sivu", "Ulkoinen osoite", "Tiedosto". B omistaa portableText.ts:n linkkiannotaation otsikon "URL" muutoksen.
- B: kun B muuttaa etusivun heroCtas-, ctaHref- ja ctaLabel-kentät linkkiobjekteiksi, sen pitää säilyttää E:n lisäämä `piilota`-kenttä ja esikatselun "Piilotettu · " -etuliite kaikissa 7 lohkotyypissä (sama tiedosto etusivu.ts, yhdistettävä).
- C (lohkot, Y14/Y15): uutinen.body-kentän validointiin jää E:n sääntö `taytaVielaSaanto` (lib/pohjat.ts), myös kun tyyppi vaihtuu `rikasSisalto`-tyypiksi. `taytettavatKohdat` lukee vain block-tyyppien spanit, eikä C:n lohkoille tarvita muutosta. C:n lohkojen otsikot ja ohjeet sanaston mukaan.
- D (ohjaukset, Y18/Y20): D omistaa polkuMuuttunut-varoituksen tekstin ja docs/09:n "Älä muuta polkua" -kohdan. E muuttaa vain slug-kenttien otsikot (OSOITE_OTSIKKO = "Osoite sivustolla") ja tyyppikohtaiset kuvaukset. Sovitaan, kumpi kirjoittaa kuvauksen loppuosan "vanha osoite ohjataan automaattisesti".
- D: uusi `ohjaus`-dokumenttityyppi lisätään E:n rekistereihin. Siihen kuuluvat lib/sijainnit.ts (Näkyy sivulla: lähdepolku) ja tarvittaessa TEHTAVAT (esim. ohjaukset, joiden kohde on poistettu) sekä merkit (sanity/merkit.tsx). Jos D lisää cronin tai webhook-kirjoituksia, ajon tulos kirjataan E:n apurilla `kirjaaAjo()`.
- Kaikki: jokainen uusi dokumenttityyppi lisätään E:n listoihin. Merkkien `merkitTyypille`-poissulut, TEHTAVAT-listan `pois`-parametri (jos tyyppi on järjestelmädokumentti) ja `TARKISTETTAVAT_TYYPIT` (jos tyypillä on needsReview) ovat nyt sanity/lib/tehtavat.ts:ssä.
- Y7 (rooli, ei tämän kokonaisuuden kohta): sanity.config.ts:n `tools`-funktio on yhteinen. E lisää Aloitus-pluginin ensimmäiseksi, ja Y7:n Vision-piilotus käyttäjätunnisteen mukaan tehdään samaan funktioon.

## Tarjoaa muille

- Dokumenttityyppi `sivustonTila` (järjestelmäloki, readOnly, ei structuressa). Tunnukset `TILA_ID = { huolto: "sivustonTila.huolto", varmuuskopio: "sivustonTila.varmuuskopio" }`. Kentät tehtava, aika, onnistui, viimeisinOnnistunut ja tulokset[] {nimi, tila: "ok"|"huomio"|"virhe", viesti, maara}.
- `sanity/lib/kirjaa-ajo.ts`: `kirjaaAjo(client, id, tehtava, kirjaus): Promise<void>`. Jokainen ajastettu tehtävä kirjaa tuloksensa tällä.
- `lib/sivuston-tila.ts`: tyypit `Tila`, `TilaRivi`, `AjonTulos` ja `AjoDokumentti` sekä säännöt `varmuuskopionTila`, `huollonTila`, `otteluhaunTila`, `webhookinTila`, `kiintionTila`, `julkaisemattomienTila`, `tilauksenTila`, `kokonaistila`, `huoltoajonKirjaus` ja `puuttuvatPerustiedot`. Vakiot `LOMAKETOKEN`, `KIRJOITTAVAT_ROOLIT` ja `OLETUSKIINTIO`.
- `sanity/lib/tehtavat.ts`: `TEHTAVAT: Tehtava[]` ({id, otsikko, laskuri, suodatin, params?, tyyppi?, jarjestys?}), `TARKISTETTAVAT_TYYPIT` ja `ALOITUS_KYSELY`. Uusi tehtävä lisätään rekisteriin, jolloin se näkyy sekä Tehtävät sinulle -listassa että Aloituksen laskurina.
- Aloitus-työkalu (`sanity/plugins/aloitus.tsx`, työkalun nimi `aloitus`). Komponentit SivustonTila, Odottaa, Puuttuvat, LuoUusi ja TeeNain. Hook `useSivustonTila()`. `OHJEET`-lista (sanity/components/aloitus/ohjeet.ts), johon muut voivat lisätä "Tee näin" -kohdan.
- `lib/sijainnit.ts`: `dokumentinSijainnit(doc: SijaintiDoc): DocumentLocationsState`. `sanity/presentation.ts`: `SIJAINTI_KYSELY`, `SIJAINTITYYPIT` ja funktiomuotoinen `locations`-resolveri. Uuden tyypin Näkyy sivulla -linkki lisätään näihin. `VIITTAAJA`-alikysely viedään tiedostosta sanity/lib/queries/sitemap.ts.
- `lib/tilasto-kategoriat.ts`: `TILASTO_KATEGORIAT` ({value, title, ryhma, vaatiiViittaajan?}), `TILASTORYHMAT` ja `kategorianNimi()`. Jalkapallotilaston kategorialistan ainoa lähde.
- `lib/tilamerkit.ts`: `onAjastettu`, `onTarkistettava` ja `onJulkinenRavintola` (JS-vastine JULKINEN_RAVINTOLA-säännölle). `sanity/merkit.tsx`: `merkitTyypille(schemaType)` ja 7 DocumentBadgeComponentia.
- `lib/pohjat.ts`: `TAYTA`, `taytettavatKohdat()`, `taytaVielaSaanto` (validointisääntö "[täytä: …]"-kohdille) ja pohjien puhtaat arvofunktiot. `sanity/pohjat.ts`: `pohjat(prev)` ja `POHJAT_PARAMETRILLA`. Pohjien id:t ovat uutinen-vuosikokous, uutinen-palloveikkaus-tilanne, uutinen-palloveikkaus-kausi, ottelu-huuhkajat, klubiArvio-ravintolalle {ravintolaId} ja jalkapalloTilasto-kategoria {category}.
- Sanasto `sanity/schemas/objects/sanasto.ts`: `OSOITE_OTSIKKO = "Osoite sivustolla"` ja `HAKUKONEET_RYHMA = { name: "seo", title: "Hakukoneet ja jako" }`. Taulukko termeistä: Verkko-osoite, Otsikko hakutuloksissa, Kuvaus hakutuloksissa, Iso kuva sivun yläosassa, Osoite suodattimessa, Järjestys listassa, Järjestys sivulla, Monesko kerta.
- Etusivun lohkon kenttä `piilota: boolean` (undefined tarkoittaa näkyvää). Kysely `blocks[piilota != true]`. Säilytettävä B:n ja C:n muutoksissa.
- Uutiskategorian kenttä `kaytto` (text, max 160, vain Studiossa) ja sen näyttö KategoriatInputissa.
- `tiivistelmaField(group?, { title?, description? })` hyväksyy tyyppikohtaiset otsikko- ja kuvausohitukset.
- `lib/ottelut.ts`: `tarkistaOtteluhaku(nyt?): Promise<{ lahde, maara, tulevia, virhe }>` ilman välimuistia.

## Tuotantomuutokset

- Ei yhtään skriptipatchia eikä --missing-tuontia productioniin. Kaikki uudet kentät (piilota, kaytto) ovat valinnaisia, ja niiden puuttuminen tarkoittaa nykyistä käytöstä.
- Automaattinen luonti deployn jälkeen: yöllinen huolto luo dokumentin `sivustonTila.huolto` (1 dokumentti, sen jälkeen patch joka yö) ja viikkovarmuuskopio dokumentin `sivustonTila.varmuuskopio` (1 dokumentti, patch maanantaisin). Productioniin tulee yhteensä +2 dokumenttia. Ne voi luoda heti ajamalla cronit käsin Vercelissä (Cron Jobs → Run).
- Ennen deployta otetaan varmuuskopio (`npm run backup`) käytännön mukaan, vaikka dataa ei patchata.
- Webhook-reitti ohittaa jatkossa sivustonTila- ja varmuuskopio-dokumentit. Sanityn webhook-asetuksiin ei tehdä muutosta.
- Kategorioiden selitykset (10 dokumenttia) kirjoittaa isä itse Studiossa Tehtävät sinulle -listan kautta. Kehittäjä ei patchaa niitä.
- UptimeRobot-tili ja 3 monitoria ovat ulkoinen palvelu, eivät Sanity-kirjoituksia.
- Peruttaessa: `sanity documents delete sivustonTila.huolto sivustonTila.varmuuskopio --dataset production` (2 dokumenttia). Muuta dataa ei ole muutettu.

## Riskit

- Management- ja Hooks API -kutsut (api.sanity.io) Studion istunnolla voivat estyä CORSin, kirjautumistavan tai oikeuksien takia. Lieventäminen: jokainen kutsu on erikseen try-lohkossa, 401/403 näyttää "Näkyy vain ylläpitäjälle" (tila tuntematon ei nosta kokonaistilaa), ja toimivuus varmistetaan developmentissa Administratorina ennen deployta. Datasetin kyselyt (varmuuskopio, huolto, laskurit) toimivat joka tapauksessa.
- Pistetunnuksen yksityisyys (`sivustonTila.*` ei näy anonyymisti julkisesta datasetistä) on Sanityn dokumentoitu käytös, mutta sitä ei voi testata ennen 26.10., koska datasetit ovat nyt yksityisiä. Jos dokumentti näkyy, sisältö on silti ei-arkaluonteinen (ajan leimat ja virhetekstit kuten "Export API: HTTP 401").
- Tilan kirjaus voi epäonnistua hiljaa (esim. kirjoitustoken menettää oikeuden 26.10.). Silloin Aloitus näyttää huollon yli 30 tuntia vanhana ja punaisena, ja Lomakkeiden tallennus -rivi kertoo syyn. Vika näkyy kuitenkin vasta, kun isä avaa Studion. Kaatuminen hälyttää vain UptimeRobotin kautta, eikä sähköpostia lähetetä (päätös §0).
- Otteluhaun tarkistus lisää huoltoon ulkoisen kutsun. 15 sekunnin aikakatkaisu pitää huollon 60 sekunnin rajassa. Talvella tyhjä syöte on normaali, ja sääntö huomioi sen (marras–helmikuu ok), mutta poikkeava kausirytmi voi antaa turhan keltaisen.
- Merkkien rajapinta `document.badges` on Sanityssa @beta ja voi muuttua v6:ssa. Lieventäminen: merkit on eristetty tiedostoon sanity/merkit.tsx ja säännöt testattu lib-moduulissa. Merkki näkyy vain dokumenttipaneelissa, ei listoissa (listojen ⚠- ja Ajastettu-esikatselut säilyvät).
- Mallipohjan arvo voi ohittaa kenttätason initialValue-arvot (esim. kommentointi.kaytossa). Tämä varmistetaan developmentissa, ja tarvittavat kentät lisätään pohjaan.
- Presentationin funktiomuotoinen resolveri avaa yhden listenQuery-kuuntelun jokaista avointa dokumenttia kohti. Nykyinen select-resolveri tekee käytännössä saman, eikä Free-tason listener-kiintiö ole ollut ongelma. rxjs on lisättävä suoraksi riippuvuudeksi.
- Kenttien uudelleennimeäminen (Polku → Osoite sivustolla, SEO → Hakukoneet ja jako) vanhentaa isän muistikuvat ja oppaan. Lieventäminen: kuvaukseen lisätään väliaikaisesti "(Aiemmin kentän nimi oli Polku.)", ja opas päivitetään samassa muutoksessa.
- Yhdistämiskonfliktit tiedostoissa structure.ts, etusivu.ts, sanity.config.ts ja docs/09 kokonaisuuksien A, B ja D kanssa. Lieventäminen: yhdistämisjärjestys sovitaan (A:n structure-muutokset ensin, E sen päälle), ja sanasto ja rekisterit tehdään ensimmäisessä PR:ssä.
- Pohjien [täytä:]-sääntö on virhetasoinen. Productionissa sanaa "täytä" on 0 uutisessa, mutta jos isä kirjoittaa tavalliseen tekstiin "[täytä: …]", julkaisu estyy. Ilmoitus kertoo tarkan kohdan, joten korjaus on selvä.
- Kiintiölaskenta on arvio (assetit ja järjestelmädokumentit pois), koska Sanity ei julkaise tarkkaa laskentasääntöä eikä käyttörajapinta ole saatavilla (testattu: 404). Teksti sanoo "noin".

## Avoimet päätökset

- Kuka saa UptimeRobotin hälytykset sähköpostiin (isä, tukihenkilö vai molemmat), ja kenen sähköpostilla tili luodaan (klubin yhteinen osoite)?
- Hyväksytäänkö Y42-linjaus, ettei sanity-plugin-mediaa asenneta nyt (3/1719 käyttämätöntä kuvaa, ristiriita kuvakohtaisen alt-tekstin kanssa)? Uudelleenarvio, kun käyttämättömiä kuvia on yli 200 tai isä pyytää kuville tunnisteita.
- Kirjoittaako isä kategorioiden selitykset itse (suunnitelman oletus, ehdotustekstit oppaassa), vai täytetäänkö ehdotukset valmiiksi patchilla isän hyväksynnän jälkeen? Samalla päätetään, mitä tehdään Arvostelu-kategorialle sekä tyhjille Kannattajakulttuuri- ja Tiedote-kategorioille (docs/23 §0, yhä auki).
