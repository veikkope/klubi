import type { Metadata } from "next";

import { Hero } from "@/components/blocks/hero";
import { UutisetBlock } from "@/components/blocks/uutiset-block";
import { TapahtumatBlock } from "@/components/blocks/tapahtumat-block";
import { EsittelyBlock } from "@/components/blocks/esittely-block";
import { RavintolatSpotlightBlock } from "@/components/blocks/ravintolat-spotlight-block";
import { JalkapalloarkistoBlock } from "@/components/blocks/jalkapalloarkisto-block";
import { GalleriaBlock } from "@/components/blocks/galleria-block";
import { CtaBlock } from "@/components/blocks/cta-block";
import { JsonLd } from "@/components/seo/json-ld";
import { sanityFetch } from "@/sanity/lib/fetch";
import { etusivuQuery } from "@/sanity/lib/queries/etusivu";
import { defaultEtusivu } from "@/lib/defaults";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { webPageSchema } from "@/lib/schema-org";
import { siteDescription, siteName } from "@/lib/site";
import type { EtusivuBlock, EtusivuData } from "@/lib/types";

export const revalidate = 3600;

/**
 * Etusivun runko silloin kun Sanity-projektia ei vielä ole.
 *
 * `sanityFetch` palauttaa tällöin täsmälleen saman `defaultEtusivu`-viitteen,
 * josta tilanne tunnistetaan. Järjestys on docs/02 §"Etusivun rakenne",
 * galleria-nosto arkiston jälkeen. Data-vetoiset lohkot piilottavat itsensä
 * kun sisältöä ei ole, joten tyhjällä datalla näkyviin jää hero,
 * jalkapalloarkiston nosto ja päätösbanneri.
 *
 * Kun Sanity on pystyssä, tätä ei käytetä: lohkot tulevat singletonista.
 */
const scaffoldBlocks: EtusivuBlock[] = [
  { _type: "uutiset", _key: "scaffold-uutiset", count: 3 },
  { _type: "tapahtumat", _key: "scaffold-tapahtumat", count: 3 },
  ...defaultEtusivu.blocks,
  { _type: "ravintolatSpotlight", _key: "scaffold-ravintolat", count: 5 },
  { _type: "jalkapalloarkisto", _key: "scaffold-arkisto" },
  { _type: "galleria", _key: "scaffold-galleria", count: 3 },
  {
    _type: "cta",
    _key: "scaffold-cta",
    heading: "Liity jäseneksi",
    ctaLabel: "Lue lisää jäsenyydestä",
    ctaHref: "/klubi/liity",
  },
];

async function getEtusivu(): Promise<EtusivuData> {
  return sanityFetch<EtusivuData>({
    query: etusivuQuery,
    tags: ["etusivu"],
    fallback: defaultEtusivu,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getEtusivu();
  const description = resolveDescription(data.heroDescription, siteDescription);

  // `absoluteTitle`: etusivu on ainoa sivu jolla otsikkomallia
  // `%s · Lahden Suomalainen Klubi ry` ei haluta — se toistaisi nimen kahdesti.
  return buildMetadata({
    title: siteName,
    description,
    path: "/",
    image: data.heroImage,
    absoluteTitle: true,
  });
}

function renderBlock(block: EtusivuBlock) {
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
    case "jalkapalloarkisto":
      return (
        <JalkapalloarkistoBlock
          key={block._key}
          heading={block.heading}
          body={block.body}
          ctaLabel={block.ctaLabel}
          ctaHref={block.ctaHref}
        />
      );
    case "galleria":
      return (
        <GalleriaBlock
          key={block._key}
          heading={block.heading}
          count={block.count}
        />
      );
    case "cta":
      return <CtaBlock key={block._key} {...block} />;
    default:
      return null;
  }
}

export default async function Home() {
  const data = await getEtusivu();
  const description = resolveDescription(data.heroDescription, siteDescription);

  const usingFallback = data === defaultEtusivu;
  const blocks: EtusivuBlock[] = usingFallback
    ? scaffoldBlocks
    : (data.blocks ?? []);

  return (
    <>
      {/* Organization ja WebSite kuvataan juurilayoutissa — niitä ei toisteta. */}
      <JsonLd
        schema={[
          webPageSchema({ title: siteName, description, path: "/" }),
        ]}
      />

      <Hero data={data} />
      {blocks.map(renderBlock)}
    </>
  );
}
