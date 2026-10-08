import type { Rule, ValidationContext } from "sanity";

import { kohteenTilaViesti, sisainenPolku, type KohteenTila, type KohteenTilaViesti } from "../../lib/linkki";
import { polunKohteet } from "../../lib/path";
import { apiVersion } from "../env";

/**
 * Studion varoitus, kun sivuston oma linkki ei vie mihinkään (docs/23 Y17,
 * askel 1). Studio toimii samassa osoitteessa kuin sivusto, joten polku
 * tarkistetaan kysymällä sitä sivustolta: vastaus kattaa kaikki reitit,
 * Sanityn sivut ja ohjaukset ilman erillistä reittilistaa.
 *
 * Varoitus ei estä julkaisua: juuri tehty sivu voi olla vielä julkaisematta.
 * Verkkovirheessä ja palvelimen ulkopuolella (esim. `sanity documents
 * validate`) ei varoiteta.
 */

const VOIMASSA_MS = 60_000;
const valimuisti = new Map<string, { aika: number; loytyi: Promise<boolean | null> }>();

function onSivulla(polku: string): Promise<boolean | null> {
  const muistissa = valimuisti.get(polku);
  if (muistissa && Date.now() - muistissa.aika < VOIMASSA_MS) return muistissa.loytyi;
  const loytyi = fetch(polku, { method: "HEAD", redirect: "follow", credentials: "omit", cache: "no-store" })
    .then((vastaus) => (vastaus.status === 404 ? false : vastaus.ok ? true : null))
    .catch(() => null);
  valimuisti.set(polku, { aika: Date.now(), loytyi });
  return loytyi;
}

export async function tarkistaLinkinKohde(href: string | null | undefined): Promise<true | string> {
  if (typeof window === "undefined") return true;
  const polku = sisainenPolku(href);
  if (!polku) return true;
  const loytyi = await onSivulla(polku);
  return loytyi === false
    ? `Sivustolla ei ole sivua osoitteessa ${polku}. Tarkista kirjoitusasu, tai julkaise ensin sivu, johon linkki vie.`
    : true;
}

/** Varoitussääntö linkkikenttiin: lisää kentän muiden sääntöjen rinnalle. */
export const linkinKohdeVaroitus = (rule: Rule) =>
  rule.custom<string>((href) => tarkistaLinkinKohde(href)).warning();

/* -------------------------------------------------------------------------- */
/* Linkkiobjektin tarkistukset (docs/24 askel 4)                              */
/* -------------------------------------------------------------------------- */

/** Arvokohtainen muisti 60 sekunniksi: sama tarkistus ajetaan jokaisella näppäilyllä. */
function muistissa<T>(muisti: Map<string, { aika: number; tulos: Promise<T> }>, avain: string, hae: () => Promise<T>) {
  const vanha = muisti.get(avain);
  if (vanha && Date.now() - vanha.aika < VOIMASSA_MS) return vanha.tulos;
  const tulos = hae();
  muisti.set(avain, { aika: Date.now(), tulos });
  // Epäonnistunutta hakua ei jätetä muistiin.
  tulos.catch(() => muisti.delete(avain));
  return tulos;
}

const tilaMuisti = new Map<string, { aika: number; tulos: Promise<KohteenTila> }>();

const TILA_KYSELY = /* groq */ `{
  "julkaistu": *[_id == $id][0]{ _type, publishedAt, "nimi": coalesce(title, name) },
  "luonnos": defined(*[_id == $luonnos][0]._id),
  "nimi": *[_id == $luonnos][0]{ "n": coalesce(title, name) }.n
}`;

/**
 * Valitun sivun tila: julkaisematon (varoitus), ajastettu uutinen (varoitus)
 * tai poistettu (virhe). Null, kun kaikki on kunnossa tai tarkistus ei onnistu.
 */
export async function kohteenTila(
  ref: { _ref?: string } | null | undefined,
  context: ValidationContext,
): Promise<KohteenTilaViesti | null> {
  const id = ref?._ref;
  if (!id) return null;
  try {
    const tila = await muistissa(tilaMuisti, id, () =>
      context.getClient({ apiVersion }).withConfig({ perspective: "raw" }).fetch<KohteenTila>(TILA_KYSELY, { id, luonnos: `drafts.${id}` }),
    );
    return kohteenTilaViesti(tila, new Date());
  } catch {
    return null;
  }
}

const valintaMuisti = new Map<string, { aika: number; tulos: Promise<string | null> }>();

/**
 * Muu osoite -linkki sivuston omaan sivuun, jolle löytyy julkaistu dokumentti:
 * Sivuston sivu olisi parempi valinta, koska se seuraa osoitteen muutosta.
 * Kyselyä ei tehdä ankkurin tai kyselyosan sisältävälle polulle.
 */
export async function sivullaOnValinta(href: string | null | undefined, context: ValidationContext): Promise<true | string> {
  if (!href || /[?#]/.test(href)) return true;
  const polku = sisainenPolku(href);
  if (!polku) return true;
  const kohteet = polunKohteet(polku);
  if (kohteet.length === 0) return true;
  try {
    const nimi = await muistissa(valintaMuisti, polku, () => {
      const ehdot = kohteet.map((_, i) => `(_type == $t${i} && slug.current == $s${i})`).join(" || ");
      const params = Object.fromEntries(kohteet.flatMap((k, i) => [[`t${i}`, k.tyyppi], [`s${i}`, k.slug]]));
      return context
        .getClient({ apiVersion })
        .withConfig({ perspective: "raw" })
        .fetch<string | null>(`*[!(_id in path("drafts.**")) && (${ehdot})][0]{ "n": coalesce(title, name, slug.current) }.n`, params);
    });
    return nimi
      ? `Tälle sivulle on parempi valinta: vaihda kohdaksi Sivuston sivu ja valitse “${nimi}”. ` +
          "Linkki pysyy silloin kunnossa, vaikka sivun osoite muuttuisi."
      : true;
  } catch {
    return true;
  }
}
