import { Container } from "@/components/layout/container";
import { BlockHeading } from "@/components/blocks/block-heading";
import { NewsCard } from "@/components/news-card";
import { sanityFetch } from "@/sanity/lib/fetch";
import { MAX_HIGHLIGHTS, recentUutisetQuery } from "@/sanity/lib/queries";
import type { UutinenCard } from "@/lib/types";

type Props = {
  heading?: string;
  count?: number;
};

/**
 * Ajankohtaista — kolme viimeisintä uutista.
 *
 * Ilman uutisia lohkoa ei renderöidä lainkaan: tyhjä laatikko näyttäisi
 * rikkinäiseltä, eikä etusivulla ole mitään kerrottavaa siitä että uutisia ei
 * ole.
 */
export async function UutisetBlock({
  heading = "Ajankohtaista",
  count = 3,
}: Props) {
  const items = await sanityFetch<UutinenCard[]>({
    query: recentUutisetQuery,
    tags: ["uutinen"],
    fallback: [],
  });

  // GROQ ei salli parametrista viipalointia, joten kysely palauttaa enintään
  // MAX_HIGHLIGHTS riviä ja lopullinen määrä rajataan tässä.
  const shown = items.slice(0, Math.min(count, MAX_HIGHLIGHTS));

  if (shown.length === 0) return null;

  return (
    <section className="py-20 sm:py-24" aria-labelledby="etusivu-uutiset">
      <Container size="wide">
        <BlockHeading
          id="etusivu-uutiset"
          title={heading}
          action={{ href: "/uutiset", label: "Kaikki uutiset" }}
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((news) => (
            <li key={news._id} className="grid">
              <NewsCard news={news} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
