import { useState } from "react";
import { TrashIcon } from "@sanity/icons";
import { useClient, type DocumentActionComponent } from "sanity";

import { REVIEW_PHOTO_SOURCE } from "../../lib/arvostelukuvat";
import { apiVersion } from "../env";

/**
 * "Hylkää arvostelu": poistaa kävijän lähettämän, julkaisemattoman arvostelun
 * ja sen kuvat yhdellä painalluksella (docs/18).
 *
 * Tavallinen Poista jättäisi kuvatiedostot Sanityyn, eikä niillä ole
 * luonnostilaa: moderoimaton kuva olisi haettavissa, kunnes siivous poistaa sen.
 * Siksi hylkäys poistaa kuvat heti.
 *
 * Poistetaan vain kuvat, jotka lomake on merkinnyt kävijän kuviksi
 * (`source.name`). Jos kuvaan viittaa jokin muu dokumentti, Sanity estää
 * poiston, ja kuva jää paikalleen.
 *
 * Näkyy vain julkaisemattomassa arvostelussa. Julkaistun arvostelun voi
 * poistaa tavallisesti; sen kuvat poistuvat päivittäisessä siivouksessa.
 */

type Kuva = { asset?: { _ref?: string } };

export const HylkaaArvostelu: DocumentActionComponent = (props) => {
  const { id, draft, published, onComplete } = props;
  const client = useClient({ apiVersion });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [virhe, setVirhe] = useState(false);

  if (!draft || published) return null;

  const doc = draft as { reviewerName?: string; kuvat?: Kuva[] };
  const assetIds = (doc.kuvat ?? [])
    .map((k) => k.asset?._ref)
    .filter((ref): ref is string => typeof ref === "string");
  const nimi = doc.reviewerName?.trim() || "nimetön";

  async function run() {
    setBusy(true);
    setVirhe(false);
    try {
      const omat = assetIds.length
        ? await client.fetch<string[]>(`*[_id in $ids && source.name == $source]._id`, {
            ids: assetIds,
            source: REVIEW_PHOTO_SOURCE,
          })
        : [];
      await client.delete(`drafts.${id}`);
      // Arvostelu on jo poistettu; epäonnistunut kuvan poisto ei ole kriittinen,
      // koska siivous poistaa orvot kuvat myöhemmin.
      const results = await Promise.allSettled(omat.map((assetId) => client.delete(assetId)));
      results.forEach((r) => {
        if (r.status === "rejected") console.warn("[Hylkää arvostelu] kuvan poisto epäonnistui", r.reason);
      });
      setDialogOpen(false);
      onComplete();
    } catch (error) {
      console.error("[Hylkää arvostelu]", error);
      setVirhe(true);
    } finally {
      setBusy(false);
    }
  }

  const kuvista =
    assetIds.length === 0 ? "" : assetIds.length === 1 ? " ja sen kuva" : ` ja sen ${assetIds.length} kuvaa`;

  return {
    label: busy ? "Poistetaan…" : "Hylkää arvostelu",
    icon: TrashIcon,
    tone: "critical",
    disabled: busy,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: "confirm",
      tone: "critical",
      message: virhe
        ? "Arvostelun poisto epäonnistui. Yritä uudelleen hetken kuluttua."
        : `Arvostelija ${nimi}: arvostelu${kuvista} poistetaan pysyvästi. Tätä ei voi perua. Jatketaanko?`,
      onCancel: () => {
        setDialogOpen(false);
        setVirhe(false);
      },
      onConfirm: run,
    },
  };
};
