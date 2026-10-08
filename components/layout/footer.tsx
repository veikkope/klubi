import Image from "next/image";
import { UUSI_VALILEHTI } from "@/components/ui/uusi-valilehti";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { Container } from "./container";
import { cn } from "@/lib/cn";
import { SocialIcon, socialLabels } from "@/components/ui/social-icon";
import { sanityFetch } from "@/sanity/lib/fetch";
import { haeNavigaatio } from "@/sanity/lib/navigaatio";
import { contactQuery } from "@/sanity/lib/queries";
import { defaultContact } from "@/lib/defaults";
import { alatunnisteenSarakkeet } from "@/lib/navigaatio";
import type { ContactData } from "@/lib/types";
import { TIETOSUOJA_PATH } from "@/lib/path";

/**
 * Alatunniste (tyyliopas Sivut v3): yönsininen, valkoinen pystylogo (merkki
 * 56 px + teksti 24 px), linkkisarakkeet, Yhteystiedot ja tekijänoikeusrivi.
 *
 * Linkkisarakkeet johdetaan päävalikosta (docs/23 Y23, docs/24 askel 4):
 * alavalikolliset kohdat omina sarakkeinaan, muut sarakkeessa Sivusto
 * (lib/navigaatio.ts). Tyhjät osiot ovat jo piilossa (haeNavigaatio).
 *
 * Sarakkeet ovat yhden nimetyn navin sisällä, jolla on oma sisempi ruudukko.
 * Navia ei "litistetä" ulomman ruudukon soluiksi CSS:n display-arvolla:
 * WebKit on pudottanut sellaisen elementin roolin saavutettavuuspuusta,
 * jolloin navi katoaisi ruudunlukijan maamerkeistä (docs/24 askel 4).
 */

const linkClass = "text-on-chrome-muted no-underline hover:text-on-chrome hover:underline";
const otsikkoClass = "mb-1 font-sans text-[15px] font-semibold text-on-chrome";

export async function Footer() {
  const [contact, items] = await Promise.all([
    sanityFetch<ContactData>({
      query: contactQuery,
      tags: ["yhteystiedot"],
      fallback: defaultContact,
    }),
    haeNavigaatio(),
  ]);
  const sarakkeet = alatunnisteenSarakkeet(items);
  // Ruudukon leveys: logo 1,6 osaa, jokainen linkkisarake ja Yhteystiedot 1 osa
  // kukin (sama jako kuin ennen, kun sarakkeita oli kaksi).
  const ruudukko = {
    "--alatunniste-sarakkeet": Math.max(sarakkeet.length, 1),
    "--alatunniste-nav": `${Math.max(sarakkeet.length, 1)}fr`,
  } as React.CSSProperties;

  const year = new Date().getFullYear();
  const socials = contact.socials ?? [];

  return (
    <footer className="mt-auto bg-chrome text-[15px] text-on-chrome-muted">
      <Container
        size="wide"
        className={cn(
          "grid gap-10 pb-8 pt-9 sm:grid-cols-2 sm:pt-[72px] lg:gap-12",
          // Ilman linkkisarakkeita (tyhjä valikko) Yhteystiedot logon viereen.
          sarakkeet.length > 0
            ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,var(--alatunniste-nav))_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
        )}
        style={ruudukko}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 self-start sm:col-span-2 sm:flex-col sm:items-start sm:gap-3.5 lg:col-span-1"
        >
          <Image
            src="/brand/web/mark-white.png"
            alt=""
            width={50}
            height={56}
            className="h-[38px] w-auto sm:h-14"
          />
          <Image
            src="/brand/web/wordmark-white.png"
            alt="Lahden Suomalainen Klubi ry — etusivu"
            width={153}
            height={24}
            className="h-[17px] w-auto sm:h-6"
          />
        </Link>

        {sarakkeet.length > 0 && (
          <nav
            aria-label="Alatunnisteen valikko"
            className="grid gap-10 sm:col-span-2 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-[repeat(var(--alatunniste-sarakkeet),minmax(0,1fr))] lg:gap-12"
          >
            {sarakkeet.map((sarake, i) => (
              <div key={`${i}|${sarake.otsikko}`} className="flex flex-col gap-2.5">
                <h2 className={otsikkoClass}>{sarake.otsikko}</h2>
                <ul className="flex flex-col gap-2.5">
                  {sarake.linkit.map((l) => (
                    <li key={`${l.href}|${l.label}`}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-2.5">
          <h2 className={otsikkoClass}>Yhteystiedot</h2>
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
            <Link href={TIETOSUOJA_PATH} className="text-on-chrome-eyebrow no-underline hover:text-on-chrome hover:underline">
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
