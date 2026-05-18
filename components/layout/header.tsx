import Link from "next/link";
import { Container } from "./container";
import { HeaderClient } from "./header-client";
import { sanityFetch } from "@/sanity/lib/fetch";
import { navigationQuery } from "@/sanity/lib/queries";
import { defaultNavigation } from "@/lib/defaults";
import type { NavigationData } from "@/lib/types";

export async function Header() {
  const nav = await sanityFetch<NavigationData>({
    query: navigationQuery,
    tags: ["navigaatio"],
    fallback: defaultNavigation,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <Container size="wide" className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-serif text-lg leading-none text-foreground hover:text-accent"
        >
          <span className="block text-[11px] uppercase tracking-[0.18em] text-muted">
            Lahden
          </span>
          <span>Suomalainen Klubi</span>
        </Link>
        <HeaderClient items={nav.items} />
      </Container>
    </header>
  );
}
