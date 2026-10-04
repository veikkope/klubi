"use server";

import { randomUUID } from "node:crypto";

import { updateTag } from "next/cache";
import { createClient } from "next-sanity";

import {
  defaultPhotoAlt,
  PHOTO_ALT_FIELD,
  PHOTO_CONSENT_FIELD,
  PHOTO_FIELD,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  REVIEW_PHOTO_SOURCE,
  validatePhotos,
  type CleanPhoto,
} from "@/lib/arvostelukuvat";
import { ravintolaAvain } from "@/lib/ravintolan-nimi";
import { ilmoitaOsoitteeseen } from "@/lib/yhteystiedot";
import { apiVersion, dataset, hasSanity, projectId } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  COMMENT_MAX,
  EMPTY_REVIEW_VALUES,
  kayntipaivaVirhe,
  RATING_FIELDS,
  RATING_MAX,
  RATING_MIN,
  REVIEW_FIELD_LABELS,
  tanaan,
  TUOREET_TAG,
  type ReviewField,
  type ReviewFormState,
  type ReviewValues,
} from "./form-state";
import { tuoreetArvostelut, type Tuoreet } from "./tuoreet";

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
 * (sanity/actions/hyvaksy-ja-luo-ravintola.tsx). Saman ravintolan tunnistus
 * (lib/ravintolan-nimi.ts): jos ehdotettu ravintola on jo hakemistossa,
 * arvostelu liitetään siihen suoraan; jos toinen klubilainen on jo ehdottanut
 * samaa (odottaa hyväksyntää), ehdotus kirjoitetaan samoin, jolloin hyväksyntä
 * luo yhden ravintolan molemmille.
 *
 * Tietojen minimointi (GDPR art. 5): arvostelijalta kysytään vain julkaistava
 * nimi (klubilainen valitsee omansa listasta). Sähköpostia ei kerätä, koska
 * sille ei ole välttämätöntä käyttötarkoitusta.
 *
 * Kuvat (enintään 3, docs/18): selain pienentää ne JPEG:ksi, mutta palvelin
 * tarkistaa tyypin tiedoston alusta, poistaa metatiedot ja lataa kuvat
 * Sanityyn vasta, kun muu lomake on kunnossa. Sanityn kuvatiedostoilla ei ole
 * luonnostilaa, joten moderoimaton kuva on teknisesti haettavissa satunnaisesta
 * osoitteesta, kunnes sihteeri hylkää arvostelun ("Hylkää arvostelu" poistaa
 * myös kuvat).
 *
 * Validointi tehdään kokonaan palvelimella. Selaimen `required`-attribuutit
 * ovat käytettävyyttä varten, eivät suoja — lomakkeen voi lähettää suoraan
 * HTTP-pyyntönä ilman selainta.
 */

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Lomakkeen kuvat tavuiksi. Koko ja määrä tarkistetaan ennen lukemista, jotta
 * poikkeavan suurta pyyntöä ei pureta muistiin turhaan. Tarkempi tarkistus
 * (tyyppi, metatiedot, kuvaukset) tehdään `validatePhotos`-funktiossa.
 */
async function readPhotos(
  data: FormData,
): Promise<{ photos: { bytes: Uint8Array; alt: string }[] } | { error: string }> {
  const files = data.getAll(PHOTO_FIELD).filter((v): v is File => typeof v !== "string" && v.size > 0);
  const alts = data.getAll(PHOTO_ALT_FIELD).map((v) => (typeof v === "string" ? v : ""));
  if (files.length > PHOTO_MAX_COUNT) return { error: `Voit liittää enintään ${PHOTO_MAX_COUNT} kuvaa.` };
  const tooLarge = files.findIndex((f) => f.size > PHOTO_MAX_BYTES);
  if (tooLarge >= 0) return { error: `Kuva ${tooLarge + 1} on liian suuri. Poista se ja lisää se uudelleen.` };
  const photos = await Promise.all(
    files.map(async (file, i) => ({ bytes: new Uint8Array(await file.arrayBuffer()), alt: alts[i] ?? "" })),
  );
  return { photos };
}

/**
 * Tulvasuoja: jos moderointijonoon on tullut tunnin sisällä näin monta
 * arvostelua, uusia ei oteta vastaan hetkeen. Klubin normaali käyttö jää
 * kauas tästä (yhteisellä illallisella kymmenkunta), mutta botti tai
 * väärinkäyttö ei voi täyttää sihteerin jonoa eikä Sanityn ilmaiskiintiötä.
 */
const TULVARAJA_TUNNISSA = 30;

/** Satunnainen `_key` taulukon alkiolle. */
const arrayKey = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** Sanity-dokumentti-id: kirjaimia, numeroita, väliviivoja ja pisteitä. */
const DOCUMENT_ID = /^[A-Za-z0-9._-]{1,128}$/;

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
    klubilainen: text(formData, "klubilainen"),
    // Puuttuva päivä (esim. selain ilman JavaScriptiä) = tämä päivä.
    kayntipaiva: text(formData, "kayntipaiva") || tanaan(),
    ruoka: text(formData, "ruoka"),
    hinta: text(formData, "hinta"),
    viihtyvyys: text(formData, "viihtyvyys"),
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

  if (values.klubilainen && !DOCUMENT_ID.test(values.klubilainen)) values.klubilainen = "";
  if (values.nimi.length < 2) {
    fieldErrors.nimi = "Valitse nimesi tai kirjoita se (vähintään 2 merkkiä).";
  } else if (values.nimi.length > 80) {
    fieldErrors.nimi = "Nimi saa olla enintään 80 merkkiä.";
  }

  const kayntipaivaOngelma = kayntipaivaVirhe(values.kayntipaiva);
  if (kayntipaivaOngelma) fieldErrors.kayntipaiva = kayntipaivaOngelma;

  const ratings: Record<string, number> = {};
  for (const { field, schemaField } of RATING_FIELDS) {
    // Pilkku tai piste, yksi desimaali (pyöristetään): "3,3" → 3.3.
    const raw = values[field].replace(",", ".");
    const value = raw ? Number(raw) : Number.NaN;
    if (!Number.isFinite(value) || value < RATING_MIN || value > RATING_MAX) {
      fieldErrors[field] = `Anna osa-alueelle ${REVIEW_FIELD_LABELS[field].toLocaleLowerCase("fi-FI")} arvosana väliltä 1,0–5,0.`;
    } else {
      ratings[schemaField] = Math.round(value * 10) / 10;
    }
  }

  // Vapaaehtoinen: pelkät arvosanat riittävät.
  if (values.kommentti.length > COMMENT_MAX) {
    fieldErrors.kommentti = `Arvostelu saa olla enintään ${COMMENT_MAX} merkkiä.`;
  }

  let photos: CleanPhoto[] = [];
  const read = await readPhotos(formData);
  if ("error" in read) {
    fieldErrors.kuvat = read.error;
  } else {
    const checked = validatePhotos(read.photos, text(formData, PHOTO_CONSENT_FIELD) === "1");
    if (checked.ok) photos = checked.photos;
    else fieldErrors.kuvat = checked.error;
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
        "yhdistetty sivustoon. Arvosteluasi ei tallennettu. Yritä myöhemmin uudelleen.",
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
        `Arvosteluasi ei tallennettu. ${await ilmoitaOsoitteeseen()}`,
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

  const tunnissa = await writeClient
    .withConfig({ perspective: "raw" })
    .fetch<number>(
      /* groq */ `count(*[_type == "ravintolaKayttajaArvostelu" && _id in path("drafts.**")
        && dateTime(submittedAt) > dateTime(now()) - 60 * 60])`,
    )
    .catch(() => 0);
  if (tunnissa >= TULVARAJA_TUNNISSA) {
    console.warn(`[submitReview] tulvasuoja: ${tunnissa} arvostelua tunnin sisällä.`);
    return {
      status: "error",
      message:
        "Arvosteluja on tullut juuri nyt poikkeuksellisen paljon, joten vastaanotto on hetken tauolla. " +
        "Arvostelusi on tallessa tässä puhelimessa: yritä uudelleen tunnin kuluttua.",
      fieldErrors: {},
      values,
    };
  }

  let restaurantName: string;
  let restaurantId: string | null = null;
  const reviewId = randomUUID();
  // Tässä pyynnössä ladatut kuvat, jotka poistetaan, jos tallennus epäonnistuu.
  const uploadedAssetIds: string[] = [];
  try {

    if (isNew) {
      const avain = ravintolaAvain(values.uusiNimi, values.uusiKaupunki);
      // Onko ehdotettu ravintola jo hakemistossa? Liitetään silloin suoraan.
      const all = await writeClient.fetch<{ _id: string; name: string; city: string | null }[]>(
        /* groq */ `*[_type == "ravintola"]{ _id, name, "city": city->name }`,
      );
      const match = all.find((r) => ravintolaAvain(r.name, r.city ?? "") === avain);
      if (!match) {
        // Onko toinen klubilainen jo ehdottanut samaa (luonnos, odottaa hyväksyntää)?
        // Vanhin ehdotus ratkaisee kirjoitusasun, jotta kaikki saman illan
        // arvostelut kirjoitetaan samoin ja hyväksyntä yhdistää ne.
        const odottavat = await writeClient
          .withConfig({ perspective: "raw" })
          .fetch<{ nimi?: string; kaupunki?: string; maa?: string }[]>(
            /* groq */ `*[_type == "ravintolaKayttajaArvostelu" && _id in path("drafts.**")
              && !defined(restaurant._ref) && defined(ehdotettuRavintola.nimi) && defined(ehdotettuRavintola.kaupunki)
              && dateTime(submittedAt) > dateTime(now()) - 60 * 60 * 24 * 30]
              | order(submittedAt asc).ehdotettuRavintola`,
          );
        const sama = odottavat.find((e) => e.nimi && e.kaupunki && ravintolaAvain(e.nimi, e.kaupunki) === avain);
        if (sama?.nimi && sama.kaupunki) {
          values.uusiNimi = sama.nimi;
          values.uusiKaupunki = sama.kaupunki;
          if (sama.maa) values.uusiMaa = sama.maa;
        }
      }
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

    // Kuvat ladataan rinnakkain; järjestys säilyy. Sanity tunnistaa saman
    // tiedoston tiivisteestä ja palauttaa silloin olemassa olevan kuvan, joten
    // peruutuksessa poistetaan vain tämän lomakkeen merkinnällä ladatut.
    const uploads = await Promise.allSettled(
      photos.map((photo, index) =>
        writeClient.assets.upload("image", Buffer.from(photo.bytes), {
          filename: `arvostelu-${reviewId}-${index + 1}.jpg`,
          contentType: "image/jpeg",
          source: { name: REVIEW_PHOTO_SOURCE, id: reviewId },
          // Vain esikatselun sumennuskuva ja mitat; ei EXIF- eikä sijaintitietoja.
          extract: ["lqip"],
        }),
      ),
    );
    for (const result of uploads) {
      if (result.status === "fulfilled" && result.value.source?.name === REVIEW_PHOTO_SOURCE) {
        uploadedAssetIds.push(result.value._id);
      }
    }
    const failed = uploads.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed) throw failed.reason;
    // Klubilainen: lomakkeelta valittu, tai nimen perusteella, jos nimi
    // täsmää täsmälleen yhteen (kirjainkoko ja välit ohitetaan). Valitun
    // klubilaisen nimi otetaan Studiosta, jotta se on sama kaikissa arvosteluissa.
    const valittu = values.klubilainen
      ? await writeClient.fetch<{ _id: string; nimi: string | null } | null>(
          /* groq */ `*[_type == "klubilainen" && _id == $id][0]{ _id, nimi }`,
          { id: values.klubilainen },
        )
      : null;
    const nimenMukaan = valittu
      ? []
      : await writeClient.fetch<string[]>(
          /* groq */ `*[_type == "klubilainen" && lower(nimi) == lower($nimi)]._id`,
          { nimi: values.nimi.trim() },
        );
    const arvioijaId = valittu?._id ?? (nimenMukaan.length === 1 ? nimenMukaan[0] : null);
    const reviewerName = valittu?.nimi || values.nimi;

    const kuvat = uploads.map((result, index) => ({
      _key: arrayKey(),
      _type: "image",
      asset: { _type: "reference", _ref: (result as PromiseFulfilledResult<{ _id: string }>).value._id },
      alt: photos[index].alt || defaultPhotoAlt(restaurantName),
    }));

    await writeClient.create<Record<string, unknown>>({
      // Luonnos: ei näy julkisesti ennen kuin sihteeri julkaisee sen Studiossa.
      _id: `drafts.${reviewId}`,
      _type: "ravintolaKayttajaArvostelu",
      reviewerName,
      // Klubilainen valinnan tai nimen perusteella; sihteeri tarkistaa hyväksyessään.
      ...(arvioijaId ? { arvioija: { _type: "reference", _ref: arvioijaId } } : {}),
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
      ...ratings,
      ...(values.kommentti ? { comment: values.kommentti } : {}),
      kayntipaiva: values.kayntipaiva,
      ...(kuvat.length > 0 ? { kuvat } : {}),
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[submitReview] tallennus epäonnistui:", error);
    // Peruutus: ladatut kuvat pois, ettei moderoimattomia orpoja jää. Jos
    // poisto epäonnistuu, orvot voi poistaa: npm run siivoa:arvostelukuvat.
    await Promise.allSettled(uploadedAssetIds.map((id) => writeClient.delete(id)));
    return {
      status: "error",
      message:
        "Arvostelun tallennus epäonnistui teknisen virheen vuoksi. Arvosteluasi ei " +
        "tallennettu — yritä hetken kuluttua uudelleen.",
      fieldErrors: {},
      values,
    };
  }

  // Ravintola heti seuraavien arvostelijoiden "Viimeksi arvioidut" -listan kärkeen.
  if (restaurantId) updateTag(TUOREET_TAG);

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

/**
 * Ravintolavaiheen lista uudelleen (review-form.tsx): saman illan muiden juuri
 * lähettämät arvostelut ja ehdotukset näkyvät ilman sivun latausta. Palauttaa
 * pelkän datan eikä koske reitittimeen, joten se ei voi kilpailla vaiheen
 * vaihdon kanssa. Sama välimuisti kuin sivulla (lähetys tyhjentää sen).
 */
export async function paivitaTuoreet(): Promise<Tuoreet> {
  const ravintolat = await sanityFetch<{ _id: string }[]>({
    query: /* groq */ `*[_type == "ravintola" && defined(slug.current)]{ _id }`,
    tags: ["ravintola"],
    fallback: [],
  });
  return tuoreetArvostelut(ravintolat);
}
