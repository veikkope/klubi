/**
 * Lehtileikkeiden esitysapurit (docs/20). Puhdas moduuli: `npm run test:litmanen`.
 */
import type { PortableTextBlock } from "@portabletext/react";

export interface Vuosiryhma<T> {
  vuosi: string;
  leikkeet: T[];
}

/** Ryhmittelee jutut julkaisuvuoden mukaan; järjestys säilyy (kysely: tuorein ensin). */
export function ryhmitteleVuosittain<T extends { julkaistu: string }>(leikkeet: T[]): Vuosiryhma<T>[] {
  const ryhmat: Vuosiryhma<T>[] = [];
  for (const leike of leikkeet) {
    const vuosi = leike.julkaistu.slice(0, 4);
    const viimeinen = ryhmat.at(-1);
    if (viimeinen?.vuosi === vuosi) viimeinen.leikkeet.push(leike);
    else ryhmat.push({ vuosi, leikkeet: [leike] });
  }
  return ryhmat;
}

function lohkonTeksti(lohko: PortableTextBlock): string {
  if (lohko._type !== "block" || !Array.isArray(lohko.children)) return "";
  return (lohko.children as { text?: string }[]).map((c) => c.text ?? "").join("");
}

/** Tätä lyhyempi juttu näytetään kokonaan ilman "Lue koko juttu" -painiketta. */
export const KOKONAAN_ALLE = 700;
/** Otteen tavoitepituus merkkeinä: 2–3 virkettä. */
export const OTTEEN_PITUUS = 320;

/**
 * Otteen teksti listanäkymään: jutun alku virkkeen rajalla katkaistuna.
 * `null`, kun juttu on niin lyhyt, että se näytetään kokonaan.
 *
 * Virkeraja: piste, kysymys- tai huutomerkki ja välilyönti. Jos ensimmäinen
 * virke on jo pidempi kuin tavoite, katkaistaan sanan kohdalta ja lisätään "…".
 */
export function leikkeenOte(teksti: PortableTextBlock[] | null | undefined): string | null {
  const kokonaan = (teksti ?? []).map(lohkonTeksti).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (kokonaan.length < KOKONAAN_ALLE) return null;

  const virkkeet = kokonaan.match(/[^.!?]+[.!?]+["”]?(\s|$)/g) ?? [];
  let ote = "";
  for (const virke of virkkeet) {
    if (ote && ote.length + virke.length > OTTEEN_PITUUS) break;
    ote += virke;
  }
  ote = ote.trim();
  if (!ote || ote.length > OTTEEN_PITUUS * 1.6) {
    ote = `${kokonaan.slice(0, OTTEEN_PITUUS).replace(/\s+\S*$/, "")}…`;
  }
  return ote;
}

/** "2009–2025" tai "2025", kun alku- ja loppuvuosi ovat samat. */
export function vuosivali(ensimmainen?: string | null, viimeisin?: string | null): string | null {
  const a = ensimmainen?.slice(0, 4);
  const b = viimeisin?.slice(0, 4);
  if (!a || !b) return a ?? b ?? null;
  return a === b ? a : `${a}–${b}`;
}
