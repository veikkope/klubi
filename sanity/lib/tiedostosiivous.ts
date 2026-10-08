import type { SanityClient } from "next-sanity";

import { TILA_ID } from "../../lib/sivuston-tila";
import {
  onSiivottavaTiedosto,
  onVarmuuskopioTiedosto,
  paivitaOrvot,
  TIEDOSTOJA_KERRALLA,
  VARMUUSKOPION_MIMET,
  VARMUUSKOPION_PAATTEET,
  type OrpoTiedosto,
  type TiedostoAsset,
} from "../../lib/tiedostosiivous";
import { VARMUUSKOPIO_TYYPPI } from "../../lib/varmuuskopio";

/**
 * Käyttämättömien tiedostojen siivous (docs/24 askel 7, K4). Säännöt:
 * lib/tiedostosiivous.ts. Malli: sanity/lib/arvostelukuvat-siivous.ts.
 *
 * Yksi kysely `raw`-näkökulmassa, jotta luonnosten ja versioiden viittaukset
 * lasketaan: muuten julkaisematta lisätty liite näyttäisi käyttämättömältä.
 * Kyselyssä ovat myös varmuuskopioiden tiedostot (suojataan aina) ja huollon
 * edellinen muistiinpano (milloin kukin tiedosto havaittiin käyttämättömäksi).
 *
 * Käyttö: app/api/huolto (yöllinen ajo, kirjaa muistiinpanon) ja
 * scripts/siivoa-tiedostot.ts (npm run siivoa:tiedostot, ei kirjaa).
 */

export type TiedostosiivouksenTulos = {
  /** Kaikki käyttämättömät tiedostot (ei varmuuskopioita). */
  orvot: (TiedostoAsset & { havaittu: string })[];
  /** Ne, jotka ovat olleet käyttämättä yli armoajan. */
  siivottavat: TiedostoAsset[];
  poistetut: string[];
  epaonnistuneet: string[];
  /** Huollon uusi muistiinpano (poistetut eivät ole mukana). */
  muistiinpano: OrpoTiedosto[];
  /** Varmuuskopiotiedostoja datasetissä (suojattu aina; vain tiedoksi). */
  varmuuskopiotiedostoja: number;
};

type Kysely = {
  orvot: TiedostoAsset[] | null;
  suojatut: (string | null)[] | null;
  edelliset: OrpoTiedosto[] | null;
  varmuuskopiotiedostoja: number | null;
};

/**
 * Kysely on yksi pyyntö: Sanityn pyyntöraja ei kuormitu. Varmuuskopiot
 * suodatetaan säännöllä `onVarmuuskopioTiedosto` (ei nimen etuliitteellä:
 * isän `varmuuskopio-jasenet.pdf` on tavallinen liite). Viittaus mistä
 * tahansa dokumentista (julkaistu, luonnos, `versions.*`, myös heikko)
 * lasketaan käytöksi.
 */
const KYSELY = /* groq */ `{
  "orvot": *[_type == "sanity.fileAsset" && count(*[references(^._id)]) == 0]
    | order(_createdAt asc)[0...1000]{
      _id, _type, _createdAt, originalFilename, extension, mimeType, size
    },
  "suojatut": *[_type == $varmuuskopio].tiedosto.asset._ref,
  "edelliset": *[_id == $huoltoId][0].orvotTiedostot,
  "varmuuskopiotiedostoja": count(*[_type == "sanity.fileAsset"
    && (extension in $paatteet || mimeType in $mimet
      || _id in *[_type == $varmuuskopio].tiedosto.asset._ref)])
}`;

export async function siivoaOrvotTiedostot(
  client: SanityClient,
  {
    dryRun = false,
    nyt = new Date(),
    havaintohetki = nyt,
  }: {
    dryRun?: boolean;
    /** Hetki, jota vasten 7 päivän armoaika lasketaan. */
    nyt?: Date;
    /** Uuden käyttämättömän tiedoston havaintopäivä (kuivaharjoituksen simulointi: todellinen hetki). */
    havaintohetki?: Date;
  } = {},
): Promise<TiedostosiivouksenTulos> {
  const raw = client.withConfig({ perspective: "raw", useCdn: false });
  const tulos = await raw.fetch<Kysely>(KYSELY, {
    paatteet: [...VARMUUSKOPION_PAATTEET],
    mimet: [...VARMUUSKOPION_MIMET],
    varmuuskopio: VARMUUSKOPIO_TYYPPI,
    huoltoId: TILA_ID.huolto,
  });

  const suojatut = new Set((tulos.suojatut ?? []).filter((id): id is string => Boolean(id)));
  // Varmuuskopiot pois jo ennen muistiinpanoa: niitä ei koskaan merkitä poistettaviksi.
  const orvot = (tulos.orvot ?? []).filter((a) => a?._id && !onVarmuuskopioTiedosto(a, suojatut));
  const muistiinpano = paivitaOrvot(tulos.edelliset, orvot, havaintohetki);
  const havaittu = new Map(muistiinpano.map((m) => [m.asset, m.havaittu]));
  const siivottavat = orvot
    .filter((a) => onSiivottavaTiedosto(a, nyt, havaittu.get(a._id), suojatut))
    .slice(0, TIEDOSTOJA_KERRALLA);

  const orvotHavaintoineen = orvot.map((a) => ({ ...a, havaittu: havaittu.get(a._id) ?? havaintohetki.toISOString() }));
  const varmuuskopiotiedostoja = tulos.varmuuskopiotiedostoja ?? 0;
  if (dryRun || siivottavat.length === 0) {
    return {
      orvot: orvotHavaintoineen,
      siivottavat,
      poistetut: [],
      epaonnistuneet: [],
      muistiinpano,
      varmuuskopiotiedostoja,
    };
  }

  // Peräkkäin, jotta Sanityn mutaatioiden nopeusraja ei täyty. Jos tiedosto on
  // ehditty ottaa käyttöön, Sanity kieltäytyy poistamasta sitä (vahva viittaus).
  const poistetut: string[] = [];
  const epaonnistuneet: string[] = [];
  for (const asset of siivottavat) {
    try {
      await raw.delete(asset._id);
      poistetut.push(asset._id);
    } catch (error) {
      console.warn(`[tiedostosiivous] ${asset._id} jäi poistamatta:`, error instanceof Error ? error.message : error);
      epaonnistuneet.push(asset._id);
    }
  }
  const poistettu = new Set(poistetut);
  return {
    orvot: orvotHavaintoineen,
    siivottavat,
    poistetut,
    epaonnistuneet,
    muistiinpano: muistiinpano.filter((m) => !poistettu.has(m.asset)),
    varmuuskopiotiedostoja,
  };
}
