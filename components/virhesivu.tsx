import Link from "next/link";

import { Container } from "@/components/layout/container";

/**
 * Virhesivujen yhteinen sisältö (404, odottamaton virhe). Kävijä on usein
 * tullut vanhasta linkistä tai hakukoneesta, joten tarjotaan suorat reitit
 * sivuston pääosioihin.
 */
const REITIT = [
  { href: "/", label: "Etusivu" },
  { href: "/uutiset", label: "Uutiset" },
  { href: "/ravintolat", label: "Ravintolat" },
  { href: "/jalkapalloarkisto", label: "Jalkapalloarkisto" },
  { href: "/klubi", label: "Klubi" },
];

export function Virhesivu({
  koodi,
  otsikko,
  teksti,
  toiminto,
}: {
  koodi?: string;
  otsikko: string;
  teksti: string;
  toiminto?: React.ReactNode;
}) {
  return (
    <Container size="narrow" className="py-20 sm:py-28">
      {koodi && <p className="text-sm font-semibold uppercase tracking-widest text-muted">{koodi}</p>}
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{otsikko}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{teksti}</p>
      {toiminto && <div className="mt-8">{toiminto}</div>}
      <nav aria-label="Sivuston pääosiot" className="mt-12">
        <h2 className="text-sm font-semibold text-foreground">Jatka täältä</h2>
        <ul className="mt-4 flex list-none flex-wrap gap-3 p-0">
          {REITIT.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="inline-flex min-h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}

export const EI_LOYTYNYT = {
  koodi: "Virhe 404",
  otsikko: "Sivua ei löytynyt",
  teksti:
    "Hakemaasi sivua ei ole, tai se on siirtynyt. Vanhan sivuston ja blogin osoitteet " +
    "ohjautuvat uusille sivuille automaattisesti. Jos tulit tänne linkistä, sisältö " +
    "löytyy todennäköisesti alla olevista osioista.",
};
