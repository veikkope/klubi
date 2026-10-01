import { PortableText } from "@/components/portable-text";
import { UusiValilehti } from "@/components/ui/uusi-valilehti";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { leikkeenOte, ryhmitteleVuosittain } from "@/lib/lehtileikkeet";
import { lehtileikeAnkkuri } from "@/lib/path";
import type { Lehtileike } from "@/sanity/lib/queries/lehtileikkeet";

/**
 * Lehtileikkeet vuosittain (docs/20). Jutusta näkyy otsikko, päiväys, lähde ja
 * 2–3 ensimmäistä virkettä; koko juttu avautuu natiivilla `<details>`-elementillä, joka
 * toimii näppäimistöllä ja ruudunlukijalla ilman JavaScriptiä, ja selaimen
 * sivuhaku löytää myös suljetun tekstin.
 *
 * `vuosiNavi`: vuosilinkit listan yllä (mobiili) tai vasemmassa reunassa
 * kiinnitettynä (leveä näyttö). Pitkällä listalla lukija hyppää suoraan vuoteen.
 */
export function LeikeLista({
  leikkeet,
  vuosiNavi = true,
  idEtuliite = "leikkeet",
  otsikkotaso = 2,
}: {
  leikkeet: Lehtileike[];
  vuosiNavi?: boolean;
  /** Erottaa otsikoiden id:t, jos sivulla on useampi lista. */
  idEtuliite?: string;
  /** Vuosiotsikon taso; jutun otsikko on yhtä alempana. 3, kun lista on osion h2:n alla. */
  otsikkotaso?: 2 | 3;
}) {
  const VuosiOtsikko = otsikkotaso === 2 ? "h2" : "h3";
  const ryhmat = ryhmitteleVuosittain(leikkeet);
  if (ryhmat.length === 0) return null;
  const naytaNavi = vuosiNavi && ryhmat.length > 2;

  const lista = (
    <div className="flex flex-col gap-12">
      {ryhmat.map((ryhma) => {
        const otsikkoId = `${idEtuliite}-${ryhma.vuosi}`;
        return (
          <section key={ryhma.vuosi} aria-labelledby={otsikkoId}>
            <VuosiOtsikko
              id={otsikkoId}
              className="scroll-mt-24 border-b-2 border-heading pb-2 font-display text-2xl text-heading sm:text-3xl"
            >
              {ryhma.vuosi}
              <span className="ml-3 align-middle font-sans text-sm font-normal text-muted">
                {ryhma.leikkeet.length} {ryhma.leikkeet.length === 1 ? "juttu" : "juttua"}
              </span>
            </VuosiOtsikko>
            <ol>
              {ryhma.leikkeet.map((leike) => (
                <li key={leike._id}>
                  <Leike leike={leike} otsikkotaso={otsikkotaso + 1 as 3 | 4} />
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );

  if (!naytaNavi) return lista;

  return (
    <div className="lg:grid lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="Vuodet" className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-soft">Vuodet</p>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
          {ryhmat.map((ryhma) => (
            <li key={ryhma.vuosi}>
              <a
                href={`#${idEtuliite}-${ryhma.vuosi}`}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-sm tabular-nums text-foreground no-underline transition",
                  "hover:border-border-strong hover:text-accent",
                  "lg:min-h-9 lg:w-full lg:justify-between lg:border-0 lg:bg-transparent lg:px-2",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <span className="font-medium">{ryhma.vuosi}</span>
                <span className="text-muted">{ryhma.leikkeet.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {lista}
    </div>
  );
}

function Leike({ leike, otsikkotaso }: { leike: Lehtileike; otsikkotaso: 3 | 4 }) {
  const ote = leikkeenOte(leike.teksti);
  const Otsikko = otsikkotaso === 3 ? "h3" : "h4";
  // Jutun omat väliotsikot (harvinaisia) jutun otsikon alle; PortableText tukee tasoon 4 asti.
  const sisaltotaso = 4;
  return (
    <article
      id={lehtileikeAnkkuri(leike._id)}
      className="group/leike scroll-mt-24 border-b border-border py-7 last:border-b-0"
    >
      <Otsikko className="max-w-prose font-display text-xl leading-snug text-heading sm:text-2xl">{leike.otsikko}</Otsikko>
      <p className="mt-2 text-sm text-muted">
        <time dateTime={leike.julkaistu}>{formatDate(leike.julkaistu)}</time>
        {leike.lahde && <> · {leike.lahde}</>}
        {leike.linkki && (
          <>
            {" · "}
            <a
              href={leike.linkki}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              Alkuperäinen juttu
              <UusiValilehti />
            </a>
          </>
        )}
      </p>

      {ote === null ? (
        <div className="mt-4 max-w-prose">
          <PortableText value={leike.teksti} ylinOtsikko={sisaltotaso} />
        </div>
      ) : (
        <>
          {/* Ote piiloon, kun koko juttu on auki: alku ei toistu kahdesti. */}
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-foreground group-has-[details[open]]/leike:hidden">
            {ote}
          </p>
          <details className="group mt-1 max-w-prose">
            <summary
              className={cn(
                "inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-accent",
                "hover:underline hover:underline-offset-4 [&::-webkit-details-marker]:hidden",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <span className="group-open:hidden">Lue koko juttu</span>
              <span className="hidden group-open:inline">Näytä vähemmän</span>
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </summary>
            <div className="mt-2">
              <PortableText value={leike.teksti} ylinOtsikko={sisaltotaso} />
            </div>
          </details>
        </>
      )}
    </article>
  );
}
