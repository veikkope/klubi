import Image from "next/image";
import { UUSI_VALILEHTI } from "@/components/ui/uusi-valilehti";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { Container } from "./container";
import { SocialIcon, socialLabels } from "@/components/ui/social-icon";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";
import { defaultContact } from "@/lib/defaults";
import type { ContactData } from "@/lib/types";

/**
 * Alatunniste (tyyliopas Sivut v3): yönsininen, valkoinen pystylogo (merkki
 * 56 px + teksti 24 px), linkkisarakkeet Jalkapallo / Klubi / Yhteystiedot
 * ja tekijänoikeusrivi.
 *
 * Galleria ja uutisarkisto eivät ole päänavigaatiossa (docs/02), joten niille
 * on linkki täällä — muuten ne olisivat orpoja sivuja.
 */
const linkColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Jalkapallo",
    links: [
      { label: "Ottelut", href: "/ottelut" },
      { label: "Kentältä ja katsomosta", href: "/uutiset" },
      { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
      { label: "Uutisarkisto", href: "/uutiset/arkisto" },
    ],
  },
  {
    title: "Klubi",
    links: [
      { label: "Ravintola-arviot", href: "/ravintolat" },
      { label: "Tapahtumat", href: "/tapahtumat" },
      { label: "Klubista", href: "/klubi" },
      { label: "Kuvagalleria", href: "/galleria" },
    ],
  },
];

const linkClass = "text-on-chrome-muted no-underline hover:text-on-chrome hover:underline";

export async function Footer() {
  const contact = await sanityFetch<ContactData>({
    query: contactQuery,
    tags: ["yhteystiedot"],
    fallback: defaultContact,
  });

  const year = new Date().getFullYear();
  const socials = contact.socials ?? [];

  return (
    <footer className="mt-auto bg-chrome text-[15px] text-on-chrome-muted">
      <Container
        size="wide"
        className="grid gap-10 pb-8 pt-9 sm:grid-cols-2 sm:pt-[72px] lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-12"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 self-start sm:flex-col sm:items-start sm:gap-3.5"
        >
          <Image
            src="/brand/mark-white.png"
            alt=""
            width={50}
            height={56}
            className="h-[38px] w-auto sm:h-14"
          />
          <Image
            src="/brand/wordmark-white.png"
            alt="Lahden Suomalainen Klubi ry — etusivu"
            width={153}
            height={24}
            className="h-[17px] w-auto sm:h-6"
          />
        </Link>

        {linkColumns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5">
            <h2 className="mb-1 font-sans text-[15px] font-semibold text-on-chrome">{col.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex flex-col gap-2.5">
          <h2 className="mb-1 font-sans text-[15px] font-semibold text-on-chrome">Yhteystiedot</h2>
          <address className="flex flex-col gap-2.5 not-italic">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${stegaClean(contact.phone)}`} className={linkClass}>
                {contact.phone}
              </a>
            )}
            {contact.address ? (
              <span>
                {contact.address}, {contact.postalCode} {contact.city}
              </span>
            ) : (
              contact.city && <span>{contact.city}</span>
            )}
          </address>
          {socials.length > 0 && (
            <ul className="mt-2 flex gap-3">
              {socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${socialLabels[social.platform]} (${UUSI_VALILEHTI})`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-chrome-border text-on-chrome-muted transition hover:border-white hover:text-white"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {(contact.yTunnus || contact.iban) && (
            <dl className="mt-2 text-[13px]">
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
      </Container>

      <Container size="wide">
        <div className="flex flex-col gap-2 border-t border-[#2a3668] pb-6 pt-4 text-[13px] text-on-chrome-eyebrow sm:flex-row sm:items-center sm:justify-between sm:pb-10 sm:pt-6">
          <p>© {year} Lahden Suomalainen Klubi ry</p>
          <div className="flex gap-5">
            <Link href="/tietosuoja" className="text-on-chrome-eyebrow no-underline hover:text-on-chrome hover:underline">
              Tietosuojaseloste
            </Link>
            <Link href="/studio" className="text-on-chrome-eyebrow no-underline hover:text-on-chrome hover:underline">
              Ylläpito
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
