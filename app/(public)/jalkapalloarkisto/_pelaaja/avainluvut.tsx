import { cn } from "@/lib/cn";

export interface Avainluku {
  arvo: string;
  selite: string;
}

/**
 * Isot luvut otsikon alla (maaottelut, maalit …). Lukija näkee pelaajan uran
 * mittakaavan yhdellä silmäyksellä ennen tekstiä.
 */
export function Avainluvut({ luvut, className }: { luvut: Avainluku[]; className?: string }) {
  if (luvut.length === 0) return null;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border",
        luvut.length >= 4 && "sm:grid-cols-4",
        className,
      )}
    >
      {luvut.map((luku) => (
        <div key={luku.selite} className="flex flex-col-reverse bg-surface px-4 py-4 sm:px-5">
          <dt className="mt-1 text-sm text-muted">{luku.selite}</dt>
          <dd
            className={cn(
              "font-display leading-none tabular-nums text-heading",
              // Vuosiväli ("1987–2011") on pidempi kuin luku: pienempi koko, ettei ruutu levene.
              luku.arvo.length > 5 ? "text-2xl sm:text-[1.75rem]" : "text-3xl sm:text-4xl",
            )}
          >
            {luku.arvo}
          </dd>
        </div>
      ))}
    </dl>
  );
}
