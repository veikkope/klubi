import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";
import { defaultContact } from "@/lib/defaults";
import type { ContactData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Yhteystiedot",
  description: "Lahden Suomalainen Klubi ry — yhteystiedot ja osoite.",
};

export default async function YhteystiedotPage() {
  const contact = await sanityFetch<ContactData>({
    query: contactQuery,
    tags: ["yhteystiedot"],
    fallback: defaultContact,
  });

  return (
    <Container className="py-16">
      <Breadcrumbs items={[{ label: "Etusivu", href: "/" }, { label: "Yhteystiedot" }]} />
      <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">Yhteystiedot</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Ota yhteyttä yhdistykseen — vastaamme arkisin tunnin sisällä.
      </p>

      <dl className="mt-12 grid gap-8 sm:grid-cols-2">
        {contact.address && (
          <div className="flex gap-4">
            <MapPin aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Osoite
              </dt>
              <dd className="mt-1 text-base text-foreground not-italic">
                {contact.address}
                <br />
                {contact.postalCode} {contact.city}
              </dd>
            </div>
          </div>
        )}
        <div className="flex gap-4">
          <Mail aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Sähköposti
            </dt>
            <dd className="mt-1">
              <a
                href={`mailto:${contact.email}`}
                className="text-base text-foreground hover:text-accent"
              >
                {contact.email}
              </a>
            </dd>
          </div>
        </div>
        {contact.phone && (
          <div className="flex gap-4">
            <Phone aria-hidden className="mt-1 shrink-0 text-accent" size={20} />
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Puhelin
              </dt>
              <dd className="mt-1">
                <a
                  href={`tel:${contact.phone}`}
                  className="text-base text-foreground hover:text-accent"
                >
                  {contact.phone}
                </a>
              </dd>
            </div>
          </div>
        )}
      </dl>

      {(contact.yTunnus || contact.iban) && (
        <dl className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2">
          {contact.yTunnus && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Y-tunnus
              </dt>
              <dd className="mt-1 text-base">{contact.yTunnus}</dd>
            </div>
          )}
          {contact.iban && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                IBAN
              </dt>
              <dd className="mt-1 text-base">{contact.iban}</dd>
            </div>
          )}
        </dl>
      )}
    </Container>
  );
}
