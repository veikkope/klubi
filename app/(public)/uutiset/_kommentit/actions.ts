"use server";

import { updateTag } from "next/cache";
import { createClient } from "next-sanity";

import { KOMMENTTIKOODI_ID } from "@/sanity/schemas/singletons/kommenttikoodi";
import { apiVersion, dataset, hasSanity, projectId } from "@/sanity/env";
import {
  INITIAL_KOMMENTTI_STATE,
  kommentointiAuki,
  kommentitTag,
  type KommenttiFormState,
  type Kommentointi,
} from "./form-state";
import { jarjestysLomakkeelta, koodiTasmaa, siisti, validoi } from "./validointi";

/**
 * Jäsenen kommentin tai veikkauksen vastaanotto (docs/15 §4).
 *
 * Toisin kuin ravintola-arvostelut, kommentti julkaistaan heti, kuten blogissa
 * ennen. Suojana on klubin yhteinen koodisana (`secrets.kommenttikoodi`, ei
 * luettavissa julkisesta API:sta), piilokenttä ja tulvasuoja. Isä piilottaa
 * asiattomat viestit Studiossa jälkikäteen.
 *
 * Validointi tehdään kokonaan palvelimella: lomakkeen voi lähettää ilman selainta.
 */

const SUPPORT_EMAIL = "info@lahdensuomalainenklubi.com";
/** Sanity-dokumentti-id ilman `drafts.`-etuliitettä. */
const DOCUMENT_ID = /^(?!drafts\.)[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$/;
/** Sama nimi samaan uutiseen korkeintaan kerran tässä ajassa. */
const TULVASUOJA_MS = 30_000;

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export async function lahetaKommentti(
  prev: KommenttiFormState,
  formData: FormData,
): Promise<KommenttiFormState> {
  const uutinenId = text(formData, "uutinen");
  const nimi = siisti(text(formData, "nimi"));
  const teksti = siisti(text(formData, "teksti")).replace(/\n{3,}/g, "\n\n");
  const koodi = text(formData, "koodi");
  const kentat: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && /^(sija-\d+|paikka-\d+|maalikuningas)$/.test(key)) kentat[key] = value;
  }

  const values = { nimi, teksti, jarjestys: [] as string[], maalikuningas: siisti(kentat.maalikuningas ?? "") };
  const fail = (message: string, fieldErrors: KommenttiFormState["fieldErrors"] = {}): KommenttiFormState => ({
    status: "error",
    message,
    fieldErrors,
    values,
    lahetyksia: prev.lahetyksia,
  });

  // Hunajapurkki: vain botti täyttää piilotetun kentän. Hiljainen "onnistuminen",
  // jotta bottia ei opeteta väistämään ansaa.
  if (text(formData, "verkkosivu") !== "") {
    return { ...INITIAL_KOMMENTTI_STATE, status: "success", message: "Kiitos! Viestisi on tallennettu.", lahetyksia: prev.lahetyksia + 1 };
  }

  if (!DOCUMENT_ID.test(uutinenId)) return fail("Uutista ei löytynyt. Lataa sivu uudelleen ja yritä uudestaan.");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!hasSanity || !projectId || !writeToken) {
    return fail(
      "Kommentteja ei voi juuri nyt tallentaa, koska palvelimen asetukset ovat kesken. " +
        `Viestiäsi ei tallennettu. Ilmoitathan asiasta osoitteeseen ${SUPPORT_EMAIL}.`,
    );
  }

  const client = createClient({ projectId, dataset, apiVersion, token: writeToken, useCdn: false, perspective: "published" });

  let tila: {
    uutinen: { _id: string; kommentointi: Kommentointi | null } | null;
    koodi: string | null;
    tuore: string | null;
  };
  try {
    tila = await client.fetch(
      /* groq */ `{
        "uutinen": *[_type == "uutinen" && _id == $id][0]{ _id, kommentointi },
        "koodi": *[_id == $koodiId][0].koodi,
        "tuore": *[_type == "kommentti" && uutinen._ref == $id && lower(nimi) == lower($nimi) && lahetetty > $raja][0]._id
      }`,
      {
        id: uutinenId,
        koodiId: KOMMENTTIKOODI_ID,
        nimi,
        raja: new Date(Date.now() - TULVASUOJA_MS).toISOString(),
      },
    );
  } catch (error) {
    console.error("[lahetaKommentti] haku epäonnistui:", error);
    return fail("Tallennus epäonnistui teknisen virheen vuoksi. Viestiäsi ei tallennettu — yritä hetken kuluttua uudelleen.");
  }

  const kommentointi = tila.uutinen?.kommentointi;
  if (!tila.uutinen || !kommentointi?.kaytossa) return fail("Tähän uutiseen ei voi kommentoida.");
  if (!kommentointiAuki(kommentointi)) return fail("Veikkaus on sulkeutunut. Uusia viestejä ei enää oteta vastaan.");
  if (!tila.koodi) {
    return fail(`Kommentointi ei ole vielä käytössä: koodisanaa ei ole asetettu. Ilmoitathan asiasta osoitteeseen ${SUPPORT_EMAIL}.`);
  }

  const tulos = validoi(kommentointi, { nimi, teksti, koodi, kentat });
  values.jarjestys = tulos.jarjestys.length ? tulos.jarjestys : jarjestysLomakkeelta(kommentointi, kentat);
  if (!tulos.fieldErrors.koodi && koodi && !koodiTasmaa(koodi, tila.koodi)) {
    tulos.fieldErrors.koodi = "Koodisana ei ole oikein. Kysy sitä klubin sihteeriltä.";
  }
  if (Object.keys(tulos.fieldErrors).length > 0) {
    return fail("Lomakkeessa on puutteita. Korjaa alla merkityt kohdat.", tulos.fieldErrors);
  }
  if (tila.tuore) return fail("Viestisi on jo tallennettu. Odota hetki, jos haluat lähettää uuden.");

  try {
    await client.create({
      _type: "kommentti",
      uutinen: { _type: "reference", _ref: uutinenId },
      nimi,
      ...(teksti ? { teksti } : {}),
      ...(tulos.jarjestys.length
        ? { veikkaus: { jarjestys: tulos.jarjestys, ...(tulos.maalikuningas ? { maalikuningas: tulos.maalikuningas } : {}) } }
        : {}),
      lahetetty: new Date().toISOString(),
      lahde: "sivusto",
      piilotettu: false,
    });
  } catch (error) {
    console.error("[lahetaKommentti] tallennus epäonnistui:", error);
    return fail("Tallennus epäonnistui teknisen virheen vuoksi. Viestiäsi ei tallennettu — yritä hetken kuluttua uudelleen.");
  }

  // Lähettäjä näkee oman viestinsä heti (read-your-own-writes).
  updateTag(kommentitTag(uutinenId));

  const onVeikkaus = tulos.jarjestys.length > 0;
  return {
    status: "success",
    message: onVeikkaus ? "Kiitos! Veikkauksesi on tallennettu ja näkyy alla." : "Kiitos! Kommenttisi näkyy alla.",
    fieldErrors: {},
    values: { ...INITIAL_KOMMENTTI_STATE.values, nimi },
    lahetyksia: prev.lahetyksia + 1,
  };
}
