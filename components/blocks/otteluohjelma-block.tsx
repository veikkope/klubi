import { Container } from "@/components/layout/container";
import { ArrowLink, BlockHeading } from "@/components/blocks/block-heading";
import { EventCard } from "@/components/event-card";
import { FixtureList } from "@/components/fixture-list";
import { MatchCountdown } from "@/components/match-countdown";
import { getTulevatOttelut } from "@/lib/ottelut";
import { sanityFetch } from "@/sanity/lib/fetch";
import { upcomingTapahtumatQuery } from "@/sanity/lib/queries";
import type { TapahtumaCard } from "@/lib/types";

type Props = {
  ottelutHeading?: string;
  ottelutCount?: number;
  /** Rajaa Huuhkajiin ja `seurat`-listan seuroihin. Oletuksena päällä (myös vanhoissa lohkoissa). */
  vainMaajoukkue?: boolean;
  /** Rajauksen lisäksi näytettävät seurat, esim. ["FC Lahti"]. */
  seurat?: string[];
  /** Laskuri seuraavaan Huuhkajien otteluun. Oletuksena päällä. */
  laskuri?: boolean;
  tapahtumatHeading?: string;
  tapahtumatCount?: number;
};

/**
 * Tulevat ottelut + klubin tapahtumat rinnakkain (tyyliopas Sivut v3, osio 2).
 *
 * Tietokoneella kaksi saraketta (1,5fr / 1fr, väli 64 px), mobiilissa
 * allekkain. Jos toinen puoli on tyhjä, toinen täyttää koko leveyden; jos
 * molemmat ovat tyhjiä, lohkoa ei renderöidä.
 *
 * Ottelupuolen yläreunassa on laskuri seuraavaan Huuhkajien otteluun. Se
 * lasketaan samoista Studion otteluista kuin lista, joten erillistä
 * ylläpitoa ei ole. Etusivu näyttää oletuksena Huuhkajien ja Studiossa
 * valittujen seurojen (esim. FC Lahti) ottelut; /ottelut-sivulla näkyy aina
 * koko ohjelma.
 */
export async function OtteluohjelmaBlock({
  ottelutHeading = "Tulevat ottelut",
  ottelutCount = 4,
  vainMaajoukkue = true,
  seurat = [],
  laskuri = true,
  tapahtumatHeading = "Nähdään",
  tapahtumatCount = 3,
}: Props) {
  const vainHuuhkajat = vainMaajoukkue && seurat.length === 0;
  const [ottelut, huuhkajat, tapahtumat] = await Promise.all([
    getTulevatOttelut(ottelutCount, { vainMaajoukkue, seurat }),
    // Laskurin ottelu. Kun lista on rajattu pelkkiin Huuhkajiin, se on listan ensimmäinen.
    laskuri && !vainHuuhkajat
      ? getTulevatOttelut(1, { vainMaajoukkue: true })
      : Promise.resolve(null),
    sanityFetch<TapahtumaCard[]>({
      query: upcomingTapahtumatQuery,
      params: { count: tapahtumatCount },
      tags: ["tapahtuma"],
      fallback: [],
    }),
  ]);

  const seuraava = laskuri ? (huuhkajat ?? ottelut)[0] : undefined;

  if (ottelut.length === 0 && tapahtumat.length === 0) return null;
  const both = ottelut.length > 0 && tapahtumat.length > 0;

  return (
    <section className="py-11 sm:py-24">
      <Container
        size="wide"
        className={
          both
            ? "grid items-start gap-11 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16"
            : undefined
        }
      >
        {ottelut.length > 0 && (
          <div aria-labelledby="etusivu-ottelut" role="region" className="flex flex-col gap-4 sm:gap-7">
            <BlockHeading
              id="etusivu-ottelut"
              eyebrow="Otteluohjelma"
              title={ottelutHeading}
              action={{ href: "/ottelut", label: "Koko ohjelma" }}
              className="max-sm:[&>a]:hidden"
            />
            {seuraava && <MatchCountdown ottelu={seuraava} />}
            <FixtureList ottelut={ottelut} />
            <ArrowLink href="/ottelut" className="self-start sm:hidden">
              Koko ohjelma
            </ArrowLink>
          </div>
        )}

        {tapahtumat.length > 0 && (
          <div aria-labelledby="etusivu-tapahtumat" role="region" className="flex flex-col gap-3.5 sm:gap-7">
            <BlockHeading
              id="etusivu-tapahtumat"
              eyebrow="Klubin tapahtumat"
              title={tapahtumatHeading}
            />
            <ul className={both ? "flex flex-col gap-3.5 sm:gap-5" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
              {tapahtumat.map((event) => (
                <li key={event._id} className="flex">
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
            <ArrowLink href="/tapahtumat" className="self-start">
              Kaikki tapahtumat
            </ArrowLink>
          </div>
        )}
      </Container>
    </section>
  );
}
