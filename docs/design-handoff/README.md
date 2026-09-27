# Handoff: Lahden Suomalainen Klubi ry – verkkosivujen ilme

## Overview
Website for Lahden Suomalainen Klubi ry. Main topic: **Finnish football culture** (match reports, fixtures, supporter culture, club trips). Secondary topic: **restaurant reviews**, mostly places to eat on match days. The site also lists the club's own events. Audience: club members, football fans, food lovers. New content about once a month, so the front page introduces the club first and only then shows articles.

**Source of truth for pages: `Sivut v3.dc.html`.** `Tyyliopas.dc.html` defines the tokens; its example page is outdated. Do not build any "join" CTA or newsletter signup.

## About the Design Files
`Sivut v3.dc.html`, `Tyyliopas.dc.html` and `Logoversiot.dc.html` are **design references made in HTML**, not production code. Rebuild them in the target codebase using its existing framework and patterns. If there is no codebase yet, choose a fitting stack (e.g. Astro or Next.js + CSS variables). Open the HTML files in a browser to see them.

## Fidelity
**High-fidelity.** Colors, fonts, sizes and spacing are final.

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| `--blue` (Klubinsininen) | `#1A2CD8` | Primary: buttons, links, logo, accents |
| `--navy` (Yönsininen) | `#141F4D` | Headings, footer, dark sections, hover state of primary |
| `--blue-tint` | `#E6E9FB` | Tags, highlight backgrounds, focus ring, secondary button hover |
| `--paper` | `#F7F6F2` | Page background |
| `--surface` | `#FFFFFF` | Cards, header |
| `--ink` | `#1B1D26` | Body text |
| `--ink-muted` | `#4A4D5C` | Secondary text |
| `--ink-subtle` | `#6B6E7C` | Captions, meta |
| `--line` | `#ECEBE5` | Dividers |
| `--input-border` | `#C9C8C0` | Form field borders |
| `--brass` | `#B8862E` | **Food category color**: restaurant reviews, rating dots, festive club events. Text variant `#8A6420`, tint `#F3EAD8` with text `#5C4315` |
| `--on-navy-muted` | `#D4D8F0` | Body text on navy |
| `--on-navy-eyebrow` | `#AEB6F2` | Eyebrow text on navy |

Approximate area ratio: 60% light background, 20% navy, 12% blue, the rest as accents.

### Typography (Google Fonts)
- Headings: **Source Serif 4**, weight 600, color navy
- Body/UI: **Public Sans**, weights 400/500/600
- Mono (optional, meta): IBM Plex Mono

| Style | Font | Size / line-height |
|---|---|---|
| H1 | Source Serif 4 600 | 48px / 1.1 |
| H2 | Source Serif 4 600 | 32px / 1.2 |
| H3 | Source Serif 4 600 | 22px / 1.3 |
| Body | Public Sans 400 | 18px / 1.6 |
| Small | Public Sans 400 | 14px / 1.5, `--ink-muted` |
| Eyebrow | Public Sans 600 | 13px, uppercase, letter-spacing .12em, `--blue` |

### Spacing, radius, shadow
- Spacing scale: 8 / 16 / 24 / 40 / 72 px
- Radius: 4px (buttons, inputs, cards), 6px (larger panels)
- Shadow (large panels only): `0 1px 3px rgba(20,31,77,.08), 0 12px 40px rgba(20,31,77,.08)`

## Components
- **Primary button**: bg `--blue`, white text, Public Sans 600 16px, padding 14px 26px, radius 4px. Hover: bg `--navy`.
- **Secondary button**: transparent, 1px `--navy` border, navy text, padding 13px 25px. Hover: bg `--blue-tint`.
- **On navy**: primary = white bg + navy text; secondary = 1px white border + white text.
- **Text link**: `--blue`, 600, underline with offset 4px. Hover: `--navy`.
- **Tag**: bg `--blue-tint`, navy text, 13px 600, padding 5px 10px, radius 3px.
- **Input**: 16px, padding 12px 14px, 1px `--input-border`, radius 4px. Focus: border `--blue` + `box-shadow: 0 0 0 3px #E6E9FB`. Label 14px 500 above, gap 6px.
- **Event card**: white bg, radius 4px, padding 24px, 3px top border `--blue` (`--brass` for festive events). Content: date line (14px 600 blue), title (H3), location (15px muted).

## Screens / Views (see Sivut v3.dc.html)
Desktop artboards 1440px wide (content padding 80px), mobile artboards 390px (padding 20px). Section vertical padding: 96px desktop / 44px mobile. Sections alternate between `--paper` and `--surface` backgrounds, with navy used for the hero and footer.

**Header (all pages):** white, padding 22px 80px, bottom border `--line`. Logo: mark 50px + wordmark 25px, gap 14px. Nav 16px 500, gap 40px: Jalkapallo · Ottelut · Ravintola-arviot · Tapahtumat · Klubista. Active item: blue text + 2px blue underline. No CTA button. Mobile: logo 38px/17px + 44px hamburger.

### 1. Etusivu (front page), in order
1. **Hero (navy):** 2 columns (1.15fr / 1fr, gap 80px), padding 112px 80px 96px. Eyebrow, H1 "Suomalaisen jalkapallon ystävien klubi" (Source Serif 66px/1.04), lead 20px/1.65 `--on-navy-muted`, two underlined text links ("Tulevat ottelut →", "Lue klubista →"). Right column: 4:5 photo of club members in the stands.
2. **Fixtures + club events:** 2 columns (1.5fr / 1fr, gap 64px).
   - *Tulevat ottelut*: white list, rows use a grid of 110px | 1fr | 170px, padding 22px 28px, divided by `--line`. Columns: date (600) + time (14px subtle), match name (serif 22px) + competition · venue (14px), badge. Badges: "Klubi paikalla" (solid blue, white text) and "Vierasmatka" (1px blue outline). Fixtures come from a data source covering all of Finland (Veikkausliiga, cups, national team).
   - *Klubin tapahtumat*: cards with a 60px date column (serif day number 34px + uppercase month 12px) and title + one-line description. 3px top border, blue by default, brass for festive events.
3. **Kentältä ja katsomosta (football articles):** white background. A featured article (16:10 image, category + month, serif 40px title, 18px excerpt) next to a list of 3 articles (serif 25px titles). Categories: Otteluraportti, Kannattajakulttuuri.
4. **Ravintola-arviot:** 3 cards (4:3 image, 3px brass top border, 5 rating dots, city · price level, serif 24px name, one-line verdict, optional blue-tint tag such as "15 min stadionille" / "Vierasmatka").
5. **Klubista:** 2 columns: photo + eyebrow, serif 40px heading, paragraph, link.
6. **Footer (navy):** white logo, link columns (Jalkapallo / Klubi / Yhteystiedot), copyright row.

Mobile: same order, single column. Fixtures become stacked rows, reviews become horizontal cards with an 80px thumbnail.

### 2. Ravintola-arvio (restaurant review article)
Breadcrumb, eyebrow, H1 (serif 60px), author row, 21:9 hero image. Then 2 columns (1fr | 380px sticky sidebar, gap 88px):
- Article body 19px/1.75, max 700px. Lead paragraph in serif 24px. Pull quote: serif italic 28px with a 3px brass left border. 2-image grid. An "Ottelupäivänä" box (white, blue top border) with match-day tips.
- Sidebar card (brass 4px top border, shadow): overall score (serif 56px "4" / 5), sub-scores Ruoka / Palvelu / Tunnelma / Hinta-laatu as 5 dots (filled = brass, empty = 1.5px brass outline). Then address, price level, "Sopii" tags, and an outline button linking to the restaurant's website.
- "Lisää arvioita": 3 cards. Mobile: score card goes above the body text.

### Rating dots
Circles 9–12px, gap 4–5px. Filled = `#B8862E`; empty = transparent with a 1.5px `#B8862E` border. Data model: overall 1–5 plus the four sub-scores (1–5).

### Suggested content model
- Article: title, category (otteluraportti | kannattajakulttuuri), date, image, excerpt, body
- Review: restaurant name, city, price level (€–€€€), overall score + 4 sub-scores, tags, near-stadium note, address, website
- Match: date, time, home, away, competition, venue, clubAttending (bool), awayTrip (bool)
- Event: date, title, description, festive (bool)

## Principles
- Use blue only for clickable things and the logo.
- Serif for headings only; body text always sans.
- Clear space around the logo ≥ half the mark's width. Use the white version on dark backgrounds.
- Category color coding: blue = football, brass = food/restaurants. Use it on eyebrows, card top borders and tags.

## Assets (`assets/`)
Transparent PNGs cropped from the original logo:
- `mark-{blue,navy,black,white}.png` – wave mark only (~502×562)
- `wordmark-{blue,navy,black,white}.png` – "Lahden SUOMALAINEN KLUBI ry" text (~1022×161)
- Favicon: blue mark centered on a white rounded square (the mark should be ~75% of the square's height). Generate 16/32/180/512 px from `mark-blue.png`.
- Recommend vectorizing the mark to SVG later for sharpness.

## Files
- `Sivut v3.dc.html` – **final pages**: front page + restaurant review, desktop and mobile
- `Tyyliopas.dc.html` – style guide (tokens and components; its example page is outdated)
- `Logoversiot.dc.html` – logo versions and usage
