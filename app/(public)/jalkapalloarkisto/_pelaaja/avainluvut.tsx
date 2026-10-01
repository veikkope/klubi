import { cn } from "@/lib/cn";

export interface Avainluku {
  arvo: string;
  selite: string;
}

/**
 * Isot luvut otsikon alla (maaottelut, maalit …). Lukija näkee pelaajan uran
 * mittakaavan yhdellä silmäyksellä ennen tekstiä.
 *
 * Luvut ovat samalla korkeudella (kiinteä rivikorkeus, tasaus alas), vaikka
 * vuosiväli on pienempää tekstiä, ja selitteet alkavat samasta kohdasta.
 * `kapea`: ruudut ovat kapeassa sarakkeessa (pelaajasivun kuvan vieressä), joten
 * leveällä näytöllä 2 × 2; muuten 4 rinnakkain heti kun tila riittää.
 */
export function Avainluvut({
  luvut,
  kapea = false,
  className,
}: {
  luvut: Avainluku[];
  kapea?: boolean;
  className?: string;
}) {
  if (luvut.length === 0) return null;
  const nelja = luvut.length >= 4;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border",
        nelja && "md:grid-cols-4",
        nelja && kapea && "lg:grid-cols-2",
        className,
      )}
    >
      {luvut.map((luku) => (
        <div key={luku.selite} className="flex flex-col-reverse justify-end bg-surface px-4 py-5 sm:px-5">
          <dt className="mt-2 text-sm leading-snug text-muted">{luku.selite}</dt>
          <dd className="flex h-10 items-end whitespace-nowrap font-display leading-none tabular-nums text-heading">
            <span className={luku.arvo.length > 5 ? "text-2xl sm:text-3xl" : "text-4xl sm:text-[2.75rem]"}>
              {luku.arvo}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
