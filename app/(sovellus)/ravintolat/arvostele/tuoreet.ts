/**
 * Arvostelun ravintolavaiheen "Viimeksi arvioidut" ja klubilaisten uuden
 * ravintolan ehdotukset (palvelimella; sivu page.tsx ja päivitys actions.ts).
 *
 * Erillään sivusta, jotta lista voidaan päivittää ravintolavaiheessa
 * palvelintoiminnolla (paivitaTuoreet) koskematta reitittimeen: reitittimen
 * päivitys (router.refresh) kilpaili vaiheen vaihdon kanssa ja palautti
 * osoitteen vanhaksi (4.10.2026).
 */
import { ravintolaAvain } from "@/lib/ravintolan-nimi";
import { readToken } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import {
  tuoreetArvostelutQuery,
  type RavintolaOption,
  type TuoreArvostelu,
} from "@/sanity/lib/queries/ravintolat";
import { TUOREET_TAG } from "./form-state";

export type Tuoreet = { tuoreet: TuoreArvostelu[]; ehdotukset: TuoreArvostelu[] };

/** Montako viimeksi arvosteltua ravintolaa näytetään ravintolavaiheessa. */
const TUOREITA = 5;

/** Haussa löytyvät klubilaisten uudet ehdotukset (kukin kerran). */
const EHDOTUKSIA = 30;

/**
 * Viimeksi arvostellut ravintolat (uusin ensin, kukin kerran) ja kaikki
 * klubilaisten odottavat uuden ravintolan ehdotukset haun käyttöön.
 * Lukutunnuksella mukana myös hyväksymättömät lähetykset (vain viite, aika,
 * klubilaisen nimi ja ehdotuksen nimi; ks. tuoreetArvostelutQuery). Sama
 * ehdotus tunnistetaan samalla säännöllä kuin lähetyksessä ja hyväksynnässä
 * (lib/ravintolan-nimi.ts). Apuominaisuus: virhe ei kaada sivua.
 */
export async function tuoreetArvostelut(ravintolat: Pick<RavintolaOption, "_id">[]): Promise<Tuoreet> {
  if (!client) return { tuoreet: [], ehdotukset: [] };
  const lukija = client.withConfig({
    useCdn: false,
    ...(readToken ? { token: readToken, perspective: "raw" as const } : {}),
  });
  try {
    const rivit = await lukija.fetch<TuoreArvostelu[]>(tuoreetArvostelutQuery, {}, {
      next: { tags: [TUOREET_TAG, "ravintolaKayttajaArvostelu"], revalidate: 60 },
    });
    const tunnetut = new Set(ravintolat.map((r) => r._id));
    const nahty = new Set<string>();
    const tuoreet: TuoreArvostelu[] = [];
    const ehdotukset: TuoreArvostelu[] = [];
    for (const rivi of rivit) {
      let avain: string;
      if (rivi.ravintola) {
        if (!tunnetut.has(rivi.ravintola)) continue;
        avain = rivi.ravintola;
      } else if (rivi.uusi?.nimi?.trim() && rivi.uusi.kaupunki?.trim()) {
        rivi.uusi = {
          nimi: rivi.uusi.nimi.trim().slice(0, 100),
          kaupunki: rivi.uusi.kaupunki.trim().slice(0, 60),
          maa: rivi.uusi.maa?.trim().slice(0, 60) || null,
        };
        avain = `uusi:${ravintolaAvain(rivi.uusi.nimi, rivi.uusi.kaupunki)}`;
      } else {
        continue;
      }
      // Uusin rivi edustaa ravintolaa tai ehdotusta.
      if (nahty.has(avain)) continue;
      nahty.add(avain);
      if (tuoreet.length < TUOREITA) tuoreet.push(rivi);
      if (rivi.uusi && ehdotukset.length < EHDOTUKSIA) ehdotukset.push(rivi);
    }
    return { tuoreet, ehdotukset };
  } catch (error) {
    console.error("[arvostele] viimeksi arvostellut epäonnistui:", error);
    return { tuoreet: [], ehdotukset: [] };
  }
}
