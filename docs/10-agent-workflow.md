# 10 — Agenttityönkulku

Tämä projekti hyödyntää Claude Coden **sub-agenttejä**. Jokainen erikoisagentti tuntee oman alueensa parhaat käytännöt ja päivittää oman dokumentaation tiedostonsa.

## Agentin valinta — vuokaavio

```
Onko tehtävä...
├── Vanhan sivun sisällön tutkiminen tai inventointi?      → content-audit-agent
├── URL-rakenteen / navigaation / redirectien suunnittelu? → ia-sitemap-agent
├── Uuden Sanity-skeeman lisäys tai CMS-rakenteen muutos?  → cms-architecture-agent
├── Visuaalinen suunta, komponenttien tyyli, värit?        → design-system-agent
├── Vanhan datan siirto Sanityyn?                          → migration-agent
├── Metadata, sitemap, JSON-LD, redirectien generointi?    → seo-agent
├── Studio-UX, isälle suunnattu opas, validoinnit?         → editor-ux-agent
└── Mikä tahansa muu featuren rakentaminen                 → build-implementation-agent
```

## Sub-agenttien sijainti

`.claude/agents/`-kansiossa, yksi `.md`-tiedosto per agentti.

## Agenttien käytön peruskuvio

### 1. Käyttäjä (poika) antaa korkean tason tehtävän
Esim. "Lisätään ravintolakartta ravintolahakemistolle".

### 2. build-implementation-agent suunnittelee ja kysyy avustajia
- Tarvitaan ehkä uusi geopoint-skeema kentän selvitystä → konsultoi `cms-architecture-agent`
- Karttakomponentin design (markerit, tooltip) → konsultoi `design-system-agent`
- SEO-vaikutus (jos kartta käyttää JavaScriptia heavy → korvaako CLS-budjetin?) → konsultoi `seo-agent`

### 3. Rakentaa featuren
Käyttäjäagentti tekee koodimuutokset, ajaa testit, päivittää relevantin docs/-tiedoston, deployaa preview-versioon.

### 4. Esittelee tuloksen
Käyttäjä testaa preview-URL:ssa. Hyväksyy tai pyytää korjauksia.

## Agenttien välinen viestintä

- Käytä **Agent**-toolia hetkellisten haarojen luomiseen — tämä lähettää agentille kuvauksen, joka työskentelee tehtävän ja palauttaa tuloksen
- Säilytä agentit pieninä ja fokuksena — yksi agentti ei tee kaikkea
- Jaa konteksti: anna käynnistettäessä agentille riittävä tausta + tiedostopolut

## Esimerkki: tapahtumakalenterin lisääminen

**Käyttäjä:** "Tee tapahtumakalenteri."

**build-implementation-agent:**
1. Lukee `docs/05-content-models.md` → tapahtuma-skeema on jo olemassa
2. Lukee `docs/02-information-architecture.md` → reitti `/tapahtumat` on suunniteltu
3. Lukee `docs/04-design-direction.md` → kortti-komponentin tyyli
4. Käyttää `Agent(design-system-agent)` jos tarvitsee uuden `EventCard`-komponentin
5. Käyttää `Agent(seo-agent)` lisäämään `Event`-JSON-LD:n
6. Käyttää `Agent(editor-ux-agent)` varmistamaan että Sanityssa olevat oletusarvot ovat järkeviä
7. Rakentaa `app/(public)/tapahtumat/page.tsx` ja `app/(public)/tapahtumat/[slug]/page.tsx`
8. Päivittää `docs/08-build-plan.md` (sprint 3 -kohta valmiiksi)
9. Demo preview-URL

## Vinkkejä agenttien käyttöön

- **Anna selkeä konteksti**: linkitä agentille `docs/`-tiedostoihin joista hän voi lukea taustaa
- **Älä päällekkäisyytä**: jos `build-implementation-agent` jo tutkii, älä käynnistä omaa rinnakkaista hakua samasta asiasta
- **Tarkasta tulokset**: agentin yhteenveto kuvaa mitä se aikoi tehdä, ei välttämättä mitä se teki — lue koodimuutokset
- **Päivitä docs**: kaikki agentit päivittävät oman dokumenttinsa kun tekevät relevantteja muutoksia. Tämä pitää tiedon tuoreena tulevia agentteja varten

## Agenttien hyvät käytännöt

Yhteiset (kaikki agentit):
- Lue `CLAUDE.md` ensimmäisenä
- Lue oma `docs/`-tiedostosi
- Päivitä `docs/`-tiedostosi muutosten jälkeen
- Älä julkaise puolivalmista — Sanity-skeema tai komponentti pitää olla loppuun saakka

Erityisesti `editor-ux-agent`:
- Validointivirheet aina suomeksi
- Suomenkieliset kenttänimet ja kuvaukset
- Esikatselut listanäkymässä (kuva + title + tila)

Erityisesti `seo-agent`:
- Kaikki muutokset metadataan testataan Google's Rich Results Test -työkalulla
- Redirectien testaus skriptillä (`scripts/verify-redirects.ts`)

Erityisesti `design-system-agent`:
- Värimuutokset CSS-muuttujiin, ei suoraan komponentteihin
- Saavutettavuuskontrasti tarkistetaan (vähintään 4.5:1 normaalitekstille)

## Yhteiset komennot agenttien työnkulussa

```bash
# Käynnistä dev-palvelin
npm run dev

# Tarkista TS
npm run type-check

# Tarkista linter
npm run lint

# Build (esim. ennen committia)
npm run build

# Scrape vanha sivu
npm run scrape

# Generoi redirectit
npm run redirects
```
