import { useState } from "react";
import { EyeClosedIcon, EyeOpenIcon, TrashIcon } from "@sanity/icons";
import { useClient, type DocumentActionComponent } from "sanity";
import { usePaneRouter } from "sanity/structure";

import { apiVersion } from "../env";

/**
 * Kommentin moderointi yhdellä painikkeella (docs/15 §8, docs/09).
 *
 * Kommentit julkaistaan heti lomakkeelta. Jos sihteeri rastittaisi "Piilota
 * sivulta" -kentän käsin, Studio tekisi luonnoksen, ja kommentti näkyisi yhä
 * sivulla, kunnes hän muistaa painaa Julkaise. Nämä toiminnot muuttavat
 * julkaistua versiota suoraan, joten piilotus näkyy sivulla heti (webhook
 * tyhjentää tagin `kommentti`).
 */

type Kommentti = { nimi?: string; piilotettu?: boolean };

const nimiTai = (doc: Kommentti | null | undefined) => doc?.nimi?.trim() || "nimetön";

/** "Piilota sivulta" tai "Näytä sivulla" tilan mukaan. Ensisijainen toiminto. */
export const PiilotaKommentti: DocumentActionComponent = ({ id, draft, published, onComplete }) => {
  const client = useClient({ apiVersion });
  const [busy, setBusy] = useState(false);
  const [virhe, setVirhe] = useState(false);

  if (!published) return null;
  const piilossa = Boolean((published as Kommentti).piilotettu);

  async function run() {
    setBusy(true);
    setVirhe(false);
    try {
      const tx = client.transaction().patch(id, (p) => p.set({ piilotettu: !piilossa }));
      // Keskeneräinen käsimuokkaus ei saa julkaistaessa kumota piilotusta.
      if (draft) tx.patch(`drafts.${id}`, (p) => p.set({ piilotettu: !piilossa }));
      await tx.commit();
      onComplete();
    } catch (error) {
      console.error("[Kommentin piilotus]", error);
      setVirhe(true);
    } finally {
      setBusy(false);
    }
  }

  return {
    label: busy ? "Tallennetaan…" : piilossa ? "Näytä sivulla" : "Piilota sivulta",
    icon: piilossa ? EyeOpenIcon : EyeClosedIcon,
    tone: piilossa ? "positive" : "caution",
    disabled: busy,
    title: virhe
      ? "Tallennus epäonnistui. Yritä uudelleen hetken kuluttua."
      : piilossa
        ? "Kommentti palaa uutisen alle heti."
        : "Kommentti poistuu sivulta heti, mutta säilyy Studiossa. Voit palauttaa sen myöhemmin.",
    onHandle: run,
  };
};

/**
 * Pysyvä poisto (tietosuojapyyntö). Korvaa Studion tavallisen Poista-toiminnon,
 * jotta vahvistus kertoo selvästi eron piilottamiseen ja poistettu paneeli sulkeutuu.
 */
export const PoistaKommentti: DocumentActionComponent = ({ id, draft, published, onComplete }) => {
  const client = useClient({ apiVersion });
  const paneRouter = usePaneRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [virhe, setVirhe] = useState(false);

  if (!draft && !published) return null;
  const nimi = nimiTai((draft ?? published) as Kommentti);

  async function run() {
    setBusy(true);
    setVirhe(false);
    try {
      const tx = client.transaction();
      if (draft) tx.delete(`drafts.${id}`);
      if (published) tx.delete(id);
      await tx.commit();
      setDialogOpen(false);
      onComplete();
      try {
        paneRouter.closeCurrentAndAfter();
      } catch (error) {
        console.warn("[Kommentin poisto] paneelin sulkeminen ei onnistunut", error);
      }
    } catch (error) {
      console.error("[Kommentin poisto]", error);
      setVirhe(true);
    } finally {
      setBusy(false);
    }
  }

  return {
    label: busy ? "Poistetaan…" : "Poista pysyvästi",
    icon: TrashIcon,
    tone: "critical",
    disabled: busy,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: "confirm",
      tone: "critical",
      message: virhe
        ? "Poisto epäonnistui. Yritä uudelleen hetken kuluttua."
        : `Kirjoittajan ${nimi} kommentti poistetaan pysyvästi, eikä sitä voi palauttaa. ` +
          "Jos haluat vain pois sivulta, valitse mieluummin Piilota sivulta. Poistetaanko?",
      onCancel: () => {
        setDialogOpen(false);
        setVirhe(false);
      },
      onConfirm: run,
    },
  };
};
