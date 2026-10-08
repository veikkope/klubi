import { Info, TriangleAlert } from "lucide-react";
import { stegaClean } from "next-sanity";

import { cn } from "@/lib/cn";
import { huomionSavy, huomionSavynNimi } from "@/lib/sisaltolohkot";

export type HuomioData = {
  savy?: string | null;
  otsikko?: string | null;
  teksti?: string | null;
};

/**
 * Huomiolaatikko tekstin seassa (docs/24 askel 6, skeema
 * sanity/schemas/objects/huomio.ts).
 *
 * - Sävy ei ole pelkkä väri (WCAG 1.4.1): ikoni ja `aria-label` ("Tärkeä"
 *   tai otsikko) kertovat saman.
 * - Otsikko on kappale eikä h-tagi, jotta sisällön otsikkohierarkia ei muutu.
 * - Kontrastit: teksti #1b1d26 ja otsikko #141f4d vaalealla sinisellä
 *   (#e6e9fb) tai messingillä (#f3ead8) yli 12:1; ikonit #141f4d ja #5c4315
 *   yli 7:1.
 * - `savy` puhdistetaan stega-merkeistä: luonnosnäkymässä vertailu
 *   epäonnistuisi muuten.
 */
export function Huomiolaatikko({ savy: raakaSavy, otsikko, teksti }: HuomioData) {
  const tekstiSiisti = teksti?.trim();
  if (!tekstiSiisti) return null;
  const savy = huomionSavy(stegaClean(raakaSavy));
  const tarkea = savy === "tarkea";
  const Ikoni = tarkea ? TriangleAlert : Info;
  const nimi = otsikko?.trim() || huomionSavynNimi(savy);

  return (
    <div
      role="note"
      aria-label={nimi}
      className={cn(
        "mt-8 flex gap-3 rounded-lg border-l-4 px-5 py-4",
        tarkea ? "border-brass bg-brass-tint" : "border-navy bg-blue-tint",
      )}
    >
      <Ikoni aria-hidden className={cn("mt-1 size-5 shrink-0", tarkea ? "text-brass-tint-text" : "text-navy")} />
      <div className="min-w-0">
        {otsikko?.trim() && <p className="font-semibold text-heading">{otsikko}</p>}
        <p className={cn("whitespace-pre-line text-lg leading-relaxed text-foreground", otsikko?.trim() && "mt-1")}>
          {teksti}
        </p>
      </div>
    </div>
  );
}
