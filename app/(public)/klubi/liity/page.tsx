import type { Metadata } from "next";
import Link from "next/link";

import { JasenhakemusForm } from "./jasenhakemus-form";
import { fetchKlubiSivu } from "../_components/klubi-sivu";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { PortableText } from "@/components/portable-text";
import { JsonLd } from "@/components/seo/json-ld";
import { defaultContact } from "@/lib/defaults";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import { breadcrumbSchema, webPageSchema, type Crumb } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";
import type { ContactData } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";

export const revalidate = 3600;

const PATH = "/klubi/liity";
/** Saate ja ehdot tulevat Studiosta — lomake on koodia, teksti ei. */
const SIVU_SLUG = "klubi/liity";
const FALLBACK_TITLE = "Liity jäseneksi";

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

export default async function LiityPage() {
  const [sivu, contact] = await Promise.all([
    fetchKlubiSivu(SIVU_SLUG),
    sanityFetch<ContactData>({
      query: contactQuery,
      tags: ["yhteystiedot"],
      fallback: defaultContact,
    }),
  ]);

  const title = sivu?.title || FALLBACK_TITLE;
  const lead = sivu?.tiivistelma || sivu?.ingress || null;
  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: title },
  ];
  const email = contact.email || defaultContact.email;

  return (
    <>
      <JsonLd
        schema={[
          webPageSchema({
            title,
            description: lead,
            path: PATH,
            modifiedAt: sivu?._updatedAt,
          }),
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

        <section aria-labelledby="hakemuslomake" className="mt-12">
          <h2 id="hakemuslomake" className="font-display text-3xl leading-tight">
            Sähköinen jäsenhakemus
          </h2>
          <JasenhakemusForm />
        </section>

        <section
          aria-labelledby="muut-tavat"
          className="mt-16 border-t border-border pt-8"
        >
          <h2 id="muut-tavat" className="font-display text-2xl leading-tight">
            Muut tavat ottaa yhteyttä
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Voit lähettää hakemuksen myös sähköpostitse osoitteeseen{" "}
            <a
              href={`mailto:${email}`}
              className="break-all text-accent hover:underline"
            >
              {email}
            </a>
            . Kaikki yhteystiedot löydät{" "}
            <Link href="/klubi/yhteystiedot" className="text-accent hover:underline">
              yhteystiedot-sivulta
            </Link>
            .
          </p>
        </section>
      </Container>
    </>
  );
}
