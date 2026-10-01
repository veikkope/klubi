"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

/**
 * Osion sisäinen navigaatio (jalkapalloarkisto, klubi).
 *
 * Kaksi syytä olla olemassa:
 *  - **Käytettävyys:** 24 reittiä ei mahdu päävalikkoon; osion sisällä pitää
 *    päästä sisarsivulle ilman paluuta hubiin.
 *  - **SEO:** jokainen arkistosivu linkittyy sisariinsa, jolloin syvällä oleva
 *    sivu ei jää linkittömäksi saarekkeeksi.
 */

export interface SectionNavItem {
  label: string;
  href: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  /** Ruudunlukijalle: minkä osion navigaatio tämä on. */
  label: string;
  className?: string;
}

export function SectionNav({ items, label, className }: SectionNavProps) {
  const pathname = usePathname();
  if (items.length === 0) return null;

  // Tarkin osuma voittaa: yleiskatsaus (/jalkapalloarkisto) on alasivujen
  // etuliite, eikä sen kuulu näkyä aktiivisena alasivulla.
  const activeHref = items
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((x, y) => y.length - x.length)[0];

  return (
    <nav
      aria-label={label}
      className={cn("-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0", className)}
    >
      {/* Painikkeet pysyvät yksirivisinä ja samankorkuisina: lista vierii
          vaakasuunnassa, joten pitkän nimen ("Suomen mestarit") ei tarvitse
          rivittyä eikä kutistaa painiketta muita korkeammaksi. */}
      <ul className="flex items-stretch gap-2 pb-1">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.href} className="flex shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-sm border px-4 text-sm transition",
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border bg-surface text-muted hover:border-accent hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
