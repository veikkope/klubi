import { useState } from "react";
import { useClient, useDocumentOperation, type DocumentActionComponent } from "sanity";

import { slugify } from "../../lib/slugify";
import { apiVersion } from "../env";

/**
 * "Hyväksy ja luo ravintola": kävijän ehdottaman uuden ravintolan arvostelu
 * hyväksytään yhdellä painalluksella.
 *
 * 1. Kaupunki haetaan nimellä (kirjainkoko ohitetaan). Jos sitä ei ole, se luodaan.
 * 2. Ravintola luodaan ja julkaistaan (nimi, polku, kaupunki, osoite tai
 *    verkkosivu). Jos samanniminen ravintola on jo samassa kaupungissa,
 *    käytetään sitä.
 * 3. Arvostelu liitetään ravintolaan ja julkaistaan.
 *
 * Näkyy vain luonnoksessa, jossa on ehdotus eikä vielä ravintolaa.
 */

type Ehdotus = { nimi?: string; kaupunki?: string; maa?: string; lisatieto?: string };

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
  const [dialogOpen, setDialogOpen] = useState(false);
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

  async function run() {
    setBusy(true);
    setVirhe(false);
    try {
      // 1. Kaupunki
      let cityId = await client.fetch<string | null>(
        `*[_type == "kaupunki" && !(_id in path("drafts.**")) && lower(name) == lower($kaupunki)]
          | order(select(lower(country) == lower($maa) => 0, 1))[0]._id`,
        { kaupunki, maa },
      );
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
      let restaurantId = await client.fetch<string | null>(
        `*[_type == "ravintola" && !(_id in path("drafts.**")) && lower(name) == lower($nimi) && city._ref == $cityId][0]._id`,
        { nimi, cityId },
      );
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

      setDialogOpen(false);
      onComplete();
    } catch (error) {
      console.error("[Hyväksy ja luo ravintola]", error);
      setVirhe(true);
    } finally {
      setBusy(false);
    }
  }

  return {
    label: busy ? "Luodaan…" : "Hyväksy ja luo ravintola",
    tone: "positive",
    disabled: busy,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: "confirm",
      tone: virhe ? "critical" : "positive",
      message: virhe
        ? "Ravintolan luonti epäonnistui, eikä arvostelua julkaistu. Yritä uudelleen tai luo ravintola käsin Kaikki ravintolat -listassa."
        : `Ravintola "${nimi}" (${kaupunki}, ${maa}) lisätään hakemistoon ja tämä arvostelu julkaistaan sen sivulle. ` +
          "Jos kaupunkia ei vielä ole, sekin luodaan: valitse sille myöhemmin maakunta Kaupungit-listassa. " +
          "Ravintola näkyy sivustolla, kun vähintään kaksi klubilaista on arvioinut sen. Jatketaanko?",
      onCancel: () => {
        setDialogOpen(false);
        setVirhe(false);
      },
      onConfirm: run,
    },
  };
};
