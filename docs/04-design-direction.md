# 04 — Design-suunta

> **Lähde:** verkkosivujen tyyliopas (design handoff, syyskuu 2026) kansiossa `docs/design-handoff/`. **Sivujen lähde on `Sivut v3.dc.html`** (etusivu ja ravintola-arvio, tietokone + mobiili). `Tyyliopas.dc.html` määrittää tokenit; sen esimerkkisivu on vanhentunut. Avaa tiedostot selaimessa. Tyyliopas on **lopullinen**: värit, fontit, koot ja välit noudatetaan sellaisenaan. Tämä dokumentti kertoo, miten tyyliopas on toteutettu koodissa. Ristiriitatilanteessa tyyliopas voittaa.

## Brändin ydin

Värit ja tyyli tulevat logosta: kirkas sininen aaltomerkki ja klassinen antiikvateksti. Ilme on asiallinen ja rauhallinen, ja siinä on paljon tyhjää tilaa.

**Sisältö:** pääaihe on suomalainen jalkapallokulttuuri (otteluraportit, otteluohjelma, kannattajakulttuuri, klubin matkat), toinen aihe ravintola-arviot (etenkin pelipäivien ruokapaikat). Uutta sisältöä tulee noin kerran kuussa, joten etusivu esittelee ensin klubin. **Ei liittymis- eikä uutiskirjekehotteita.**

### Periaatteet (tyylioppaasta)
1. **Sininen on toimintaa.** Klubinsinistä käytetään vain klikattaviin asioihin (painikkeet, linkit, aktiivinen valikko) ja logoon.
2. **Serif otsikoihin.** Antiikva otsikoissa jatkaa logon tyyliä. Leipäteksti on aina groteskia.
3. **Logolle tilaa.** Logon ympärille jätetään vähintään merkin puolikkaan levyinen tyhjä tila. Tummalla pohjalla käytetään valkoista versiota.
4. **Kategoriavärit.** Sininen = jalkapallo, messinki = ruoka ja ravintolat (sekä juhlatapahtumat). Väri näkyy yläotsakkeissa, korttien yläreunoissa ja tageissa.

Pintojen suhde: 60 % vaalea pohja, 20 % yönsininen, 12 % klubinsininen, loput korosteina.

## Värit

Lähde: `app/globals.css` (CSS-muuttujat ja Tailwind v4 `@theme inline`). Komponentit käyttävät vain tokeneita. Ainoa poikkeus on OG-kuva (`app/api/og/route.tsx`), jossa arvot on toistettu, koska `ImageResponse` ei lue CSS:ää.

| Token (Tailwind) | HEX | Käyttö | Kontrasti |
|---|---|---|---|
| `blue` = `accent`, `primary` | #1A2CD8 | Klubinsininen: painikkeet, linkit, yläotsakkeet, logo | 8,1:1 paperilla |
| `navy` = `heading`, `chrome` | #141F4D | Yönsininen: otsikot, hero, footer, tummat paneelit, pääpainikkeen hover | 14,6:1 paperilla |
| `blue-tint` = `accent-soft` | #E6E9FB | Tagit, korostuspohjat, kentän fokuskehys, toissijaisen painikkeen hover | — |
| `background` | #F7F6F2 | Paperi: sivun tausta | — |
| `surface` | #FFFFFF | Kortit, header, valkoiset osiot | — |
| `surface-strong` | #EFEEE8 | Neutraali hover-pinta (johdettu, ei tyylioppaassa) | — |
| `foreground` | #1B1D26 | Muste: leipäteksti | 15,5:1 |
| `muted` | #4A4D5C | Toissijainen teksti | 7,7:1 |
| `muted-soft` | #6B6E7C | Kuvatekstit, meta, pienet osiolabelit | 4,7:1 |
| `border` | #ECEBE5 | Erottimet, korttien reunat | — |
| `border-strong` | #C9C8C0 | Korostettu erotin (kortin hover, pudotusalue) | — |
| `border-input` | #7C7F8C | Lomakekenttien reunat (WCAG 1.4.11: 3,98:1 valkoisella, 3,68:1 paperilla) | — |
| `brass` / `brass-text` | #B8862E / #8A6420 | Messinki = ruoan kategoriaväri: arvosanapisteet, arviokorttien yläreuna, ruoka-aiheiset yläotsakkeet, juhlatapahtuman kortti | teksti 5,4:1 |
| `brass-tint` / `brass-tint-text` | #F3EAD8 / #5C4315 | Ruokatagi (esim. keittiötyyppi arviosivulla) | 7,7:1 |
| `on-chrome-muted` | #D4D8F0 | Leipäteksti yönsinisellä | 11,2:1 |
| `on-chrome-eyebrow` | #AEB6F2 | Yläotsake yönsinisellä | 8,1:1 |

**Tumma teema:** tyylioppaassa ei ole tummaa teemaa, joten sitä ei toteuteta. Sivusto näyttää samalta käyttöjärjestelmän asetuksesta riippumatta. Jos tumma teema halutaan myöhemmin, se johdetaan yönsinisestä ja lisätään tyylioppaaseen ensin.

## Typografia

Fontit ladataan `next/font/google`-toiminnolla (`app/layout.tsx`). Next hakee ne buildissa ja tarjoilee omalta palvelimelta.

| Fontti | Käyttö | Tailwind |
|---|---|---|
| **Source Serif 4** 600 | Otsikot h1–h3, isot numerot | `font-display` (h1–h3 automaattisesti, väri `heading`) |
| **Public Sans** 400/500/600 | Leipäteksti, valikot, painikkeet, lomakkeet | `font-sans` (oletus) |

IBM Plex Mono on tyylioppaassa valinnainen, eikä sitä ole otettu käyttöön.

| Tyyli | Määrittely | Toteutus |
|---|---|---|
| Hero H1 | Source Serif 4 600, 66/1.04 (mobiili 38/1.08) | `Hero` |
| Arvion H1 | 60/1.05 (mobiili 32/1.12) | `ravintolat/[slug]` |
| H1 | 48/1.1, navy | `PageHeader`: `text-4xl sm:text-5xl leading-[1.1]` |
| Osion H2 | 40 (mobiili 28) | `BlockHeading`, esittely |
| H3 | 22/1.3 | `CardTitle`: `text-[1.375rem] leading-[1.3]` |
| Leipä | Public Sans 400, 18/1.6 | `body` (globals.css), PortableText `text-lg` |
| Pieni | 14/1.5, muted | `text-sm text-muted` |
| Yläotsake | Public Sans 600, 14 px (mobiili 12), uppercase, .12em, sininen tai messinki aiheen mukaan (`Eyebrow`, `topic="food"`) | `text-[13px] font-semibold uppercase tracking-[0.12em] text-accent` (yönsinisellä `text-on-chrome-eyebrow`) |

Pienet h2/h3-osiolabelit (esim. "Yhteystiedot", "Plussat") käyttävät yläotsakkeen tyyliä `font-sans`-luokalla ja `muted-soft`-värillä, jotta ne eivät peri serif-otsikkotyyliä. Sinistä ei käytetä, koska ne eivät ole klikattavia.

**Rivitys ja tavutus** (`globals.css`, base-kerros):
- Otsikot (`h1`–`h4`, `.font-display`): `hyphens: auto` ja `hyphenate-limit-chars: 10 4 4`. Suomen pitkät yhdyssanat tavutetaan isoissa otsikoissa, mutta vain vähintään 10 merkin sanat ja niin, että kummallekin riville jää vähintään 4 merkkiä. Firefox ja Safari tavuttavat suomea. Chrome ei tavuta sitä (testattu Windowsilla 9/2026), joten siinä sana katkeaa ilman tavuviivaa.
- Kappaleet, listat, `dd`, lainaukset ja kuvatekstit: `text-wrap: pretty`, joten viimeiselle riville ei jää yksittäistä sanaa. Leipätekstiä ei tavuteta.
- `body`: `overflow-wrap: break-word` varaverkkona. Pitkä URL tai tavuttamaton sana katkeaa eikä levennä sivua ruutua leveämmäksi.

## Taitto, välit, pyöristys, varjo

- **Taitto** (Sivut v3): leveys 1440 px, sisällön sivumarginaali 80 px tietokoneella ja 20 px mobiilissa (`Container size="wide"`).
- **Osiot:** pystypehmuste 96 px tietokoneella ja 44 px mobiilissa (`py-11 sm:py-24`). Osiot vuorottelevat paperin ja valkoisen välillä. Hero ja footer ovat yönsinisiä.
- **Footerin väli:** `main`-elementillä on alapehmuste. Sivu, jonka viimeinen osio on täysleveä, poistaa pehmusteen elementillä `<span data-flush-footer hidden />`.
- **Välit** 8 px:n askelin: 8 / 16 / 24 / 40 / 72.
- **Pyöristys:**
  - 4 px painikkeissa, kentissä ja korteissa (`rounded-sm`, samoin `rounded-lg` ja `rounded-xl`)
  - 6 px isoissa paneeleissa (`rounded-2xl`)
  - 3 px tageissa (`rounded-xs`)

  Tailwindin pyöristysasteikko on uudelleenmääritelty tiedostossa `globals.css`, joten vanhat luokat noudattavat tyyliopasta. `rounded-full` on vain ympyröille (avatarit, pisteet, ikoninapit, numerot).
- **Varjo** vain isoille paneeleille: `shadow-panel`. Korttien hoverissa käytetään samaa.
- **Sticky header ja ankkurit:** `html`-elementillä on `scroll-padding-top` = headerin korkeus (`--header-korkeus`: 73 px mobiilissa, 95 px sm+) + 24 px. Ankkurilinkit, `scrollIntoView` ja fokuksen siirrot pysähtyvät siksi headerin alle, eikä elementeille tarvita omia `scroll-mt-*`-luokkia. Jos headerin pehmustetta tai logon kokoa muutetaan, päivitä muuttuja.
- **Vain vaalea teema:** `:root { color-scheme: light }` ja viewportin `colorScheme: "light"` estävät selainta tummentamasta lomakekenttiä tumman käyttöjärjestelmän mukaan. Mobiiliselaimen yläpalkin väri (`themeColor`) on valkoinen kuten header. Studio (`/studio`) ohittaa `colorScheme`-asetuksen, koska siinä on oma tumma tila.

## Logo

Tiedostot ovat kansiossa `public/brand/`. Ne ovat läpinäkyviä PNG-kuvia, jotka on rajattu alkuperäisestä logosta. Ne ovat brändin tiedostoja eivätkä Sanityn sisältöä.

| Tiedosto | Käyttö |
|---|---|
| `mark-blue.png` + `wordmark-blue.png` | Header: merkki 44 px + teksti 22 px, väli 12 px (mobiilissa 36 + 18) |
| `mark-white.png` + `wordmark-white.png` | Footer: merkki 36 px + teksti 18 px; OG-kuva |
| `*-navy`, `*-black` | Varalla (tulosteet, kumppanisivut) |

`next/image`-kuville annetaan leveys ja korkeus niiden näyttökoossa, jotta srcset tuottaa 1x- ja 2x-versiot oikean kokoisina. Merkki kannattaa myöhemmin vektoroida SVG:ksi.

**Favicon:** sininen merkki valkoisella pyöristetyllä neliöllä, merkin korkeus noin 75 % neliön korkeudesta.
- `app/favicon.ico` (16 ja 32 px)
- `app/icon.png` (512 px)
- `app/apple-icon.png` (180 px)

Kuvat on generoitu tiedostosta `mark-blue.png` sharp-kirjastolla.

## Komponentit

| Komponentti | Tyyliopas (Sivut v3) | Sijainti |
|---|---|---|
| `Header` | Valkoinen, alaviiva, logo: merkki 50 px + teksti 25 px (mobiili 38 + 17). Valikko 16 px / 500, väli 40 px, aktiivinen sininen + 2 px alleviivaus. **Ei CTA-painiketta.** | `components/layout/header.tsx`, `header-client.tsx` |
| `Hero` | Yönsininen, yläotsake, H1 66 px, ingressi 20 px, kaksi alleviivattua tekstilinkkiä vasemmalla. Kuva koko osion taustana omissa väreissään. Luettavuus: musta liukuväri tekstin takana (75 % → 55 % → 0 % oikealla; mobiilissa tasainen 55 %) ja tekstivarjo. Ilman kuvaa pohja on yönsininen. | `components/blocks/hero.tsx` |
| `BlockHeading`, `Eyebrow`, `ArrowLink` | Osion otsikkorivi: yläotsake + H2 + "Kaikki … →" -linkki (mobiilissa listan alla) | `components/blocks/block-heading.tsx` |
| `OtteluohjelmaBlock` + `FixtureList` | Ottelulista 110 px / 1fr / 170 px, merkit "Klubi paikalla" (sininen) ja "Vierasmatka" (sininen reuna); tapahtumat rinnalla | `components/blocks/otteluohjelma-block.tsx`, `components/fixture-list.tsx` |
| `EventCard` | 60 px päivämääräsarake (päivä serif 34 px + kuukausi), otsikko 21 px, yhden rivin kuvaus. 3 px yläreuna: sininen, juhlatapahtumalla messinki. | `components/event-card.tsx` |
| `UutisetBlock` | Uusin juttu isona (16:10 kuva, serif 40 px), 3 listana (serif 25 px) | `components/blocks/uutiset-block.tsx` |
| `RestaurantCard` | 4:3 kuva, 3 px messinkireuna, pisteet + kaupunki · hintataso, nimi 24 px, tuomio, tagi. Mobiilissa vaakakortti 80 px pikkukuvalla. | `components/restaurant-card.tsx` |
| `RatingDots` | 5 ympyrää 9–12 px: täysi messinki, tyhjä 1,5 px messinkireuna | `components/ui/rating-dots.tsx` |
| Arviosivu | Messinkiyläotsake, H1 60 px, 21:9 kuva, teksti 19/1.75 (ensimmäinen kappale ingressinä serif 20/24 px samalla säännöllä kuin uutisissa, lainaus serif kursiivi 28 px messinkiviivalla), "Ottelupäivänä"-laatikko, sticky arvosanakortti (4 px messinki, varjo), "Lisää arvioita" | `app/(public)/ravintolat/[slug]/page.tsx` |
| `EsittelyBlock` | "Klubista": kuva vasemmalla 4:3, yläotsake, H2 40 px, teksti, tekstilinkki | `components/blocks/esittely-block.tsx` |
| `Button` | `primary` sininen → hover yönsininen, `outline` yönsininen reuna, `onDarkPrimary`, `onDark`. 48 px (`lg`), 600, 4 px. | `components/ui/button.tsx` |
| `Badge` (tag) | Vaalea sininen + navy, 13 px / 600, 3 px | `components/ui/badge.tsx` |
| `Footer` | Yönsininen, pystylogo (merkki 56 + teksti 24), sarakkeet Jalkapallo / Klubi / Yhteystiedot, alarivi | `components/layout/footer.tsx` |
| Uutissivu | Metarivillä päiväys · kirjoittaja · lukuaika (vähintään 150 sanaa, 180 sanaa/min) · Jaa. Jos erillistä ingressiä ei näytetä, 60–320 merkin ensimmäinen kappale näytetään ingressinä (serif 20/24 px, paino 400). Tekstin jälkeen "Vanhempi / Uudempi uutinen" -selaus. Säännöt ovat tiedostossa `lib/artikkeli.ts` (testit: `npm run test:artikkeli`). | `app/(public)/uutiset/[slug]/page.tsx` |
| `JaaPainike` | Kosketuslaitteella avaa laitteen oman jakovalikon, tietokoneella kopioi linkin ("Linkki kopioitu ✓", myös ruudunlukijalle). Ei kolmansien osapuolten widgettejä. | `components/jaa-painike.tsx` |
| `StatTable` | Ensimmäinen sarake (rivin nimi) pysyy paikallaan vaakavierityksessä, ja sen reunaan tulee varjo, kun sisältöä vierii alle. Oikeassa reunassa on varjo niin kauan kuin sivulle on vieritettävää. Molemmat ovat CSS:n scroll-driven-animaatioita (`.taulukko-*`, globals.css), eivätkä ne näy, jos taulukko mahtuu. Rivi korostuu hoverissa (`surface-strong`). Rivien taustat ovat läpinäkymättömiä, ja taulukko on `border-separate`-mallissa, jotta kiinnitetyillä soluilla on omat viivansa. | `components/ui/stat-table.tsx` |
| `Lightbox` | Kosketusnäytöllä pyyhkäisy vaihtaa kuvan (kuva seuraa sormea, kynnys 50 px; pystyveto ei vaihda). Edellinen ja seuraava kuva esiladataan samalla srcsetillä (`getImageProps` + `preload`). Kuvan mitat tulevat assetista, ja latauksen ajan näkyy hallitseva väri. Kuvan vaihtuminen luetaan ruudunlukijalle. | `components/gallery/lightbox.tsx` |
| `HakuNakyma`, `HakuTulokset` | Ravintola- ja uutishaku päivittyvät ilman sivun uudelleenlatausta. Suodattimet ovat edelleen GET-lomakkeita ja linkkejä, jotka toimivat ilman JavaScriptiä. `HakuNakyma` ottaa haltuun vain samalle listaussivulle vievät linkit ja lomakkeet ja navigoi Reactin transitiona, jolloin nykyiset tulokset pysyvät näkyvissä. Päivityksen ajan tulokset himmenevät ja yläreunaan tulee ohut palkki (vasta 150 ms:n jälkeen, ettei nopea haku välähdä), ja tuloksilla on `aria-busy`. Vierityskohta säilyy, paitsi sivutuslinkeissä (`data-sivutus`), jotka vierittävät tulosten alkuun. Lomakkeiden kentät palautetaan vastaamaan URL:ia (esim. sirun poisto ja takaisin-painike). | `components/hakunakyma.tsx` |
| `CtaBlock` | **Ei käytössä** (tyyliopas: ei liittymiskehotteita). Säilyy vanhan datan vuoksi. | `components/blocks/cta-block.tsx` |

## Suorituskyky

Mitattu 10/2026 tuotantobuildista (Slow 4G, CPU 4×, mobiili). Googlen hyvän rajat: LCP < 2,5 s, CLS < 0,1.

| Sivu | LCP (DPR 1,75) | LCP (DPR 3) | CLS |
|---|---|---|---|
| Etusivu | 1,4 s | 1,8 s | 0 |
| Uutislista, ravintolalista, ottelut, arkisto | 0,8–1,1 s | 0,8–1,1 s | 0–0,001 |
| Uutinen (kansikuva) | 1,7 s | 2,7 s | 0 |
| Ravintola-arvio | 1,0 s | 0,9 s | 0 (satunnaisesti 0,037) |
| Stadionit | 2,1 s | 2,1 s | 0 |

- **Fontit:** esiladataan vain `latin`-alijoukko (76 kt). `latin-ext` on mukana `@font-face`-sääntönä ja latautuu vain tarvittaessa. Kaikkien alijoukkojen esilataus (136 kt) vei kaistaa pääkuvalta.
- **Tunnettu:** ravintola-arvion otsikko voi ensikäynnillä rivittyä uudelleen, kun serif-fontti saapuu varafontin jälkeen (CLS 0,037, hyvän rajan sisällä). Täysi korjaus vaatisi käsin rajatun oman fonttitiedoston, eikä se ole ylläpidon arvoinen.
- **Tunnettu:** Sanityn kuva-CDN luo uuden kuvakoon ensimmäisellä pyynnöllä (1–3 s). Tämä koskee vain ensimmäistä käyttäjää kutakin kokoa kohden.
- **Uutisen kansikuva DPR 3 -puhelimella** (2,7 s) on kaistan rajoittama: 1200 px:n kuva (111 kt) kilpailee JS:n ja fonttien kanssa. Seuraava parannus olisi `sizes`-arvo, joka huomioi kehykseen sovitetun (`object-contain`) kuvan todellisen leveyden.

## Tulostus

Tulosteeseen tulee vain sisältö (`@media print`, globals.css):
- Kaikki `<nav>`-elementit, lomakkeet, footer ja headerin painikkeet piilotetaan. Logo jää tunnisteeksi.
- Yksittäiset elementit piilotetaan luokalla `print:hidden`: Jaa-painike, "Lue lisää" -osio, herokuva ja esikatselupalkki.
- Selaimet eivät tulosta taustavärejä, joten yönsinisten pintojen (`bg-chrome`, `bg-navy`) teksti on tulosteessa mustaa. Sinipohjaisten merkkien ja painikkeiden (`bg-primary`, `bg-blue`) väri tulostetaan (`print-color-adjust: exact`).
- Leveä taulukko tulostuu kokonaan. Sivu ei katkea kuvan, taulukon rivin tai otsikon kohdalta.
- Ulkoisten linkkien osoite näytetään linkin perässä.

**Uutta komponenttia tehdessä:** jos se on pelkkää käyttöliittymää (painike, suodatin, navigointi), lisää `print:hidden`, ellei se ole jo `<nav>` tai `<form>`.

## Ikonit

**Lucide React** (tree-shakable, johdonmukainen, ilmainen). Ikoneita käytetään säästeliäästi, ei koristeena.

## Kuvitus

- Aidot valokuvat (klubi-illat, tapahtumat, hallitus, Lahti), ei stockkuvia
- Etusivun hero: vaakakuva koko osion taustana omissa väreissään, tekstin takana neutraali tummennus (esim. Huuhkajien katsomo)
- Kuvat Sanityn Asset CDN:stä, näytetään `next/image`:lla, AVIF/WebP automaattisesti
- **Polttopiste:** kuvakentissä on `hotspot` päällä. `SanityImage` rajaa kuvan CDN:ssä (`fit=crop`) toimittajan valitseman polttopisteen mukaan ja asettaa saman kohdan `object-position`-arvoksi, jolloin myös breakpointissa vaihtuva CSS-mittasuhde rajaa polttopisteen ympäriltä. Anna `width`/`height` kutsujan CSS-mittasuhteessa, ja kyselyissä palauta kuvan `hotspot` ja `crop` (koko kuvaobjekti tai eksplisiittinen projektio).
- **Latauksen paikanpitäjä:** kuvan paikalla näkyy sen sumea esikatselu, kunnes kuva on latautunut. Tyhjiä harmaita laatikoita ei ole. Sanity laskee esikatselun (`metadata.lqip`, noin 0,6 kt) jokaiselle kuvalle latauksen yhteydessä, ja kyselyt hakevat sen fragmenteilla, jotka ovat tiedostossa `sanity/lib/queries/kuvat.ts`:
  - `coverImage{${kuva}}`: yksittäinen kuva
  - `body[]{${runko}}`: Portable Text
  - `{ …, ${lqip} }`: rajattu projektio
  - `images[]{${ruutukuva}}`: isot kuvaruudukot. Näissä haetaan esikatselun sijaan vain hallitseva väri (`vari`), koska satojen esikatselujen kasvattama HTML ei ole sen arvoinen.

  `SanityImage` käyttää esikatselua automaattisesti (`placeholder="blur"`). `FramedImage` käyttää sitä kehyksen sumeana taustana, jolloin erillistä sumennettua kuvaa ei tarvitse hakea CDN:stä. **Kun lisäät uuden kuvakentän kyselyyn, käytä fragmenttia.** Ilman sitä kuva toimii, mutta ilman paikanpitäjää.
- **Latausprioriteetti:** `priority` (SanityImage, FramedImage) = sivun pääkuva eli LCP (hero, kansikuva, arvion iso kuva): `loading="eager"` + `fetchPriority="high"`. Käytä vain yhdelle kuvalle sivulla. `eager` = näkyvissä heti mutta ei pääkuva (listan ensimmäinen rivi, logo): vain `loading="eager"`. Next 16:ssa vanhentunut `next/image`-`priority` ei nosta prioriteettia, joten LCP-kuva latautui Low-prioriteetilla (ks. Suorituskyky).
- **Stega:** luonnosnäkymän stega-merkit puhdistetaan keskitetysti (`buildMetadata`, `JsonLd`, navigaation hrefit, kategoria- ja ruokatyyppihaut). Uusissa komponenteissa puhdista `stegaClean`illa Sanity-merkkijonot, joita verrataan, käytetään avaimina, id:inä tai URL:eissa — älä pelkkää näytettävää tekstiä.

## Animaatiot

Hyvin maltillisia. Vain:
- Linkki-hoverin värimuutos (150 ms)
- Kortin hover-varjo (200 ms)
- Valikon avautuminen (pudotusvalikko, mobiilivalikko ja sen alavalikot): 150 ms häivytys ja 4 px liuku ylhäältä (`starting:`-variantti eli CSS:n `@starting-style`, ks. `avautuu` tiedostossa `header-client.tsx`). Sulkeutuminen on välitön. Mobiilivalikon alla sivu himmenee (`bg-navy/25`, napautus sulkee), ja taustasivun vieritys lukitaan.
- Kortin kuvan hidas lähennys hoverissa: 3 %, 500 ms (`korttiZoom`, `framed-image.tsx`). Koskee vain kortteja, joilla on luokka `group/kortti`.
- Nuolilinkin nuoli liikahtaa 3 px osoittamaansa suuntaan (`Nuoli`, `components/ui/nuoli.tsx`). Käytä aina tätä komponenttia, älä pelkkää `→`-merkkiä. Linkkiin tulee luokka `group/linkki`, korttiin `group/kortti`.
- Tekstilinkin alleviivaus vahvistuu hoverissa 1 px → 2 px (`decoration-1 hover:decoration-2`).
- Headerin varjo: kun sivua vieritetään, sticky headerin alle tulee hento varjo, joka voimistuu ensimmäisten 64 px:n aikana (`.header-varjo`, scroll-driven animation). Selaimissa ilman tukea headerissa on pelkkä alaviiva.
- **Sivunvaihto** (View Transitions, `components/sivunvaihto.tsx`): kun polku vaihtuu, vanha sisältö häivyttyy ulos (120 ms) ja uusi sisään (180 ms, alkaa 60 ms myöhemmin). Header on ankkuroitu (`viewTransitionName: sivuston-header`), joten se ei liiku eikä sivun kuva piirry sen päälle. Hakusivujen päivitykset eivät muuta polkua, joten ne eivät animoidu (niissä on `HakuTulokset`-tila). Selaimen takaisin-painike vaihtaa sivun ilman animaatiota.
- **Kuvan siirtymä** (`KuvaSiirtyma`): ravintolakortin (vain iso kortti) ja uutiskortin kuva liukuu kohdesivun isoksi kuvaksi, 380 ms. Kuvat vaihtuvat ryhmän sisällä 150 ms:ssa, jottei eri tavoin rajattuja kuvia näy päällekkäin. Sama `nimi` kortissa ja kohdesivulla, ja nimi saa olla näkyvissä vain kerran sivulla. Toimii, kun kohdesivu on esihaettu, eli tuotannossa, ei kehityspalvelimella. Vähemmän liikettä: kuva ei liiku, sivu vain häivyttyy.
- Sivun sisäisten ankkurihyppyjen pehmeä vieritys (`scroll-behavior: smooth`, vain `prefers-reduced-motion: no-preference`). Sivunvaihdoissa Next hyppää sivun alkuun heti (`data-scroll-behavior="smooth"` juuren `<html>`-elementissä).

Kunnioita `prefers-reduced-motion`.

## Saavutettavuus

- WCAG 2.1 AA -taso; kaikki yllä olevat tekstiväriparit ≥ 4,5:1
- Näppäimistönavigointi toimii kaikissa interaktiivisissa elementeissä
- Fokus-renkaat näkyvissä (2 px `--ring` = klubinsininen, 2 px offset); lomakekentillä tyylioppaan fokuskehys
- Aria-labelit ikoninapeissa ja epäselvissä kontrolleissa
- Lomakekentillä `<label>` aina, ei pelkkä placeholder
- Kuvilla `alt` (Sanityssa validointi pakottaa); logomerkki on koriste (`alt=""`), tekstilogolla on nimi
