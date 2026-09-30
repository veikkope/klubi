import { permanentRedirect } from "next/navigation";

import { TUNNISTEET_POLKU } from "@/lib/tunnisteet";

/** Pelkkä /uutiset/tunniste (esim. osoitetta lyhentämällä) → tunnistehakemisto. */
export default function TunnisteHakemistoonPage() {
  permanentRedirect(TUNNISTEET_POLKU);
}
