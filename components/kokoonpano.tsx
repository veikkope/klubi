import { cn } from "@/lib/cn";

export type KokoonpanoData = {
  _key?: string;
  otsikko?: string | null;
  selite?: string | null;
  rivit?:
    | {
        _key?: string;
        nimi?: string | null;
        pelaajat?: { _key?: string; nimi?: string | null; luku?: number | null }[] | null;
      }[]
    | null;
};

/** Rivin nimi ruudunlukijalle, jos sitä ei ole annettu Studiossa. */
function rivinNimi(index: number, maara: number): string {
  if (index === maara - 1) return "Maalivahti";
  if (index === 0) return "Hyökkäys";
  if (index === maara - 2) return "Puolustus";
  return "Keskikenttä";
}

/**
 * Kokoonpano pelikentällä (Portable Text -lohko `kokoonpano`, skeema
 * sanity/schemas/objects/kokoonpano.ts).
 *
 * Kenttä on oma puolikas pystysuunnassa: maali alhaalla, ja kenttä alkaa
 * keskiviivasta, joka on samalla kentän yläreuna. Keskiympyrästä näkyy vain
 * kentän puoleinen kaari. Rivit (hyökkäys → maalivahti) jaetaan
 * tasaisesti kentän korkeudelle ja pelaajat rivin leveydelle.
 *
 * Saavutettavuus: viivat ovat koristetta (aria-hidden). Pelaajat ovat
 * rivikohtaisissa listoissa, joiden nimi kertoo pelipaikan ("Puolustus"),
 * joten ruudunlukija lukee kokoonpanon järjestyksessä: nimi ja luku.
 * Valkoinen teksti on tummalla nurmella ja nimien pohjana tumma laatta (AA).
 */
export function Kokoonpano({
  value,
  Otsikko,
}: {
  value: KokoonpanoData;
  /** Otsikon HTML-taso tulee Portable Textin otsikkotasoista. */
  Otsikko: (props: { children?: React.ReactNode }) => React.ReactNode;
}) {
  const rivit = (value.rivit ?? []).filter((r) => (r.pelaajat?.length ?? 0) > 0);
  if (rivit.length === 0) return null;
  const n = rivit.length;
  // Rivien pystysijainti: ylin rivi 17 % (keskiympyrän kaaren tasolla), maalivahti 85 %.
  const y = (i: number) => (n === 1 ? 50 : 17 + (i * (85 - 17)) / (n - 1));

  return (
    <figure className="mt-10">
      {value.otsikko && <Otsikko>{value.otsikko}</Otsikko>}
      <div className="kokoonpano-kentta relative mx-auto mt-5 aspect-square w-full max-w-[540px] overflow-hidden rounded-sm shadow-panel">
        <svg
          aria-hidden
          viewBox="0 0 68 68"
          className="absolute inset-0 size-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.35"
        >
          {/* Ulkoreunat (yläreuna = keskiviiva) ja keskiympyrän kentän puoleinen kaari */}
          <rect x="2" y="2" width="64" height="64" />
          <path d="M 24.85 2 A 9.15 9.15 0 0 0 43.15 2" />
          {/* Rangaistusalue, maalialue, pilkku ja kaari */}
          <rect x="13.84" y="49.5" width="40.32" height="16.5" />
          <rect x="24.84" y="60.5" width="18.32" height="5.5" />
          <circle cx="34" cy="55" r="0.5" fill="currentColor" />
          <path d="M 26.69 49.5 A 9.15 9.15 0 0 1 41.31 49.5" />
          <rect x="30.34" y="66" width="7.32" height="1.6" />
        </svg>

        {rivit.map((rivi, i) => (
          <ul
            key={rivi._key ?? i}
            aria-label={rivi.nimi?.trim() || rivinNimi(i, n)}
            className="absolute inset-x-0 flex -translate-y-1/2 justify-evenly px-1 sm:px-3"
            style={{ top: `${y(i)}%` }}
          >
            {(rivi.pelaajat ?? []).map((p, j) => (
              <li
                key={p._key ?? j}
                className="flex min-w-0 flex-1 basis-0 flex-col-reverse items-center gap-1 text-center sm:gap-1.5"
              >
                {/* DOM-järjestys nimi → luku (ruudunlukija), näkyvä järjestys pallo → nimi. */}
                <span className="max-w-full rounded-xs bg-navy/85 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-[13px]">
                  {p.nimi}
                </span>
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 border-white bg-surface font-display text-[15px] font-semibold tabular-nums text-heading shadow-sm sm:size-11 sm:text-lg",
                    typeof p.luku !== "number" && "text-transparent",
                  )}
                >
                  {typeof p.luku === "number" ? p.luku : <span aria-hidden>·</span>}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      {value.selite && <figcaption className="mx-auto mt-3 max-w-[540px] text-sm text-muted">{value.selite}</figcaption>}
    </figure>
  );
}
