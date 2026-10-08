import type { ValidationContext } from "sanity";

import { linkinTyyppi } from "../../lib/linkki";
import { normalisoiPolku, omaPolku, tarkistaOhjauksenLahde } from "../../lib/ohjaukset";
import { apiVersion } from "../env";

/**
 * Studion tarkistukset ohjaukselle (docs/24 askel 8). Ohjaus toimii vain
 * osoitteessa, joka muuten antaisi 404:n (sanity/lib/ohjaus.ts), joten
 * Studio kertoo heti, jos osoitteessa on jo sivu tai kiinteä ohjaus.
 *
 * Studio toimii samassa osoitteessa kuin sivusto, joten osoite tarkistetaan
 * kysymällä sitä sivustolta (HEAD, ohjausta ei seurata). Palvelimen
 * ulkopuolella (esim. `sanity documents validate`) ja verkkovirheessä
 * tarkistus ohitetaan.
 */

const VOIMASSA_MS = 60_000;

/** Arvokohtainen muisti 60 sekunniksi: sääntö ajetaan jokaisella näppäilyllä. */
function muistissa<T>(muisti: Map<string, { aika: number; tulos: Promise<T> }>, avain: string, hae: () => Promise<T>) {
  const vanha = muisti.get(avain);
  if (vanha && Date.now() - vanha.aika < VOIMASSA_MS) return vanha.tulos;
  const tulos = hae();
  muisti.set(avain, { aika: Date.now(), tulos });
  tulos.catch(() => muisti.delete(avain));
  return tulos;
}

type Vastaus = "sivu" | "ohjaus" | "vapaa" | null;
const vastausMuisti = new Map<string, { aika: number; tulos: Promise<Vastaus> }>();

function osoitteenTila(polku: string): Promise<Vastaus> {
  return muistissa(vastausMuisti, polku, () =>
    fetch(polku, { method: "HEAD", redirect: "manual", credentials: "omit", cache: "no-store" })
      .then((v): Vastaus => (v.type === "opaqueredirect" || (v.status >= 300 && v.status < 400) ? "ohjaus" : v.status === 200 ? "sivu" : v.status === 404 ? "vapaa" : null))
      .catch(() => null),
  );
}

const asiakas = (context: ValidationContext) => context.getClient({ apiVersion }).withConfig({ perspective: "raw" });
const julkaistuId = (context: ValidationContext) => (context.document?._id ?? "").replace(/^drafts\./, "");

/** Virhe: sama osoite on jo toisella ohjauksella, osoitteessa on sivu tai kiinteä ohjaus. */
export async function lahdeOnVapaa(lahde: string | undefined, context: ValidationContext): Promise<true | string> {
  if (!lahde || tarkistaOhjauksenLahde(lahde) !== true) return true;
  const id = julkaistuId(context);
  const client = asiakas(context);
  try {
    const muita = await client.fetch<number>(
      `count(*[_type == "ohjaus" && lahde == $lahde && !(_id in [$id, "drafts." + $id])])`,
      { lahde, id },
    );
    if (muita > 0) return `Osoitteelle ${lahde} on jo ohjaus. Avaa se listasta ja muuta sen kohdetta.`;
  } catch {
    // Kysely epäonnistui: ei estetä tallennusta.
  }
  if (typeof window === "undefined") return true;
  const tila = await osoitteenTila(lahde);
  if (tila === "sivu") {
    return `Osoitteessa ${lahde} on jo sivu. Ohjaus toimii vain osoitteissa, joissa ei ole sivua. Valitse toinen osoite.`;
  }
  if (tila !== "ohjaus") return true;
  try {
    // Ohjaus itse (julkaistu) tai dokumentin aiempi osoite (varoitus alla) ei ole kiinteä ohjaus.
    const oma = await client.fetch<boolean>(
      `*[_id == $id][0].lahde == $lahde || count(*[!(_id in path("drafts.**")) && count(aiemmatPolut[@ == $lahde]) > 0]) > 0`,
      { lahde, id },
    );
    if (oma) return true;
  } catch {
    return true;
  }
  return `Osoitteella ${lahde} on jo kiinteä ohjaus (vanhan sivuston osoite). Valitse toinen osoite.`;
}

/** Varoitus: osoite on jonkin dokumentin aiempi osoite, ja ohjaus korvaa automaattisen ohjauksen. */
export async function lahdeKorvaaAutomaattisen(lahde: string | undefined, context: ValidationContext): Promise<true | string> {
  if (!lahde || tarkistaOhjauksenLahde(lahde) !== true) return true;
  try {
    const nimi = await asiakas(context).fetch<string | null>(
      `*[!(_id in path("drafts.**")) && count(aiemmatPolut[@ == $lahde]) > 0] | order(_updatedAt desc)[0]{ "n": coalesce(title, name, nimi, slug.current) }.n`,
      { lahde },
    );
    return nimi ? `Tämä osoite ohjautuu nyt automaattisesti sivulle "${nimi}". Ohjauksesi korvaa sen.` : true;
  } catch {
    return true;
  }
}

type MinneArvo = { tyyppi?: string | null; href?: string | null } | undefined;

/** Kohteen oma polku vertailumuodossa, kun kohde on Muu osoite sivuston sisällä. */
function kohteenOmaPolku(minne: MinneArvo): string | null {
  if (linkinTyyppi(minne) !== "osoite") return null;
  return normalisoiPolku(omaPolku(minne?.href ?? null));
}

/** Virhe: Muu osoite -kohde on sama kuin ohjauksen oma osoite. */
export function kohdeEiItseensa(minne: unknown, context: ValidationContext): true | string {
  const kohde = kohteenOmaPolku(minne as MinneArvo);
  const lahde = normalisoiPolku((context.document as { lahde?: string } | undefined)?.lahde);
  return kohde && lahde && kohde === lahde ? "Ohjaus ei voi osoittaa itseensä." : true;
}

/** Varoitus: kohde on toisen ohjauksen osoite (ketju). */
export async function kohdeOnOhjaus(minne: unknown, context: ValidationContext): Promise<true | string> {
  const kohde = kohteenOmaPolku(minne as MinneArvo);
  if (!kohde) return true;
  try {
    const toinen = await asiakas(context).fetch<string | null>(
      `*[_type == "ohjaus" && lahde == $polku && !(_id in [$id, "drafts." + $id])][0]._id`,
      { polku: kohde, id: julkaistuId(context) },
    );
    return toinen ? `Kohde ${kohde} on itsekin ohjaus. Valitse suoraan lopullinen sivu.` : true;
  } catch {
    return true;
  }
}
