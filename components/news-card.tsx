import {
  Card,
  CardArrow,
  CardEyebrow,
  CardTitle,
  CardBody,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FramedImage } from "@/components/framed-image";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/uutinen-categories";
import type { UutinenCard } from "@/lib/types";

type Props = {
  news: UutinenCard;
  /** Korkeampi profiili — käytetään etusivulla. */
  feature?: boolean;
  /** Ensimmäisen rivin kortit voivat olla LCP-elementti. */
  priority?: boolean;
};

export function NewsCard({ news, feature = false, priority = false }: Props) {
  return (
    <Card href={`/uutiset/${news.slug}`} className="w-full">
      {news.coverImage?.asset && (
        <div className="-m-6 mb-4 overflow-hidden rounded-t-2xl">
          <FramedImage
            image={news.coverImage}
            width={760}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className={feature ? "h-52 w-full" : "h-44 w-full"}
            priority={priority}
          />
        </div>
      )}
      <CardEyebrow>
        <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
      </CardEyebrow>
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
      <CardArrow label="Lue uutinen" />
    </Card>
  );
}
