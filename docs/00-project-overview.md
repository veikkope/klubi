# 00 — Projektin yleisesittely

## Asiakas
Lahden Suomalainen Klubi ry — perustettu 2007. Perinteinen suomalainen yhdistys, jonka jäsenistö järjestää tapahtumia (vuosikokous, vappu, mölkkyturnaus, palloveikkaus jne.). Sivusto toimii sekä jäsentiedotuskanavana että julkisena käyntikorttina.

## Lähtötilanne
Nykyinen sivusto `lahdensuomalainenklubi.com` on rakennettu vanhalla frame-pohjaisella HTML-tekniikalla. Visuaalisesti vanhentunut, ei mobiiliresponsiivinen, ei moderneja toiminnallisuuksia (kalenteri, lomakkeet, galleriat). Sisältöä on yllättävän paljon: jalkapallotilastoja, ravintolareviewejä, stadiontietoja, uutisia.

## Tavoitteet
1. **Moderni, elegantti ilme** — sininen+valkoinen, mobile-first, saavutettava
2. **Sihteerin helppo ylläpito** — visuaalinen editori (Sanity Studio), ei koodausta
3. **Pitkäikäisyys** — ei lukkiutumista yhteen palveluun, data viedaan tarvittaessa
4. **SEO säilyy** — vanhat URL:t 301-ohjautuvat
5. **Kustannustehokas** — käynnistys mahdollisimman edullisesti, mahdolliset Pro-päivitykset perustellusti

## Sidosryhmät
| Rooli | Vastuu |
|---|---|
| Käyttäjä (poika) | Tekninen toteutus, kehittäjäoperatiivit, julkaisu |
| Isä (yhdistyksen sihteeri) | Sisällön ylläpito Sanity Studiossa, sisältöpäätökset |
| Yhdistyksen hallitus | Sisällön hyväksyntä, jäsentapahtumien tiedot |
| Yhdistyksen jäsenet | Sivuston kohderyhmä (myös potentiaaliset uudet jäsenet) |

## Korkean tason aikataulu
Sprintit 0–6, kestot ja sisällöt: ks. `08-build-plan.md`. Karkeasti **3–5 viikkoa** ensimmäisestä commitista julkaisuun, riippuen miten paljon aikaa käyttäjä voi käyttää.

## Päätösloki
Tähän kerätään merkittävät arkkitehtuuripäätökset päivämäärineen.

| Pvm | Päätös | Perustelu | Lähde |
|---|---|---|---|
| 2026-05-18 | Stack: Next.js 15 + Sanity + Vercel | Kustannus, joustavuus, lock-in-vapaa, kehittäjälle sopiva | `03-cms-decision.md` |
| 2026-05-18 | Vain suomenkielinen sisältö | Yhdistyksen kohderyhmä on suomenkielinen | Käyttäjäpäätös |
| 2026-05-18 | Ei jäsenaluetta/kirjautumista | Kaikki sisältö julkista, yksinkertaisempi | Käyttäjäpäätös |
| 2026-05-18 | 301-redirectit vanhoista .htm-URL:eista | SEO säilyy, vanhat linkit toimivat | Käyttäjäpäätös |
| 2026-05-18 | Värimaailma: sininen+valkoinen | Käyttäjäpäätös | `04-design-direction.md` |
| 2026-05-18 | Domain pysyy: lahdensuomalainenklubi.com | Tunnettuus, ei migraatiokustannusta | Käyttäjäpäätös |
| 2026-05-18 | Sähköpostipalvelua ei lukita ennen sprinttiä 3 | Volyymi ja hinnat varmistettava ensin | Käyttäjäpäätös |

## Mikä on "valmis" (Definition of Done)
- Lighthouse 95+ (Performance, A11y, Best Practices, SEO) kaikilla sivutyypeillä
- Kaikki vanhat `.htm`-URL:t 301-ohjautuvat tai 410-Gone
- Isä on käynyt walkthrough-session ja pystyy lisäämään uuden tapahtuman ilman apua
- Lomakkeet toimivat (jäsenhakemus → sähköposti, ravintola-arvostelu → Sanity moderointijonoon)
- Sitemap submitoitu Google Search Consoleen, ensimmäinen crawl onnistunut
- Domain DNS osoittaa Vercelille, vanhat sivut eivät enää näy julkisesti
