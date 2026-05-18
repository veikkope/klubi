# 03 — CMS-päätös: Next.js + Sanity

## Vertailutaulukko

| Kriteeri | Next.js + Sanity | Webflow | WordPress (Seravo) |
|---|---|---|---|
| Ylläpidon helppous isälle | Hyvä — selkeät lomakkeet, schema rajoittaa virheet | Erinomainen visuaalisesti, mutta editor-tila rajoittunut | Tuttu, mutta Gutenberg + lisäosat = sekava |
| Kehittäjän joustavuus | Maksimaalinen | Rajoitettu (ei koodia) | Hyvä, mutta vanhempi ekosysteemi |
| Vuosikustannus | Hyvin matala käynnistys | 192–348 € | 120–240 € |
| MVP-nopeus | 2–4 vk | 1–2 vk | 2–3 vk |
| Skaalautuvuus 10x sisältö | Erinomainen | Hidas | Hyvä |
| Lock-in | Matala (NDJSON-export) | **Korkea** | Matala |
| SEO + 301-redirectit | Täysi hallinta `next.config.ts`:ssa Gitissä | UI-syöttö käsin, työlästä | Plugin |
| Soveltuvuus tähän tapaukseen | Rakenteinen data sopii täydellisesti | Rakenteisen datan rajoitukset | Toimii, vanha tapa |

## Päätös: Next.js (App Router) + Sanity CMS Vercelissä

### Perustelut
1. Käynnistys mahdollista hyvin pienillä kustannuksilla
2. Sanity Studio on isälle riittävän helppo, kun skeemat suunnitellaan tiukoiksi (suomenkieliset kenttänimet, validoinnit, esikatselu)
3. Kehittäjän osaaminen valjastettuna täysimittaisesti
4. Ei lock-iniä — data on NDJSON-muodossa, Next.js siirrettävissä
5. SEO-hallinta täydellinen (redirectit Gitissä versioituina)
6. Skaalautuvuus ilman radikaalia hintamuutosta

### Riskit ja mitigaatiot

| Riski | Mitigaatio |
|---|---|
| Sanity Free = vain public datasetit (20 seats, 2 roolia, 2 datasettia, 10k dok., visual editing) | Sopii hyvin tähän käyttöön. Jos privaattidata myöhemmin → maksullinen paketti (~15 $/kk lähtien) tai data muualle (DB / sähköposti) |
| Vercel Hobby on ei-kaupalliseen käyttöön | Vahvista käyttöehdot sprintissä 0. Vaihtoehdot: Netlify, Cloudflare Pages — kaikki ilmaisia ja ottavat Next.js:n |
| Isä hämmentyy Studiosta | 1-sivuinen kuvitettu suomenkielinen opas + 30 min walkthrough + tiukat skeemavalidoinnit |
| Sanity nostaa hintoja tai poistuu | Dataset export NDJSON-muodossa; Strapi/Payload/Directus -migraatio mahdollinen viikon työllä |
| Vercel muuttaa Hobby-ehtoja | Next.js siirrettävissä mille tahansa Node-yhteensopivalle alustalle ilman koodimuutoksia |

## Varavaihtoehto: WordPress Seravossa

Vain jos toinen seuraavista toteutuu:
- Isä myöhemmin vaatii WYSIWYG-layouteditointia layoutin yli
- Pojan aika ylläpidolle rajataan radikaalisti

Tällöin: Seravon managed-hosting hoitaa tietoturvan ja päivitykset. Custom Post Types + ACF Pro antavat samankaltaisen rakenteisuuden. Migraatio Sanitysta WordPressiin on viikon työ.

## Hylätty: Webflow

Hylätty seuraavista syistä:
- 192–348 €/v lisäkustannus
- Korkea lock-in (vain HTML-export, ei CMS-rakennetta)
- Webflow CMS on tehty markkinointisivuille, ei rakenteiselle datalle (93 ravintolaa, tilastot)
- 301-redirectien syöttäminen UI:ssa on hidasta ja virhealtista
- Käyttäjäsubmittaavat ravintola-arvostelut vaativat kolmannen osapuolen palvelun
- AI-agenttien hyödyntäminen on käytännössä mahdotonta
