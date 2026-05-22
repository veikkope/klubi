import { Hero } from "@/components/blocks/hero";
import { UutisetBlock } from "@/components/blocks/uutiset-block";
import { TapahtumatBlock } from "@/components/blocks/tapahtumat-block";
import { EsittelyBlock } from "@/components/blocks/esittely-block";
import { RavintolatSpotlightBlock } from "@/components/blocks/ravintolat-spotlight-block";
import { CtaBlock } from "@/components/blocks/cta-block";
import { sanityFetch } from "@/sanity/lib/fetch";
import { etusivuQuery } from "@/sanity/lib/queries";
import { defaultEtusivu } from "@/lib/defaults";
import type { EtusivuData } from "@/lib/types";

export default async function Home() {
  const data = await sanityFetch<EtusivuData>({
    query: etusivuQuery,
    tags: ["etusivu"],
    fallback: defaultEtusivu,
  });

  return (
    <>
      <Hero data={data} />
      {data.blocks?.map((block) => {
        switch (block._type) {
          case "uutiset":
            return (
              <UutisetBlock
                key={block._key}
                heading={block.heading}
                count={block.count}
              />
            );
          case "tapahtumat":
            return (
              <TapahtumatBlock
                key={block._key}
                heading={block.heading}
                count={block.count}
              />
            );
          case "esittely":
            return <EsittelyBlock key={block._key} {...block} />;
          case "ravintolatSpotlight":
            return (
              <RavintolatSpotlightBlock
                key={block._key}
                heading={block.heading}
                count={block.count}
                cityId={block.city?._ref ?? null}
              />
            );
          case "cta":
            return <CtaBlock key={block._key} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
