/**
 * Ohjeen kuvien merkinnät: numeroympyrät ja kehykset (docs/25-liite-analyysi.md
 * §4 Kuvakäytännöt), rajaus ja kuvausta häiritsevien osien piilotus.
 *
 * Merkinnät piirretään sivulle kerroksena `#ohje-merkinnat` (position: fixed,
 * pointer-events: none) juuri ennen kuvaa ja poistetaan heti sen jälkeen.
 * Paikat lasketaan elementtien getBoundingClientRectistä (Playwright
 * boundingBox), ei kovakoodatuista pikseleistä.
 */
import type { Page } from "playwright";

import type { Paikka } from "./manifesti";

/**
 * Yksi korostusväri: tumma oranssi. Ei esiinny Studion teemassa (Sanityn
 * sävyt: sininen, punainen #f03e2f, keltainen, vihreä), ja harmaasävyinä se
 * on tumma (luminanssi n. 0,16), joten valkoinen numero ja vaalea Studio
 * erottuvat myös mustavalkotulosteessa.
 */
export const MERKINTA_VARI = "#C2410C";
/** Numeroympyrän halkaisija (CSS px, sisältää valkoisen reunuksen). */
export const YMPYRA = 30;
/** Väli kohteen (tai kehyksen) ja ympyrän välillä. */
const VALI = 6;
/** Kehyksen etäisyys kohteesta ja paksuus. */
const KEHYS_ULOS = 4;
const KEHYS_PAKSUUS = 3;

export interface Laatikko {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SijoitettavaMerkinta {
  numero: number;
  laatikko: Laatikko;
  kehys: boolean;
  /** Yhdistetyn kohteen osat: kehys jokaiselle, numero ensimmäisen viereen. */
  osat?: Laatikko[];
  paikka?: Paikka;
}

export interface SijoitettuMerkinta {
  numero: number;
  /** Ympyrän keskipiste. */
  cx: number;
  cy: number;
  /** Kehyksen alue (jos kehys). */
  kehys?: Laatikko;
  /** Yhdistetyn kohteen muiden osien kehykset. */
  lisakehykset?: Laatikko[];
  /** Kohteen alue. */
  laatikko: Laatikko;
  /** Ympyrä ei mahtunut sallitulle alueelle. */
  ahdas: boolean;
}

export const laajenna = (l: Laatikko, d: number): Laatikko => ({
  x: l.x - d,
  y: l.y - d,
  width: l.width + 2 * d,
  height: l.height + 2 * d,
});

export function yhdiste(laatikot: Laatikko[]): Laatikko | undefined {
  if (laatikot.length === 0) return undefined;
  const x1 = Math.min(...laatikot.map((l) => l.x));
  const y1 = Math.min(...laatikot.map((l) => l.y));
  const x2 = Math.max(...laatikot.map((l) => l.x + l.width));
  const y2 = Math.max(...laatikot.map((l) => l.y + l.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export function leikkaa(a: Laatikko, b: Laatikko): Laatikko | undefined {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  return x2 > x1 && y2 > y1 ? { x: x1, y: y1, width: x2 - x1, height: y2 - y1 } : undefined;
}

/** Onko `sisa` kokonaan `ulko`-alueen sisällä (pieni toleranssi). */
export const sisalla = (sisa: Laatikko, ulko: Laatikko, tol = 0.5) =>
  sisa.x >= ulko.x - tol &&
  sisa.y >= ulko.y - tol &&
  sisa.x + sisa.width <= ulko.x + ulko.width + tol &&
  sisa.y + sisa.height <= ulko.y + ulko.height + tol;

export const ympyranAlue = (m: { cx: number; cy: number }): Laatikko => ({
  x: m.cx - YMPYRA / 2,
  y: m.cy - YMPYRA / 2,
  width: YMPYRA,
  height: YMPYRA,
});

const OLETUSJARJESTYS: Paikka[] = ["vasen", "yla", "oikea", "ala", "sisa"];

function ehdokas(paikka: Paikka, b: Laatikko): { cx: number; cy: number } {
  const r = YMPYRA / 2;
  // Leveissä kohteissa (kentät) ympyrä vasempaan reunaan, kapeissa keskelle.
  const vaakaKeski = b.width > 4 * YMPYRA ? b.x + r : b.x + b.width / 2;
  switch (paikka) {
    case "vasen":
      return { cx: b.x - VALI - r, cy: b.y + b.height / 2 };
    case "oikea":
      return { cx: b.x + b.width + VALI + r, cy: b.y + b.height / 2 };
    case "yla":
      return { cx: vaakaKeski, cy: b.y - VALI - r };
    case "ala":
      return { cx: vaakaKeski, cy: b.y + b.height + VALI + r };
    case "sisa":
      return { cx: b.x + r + 4, cy: b.y + r + 4 };
    case "loppu":
      return { cx: b.x + b.width - r - 8, cy: b.y + b.height / 2 };
  }
}

/** Yhdistää laatikot, jotka ovat alle 14 px:n päässä toisistaan (ketjuna). */
function ryhmita(laatikot: Laatikko[]): Laatikko[] {
  const ryhmat = laatikot.map((l) => ({ ...l }));
  for (let muuttui = true; muuttui; ) {
    muuttui = false;
    for (let i = 0; i < ryhmat.length && !muuttui; i++) {
      for (let j = i + 1; j < ryhmat.length && !muuttui; j++) {
        if (leikkaa(laajenna(ryhmat[i], 7), laajenna(ryhmat[j], 7))) {
          ryhmat[i] = yhdiste([ryhmat[i], ryhmat[j]]) as Laatikko;
          ryhmat.splice(j, 1);
          muuttui = true;
        }
      }
    }
  }
  return ryhmat;
}

/**
 * Sijoittaa numeroympyrät: ensimmäinen ehdokaspaikka, joka on kokonaan
 * sallitulla alueella eikä peitä toista ympyrää tai toisen merkinnän kohdetta.
 * Manifestin `paikka` kokeillaan ensin.
 */
export function sijoitaNumerot(merkinnat: SijoitettavaMerkinta[], alue: Laatikko): SijoitettuMerkinta[] {
  const varatut: Laatikko[] = [];
  const tulos: SijoitettuMerkinta[] = [];
  for (const m of merkinnat) {
    // Vierekkäiset osat (valikon peräkkäiset kohdat) yhdeksi kehykseksi, erilliset omikseen.
    const ryhmat = m.kehys && m.osat?.length ? ryhmita(m.osat) : undefined;
    const ensimmainen = ryhmat ? ryhmat[0] : m.laatikko;
    const kehys = m.kehys ? laajenna(ensimmainen, KEHYS_ULOS + KEHYS_PAKSUUS) : undefined;
    const lisakehykset = ryhmat?.slice(1).map((o) => laajenna(o, KEHYS_ULOS + KEHYS_PAKSUUS));
    const perusta = kehys ?? m.laatikko;
    const muutKohteet = merkinnat.filter((o) => o !== m).map((o) => o.laatikko);
    const jarjestys = m.paikka ? [m.paikka, ...OLETUSJARJESTYS.filter((p) => p !== m.paikka)] : OLETUSJARJESTYS;
    let valittu: { cx: number; cy: number } | undefined;
    for (const paikka of jarjestys) {
      const e = ehdokas(paikka, perusta);
      const a = ympyranAlue(e);
      if (!sisalla(a, alue)) continue;
      if (varatut.some((v) => leikkaa(v, laajenna(a, 2)))) continue;
      if (paikka !== "sisa" && paikka !== "loppu" && muutKohteet.some((k) => leikkaa(k, a))) continue;
      valittu = e;
      break;
    }
    const ahdas = !valittu;
    const lopullinen = valittu ?? ehdokas("sisa", perusta);
    varatut.push(ympyranAlue(lopullinen));
    tulos.push({ numero: m.numero, ...lopullinen, kehys, lisakehykset, laatikko: m.laatikko, ahdas });
  }
  return tulos;
}

/** Rajauksen pikselirajat: kokonaisluvuiksi ja ikkunan sisään. */
export function rajaaIkkunaan(l: Laatikko, ikkuna: { width: number; height: number }): Laatikko {
  const x = Math.max(0, Math.floor(l.x));
  const y = Math.max(0, Math.floor(l.y));
  const x2 = Math.min(ikkuna.width, Math.ceil(l.x + l.width));
  const y2 = Math.min(ikkuna.height, Math.ceil(l.y + l.height));
  return { x, y, width: Math.max(1, x2 - x), height: Math.max(1, y2 - y) };
}

/** Kasvattaa aluetta keskeltä vähimmäiskokoon. */
export function vahintaan(l: Laatikko, leveys: number, korkeus: number): Laatikko {
  const w = Math.max(l.width, leveys);
  const h = Math.max(l.height, korkeus);
  return { x: l.x - (w - l.width) / 2, y: l.y - (h - l.height) / 2, width: w, height: h };
}

// ─────────────────────────────── Sivulla ───────────────────────────────

/**
 * Kuvausta häiritsevät osat pois: animaatiot ja siirtymät, kursori,
 * vierityspalkit, Next.js:n kehitystyökalu, ilmoitukset (toastit),
 * läsnäolon avatarit ja käyttäjien profiilikuvat.
 */
export const PIILOTUS_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important; animation-delay: 0s !important;
  transition-duration: 0s !important; transition-delay: 0s !important;
  caret-color: transparent !important; scroll-behavior: auto !important;
}
* { scrollbar-width: none !important; }
::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
nextjs-portal { display: none !important; }
[data-ui="ToastProvider"], [data-ui="Toast"] { display: none !important; }
[data-testid="document-level-presence"] { visibility: hidden !important; }
[data-ui="Avatar"] img { visibility: hidden !important; }
`;

/**
 * Dokumenttilistoista vain siemenen rivit (`ohjekuva-*`): muut rivit tyhjiksi, kun
 * listassa olisi oikeiden ihmisten nimiä (kommentit, arvostelut).
 */
export const VAIN_SIEMEN_CSS = `
[data-testid="document-list-pane"] a[href]:not([href*="ohjekuva-"]) { visibility: hidden !important; }
`;

/** Piirtää merkinnät kerrokseen #ohje-merkinnat. */
export async function piirraMerkinnat(page: Page, merkinnat: SijoitettuMerkinta[]): Promise<void> {
  await page.evaluate(
    ([lista, vari, koko, paksuus]) => {
      document.getElementById("ohje-merkinnat")?.remove();
      const kerros = document.createElement("div");
      kerros.id = "ohje-merkinnat";
      kerros.setAttribute("aria-hidden", "true");
      Object.assign(kerros.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "2147483647",
      });
      for (const m of lista) {
        for (const alue of m.kehys ? [m.kehys, ...(m.lisakehykset ?? [])] : []) {
          const k = document.createElement("div");
          Object.assign(k.style, {
            position: "absolute",
            left: `${alue.x}px`,
            top: `${alue.y}px`,
            width: `${alue.width}px`,
            height: `${alue.height}px`,
            boxSizing: "border-box",
            border: `${paksuus}px solid ${vari}`,
            borderRadius: "8px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.9)",
          });
          kerros.appendChild(k);
        }
        const y = document.createElement("div");
        y.textContent = String(m.numero);
        Object.assign(y.style, {
          position: "absolute",
          left: `${m.cx - koko / 2}px`,
          top: `${m.cy - koko / 2}px`,
          width: `${koko}px`,
          height: `${koko}px`,
          boxSizing: "border-box",
          borderRadius: "50%",
          background: vari,
          color: "#fff",
          border: "2px solid #fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: `700 16px/1 Inter, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif`,
          fontVariantNumeric: "tabular-nums",
        });
        kerros.appendChild(y);
      }
      document.body.appendChild(kerros);
    },
    [merkinnat, MERKINTA_VARI, YMPYRA, KEHYS_PAKSUUS] as const,
  );
}

export async function poistaMerkinnat(page: Page): Promise<void> {
  await page.evaluate(() => document.getElementById("ohje-merkinnat")?.remove()).catch(() => undefined);
}

/**
 * Rajauksen alueella näkyvä teksti (tekstisolmut, kenttien arvot, kuvien
 * alt-tekstit ja title-attribuutit) henkilötietojen tarkistukseen.
 */
export async function nakyvaTeksti(page: Page, alue: Laatikko): Promise<string> {
  return page.evaluate((a) => {
    const leikkaa = (r: DOMRect) =>
      r.width > 0 && r.height > 0 && r.right > a.x && r.left < a.x + a.width && r.bottom > a.y && r.top < a.y + a.height;
    const nakyy = (el: Element | null) => {
      for (let e = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      }
      return true;
    };
    const osat: string[] = [];
    const kulkija = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = kulkija.nextNode(); n; n = kulkija.nextNode()) {
      const teksti = n.textContent?.trim();
      if (!teksti) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      if ([...r.getClientRects()].some(leikkaa) && nakyy(n.parentElement)) osat.push(teksti);
    }
    for (const el of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")) {
      if (el.value && leikkaa(el.getBoundingClientRect()) && nakyy(el)) osat.push(el.value);
    }
    for (const el of document.querySelectorAll<HTMLElement>("img[alt], [title], [aria-label]")) {
      if (!leikkaa(el.getBoundingClientRect()) || !nakyy(el)) continue;
      for (const attr of ["alt", "title", "aria-label"]) {
        const v = el.getAttribute(attr);
        if (v) osat.push(v);
      }
    }
    return osat.join("\n");
  }, alue);
}

/** Odottaa, että latausosoittimet ovat poissa. Palauttaa false aikarajalla. */
export async function odotaLatausta(page: Page, aikaraja = 15_000): Promise<boolean> {
  try {
    await page.waitForFunction(
      () =>
        ![
          ...document.querySelectorAll(
            '[data-ui="Spinner"], [data-testid="spinner"], [data-testid="loading-block"], [data-testid="loading-container"]',
          ),
        ].some((e) => (e as HTMLElement).getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"),
      undefined,
      { timeout: aikaraja, polling: 200 },
    );
    return true;
  } catch {
    return false;
  }
}
