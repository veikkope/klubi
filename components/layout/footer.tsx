import Link from "next/link";
import { Container } from "./container";
import { SocialIcon, socialLabels } from "@/components/ui/social-icon";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";
import { defaultContact } from "@/lib/defaults";
import type { ContactData } from "@/lib/types";

export async function Footer() {
  const contact = await sanityFetch<ContactData>({
    query: contactQuery,
    tags: ["yhteystiedot"],
    fallback: defaultContact,
  });

  const year = new Date().getFullYear();
  const hasAddress = Boolean(contact.address);

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container size="wide" className="py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg leading-tight">
            Lahden Suomalainen Klubi ry
          </p>
          <p className="mt-2 text-sm text-muted">Perustettu 2007</p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Yhteystiedot
          </h2>
          <address className="mt-3 not-italic text-sm leading-relaxed text-foreground">
            {hasAddress && (
              <>
                {contact.address}
                <br />
                {contact.postalCode} {contact.city}
                <br />
              </>
            )}
            <a className="hover:text-accent" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            {contact.phone && (
              <>
                <br />
                <a className="hover:text-accent" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              </>
            )}
          </address>
          {(contact.yTunnus || contact.iban) && (
            <dl className="mt-3 text-xs text-muted">
              {contact.yTunnus && (
                <div className="flex gap-2">
                  <dt>Y-tunnus:</dt>
                  <dd>{contact.yTunnus}</dd>
                </div>
              )}
              {contact.iban && (
                <div className="flex gap-2">
                  <dt>IBAN:</dt>
                  <dd>{contact.iban}</dd>
                </div>
              )}
            </dl>
          )}
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Pikalinkit
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link className="hover:text-accent" href="/klubi">
                Yhdistys
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" href="/klubi/liity">
                Liity jäseneksi
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" href="/tapahtumat">
                Tapahtumat
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" href="/yhteystiedot">
                Yhteystiedot
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Seuraa
          </h2>
          {contact.socials.length > 0 ? (
            <ul className="mt-3 flex gap-3">
              {contact.socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabels[social.platform]}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Sosiaaliset mediat lisätään pian.</p>
          )}
        </div>
      </Container>
      <div className="border-t border-border">
        <Container size="wide" className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Lahden Suomalainen Klubi ry. Kaikki oikeudet pidätetään.</p>
          <p>
            <Link className="hover:text-accent" href="/studio">
              Studio
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}
