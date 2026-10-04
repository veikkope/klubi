import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { stegaClean } from "next-sanity";

import { EmptyState } from "../_components/empty-state";
import { fetchKlubiSivu } from "../_components/klubi-sivu";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { SanityImage } from "@/components/sanity-image";
import { JsonLd } from "@/components/seo/json-ld";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import {
  breadcrumbSchema,
  collectionPageSchema,
  personSchema,
  type Crumb,
} from "@/lib/schema-org";
import { HALLITUS_SIVU_SLUG } from "@/lib/path";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import {
  hallitusListQuery,
  type HallitusJasen,
} from "@/sanity/lib/queries/klubi";

export const revalidate = 3600;

const PATH = "/klubi/hallitus";
/** Valinnainen johdanto Studiosta — sama kuvio kuin muilla hub-sivuilla. */
const SIVU_SLUG = HALLITUS_SIVU_SLUG;
const FALLBACK_TITLE = "Hallitus";

function getJasenet() {
  return sanityFetch<HallitusJasen[]>({
    query: hallitusListQuery,
    tags: ["hallitusJasen"],
    fallback: [],
  });
}

/** Ankkuri jäsenelle: JSON-LD:n `url` osoittaa samaan kohtaan kuin sivun id. */
function anchorId(id: string): string {
  return `jasen-${id.replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const sivu = await fetchKlubiSivu(SIVU_SLUG);
  return buildMetadata({
    title: sivu?.seoTitle || sivu?.title || FALLBACK_TITLE,
    description: resolveDescription(
      sivu?.seoDescription,
      sivu?.tiivistelma,
      sivu?.ingress,
    ),
    path: PATH,
  });
}

export default async function HallitusPage() {
  const [sivu, jasenet] = await Promise.all([
    fetchKlubiSivu(SIVU_SLUG),
    getJasenet(),
  ]);

  const title = sivu?.title || FALLBACK_TITLE;
  const lead = sivu?.tiivistelma || sivu?.ingress || null;
  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: title },
  ];

  return (
    <>
      <JsonLd
        schema={[
          collectionPageSchema({
            title,
            description: lead,
            path: PATH,
            itemCount: jasenet.length,
          }),
          ...jasenet.map((jasen) =>
            personSchema({
              name: jasen.name,
              description: jasen.role,
              path: `${PATH}#${anchorId(jasen._id)}`,
              image: urlForImage(jasen.image)?.width(600).height(600).url(),
            }),
          ),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader title={title} lead={lead} breadcrumbs={trail} />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        {sivu?.body && sivu.body.length > 0 && (
          <div className="mt-10 max-w-3xl">
            <PortableText value={sivu.body} />
          </div>
        )}

        {jasenet.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Hallituksen kokoonpanoa ei ole vielä lisätty"
              description="Hallituksen jäsenet esitellään tällä sivulla pian."
            />
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jasenet.map((jasen) => (
              <li
                key={jasen._id}
                id={anchorId(jasen._id)}
                className="flex flex-col rounded-2xl border border-border bg-surface p-6"
              >
                {jasen.image?.asset && (
                  <SanityImage
                    image={jasen.image}
                    width={400}
                    height={400}
                    sizes="112px"
                    className="size-28 rounded-full object-cover"
                  />
                )}
                <h2 className="mt-4 font-display text-xl text-foreground">
                  {jasen.name}
                </h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.14em] text-accent">
                  {jasen.role}
                </p>
                {jasen.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {jasen.bio}
                  </p>
                )}
                {(jasen.email || jasen.phone) && (
                  <ul className="mt-4 flex flex-col gap-1 text-sm">
                    {jasen.email && (
                      <li>
                        <a
                          href={`mailto:${jasen.email}`}
                          className="inline-flex min-h-11 items-center gap-2 text-foreground hover:text-accent"
                        >
                          <Mail aria-hidden size={16} className="text-accent" />
                          <span className="break-all">{jasen.email}</span>
                        </a>
                      </li>
                    )}
                    {jasen.phone && (
                      <li>
                        <a
                          href={`tel:${stegaClean(jasen.phone).replace(/\s+/g, "")}`}
                          className="inline-flex min-h-11 items-center gap-2 text-foreground hover:text-accent"
                        >
                          <Phone
                            aria-hidden
                            size={16}
                            className="text-accent"
                          />
                          <span>{jasen.phone}</span>
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
