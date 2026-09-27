import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { EmptyState } from "../_components/empty-state";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { SocialIcon, socialLabels } from "@/components/ui/social-icon";
import { defaultContact } from "@/lib/defaults";
import { klubiNav, rootCrumb } from "@/lib/nav-sections";
import {
  breadcrumbSchema,
  organizationSchema,
  webPageSchema,
  type Crumb,
} from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";
import type { ContactData } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";

export const revalidate = 3600;

const PATH = "/klubi/yhteystiedot";
const TITLE = "Yhteystiedot";
const DESCRIPTION =
  "Lahden Suomalainen Klubi ry:n yhteystiedot: osoite, sähköposti, puhelin ja laskutustiedot.";

function getContact() {
  return sanityFetch<ContactData>({
    query: contactQuery,
    tags: ["yhteystiedot"],
    fallback: defaultContact,
  });
}

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
  });
}

export default async function YhteystiedotPage() {
  const contact = await getContact();

  const trail: Crumb[] = [
    rootCrumb,
    { label: "Klubi", href: "/klubi" },
    { label: TITLE },
  ];

  const hasAddress = Boolean(contact.address);
  const hasBilling = Boolean(contact.yTunnus || contact.iban);
  const socials = contact.socials ?? [];
  /** Studiossa ei ole vielä täytetty mitään sähköpostin lisäksi. */
  const isBare = !hasAddress && !contact.phone && !hasBilling && socials.length === 0;

  return (
    <>
      <JsonLd
        schema={[
          // Sama @id kuin juurilayoutin organisaatiolla: tämä sivu täydentää
          // sen osoitteella ja yhteystiedoilla, ei kuvaa toista entiteettiä.
          organizationSchema({
            address: contact.address,
            postalCode: contact.postalCode,
            city: contact.city,
            email: contact.email,
            phone: contact.phone,
          }),
          webPageSchema({
            title: TITLE,
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbSchema(trail),
        ]}
      />

      <Container className="py-12 sm:py-16">
        <PageHeader title={TITLE} breadcrumbs={trail} />
        <SectionNav items={klubiNav} label="Klubin osiot" className="mt-8" />

        <dl className="mt-12 grid gap-8 sm:grid-cols-2">
          {hasAddress && (
            <div className="flex gap-4">
              <MapPin aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Osoite
                </dt>
                <dd className="mt-1 text-base text-foreground">
                  {contact.address}
                  <br />
                  {contact.postalCode} {contact.city}
                </dd>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex gap-4">
              <Mail aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Sähköposti
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex min-h-11 items-center break-all text-base text-foreground hover:text-accent"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex gap-4">
              <Phone aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Puhelin
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="inline-flex min-h-11 items-center text-base text-foreground hover:text-accent"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
            </div>
          )}
        </dl>

        {hasBilling && (
          <section aria-labelledby="laskutustiedot" className="mt-12 border-t border-border pt-8">
            <h2
              id="laskutustiedot"
              className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
            >
              Laskutustiedot
            </h2>
            <dl className="mt-4 grid gap-6 sm:grid-cols-2">
              {contact.yTunnus && (
                <div>
                  <dt className="text-sm text-muted">Y-tunnus</dt>
                  <dd className="mt-1 text-base">{contact.yTunnus}</dd>
                </div>
              )}
              {contact.iban && (
                <div>
                  <dt className="text-sm text-muted">IBAN</dt>
                  <dd className="mt-1 text-base">{contact.iban}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {socials.length > 0 && (
          <section aria-labelledby="seuraa" className="mt-12 border-t border-border pt-8">
            <h2
              id="seuraa"
              className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
            >
              Seuraa klubia
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground transition hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={social.platform} />
                    {socialLabels[social.platform]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isBare && (
          <div className="mt-12">
            <EmptyState
              title="Yhteystiedot ovat vielä täydentämättä"
              description="Postiosoite, puhelinnumero ja laskutustiedot julkaistaan tällä sivulla pian."
            />
          </div>
        )}

        <p className="mt-12 text-muted">
          Haluatko mukaan toimintaan?{" "}
          <Link href="/klubi/liity" className="text-accent hover:underline">
            Lähetä jäsenhakemus
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
