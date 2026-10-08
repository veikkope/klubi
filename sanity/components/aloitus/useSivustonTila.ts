import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient, type SanityClient } from "sanity";

import { apiVersion } from "../../env";
import {
  DATASETIT,
  huollonTila,
  julkaisemattomienTila,
  kiintionTila,
  KIINTIO,
  otteluhaunTila,
  puuttuvatPerustiedot,
  varmuuskopionTila,
  type AjoDokumentti,
  type Perustiedot,
  type PuuttuvaTieto,
  type TilaRivi,
} from "../../../lib/sivuston-tila";
import { ALOITUS_KYSELY, aloituksenParametrit, KIINTIO_KYSELY } from "../../lib/tehtavat";

/**
 * Aloitus-näkymän tiedot (docs/24 askel 7). Haetaan kerran, kun näkymä
 * avataan, ja uudelleen Päivitä-painikkeesta. Kuuntelua ei ole, jotta Sanityn
 * pyyntökiintiö säästyy: yksi kysely + yksi laskenta kustakin datasetistä.
 *
 * Kaikki luetaan kirjautuneen käyttäjän istunnolla; kirjoittavaa tokenia ei
 * tarvita. Management- ja Hooks-rajapintoja ei käytetä (docs/24 R19).
 */

export type Laskurit = Record<string, number>;

type AloitusData = {
  laskurit?: Laskurit | null;
  varmuuskopio?: { paiva?: string | null; dokumentteja?: number | null } | null;
  huolto?: AjoDokumentti;
  varmuuskopioAjo?: AjoDokumentti;
  perustiedot?: Perustiedot | null;
};

export type SivustonTilaTiedot = {
  rivit: TilaRivi[] | null;
  laskurit: Laskurit | null;
  puuttuvat: PuuttuvaTieto[];
  virhe: string | null;
  ladataan: boolean;
  lataa: () => void;
};

type Tulos = { rivit: TilaRivi[]; laskurit: Laskurit; puuttuvat: PuuttuvaTieto[] };

/** Yksi kysely datasetistä ja kiintiön laskenta kustakin datasetistä. */
async function haeTila(client: SanityClient): Promise<Tulos> {
  const nykyinen = client.config().dataset ?? "";
  const datasetit = [...new Set<string>([nykyinen, ...DATASETIT])].filter(Boolean);
  const [data, maarat] = await Promise.all([
    client.fetch<AloitusData>(ALOITUS_KYSELY, aloituksenParametrit()),
    // Toisen datasetin virhe ohitetaan: silloin luku on vain tästä datasetistä.
    Promise.allSettled(datasetit.map((d) => client.withConfig({ dataset: d }).fetch<number>(KIINTIO_KYSELY))),
  ]);
  const onnistuneet = maarat.flatMap((m) => (m.status === "fulfilled" && typeof m.value === "number" ? [m.value] : []));
  const nykyinenOk = maarat[0]?.status === "fulfilled";
  const kaytossa = nykyinenOk ? onnistuneet.reduce((a, b) => a + b, 0) : null;
  const nyt = new Date();
  const laskurit = data.laskurit ?? {};
  return {
    rivit: [
      varmuuskopionTila(data.varmuuskopio ?? null, data.varmuuskopioAjo ?? null, nyt),
      huollonTila(data.huolto ?? null, nyt),
      otteluhaunTila(data.huolto ?? null, nyt),
      julkaisemattomienTila(laskurit.julkaisemattomat ?? 0),
      kiintionTila(kaytossa, KIINTIO, { vainTamaDatasetti: onnistuneet.length < datasetit.length }),
    ],
    laskurit,
    puuttuvat: puuttuvatPerustiedot(data.perustiedot),
  };
}

export function useSivustonTila(): SivustonTilaTiedot {
  const studionClient = useClient({ apiVersion });
  const client = useMemo(() => studionClient.withConfig({ perspective: "raw", useCdn: false }), [studionClient]);

  const [tulos, setTulos] = useState<Tulos | null>(null);
  const [virhe, setVirhe] = useState<string | null>(null);
  const [ladataan, setLadataan] = useState(true);
  // Päivitä-painike kasvattaa tätä, jolloin haku tehdään uudelleen.
  const [kierros, setKierros] = useState(0);

  useEffect(() => {
    let peruttu = false;
    (async () => {
      try {
        const uusi = await haeTila(client);
        if (peruttu) return;
        setTulos(uusi);
        setVirhe(null);
      } catch (error) {
        console.error("[Aloitus] tilan haku epäonnistui:", error);
        if (!peruttu) setVirhe("Sivuston tilaa ei saatu haettua. Yritä hetken kuluttua uudelleen Päivitä-painikkeesta.");
      } finally {
        if (!peruttu) setLadataan(false);
      }
    })();
    return () => {
      peruttu = true;
    };
  }, [client, kierros]);

  const lataa = useCallback(() => {
    setLadataan(true);
    setVirhe(null);
    setKierros((k) => k + 1);
  }, []);

  return {
    rivit: tulos?.rivit ?? null,
    laskurit: tulos?.laskurit ?? null,
    puuttuvat: tulos?.puuttuvat ?? [],
    virhe,
    ladataan,
    lataa,
  };
}
