import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/ui/button";
import { SanityImage } from "@/components/sanity-image";
import type { EtusivuData } from "@/lib/types";

/**
 * Etusivun hero.
 *
 * Tämä on sivun LCP-elementti. Siksi:
 *  - taustakuva renderöidään `priority`-lipulla eikä sitä lazy-loadata
 *  - kuvan puuttuessa tausta on puhdas CSS-gradientti, jolloin LCP on otsikko
 *  - korkeus tulee sisällöstä eikä kuvasta, joten kuvan latautuminen ei
 *    aiheuta layout shiftiä
 */
const matchTimeFormatter = new Intl.DateTimeFormat("fi-FI", {
  weekday: "short",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Helsinki",
});

/** Seuraava ottelu, jos se on tiedossa eikä vielä pelattu. */
function upcomingMatch(data: EtusivuData) {
  const match = data.seuraavaOttelu;
  if (!match?.ottelu || !match.aika) return null;
  const start = new Date(match.aika);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) return null;
  return { ottelu: match.ottelu, kilpailu: match.kilpailu, aika: match.aika, start };
}

export function Hero({ data }: { data: EtusivuData }) {
  const ctas = data.heroCtas ?? [];
  const match = upcomingMatch(data);
  const hasImage = Boolean(data.heroImage?.asset);

  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      {hasImage ? (
        <div className="absolute inset-0 -z-10">
          <SanityImage
            image={data.heroImage!}
            width={2400}
            height={1350}
            sizes="100vw"
            className="h-full w-full object-cover opacity-45"
            priority
          />
          {/* Kaksi päällekkäistä liukua: ylhäällä luettavuus, alhaalla sulava
              siirtymä seuraavaan lohkoon. */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-950/65 to-brand-950" />
        </div>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(59,130,246,0.40),transparent_62%),radial-gradient(90%_80%_at_95%_15%,rgba(30,64,175,0.55),transparent_60%)]"
        />
      )}

      <Container
        size="wide"
        className="py-24 sm:py-32 lg:py-40 xl:py-44"
      >
        <div className="max-w-3xl">
          {data.heroEyebrow && (
            <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-brand-200">
              <span aria-hidden className="h-px w-8 bg-brand-200/60" />
              {data.heroEyebrow}
            </p>
          )}

          <h1 className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            {data.heroTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-brand-100 sm:text-xl">
            {data.heroDescription}
          </p>

          {match && (
            <p className="mt-6 inline-flex flex-wrap items-baseline gap-x-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-brand-100">
              <span className="font-medium uppercase tracking-[0.18em] text-brand-200">Seuraavaksi</span>
              <span className="font-medium text-white">{match.ottelu}</span>
              {match.kilpailu && <span>· {match.kilpailu}</span>}
              <span>
                · <time dateTime={match.aika}>{matchTimeFormatter.format(match.start)}</time>
              </span>
            </p>
          )}

          {ctas.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
              {ctas.map((cta) => (
                <LinkButton
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  size="lg"
                  variant={cta.primary ? "primary" : "onDark"}
                  className={
                    cta.primary
                      ? "!bg-white !text-brand-900 hover:!bg-brand-50"
                      : undefined
                  }
                >
                  {cta.label}
                </LinkButton>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
