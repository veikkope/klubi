import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { createClient } from "next-sanity";
import { parseBody } from "next-sanity/webhook";

import { LINKIN_KOHDETYYPIT } from "@/lib/linkki";
import { OHJATTAVAT_TYYPIT, type EnnenTiedot } from "@/lib/ohjaukset";
import { paivitaArvosanat } from "@/lib/ravintola-arvosana";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import {
  aiemmanOsoitteenKasittely,
  tallennaAiempiOsoite,
  type TallennuksenTulos,
} from "@/sanity/lib/aiemmat-polut";

/**
 * Sanity-webhook: tyhjentää välimuistin kun sisältö muuttuu.
 *
 * Ilman tätä isän Studiossa tekemä muutos näkyisi vasta kun sivun
 * välimuistin 60 sekunnin ikkuna (sanity/lib/fetch.ts) umpeutuu. Webhookin kanssa se näkyy sekunneissa.
 *
 * Sanityssa (sanity.io/manage → API → Webhooks, docs/17 §D, docs/07):
 *   Nimi:     Sivuston päivitys (revalidate)
 *   URL:      https://www.lahdensuomalainenklubi.com/api/revalidate
 *   Dataset:  production
 *   Trigger:  Create, Update, Delete (ei luonnoksia)
 *   Filter:   defined(_type) && !(_type match "sanity.*") && !(_type in ["sivustonTila", "varmuuskopio"])
 *   Projection (docs/24 §2.5, askeleesta 8 alkaen):
 *     { _id, _type, "slug": slug.current, "operaatio": delta::operation(),
 *       "ennen": before(){ _updatedAt, "slug": slug.current, aiemmatPolut, category, huuhkajatOsio, mestaruusmaa } }
 *   API-versio: v2021-03-25 (delta::operation() ja before() toimivat)
 *   Secret:   sama arvo kuin SANITY_REVALIDATE_SECRET
 *
 * Vanha projektio `{_type, "slug": slug.current}` toimii yhä (välimuisti
 * tyhjenee), mutta aiempia osoitteita ei silloin tallenneta: käsittelijä
 * kirjaa varoituksen.
 *
 * Cache-tagit ovat dokumenttityypin nimiä — sama merkkijono jonka sivut
 * antavat `sanityFetch({ tags })`-kutsussa. Tagi `ohjaus` on 404-haaran
 * ohjauskartalla (sanity/lib/ohjaus.ts).
 */

const secret = process.env.SANITY_REVALIDATE_SECRET;

/** Tyyppi → muut tagit, joiden sivuilla tyypin sisältö näkyy. */
const SISALLON_RIIPPUVAT: Record<string, string[]> = {
  ravintolaKayttajaArvostelu: ["ravintola"],
  klubiArvio: ["ravintola"],
  klubilainen: ["ravintola"],
  kaupunki: ["ravintola"],
  // Kategorian nimi näkyy uutiskorteissa ja uutissivuilla.
  uutisKategoria: ["uutinen"],
  // Taulukko näkyy myös sivuilla, joiden Taulukot-kenttä viittaa siihen.
  jalkapalloTilasto: ["sivu"],
};

/**
 * Linkin kohteen osoite näkyy etusivun pikalinkeissä ja napeissa sekä klubin
 * toiminnan vuosilinkeissä (tagi `linkit`, docs/24 §2.5). Valikko ja
 * alatunniste eivät käytä tagia: ne ovat jokaisella sivulla, ja kohteen
 * osoitteen muutos näkyy niissä minuutin viiveellä, kuten tekstin linkeissä.
 */
const LINKIT: Record<string, string[]> = Object.fromEntries(LINKIN_KOHDETYYPIT.map((t) => [t, ["linkit"]]));

/** Yhdistää taulukot; päällekkäisten avainten tagit yhdistetään. */
function yhdista(...taulut: Record<string, string[]>[]): Record<string, string[]> {
  const tulos: Record<string, string[]> = {};
  for (const taulu of taulut) {
    for (const [tyyppi, tagit] of Object.entries(taulu)) {
      tulos[tyyppi] = [...new Set([...(tulos[tyyppi] ?? []), ...tagit])];
    }
  }
  return tulos;
}

const RIIPPUVAT = yhdista(SISALLON_RIIPPUVAT, LINKIT);

interface WebhookPayload {
  _id?: string;
  _type?: string;
  slug?: string | null;
  /** `delta::operation()`: puuttuu vanhasta projektiosta. */
  operaatio?: "create" | "update" | "delete";
  /** `before()`-projektio: null luonnissa. */
  ennen?: EnnenTiedot | null;
}

/**
 * Järjestelmädokumentit, jotka eivät näy sivustolla: ajastusten kirjaama tila
 * ja varmuuskopiot (docs/24 askel 7, §2.5). Ei turhaa välimuistin tyhjennystä.
 * Askeleesta 8 alkaen webhookin suodatin jättää ne pois jo Sanityssa
 * (docs/24 P8); tämä ohitus jää varmistukseksi.
 */
const OHITETTAVAT = new Set(["sivustonTila", "varmuuskopio"]);

/** Tyypit, joiden muutos voi muuttaa ravintolan arvosanaa. */
const ARVOSANAAN_VAIKUTTAVAT = new Set(["ravintolaKayttajaArvostelu", "klubiArvio"]);

/** Kirjoittava client (raw: myös luonnokset näkyvät), tai null, jos token puuttuu. */
function kirjoittavaClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token || !projectId) return null;
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
}

/** Virhe ei kaada välimuistin tyhjennystä: arvosana korjaantuu seuraavalla ajolla. */
async function laskeArvosanat(): Promise<void> {
  const client = kirjoittavaClient();
  if (!client) {
    console.error("[revalidate] arvosanoja ei laskettu: SANITY_API_WRITE_TOKEN puuttuu.");
    return;
  }
  try {
    const muutokset = await paivitaArvosanat(client);
    if (muutokset.length > 0) {
      console.log(`[revalidate] arvosana päivitetty: ${muutokset.map((m) => m.name).join(", ")}`);
    }
  } catch (error) {
    console.error("[revalidate] arvosanojen laskenta epäonnistui:", error instanceof Error ? error.message : error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!secret) {
    return Response.json(
      { message: "SANITY_REVALIDATE_SECRET puuttuu — webhook ei ole käytössä." },
      { status: 501 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      request,
      secret,
    );

    if (!isValidSignature) {
      return Response.json({ message: "Virheellinen allekirjoitus." }, { status: 401 });
    }
    if (!body?._type) {
      return Response.json({ message: "Payloadista puuttuu _type." }, { status: 400 });
    }
    if (OHITETTAVAT.has(body._type)) {
      return Response.json({ revalidated: false, syy: "järjestelmädokumentti" });
    }

    // Tyypin tagi kattaa listaukset; slug-tagi yksittäisen dokumentin sivun.
    const tags = [body._type];

    // Osoitteen muutos: vanha osoite talteen ennen välimuistin tyhjennystä,
    // jotta seuraava renderöinti näkee sen (docs/24 askel 8, K2).
    let tallennus: TallennuksenTulos = "ei-muutosta";
    const kasittely = aiemmanOsoitteenKasittely(body);
    if (kasittely === "varoitus") {
      console.warn(
        "[revalidate] webhookin projektiosta puuttuu operaatio: aiempia osoitteita ei tallenneta " +
          "(docs/07 Ajonaikaiset ohjaukset).",
      );
    } else if (kasittely === "tarkista" && body._id && body.ennen) {
      const client = kirjoittavaClient();
      if (!client) {
        console.error("[revalidate] aiempaa osoitetta ei tallennettu: SANITY_API_WRITE_TOKEN puuttuu.");
      } else {
        tallennus = await tallennaAiempiOsoite(client, {
          _id: body._id,
          _type: body._type,
          slug: body.slug,
          ennen: body.ennen,
        });
      }
    }
    // Ohjauskartta riippuu ohjauksista ja ohjattavien dokumenttien osoitteista.
    if (OHJATTAVAT_TYYPIT.has(body._type) || tallennus === "ok") tags.push("ohjaus");

    if (body.slug) tags.push(`${body._type}:${body.slug}`);
    // Tyypit, jotka näkyvät toisen tyypin sivuilla: hyväksytty arvostelu ja
    // kaupungin nimi näkyvät ravintolasivulla, joka hakee tagilla "ravintola".
    const NAKYY_MYOS = RIIPPUVAT[body._type];
    if (NAKYY_MYOS) tags.push(...NAKYY_MYOS);

    // Klubilaisen arvosana tai arvostelu muuttui: ravintolan arvosana on
    // klubilaisten arvosanojen keskiarvo (lib/ravintola-arvosana.ts).
    // Ravintolan päivitys laukaisee oman webhookinsa, joka tyhjentää sen sivut.
    if (ARVOSANAAN_VAIKUTTAVAT.has(body._type)) await laskeArvosanat();

    // `{ expire: 0 }`: vanhaa versiota ei tarjoilla enää kertaakaan, vaan
    // seuraava pyyntö odottaa tuoreen datan. Profiili "max" (stale-while-
    // revalidate) näyttäisi ensimmäiselle kävijälle vielä vanhan sivun, jolloin
    // julkaisija ei näkisi muutostaan heti (docs/09 lupaa sen sekunneissa).
    // Next 16:n ohje webhookeille: revalidateTag.md, "Route Handler".
    for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });

    // Vanha osoite jäi tallentamatta: 500, jotta Sanity yrittää webhookia uudelleen.
    if (tallennus === "virhe") {
      return Response.json({ revalidated: true, tags, message: "Aiempaa osoitetta ei tallennettu." }, { status: 500 });
    }
    return Response.json({ revalidated: true, tags, now: Date.now() });
  } catch (error) {
    // Yksityiskohdat vain palvelimen lokiin, ei kutsujalle.
    console.error("[revalidate] virhe:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Välimuistin tyhjennys epäonnistui." }, { status: 500 });
  }
}
