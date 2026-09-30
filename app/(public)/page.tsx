import type { Metadata } from "next";

import { Hero } from "@/components/blocks/hero";
import { UutisetBlock } from "@/components/blocks/uutiset-block";
import { TapahtumatBlock } from "@/components/blocks/tapahtumat-block";
import { OtteluohjelmaBlock } from "@/components/blocks/otteluohjelma-block";
import { EsittelyBlock } from "@/components/blocks/esittely-block";
import { RavintolatSpotlightBlock } from "@/components/blocks/ravintolat-spotlight-block";
import { JalkapalloarkistoBlock } from "@/components/blocks/jalkapalloarkisto-block";
import { GalleriaBlock } from "@/components/blocks/galleria-block";
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
 * josta tilanne tunnistetaan. Järjestys on tyylioppaan (Sivut v3) etusivu:
 * otteluohjelma + tapahtumat, jutut, ravintola-arviot, Klubista. Data-vetoiset
 * lohkot piilottavat itsensä kun sisältöä ei ole. Ei liittymiskehotetta.
 *
 * Kun Sanity on pystyssä, tätä ei käytetä: lohkot tulevat singletonista.
 */
const scaffoldBlocks: EtusivuBlock[] = [
  { _type: "otteluohjelma", _key: "scaffold-otteluohjelma" },
  { _type: "uutiset", _key: "scaffold-uutiset" },
  { _type: "ravintolatSpotlight", _key: "scaffold-ravintolat" },
  ...defaultEtusivu.blocks,
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

/**
 * GROQ-projektio palauttaa puuttuvan kentän `null`ina, mutta lohkojen
 * oletusarvot (esim. `ctaHref = "/jalkapalloarkisto"`) toimivat vain
 * `undefined`illa. Studiossa tyhjäksi jätetty kenttä käyttää siis oletusta.
 */
function withoutNulls<T extends object>(block: T): T {
  return Object.fromEntries(
    Object.entries(block).filter(([, value]) => value !== null),
  ) as T;
}

function renderBlock(block: EtusivuBlock) {
  switch (block._type) {
    case "uutiset":
      return (
        <UutisetBlock
          key={block._key}
          eyebrow={block.eyebrow}
          heading={block.heading}
          count={block.count}
        />
      );
    case "otteluohjelma":
      return <OtteluohjelmaBlock key={block._key} {...block} />;
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
          eyebrow={block.eyebrow}
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
      {blocks.map((block) => renderBlock(withoutNulls(block)))}
      {/* Viimeinen osio liittyy suoraan footeriin (tyyliopas). */}
      <span data-flush-footer hidden />
    </>
  );
}
