import { stegaClean } from "next-sanity";

import { UpotusKehys } from "./upotus-kehys";
import { tulkitseUpotus, UPOTUSPALVELUT } from "@/lib/upotus";

export type UpotusData = {
  osoite?: string | null;
  otsikko?: string | null;
  kuvateksti?: string | null;
};

/**
 * Kartta, lomake tai Vimeo-video tekstin seassa (docs/24 askel 6, skeema
 * sanity/schemas/objects/upotus.ts).
 *
 * Palvelinkomponentti: isän liittämä teksti tulkitaan täällä
 * (`tulkitseUpotus`, sallittu lista), ja selaimen komponentille välitetään
 * vain valmis osoite ja tekstit. Raaka `osoite` (esim. koko iframe-HTML) ei
 * päädy sivun HTML:ään eikä selaimen dataan.
 */
export function Upotus({ value }: { value: UpotusData }) {
  // Luonnosnäkymän stega-merkit pois ennen tulkintaa.
  const upotus = tulkitseUpotus(stegaClean(value?.osoite));
  if (!upotus) return null;
  const palvelu = UPOTUSPALVELUT[upotus.palvelu];
  return (
    <UpotusKehys
      palvelu={upotus.palvelu}
      src={upotus.src}
      avaaOsoite={upotus.avaaOsoite}
      suhde={upotus.suhde}
      korkeus={upotus.korkeus}
      otsikko={value.otsikko?.trim() || palvelu.nimi}
      kuvateksti={value.kuvateksti ?? null}
      tekstit={{ nayta: palvelu.nayta, avaa: palvelu.avaa, latausteksti: palvelu.latausteksti }}
    />
  );
}
