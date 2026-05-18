# 08 — Rakennussuunnitelma

Sprintti-tason tehtävälista. Jokainen sprintti tuottaa demottavan inkrementin. Kaikki vaiheet noudattavat samaa "Definition of Done" -mallia:
- Koodi committed gitissä
- Lighthouse 95+
- Saavutettavuus: axe-skannaus ei kriittisiä virheitä
- Preview deploy Vercelissä toimii
- Sanity-skeemat lopullisia (ei TODO-kenttiä)

## Sprint 0 — Pohja (½–1 päivä)
- [x] Git-repo + .gitignore
- [x] Next.js 15+ TS+Tailwind+ESLint init
- [x] Sanity Studio embedded `/studio`-polkuun
- [x] Schemas pohjarakenne (objects + 14 dokumenttityyppiä)
- [x] CLAUDE.md + 11 docs-tiedostoa
- [x] 8 sub-agenttia `.claude/agents/`-kansioon
- [ ] Sanity-projekti luotu (npx sanity@latest init) ja `.env.local` täytetty
- [ ] Vercel-projekti yhdistetty, ensimmäinen preview-deploy

**Demo:** Studio aukeaa `/studio`-polussa, etusivulla hero "Lahden Suomalainen Klubi". Asennuksen jälkeen seuraavat askelet ohjeistettu.

## Sprint 1 — Sisällön audit + migraatio (3–5 päivää)
- [x] `scripts/scrape-old-site.ts` — kerää raakadatan
- [ ] `scripts/normalize.ts` — muuntaa NDJSON:iksi
- [ ] Aja scrape, normalisointi, import production-datasetille
- [ ] Tarkista Studiossa: jalkapallotilastot, ravintolat, stadionit, vanhat uutiset
- [ ] Päivitä `docs/01-content-audit.md` toteutuneilla luvuilla

**Demo:** Studio näyttää ≥ 90 % vanhasta sisällöstä järkevästi rakennettuna.

## Sprint 2 — Design system + perussivut (3–5 päivää)
- [ ] Komponenttikirjasto: `Header`, `Footer`, `Container`, `Button`, `Card`, `Badge`, `Stars`, `Breadcrumbs`
- [ ] Route group `app/(public)/layout.tsx` headerin ja footerin upottamiseen
- [ ] Sanity-driven navigaatio (`navigaatio`-singleton)
- [ ] Footer Sanitysta (`yhteystiedot`-singleton)
- [ ] Etusivu — lohkot Sanitysta (`etusivu`-singleton)
- [ ] Sivutyyppi `sivu` rendöityy `app/(public)/[slug]/page.tsx`:ssä
- [ ] Yhteystiedot-sivu (`/yhteystiedot`)
- [ ] Yhdistys-, säännöt-, jäsenyys-sivut Sanitysta

**Demo:** Etusivu + 4 staattista sivua näkyvät hienosti mobiilissa ja desktopissa. Header/footer toimii. Lighthouse 95+.

## Sprint 3 — Dynaamiset sisältötyypit (3–5 päivää)
- [ ] `/tapahtumat` — lista (tulevat + menneet)
- [ ] `/tapahtumat/[slug]` — yksittäinen tapahtuma
- [ ] `/uutiset` + `/uutiset/[slug]` — uutiset
- [ ] `/galleria` + `/galleria/[slug]` — albumit (lightbox)
- [ ] Jäsenhakemuslomake `/jasenyys/liity`:
  - [ ] Server Action `app/jasenyys/liity/actions.ts`
  - [ ] Lähettää sähköpostia (palvelu päätetty tässä sprintissä — Resend/SES/Postmark/SMTP)
  - [ ] reCAPTCHA tai Honeypot spamin esto
- [ ] ICS-vienti tapahtumille `/tapahtumat/[slug]/ics`

**Demo:** Isä lisää tapahtuman Studiossa → näkyy `/tapahtumat`-sivulla. Jäsenhakemus lähettyä toimii.

## Sprint 4 — Erikoissivut (3–5 päivää)
- [ ] Jalkapalloarkisto: `/jalkapallo` (hub) + alasivut
  - [ ] Taulukkokomponentti `<StatTable />` joka renderöi `jalkapalloTilasto`-dokumentit
  - [ ] Suodatus vuosien mukaan, jos kategoria sallii
- [ ] Ravintolahakemisto `/ravintolat`:
  - [ ] Suodatus kaupungin/tähtien/ruokatyyppin mukaan (URL-tila)
  - [ ] Kartta (Mapbox tai MapLibre — päätös sprintin alussa)
  - [ ] `/ravintolat/[slug]` — yksittäinen ravintola
  - [ ] `/ravintolat/arvostele` — käyttäjäarvostelulomake (Server Action → Sanity moderointijonoon)
  - [ ] Hyväksytyt arvostelut näytetään ravintolasivulla
- [ ] Stadionit `/stadionit` + `/stadionit/[slug]`

**Demo:** Kaikki vanhan sivuston sisältötyypit näkyvät uudessa muodossa. Käyttäjäarvostelu lähetetään, isä hyväksyy Studiosta.

## Sprint 5 — SEO, redirectit, viimeistely (2–3 päivää)
- [ ] `/sitemap.xml`, `/robots.txt`
- [ ] JSON-LD per sivutyyppi (Organization, Event, Article, Restaurant)
- [ ] OG-kuvageneraattori `/api/og`
- [ ] `lib/redirects.ts` kaikki vanhat URL:t kartoitettu (manuaalisen audit)
- [ ] `scripts/verify-redirects.ts` ajettava → kaikki 308/301
- [ ] Lighthouse-kierros, korjauksia
- [ ] axe-saavutettavuusskannaus
- [ ] Selaintesti: Chrome, Firefox, Safari, Edge mobiilissa ja desktopissa
- [ ] Isälle 1-sivuinen ohje (`docs/09-editor-guide.md` viimeistelty + tulostettu)
- [ ] 30 min walkthrough-sessio isän kanssa

**Demo:** Tuotantovalmis sivusto, isä on käynyt walkthroughin ja pystyy lisäämään tapahtuman ilman apua.

## Sprint 6 — Julkaisu (½ päivää + 2 viikon monitorointi)
- [ ] DNS-vaihto: A/AAAA-tietueet osoittavat Vercelille (tai NS-vaihto)
- [ ] HTTPS-sertifikaatti automaattinen Vercelistä
- [ ] Vanhat sivut alkavat ohjautua 308:lla
- [ ] Google Search Console: lisää domain, lähetä sitemap
- [ ] Bing Webmaster Tools: sama
- [ ] Monitorointi 2 viikkoa: tarkista että ei 404-virheitä, indeksointi toimii

**Demo:** Sivusto live osoitteessa lahdensuomalainenklubi.com.

## Tehtävien jakelu agenteille

| Sprint | Pääagentti | Avustavat |
|---|---|---|
| Sprint 0 | build-implementation | cms-architecture (skeemat), design-system |
| Sprint 1 | migration | content-audit |
| Sprint 2 | design-system | build-implementation, editor-ux |
| Sprint 3 | build-implementation | cms-architecture, editor-ux |
| Sprint 4 | build-implementation | migration (data lopullisesti), design-system |
| Sprint 5 | seo | build-implementation, editor-ux (oppaan viimeistely) |
| Sprint 6 | build-implementation | seo (Search Console -seuranta) |
