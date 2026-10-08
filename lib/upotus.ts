/**
 * Tekstin upotuslohko: Google Maps -kartta, Google Forms -lomake tai
 * Vimeo-video (docs/24 askel 6, docs/05 `rikasSisalto`).
 *
 * Isä liittää kenttään palvelun upotuskoodin (iframe-HTML) tai osoitteen.
 * Tästä poimitaan vain osoite, ja se hyväksytään vain sallitulta listalta.
 * Sivulle päätyy aina tämän moduulin rakentama `src`, ei koskaan liitettyä
 * HTML:ää (components/upotus.tsx).
 *
 * Puhdas moduuli: vain suhteelliset tuonnit, jotta toimii Studiossa,
 * sivustolla ja tsx-skripteissä. Testit: `npm run test:upotus`.
 */
import { tulkitseYoutube } from "./youtube";

export type UpotusPalvelu = "google-maps" | "google-forms" | "vimeo";

export type Upotus = {
  palvelu: UpotusPalvelu;
  /** Iframen osoite, aina https. */
  src: string;
  /** "Avaa palvelussa" -linkki (toimii myös ilman JavaScriptiä). */
  avaaOsoite: string;
  /** Kuvasuhde, tai null, kun korkeus on kiinteä (lomake). */
  suhde: "4/3" | "16/9" | null;
  /** Korkeus pikseleinä, kun `suhde` on null. */
  korkeus: number | null;
};

export const UPOTUSPALVELUT: Record<
  UpotusPalvelu,
  { nimi: string; nayta: string; avaa: string; latausteksti: string }
> = {
  "google-maps": {
    nimi: "Google Maps",
    nayta: "Näytä kartta",
    avaa: "Avaa Google Mapsissa",
    latausteksti: "Kartta ladataan Google Mapsista. Google voi tallentaa evästeitä laitteellesi.",
  },
  "google-forms": {
    nimi: "Google Forms",
    nayta: "Näytä lomake",
    avaa: "Avaa lomake Googlessa",
    latausteksti: "Lomake ladataan Googlelta. Google voi tallentaa evästeitä laitteellesi.",
  },
  vimeo: {
    nimi: "Vimeo",
    nayta: "Näytä video",
    avaa: "Avaa Vimeossa",
    latausteksti: "Video ladataan Vimeosta. Vimeo voi tallentaa evästeitä laitteellesi.",
  },
};

/** Lomakkeen korkeus, kun upotuskoodissa ei ole korkeutta, ja sallitut rajat. */
export const LOMAKKEEN_KORKEUS = 900;
export const LOMAKKEEN_KORKEUS_MIN = 400;
export const LOMAKKEEN_KORKEUS_MAX = 3000;

export const UPOTUS_VIRHEET = {
  mapsJakolinkki:
    "Tämä on Google Mapsin jakolinkki, jota ei voi upottaa. Avaa kartta, valitse Jaa → Upota kartta → Kopioi HTML ja liitä koko koodi tähän.",
  formsMuokkaus:
    "Tämä on lomakkeen muokkausosoite. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi ja liitä koodi tähän.",
  formsLyhytlinkki: "Lyhytlinkkiä ei voi upottaa. Valitse lomakkeessa Lähetä → <> (upota) → Kopioi.",
  youtube: "YouTube-videolle on oma lohko: valitse tekstin työkalupalkista YouTube-video.",
  muu:
    "Tätä palvelua ei voi upottaa. Sallitut: Google Maps -kartta, Google Forms -lomake ja Vimeo-video. Muulle sivulle voit lisätä tekstiin linkin tai painikkeen.",
} as const;

/** HTML-attribuutin yleisimmät merkkiviittaukset (upotuskoodissa `&amp;`). */
function puraEntiteetit(arvo: string): string {
  return arvo
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/** Attribuutin arvo tagin sisältä: "…", '…' tai lainausmerkitön. */
function attribuutti(tagi: string, nimi: string): string | null {
  const osuma = new RegExp(`\\s${nimi}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(tagi);
  if (!osuma) return null;
  return puraEntiteetit(osuma[1] ?? osuma[2] ?? osuma[3] ?? "");
}

/**
 * Osoite ja korkeus syötteestä. Iframe-koodista luetaan vain ensimmäisen
 * iframen `src` ja `height` (pelkkä luku, myös "450px"); muu HTML ohitetaan.
 * Muuten syöte on osoite sellaisenaan. Tyhjä → null.
 */
export function poimiOsoite(syote: string | null | undefined): { url: string; korkeus: number | null } | null {
  const teksti = (syote ?? "").trim();
  if (!teksti) return null;
  // Lainausmerkkien sisällä oleva ">" ei pääty tagiin (esim. data:text/html,<b>…).
  const iframe = /<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(teksti);
  if (!iframe) return { url: teksti, korkeus: null };
  const src = attribuutti(iframe[0], "src")?.trim();
  if (!src) return null;
  const korkeus = attribuutti(iframe[0], "height")?.trim();
  const luku = korkeus && /^\d+(?:px)?$/i.test(korkeus) ? Number.parseInt(korkeus, 10) : null;
  return { url: src, korkeus: luku };
}

/**
 * Osoite URL-olioksi. `http:` muutetaan https:ksi; protokollaton osoite
 * (`//www.google.com/…` tai `vimeo.com/…`) saa https:n. Muut protokollat
 * (javascript:, data: …), käyttäjätunnukset ja muut portit hylätään.
 */
function osoitteeksi(raaka: string): URL | null {
  let teksti = raaka.trim();
  if (teksti.startsWith("//")) teksti = `https:${teksti}`;
  else if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#]|$)/i.test(teksti)) teksti = `https://${teksti}`;
  let url: URL;
  try {
    url = new URL(teksti);
  } catch {
    return null;
  }
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return null;
  if (url.username || url.password || url.port) return null;
  return url;
}

const MAPS_HOSTIT = new Set(["www.google.com", "google.com", "maps.google.com"]);
/** Googlen maakohtaiset osoitteet (google.fi …): tunnistetaan vain jakolinkin virheviestiä varten. */
const GOOGLE_HOST = /^(?:www\.|maps\.)?google\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/;
const FORMS_VIEWFORM = /^\/forms\/d\/e\/([A-Za-z0-9_-]+)\/viewform\/?$/;
const VIMEO_HOSTIT = new Set(["vimeo.com", "www.vimeo.com"]);
const VIMEO_ID = /^\d{1,12}$/;
const VIMEO_HASH = /^[A-Za-z0-9]{1,40}$/;
/** Google My Maps -kartan tunniste (`mid`) ja sallitut lisäparametrit. */
const MY_MAPS_MID = /^[A-Za-z0-9_-]{1,100}$/;
const MY_MAPS_LISAT: Record<string, RegExp> = {
  ll: /^-?\d{1,3}(?:\.\d+)?,-?\d{1,3}(?:\.\d+)?$/,
  z: /^\d{1,2}$/,
  ehbc: /^[A-Fa-f0-9]{6}$/,
};

type Tulos = { upotus: Upotus } | { virhe: string };

function rajaaKorkeus(korkeus: number | null): number {
  const arvo = korkeus ?? LOMAKKEEN_KORKEUS;
  return Math.min(LOMAKKEEN_KORKEUS_MAX, Math.max(LOMAKKEEN_KORKEUS_MIN, arvo));
}

function vimeo(id: string, hash: string | null): Upotus {
  const h = hash && VIMEO_HASH.test(hash) ? hash : null;
  return {
    palvelu: "vimeo",
    // autoplay: iframe ladataan vasta, kun lukija on painanut "Näytä video".
    src: `https://player.vimeo.com/video/${id}?dnt=1${h ? `&h=${h}` : ""}&autoplay=1`,
    // Listaamaton video aukeaa vain tunnisteen kanssa (vimeo.com/<id>/<hash>).
    avaaOsoite: `https://vimeo.com/${id}${h ? `/${h}` : ""}`,
    suhde: "16/9",
    korkeus: null,
  };
}

function tulkitse(syote: string | null | undefined): Tulos | null {
  if (!(syote ?? "").trim()) return null;
  // Iframe-koodi ilman osoitetta tai muu kelvoton syöte on virhe, ei tyhjä.
  const poimittu = poimiOsoite(syote);
  if (!poimittu) return { virhe: UPOTUS_VIRHEET.muu };
  const url = osoitteeksi(poimittu.url);
  if (!url) return { virhe: UPOTUS_VIRHEET.muu };

  const host = url.hostname.toLowerCase();
  const polku = url.pathname;
  const osat = polku.split("/").filter(Boolean);

  // Google Maps
  if (MAPS_HOSTIT.has(host) && (polku === "/maps/embed" || polku.startsWith("/maps/embed/"))) {
    const src = `https://${host}${polku}${url.search}`;
    return { upotus: { palvelu: "google-maps", src, avaaOsoite: src, suhde: "4/3", korkeus: null } };
  }
  // Google My Maps (oma kartta): vain www.google.com/maps/d/embed ja sallitut parametrit.
  if (host === "www.google.com" && (polku === "/maps/d/embed" || polku === "/maps/d/u/0/embed")) {
    const mid = url.searchParams.get("mid");
    if (!mid || !MY_MAPS_MID.test(mid)) return { virhe: UPOTUS_VIRHEET.mapsJakolinkki };
    const parametrit = new URLSearchParams({ mid });
    for (const [nimi, sallittu] of Object.entries(MY_MAPS_LISAT)) {
      const arvo = url.searchParams.get(nimi);
      if (arvo && sallittu.test(arvo)) parametrit.set(nimi, arvo);
    }
    return {
      upotus: {
        palvelu: "google-maps",
        src: `https://www.google.com/maps/d/embed?${parametrit}`,
        avaaOsoite: `https://www.google.com/maps/d/viewer?${new URLSearchParams({ mid })}`,
        suhde: "4/3",
        korkeus: null,
      },
    };
  }
  if (MAPS_HOSTIT.has(host) && polku === "/maps" && url.searchParams.get("output") === "embed") {
    const src = `https://${host}${polku}${url.search}`;
    const avaa = new URL(src);
    avaa.searchParams.delete("output");
    return {
      upotus: { palvelu: "google-maps", src, avaaOsoite: avaa.toString(), suhde: "4/3", korkeus: null },
    };
  }
  if (
    host === "maps.app.goo.gl" ||
    (host === "goo.gl" && osat[0] === "maps") ||
    (GOOGLE_HOST.test(host) && (osat[0] === "maps" || host.startsWith("maps.")))
  ) {
    return { virhe: UPOTUS_VIRHEET.mapsJakolinkki };
  }

  // Google Forms
  if (host === "forms.gle") return { virhe: UPOTUS_VIRHEET.formsLyhytlinkki };
  if (host === "docs.google.com" && osat[0] === "forms") {
    const lomake = FORMS_VIEWFORM.exec(polku);
    if (lomake) {
      const avaaOsoite = `https://docs.google.com/forms/d/e/${lomake[1]}/viewform`;
      return {
        upotus: {
          palvelu: "google-forms",
          src: `${avaaOsoite}?embedded=true`,
          avaaOsoite,
          suhde: null,
          korkeus: rajaaKorkeus(poimittu.korkeus),
        },
      };
    }
    if (osat.includes("edit")) return { virhe: UPOTUS_VIRHEET.formsMuokkaus };
    return { virhe: UPOTUS_VIRHEET.muu };
  }

  // Vimeo
  if (VIMEO_HOSTIT.has(host)) {
    // vimeo.com/<id>, vimeo.com/<id>/<hash>, vimeo.com/channels/<nimi>/<id>
    const id = VIMEO_ID.test(osat[0] ?? "")
      ? osat[0]
      : osat[0] === "channels" && VIMEO_ID.test(osat[2] ?? "")
        ? osat[2]
        : null;
    if (id) {
      const hash = (id === osat[0] ? osat[1] : null) ?? url.searchParams.get("h");
      return { upotus: vimeo(id, hash) };
    }
    return { virhe: UPOTUS_VIRHEET.muu };
  }
  if (host === "player.vimeo.com" && osat[0] === "video" && VIMEO_ID.test(osat[1] ?? "") && osat.length === 2) {
    return { upotus: vimeo(osat[1], url.searchParams.get("h")) };
  }

  if (tulkitseYoutube(url.toString())) return { virhe: UPOTUS_VIRHEET.youtube };
  return { virhe: UPOTUS_VIRHEET.muu };
}

/** Sallittu upotus tai null (tyhjä, kelvoton tai muu kuin sallittu palvelu). */
export function tulkitseUpotus(syote: string | null | undefined): Upotus | null {
  const tulos = tulkitse(syote);
  return tulos && "upotus" in tulos ? tulos.upotus : null;
}

/** Studion virheteksti, tai null, kun syöte kelpaa tai on tyhjä (pakollisuus on oma sääntönsä). */
export function upotuksenVirhe(syote: string | null | undefined): string | null {
  const tulos = tulkitse(syote);
  return tulos && "virhe" in tulos ? tulos.virhe : null;
}
