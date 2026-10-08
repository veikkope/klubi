import { defineQuery } from "next-sanity";

import { routableProjection } from "@/lib/path";
import { JULKINEN_RAVINTOLA } from "@/lib/ravintola-arvosana";
import type { LinkkiData } from "@/lib/linkki";
import type { AiempiDokumentti } from "@/lib/ohjaukset";
import { JULKAISTU } from "./julkaisu";
import { linkkiProjektio } from "./linkki";

/**
 * Ohjauskartta 404-haaraan (docs/24 askel 8, lib/ohjaukset.ts): kaikki
 * isän ohjaukset ja kaikki sivustolla näkyvät dokumentit, joilla on aiempia
 * osoitteita. Ei parametreja: yksi välimuistiavain kaikille 404-vastauksille
 * (tagi `ohjaus`), joten bottien satunnaiset osoitteet eivät lisää Sanityn
 * kutsuja.
 *
 * Tyyppilista on kirjoitettu auki (typegen vaatii literaalin), ja testi
 * (`npm run test:ohjaukset`) varmistaa, että se vastaa joukkoa OHJATTAVAT_TYYPIT.
 */
export const ohjauskarttaQuery = defineQuery(`{
  "ohjaukset": *[_type == "ohjaus" && defined(lahde)] | order(_id asc){ _id, lahde, minne{ ${linkkiProjektio} } },
  "dokumentit": *[_type in ["sivu", "uutinen", "tapahtuma", "ravintola", "galleriaAlbumi", "klubiToiminta", "arvokisa", "pelaaja", "stadion", "jalkapalloTilasto"]
    && count(aiemmatPolut) > 0
    && !(_type == "uutinen" && !${JULKAISTU})
    && !(_type == "ravintola" && !${JULKINEN_RAVINTOLA})]{ ${routableProjection}, aiemmatPolut, _updatedAt }
}`);

export type OhjauskarttaRaaka = {
  ohjaukset: { _id: string; lahde: string | null; minne: LinkkiData | null }[];
  dokumentit: AiempiDokumentti[];
};
