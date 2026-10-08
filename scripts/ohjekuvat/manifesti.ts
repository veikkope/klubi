/**
 * Ylläpito-ohjeen kuvien manifesti (`npm run ohjekuvat`, docs/25).
 *
 * Kirjoittaja TILAA kuvan kortin frontmatterissa (`docs/ohje/**.md`, kenttä
 * `kuvat`: id, nakyma, avaa, merkinnat {numero: kuvaus}, alt). Tämä manifesti
 * kertoo kuvaajalle, MITEN tilaus kuvataan: mitkä elementit numerot
 * merkitsevät, mitä klikataan ennen kuvaa ja miten rajataan.
 *
 * Uuden kuvan lisääminen (yleensä 5–10 riviä):
 *  1. `id` = tilauksen id (sama kuin kuvatiedoston nimi).
 *  2. `avaa` voi jäädä pois: silloin käytetään tilauksen `avaa`-kenttää
 *     (`studio:rakenne/…`, `studio:luo/…`, `studio:muokkaa/…`, `studio:aloitus`).
 *     Tarkempi näkymä: `rakenne("uutiset", ID.julkaistu)` tai `muokkaa(id, tyyppi)`.
 *  3. `merkinnat`: samat numerot kuin tilauksessa; arvo on kohde (tyypit.ts, Kohde)
 *     tai { kohde, kehys, paikka }. Skripti varoittaa, jos numerot eroavat.
 *  4. Tarvitaanko esimerkkidataa? Lisää dokumentti `siemen.ts`:ään
 *     (tunnus `ohjekuva-…`, keksitty data) ja merkitse kuvaan `siemen: true`.
 *  5. `npm run ohjekuvat -- --vain=<id>` ja katso kuva `public/studio-ohje/<id>.webp`.
 *
 * Kohteiden valinta ja toiminnot: tyypit.ts. Hyödyllisiä Sanityn data-testid-arvoja
 * (sanity 5.31.2): studio-navbar, studio-search, document-pane, form-view,
 * pane-header, pane-footer, pane-footer-document-status, action-menu-button
 * (Asiakirjatoiminnot ⋯; myös tekstieditorin muotoiluvalikko), action-intent-button
 * ja multi-action-intent-button (+), document-list-pane, structure-tool-list-pane,
 * field-group-tabs, group-tab-<ryhmä>, field-<polku>, insert-menu-button
 * (tekstieditorin lisäosat ⋯), document-header-Julkaistu-chip, focus-pane-button-focus.
 */
import { SIEMEN_ID as ID } from "./siemen";
import type { Kohde, KuvaMaarite } from "./tyypit";

export type * from "./tyypit";

// ─────────────────────────────── Apurit ───────────────────────────────

const rakenne = (...osat: string[]) => `/studio/structure/${osat.join(";")}`;
const muokkaa = (id: string, tyyppi: string) => `/studio/intent/edit/id=${id};type=${tyyppi}/`;
const luo = (tyyppi: string, pohja?: string) =>
  `/studio/intent/create/${pohja ? `template=${pohja};` : ""}type=${tyyppi}/`;

/** Listan + -painike (Luo uusi asiakirja) paneelissa (oletus viimeinen). */
const plus = (paneeli = -1): Kohde => ({
  css: '[data-testid="action-intent-button"], [data-testid="multi-action-intent-button"]',
  sisalla: { paneeli },
});
/** Listan dokumenttirivi (n = monesko). */
const listanRivi = (n = 0, paneeli = -1): Kohde => ({
  css: '[data-testid="document-list-pane"] a[href]',
  sisalla: { paneeli },
  n,
});
const ALAPALKKI: Kohde = { testid: "pane-footer" };
/** Alapalkin ensisijainen toiminto (Julkaise, Hyväksy ja luo ravintola, Piilota sivulta …). */
const PAATOIMINTO: Kohde = {
  css: 'button[data-testid^="action-"]:not([data-testid="action-menu-button"])',
  sisalla: ALAPALKKI,
};
/** Alapalkin ⋯ (Asiakirjatoiminnot). */
const TOIMINNOT: Kohde = { testid: "action-menu-button", sisalla: ALAPALKKI };
/** Valikon kohta: teksti (osittainen) tai säännöllinen lauseke saavutettavalle nimelle. */
const valikosta = (nimi: string | RegExp): Kohde =>
  typeof nimi === "string" ? { css: `[role="menuitem"]:has-text("${nimi}")` } : { rooli: "menuitem", nimi };
const VALIKKO: Kohde = { css: '[role="menu"]' };
/** Avattu muokkausikkuna: dialogi tai (linkin ym.) ponnahdusikkuna, jossa on kenttiä. */
const IKKUNA: Kohde = { css: '[role="dialog"], [data-testid="popover-edit-dialog"]', n: -1 };
const LOMAKE: Kohde = { testid: "document-pane" };
/** Kentän + Lisää kohde -painike. */
const lisaaKohde = (kentta: string): Kohde => ({ rooli: "button", nimi: /^Lisää kohde/, sisalla: { kentta } });
/** Tekstieditorin lisäosavalikko (⋯ Kuva-painikkeen oikealla). */
const lisaosat = (kentta = "body"): Kohde => ({ testid: "insert-menu-button", sisalla: { kentta } });
/** Tekstieditorin muotoiluvalikko (⋯, Linkki ym. kapealla näytöllä). */
const muotoilut = (kentta = "body"): Kohde => ({
  testid: "action-menu-button",
  sisalla: { testid: "pt-editor__toolbar-card", sisalla: { kentta } },
});
const avaaToiminnot = { klikkaa: TOIMINNOT };
/** Ikkunan kenttä polun lopun perusteella (".label"), kun avain (_key) vaihtelee. */
const ikkunanKentta = (loppu: string): Kohde => ({ kenttaLoppu: loppu, sisalla: IKKUNA });

// ─────────────────────────────── Kuvat ───────────────────────────────

export const KUVAT: KuvaMaarite[] = [
  // ── Alkuun ──
  {
    id: "studion-osat-ja-kirjautuminen-01-yleiskuva",
    kuvaus: "Sisältö-työkalu: yläpalkki, valikko, lomake ja alapalkki",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: { testid: "pane-footer-document-status" },
    merkinnat: {
      3: { kohde: { testid: "tool-collapse-menu" }, kehys: true, paikka: "ala" },
      4: { kohde: { testid: "pane-header", sisalla: { paneeli: 0 } }, paikka: "loppu" },
      5: { kohde: { kentta: "title" }, kehys: true, paikka: "yla" },
      6: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "aloitus-ja-sivuston-tila-01-tila",
    kuvaus: "Aloitus: Sivuston tila",
    avaa: "studio:aloitus",
    valmis: { teksti: /^Varmuuskopio:/ },
    merkinnat: {
      1: { kohde: { tyokalu: "aloitus" }, paikka: "ala" },
      2: { kohde: { teksti: /^(Kaikki kunnossa|Huomioitavaa|Vaatii toimia|Tilaa ei vielä tiedetä)$/ }, kehys: true },
      3: { kohde: { css: '[data-ui="Card"]:has-text("Varmuuskopio:")', n: -1 }, kehys: true },
      7: { kohde: { rooli: "button", nimi: "Päivitä" }, kehys: true },
    },
    rajaus: { kohteet: [{ teksti: /^Yöllinen huolto:/ }], reunus: 16 },
  },
  {
    id: "aloitus-ja-sivuston-tila-02-odottaa",
    kuvaus: "Aloitus: Odottaa sinua ja Täydennä perustiedot",
    avaa: "studio:aloitus",
    valmis: { teksti: "Odottaa sinua" },
    toiminnot: [{ vierita: { teksti: "Odottaa sinua" }, kohdistus: "alku" }],
    merkinnat: {
      5: { kohde: { rooli: "link", nimi: /Julkaisemattomat muutokset/, n: -1 }, kehys: true },
      6: { kohde: { teksti: "Täydennä perustiedot" }, kehys: true },
    },
    rajaus: { kohteet: [{ teksti: "Odottaa sinua" }], reunus: 16 },
  },
  {
    id: "luonnos-julkaisu-ja-peruminen-01-alapalkki",
    kuvaus: "Uutisen alapalkki: tila, Julkaise, ⋯",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: { testid: "pane-footer-document-status" },
    merkinnat: {
      1: { kohde: { testid: "pane-footer-document-status" }, paikka: "yla" },
      3: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
      4: { kohde: TOIMINNOT, paikka: "yla" },
    },
    rajaus: { kohteet: [ALAPALKKI, { kentta: "title" }], reunus: 8 },
  },
  {
    id: "luonnos-julkaisu-ja-peruminen-02-hylkaa",
    kuvaus: "Toimintovalikko auki: Hylkää muutokset",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: { testid: "pane-footer-document-status" },
    toiminnot: [avaaToiminnot, { odota: valikosta("Hylkää muutokset") }],
    merkinnat: { 5: { kohde: valikosta("Hylkää muutokset"), kehys: true } },
    rajaus: { kohteet: [ALAPALKKI, VALIKKO], reunus: 8 },
  },
  {
    id: "luonnos-julkaisu-ja-peruminen-03-historia",
    kuvaus: "Julkaistu valittuna, historia auki, aiempi versio ja Palauta",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: { testid: "pane-footer-document-status" },
    toiminnot: [
      { klikkaa: { testid: "document-header-Julkaistu-chip" } },
      { odota: 1_500 },
      { klikkaa: { testid: "pane-footer-document-status" } },
      { odota: { rooli: "tab", nimi: "Historia" } },
      { klikkaa: { rooli: "tab", nimi: "Historia" } },
      { odota: 2_000 },
      // Historian toinen rivi = aiempi julkaisu.
      { klikkaa: { testid: "timeline-item-button", n: 1 } },
      { odota: { rooli: "button", nimi: "Palauta" } },
    ],
    merkinnat: {
      6: { kohde: { testid: "document-header-Julkaistu-chip" }, kehys: true, paikka: "ala" },
      7: { kohde: { rooli: "tab", nimi: "Historia" }, kehys: true, paikka: "ala" },
      8: { kohde: { testid: "timeline-item-button", n: 1 }, kehys: true },
      9: { kohde: { rooli: "button", nimi: "Palauta" }, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "etsi-haulla-01-ylapalkki",
    kuvaus: "Yläpalkin haku auki, hakusana ja tulokset",
    avaa: rakenne("uutiset"),
    siemen: true,
    valmis: { testid: "studio-search" },
    toiminnot: [{ klikkaa: { testid: "studio-search" } }, { kirjoita: "syysretki" }, { odota: 2_500 }],
    merkinnat: {
      1: { kohde: { testid: "studio-search" }, paikka: "ala" },
      3: { kohde: { css: ':is(a, button, [role="option"], [role="button"]):has-text("Klubin syysretki Tampereelle")', sisalla: { testid: "search-results" }, n: -1 }, kehys: true },
    },
    rajaus: { kohteet: [{ testid: "studio-search" }, { testid: "search-results" }], reunus: 16 },
  },
  {
    id: "etsi-haulla-02-lista",
    kuvaus: "Uutiset-lista ja Etsi listalta",
    avaa: rakenne("uutiset"),
    siemen: true,
    valmis: listanRivi(),
    toiminnot: [{ kirjoita: "syysretki", kohde: { css: 'input[placeholder="Etsi listalta"]', sisalla: { paneeli: -1 } } }, { odota: 2_000 }],
    merkinnat: {
      5: { kohde: { css: 'input[placeholder="Etsi listalta"]', sisalla: { paneeli: -1 } }, kehys: true },
    },
    rajaus: { kohteet: [{ testid: "pane-header", sisalla: { paneeli: -1 } }, listanRivi(0)], reunus: 16 },
  },
  {
    id: "esikatselu-01-kaytetty",
    kuvaus: "Uutisen lomake: Käytetty yhdellä sivulla avattuna",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: { teksti: "Käytetty yhdellä sivulla" },
    toiminnot: [{ klikkaa: { teksti: "Käytetty yhdellä sivulla" } }, { odota: 2_000 }],
    merkinnat: {
      2: { kohde: { teksti: "Käytetty yhdellä sivulla" }, paikka: "vasen" },
      3: { kohde: { css: 'a[href*="presentation"]', sisalla: LOMAKE }, kehys: true },
    },
    rajaus: { kohteet: [{ testid: "document-panel-document-title" }], reunus: 16 },
  },
  {
    id: "esikatselu-02-esikatselu",
    kuvaus: "Esikatselu-työkalu: sivu ja lomake rinnakkain",
    avaa: `/studio/intent/edit/id=${ID.julkaistu};type=uutinen;mode=presentation;presentation=presentation;preview=%2Fuutiset%2Fesimerkki-klubin-syysretki-2026/`,
    siemen: true,
    // Esikatselu tallentaa käynnistyessään esikatselusalaisuuden; ilman sitä työkalu kaatuu.
    // Muut Esikatselun kirjoitukset kuitataan onnistuneiksi kirjoittamatta mitään.
    kirjoittaa: true,
    sallitutKirjoitukset: /tag=sanity.studio.sanity.preview-url-secret/,
    valmis: { css: "iframe" },
    toiminnot: [{ odota: 8_000 }],
    merkinnat: {
      4: { kohde: { css: "iframe" }, paikka: "sisa" },
      5: { kohde: { kentta: "title" }, kehys: true, paikka: "yla" },
      6: { kohde: { tyokalu: "structure" }, paikka: "ala" },
    },
    rajaus: "ikkuna",
  },

  // ── Tekstit ja kuvat ──
  {
    id: "kuva-01-kentta",
    kuvaus: "Kansikuva-kenttä, alt, kuvateksti ja Rajaa kuva",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    korkeus: 1100,
    valmis: { kentta: "title" },
    toiminnot: [{ vierita: { kentta: "coverImage" }, kohdistus: "alku" }, { odota: 1_500 }],
    merkinnat: {
      2: { kohde: { css: "img", sisalla: { kentta: "coverImage" } }, kehys: true },
      3: { kohde: { kentta: "coverImage.alt" }, kehys: true },
      4: { kohde: { kentta: "coverImage.caption" }, kehys: true },
      5: { kohde: { testid: "options-menu-edit-details", sisalla: { kentta: "coverImage" } }, paikka: "vasen" },
    },
    rajaus: { kohteet: [{ kentta: "coverImage" }], reunus: 12 },
  },
  {
    id: "kuva-02-rajaus",
    kuvaus: "Rajaa kuva -ikkuna ja tarkennuspiste",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "title" },
    toiminnot: [
      { vierita: { kentta: "coverImage" }, kohdistus: "alku" },
      { odota: 1_500 },
      { klikkaa: { testid: "options-menu-edit-details", sisalla: { kentta: "coverImage" } } },
      { odota: IKKUNA },
      { odota: 1_500 },
    ],
    merkinnat: {
      6: { kohde: { css: '[data-testid="hotspot-handle-center"], [class*="Hotspot"] [role="slider"], svg ellipse', sisalla: IKKUNA }, paikka: "oikea" },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "linkit-01-tyokalupalkki",
    kuvaus: "Tekstistä maalattu sana ja muotoiluvalikon Linkki",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "body" },
    toiminnot: [
      { vierita: { kentta: "body" }, kohdistus: "alku" },
      { odota: 1_500 },
      { maalaa: "syysretki suuntaa", kohde: { kentta: "body" } },
      { klikkaa: muotoilut() },
      { odota: valikosta(/Linkki/) },
    ],
    merkinnat: {
      1: { kohde: { valinta: true }, paikka: "ala" },
      2: { kohde: valikosta(/Linkki/), kehys: true },
    },
    rajaus: { kohteet: [{ testid: "pt-editor__toolbar-card", sisalla: { kentta: "body" } }], reunus: 16 },
  },
  {
    id: "linkit-02-valinta",
    kuvaus: "Linkin ikkuna: Mihin linkki vie? ja Sivu-kenttä",
    avaa: muokkaa(ID.uutinen, "uutinen"),
    siemen: true,
    korkeus: 1100,
    valmis: { kentta: "body" },
    toiminnot: [
      { vierita: { kentta: "body" }, kohdistus: "alku" },
      { odota: 1_500 },
      { avaaKohta: 'body[_key=="ohjekuva2"].markDefs[_key=="ohjekuva2l"]' },
      { odota: IKKUNA },
    ],
    merkinnat: {
      3: { kohde: ikkunanKentta(".tyyppi"), kehys: true },
      4: { kohde: [{ teksti: "Sivu", sisalla: IKKUNA }, { css: "input", sisalla: IKKUNA, n: -1 }], kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "video-kartta-lomake-01-tyokalupalkki",
    kuvaus: "Lisäosavalikko: YouTube-video ja Kartta, lomake tai Vimeo-video",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "body" },
    toiminnot: [{ vierita: { kentta: "body" }, kohdistus: "alku" }, { odota: 1_000 }, { klikkaa: { css: '[contenteditable="true"]', sisalla: { kentta: "body" } } }, { klikkaa: lisaosat() }, { odota: VALIKKO }],
    merkinnat: {
      2: { kohde: [valikosta("YouTube-video"), valikosta("Kartta, lomake tai Vimeo-video")], kehys: true },
    },
    rajaus: { kohteet: [{ testid: "pt-editor__toolbar-card", sisalla: { kentta: "body" } }, VALIKKO], reunus: 12 },
  },
  {
    id: "video-kartta-lomake-02-upotus",
    kuvaus: "Upotuksen ikkuna täytettynä",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    korkeus: 1100,
    valmis: { kentta: "body" },
    toiminnot: [{ avaaKohta: 'body[_key=="ohjekuva4"]' }, { odota: IKKUNA }],
    merkinnat: {
      5: { kohde: { kentta: 'body[_key=="ohjekuva4"].osoite' }, kehys: true },
      7: { kohde: { kentta: 'body[_key=="ohjekuva4"].otsikko' }, kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "huomiolaatikko-painike-liite-01-tyokalupalkki",
    kuvaus: "Lisäosavalikko: Huomiolaatikko, Painike ja Liite",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "body" },
    toiminnot: [{ vierita: { kentta: "body" }, kohdistus: "alku" }, { odota: 1_000 }, { klikkaa: { css: '[contenteditable="true"]', sisalla: { kentta: "body" } } }, { klikkaa: lisaosat() }, { odota: VALIKKO }],
    merkinnat: {
      2: { kohde: [valikosta("Huomiolaatikko"), valikosta("Painike"), valikosta("Liite (PDF, Word, Excel)")], kehys: true },
    },
    rajaus: { kohteet: [{ testid: "pt-editor__toolbar-card", sisalla: { kentta: "body" } }, VALIKKO], reunus: 12 },
  },
  {
    id: "huomiolaatikko-painike-liite-02-huomio",
    kuvaus: "Huomiolaatikon ikkuna",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    korkeus: 1100,
    valmis: { kentta: "body" },
    toiminnot: [{ avaaKohta: 'body[_key=="ohjekuva3"]' }, { odota: IKKUNA }],
    merkinnat: {
      3: { kohde: { kentta: 'body[_key=="ohjekuva3"].savy' }, kehys: true },
      4: { kohde: { kentta: 'body[_key=="ohjekuva3"].teksti' }, kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "taulukko-tekstissa-01-ikkuna",
    kuvaus: "Tekstin taulukon ikkuna",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    korkeus: 1100,
    valmis: { kentta: "body" },
    toiminnot: [{ avaaKohta: 'body[_key=="ohjekuva5"]' }, { odota: IKKUNA }, { odota: 1_500 }],
    merkinnat: {
      3: { kohde: { kentta: 'body[_key=="ohjekuva5"].otsikko' }, kehys: true },
      4: { kohde: { rooli: "button", nimi: "Tuo Excelistä", sisalla: IKKUNA }, kehys: true, paikka: "yla" },
      6: { kohde: { rooli: "button", nimi: "Lisää rivi", sisalla: IKKUNA }, kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "tekstin-muotoilu-01-tyokalupalkki",
    kuvaus: "Tekstieditorin työkalupalkki, tyylivalikko auki",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "body" },
    toiminnot: [
      { vierita: { kentta: "body" }, kohdistus: "alku" },
      { odota: 1_000 },
      { maalaa: "Klubin", kohde: { kentta: "body" } },
      { klikkaa: { rooli: "button", nimi: /Leipäteksti/, sisalla: { kentta: "body" } } },
      { odota: VALIKKO },
    ],
    merkinnat: {
      2: { kohde: { rooli: "button", nimi: /Leipäteksti/, sisalla: { kentta: "body" } }, kehys: true, paikka: "yla" },
      3: { kohde: [
          { testid: "action-button-strong", sisalla: { kentta: "body" } },
          { testid: "action-button-em", sisalla: { kentta: "body" } },
          { testid: "action-button-underline", sisalla: { kentta: "body" } },
        ], kehys: true, paikka: "yla" },
      4: { kohde: [{ testid: "action-button-bullet", sisalla: { kentta: "body" } }, { testid: "action-button-number", sisalla: { kentta: "body" } }], kehys: true, paikka: "yla" },
    },
    rajaus: { kohteet: [{ testid: "pt-editor__toolbar-card", sisalla: { kentta: "body" } }, VALIKKO], reunus: 16 },
  },

  // ── Uutiset ──
  {
    id: "uutisen-kirjoittaminen-01-lista",
    kuvaus: "Uutiset-lista, + ja pohjavalikko",
    avaa: rakenne("uutiset"),
    valmis: listanRivi(),
    toiminnot: [{ klikkaa: plus() }, { odota: VALIKKO }],
    merkinnat: {
      1: { kohde: { rakenne: "uutiset" }, kehys: true, paikka: "loppu" },
      2: { kohde: plus(), paikka: "vasen" },
      3: { kohde: { css: 'a[href*="type=uutinen"]', sisalla: VALIKKO }, kehys: true },
    },
    rajaus: { kohteet: [{ paneeli: 0 }, { paneeli: 1 }], reunus: 0 },
  },
  {
    id: "uutisen-kirjoittaminen-02-lomake",
    kuvaus: "Uuden uutisen lomake",
    avaa: luo("uutinen"),
    korkeus: 1600,
    valmis: { kentta: "title" },
    merkinnat: {
      4: { kohde: { kentta: "title" }, kehys: true },
      5: { kohde: { kentta: "slug" }, kehys: true },
      6: { kohde: { kentta: "coverImage" }, kehys: true },
      7: { kohde: { kentta: "body" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "ajasta-uutinen-01-julkaisuaika",
    kuvaus: "Julkaisuaika ja kalenteri auki",
    avaa: muokkaa(ID.uutinen, "uutinen"),
    siemen: true,
    valmis: { kentta: "publishedAt" },
    toiminnot: [
      { vierita: { kentta: "publishedAt" }, kohdistus: "alku" },
      { klikkaa: { rooli: "button", nimi: /kalenteri|Valitse päivä|Avaa/i, sisalla: { kentta: "publishedAt" } } },
      { odota: { css: '[data-ui="Popover"]' } },
    ],
    merkinnat: {
      2: { kohde: [{ kentta: "publishedAt" }, { css: '[data-ui="Popover"]' }], kehys: true },
    },
  },
  {
    id: "ajasta-uutinen-02-merkki",
    kuvaus: "Ajastetun uutisen alapalkki",
    avaa: rakenne("tehtavat", "ajastetut", ID.ajastettu),
    siemen: true,
    valmis: { teksti: "Ajastettu", sisalla: ALAPALKKI },
    merkinnat: {
      3: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
      4: { kohde: { teksti: "Ajastettu", sisalla: ALAPALKKI }, paikka: "yla" },
    },
    rajaus: { kohteet: [ALAPALKKI], reunus: 8 },
  },
  {
    id: "valmiit-pohjat-01-valikko",
    kuvaus: "Uutiset-listan pohjavalikko",
    avaa: rakenne("uutiset"),
    valmis: listanRivi(),
    toiminnot: [{ klikkaa: plus() }, { odota: VALIKKO }],
    merkinnat: {
      2: { kohde: plus(), paikka: "vasen" },
      3: {
        kohde: [
          { css: 'a[href*="uutinen-vuosikokous"]', sisalla: VALIKKO },
          { css: 'a[href*="uutinen-palloveikkaus-tilanne"]', sisalla: VALIKKO },
          { css: 'a[href*="uutinen-palloveikkaus-kausi"]', sisalla: VALIKKO },
        ],
        kehys: true,
      },
    },
    rajaus: { kohteet: [{ paneeli: 1 }, VALIKKO], reunus: 0 },
  },
  {
    id: "valmiit-pohjat-02-taytettava",
    kuvaus: "Vuosikokouskutsu-pohjasta tehty lomake",
    avaa: luo("uutinen", "uutinen-vuosikokous"),
    korkeus: 1200,
    valmis: { kentta: "title" },
    merkinnat: {
      // Lyhenteessä ja tekstissä on [täytä: …] -kohdat (lib/pohjat.ts vuosikokousPohja).
      4: { kohde: { kentta: "excerpt" }, kehys: true },
      6: { kohde: { kentta: "slug" }, kehys: true },
    },
    rajaus: { kohteet: [{ kentta: "title" }], reunus: 12 },
  },
  {
    id: "kategoriat-ja-tunnisteet-01-kentat",
    kuvaus: "Kategoriat ja Tunnisteet ehdotuksineen",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    korkeus: 1600,
    valmis: { kentta: "kategoriat" },
    toiminnot: [
      { vierita: { kentta: "kategoriat" }, kohdistus: "alku" },
    ],
    merkinnat: {
      2: { kohde: { kentta: "kategoriat" }, kehys: true },
      3: { kohde: { css: "input", sisalla: { kentta: "tunnisteet" } }, kehys: true },
      // Ehdotuslista avautuu kategorioiden päälle, joten sitä ei kuvata (kortin tilaus).
      5: { kohde: { teksti: /^Suosituimmat:?$/, sisalla: { kentta: "tunnisteet" } }, paikka: "vasen" },
    },
  },
  {
    id: "veikkaus-ja-kommentit-01-valilehti",
    kuvaus: "Välilehti Kommentit ja veikkaus",
    avaa: luo("uutinen", "uutinen-palloveikkaus-kausi"),
    korkeus: 1500,
    valmis: { testid: "group-tab-kommentit" },
    toiminnot: [{ ryhma: "kommentit" }, { odota: 1_500 }],
    merkinnat: {
      2: { kohde: { testid: "group-tab-kommentit" }, kehys: true, paikka: "ala" },
      3: { kohde: { kentta: "kommentointi.kaytossa" }, kehys: true },
      4: { kohde: { kentta: "kommentointi.tyyppi" }, kehys: true },
      5: { kohde: { kentta: "kommentointi.vaihtoehdot" }, kehys: true },
      7: { kohde: { kentta: "kommentointi.sulkeutuu" }, kehys: true },
    },
    rajaus: { kohteet: [{ testid: "group-tab-kommentit" }], reunus: 12 },
  },
  {
    id: "kommenttien-valvonta-01-lista",
    kuvaus: "Kommentit ja veikkaukset: Uusimmat, Uutisittain, Piilotetut",
    avaa: rakenne("kommentit"),
    valmis: { rakenne: "uusimmat" },
    merkinnat: {
      1: { kohde: { rakenne: "kommentit" }, kehys: true, paikka: "loppu" },
      2: { kohde: [{ rakenne: "uusimmat" }, { rakenne: "uutisittain" }, { rakenne: "piilotetut" }], kehys: true },
    },
    rajaus: { kohteet: [{ paneeli: 0 }, { paneeli: 1 }], reunus: 0 },
  },
  {
    id: "kommenttien-valvonta-02-piilota",
    kuvaus: "Avattu kommentti, Piilota sivulta",
    avaa: rakenne("kommentit", "uusimmat", ID.kommentti),
    siemen: true,
    vainSiemen: true,
    valmis: PAATOIMINTO,
    merkinnat: { 4: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" } },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "jakokuva-01-kansikuva",
    kuvaus: "Kansikuva ja Rajaa kuva",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "coverImage" },
    toiminnot: [{ vierita: { kentta: "coverImage" }, kohdistus: "alku" }, { odota: 1_500 }],
    merkinnat: {
      2: { kohde: { kentta: "coverImage" }, kehys: true },
      4: { kohde: { testid: "options-menu-edit-details", sisalla: { kentta: "coverImage" } }, paikka: "vasen" },
    },
  },

  // ── Jalkapalloarkisto ──
  {
    id: "tilastotaulukon-paivitys-01-lista",
    leveys: 1600,
    kuvaus: "Jalkapalloarkisto → Tilastot → Huuhkajat",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-huuhkajat"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "jalkapalloarkisto" }, kehys: true, paikka: "loppu" },
      2: { kohde: [{ rakenne: "tilastot" }, { rakenne: "tilastot-huuhkajat" }], kehys: true, paikka: "ala" },
      3: { kohde: listanRivi(0), kehys: true, paikka: "loppu" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "tilastotaulukon-paivitys-02-editori",
    kuvaus: "Taulukkoeditori: haku, solu ja rivin valikko",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-huuhkajat"),
    korkeus: 1500,
    valmis: listanRivi(),
    toiminnot: [
      { klikkaa: listanRivi(1) },
      { odota: { testid: "group-tab-data" } },
      { ryhma: "data" },
      { odota: { css: 'input[aria-label="Etsi taulukosta"]' } },
      { klikkaa: { rooli: "button", nimi: /^Rivin 2 toiminnot$/ } },
      { odota: VALIKKO },
    ],
    merkinnat: {
      4: { kohde: { testid: "group-tab-data" }, kehys: true, paikka: "yla" },
      5: { kohde: { css: 'input[aria-label="Etsi taulukosta"]' }, kehys: true },
      6: { kohde: { css: "td, [role=gridcell]", sisalla: { kentta: "rows" }, n: 6 }, kehys: true },
      7: { kohde: [{ rooli: "button", nimi: /^Rivin 2 toiminnot$/ }, VALIKKO], kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "tilastotaulukon-paivitys-03-lisatiedot",
    kuvaus: "Lisätiedot, Tiedot päivitetty ja Julkaise",
    avaa: muokkaa(ID.tilasto, "jalkapalloTilasto"),
    siemen: true,
    korkeus: 1100,
    valmis: { testid: "group-tab-data" },
    toiminnot: [{ ryhma: "data" }, { odota: 1_000 }, { vierita: { kentta: "paivitetty" }, kohdistus: "loppu" }],
    merkinnat: {
      8: { kohde: { kentta: "lisatiedot" }, kehys: true },
      9: { kohde: { kentta: "paivitetty" }, kehys: true },
      10: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: { kohteet: [ALAPALKKI], reunus: 0 },
  },
  {
    id: "uusi-tilastotaulukko-01-ryhmat",
    leveys: 1600,
    kuvaus: "Tilastot-ryhmät ja ryhmän lista",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-klubi"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "tilastot" }, kehys: true, paikka: "loppu" },
      2: {
        kohde: ["klubi", "huuhkajat", "karsinnat", "arvokisat", "muut"].map((r) => ({ rakenne: `tilastot-${r}` })),
        kehys: true,
      },
      3: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "uusi-tilastotaulukko-02-tuonti",
    kuvaus: "Tuo taulukko Excelistä -ikkuna",
    avaa: luo("jalkapalloTilasto", "tilasto-klubi"),
    valmis: { testid: "group-tab-data" },
    toiminnot: [{ ryhma: "data" }, { klikkaa: { rooli: "button", nimi: "Tuo Excelistä" } }, { odota: IKKUNA }],
    merkinnat: {
      // Painike jää ikkunan alle: merkintä ikkunan otsikkoon (kortin tilaus).
      6: { kohde: { teksti: "Tuo taulukko Excelistä", sisalla: IKKUNA }, kehys: true },
      7: { kohde: { teksti: /Ensimmäinen rivi on sarakkeiden nimet/, sisalla: IKKUNA }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "huuhkajat-ja-kansojen-liiga-01-perustiedot",
    leveys: 1920,
    kuvaus: "Huuhkajat-taulukko: osio Kansojen liiga",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-huuhkajat", ID.tilasto),
    siemen: true,
    korkeus: 1400,
    valmis: { kentta: "huuhkajatOsio" },
    merkinnat: {
      1: { kohde: plus(-2), paikka: "vasen" },
      4: { kohde: { kentta: "huuhkajatOsio" }, kehys: true },
      5: { kohde: { kentta: "kaudenOttelut" }, kehys: true },
      6: { kohde: { kentta: "jarjestys" }, kehys: true },
    },
    rajaus: { kohteet: [{ testid: "pane-header", sisalla: { paneeli: -2 } }], reunus: 16 },
  },
  {
    id: "karsinnat-01-lista",
    leveys: 1600,
    kuvaus: "Tilastot → Karsinnat",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-karsinnat"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "tilastot-karsinnat" }, kehys: true, paikka: "loppu" },
      2: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "kokoonpano-pelikentalle-01-lohko",
    kuvaus: "Lisätiedot-kentän ⋯-valikko: Kokoonpano pelikentällä",
    // Napsautus tekstikenttään tallentaa tyhjän kappaleen: kirjoitus estetään (Studio luulee onnistuneen).
    kirjoittaa: true,
    avaa: muokkaa(ID.tilasto, "jalkapalloTilasto"),
    siemen: true,
    valmis: { testid: "group-tab-data" },
    toiminnot: [
      { ryhma: "data" },
      { odota: 1_000 },
      { vierita: { kentta: "lisatiedot" } },
      { klikkaa: { css: '[contenteditable="true"]', sisalla: { kentta: "lisatiedot" } } },
      { klikkaa: lisaosat("lisatiedot") },
      { odota: VALIKKO },
    ],
    merkinnat: {
      2: { kohde: { kentta: "lisatiedot" }, kehys: true },
      3: { kohde: valikosta("Kokoonpano pelikentällä"), kehys: true, paikka: "ala" },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "kokoonpano-pelikentalle-02-ikkuna",
    kuvaus: "Kokoonpanon ikkuna",
    avaa: muokkaa(ID.tilasto, "jalkapalloTilasto"),
    siemen: true,
    valmis: { testid: "group-tab-data" },
    toiminnot: [{ ryhma: "data" }, { odota: 1_000 }, { avaaKohta: 'lisatiedot[_key=="ohjekuva2"]' }, { odota: IKKUNA }],
    merkinnat: {
      4: { kohde: { kentta: 'lisatiedot[_key=="ohjekuva2"].otsikko' }, kehys: true },
      5: { kohde: { kentta: 'lisatiedot[_key=="ohjekuva2"].rivit' }, kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "uusi-arvokisa-01-lomake",
    leveys: 1600,
    kuvaus: "Uusi arvokisa",
    avaa: luo("arvokisa"),
    korkeus: 1100,
    valmis: { kentta: "title" },
    merkinnat: {
      1: { kohde: { rakenne: "arvokisat" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "title" }, kehys: true },
      5: { kohde: [{ kentta: "kisatyyppi" }, { kentta: "vuosi" }], kehys: true },
      7: { kohde: { testid: "group-tab-tulokset" }, kehys: true, paikka: "ala" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "pelaaja-01-lomake",
    leveys: 1600,
    kuvaus: "Pelaajan lomake",
    avaa: luo("pelaaja"),
    valmis: { kentta: "name" },
    merkinnat: {
      1: { kohde: { rakenne: "pelaajat" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "name" }, kehys: true },
      6: { kohde: { testid: "group-tab-ura" }, kehys: true, paikka: "ala" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "stadion-01-lomake",
    leveys: 1600,
    kuvaus: "Uusi stadion",
    avaa: luo("stadion"),
    korkeus: 1000,
    valmis: { kentta: "name" },
    merkinnat: {
      1: { kohde: { rakenne: "stadionit" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "name" }, kehys: true },
      5: { kohde: { kentta: "city" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "litmanen-01-lehtileike",
    leveys: 1600,
    kuvaus: "Uusi lehtileike",
    avaa: luo("lehtileike"),
    korkeus: 1000,
    valmis: { kentta: "osio" },
    merkinnat: {
      1: { kohde: { rakenne: "lehtileikkeet" }, kehys: true, paikka: "loppu" },
      4: { kohde: { kentta: "osio" }, kehys: true },
      5: { kohde: { kentta: "julkaistu" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "litmanen-02-patsas",
    kuvaus: "Jari Litmanen, välilehti Patsas",
    avaa: rakenne("jalkapalloarkisto", "pelaajat", "pelaaja-jari-litmanen"),
    korkeus: 1100,
    valmis: { testid: "group-tab-patsas" },
    toiminnot: [{ ryhma: "patsas" }, { odota: 1_500 }, { vierita: { kentta: "patsas.kuvat" } }],
    merkinnat: {
      2: { kohde: { testid: "group-tab-patsas" }, kehys: true, paikka: "ala" },
      3: { kohde: { kentta: "patsas.kuvat" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "jarkytykset-ja-maailman-parhaat-01-muut",
    leveys: 1600,
    kuvaus: "Tilastot → Muut arkiston taulukot",
    avaa: rakenne("jalkapalloarkisto", "tilastot", "tilastot-muut"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "tilastot-muut" }, kehys: true, paikka: "loppu" },
      2: { kohde: { css: 'a[href]:has-text("Maailman paras avaus")', sisalla: { paneeli: -1 } }, kehys: true, paikka: "loppu" },
    },
    rajaus: "ikkuna",
  },

  // ── Ravintolat ──
  {
    id: "klubilaisen-pisteet-01-ravintoloittain",
    leveys: 1920,
    kuvaus: "Ravintoloittain, ravintola valittu ja +",
    avaa: rakenne("ravintolat", "arvosanat", "arvosanat-ravintoloittain", ID.ravintola),
    siemen: true,
    valmis: plus(),
    toiminnot: [
      { kirjoita: "Esimerkki", kohde: { css: 'input[placeholder="Etsi listalta"]', sisalla: { paneeli: -2 } } },
      { odota: 2_000 },
    ],
    merkinnat: {
      1: { kohde: { rakenne: "ravintolat" }, kehys: true, paikka: "loppu" },
      2: { kohde: [{ rakenne: "arvosanat" }, { rakenne: "arvosanat-ravintoloittain" }], kehys: true },
      3: { kohde: { rakenne: ID.ravintola }, kehys: true, paikka: "loppu" },
      4: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "klubilaisen-pisteet-02-lomake",
    kuvaus: "Uusi klubilaisen arvosana",
    avaa: rakenne("ravintolat", "arvosanat", "arvosanat-ravintoloittain", ID.ravintola),
    siemen: true,
    korkeus: 1000,
    valmis: plus(),
    toiminnot: [{ klikkaa: plus() }, { odota: { kentta: "arvioija" } }, { odota: 1_500 }],
    merkinnat: {
      5: { kohde: { kentta: "arvioija" }, kehys: true },
      6: { kohde: [{ kentta: "ratingFood" }, { kentta: "ratingPrice" }, { kentta: "ratingAtmosphere" }], kehys: true },
      7: { kohde: { kentta: "paiva" }, kehys: true },
      8: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "klubilaisen-arvosanan-poisto-01-valikko",
    leveys: 1920,
    kuvaus: "Arvosana auki, Asiakirjatoiminnot ja Poista",
    avaa: rakenne("ravintolat", "arvosanat", "arvosanat-ravintoloittain", ID.ravintola, ID.arvosana),
    siemen: true,
    valmis: TOIMINNOT,
    toiminnot: [avaaToiminnot, { odota: valikosta(/^Poista/) }],
    merkinnat: {
      2: { kohde: { rakenne: ID.arvosana }, kehys: true, paikka: "loppu" },
      3: { kohde: TOIMINNOT, paikka: "vasen" },
      4: { kohde: valikosta(/^Poista/), kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "arvostelun-hyvaksynta-01-jono",
    leveys: 1600,
    kuvaus: "Arvostelut odottavat hyväksyntää ja avattu arvostelu",
    avaa: rakenne("tehtavat", "arvostelut", ID.arvostelu),
    siemen: true,
    vainSiemen: true,
    korkeus: 1100,
    valmis: { kentta: "arvioija" },
    merkinnat: {
      1: { kohde: { rakenne: "arvostelut" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: ID.arvostelu }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "arvioija" }, kehys: true },
      4: { kohde: { kentta: "kuvat" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "arvostelun-hyvaksynta-02-julkaise",
    kuvaus: "Arvostelun alapalkki ja Asiakirjatoiminnot",
    avaa: rakenne("tehtavat", "arvostelut", ID.arvostelu),
    siemen: true,
    vainSiemen: true,
    valmis: TOIMINNOT,
    toiminnot: [avaaToiminnot, { odota: VALIKKO }],
    merkinnat: { 6: { kohde: PAATOIMINTO, kehys: true, paikka: "vasen" } },
    rajaus: { kohteet: [ALAPALKKI, VALIKKO], reunus: 8 },
  },
  {
    id: "uusi-ravintola-arvostelusta-01-ehdotus",
    leveys: 1600,
    kuvaus: "Arvostelu, jossa ehdotettu uusi ravintola",
    avaa: rakenne("tehtavat", "arvostelut", ID.ehdotus),
    siemen: true,
    vainSiemen: true,
    korkeus: 1100,
    valmis: { kentta: "ehdotettuRavintola" },
    merkinnat: {
      1: { kohde: { rakenne: ID.ehdotus }, kehys: true, paikka: "loppu" },
      2: { kohde: { kentta: "ehdotettuRavintola" }, kehys: true },
      4: { kohde: { kentta: "restaurant" }, kehys: true },
      5: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "ravintolan-tiedot-01-valilehdet",
    leveys: 1600,
    kuvaus: "Ravintola ja välilehdet",
    avaa: rakenne("ravintolat", "kaikkiRavintolat", ID.ravintola),
    siemen: true,
    valmis: { testid: "group-tab-perustiedot" },
    merkinnat: {
      1: { kohde: { rakenne: "kaikkiRavintolat" }, kehys: true, paikka: "loppu" },
      2: { kohde: { testid: "group-tab-perustiedot" }, kehys: true, paikka: "yla" },
      4: { kohde: { testid: "group-tab-arvostelu" }, kehys: true, paikka: "ala" },
      5: { kohde: { testid: "group-tab-sijainti" }, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "uusi-kaupunki-01-lomake",
    leveys: 1600,
    kuvaus: "Uusi kaupunki",
    avaa: luo("kaupunki"),
    korkeus: 1000,
    valmis: { kentta: "name" },
    merkinnat: {
      1: { kohde: { rakenne: "kaupungit" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "name" }, kehys: true },
      4: { kohde: { kentta: "slug" }, kehys: true },
      5: { kohde: { kentta: "country" }, kehys: true },
      6: { kohde: { kentta: "maakunta" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "arvostelulomake-klubilaisille-01-klubilaiset",
    leveys: 1600,
    kuvaus: "Klubilaiset ja klubilaisen lomake",
    avaa: rakenne("ravintolat", "klubilaiset", ID.klubilainen),
    siemen: true,
    vainSiemen: true,
    valmis: { kentta: "nimi" },
    merkinnat: {
      4: { kohde: { rakenne: "klubilaiset" }, kehys: true, paikka: "loppu" },
      5: { kohde: { kentta: "nimi" }, kehys: true },
      6: { kohde: { kentta: "lomakkeella" }, kehys: true },
    },
    rajaus: "ikkuna",
  },

  // ── Ottelut, tapahtumat, galleria ──
  {
    id: "ottelun-lisaaminen-01-lomake",
    leveys: 1600,
    kuvaus: "Uusi ottelu ja kotijoukkueen ehdotukset",
    avaa: luo("ottelu"),
    korkeus: 1100,
    valmis: { kentta: "koti" },
    merkinnat: {
      1: { kohde: { rakenne: "ottelut" }, kehys: true, paikka: "loppu" },
      2: { kohde: plus(1), paikka: "vasen" },
      3: { kohde: { kentta: "aika" }, kehys: true },
      // Ehdotukset ovat selaimen omassa listassa (datalist), joka ei näy kuvakaappauksessa.
      4: { kohde: { kentta: "koti" }, kehys: true },
      7: { kohde: [{ kentta: "klubiPaikalla" }, { kentta: "vierasmatka" }], kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "tapahtuman-lisaaminen-01-lomake",
    leveys: 1600,
    kuvaus: "Uusi tapahtuma",
    avaa: luo("tapahtuma"),
    korkeus: 1000,
    valmis: { kentta: "title" },
    merkinnat: {
      1: { kohde: { rakenne: "tapahtumat" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "title" }, kehys: true },
      5: { kohde: { kentta: "startsAt" }, kehys: true },
      9: { kohde: { testid: "group-tab-ilmoittautuminen" }, kehys: true, paikka: "ala" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "galleria-albumi-01-lomake",
    leveys: 1600,
    kuvaus: "Galleria-albumi ja kuvat",
    avaa: rakenne("galleria", ID.albumi),
    siemen: true,
    korkeus: 1500,
    valmis: { kentta: "images" },
    merkinnat: {
      1: { kohde: { rakenne: "galleria" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "title" }, kehys: true },
      6: { kohde: { kentta: "coverImage" }, kehys: true },
      7: { kohde: { kentta: "images" }, kehys: true },
    },
    rajaus: "ikkuna",
  },

  // ── Klubi ──
  {
    id: "esittely-01-lomake",
    leveys: 1600,
    kuvaus: "Klubi → Esittely",
    avaa: rakenne("klubi", "esittely"),
    korkeus: 1300,
    valmis: { kentta: "body" },
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "esittely" }, kehys: true, paikka: "loppu" },
      5: { kohde: { kentta: "body" }, kehys: true },
      6: { kohde: { kentta: "hero" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "hallitus-01-lista",
    leveys: 1600,
    kuvaus: "Klubi → Hallitus → Nykyinen hallitus",
    avaa: rakenne("klubi", "hallitus", "nykyinen"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "hallitus" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "nykyinen" }, kehys: true, paikka: "loppu" },
      7: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "hallitus-02-lomake",
    kuvaus: "Hallituksen jäsenen lomake",
    avaa: rakenne("klubi", "hallitus", "nykyinen"),
    korkeus: 1300,
    valmis: listanRivi(),
    toiminnot: [{ klikkaa: listanRivi(0) }, { odota: { kentta: "order" } }],
    merkinnat: {
      5: { kohde: { kentta: "nykyinen" }, kehys: true },
      8: { kohde: [{ kentta: "name" }, { kentta: "role" }], kehys: true },
      9: { kohde: { kentta: "order" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "palloveikkauksen-sivut-01-lista",
    leveys: 1600,
    kuvaus: "Klubi → Palloveikkaus → Veikkausten alasivut",
    avaa: rakenne("klubi", "palloveikkaus", "veikkausten-alasivut"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "palloveikkaus" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "veikkausten-alasivut" }, kehys: true, paikka: "loppu" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "palloveikkauksen-sivut-02-taulukot",
    kuvaus: "Veikkauksen alasivu: Pääsisältö ja Taulukot",
    avaa: rakenne("klubi", "palloveikkaus", "veikkausten-alasivut"),
    korkeus: 1500,
    valmis: listanRivi(),
    toiminnot: [{ klikkaa: listanRivi(0) }, { odota: { kentta: "tilastot" } }, { vierita: { kentta: "tilastot" }, kohdistus: "loppu" }],
    merkinnat: {
      5: { kohde: { kentta: "body" }, kehys: true },
      6: { kohde: lisaaKohde("tilastot"), kehys: true },
      8: { kohde: { css: '[data-sanity-icon="drag-handle"]', sisalla: { kentta: "tilastot" } }, paikka: "vasen" },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "toiminta-uusi-vuosi-01-lista",
    leveys: 1600,
    kuvaus: "Klubi → Toiminta → Toimintamuodot",
    avaa: rakenne("klubi", "toiminta", "toimintamuodot"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "toiminta" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "toimintamuodot" }, kehys: true, paikka: "loppu" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "toiminta-uusi-vuosi-02-vuosittain",
    kuvaus: "Toimintamuodon välilehti Vuosittain",
    avaa: rakenne("klubi", "toiminta", "toimintamuodot"),
    valmis: listanRivi(),
    toiminnot: [{ klikkaa: listanRivi(0) }, { odota: { testid: "group-tab-vuodet" } }, { ryhma: "vuodet" }, { odota: 1_500 }],
    merkinnat: {
      5: { kohde: { testid: "group-tab-vuodet" }, kehys: true, paikka: "ala" },
      6: { kohde: lisaaKohde("vuodet"), kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "uusi-toimintamuoto-01-lista",
    leveys: 1600,
    kuvaus: "Toimintamuodot ja +",
    avaa: rakenne("klubi", "toiminta", "toimintamuodot"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "toiminta" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "toimintamuodot" }, kehys: true, paikka: "loppu" },
      4: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "uusi-toimintamuoto-02-lomake",
    kuvaus: "Uuden toimintamuodon lomake",
    avaa: luo("klubiToiminta"),
    korkeus: 1300,
    valmis: { kentta: "title" },
    merkinnat: {
      5: { kohde: { kentta: "title" }, kehys: true },
      6: { kohde: { kentta: "slug" }, kehys: true },
      8: { kohde: { kentta: "kuvaus" }, kehys: true },
      9: { kohde: { kentta: "jarjestys" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "yhteystiedot-01-lomake",
    leveys: 1600,
    kuvaus: "Klubi → Yhteystiedot → Osoite, sähköposti ja some",
    avaa: rakenne("klubi", "yhteystiedot", "yhteystiedot"),
    korkeus: 1400,
    valmis: { kentta: "email" },
    merkinnat: {
      1: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "klubi;yhteystiedot" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "yhteystiedot;yhteystiedot" }, kehys: true, paikka: "loppu" },
      5: { kohde: { kentta: "email" }, kehys: true },
      7: { kohde: { kentta: "socials" }, kehys: true },
    },
    rajaus: "ikkuna",
  },

  // ── Sivusto ──
  {
    id: "etusivu-ylaosa-01-lomake",
    leveys: 1600,
    kuvaus: "Sivuston asetukset → Etusivu, Yläosa",
    avaa: rakenne("asetukset", "etusivu"),
    korkeus: 1600,
    valmis: { kentta: "heroNosto" },
    merkinnat: {
      1: { kohde: { rakenne: "asetukset" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "etusivu" }, kehys: true, paikka: "loppu" },
      3: { kohde: { kentta: "heroNosto" }, kehys: true },
      5: { kohde: { kentta: "heroImage" }, kehys: true },
      6: { kohde: { kentta: "heroCtas" }, kehys: true },
    },
    rajaus: "ikkuna",
  },
  {
    id: "etusivun-lohkot-01-lista",
    kuvaus: "Etusivu, välilehti Lohkot",
    avaa: rakenne("asetukset", "etusivu"),
    korkeus: 1200,
    valmis: { testid: "group-tab-blocks" },
    toiminnot: [{ ryhma: "blocks" }, { odota: 1_500 }],
    merkinnat: {
      3: { kohde: { testid: "group-tab-blocks" }, kehys: true, paikka: "yla" },
      4: { kohde: { css: '[data-sanity-icon="drag-handle"]', sisalla: { kentta: "blocks" } }, paikka: "vasen" },
      6: { kohde: lisaaKohde("blocks"), kehys: true },
    },
    rajaus: { kohteet: [{ testid: "group-tab-blocks" }], reunus: 16 },
  },
  {
    id: "etusivun-lohkot-02-lohko",
    kuvaus: "Avattu lohko Otteluohjelma ja tapahtumat",
    avaa: rakenne("asetukset", "etusivu"),
    korkeus: 1100,
    valmis: { testid: "group-tab-blocks" },
    toiminnot: [
      { ryhma: "blocks" },
      { odota: 1_500 },
      { klikkaa: { teksti: /^Otteluohjelma ja tapahtumat/, sisalla: { kentta: "blocks" } } },
      { odota: IKKUNA },
      { odota: 1_000 },
    ],
    merkinnat: {
      5: { kohde: ikkunanKentta(".piilota"), kehys: true },
      7: { kohde: ikkunanKentta(".seurat"), kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "valikko-ja-alatunniste-01-lista",
    leveys: 1600,
    kuvaus: "Sivuston asetukset → Navigaatio",
    avaa: rakenne("asetukset", "navigaatio"),
    korkeus: 1200,
    valmis: { kentta: "items" },
    merkinnat: {
      1: { kohde: { rakenne: "asetukset" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "navigaatio" }, kehys: true, paikka: "loppu" },
      4: { kohde: lisaaKohde("items"), kehys: true },
      7: { kohde: { css: '[data-sanity-icon="drag-handle"]', sisalla: { kentta: "items" } }, paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "valikko-ja-alatunniste-02-kohta",
    kuvaus: "Avattu valikon kohta",
    avaa: rakenne("asetukset", "navigaatio"),
    korkeus: 1100,
    valmis: { kentta: "items" },
    toiminnot: [
      { klikkaa: { teksti: "Jalkapallo", sisalla: { kentta: "items" } } },
      { odota: IKKUNA },
      { odota: 1_000 },
    ],
    merkinnat: {
      5: { kohde: ikkunanKentta(".label"), kehys: true },
      6: { kohde: [ikkunanKentta(".tyyppi"), ikkunanKentta(".kohde")], kehys: true },
      8: { kohde: ikkunanKentta(".children"), kehys: true },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "uusi-sivu-01-lista",
    kuvaus: "Sivut ja +",
    avaa: rakenne("sivut"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "sivut" }, kehys: true, paikka: "loppu" },
      2: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: { kohteet: [{ paneeli: 0 }, { paneeli: 1 }], reunus: 0 },
  },
  {
    id: "uusi-sivu-02-lomake",
    kuvaus: "Uuden sivun lomake",
    avaa: luo("sivu"),
    korkeus: 1400,
    valmis: { kentta: "title" },
    merkinnat: {
      3: { kohde: { kentta: "title" }, kehys: true },
      4: { kohde: { kentta: "slug" }, kehys: true },
      5: { kohde: { kentta: "tiivistelma" }, kehys: true },
      6: { kohde: { kentta: "body" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "osioiden-sivut-01-lomake",
    leveys: 1600,
    kuvaus: "Osioiden sivut → Uutiset ja tapahtumat → Tapahtumat",
    avaa: rakenne("osiosivut", "osiosivut-uutiset", "sivu-tapahtumat"),
    korkeus: 1100,
    valmis: { kentta: "tiivistelma" },
    merkinnat: {
      1: { kohde: { rakenne: "osiosivut" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "osiosivut-uutiset" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "sivu-tapahtumat" }, kehys: true, paikka: "loppu" },
      5: { kohde: { kentta: "tiivistelma" }, kehys: true },
      6: { kohde: { testid: "group-tab-seo" }, kehys: true, paikka: "ala" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "osoitteen-muuttaminen-01-tieto",
    kuvaus: "Osoite sivustolla ja tieto vanhan osoitteen ohjauksesta",
    avaa: muokkaa(ID.julkaistu, "uutinen"),
    siemen: true,
    valmis: { kentta: "slug" },
    toiminnot: [
      { odota: 2_000 },
      { hiiri: { css: '[data-testid="input-validation-icon-info"], [data-sanity-icon="info-outline"]', sisalla: { kentta: "slug" } } },
      { odota: 1_000 },
    ],
    merkinnat: {
      2: { kohde: { kentta: "slug" }, kehys: true },
      3: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "lyhytosoite-01-lista",
    leveys: 1600,
    kuvaus: "Lyhytosoitteet ja ohjaukset",
    avaa: rakenne("asetukset", "ohjaukset", "lyhytosoitteet"),
    siemen: true,
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "asetukset" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "ohjaukset" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "lyhytosoitteet" }, kehys: true, paikka: "loppu" },
      4: { kohde: plus(), paikka: "vasen" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "lyhytosoite-02-lomake",
    kuvaus: "Ohjauksen lomake",
    avaa: rakenne("asetukset", "ohjaukset", "lyhytosoitteet", ID.ohjaus),
    siemen: true,
    korkeus: 1000,
    valmis: { kentta: "lahde" },
    merkinnat: {
      5: { kohde: { kentta: "lahde" }, kehys: true },
      6: { kohde: { kentta: "minne" }, kehys: true },
      7: { kohde: { kentta: "muistiinpano" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },

  // ── Turvaverkko ──
  {
    id: "varmuuskopiot-01-lista",
    kuvaus: "Varmuuskopiot",
    avaa: rakenne("asetukset", "varmuuskopiot"),
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "varmuuskopiot" }, kehys: true, paikka: "loppu" },
      2: { kohde: listanRivi(0), kehys: true, paikka: "loppu" },
    },
    rajaus: { kohteet: [{ paneeli: 1 }, { paneeli: 2 }], reunus: 0 },
  },
  {
    id: "varmuuskopiot-02-lataa",
    kuvaus: "Varmuuskopion Tiedosto-kentän valikko ja Lataa",
    avaa: rakenne("asetukset", "varmuuskopiot"),
    valmis: listanRivi(),
    toiminnot: [
      { klikkaa: listanRivi(0) },
      { odota: { kentta: "tiedosto" } },
      { klikkaa: { testid: "options-menu-button", sisalla: { kentta: "tiedosto" } } },
      { odota: VALIKKO },
    ],
    merkinnat: {
      4: { kohde: [{ testid: "options-menu-button", sisalla: { kentta: "tiedosto" } }, VALIKKO], kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "vanhan-version-palautus-01-valikko",
    kuvaus: "Toimintovalikko: Palauta varmuuskopiosta",
    avaa: rakenne("uutiset", ID.julkaistu),
    siemen: true,
    valmis: TOIMINNOT,
    toiminnot: [avaaToiminnot, { odota: valikosta("Palauta varmuuskopiosta") }],
    merkinnat: {
      2: { kohde: TOIMINNOT, paikka: "oikea" },
      3: { kohde: valikosta("Palauta varmuuskopiosta"), kehys: true },
    },
    rajaus: { kohteet: [ALAPALKKI, VALIKKO], reunus: 8 },
  },
  {
    id: "vanhan-version-palautus-02-ikkuna",
    kuvaus: "Palauta varmuuskopiosta -ikkuna",
    avaa: rakenne("uutiset"),
    valmis: listanRivi(),
    toiminnot: [
      { klikkaa: listanRivi(6) },
      { odota: TOIMINNOT },
      avaaToiminnot,
      { klikkaa: valikosta("Palauta varmuuskopiosta") },
      { odota: IKKUNA },
      { odota: { rooli: "button", nimi: "Palauta", sisalla: IKKUNA } },
    ],
    merkinnat: {
      4: { kohde: { css: '[data-ui="Card"]:has(button:has-text("Palauta"))', sisalla: IKKUNA }, kehys: true },
      5: { kohde: { rooli: "button", nimi: "Palauta", sisalla: IKKUNA }, paikka: "vasen" },
    },
    rajaus: { kohteet: [IKKUNA], reunus: 0 },
  },
  {
    id: "poistetun-palautus-01-valilehti",
    kuvaus: "Varmuuskopion välilehti Palauta poistettu",
    vastaukset: [
      {
        // Developmentista ei ole poistettu mitään kopion jälkeen. Vain kuvaa varten kahden
        // vanhan vuosikokousuutisen tunnus jätetään pois nykyisten tunnusten listasta, jolloin
        // välilehti näyttää ne poistettuina (sanity/components/varmuuskopio/palauta-poistettu.tsx).
        osoite: /\/data\/query\//,
        muokkaa: (json) => {
          const j = json as { result?: unknown };
          const pois = new Set(["uutinen-blogspot-1855832307972177544", "uutinen-blogspot-4294775174365689659"]);
          if (Array.isArray(j.result) && j.result.length > 500 && typeof j.result[0] === "string") {
            j.result = j.result.filter((id) => !pois.has(String(id).replace(/^drafts\./, "")));
          }
          return j;
        },
      },
    ],
    avaa: rakenne("asetukset", "varmuuskopiot"),
    valmis: listanRivi(),
    toiminnot: [
      { klikkaa: listanRivi(1) },
      { odota: { rooli: "tab", nimi: "Palauta poistettu" } },
      { klikkaa: { rooli: "tab", nimi: "Palauta poistettu" } },
      { odota: { css: 'input[placeholder^="Hae nimellä"]' } },
      { kirjoita: "vuosikokous", kohde: { css: 'input[placeholder^="Hae nimellä"]' } },
      { odota: 2_000 },
    ],
    merkinnat: {
      3: { kohde: { rooli: "tab", nimi: "Palauta poistettu" }, kehys: true, paikka: "ala" },
      4: { kohde: { css: 'input[placeholder^="Hae nimellä"]' }, kehys: true },
      5: { kohde: { rooli: "button", nimi: "Palauta", sisalla: LOMAKE }, paikka: "vasen" },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "tarkistettavat-01-lista",
    leveys: 1600,
    kuvaus: "Tarkistettavat tyypeittäin",
    avaa: rakenne("tarkistettavat", "uutiset"),
    siemen: true,
    valmis: listanRivi(),
    merkinnat: {
      1: { kohde: { rakenne: "tarkistettavat" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "tarkistettavat;uutiset" }, kehys: true, paikka: "loppu" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "tarkistettavat-02-lomake",
    kuvaus: "Tarkistettava uutinen: Vaatii tarkistuksen ja Mitä tarkistaa",
    avaa: muokkaa(ID.tarkistettava, "uutinen"),
    siemen: true,
    valmis: { kentta: "title" },
    toiminnot: [{ ryhma: "all-fields" }, { odota: 1_000 }, { vierita: { kentta: "tarkistettavaa" } }],
    merkinnat: {
      3: { kohde: { kentta: "tarkistettavaa" }, kehys: true },
      5: { kohde: { kentta: "needsReview" }, kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "tayta-itse-01-yhteystiedot",
    kuvaus: "Yhteystiedot-lomake",
    avaa: rakenne("klubi", "yhteystiedot", "yhteystiedot"),
    korkeus: 1500,
    valmis: { kentta: "email" },
    merkinnat: {
      2: { kohde: [{ kentta: "address" }, { kentta: "city" }], kehys: true },
      3: { kohde: [{ kentta: "email" }, { kentta: "phone" }], kehys: true },
      4: { kohde: [{ kentta: "yTunnus" }, { kentta: "socials" }], kehys: true },
    },
    rajaus: { kohteet: [LOMAKE], reunus: 0 },
  },
  {
    id: "tietosuojapyynto-01-poista",
    kuvaus: "Kommentti auki ja Poista pysyvästi",
    avaa: rakenne("kommentit", "uusimmat", ID.kommentti),
    siemen: true,
    vainSiemen: true,
    valmis: TOIMINNOT,
    toiminnot: [avaaToiminnot, { odota: valikosta("Poista pysyvästi") }],
    merkinnat: {
      1: { kohde: { testid: "studio-search" }, paikka: "ala" },
      3: { kohde: TOIMINNOT, paikka: "yla" },
      4: { kohde: valikosta("Poista pysyvästi"), kehys: true },
    },
    rajaus: "ikkuna",
  },

  // ── Vianetsintä ja hakuteos ──
  {
    id: "julkaise-ei-onnistu-01-virhe",
    kuvaus: "Validointi-paneeli ja harmaa Julkaise",
    avaa: muokkaa(ID.virhe, "uutinen"),
    siemen: true,
    valmis: { testid: "pane-footer-document-status" },
    toiminnot: [
      { klikkaa: { rooli: "button", nimi: /Validointi|Näytä validointi/, sisalla: LOMAKE } },
      { odota: 2_000 },
    ],
    merkinnat: {
      1: { kohde: { rooli: "button", nimi: /Validointi|Näytä validointi/, sisalla: LOMAKE }, paikka: "ala" },
      // Validointi-paneelin rivi (Otsikko: Vaadittu).
      2: { kohde: { css: '[data-ui="Card"]:has-text("Vaadittu")', n: -1 }, kehys: true },
      4: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: "ikkuna",
  },
  {
    id: "aloituksessa-punainen-rivi-01-tila",
    kuvaus: "Aloitus: punainen rivi (huolto ei ole käynyt; vastaus muokattu vain kuvaa varten)",
    avaa: "studio:aloitus",
    vastaukset: [
      {
        // Aloituksen kysely (sanity/lib/tehtavat.ts ALOITUS_KYSELY): huolto kävi viimeksi 3 vrk sitten.
        osoite: /\/data\/query\/[^?]+\?.*huoltoId/,
        muokkaa: (json) => {
          const j = json as { result?: Record<string, unknown> };
          if (j.result) j.result.huolto = { aika: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(), onnistui: true, tulokset: [] };
          return j;
        },
      },
    ],
    valmis: { teksti: /^Yöllinen huolto:/ },
    merkinnat: {
      2: { kohde: { rooli: "button", nimi: "Päivitä" }, kehys: true },
      3: { kohde: { css: '[data-ui="Card"]:has-text("Yöllinen huolto:")', n: -1 }, kehys: true },
    },
    rajaus: { kohteet: [{ teksti: "Sivuston tila" }, { teksti: /^Otteluohjelman haku:/ }], reunus: 16 },
  },
  {
    id: "valikon-kartta-01-valikko",
    kuvaus: "Sisältö-näkymän vasen valikko",
    avaa: "/studio/structure",
    valmis: { rakenne: "uutiset" },
    merkinnat: {
      1: { kohde: { rakenne: "tehtavat" }, kehys: true, paikka: "loppu" },
      2: { kohde: { rakenne: "asetukset" }, kehys: true, paikka: "loppu" },
      3: { kohde: { rakenne: "uutiset" }, kehys: true, paikka: "loppu" },
      4: { kohde: { rakenne: "klubi" }, kehys: true, paikka: "loppu" },
      5: { kohde: { rakenne: "ravintolat" }, kehys: true, paikka: "loppu" },
    },
    rajaus: { kohteet: [{ paneeli: 0 }], reunus: 0 },
  },
  {
    id: "tilamerkit-01-alapalkki",
    kuvaus: "Ajastetun uutisen alapalkki: merkki Ajastettu ja Julkaise",
    avaa: rakenne("tehtavat", "ajastetut", ID.ajastettu),
    siemen: true,
    valmis: { teksti: "Ajastettu", sisalla: ALAPALKKI },
    merkinnat: {
      1: { kohde: { teksti: "Ajastettu", sisalla: ALAPALKKI }, paikka: "yla" },
      2: { kohde: PAATOIMINTO, kehys: true, paikka: "yla" },
    },
    rajaus: { kohteet: [ALAPALKKI], reunus: 8 },
  },
];
