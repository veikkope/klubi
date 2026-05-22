import { Card, CardArrow, CardEyebrow, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SanityImage } from "@/components/sanity-image";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/uutinen-categories";
import type { UutinenCard } from "@/lib/types";

type Props = {
  news: UutinenCard;
  /** Korkeampi profiili — käytetään etusivulla. */
  feature?: boolean;
};

export function NewsCard({ news, feature = false }: Props) {
  return (
    <Card href={`/uutiset/${news.slug}`}>
      {news.coverImage?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <SanityImage
            image={news.coverImage}
            width={600}
            height={360}
            sizes="(min-width: 1024px) 400px, 100vw"
            className={feature ? "h-52 w-full object-cover" : "h-44 w-full object-cover"}
          />
        </div>
      )}
      <CardEyebrow>{formatDate(news.publishedAt)}</CardEyebrow>
      <CardTitle className="mt-2">{news.title}</CardTitle>
      <CardBody className="mt-2">{news.excerpt}</CardBody>
      {news.categories && news.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {news.categories.map((c) => (
            <Badge key={c} tone="brand">
              {categoryLabel(c)}
            </Badge>
          ))}
        </div>
      )}
      <CardArrow />
    </Card>
  );
}
