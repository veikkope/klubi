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
  cells: { key: string; value?: string | null }[];
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
  return row.cells.find((cell) => cell.key === key)?.value?.trim() ?? "";
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
                    {value}
                  </th>
                ) : (
                  <td key={column.key} className={cn(classes, "text-muted")}>
                    {value}
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
