/**
 * Ohjeen kuvien manifestin tyypit (scripts/ohjekuvat/manifesti.ts).
 *
 * Kohteen valinta (vakain ensin):
 *  - { tyokalu: "structure" }       yläpalkin työkalu (aloitus, structure, presentation, ohjeet)
 *  - { rakenne: "uutiset" }         rakenteen listan kohta tai listan dokumentti (polun viimeinen osa)
 *  - { kentta: "title" }            lomakkeen kenttä, data-testid="field-<polku>" ("coverImage.alt",
 *                                   'body[_key=="abc"].savy')
 *  - { kenttaLoppu: ".piilota" }   ikkunan kenttä, kun polussa on vaihtuva avain (_key)
 *  - { testid: "pane-footer" }      Sanityn data-testid (node_modules/sanity)
 *  - { rooli: "button", nimi: "Julkaise" }   saavutettava rooli ja nimi
 *  - { ohje: "sivuston-tila" }      oma merkintä data-ohje="…" (lisätään komponenttiin)
 *  - { paneeli: -1 }                rakenteen paneeli (0 = ensimmäinen, -1 = viimeinen)
 *  - { valinta: true }              maalattu teksti (toiminto maalaa)
 *  - { teksti: "Odottaa sinua" }    näkyvä teksti (vain jos muu ei käy)
 *  - { css: "…" }                   viimeinen vaihtoehto
 * Jokaiseen kohteeseen voi lisätä `sisalla` (haetaan toisen kohteen sisältä)
 * ja `n` (monesko osuma, 0 = ensimmäinen, -1 = viimeinen).
 */
import type { Page } from "playwright";

/** Saavutettava rooli kuten Playwrightin getByRole. */
export type AriaRole = Parameters<Page["getByRole"]>[0];

interface KohdeYhteinen {
  /** Haetaan tämän kohteen sisältä. */
  sisalla?: Kohde;
  /** Monesko osuma (0 = ensimmäinen, oletus; -1 = viimeinen). */
  n?: number;
}

export type Kohde = KohdeYhteinen &
  (
    | { tyokalu: string }
    | { rakenne: string }
    | { kentta: string }
    /** Kenttä, jonka polku päättyy tähän (".piilota"): listan kohdan kenttä, kun avain vaihtelee. */
    | { kenttaLoppu: string }
    | { testid: string }
    | { rooli: AriaRole; nimi: string | RegExp; tarkka?: boolean }
    | { ohje: string }
    | { paneeli: number }
    | { valinta: true }
    | { teksti: string | RegExp }
    | { css: string }
  );

/**
 * Numeron paikka kohteeseen nähden. Oletus: ensimmäinen, joka mahtuu (vasen, ylä,
 * oikea, ala, sisä). "sisa" = kohteen sisällä vasemmassa yläkulmassa, "loppu" =
 * kohteen sisällä oikeassa reunassa (leveät listan rivit).
 */
export type Paikka = "vasen" | "oikea" | "yla" | "ala" | "sisa" | "loppu";

export interface Merkinta {
  /** Kohde tai useampi kohde (merkintä niiden yhteiselle alueelle, esim. "Nimi ja Rooli"). */
  kohde: Kohde | Kohde[];
  /** Ohut kehys kohteen ympärille (3 px). */
  kehys?: boolean;
  paikka?: Paikka;
}

export type Toiminto =
  | { klikkaa: Kohde }
  | { tuplaklikkaa: Kohde }
  /** Vie hiiren kohteen päälle (työkaluvihjeet). Jätä viimeiseksi: hiirtä ei silloin siirretä pois. */
  | { hiiri: Kohde }
  /** Vierittää kohteen näkyviin: oletus keskelle, "alku" = ylälaitaan. */
  | { vierita: Kohde; kohdistus?: "alku" | "keski" | "loppu" }
  /** Kirjoittaa näppäimistöllä (ensin klikkaus kohteeseen, jos annettu). */
  | { kirjoita: string; kohde?: Kohde }
  /** Maalaa tekstin kohteen sisältä (tekstieditori). */
  | { maalaa: string; kohde: Kohde }
  | { paina: string }
  | { odota: number | Kohde }
  /** Valitsee lomakkeen kenttäryhmän (välilehden) nimellä, esim. "kommentit". */
  | { ryhma: string }
  /** Avaa lomakkeen kohdan muokkausikkunan, esim. 'body[_key=="abc"]' (sama kuin klikkaus listan kohteeseen). */
  | { avaaKohta: string };

export interface Rajaus {
  /** Rajaukseen otetaan nämä kohteet merkintöjen (kohteet, kehykset, numerot) lisäksi. */
  kohteet?: Kohde[];
  /** Reunus rajauksen ympärille CSS-pikseleinä (oletus 24). */
  reunus?: number;
  /** Rajauksen vähimmäisleveys CSS-pikseleinä (oletus 480), jotta paikka tunnistuu. */
  minLeveys?: number;
  /** Vähimmäiskorkeus CSS-pikseleinä (oletus 0). */
  minKorkeus?: number;
}

/** Sanityn vastauksen muokkaus vain kuvaa varten (esim. punainen tilarivi), ei kirjoitusta. */
export interface VastauksenMuokkaus {
  /** Pyynnön osoitteen osa (säännöllinen lauseke). */
  osoite: RegExp;
  muokkaa: (json: unknown) => unknown;
}

export interface KuvaMaarite {
  /** Tilauksen id = tiedostonimi public/studio-ohje/<id>.webp. */
  id: string;
  /** Lyhyt kuvaus kehittäjälle (raportissa). Kortin alt-teksti tulee tilauksesta. */
  kuvaus: string;
  /** Aloitusnäkymä: studio:-linkki (kuten korttien `avaa`) tai /studio-polku. Oletus: tilauksen `avaa`. */
  avaa?: string;
  laite?: "tietokone" | "puhelin";
  /** Ikkunan korkeus CSS-pikseleinä (oletus 800): pitkä lomake yhteen kuvaan. Leveys pysyy. */
  korkeus?: number;
  /**
   * Ikkunan leveys (oletus 1280). Leveämpi vain, kun kuvassa pitää näkyä koko polku
   * valikosta lomakkeeseen: 1280 px:ssä Studio kutistaa vasemmat paneelit pystyotsikoiksi.
   */
  leveys?: number;
  /** Näkymä on valmis, kun tämä kohde näkyy (oletus: ensimmäinen merkintä). */
  valmis?: Kohde;
  /** Toiminnot ennen kuvaa (klikkaukset, välilehdet). Kirjoitukset Sanityyn estetään. */
  toiminnot?: Toiminto[];
  /** Numero → kohde. Numero = askeleen numero kortissa. */
  merkinnat: Record<number, Kohde | Merkinta>;
  /** "ikkuna" = koko ikkuna. Oletus: merkintöjen yhteinen alue + reunus. */
  rajaus?: "ikkuna" | Rajaus;
  /** Kuva tarvitsee esimerkkidataa (siemen.ts); ilman --ei-siementa se kirjoitetaan developmentiin. */
  siemen?: boolean;
  /**
   * Kuvaus kirjoittaa kenttään (esim. ehdotuslista näkyy vasta kirjoitettaessa). Studion
   * kirjoitus estetään silti; raportissa ⚠ eikä ✗.
   */
  kirjoittaa?: boolean;
  /**
   * Studion kirjoitukset, jotka päästetään läpi (vain development-datasettiin), esim.
   * Esikatselun oma esikatselusalaisuus (sanity.previewUrlSecret), jota ilman työkalu kaatuu.
   */
  sallitutKirjoitukset?: RegExp;
  /** Piilota dokumenttilistoista muut kuin siemenen rivit (listassa oikeiden ihmisten nimiä). */
  vainSiemen?: boolean;
  /** Sanityn vastausten muokkaukset (vain selaimessa, ei dataan). */
  vastaukset?: VastauksenMuokkaus[];
}
