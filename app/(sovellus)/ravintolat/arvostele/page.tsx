import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { ravintolaAvain } from "@/lib/ravintolan-nimi";
import { buildMetadata } from "@/lib/seo";
import { webPageSchema } from "@/lib/schema-org";
import { getYhteysSahkoposti } from "@/lib/yhteystiedot";
import { readToken } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  klubilaisetQuery,
  ravintolaOptionsQuery,
  tuoreetArvostelutQuery,
  type KlubilainenOption,
  type RavintolaOption,
  type TuoreArvostelu,
} from "@/sanity/lib/queries/ravintolat";
import { TUOREET_TAG } from "./form-state";
import { ReviewForm } from "./review-form";

export const revalidate = 3600;

/** Montako viimeksi arvosteltua ravintolaa näytetään ravintolavaiheessa. */
const TUOREITA = 5;

/** Haussa löytyvät klubilaisten uudet ehdotukset (kukin kerran). */
const EHDOTUKSIA = 30;

/**
 * Viimeksi arvostellut ravintolat (uusin ensin, kukin kerran) ja kaikki
 * klubilaisten odottavat uuden ravintolan ehdotukset haun käyttöön.
 * Lukutunnuksella mukana myös hyväksymättömät lähetykset (vain viite, aika,
 * klubilaisen nimi ja ehdotuksen nimi; ks. tuoreetArvostelutQuery). Sama
 * ehdotus tunnistetaan samalla säännöllä kuin lähetyksessä ja hyväksynnässä
 * (lib/ravintolan-nimi.ts). Apuominaisuus: virhe ei kaada sivua.
 */
async function tuoreetArvostelut(
  ravintolat: RavintolaOption[],
): Promise<{ tuoreet: TuoreArvostelu[]; ehdotukset: TuoreArvostelu[] }> {
  if (!client) return { tuoreet: [], ehdotukset: [] };
  const lukija = client.withConfig({
    useCdn: false,
    ...(readToken ? { token: readToken, perspective: "raw" as const } : {}),
  });
  try {
    const rivit = await lukija.fetch<TuoreArvostelu[]>(tuoreetArvostelutQuery, {}, {
      next: { tags: [TUOREET_TAG, "ravintolaKayttajaArvostelu"], revalidate: 60 },
    });
    const tunnetut = new Set(ravintolat.map((r) => r._id));
    const nahty = new Set<string>();
    const tuoreet: TuoreArvostelu[] = [];
    const ehdotukset: TuoreArvostelu[] = [];
    for (const rivi of rivit) {
      let avain: string;
      if (rivi.ravintola) {
        if (!tunnetut.has(rivi.ravintola)) continue;
        avain = rivi.ravintola;
      } else if (rivi.uusi?.nimi?.trim() && rivi.uusi.kaupunki?.trim()) {
        rivi.uusi = {
          nimi: rivi.uusi.nimi.trim().slice(0, 100),
          kaupunki: rivi.uusi.kaupunki.trim().slice(0, 60),
          maa: rivi.uusi.maa?.trim().slice(0, 60) || null,
        };
        avain = `uusi:${ravintolaAvain(rivi.uusi.nimi, rivi.uusi.kaupunki)}`;
      } else {
        continue;
      }
      // Uusin rivi edustaa ravintolaa tai ehdotusta.
      if (nahty.has(avain)) continue;
      nahty.add(avain);
      if (tuoreet.length < TUOREITA) tuoreet.push(rivi);
      if (rivi.uusi && ehdotukset.length < EHDOTUKSIA) ehdotukset.push(rivi);
    }
    return { tuoreet, ehdotukset };
  } catch (error) {
    console.error("[arvostele] viimeksi arvostellut epäonnistui:", error);
    return { tuoreet: [], ehdotukset: [] };
  }
}

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
