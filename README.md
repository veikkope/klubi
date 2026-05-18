# Klubi

A website rebuild for **Lahden Suomalainen Klubi ry**, a Finnish association founded in 2007. The old site is being replaced with a modern structure that the association's secretary can maintain in Sanity Studio without writing code.

**Demo:** [klubi-blond.vercel.app](https://klubi-blond.vercel.app/)

## Context

The association has been active for over fifteen years and accumulated event calendars, football statistics, restaurant reviews and news on its site. Goals for the rebuild:

- preserve the content but make the structure mobile-first
- let the secretary (my dad) update everything without technical help
- 301-redirect every legacy URL to its new home
- meet WCAG 2.1 AA accessibility

## Stack

- **Next.js 16** (App Router, Turbopack) — TypeScript, Tailwind CSS v4
- **Sanity CMS** — Studio embedded at `/studio`, schemas and Studio UI in Finnish
- **Vercel** — hosting and tag-based revalidation
- React 19, `@portabletext/react`, `lucide-react`

## Routes implemented

| Route | Description |
|---|---|
| `/` | Home page, blocks driven by a Sanity singleton |
| `/[...slug]` | Hierarchical content pages (e.g. `/klubi/saannot`) |
| `/yhteystiedot` | Contact info from Sanity singleton |
| `/tapahtumat` | Upcoming + past events, JSON-LD `Event` |
| `/tapahtumat/[slug]/ics` | Calendar export (RFC 5545) |
| `/uutiset` | News list with URL-driven category filter |
| `/uutiset/[slug]` | Related stories, JSON-LD `NewsArticle` |
| `/galleria` | Photo albums |
| `/galleria/[slug]` | Single album with accessible lightbox |
| `/ravintolat` | Filterable restaurant directory (city / cuisine / stars / price) |
| `/ravintolat/[slug]` | Club's review + approved user reviews, JSON-LD `Restaurant` |
| `/studio` | Sanity Studio for the secretary |

## Notable design choices

- **Everything is Sanity-driven** — navigation, home page blocks, contact info, content pages. Nothing is hardcoded into components.
- **Graceful fallbacks** — `lib/defaults.ts` mirrors the `initialValue` of each Sanity singleton, so the site builds and runs even before `sanity init` has been executed. The dev environment doesn't break when the project ID is missing.
- **Catch-all `[...slug]` for the `sivu` type** — one document per path, slugs may contain slashes (`klubi/saannot`). A custom slugify preserves `/`, validation rejects reserved top-level paths. Breadcrumbs are built from ancestor titles in a single GROQ query.
- **Filters as plain `<Link>` elements** — restaurant and news filters work without JavaScript, state lives in the URL. A facets query only shows values that actually have results.
- **DIY lightbox** — focus trap, ESC, arrow keys, body-scroll lock, portal to `document.body`. No external dependency.
- **JSON-LD per content type** — Event, NewsArticle, Restaurant + AggregateRating. Schema.org friendly.

## Local development

```bash
npm install
cp .env.example .env.local   # fill NEXT_PUBLIC_SANITY_PROJECT_ID for real Sanity data
npm run dev                  # http://localhost:3000
```

Commands:

```bash
npm run dev         # dev server (Turbopack)
npm run type-check  # tsc --noEmit
npm run lint        # ESLint
npm run build       # production build
```

## Structure

```
app/(public)/    Public routes (header + footer from a route group layout)
app/studio/      Sanity Studio embedded
components/      UI components, blocks, gallery, shared cards
sanity/          Schemas, GROQ queries, fetch wrapper, env
lib/             Helpers (cn, format, ics, path, defaults, types)
docs/            Planning docs — content audit, IA, design, build plan
```

## Status

Sprint 4 in progress. Still open: football archive (hub + sub-pages + stat tables), stadiums, membership application form (Server Action + email), map for restaurants, final content migration from the legacy site, 301 redirects.

## License

The code is for the association's use. Schemas, components and helpers may be referenced.
