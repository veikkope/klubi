import Link from "next/link";

import { formatRating } from "@/components/restaurant-card";
import { Nuoli } from "@/components/ui/nuoli";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { voimassaOlevat } from "@/lib/ravintola-arvosana";
import type { OdottavaRavintola } from "@/sanity/lib/queries/ravintolat";

const luku = (x: number | null | undefined) => (typeof x === "number" ? formatRating(x) : "–");

/**
 * Toista klubilaista arvioijaa odottava ravintola (docs/21): nimi, paikka,
 * ensimmäisen arvioijan nimi ja pisteet sekä painike arvostelulomakkeelle
 * ravintola valmiiksi valittuna. Käytössä /ravintolat/odottavat-sivulla ja
 * hakemiston kaupunki- ja hakunäkymissä.
 */
export function OdottavaRavintolaKortti({
  ravintola: r,
  naytaPaikka = true,
  tiivis = false,
}: {
  ravintola: OdottavaRavintola;
  naytaPaikka?: boolean;
  tiivis?: boolean;
}) {
  const arviot = voimassaOlevat(r.arviot);
  const paikka = [r.city?.name, r.city?.country && r.city.country !== "Suomi" ? r.city.country : null]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-sm border-t-[3px] border-t-brass bg-surface sm:flex-row sm:items-center sm:justify-between sm:gap-8",
        tiivis ? "p-4 sm:p-5" : "p-5 sm:p-6",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-display text-xl leading-snug text-heading sm:text-[1.375rem]">{r.name}</h3>
        {naytaPaikka && paikka && <p className="text-sm text-muted-soft">{paikka}</p>}
        {arviot.length > 0 ? (
          arviot.map((a) => (
            <p key={a.arvioija} className="text-[15px] text-foreground">
              <span className="font-semibold">{a.nimi ?? "Klubilainen"}</span>
              {a.pvm && <span className="text-muted-soft"> · {formatDate(a.pvm)}</span>}
              <span className="mt-0.5 block text-sm text-muted">
                Ruoka {luku(a.ratingFood)} · Hinta {luku(a.ratingPrice)} · Viihtyvyys {luku(a.ratingAtmosphere)} ·{" "}
                <span className="font-semibold">Keskiarvo {luku(a.kokonais)}</span>
              </span>
            </p>
          ))
        ) : (
          <p className="text-[15px] text-muted">Ei vielä klubilaisen arviota.</p>
        )}
      </div>
      <Link
        href={`/ravintolat/arvostele?ravintola=${encodeURIComponent(r.slug)}`}
        className="group/linkki inline-flex min-h-11 shrink-0 items-center justify-center gap-1 self-start rounded-sm bg-primary px-5 text-sm font-medium text-on-primary no-underline transition hover:bg-primary-hover hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-center"
      >
        Arvostele<span className="sr-only"> {r.name}</span>&nbsp;<Nuoli />
      </Link>
    </div>
  );
}
