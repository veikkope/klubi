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

  return (
    <nav
      aria-label={label}
      className={cn("-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0", className)}
    >
      <ul className="flex gap-2 whitespace-nowrap pb-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition",
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:border-brand-300 hover:text-foreground",
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
