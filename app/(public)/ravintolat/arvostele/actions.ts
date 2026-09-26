"use server";

import { createClient } from "next-sanity";

import { apiVersion, dataset, hasSanity, projectId } from "@/sanity/env";
import {
  EMPTY_REVIEW_VALUES,
  type ReviewField,
  type ReviewFormState,
} from "./form-state";

/**
 * Käyttäjän ravintola-arvostelun vastaanotto.
 *
 * Arvostelu ei mene suoraan julkaisuun: dokumentti luodaan tilaan `pending`, ja
 * sihteeri hyväksyy sen Studiossa. Julkinen sivu näyttää vain `approved`-
 * tilaiset. Moderoimaton kirjoitusoikeus julkiseen datasettiin olisi riski.
 *
 * Validointi tehdään kokonaan palvelimella. Selaimen `required`-attribuutit
 * ovat käytettävyyttä varten, eivät suoja — lomakkeen voi lähettää suoraan
 * HTTP-pyyntönä ilman selainta.
 */

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Sanity-dokumentti-id: kirjaimia, numeroita, väliviivoja ja pisteitä. */
const DOCUMENT_ID = /^[A-Za-z0-9._-]{1,128}$/;

/** Riittävän tiukka sähköpostitarkistus ilman että se hylkää valideja osoitteita. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SUPPORT_EMAIL = "info@lahdensuomalainenklubi.com";

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const values: Record<ReviewField, string> = {
    ravintola: text(formData, "ravintola"),
    nimi: text(formData, "nimi"),
    sahkoposti: text(formData, "sahkoposti"),
    tahdet: text(formData, "tahdet"),
    kommentti: text(formData, "kommentti"),
  };

  // Hunajapurkki: kenttä on piilotettu ihmisiltä, joten sen täyttää käytännössä
  // vain botti. Lähetys hylätään hiljaisesti — bottia ei kannata opettaa
  // väistämään ansaa kertomalla sille, että se jäi kiinni.
  if (text(formData, "verkkosivu") !== "") {
    return {
      status: "success",
      message: "Kiitos! Arvostelusi on vastaanotettu ja odottaa hyväksyntää.",
      fieldErrors: {},
      values: EMPTY_REVIEW_VALUES,
    };
  }

  const fieldErrors: Partial<Record<ReviewField, string>> = {};

  if (!DOCUMENT_ID.test(values.ravintola)) {
    fieldErrors.ravintola = "Valitse ravintola listasta.";
  }

  if (values.nimi.length < 2) {
    fieldErrors.nimi = "Kirjoita nimesi (vähintään 2 merkkiä).";
  } else if (values.nimi.length > 80) {
    fieldErrors.nimi = "Nimi saa olla enintään 80 merkkiä.";
  }

  if (!EMAIL.test(values.sahkoposti)) {
    fieldErrors.sahkoposti = "Tarkista sähköpostiosoite.";
  } else if (values.sahkoposti.length > 160) {
    fieldErrors.sahkoposti = "Sähköpostiosoite on liian pitkä.";
  }

  const stars = Number.parseInt(values.tahdet, 10);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    fieldErrors.tahdet = "Valitse arvosana yhdestä viiteen tähteen.";
  }

  if (values.kommentti.length < 10) {
    fieldErrors.kommentti = "Kerro kokemuksestasi vähintään 10 merkillä.";
  } else if (values.kommentti.length > 1000) {
    fieldErrors.kommentti = "Arvostelu saa olla enintään 1000 merkkiä.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Lomakkeessa on puutteita. Korjaa alla merkityt kohdat.",
      fieldErrors,
      values,
    };
  }

  if (!hasSanity || !projectId) {
    return {
      status: "error",
      message:
        "Arvostelujen vastaanotto ei ole vielä käytössä: sisällönhallintaa ei ole " +
        `yhdistetty sivustoon. Arvosteluasi ei tallennettu — voit lähettää sen ` +
        `sähköpostitse osoitteeseen ${SUPPORT_EMAIL}.`,
      fieldErrors: {},
      values,
    };
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!writeToken) {
    return {
      status: "error",
      message:
        "Arvostelua ei voitu tallentaa, koska palvelimelta puuttuu kirjoitusoikeus. " +
        `Arvosteluasi ei tallennettu. Ilmoitathan asiasta osoitteeseen ${SUPPORT_EMAIL}.`,
      fieldErrors: {},
      values,
    };
  }

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
    perspective: "published",
  });

  try {
    // Varmistetaan että viitattu ravintola on olemassa — muuten
    // moderointijonoon syntyy rikkinäisiä viittauksia.
    const exists = await writeClient.fetch<string | null>(
      /* groq */ `*[_type == "ravintola" && _id == $id][0]._id`,
      { id: values.ravintola },
    );

    if (!exists) {
      return {
        status: "error",
        message: "Lomakkeessa on puutteita. Korjaa alla merkityt kohdat.",
        fieldErrors: { ravintola: "Valittua ravintolaa ei löytynyt." },
        values,
      };
    }

    await writeClient.create({
      _type: "ravintolaKayttajaArvostelu",
      reviewerName: values.nimi,
      reviewerEmail: values.sahkoposti,
      restaurant: { _type: "reference", _ref: values.ravintola },
      stars,
      comment: values.kommentti,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[submitReview] tallennus epäonnistui:", error);
    return {
      status: "error",
      message:
        "Arvostelun tallennus epäonnistui teknisen virheen vuoksi. Arvosteluasi ei " +
        "tallennettu — yritä hetken kuluttua uudelleen.",
      fieldErrors: {},
      values,
    };
  }

  return {
    status: "success",
    message:
      "Kiitos! Arvostelusi on vastaanotettu ja odottaa hyväksyntää. Julkaisemme " +
      "sen tarkistuksen jälkeen ravintolan omalla sivulla.",
    fieldErrors: {},
    values: EMPTY_REVIEW_VALUES,
  };
}
