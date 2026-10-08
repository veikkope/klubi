import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import { HeaderClient } from "./header-client";
import { haeNavigaatio } from "@/sanity/lib/navigaatio";

export async function Header() {
  // Valikko ratkaistuna, stega-merkit pois osoitteista ja tyhjät osiot
  // (esim. Tapahtumat ilman tapahtumia) piilossa: sanity/lib/navigaatio.ts.
  const items = await haeNavigaatio();

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
