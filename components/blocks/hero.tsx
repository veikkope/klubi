import Link from "next/link";
import { stegaClean } from "next-sanity";

import { Container } from "@/components/layout/container";
import { FramedImage } from "@/components/framed-image";
import { formatStart } from "@/components/match-countdown";
import { MatchCountdownTimer } from "@/components/match-countdown-timer";
import { SanityImage } from "@/components/sanity-image";
import { KuvaSiirtyma } from "@/components/sivunvaihto";
import { Nuoli } from "@/components/ui/nuoli";
import { cn } from "@/lib/cn";
import { korttiTeksti } from "@/lib/sisaltolohkot";
import { getTulevatOttelut } from "@/lib/ottelut";
import { siteName } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { upcomingTapahtumatQuery } from "@/sanity/lib/queries";
import type { EtusivuData, HeroCta, TapahtumaCard, UutinenCard } from "@/lib/types";
import type { Ottelu } from "@/lib/ottelut";

const SARAKKEET = "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-14";

const paivays = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "Europe/Helsinki",
});

/**
 * Etusivun yläosa: ajankohtaisnosto yönsinisellä pohjalla.
 *
 * Korvaa vanhan kuvaheron, joka näytti aina saman tekstin (palaute 10/2026);
 * valittu viidestä versiosta ja viidestä muunnelmasta (1b "Kuvatausta").
 *  - ylimpänä klubin nimi pienenä rivinä (sivun H1),
 *  - vasemmalla pääjuttu: Studiossa nostettu tai automaattisesti uusin juttu,
 *  - oikealla "Seuraavaksi"-kortti: seuraava Huuhkajien ottelu laskurin
 *    kanssa, seuraava klubin tapahtuma ja Studion pikalinkit,
 *  - taustalla Studion yläosan kuva harmaasävyisenä tasaisen 85 %:n
 *    yönsinisen alla. Ilman kuvaa taustalla on klubinsininen hehku ja logon
 *    liput vesileimana.
 *
 * Kontrasti: harmaasävykuvan vaaleinkin kohta 85 %:n yönsinisen alla on
 * n. #374068, jota vasten laventeli (#aeb6f2) on n. 5:1 ja muut tekstit
 * enemmän. Kuva on sivun LCP-elementti (priority) eikä näy tulosteessa.
 *
 * Yläosa vaihtuu itsestään, kun juttu julkaistaan tai ottelu pelataan.
 * Tyhjät palat piilotetaan.
 */
export async function Hero({ data }: { data: EtusivuData }) {
  const [ottelut, tapahtumat] = await Promise.all([
    data.heroLaskuri !== false
      ? getTulevatOttelut(1, { vainMaajoukkue: true })
      : Promise.resolve([]),
    sanityFetch<TapahtumaCard[]>({
      query: upcomingTapahtumatQuery,
      params: { count: 1 },
      tags: ["tapahtuma"],
      fallback: [],
    }),
  ]);

  const ottelu = ottelut[0];
  const tapahtuma = tapahtumat[0];
  const linkit = data.heroCtas ?? [];
  const paajuttu = data.heroNosto;
  const kuva = data.heroImage?.asset ? data.heroImage : null;
  const kortti = Boolean(ottelu || tapahtuma || linkit.length > 0);

  return (
    <section className="relative isolate overflow-hidden bg-chrome text-on-chrome">
      {kuva ? (
        <>
          <SanityImage
            image={kuva}
            // Taustakuva: sisältö on tekstissä, ruudunlukija ohittaa kuvan.
            alt=""
            width={2400}
            crop={false}
            sizes="100vw"
            className="absolute inset-0 -z-20 h-full w-full object-cover grayscale print:hidden"
            priority
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-chrome/85 print:hidden" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_85%_0%,rgb(26_44_216/0.38),transparent_70%)] print:hidden"
          />
          <Vesileima sarakkeet={kortti ? SARAKKEET : undefined} />
        </>
      )}

      <Container size="wide" className="flex flex-col gap-5 pb-10 pt-6 sm:gap-8 sm:pb-14 sm:pt-10">
        <h1 className="text-xs font-semibold uppercase tracking-[0.12em] text-on-chrome-eyebrow sm:text-sm">
          {data.heroEyebrow?.trim() || siteName}
        </h1>

        <div className={cn("grid gap-8", kortti && cn("items-start", SARAKKEET))}>
          {paajuttu ? (
            <Paajuttu juttu={paajuttu} lcp={!kuva} />
          ) : (
            <p className="max-w-3xl text-pretty font-display text-2xl leading-[1.25] text-on-chrome sm:text-[2rem]">
              {data.heroDescription}
            </p>
          )}

          {kortti && (
            <aside
              aria-labelledby="etusivu-seuraavaksi"
              className={cn(
                "flex flex-col gap-5 rounded-sm p-5 ring-1 ring-white/10 sm:p-6",
                kuva ? "bg-chrome/70" : "bg-white/[0.06]",
              )}
            >
              <h2
                id="etusivu-seuraavaksi"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-on-chrome-eyebrow sm:text-sm"
              >
                Seuraavaksi
              </h2>
              {ottelu && <OttelunTiedot ottelu={ottelu} />}
              {tapahtuma && (
                <div className={cn(ottelu && "border-t border-chrome-border pt-5")}>
                  <TapahtumanTiedot tapahtuma={tapahtuma} />
                </div>
              )}
              {linkit.length > 0 && (
                <Pikalinkit
                  linkit={linkit}
                  className={cn((ottelu || tapahtuma) && "border-t border-chrome-border pt-5")}
                />
              )}
            </aside>
          )}
        </div>
      </Container>
    </section>
  );
}

/**
 * Logon liput vesileimana (vain ilman taustakuvaa) omassa kerroksessaan,
 * jossa on sama sarakejako kuin sisällössä, joten merkki ei leikkaannu:
 * mobiilissa osion keskellä, tietokoneella pääjutun sarakkeen oikeassa
 * alakulmassa kortin vieressä. Täysikokoinen merkki (502 px): web-versio on
 * 150 px ja sumenisi.
 */
function Vesileima({ sarakkeet }: { sarakkeet?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 print:hidden">
      <Container size="wide" className={cn("grid h-full py-8 lg:pb-14 lg:pt-20", sarakkeet)}>
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- koriste, staattinen brändikuva */}
          <img
            src="/brand/mark-white.png"
            alt=""
            width={502}
            height={562}
            decoding="async"
            className="absolute left-1/2 top-1/2 h-auto max-h-full w-[min(260px,70%)] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07] sm:w-[340px] lg:bottom-0 lg:left-auto lg:right-0 lg:top-auto lg:h-full lg:max-h-[380px] lg:w-auto lg:translate-x-0 lg:translate-y-0 lg:opacity-[0.06]"
          />
        </div>
      </Container>
    </div>
  );
}

/**
 * Pääjuttu. Koko nosto on klikattava: otsikkolinkin ::after kattaa artikkelin
 * (sama malli kuin Uutiset-lohkossa). Ruudunlukija kuulee linkkinä vain otsikon.
 */
function Paajuttu({ juttu, lcp }: { juttu: UutinenCard; lcp: boolean }) {
  const kuva = juttu.coverImage?.asset ? juttu.coverImage : null;
  const teksti = korttiTeksti(juttu);
  const kategoria = juttu.categories?.[0];

  return (
    <article className="group/kortti relative flex max-w-3xl flex-col gap-3.5 sm:gap-4">
      {kuva && (
        <KuvaSiirtyma nimi={`uutinen-${juttu.slug}`}>
          <FramedImage
            image={kuva}
            width={1520}
            sizes="(min-width: 1024px) 760px, 100vw"
            className="aspect-[16/9] w-full rounded-sm lg:aspect-[2/1]"
            // Ilman taustakuvaa jutun kuva on sivun LCP-elementti.
            priority={lcp}
          />
        </KuvaSiirtyma>
      )}
      <p className="flex gap-3 text-xs sm:text-sm">
        {kategoria && (
          <span className="font-semibold uppercase tracking-[0.1em] text-on-chrome-eyebrow">
            {kategoria.label}
          </span>
        )}
        <time dateTime={juttu.publishedAt} className="text-on-chrome-muted">
          {paivays.format(new Date(juttu.publishedAt))}
        </time>
      </p>
      <h2
        className={cn(
          "text-pretty font-display text-on-chrome",
          kuva ? "text-[1.75rem] sm:text-4xl" : "text-[1.875rem] sm:text-[2.5rem] xl:text-5xl",
          // Riviväli kokoluokkien jälkeen: tailwind-merge pudottaa aiemman.
          "leading-[1.12] sm:leading-[1.08]",
        )}
      >
        <Link
          href={`/uutiset/${juttu.slug}`}
          className="text-on-chrome no-underline after:absolute after:inset-0 after:content-[] hover:text-on-chrome group-hover/kortti:underline group-hover/kortti:decoration-2 group-hover/kortti:underline-offset-[5px]"
        >
          {juttu.title}
        </Link>
      </h2>
      {teksti && (
        <p
          className={cn(
            "max-w-[620px] text-pretty text-base leading-[1.6] text-on-chrome-muted sm:text-lg",
            kuva ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {teksti}
        </p>
      )}
      <span aria-hidden className="text-base font-semibold text-on-chrome">
        Lue juttu&nbsp;<Nuoli ryhma="kortti" />
      </span>
    </article>
  );
}

function OttelunTiedot({ ottelu }: { ottelu: Ottelu }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-chrome-muted">
          Huuhkajat{ottelu.kilpailu && ` · ${ottelu.kilpailu}`}
        </p>
        <h3 className="font-display text-xl font-semibold leading-tight sm:text-[1.375rem]">
          <Link href="/ottelut" className="text-on-chrome no-underline hover:text-on-chrome hover:underline">
            {ottelu.koti} – {ottelu.vieras}
          </Link>
        </h3>
        <p className="text-sm text-on-chrome-muted">
          <time dateTime={ottelu.aika}>{formatStart(ottelu.aika)}</time>
          {ottelu.stadion && ` · ${ottelu.stadion}`}
        </p>
      </div>
      <MatchCountdownTimer aika={ottelu.aika} pieni />
    </div>
  );
}

function TapahtumanTiedot({ tapahtuma }: { tapahtuma: TapahtumaCard }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-on-chrome-muted">Klubilla</p>
      <h3 className="font-display text-lg leading-snug">
        <Link
          href={`/tapahtumat/${tapahtuma.slug}`}
          className="text-on-chrome no-underline hover:text-on-chrome hover:underline"
        >
          {tapahtuma.title}
        </Link>
      </h3>
      <p className="text-sm text-on-chrome-muted">
        <time dateTime={tapahtuma.startsAt}>{formatStart(tapahtuma.startsAt)}</time>
        {tapahtuma.location && ` · ${tapahtuma.location}`}
      </p>
    </div>
  );
}

function Pikalinkit({ linkit, className }: { linkit: HeroCta[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {linkit.map((linkki) => (
        <li key={`${linkki.href}-${linkki.label}`}>
          <Link
            // Stega pois hrefistä (luonnosnäkymä); nimi jää muokattavaksi.
            href={stegaClean(linkki.href)}
            className="group/linkki text-base font-semibold text-on-chrome underline decoration-1 underline-offset-[5px] hover:text-on-chrome hover:decoration-2"
          >
            {linkki.label}&nbsp;<Nuoli />
          </Link>
        </li>
      ))}
    </ul>
  );
}
