/**
 * Palautus viikoittaisesta varmuuskopiosta Studiossa (docs/17 §D, docs/23 Y32).
 *
 * Sanityn ilmaistason versiohistoria kattaa vain 3 päivää. Vanhemman virheen
 * sihteeri korjaa itse: Studio lataa varmuuskopion (lib/varmuuskopio.ts),
 * poimii siitä dokumentin ja kirjoittaa sen LUONNOKSEKSI. Mikään ei muutu
 * sivustolla ennen kuin hän tarkistaa luonnoksen ja painaa Julkaise; luonnoksen
 * hylkäys perii palautuksen.
 *
 * Puhdas moduuli: testataan komennolla `npm run test:palautus`.
 */

export type VarmuuskopionDokumentti = {
  _id: string;
  _type: string;
  _rev?: string;
  _updatedAt?: string;
  _createdAt?: string;
  [kentta: string]: unknown;
};

/**
 * Tyypit, joita ei palauteta: varmuuskopiot itse, sivuston tila (järjestelmäloki), kommentit ja kävijöiden
 * arvostelut (moderointi poistaa ne tarkoituksella) sekä Sanityn tiedostot ja
 * järjestelmädokumentit. Kuvat säilyvät Sanityssa, joten palautettu sisältö
 * viittaa niihin suoraan.
 */
const EI_PALAUTETA = new Set(["varmuuskopio", "sivustonTila", "kommentti", "ravintolaKayttajaArvostelu"]);

export function voiPalauttaa(tyyppi: string | undefined): boolean {
  if (!tyyppi) return false;
  if (EI_PALAUTETA.has(tyyppi)) return false;
  return !tyyppi.startsWith("sanity.") && !tyyppi.startsWith("system.");
}

/** Poistaa `drafts.`- ja `versions.<x>.`-etuliitteen. */
export function julkaistuId(id: string): string {
  return id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
}

/** Varmuuskopion rivit (NDJSON) ilman tyhjiä rivejä. */
function rivit(ndjson: string): string[] {
  return ndjson.split("\n").filter((rivi) => rivi.trim() !== "");
}

/**
 * Yksi dokumentti varmuuskopiosta. Rivit haetaan ensin merkkijonona, jotta
 * 5 000 rivin kopiota ei tarvitse jäsentää kokonaan yhden dokumentin takia.
 */
export function etsiDokumentti(ndjson: string, id: string): VarmuuskopionDokumentti | null {
  const haettava = julkaistuId(id);
  const avain = `"_id":${JSON.stringify(haettava)}`;
  for (const rivi of rivit(ndjson)) {
    if (!rivi.includes(avain)) continue;
    const doc = JSON.parse(rivi) as VarmuuskopionDokumentti;
    if (doc._id === haettava) return doc;
  }
  return null;
}

/**
 * Luonnos palautettavaksi: sama sisältö `drafts.`-tunnisteella. Ylätason
 * järjestelmäkentät (`_rev`, aikaleimat, luonnoksen `_system.base` ym.) Sanity
 * asettaa itse, joten niistä säilyvät vain `_id` ja `_type`. Sisäkkäiset
 * `_key`-, `_ref`- ja `_type`-kentät ovat sisältöä ja säilyvät.
 */
export function luonnosVarmuuskopiosta(doc: VarmuuskopionDokumentti): VarmuuskopionDokumentti {
  const sisalto = Object.fromEntries(Object.entries(doc).filter(([kentta]) => !kentta.startsWith("_")));
  return { ...sisalto, _id: `drafts.${julkaistuId(doc._id)}`, _type: doc._type };
}

/** Ihmisluettava nimi listoihin: ensimmäinen täytetty tavallinen nimikenttä. */
export function dokumentinNimi(doc: Partial<VarmuuskopionDokumentti>): string {
  for (const kentta of ["title", "otsikko", "name", "nimi", "label"]) {
    const arvo = doc[kentta];
    if (typeof arvo === "string" && arvo.trim()) return arvo.trim();
  }
  return doc._id ?? "Nimetön";
}

export type PoistettuDokumentti = { id: string; tyyppi: string; nimi: string; muokattu?: string };

/**
 * Varmuuskopion dokumentit, joita ei enää ole datasetissä (julkaistuna eikä
 * luonnoksena). `olemassa` sisältää nykyiset tunnisteet ilman etuliitteitä.
 */
export function poistetutDokumentit(ndjson: string, olemassa: ReadonlySet<string>): PoistettuDokumentti[] {
  const tulos: PoistettuDokumentti[] = [];
  for (const rivi of rivit(ndjson)) {
    const doc = JSON.parse(rivi) as VarmuuskopionDokumentti;
    if (!voiPalauttaa(doc._type) || olemassa.has(julkaistuId(doc._id))) continue;
    tulos.push({ id: doc._id, tyyppi: doc._type, nimi: dokumentinNimi(doc), muokattu: doc._updatedAt });
  }
  return tulos.sort((a, b) => a.nimi.localeCompare(b.nimi, "fi"));
}

/** Haku nimestä, kirjainkoosta ja ääkkösten korostuksista välittämättä. */
export function osuuHakuun(nimi: string, haku: string): boolean {
  const normalisoi = (s: string) => s.toLocaleLowerCase("fi").normalize("NFC").trim();
  const sanat = normalisoi(haku).split(/\s+/).filter(Boolean);
  const kohde = normalisoi(nimi);
  return sanat.every((sana) => kohde.includes(sana));
}

/** Kaikki dokumentin viittausten kohteet (`_ref`), myös sisäkkäiset ja tekstin linkit. */
export function viitatutTunnisteet(doc: unknown): string[] {
  const tulos = new Set<string>();
  const kay = (arvo: unknown) => {
    if (Array.isArray(arvo)) {
      arvo.forEach(kay);
    } else if (arvo && typeof arvo === "object") {
      const ref = (arvo as { _ref?: unknown })._ref;
      if (typeof ref === "string" && ref) tulos.add(ref);
      Object.values(arvo).forEach(kay);
    }
  };
  kay(doc);
  return [...tulos];
}

/**
 * Viittaukset dokumentteihin, joita ei enää ole, heikoiksi (`_weak: true`)
 * (docs/24 askel 4). Sanity hylkää vahvan viittauksen puuttuvaan dokumenttiin,
 * joten luonnos ei muuten tallentuisi, jos varmuuskopion valikko tai teksti
 * linkittää sen jälkeen poistettuun sivuun. Studio näyttää heikon viittauksen
 * kohdalla oman ilmoituksensa, ja linkin tarkistus pyytää valitsemaan toisen
 * sivun. `olemassa`: olemassa olevien dokumenttien tunnisteet.
 *
 * Heikennys on pysyvä: viittaus ei muutu takaisin vahvaksi julkaistaessa
 * (ei `_strengthenOnPublish`), vaan vasta kun kohde valitaan uudelleen.
 * Hyväksytty: tilanne on harvinainen, ja Studio näyttää sen.
 */
export function heikennaPuuttuvatViittaukset<T>(doc: T, olemassa: ReadonlySet<string>): T {
  const kay = (arvo: unknown): unknown => {
    if (Array.isArray(arvo)) return arvo.map(kay);
    if (!arvo || typeof arvo !== "object") return arvo;
    const kopio = Object.fromEntries(Object.entries(arvo).map(([kentta, sisalto]) => [kentta, kay(sisalto)]));
    const ref = (arvo as { _ref?: unknown })._ref;
    if (typeof ref === "string" && ref && !olemassa.has(ref)) kopio._weak = true;
    return kopio;
  };
  return kay(doc) as T;
}

export type PuuttuvaTiedosto = { id: string; kuva: boolean; nimi: string | null };

const onTiedostoViite = (ref: string) => /^(file|image)-/.test(ref);

/**
 * Dokumentin viittaamien tiedostojen ja kuvien alkuperäiset nimet
 * varmuuskopiosta (kopiossa ovat tiedostojen tiedot, ei sisältöä). Haetaan
 * kopiota luettaessa, jotta koko kopiota ei tarvitse pitää muistissa.
 */
export function tiedostojenNimet(doc: unknown, ndjson: string): Record<string, string> {
  const nimet: Record<string, string> = {};
  for (const ref of viitatutTunnisteet(doc).filter(onTiedostoViite)) {
    const nimi = etsiDokumentti(ndjson, ref)?.originalFilename;
    if (typeof nimi === "string" && nimi.trim()) nimet[ref] = nimi.trim();
  }
  return nimet;
}

/**
 * Palautettavan dokumentin viittaamat tiedostot ja kuvat, joita ei enää ole
 * (esim. yöllinen huolto poisti liitteen, jota mikään ei ollut käyttänyt
 * 7 päivään, lib/tiedostosiivous.ts). Viittaus heikennetään, jotta luonnos
 * tallentuu, ja puute kerrotaan palautuksen ilmoituksessa: tiedosto ei
 * palaudu varmuuskopiosta.
 */
export function puuttuvatTiedostot(
  doc: unknown,
  olemassa: ReadonlySet<string>,
  nimet: Readonly<Record<string, string>> = {},
): PuuttuvaTiedosto[] {
  return viitatutTunnisteet(doc)
    .filter((ref) => onTiedostoViite(ref) && !olemassa.has(ref))
    .map((ref) => ({ id: ref, kuva: ref.startsWith("image-"), nimi: nimet[ref] ?? null }));
}

/** Ilmoituksen teksti puuttuvista tiedostoista, tai null, jos mitään ei puutu. */
export function puuttuvienTiedostojenViesti(puuttuvat: readonly PuuttuvaTiedosto[]): string | null {
  if (puuttuvat.length === 0) return null;
  return puuttuvat
    .map((p) => {
      const paate = /-([a-z0-9]+)$/i.exec(p.id)?.[1]?.toUpperCase();
      const nimi = p.nimi ? `"${p.nimi}"` : paate ? `(${paate})` : "";
      return `${p.kuva ? "Kuva" : "Liitetiedosto"}${nimi ? ` ${nimi}` : ""} puuttuu, se on poistettu. Lisää se uudelleen.`;
    })
    .join(" ");
}
