import styled from "styled-components";

/**
 * Sivuston globals.css on ladattu myös Studioon (juuren layout): sen
 * base-kerroksen otsikkotyylit (serif, yönsininen) ja Tailwindin listojen
 * nollaus näkyisivät ohjeessa. Kerroksettomat säännöt voittavat ne.
 */
export const OhjeJuuri = styled.div`
  h1,
  h2,
  h3,
  h4 {
    color: inherit;
    font-family: inherit;
    text-wrap: pretty;
    scroll-margin-top: 1rem;
  }
  [data-ohje="kortti"] {
    scroll-margin-top: 1rem;
  }
  /* Kapean näytön pikalinkki hakuun ja sisällykseen (kortti näkyy ensin). */
  .vain-kapea {
    display: none;
  }
  @media (max-width: 52rem) {
    .vain-kapea {
      display: block;
    }
  }
`;

/**
 * Ohjekortin HTML:n tyylit Studiossa (docs/25). Värit Sanity UI:n CSS-muuttujista,
 * joten näkymä toimii vaaleassa ja tummassa teemassa. Huomautuslaatikoiden
 * sävyt sekoitetaan läpinäkyviksi (color-mix), joten teksti pysyy luettavana
 * kummassakin teemassa.
 */
export const KortinRunko = styled.div`
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--card-fg-color);
  max-width: 46rem;
  overflow-wrap: anywhere;

  h2,
  h3 {
    color: inherit;
    font-family: inherit;
    font-weight: 700;
  }
  h2 {
    font-size: 1.3rem;
    line-height: 1.3;
    margin: 2rem 0 0.6rem;
  }
  h3 {
    font-size: 1.1rem;
    margin: 1.5rem 0 0.4rem;
  }
  h2:first-child,
  h3:first-child {
    margin-top: 0;
  }
  p {
    margin: 0.6rem 0;
  }
  ol,
  ul {
    padding-left: 1.75rem;
    margin: 0.6rem 0;
  }
  ol {
    list-style: decimal;
  }
  ul {
    list-style: disc;
  }
  li > ul {
    list-style: circle;
  }
  li {
    margin: 0.35rem 0;
  }
  li > ol,
  li > ul {
    margin: 0.25rem 0;
  }
  strong {
    font-weight: 700;
  }
  code {
    font-size: 0.92em;
    padding: 0.05em 0.3em;
    border-radius: 3px;
    background: var(--card-code-bg-color, color-mix(in srgb, var(--card-fg-color) 8%, transparent));
  }
  a {
    color: var(--card-link-color, var(--card-accent-fg-color));
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--card-focus-ring-color, currentColor);
    outline-offset: 2px;
    border-radius: 2px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.8rem 0;
    font-size: 0.98rem;
    display: block;
    overflow-x: auto;
  }
  th,
  td {
    border: 1px solid var(--card-border-color);
    padding: 0.45rem 0.6rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: color-mix(in srgb, var(--card-fg-color) 6%, transparent);
  }

  .ohje-kuvanappi {
    display: block;
    padding: 0;
    margin: 0.8rem 0;
    border: 1px solid var(--card-border-color);
    border-radius: 4px;
    background: none;
    cursor: zoom-in;
    max-width: 100%;
  }
  .ohje-kuva {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 3px;
  }
  /* Kuvaa ei vielä ole (kuvaskripti ajamatta): näytetään kuvaus kehyksessä. */
  .ohje-kuvanappi[data-puuttuu="1"] {
    cursor: default;
    padding: 0.75rem 1rem;
    border-style: dashed;
    color: var(--card-muted-fg-color);
    text-align: left;
    font: inherit;
    font-size: 0.95rem;
  }
  .ohje-kuvanappi[data-puuttuu="1"] img {
    display: none;
  }
  .ohje-kuvanappi[data-puuttuu="1"]::after {
    content: "Kuva tulossa: " attr(data-alt);
  }

  .markdown-alert {
    --savy: #5b6b7b;
    border-left: 4px solid var(--savy);
    background: color-mix(in srgb, var(--savy) 12%, transparent);
    border-radius: 0 4px 4px 0;
    padding: 0.6rem 1rem;
    margin: 1rem 0;
  }
  .markdown-alert > :last-child {
    margin-bottom: 0;
  }
  .markdown-alert-title {
    font-weight: 700;
    margin: 0 0 0.25rem;
  }
  .markdown-alert-tip {
    --savy: #2f9e5a;
  }
  .markdown-alert-note {
    --savy: #2f6fdb;
  }
  .markdown-alert-important {
    --savy: #8a5cf6;
  }
  .markdown-alert-warning,
  .markdown-alert-caution {
    --savy: #d97706;
  }
`;

/** Työkalun asettelu: vasemmalla haku ja sisällys, oikealla kortti. Kapealla näytöllä allekkain. */
export const Asettelu = styled.div`
  display: grid;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  height: 100%;
  min-height: 0;

  & > * {
    min-height: 0;
    overflow-y: auto;
  }

  @media (max-width: 52rem) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto;
    height: auto;
    & > * {
      overflow-y: visible;
    }
    /* Kun kortti on valittu, se näkyy ensin ja sisällys sen jälkeen. */
    &[data-kortti-valittu="1"] > :last-child {
      order: -1;
    }
  }
`;
