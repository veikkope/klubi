import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionComponent } from "sanity";

import { kaupunkiAvain, nimiAvain } from "../../lib/ravintolan-nimi";
import { slugify } from "../../lib/slugify";
import { apiVersion } from "../env";

/**
 * "Hyväksy ja luo ravintola": kävijän ehdottaman uuden ravintolan arvostelu
 * hyväksytään yhdellä painalluksella.
 *
 * 1. Kaupunki haetaan nimellä (kirjainkoko ja ääkköset ohitetaan, sama maa
 *    ensin). Jos sitä ei ole, se luodaan.
 * 2. Jos sama ravintola on jo kaupungissa, käytetään sitä; muuten se luodaan ja
 *    julkaistaan (nimi, polku, kaupunki, osoite tai verkkosivu). Sama ravintola
 *    tunnistetaan samalla säännöllä kuin arvostelun lähetyksessä
 *    (lib/ravintolan-nimi.ts: "Ravintola Savu" = "savu"). Näin saman illan
 *    arvostelut päätyvät yhteen ravintolaan, vaikka ne olisi lähetetty
 *    täsmälleen yhtä aikaa tai hieman eri kirjoitusasuilla.
 * 3. Arvostelu liitetään ravintolaan ja julkaistaan.
 *
 * Ennen vahvistusta haetaan, onko ravintola jo olemassa, ja kerrotaan se
 * sihteerille: "liitetään olemassa olevaan" tai "luodaan uusi".
 *
 * Näkyy vain luonnoksessa, jossa on ehdotus eikä vielä ravintolaa.
 */

type Ehdotus = { nimi?: string; kaupunki?: string; maa?: string; lisatieto?: string };
type Kaupunki = { _id: string; name: string; country?: string | null };
type Loydetty = { cityId: string | null; ravintola: { _id: string; name: string } | null };

function asWebsite(value: string): string | null {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\.[^\s]+\.[a-z]{2,}/i.test(v)) return `https://${v}`;
  return null;
}

export const HyvaksyJaLuoRavintola: DocumentActionComponent = (props) => {
  const { id, type, draft, onComplete } = props;
  const client = useClient({ apiVersion });
  const { patch, publish } = useDocumentOperation(id, type);
  const [loydetty, setLoydetty] = useState<Loydetty | null>(null);
  const [busy, setBusy] = useState(false);
  const [virhe, setVirhe] = useState(false);

  const doc = draft as { restaurant?: unknown; ehdotettuRavintola?: Ehdotus } | null;
  const ehdotus = doc?.ehdotettuRavintola;
  if (!doc || doc.restaurant || !ehdotus?.nimi || !ehdotus.kaupunki) return null;

  const nimi = ehdotus.nimi.trim();
  const kaupunki = ehdotus.kaupunki.trim();
  const maa = (ehdotus.maa ?? "Suomi").trim() || "Suomi";

  async function uniqueSlug(docType: string, base: string, fallbackSuffix: string): Promise<string> {
    const candidates = [base, `${base}-${fallbackSuffix}`, ...[2, 3, 4, 5].map((n) => `${base}-${n}`)];
    const taken = await client.fetch<string[]>(
      `*[_type == $docType && slug.current in $candidates].slug.current`,
      { docType, candidates },
    );
    return candidates.find((c) => !taken.includes(c)) ?? `${base}-${Date.now().toString(36)}`;
  }

  /** Onko kaupunki ja ravintola jo olemassa (sama vertailusääntö kuin lähetyksessä). */
  async function etsi(): Promise<Loydetty> {
    const kaupungit = await client.fetch<Kaupunki[]>(
      `*[_type == "kaupunki" && !(_id in path("drafts.**"))]{ _id, name, country }`,
    );
    const kaupunkiOsumat = kaupungit.filter((k) => kaupunkiAvain(k.name) === kaupunkiAvain(kaupunki));
    const city =
      kaupunkiOsumat.find((k) => (k.country ?? "").toLocaleLowerCase("fi") === maa.toLocaleLowerCase("fi")) ??
      kaupunkiOsumat[0] ??
      null;
    if (!city) return { cityId: null, ravintola: null };
    const ravintolat = await client.fetch<{ _id: string; name: string }[]>(
      `*[_type == "ravintola" && !(_id in path("drafts.**")) && city._ref == $cityId]{ _id, name }`,
      { cityId: city._id },
    );
    const avain = nimiAvain(nimi);
    return { cityId: city._id, ravintola: ravintolat.find((r) => nimiAvain(r.name) === avain) ?? null };
  }

  async function run() {
    setBusy(true);
    setVirhe(false);
    try {
      // Haetaan uudelleen: toinen arvostelu on voinut luoda ravintolan juuri.
      const nyt = await etsi();

      // 1. Kaupunki
      let cityId = nyt.cityId;
      if (!cityId) {
        const created = await client.create({
          _type: "kaupunki",
          name: kaupunki,
          slug: { _type: "slug", current: await uniqueSlug("kaupunki", slugify(kaupunki), slugify(maa)) },
          country: maa,
        });
        cityId = created._id;
      }

      // 2. Ravintola
      let restaurantId = nyt.ravintola?._id ?? null;
      if (!restaurantId) {
        const website = ehdotus?.lisatieto ? asWebsite(ehdotus.lisatieto) : null;
        const created = await client.create({
          _type: "ravintola",
          name: nimi,
          slug: { _type: "slug", current: await uniqueSlug("ravintola", slugify(nimi), slugify(kaupunki)) },
          city: { _type: "reference", _ref: cityId },
          ...(website ? { website } : ehdotus?.lisatieto ? { address: ehdotus.lisatieto.trim() } : {}),
        });
        restaurantId = created._id;
      }

      // 3. Arvostelu liitetään ja julkaistaan.
      patch.execute([{ set: { restaurant: { _type: "reference", _ref: restaurantId } } }]);
      publish.execute();

      setLoydetty(null);
      onComplete();
    } catch (error) {
      console.error("[Hyväksy ja luo ravintola]", error);
      setVirhe(true);
    } finally {
      setBusy(false);
    }
  }

  const viesti = loydetty?.ravintola
    ? `Ravintola "${loydetty.ravintola.name}" (${kaupunki}) on jo hakemistossa, esimerkiksi toisen klubilaisen ` +
      "saman käynnin arvostelusta. Tämä arvostelu liitetään siihen ja julkaistaan; uutta ravintolaa ei luoda. Jatketaanko?"
    : `Ravintola "${nimi}" (${kaupunki}, ${maa}) lisätään hakemistoon ja tämä arvostelu julkaistaan sen sivulle. ` +
      (loydetty?.cityId
        ? ""
        : "Kaupunkia ei vielä ole, joten sekin luodaan: valitse sille myöhemmin maakunta Kaupungit-listassa. ") +
      "Ravintola näkyy sivustolla, kun vähintään kaksi klubilaista on arvioinut sen. Jatketaanko?";

  return {
    label: busy ? "Käsitellään…" : "Hyväksy ja luo ravintola",
    tone: "positive",
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      setVirhe(false);
      try {
        setLoydetty(await etsi());
      } catch (error) {
        console.error("[Hyväksy ja luo ravintola] haku", error);
        // Haku epäonnistui: vahvistus silti, run() hakee uudelleen.
        setLoydetty({ cityId: null, ravintola: null });
      } finally {
        setBusy(false);
      }
    },
    dialog: loydetty !== null && {
      type: "confirm",
      tone: virhe ? "critical" : "positive",
      message: virhe
        ? "Ravintolan luonti epäonnistui, eikä arvostelua julkaistu. Yritä uudelleen tai luo ravintola käsin Kaikki ravintolat -listassa."
        : viesti,
      onCancel: () => {
        setLoydetty(null);
        setVirhe(false);
      },
      onConfirm: run,
    },
  };
};
