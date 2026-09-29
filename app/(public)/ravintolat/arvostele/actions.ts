"use server";

import { randomUUID } from "node:crypto";

import { createClient } from "next-sanity";

import { apiVersion, dataset, hasSanity, projectId } from "@/sanity/env";
import {
  COMMENT_MAX,
  COMMENT_MIN,
  EMPTY_REVIEW_VALUES,
  normalizeSearch,
  type ReviewField,
  type ReviewFormState,
  type ReviewValues,
} from "./form-state";

/**
 * Käyttäjän ravintola-arvostelun vastaanotto.
 *
 * Arvostelu ei mene suoraan julkaisuun: se tallennetaan **luonnoksena**
 * (`drafts.<uuid>`). Luonnokset eivät näy julkisen datasetin kirjautumattomille
 * kyselyille, joten moderoimaton teksti ei päädy sivulle eikä rajapintaan.
 * Sihteeri hyväksyy arvostelun julkaisemalla sen Studiossa (Publish) tai
 * hylkää poistamalla luonnoksen.
 *
 * Ravintola on joko hakemistosta valittu (viittaus) tai kävijän ehdottama uusi
 * ravintola (`ehdotettuRavintola`, ei viittausta). Uuden ravintolan arvostelua
 * ei voi julkaista ennen kuin sihteeri luo ravintolan: Studion toiminto
 * "Hyväksy ja luo ravintola" tekee sen yhdellä painalluksella
 * (sanity/actions/hyvaksy-ja-luo-ravintola.tsx). Jos ehdotettu ravintola on jo
 * hakemistossa (sama nimi ja kaupunki), arvostelu liitetään siihen suoraan.
 *
 * Tietojen minimointi (GDPR art. 5): arvostelijalta kysytään vain julkaistava
 * nimi. Sähköpostia ei kerätä, koska sille ei ole välttämätöntä käyttötarkoitusta.
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

const SUPPORT_EMAIL = "info@lahdensuomalainenklubi.com";

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const values: ReviewValues = {
    ravintola: text(formData, "ravintola"),
    uusi: text(formData, "uusi") === "1" ? "1" : "",
    uusiNimi: text(formData, "uusiNimi"),
    uusiKaupunki: text(formData, "uusiKaupunki"),
    uusiMaa: text(formData, "uusiMaa"),
    uusiLisatieto: text(formData, "uusiLisatieto"),
    nimi: text(formData, "nimi"),
    tahdet: text(formData, "tahdet"),
    kommentti: text(formData, "kommentti"),
  };
  const isNew = values.uusi === "1";

  // Hunajapurkki: kenttä on piilotettu ihmisiltä, joten sen täyttää käytännössä
  // vain botti. Lähetys hylätään hiljaisesti — bottia ei kannata opettaa
  // väistämään ansaa kertomalla sille, että se jäi kiinni.
  if (text(formData, "verkkosivu") !== "") {
    return {
      status: "success",
      message: "Tarkistamme sen ennen julkaisua.",
      fieldErrors: {},
      values: EMPTY_REVIEW_VALUES,
    };
  }

  const fieldErrors: Partial<Record<ReviewField, string>> = {};

  if (isNew) {
    if (values.uusiNimi.length < 2) {
      fieldErrors.uusiNimi = "Kirjoita ravintolan nimi.";
    } else if (values.uusiNimi.length > 100) {
      fieldErrors.uusiNimi = "Nimi saa olla enintään 100 merkkiä.";
    }
    if (values.uusiKaupunki.length < 2) {
      fieldErrors.uusiKaupunki = "Kirjoita kaupunki, jossa ravintola on.";
    } else if (values.uusiKaupunki.length > 60) {
      fieldErrors.uusiKaupunki = "Kaupunki saa olla enintään 60 merkkiä.";
    }
    if (values.uusiMaa.length < 2) {
      fieldErrors.uusiMaa = "Kirjoita maa, esim. Suomi.";
    } else if (values.uusiMaa.length > 60) {
      fieldErrors.uusiMaa = "Maa saa olla enintään 60 merkkiä.";
    }
    if (values.uusiLisatieto.length > 200) {
      fieldErrors.uusiLisatieto = "Lisätieto saa olla enintään 200 merkkiä.";
    }
  } else if (!DOCUMENT_ID.test(values.ravintola)) {
    fieldErrors.ravintola = "Hae ravintola ja valitse se listasta, tai lisää uusi ravintola.";
  }

  if (values.nimi.length < 2) {
    fieldErrors.nimi = "Kirjoita nimesi (vähintään 2 merkkiä).";
  } else if (values.nimi.length > 80) {
    fieldErrors.nimi = "Nimi saa olla enintään 80 merkkiä.";
  }

  const stars = Number.parseInt(values.tahdet, 10);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    fieldErrors.tahdet = "Valitse arvosana yhdestä viiteen tähteen.";
  }

  if (values.kommentti.length < COMMENT_MIN) {
    fieldErrors.kommentti = `Kerro kokemuksestasi vähintään ${COMMENT_MIN} merkillä.`;
  } else if (values.kommentti.length > COMMENT_MAX) {
    fieldErrors.kommentti = `Arvostelu saa olla enintään ${COMMENT_MAX} merkkiä.`;
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

  let restaurantName: string;
  let restaurantId: string | null = null;
  try {

    if (isNew) {
      // Onko ehdotettu ravintola jo hakemistossa? Liitetään silloin suoraan.
      const all = await writeClient.fetch<{ _id: string; name: string; city: string | null }[]>(
        /* groq */ `*[_type == "ravintola"]{ _id, name, "city": city->name }`,
      );
      const name = normalizeSearch(values.uusiNimi);
      const city = normalizeSearch(values.uusiKaupunki);
      const match = all.find(
        (r) => normalizeSearch(r.name) === name && normalizeSearch(r.city ?? "") === city,
      );
      restaurantId = match?._id ?? null;
      restaurantName = match?.name ?? values.uusiNimi;
    } else {
      // Varmistetaan että viitattu ravintola on olemassa — muuten
      // moderointijonoon syntyy rikkinäisiä viittauksia.
      const found = await writeClient.fetch<{ _id: string; name: string } | null>(
        /* groq */ `*[_type == "ravintola" && _id == $id][0]{ _id, name }`,
        { id: values.ravintola },
      );
      if (!found) {
        return {
          status: "error",
          message: "Lomakkeessa on puutteita. Korjaa alla merkityt kohdat.",
          fieldErrors: { ravintola: "Valittua ravintolaa ei löytynyt. Hae se uudelleen." },
          values,
        };
      }
      restaurantId = found._id;
      restaurantName = found.name;
    }

    await writeClient.create<Record<string, unknown>>({
      // Luonnos: ei näy julkisesti ennen kuin sihteeri julkaisee sen Studiossa.
      _id: `drafts.${randomUUID()}`,
      _type: "ravintolaKayttajaArvostelu",
      reviewerName: values.nimi,
      ...(restaurantId
        ? { restaurant: { _type: "reference", _ref: restaurantId } }
        : {
            ehdotettuRavintola: {
              nimi: values.uusiNimi,
              kaupunki: values.uusiKaupunki,
              maa: values.uusiMaa,
              ...(values.uusiLisatieto ? { lisatieto: values.uusiLisatieto } : {}),
            },
          }),
      stars,
      comment: values.kommentti,
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
    message: !restaurantId
      ? "Tarkistamme sen ja lisäämme ravintolan hakemistoon. Hyväksytty arvostelu " +
        "näkyy ravintolan omalla sivulla."
      : "Tarkistamme sen, ja hyväksytty arvostelu näkyy ravintolan omalla sivulla.",
    fieldErrors: {},
    values: EMPTY_REVIEW_VALUES,
    restaurantName,
  };
}
