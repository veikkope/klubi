import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { Container } from "./container";
import { HeaderClient } from "./header-client";
import { sanityFetch } from "@/sanity/lib/fetch";
import { navigationQuery } from "@/sanity/lib/queries";
import { defaultNavigation } from "@/lib/defaults";
import { piilotaTyhjat } from "@/lib/osiot";
import { haeTyhjatOsiot } from "@/sanity/lib/tyhjat-osiot";
import type { NavigationData } from "@/lib/types";

export async function Header() {
  const [nav, tyhjat] = await Promise.all([
    sanityFetch<NavigationData>({
      query: navigationQuery,
      tags: ["navigaatio"],
      fallback: defaultNavigation,
    }),
    haeTyhjatOsiot(),
  ]);

  // Luonnosnäkymässä hrefeissä voi olla stega-merkkejä, jotka rikkoisivat
  // linkit ja aktiivisen kohteen vertailun (pathname === href). Puhdistetaan
  // vain hrefit, jotta otsikoiden klikkaa-ja-muokkaa toimii yhä.
  // Tyhjät osiot (esim. Tapahtumat ilman tapahtumia) piiloon, lib/osiot.ts.
  const items = piilotaTyhjat(
    nav.items.map((item) => ({
      ...item,
      href: stegaClean(item.href),
      children: item.children?.map((c) => ({ ...c, href: stegaClean(c.href) })),
    })),
    tyhjat,
  );

  // Tyyliopas (Sivut v3): valkoinen ylätunniste, alareunassa ohut viiva.
  // Logo: merkki 50 px + tekstilogo 25 px, väli 14 px (mobiilissa 38 + 17).
  // Ei CTA-painiketta. Sivua vieritettäessä alle tulee hento varjo
  // (.header-varjo, globals.css).
  return (
    // viewTransitionName: header pysyy paikallaan sivunvaihdon animaatiossa
    // (globals.css, sivuston-header).
    <header
      className="header-varjo sticky top-0 z-40 border-b border-border bg-surface"
      style={{ viewTransitionName: "sivuston-header" }}
    >
      <Container size="wide" className="flex items-center justify-between gap-6 py-3.5 sm:py-[22px]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
          <Image
            src="/brand/web/mark-blue.png"
            alt=""
            width={45}
            height={50}
            loading="eager"
            className="h-[38px] w-auto sm:h-[50px]"
          />
          <Image
            src="/brand/web/wordmark-blue.png"
            alt="Lahden Suomalainen Klubi ry — etusivu"
            width={159}
            height={25}
            loading="eager"
            className="h-[17px] w-auto sm:h-[25px]"
          />
        </Link>
        <HeaderClient items={items} />
      </Container>
    </header>
  );
}
