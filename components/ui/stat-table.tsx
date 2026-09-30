import { cn } from "@/lib/cn";
import { formatInterval, formatIso, NUMEERISET, parseIso } from "@/lib/taulukko";

/**
 * Jalkapalloarkiston tilastotaulukko.
 *
 * Kolme vaatimusta ohjaavat toteutusta:
 *  - **Saavutettavuus:** `<caption>` ja `<th scope>` ovat pakollisia, jotta
 *    ruudunlukija kertoo mihin sarakkeeseen solu kuuluu.
 *  - **Responsiivisuus:** leveä taulukko vierii omassa säiliössään, ei koskaan
 *    bodyssä. `tabindex={0}` tekee vierityksestä näppäimistökäyttöisen.
 *    Ensimmäinen sarake (rivin nimi) pysyy paikallaan vaakavierityksessä, ja
 *    reunavarjot kertovat, että sivulle on vieritettävää (`.taulukko-*`,
 *    globals.css). Rivien taustat ovat läpinäkymättömiä, jotta kiinnitetty
 *    sarake peittää alleen vierivän sisällön.
 *  - **GEO:** data on oikeaa HTML-taulukkoa, ei kuvaa eikä canvasta — vain
 *    silloin vastausmoottori voi lukea sen.
 */

export interface StatColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "year" | "link";
}

export interface StatRow {
  cells: { key: string; value?: string | null }[] | null;
}

interface StatTableProps {
  caption: string;
  /** Piilota kuvaus visuaalisesti, jos otsikko on jo sivulla näkyvissä. */
  captionVisible?: boolean;
  columns: StatColumn[];
  rows: StatRow[];
  className?: string;
  emptyLabel?: string;
}

const numericTypes = NUMEERISET;

/**
 * Ensimmäinen sarake pysyy vasemmassa reunassa. Tausta periytyy riviltä
 * (sisältö ei näy läpi), ja varjo erottaa sen vierivästä sisällöstä.
 */
const kiinnitetty = "taulukko-kiinnitetty sticky left-0 z-[1] bg-inherit";

function cellValue(row: StatRow, key: string): string {
  // Tyhjä solu on tuonnissa jätetty kokonaan pois (ei tyhjiä merkkijonoja),
  // joten sekä puuttuva solu että puuttuva arvo tulkitaan tyhjäksi.
  return (row.cells ?? []).find((cell) => cell.key === key)?.value?.trim() ?? "";
}

const integer = /^-?\d+$/;

const numberFormat = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });

/**
 * Solun näyttömuoto:
 *  - päivämääräsarake: ISO-päivä (2026-09-26) → 26.09.2026, kuukausi
 *    (2026-09) → 09/2026 ja väli (2009-01-30/2009-02-01) → 30.01.–01.02.2009,
 *    aina koneluettavana `<time dateTime>`-elementtinä (väli kahtena: alku ja loppu)
 *  - lukusarake: kokonaisluku suomalaisella tuhaterottimella (61 035)
 *  - muut arvot sellaisenaan (osa arkiston arvoista on tekstiä tarkoituksella).
 */
function CellContent({ value, type }: { value: string; type?: StatColumn["type"] }) {
  if (type === "date") {
    const single = parseIso(value);
    if (single) return <time dateTime={value}>{formatIso(single)}</time>;
    const [a, b, ...rest] = value.split("/");
    const start = a ? parseIso(a) : null;
    const end = b ? parseIso(b) : null;
    if (start && end && rest.length === 0) {
      // `datetime` ei hyväksy ISO-väliä, joten alku ja loppu omina elementteinään.
      const [startText, endText] = formatInterval(start, end);
      return (
        <>
          <time dateTime={a}>{startText}</time>–<time dateTime={b}>{endText}</time>
        </>
      );
    }
    return <>{value}</>;
  }
  if (type === "number" && integer.test(value)) {
    return <>{numberFormat.format(Number(value))}</>;
  }
  return <>{value}</>;
}

export function StatTable({
  caption,
  captionVisible = false,
  columns,
  rows,
  className,
  emptyLabel = "Ei tietoja.",
}: StatTableProps) {
  if (columns.length === 0 || rows.length === 0) {
    return <p className="text-muted">{emptyLabel}</p>;
  }

  return (
    <div className={cn("taulukko relative rounded-2xl", className)}>
      <div
        tabIndex={0}
        role="region"
        aria-label={caption}
        className={cn(
          "taulukko-vieritin overflow-x-auto rounded-2xl border border-border",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        {/* border-separate: kiinnitetyillä soluilla on omat reunaviivansa
            (border-collapse-mallissa viivat jäisivät vierivän taulukon mukaan). */}
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption
            className={cn(
              "px-4 py-3 text-left font-display text-lg text-foreground",
              !captionVisible && "sr-only",
            )}
          >
            {caption}
          </caption>
          <thead>
            <tr className="bg-surface-strong">
              {columns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap border-b border-border px-4 py-3 font-medium text-foreground",
                    columnIndex === 0 && kiinnitetty,
                    numericTypes.has(column.type ?? "text")
                      ? "text-right tabular-nums"
                      : "text-left",
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="group/rivi odd:bg-background even:bg-surface"
              >
                {columns.map((column, columnIndex) => {
                  const value = cellValue(row, column.key);
                  const numeric = numericTypes.has(column.type ?? "text");
                  const classes = cn(
                    "px-4 py-2.5 align-top",
                    // Rivin viiva soluissa (border-separate); viimeisellä rivillä ei viivaa.
                    "border-b border-border group-last/rivi:border-b-0",
                    // Osoitettu rivi korostuu; kiinnitetty solu mukana (oma tausta).
                    "group-hover/rivi:bg-surface-strong",
                    numeric ? "text-right tabular-nums" : "text-left",
                    columnIndex === 0 && kiinnitetty,
                  );
                  // Ensimmäinen sarake toimii rivin otsikkona. Tyhjä solu ei voi
                  // olla otsikko (ruudunlukija ilmoittaisi nimettömän rivin).
                  return columnIndex === 0 && value !== "" ? (
                    <th
                      key={column.key}
                      scope="row"
                      className={cn(classes, "font-medium text-foreground")}
                    >
                      <CellContent value={value} type={column.type} />
                    </th>
                  ) : (
                    <td key={column.key} className={cn(classes, "text-muted")}>
                      <CellContent value={value} type={column.type} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Oikean reunan varjo: sivulle on vielä vieritettävää. */}
      <div aria-hidden className="taulukko-vihje pointer-events-none absolute inset-y-px right-px w-8 rounded-r-2xl" />
    </div>
  );
}
