/**
 * Käyttämättömien tiedostojen siivous (docs/24 askel 7, kriitikon löydös K4).
 *
 * Julkisesta datasetistä kuka tahansa voi listata kaikki tiedostot nimineen,
 * myös lohkosta poistetut ja korvatut. Siksi yöllinen huolto (app/api/huolto)
 * poistaa tiedoston, jota mikään ei ole käyttänyt 7 päivään:
 *
 *  1. Tiedosto on `sanity.fileAsset` (PDF, Word, Excel). Kuvat eivät kuulu
 *     tähän siivoukseen: kävijöiden arvostelukuvilla on oma siivouksensa
 *     (sanity/lib/arvostelukuvat-siivous.ts), ja klubin omiin kuviin ei kosketa.
 *  2. Mikään dokumentti, luonnokset mukaan lukien, ei viittaa siihen.
 *  3. Huolto on havainnut sen käyttämättömäksi vähintään 7 päivää sitten
 *     (`havaittu`, kirjataan dokumenttiin `sivustonTila.huolto`), ja se on
 *     ladattu yli 7 päivää sitten. Näin vahingossa poistettu liite palautuu
 *     versiohistoriasta (3 päivää) tai varmuuskopiosta tiedostoineen, kun
 *     palautus tehdään **viikon sisällä** siitä, kun huolto havaitsi tiedoston
 *     käyttämättömäksi. Myöhemmin palautettu dokumentti tulee ilman tiedostoa,
 *     ja palautuksen ilmoitus kertoo puuttuvan tiedoston (lib/palautus.ts).
 *  4. **Varmuuskopiotiedostoihin ei kosketa koskaan**, vaikka varmuuskopio-
 *     dokumentti olisi poistettu: ne poistuvat vain varmuuskopioiden omalla
 *     kierrolla (app/api/varmuuskopio). Varmuuskopioksi tunnistetaan tiedosto,
 *     johon jokin `varmuuskopio`-dokumentti viittaa, sekä gzip- ja NDJSON-
 *     tiedostot (nimen pääte, `extension` tai `mimeType`); kopiot tallennetaan
 *     nimellä `varmuuskopio-<pvm>.ndjson.gz` (lib/varmuuskopio.ts). Pelkkä
 *     nimen etuliite `varmuuskopio-` ei suojaa: isän liite
 *     `varmuuskopio-jasenet.pdf` siivotaan kuten muutkin. Liitteeksi kelpaavat
 *     vain PDF, Word ja Excel (lib/liite.ts), joten gzip/NDJSON-suoja ei koske
 *     mitään, mitä isä on itse lisännyt.
 *
 * Mikä on "käyttöä": viittaus mistä tahansa dokumentista raw-näkökulmassa,
 * eli julkaistusta, luonnoksesta tai versiosta (`versions.*`), myös heikko
 * viittaus. Pelkkä osoite (`https://cdn.sanity.io/files/…` Muu osoite
 * -linkissä) ei ole viittaus, joten Studio hylkää sen (lib/linkki.ts,
 * `onSivustonTiedostoOsoite`).
 *
 * Puhdas moduuli: testataan komennolla `npm run test:tiedostosiivous`.
 */

/** Montako päivää käyttämätön tiedosto saa olla ennen poistoa. */
export const TIEDOSTON_ARMOAIKA_PAIVAA = 7;

/** Yhden ajon enimmäismäärä; loput poistuvat seuraavana yönä. */
export const TIEDOSTOJA_KERRALLA = 200;

const PAIVA_MS = 24 * 60 * 60 * 1000;

export type TiedostoAsset = {
  _id: string;
  _type?: string;
  _createdAt?: string;
  originalFilename?: string | null;
  extension?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

/**
 * Huollon muistiinpano käyttämättömästä tiedostosta. `asset` on tiedoston
 * tunnus merkkijonona, EI viittaus: viittaus tekisi tiedostosta käytetyn.
 */
export type OrpoTiedosto = { _key: string; asset: string; havaittu: string };

export const VARMUUSKOPION_PAATTEET: ReadonlySet<string> = new Set(["gz", "gzip", "ndjson"]);
export const VARMUUSKOPION_MIMET: ReadonlySet<string> = new Set(["application/gzip", "application/x-gzip", "application/x-ndjson"]);

/**
 * Onko tiedosto varmuuskopio (tai sen näköinen). Näihin siivous ei koske koskaan.
 * `suojatut`: tiedostot, joihin jokin `varmuuskopio`-dokumentti viittaa.
 * Etuliite `varmuuskopio-` (lib/varmuuskopio.ts) ei yksin riitä: kopio on aina
 * gzip-pakattu NDJSON, ja isän PDF voi alkaa samalla sanalla.
 */
export function onVarmuuskopioTiedosto(asset: TiedostoAsset, suojatut?: ReadonlySet<string>): boolean {
  if (suojatut?.has(asset._id)) return true;
  const nimi = (asset.originalFilename ?? "").trim().toLowerCase();
  if (/\.(ndjson|gz)$/.test(nimi)) return true;
  if (asset.extension && VARMUUSKOPION_PAATTEET.has(asset.extension.toLowerCase())) return true;
  if (asset.mimeType && VARMUUSKOPION_MIMET.has(asset.mimeType.toLowerCase())) return true;
  return false;
}

/** Armoajan raja: tätä vanhemmat ajat ovat yli 7 päivän takana. */
export function armoajanRaja(nyt: Date): Date {
  return new Date(nyt.getTime() - TIEDOSTON_ARMOAIKA_PAIVAA * PAIVA_MS);
}

function vanhempiKuin(aika: string | null | undefined, raja: Date): boolean {
  if (!aika) return false;
  const t = new Date(aika).getTime();
  return Number.isFinite(t) && t < raja.getTime();
}

/**
 * Saako käyttämättömäksi todetun tiedoston poistaa nyt. Kutsuja vastaa siitä,
 * ettei tiedostoon viitata (kysely `count(*[references(^._id)]) == 0` raw-
 * näkökulmassa). `havaittu` = milloin huolto näki sen ensimmäisen kerran
 * käyttämättömänä; ilman sitä ei poisteta.
 */
export function onSiivottavaTiedosto(
  asset: TiedostoAsset,
  nyt: Date,
  havaittu: string | null | undefined,
  suojatut?: ReadonlySet<string>,
): boolean {
  if (!asset || asset._type !== "sanity.fileAsset" || !asset._id) return false;
  if (onVarmuuskopioTiedosto(asset, suojatut)) return false;
  const raja = armoajanRaja(nyt);
  return vanhempiKuin(asset._createdAt, raja) && vanhempiKuin(havaittu, raja);
}

/**
 * Uusi muistiinpanolista: jokainen nyt käyttämätön tiedosto säilyttää
 * aiemman havaintopäivänsä, uusi saa päiväksi `nyt`. Tiedosto, joka on
 * huollon ajohetkellä taas käytössä tai poistettu, putoaa listalta (laskuri
 * alkaa alusta seuraavalla kerralla, kun se havaitaan käyttämättömäksi).
 *
 * Hyväksytty rajoitus: huolto katsoo tilanteen kerran yössä. Jos tiedosto
 * otetaan päivällä käyttöön ja poistetaan käytöstä ennen seuraavaa ajoa
 * (esim. liite lisätään luonnokseen ja luonnos hylätään samana päivänä),
 * huolto ei näe käyttöä, eikä laskuri nollaudu. "7 päivää käyttämättä"
 * tarkoittaa siis: käyttämättömänä jokaisessa yöllisessä tarkistuksessa
 * vähintään 7 päivän ajan.
 */
export function paivitaOrvot(
  edelliset: readonly OrpoTiedosto[] | null | undefined,
  orvot: readonly TiedostoAsset[],
  nyt: Date,
): OrpoTiedosto[] {
  const aiemmat = new Map((edelliset ?? []).filter((o) => o?.asset).map((o) => [o.asset, o.havaittu]));
  return orvot.map((asset) => ({
    _key: asset._id,
    asset: asset._id,
    havaittu: aiemmat.get(asset._id) ?? nyt.toISOString(),
  }));
}

/**
 * Huollon kirjaukseen lisättävä muistiinpano. Jos siivouksen kysely epäonnistui
 * (`muistiinpano` puuttuu), kenttää ei kirjoiteta, jolloin edellinen
 * muistiinpano havaintopäivineen säilyy eikä laskuri nollaudu.
 */
export function muistiinpanoKirjaukseen(
  muistiinpano: OrpoTiedosto[] | null | undefined,
): { orvotTiedostot?: OrpoTiedosto[] } {
  return muistiinpano ? { orvotTiedostot: muistiinpano } : {};
}

/** Päivä, jolloin tiedosto aikaisintaan poistetaan (näytetään kuivaharjoituksessa). */
export function poistoAikaisintaan(asset: TiedostoAsset, havaittu: string, nyt: Date): Date {
  const lisaa = (aika: string | undefined) =>
    aika ? new Date(new Date(aika).getTime() + TIEDOSTON_ARMOAIKA_PAIVAA * PAIVA_MS) : nyt;
  const a = lisaa(asset._createdAt);
  const b = lisaa(havaittu);
  return a > b ? a : b;
}

/** Huollon tulosrivin viesti. */
export function tiedostosiivouksenViesti(poistettu: number, epaonnistui: number, odottaa: number): string {
  const osat: string[] = [];
  if (poistettu > 0) {
    osat.push(poistettu === 1 ? "Poistettu 1 käyttämätön tiedosto." : `Poistettu ${poistettu} käyttämätöntä tiedostoa.`);
  }
  if (epaonnistui > 0) osat.push(`${epaonnistui} tiedoston poisto epäonnistui.`);
  if (poistettu === 0 && epaonnistui === 0) {
    osat.push(odottaa > 0 ? "Ei poistettavaa." : "Ei käyttämättömiä tiedostoja.");
  }
  if (odottaa > 0) {
    osat.push(
      `${odottaa === 1 ? "1 käyttämätön tiedosto odottaa" : `${odottaa} käyttämätöntä tiedostoa odottaa`} ` +
        `${TIEDOSTON_ARMOAIKA_PAIVAA} päivän armoaikaa.`,
    );
  }
  return osat.join(" ");
}
