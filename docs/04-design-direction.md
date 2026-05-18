# 04 — Design-suunta

## Brändin ydin

**Klassinen, arvokas, elegantti — modernilla otteella.** Sininen+valkoinen viittaa suomalaisuuteen ja klubin perinteeseen, mutta toteutus on raikas ja moderni. Ei vanhanaikaisuutta, ei kliseitä.

## Värimaailma

Lähde: `app/globals.css` (CSS-muuttujat + Tailwind v4 `@theme inline`).

### Brändisinisen palette
| Token | HEX | Käyttö |
|---|---|---|
| `--brand-50` | #eff6ff | Soft background, alustat |
| `--brand-100` | #dbeafe | Hover-tilat, badge-taustat |
| `--brand-200` | #bfdbfe | Aksenttitekstit tummalla taustalla |
| `--brand-500` | #3b82f6 | Linkkien fokus-rengas, korostukset |
| `--brand-600` | #2563eb | Sekundääriset napit |
| `--brand-700` | #1d4ed8 | **Primääri aksentti** (CTA, linkit) |
| `--brand-800` | #1e40af | Hover-tila CTA:lle |
| `--brand-900` | #1e3a8a | Hero-tausta, headerin korkein kontrasti |
| `--brand-950` | #172554 | Tumman teeman tausta, footer |

### Neutraalit (slate-skaala)
| Token | HEX | Käyttö |
|---|---|---|
| `--background` | #ffffff | Sivun perustausta |
| `--surface` | #f8fafc | Korttien, lohkojen tausta |
| `--surface-strong` | #f1f5f9 | Korostetut alustat |
| `--foreground` | #0f172a | Päätekstin väri |
| `--muted` | #475569 | Sekundääri teksti |
| `--border` | #e2e8f0 | Erottimet, korttien reunat |

### Tumma teema
Aktivoituu `prefers-color-scheme: dark`. Brändisinisestä säilyy syvyys, taustat muuttuvat tummansiniseksi (`#0b1220`), tekstit `slate-50`.

## Typografia

| Fontti | Käyttö | Lähde |
|---|---|---|
| **Inter** | Body, navigaatio, lomakkeet, taulukot | next/font/google |
| **Fraunces** | Otsikot (h1–h3), hero, "klassinen" tunnelma | next/font/google |

Fraunces on moderni serif jossa "SOFT"-akseli — yhdistää klassisen vakauden modernin lämpöön. Hyvä yhdistyksen perinteen ja modernin otteen ilmentäjäksi.

### Hierarchia
- **Display (hero):** Fraunces, 5xl/7xl, weight 500, leading-tight, tracking-tight
- **H1 (sivu):** Fraunces, 4xl, weight 500
- **H2 (osio):** Fraunces, 3xl, weight 500
- **H3 (kortti):** Fraunces, xl, weight 500
- **Body:** Inter, base/lg, weight 400, leading-relaxed
- **Caption:** Inter, sm, weight 400, color muted
- **Eyebrow (yläteksti):** Inter, sm, uppercase, tracking-wider, weight 500

## Spacing & rytmi

Tailwind v4 oletusarvot. Tärkeät:
- Section padding: `py-20` (mobiilissa) → `py-32` (työpöydällä)
- Max content width: `max-w-5xl` (yleinen) tai `max-w-3xl` (artikkelit)
- Card padding: `p-6`
- Gap between sections: `gap-12` desktopissa, `gap-8` mobiilissa

## Komponentit (perusjoukko)

| Komponentti | Tila | Sijainti |
|---|---|---|
| `Header` (sticky, hampurilainen mobiilissa) | TODO | `components/layout/header.tsx` |
| `Footer` | TODO | `components/layout/footer.tsx` |
| `Hero` (sininen tausta, gradientti) | Inline etusivulla | siirretään `components/blocks/hero.tsx`:ksi |
| `Card` (uutinen, tapahtuma, ravintola) | TODO | `components/ui/card.tsx` |
| `Button` (primary/secondary/ghost) | TODO | `components/ui/button.tsx` |
| `Badge` (tagit, kaupungit, tähdet) | TODO | `components/ui/badge.tsx` |
| `Stars` (1–5 ravintolatähteä) | TODO | `components/ui/stars.tsx` |
| `Container` | TODO | `components/layout/container.tsx` |
| `Breadcrumbs` | TODO | `components/layout/breadcrumbs.tsx` |
| `PortableText` (Sanity-render) | TODO | `components/portable-text.tsx` |
| `Lightbox` (galleria) | TODO | `components/gallery/lightbox.tsx` |

## Ikonit

**Lucide React** (tree-shakable, johdonmukainen, ilmainen). Käytä sparingly — ei ikoneita "kuorrutukseksi".

## Kuvitus

- Suosi aitoja valokuvia (yhdistyksen tapahtumat, hallitus, Lahti)
- Ei stockkuvia
- Hero käyttää joko valokuvaa tai brändisinistä gradienttia
- Kuvat Sanityn Asset CDN:stä, näytetään `next/image`:lla
- AVIF/WebP automaattisesti

## Animaatiot

Pidetty hyvin maltillisina. Vain:
- Linkki-hoverin värimuutos (150 ms)
- Kortin hover-varjo (200 ms)
- Sivu-fade-in (ei pakollinen)

Kunnioita `prefers-reduced-motion`.

## Saavutettavuus

- WCAG 2.1 AA -taso
- Kontrastit: kaikki tekstit ≥ 4.5:1 normaalitekstille
- Näppäimistönavigointi toimii kaikissa interaktiivisissa elementeissä
- Fokus-renkaat näkyvissä (2px `--ring`, 2px offset)
- Aria-labelit ikoninapeissa ja epäselvissä kontrolleissa
- Lomakekentillä `<label>` aina, ei pelkkä placeholder
- Kuvilla `alt` (Sanityssa validointi pakottaa)

## Moodboard / inspiraatio

Tyylillinen suunta:
- **Verkkosivun arkkitehtuuri:** raikas valkoinen + syvä navy, paljon valkoista tilaa
- **Tunnelma:** modernin perinteinen — kuvittele yliopiston, kirjaston tai musiikkitalon sivut, mutta lämpimämpi
- **Vältä:** liian "tech startup" -ulkoasu (Vercel-tyyli on liian neutraali), liian "fancy" (kuvituksia kullalla yms.)

Esimerkkejä joista hakea suuntaa:
- newyorker.com (typografia, hierarchia)
- yhdistysmaailman parhaita: lahdenkonservatorio.fi, kuvataideakatemia.fi (perinne + moderni)
- Sanity.io itse (admin-UX malliesimerkki)
