import Image from "next/image";
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

  // Tyyliopas (Sivut v3): valkoinen ylätunniste, alareunassa ohut viiva.
  // Logo: merkki 50 px + tekstilogo 25 px, väli 14 px (mobiilissa 38 + 17).
  // Ei CTA-painiketta.
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <Container size="wide" className="flex items-center justify-between gap-6 py-3.5 sm:py-[22px]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
          <Image
            src="/brand/mark-blue.png"
            alt=""
            width={45}
            height={50}
            priority
            className="h-[38px] w-auto sm:h-[50px]"
          />
          <Image
            src="/brand/wordmark-blue.png"
            alt="Lahden Suomalainen Klubi ry — etusivu"
            width={159}
            height={25}
            priority
            className="h-[17px] w-auto sm:h-[25px]"
          />
        </Link>
        <HeaderClient items={nav.items} />
      </Container>
    </header>
  );
}
