import Link from "next/link";

import { cn } from "@/lib/cn";
import { siistiTunnisteLista, tunnisteHref } from "@/lib/tunnisteet";

/**
 * Tunnisteet linkkeinä tunnistesivuille (lib/tunnisteet.ts), blogin
 * "Tunnisteet: Helsinki, Huuhkajat, …" -rivin vastine.
 *
 * `maara` näytetään hakemistossa ("Huuhkajat 117"); ruudunlukija kuulee sen
 * muodossa "Huuhkajat, 117 kirjoitusta".
 */

type Props = {
  tunnisteet: { nimi: string; maara?: number }[];
  className?: string;
};

const chip =
  "inline-flex min-h-9 items-center gap-2 rounded-sm border border-border bg-background px-3 text-sm " +
  "text-foreground transition hover:border-accent hover:text-accent";

export function Tunnistelista({ tunnisteet, className }: Props) {
  if (tunnisteet.length === 0) return null;
  return (
    <ul className={cn("flex list-none flex-wrap gap-2 p-0", className)}>
      {tunnisteet.map(({ nimi, maara }) => {
        const href = tunnisteHref(nimi);
        const sisalto = (
          <>
            {nimi}
            {typeof maara === "number" && (
              <>
                <span aria-hidden className="text-xs tabular-nums text-muted">
                  {maara}
                </span>
                <span className="sr-only">, {maara === 1 ? "1 kirjoitus" : `${maara} kirjoitusta`}</span>
              </>
            )}
          </>
        );
        return (
          <li key={nimi}>
            {href ? (
              <Link href={href} className={chip}>
                {sisalto}
              </Link>
            ) : (
              <span className={cn(chip, "hover:border-border hover:text-foreground")}>{sisalto}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Uutisen tunnisteet artikkelin lopussa. */
export function UutisenTunnisteet({ tunnisteet, className }: { tunnisteet?: string[] | null; className?: string }) {
  const nimet = siistiTunnisteLista(tunnisteet);
  if (nimet.length === 0) return null;
  return (
    <nav aria-labelledby="uutisen-tunnisteet" className={className}>
      <h2 id="uutisen-tunnisteet" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Tunnisteet
      </h2>
      <Tunnistelista className="mt-3" tunnisteet={nimet.map((nimi) => ({ nimi }))} />
    </nav>
  );
}
