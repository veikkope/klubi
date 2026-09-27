import { cn } from "@/lib/cn";

/**
 * Jalkapalloarkiston tilastotaulukko.
 *
 * Kolme vaatimusta ohjaavat toteutusta:
 *  - **Saavutettavuus:** `<caption>` ja `<th scope>` ovat pakollisia, jotta
 *    ruudunlukija kertoo mihin sarakkeeseen solu kuuluu.
 *  - **Responsiivisuus:** leveä taulukko vierii omassa säiliössään, ei koskaan
 *    bodyssä. `tabindex={0}` tekee vierityksestä näppäimistökäyttöisen.
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

const numericTypes = new Set(["number", "year"]);

function cellValue(row: StatRow, key: string): string {
  // Tyhjä solu on tuonnissa jätetty kokonaan pois (ei tyhjiä merkkijonoja),
  // joten sekä puuttuva solu että puuttuva arvo tulkitaan tyhjäksi.
  return (row.cells ?? []).find((cell) => cell.key === key)?.value?.trim() ?? "";
}

const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoMonth = /^(\d{4})-(\d{2})$/;
const integer = /^-?\d+$/;

const numberFormat = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 });

type IsoParts = { y: string; m: string; d?: string };

function parseIso(value: string): IsoParts | null {
  const day = isoDay.exec(value);
  if (day) return { y: day[1], m: day[2], d: day[3] };
  const month = isoMonth.exec(value);
  if (month) return { y: month[1], m: month[2] };
  return null;
}

function formatIso({ y, m, d }: IsoParts): string {
  return d ? `${d}.${m}.${y}` : `${m}/${y}`;
}

/**
 * ISO 8601 -väli (2009-01-30/2009-02-01) suomalaisittain: vuosi (ja kuukausi)
 * kirjoitetaan vain kerran, jos ne ovat samat — "30.01.–01.02.2009".
 * Palauttaa alun ja lopun erikseen, jotta kumpikin saa oman `<time>`-elementin.
 */
function formatInterval(start: IsoParts, end: IsoParts): [string, string] {
  if (start.d && end.d) {
    if (start.y === end.y && start.m === end.m) return [`${start.d}.`, `${end.d}.${end.m}.${end.y}`];
    if (start.y === end.y) return [`${start.d}.${start.m}.`, `${end.d}.${end.m}.${end.y}`];
  }
  return [formatIso(start), formatIso(end)];
}

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
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className={cn(
        "overflow-x-auto rounded-2xl border border-border",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption
          className={cn(
            "px-4 py-3 text-left font-serif text-lg text-foreground",
            !captionVisible && "sr-only",
          )}
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface-strong">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "whitespace-nowrap px-4 py-3 font-medium text-foreground",
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
              className="border-b border-border last:border-0 even:bg-surface"
            >
              {columns.map((column, columnIndex) => {
                const value = cellValue(row, column.key);
                const numeric = numericTypes.has(column.type ?? "text");
                const classes = cn(
                  "px-4 py-2.5 align-top",
                  numeric ? "text-right tabular-nums" : "text-left",
                );
                // Ensimmäinen sarake toimii rivin otsikkona.
                return columnIndex === 0 ? (
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
  );
}
