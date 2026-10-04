import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { webPageSchema } from "@/lib/schema-org";
import { getYhteysSahkoposti } from "@/lib/yhteystiedot";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  klubilaisetQuery,
  ravintolaOptionsQuery,
  type KlubilainenOption,
  type RavintolaOption,
} from "@/sanity/lib/queries/ravintolat";
import { ReviewForm } from "./review-form";
import { tuoreetArvostelut } from "./tuoreet";

export const revalidate = 3600;

const TITLE = "Arvostele ravintola";
const PATH = "/ravintolat/arvostele";
const DESCRIPTION =
  "Arvostele ravintola tai ehdota uutta Lahden Suomalainen Klubi ry:n " +
  "ravintolahakemistoon. Arvostelut tarkistetaan ennen julkaisua.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({ title: TITLE, description: DESCRIPTION, path: PATH }),
    // Kotinäytön kuvake iPhonella (Android lukee app/manifest.ts:n).
    appleWebApp: { capable: true, title: "Arvostele", statusBarStyle: "default" },
  };
}

/**
 * Puhelimen lovi ja kotipalkki huomioidaan (safe-area kehyksessä), ja
 * Androidin näppäimistö kutistaa näkymän, jolloin alapalkin painike pysyy
 * näppäimistön yläpuolella.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default async function ArvostelePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const wanted = Array.isArray(sp.ravintola) ? sp.ravintola[0] : sp.ravintola;

  const [restaurants, klubilaiset, email] = await Promise.all([
    sanityFetch<RavintolaOption[]>({
      query: ravintolaOptionsQuery,
      tags: ["ravintola"],
      fallback: [],
    }),
    sanityFetch<KlubilainenOption[]>({
      query: klubilaisetQuery,
      tags: ["klubilainen"],
      fallback: [],
    }),
    getYhteysSahkoposti(),
  ]);

  const preselected = wanted ? restaurants.find((r) => r.slug === wanted)?._id : undefined;
  const { tuoreet, ehdotukset } = await tuoreetArvostelut(restaurants);

  return (
    <>
      <JsonLd schema={webPageSchema({ title: TITLE, description: DESCRIPTION, path: PATH })} />
      {restaurants.length === 0 ? (
        <UnavailableNotice email={email} />
      ) : (
        <ReviewForm
          restaurants={restaurants}
          klubilaiset={klubilaiset}
          tuoreet={tuoreet}
          ehdotukset={ehdotukset}
          defaultRestaurantId={preselected}
        />
      )}
      <noscript>
        <p className="mx-auto max-w-xl px-4 py-10 text-center text-muted">
          Arvostelu tarvitsee JavaScriptin. Ota se käyttöön selaimen asetuksista
          {email ? <> tai lähetä arviosi osoitteeseen {email}</> : null}.
        </p>
      </noscript>
    </>
  );
}

/**
 * Ravintolalistaa ei saatu — arvostelua ei voi kohdistaa mihinkään. Kerrotaan
 * se suoraan sen sijaan että näytettäisiin lomake, joka ei voi onnistua.
 */
function UnavailableNotice({ email }: { email: string | null }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <h1 className="font-display text-2xl text-heading">Arvostelu ei ole juuri nyt käytettävissä</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Ravintolahakemistoa ei saatu ladattua, joten arvostelua ei voi kohdistaa mihinkään
        ravintolaan. Kokeile hetken kuluttua uudelleen
        {email ? (
          <>
            {" "}tai lähetä arviosi sähköpostitse osoitteeseen{" "}
            <a href={`mailto:${email}`} className="text-accent underline underline-offset-4">
              {email}
            </a>
            .
          </>
        ) : (
          "."
        )}
      </p>
      <Link
        href="/ravintolat"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-6 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Selaa ravintolahakemistoa
      </Link>
    </div>
  );
}
