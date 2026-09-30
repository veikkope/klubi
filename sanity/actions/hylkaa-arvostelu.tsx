import { useState } from "react";
import { TrashIcon } from "@sanity/icons";
import { useClient, type DocumentActionComponent } from "sanity";

import { REVIEW_PHOTO_SOURCE } from "../../lib/arvostelukuvat";
import { apiVersion } from "../env";

/**
 * Kävijän arvostelun poisto kuvineen (docs/18). Korvaa Studion tavallisen
 * Poista-toiminnon tälle tyypille (sanity.config.ts), jotta kuvat lähtevät
 * aina arvostelun mukana.
 *
 * - Julkaisematon arvostelu: "Hylkää arvostelu" (moderointi).
 * - Julkaistu arvostelu: "Poista arvostelu" (esim. tietosuojapyyntö).
 *   Poistaa sekä julkaistun version että mahdollisen luonnoksen.
 *
 * Tavallinen Poista jättäisi kuvatiedostot Sanityyn, eikä niillä ole
 * luonnostilaa: moderoimaton kuva olisi haettavissa rajapinnasta.
 *
 * Poistetaan vain kuvat, jotka lomake on merkinnyt kävijän kuviksi
 * (`source.name`). Jos kuvaan viittaa jokin muu dokumentti, Sanity estää
 * poiston, ja kuva jää paikalleen.
 */

type Kuva = { asset?: { _ref?: string } };
type Arvostelu = { reviewerName?: string; kuvat?: Kuva[] };

const kuvaIdt = (doc: Arvostelu | null) =>
  (doc?.kuvat ?? []).map((k) => k.asset?._ref).filter((ref): ref is string => typeof ref === "string");

export const HylkaaArvostelu: DocumentActionComponent = (props) => {
  const { id, draft, published, onComplete } = props;
  const client = useClient({ apiVersion });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [virhe, setVirhe] = useState(false);

  if (!draft && !published) return null;

  const julkaistu = Boolean(published);
  const assetIds = [...new Set([...kuvaIdt(draft as Arvostelu | null), ...kuvaIdt(published as Arvostelu | null)])];
  const nimi = ((draft ?? published) as Arvostelu).reviewerName?.trim() || "nimetön";

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
      const tx = client.transaction();
      if (draft) tx.delete(`drafts.${id}`);
      if (published) tx.delete(id);
      await tx.commit();
      // Arvostelu on jo poistettu. Jos kuvan poisto epäonnistuu, orvon kuvan
      // voi poistaa myöhemmin: npm run siivoa:arvostelukuvat.
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
    label: busy ? "Poistetaan…" : julkaistu ? "Poista arvostelu" : "Hylkää arvostelu",
    icon: TrashIcon,
    tone: "critical",
    disabled: busy,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: "confirm",
      tone: "critical",
      message: virhe
        ? "Arvostelun poisto epäonnistui. Yritä uudelleen hetken kuluttua."
        : `Arvostelija ${nimi}: arvostelu${kuvista} poistetaan pysyvästi` +
          `${julkaistu ? " myös ravintolan sivulta" : ""}. Tätä ei voi perua. Jatketaanko?`,
      onCancel: () => {
        setDialogOpen(false);
        setVirhe(false);
      },
      onConfirm: run,
    },
  };
};
