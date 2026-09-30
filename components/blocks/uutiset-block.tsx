import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ArrowLink, BlockHeading } from "@/components/blocks/block-heading";
import { SanityImage } from "@/components/sanity-image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { recentUutisetQuery } from "@/sanity/lib/queries";
import { cn } from "@/lib/cn";
import { categoryLabel } from "@/lib/uutinen-categories";
import type { UutinenCard } from "@/lib/types";

type Props = {
  eyebrow?: string;
  heading?: string;
  count?: number;
};

const monthYear = new Intl.DateTimeFormat("fi-FI", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Helsinki",
});

/** "syyskuu 2026" → "Syyskuu 2026" */
function formatMonth(iso: string): string {
  const s = monthYear.format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * "Kentältä ja katsomosta" (tyyliopas Sivut v3, osio 3).
 *
 * Valkoinen osio. Uusin juttu isona vasemmalla (16:10 kuva, kategoria + kuukausi,
 * serif 40 px otsikko, ingressi), seuraavat listana oikealla (serif 25 px).
 * Ilman juttuja lohkoa ei renderöidä.
 *
 * Otsikko ja yläotsake tulevat Studiosta. Tyhjä otsikko = ei näkyvää
 * otsikkoriviä: ruudunlukijalle jää piilotettu "Uutiset", jotta osiolla on
 * nimi, ja "Kaikki jutut" -linkki on juttujen alla kaikilla näytöillä.
 */
export async function UutisetBlock({ eyebrow, heading, count = 4 }: Props) {
  const items = await sanityFetch<UutinenCard[]>({
    query: recentUutisetQuery,
    params: { count },
    tags: ["uutinen"],
    fallback: [],
  });

  if (items.length === 0) return null;
  const [featured, ...rest] = items;
  const naytaOtsikko = Boolean(heading?.trim());

  return (
    <section className="bg-surface py-11 sm:py-24" aria-labelledby="etusivu-uutiset">
      <Container size="wide" className="flex flex-col gap-4 sm:gap-10">
        {naytaOtsikko ? (
          <BlockHeading
            id="etusivu-uutiset"
            eyebrow={eyebrow?.trim() || undefined}
            title={heading ?? ""}
            action={{ href: "/uutiset", label: "Kaikki jutut" }}
            className="max-sm:[&>a]:hidden"
          />
        ) : (
          <h2 id="etusivu-uutiset" className="sr-only">
            Uutiset
          </h2>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <article className="flex flex-col gap-3.5 sm:gap-[18px]">
            {featured.coverImage?.asset && (
              <SanityImage
                image={featured.coverImage}
                width={960}
                height={600}
                sizes="(min-width: 1024px) 760px, 100vw"
                className="aspect-[3/2] w-full rounded-sm object-cover sm:aspect-[16/10]"
              />
            )}
            <Meta news={featured} />
            <h3 className="text-pretty font-display text-2xl leading-[1.2] sm:text-[2.5rem] sm:leading-[1.12]">
              <Link href={`/uutiset/${featured.slug}`} className="text-heading no-underline hover:text-accent">
                {featured.title}
              </Link>
            </h3>
            {featured.excerpt && (
              <p className="hidden max-w-[640px] text-lg leading-[1.65] text-muted sm:block">
                {featured.excerpt}
              </p>
            )}
          </article>

          {rest.length > 0 && (
            <ul className="flex flex-col">
              {rest.map((news, i) => (
                <li
                  key={news._id}
                  // Mobiilissa viiva jokaisen yläpuolella, tietokoneella niiden välissä.
                  className="flex flex-col gap-1.5 border-t border-border py-4 sm:gap-2.5 lg:border-t-0 lg:border-b lg:py-[26px] lg:first:pt-0 lg:last:border-b-0"
                >
                  <Meta news={news} small />
                  <h3 className="font-display text-[1.1875rem] leading-[1.3] sm:text-[1.5625rem]">
                    <Link href={`/uutiset/${news.slug}`} className="text-heading no-underline hover:text-accent">
                      {news.title}
                    </Link>
                  </h3>
                  {i === 0 && news.excerpt && (
                    <p className="hidden text-base leading-relaxed text-muted sm:line-clamp-2">
                      {news.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ArrowLink href="/uutiset" className={cn("self-start", naytaOtsikko && "sm:hidden")}>
          Kaikki jutut
        </ArrowLink>
      </Container>
    </section>
  );
}

function Meta({ news, small = false }: { news: UutinenCard; small?: boolean }) {
  const category = news.categories?.[0];
  return (
    <p className={small ? "flex gap-3 text-xs sm:text-[13px]" : "flex gap-3 text-xs sm:text-sm"}>
      {category && (
        <span className="font-semibold uppercase tracking-[0.1em] text-accent">
          {categoryLabel(category)}
        </span>
      )}
      <time dateTime={news.publishedAt} className="text-muted-soft">
        {formatMonth(news.publishedAt)}
      </time>
    </p>
  );
}
