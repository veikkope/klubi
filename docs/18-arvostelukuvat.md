# 18 — Kävijöiden arvostelujen kuvat

Kävijä voi liittää ravintola-arvosteluun enintään **3 kuvaa**. Kuvat tallennetaan Sanityyn
arvostelun luonnoksen mukana ja julkaistaan, kun sihteeri hyväksyy arvostelun.

Päätös 30.9.2026: kuvat ladataan suoraan Sanityyn (vaihtoehto 1). Erillistä välivarastoa ei
käytetä, koska se toisi uuden palvelun ja avaimen. Lyhyt julkisuusikkuna (§3) hoidetaan
poistamalla hylätyt kuvat heti ja siivoamalla orvot kuvat joka yö.

## 1. Kulku

```
Selain                         Palvelintoiminto (actions.ts)            Sanity
──────                         ─────────────────────────────            ──────
valinta (enint. 3)
→ pienennys 1600 px, JPEG      tekstikenttien tarkistus
  (metatiedot häviävät)        → kuvien tarkistus (lib/arvostelukuvat.ts)
→ kuvaus (alt), lupa-rasti        määrä, koko, JPEG-tunniste, metatietojen
→ lähetys FormDatana              poisto, kuvauksen pituus, lupa
                               → ravintolan tarkistus
                               → kuvien lataus ─────────────────────────→ sanity.imageAsset
                                 (source.name = "kavija-arvostelu")        (julkinen CDN)
                               → arvostelu luonnoksena ─────────────────→ drafts.<uuid>
                                 kuvat[] { asset, alt }                    (ei julkinen)
                               ← virhe: ladatut kuvat poistetaan
```

## 2. Tiedostot

| Tiedosto | Tehtävä |
|---|---|
| `lib/arvostelukuvat.ts` | Rajat, kenttänimet, JPEG-tunnistus, metatietojen poisto, `validatePhotos`. Puhdas moduuli |
| `app/(public)/ravintolat/arvostele/resize-photo.ts` | Pienennys selaimessa (canvas → JPEG, EXIF-suunta huomioidaan) |
| `app/(public)/ravintolat/arvostele/photo-picker.tsx` | Valinta, vedä ja pudota, esikatselu, poisto, kuvaus, lupa |
| `app/(public)/ravintolat/arvostele/review-form.tsx` | Kuvat React-tilassa; `submit` liittää ne FormDataan |
| `app/(public)/ravintolat/arvostele/actions.ts` | Tarkistus, lataus, peruutus virheessä |
| `sanity/schemas/documents/ravintolaKayttajaArvostelu.ts` | Kenttä `kuvat` (enint. 3, `alt` pakollinen), esikatselukuva jonossa |
| `sanity/actions/hylkaa-arvostelu.tsx` | Studio: "Hylkää arvostelu" poistaa luonnoksen ja sen kuvat |
| `sanity/lib/arvostelukuvat-siivous.ts` | Orpojen kuvien haku ja poisto (`raw`-näkökulma) |
| `app/api/cron/siivoa-arvostelukuvat/route.ts` + `vercel.json` | Yösiivous klo 3.30 UTC (Vercel Cron, `CRON_SECRET`) |
| `scripts/siivoa-arvostelukuvat.ts` | Sama siivous käsin (`npm run siivoa:arvostelukuvat`) |
| `components/gallery/review-photos.tsx` | Pikkukuvat arvostelun alla ja suurennus nykyisellä Lightboxilla |
| `scripts/test-arvostelukuvat.ts` | Yksikkötestit (`npm run test:arvostelukuvat`) |

## 3. Tietoturva ja yksityisyys

- **Julkisuusikkuna.** Sanityn kuvatiedostoilla ei ole luonnostilaa. Ladattu kuva on
  CDN:ssä satunnaisessa osoitteessa, ja julkisessa datasetissä kuvatiedostot voi listata
  kyselyllä. Hylätyn arvostelun kuvat poistaa heti **Hylkää arvostelu**. Muuten orvoksi
  jääneet (tavallinen Poista, yksittäisen kuvan poisto, katkennut tallennus) poistuvat yösiivouksessa.
- **Siivous ei koske klubin kuviin.** Vain `source.name == "kavija-arvostelu"`, ei viittauksia
  mistään dokumentista (luonnokset mukaan lukien, `raw`-näkökulma) ja yli 24 h vanhat. Sanity
  estää lisäksi viitatun kuvan poiston (409). Testattu 30.9.2026 `development`-datasetissä.
- **Vain JPEG.** Palvelin tunnistaa tyypin tiedoston alusta, ei selaimen ilmoituksesta. SVG,
  HTML ja muut hylätään. Sanity käsittelee kuvan vielä itse (rikkinäinen kuva ei mene läpi).
- **Metatiedot.** Selain piirtää kuvan uudelleen, jolloin EXIF/GPS häviää. Palvelin poistaa
  vielä APP1–APP15- ja COM-segmentit (säilyttää ICC-väriprofiilin), jos lomake lähetetään ohi
  selaimen. Sanityyn pyydetään vain `lqip`-metatieto (ei `exif`, ei `location`).
- **Koko.** 3 × enintään 1,3 Mt; `serverActions.bodySizeLimit` 4 Mt (Vercelin raja 4,5 Mt).
- **Lupa.** Pakollinen rasti "Kuvat ovat itse ottamiani, ja klubi saa julkaista ne…", kun kuvia on.
- **Roskaposti.** Hunajapurkki ja rajat kuten ennenkin. Jos kuvilla aletaan häiriköidä,
  seuraava askel on Vercelin palomuurin nopeusraja tai Cloudflare Turnstile.

## 4. Saavutettavuus

- Kuvaus (alt) kysytään kävijältä vapaaehtoisena. Jos se puuttuu, tallennetaan
  "Kävijän kuva ravintolasta X". Studiossa `alt` on pakollinen ja muokattava.
- Lisäyspainike on oikea painike, tiedostokenttä piilotettu. Poisto siirtää fokuksen
  lisäyspainikkeeseen. Tila kerrotaan `aria-live`-alueella. Virheyhteenvedon linkki vie
  kuvaryhmään (`#arvostelu-kuvat`).
- Sivulla pikkukuvat ovat painikkeita (`aria-haspopup="dialog"`). Lightbox palauttaa fokuksen.

## 5. Rajoitteet

- Ilman JavaScriptiä kuvia ei voi liittää (muu lomake toimii kuten ennenkin).
- HEIC: iOS muuntaa kuvan tiedostovalinnassa JPEG:ksi, ja Safari purkaa HEIC:n. Jos selain
  ei osaa purkaa tiedostoa, kävijä saa ohjeen tallentaa sen JPEG:nä. **Testaa oikealla
  iPhonella ennen julkaisua.**
- Kuvat tallennetaan enintään 1600 px:n kokoisina. Alkuperäistä resoluutiota ei säilytetä.

## 6. Testaus

| Mitä | Miten | Tulos 30.9.2026 |
|---|---|---|
| Säännöt, JPEG-jäsennin | `npm run test:arvostelukuvat` (14 testiä) + 300 oikeaa JPEG:tä | ✅ |
| Lomake päästä päähän | Playwright + Chrome, `development`: 4 kuvaa → 3, poisto, virhe ilman lupaa (kuvat säilyvät), onnistunut lähetys | ✅ |
| Tallennus | 1286×1600 JPEG 289 kt, `source.name` oikein, ei EXIF/XMP alkuperäisessä, luonnos ei näy julkisesti | ✅ |
| Näyttö | Pikkukuvat, Lightbox, fokuksen palautus, ei vaakavieritystä 390 px | ✅ |
| Hylkäys ja siivous | Viitattu kuva säilyy (julkaistu, luonnos, alle 24 h), orpo poistuu, 409 viitatulle | ✅ |
| Cron-reitti | 501 ilman salaisuutta, 401 väärällä, 200 oikealla | ✅ |
| Studio-painike | Käsin Studiossa (vaatii kirjautumisen) | ☐ |
| iPhone (HEIC, kamera) | Käsin puhelimella | ☐ |

## 7. Käyttöönotto tuotantoon

1. Vercel → Settings → Environment Variables: `CRON_SECRET` (Production), satunnainen arvo.
2. Merge + deploy. Vercel näyttää ajastuksen kohdassa Settings → Cron Jobs.
3. `npm run backup`, sitten `npx tsx scripts/lisaa-kuvat-tietosuojaan.ts --production`
   (päivittää tietosuojaselosteen arvostelukohdat, ei koske muihin muokkauksiin).
4. Testaa: lähetä arvostelu kuvalla, hylkää se Studiossa **Hylkää arvostelu** -painikkeella
   ja tarkista, ettei kuvan osoite enää avaudu.
