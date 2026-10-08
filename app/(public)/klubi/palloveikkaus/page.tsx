import type { Metadata } from "next";

import { KlubiSivuPage, fetchKlubiSivu } from "../_components/klubi-sivu";
import {
  Card,
  CardArrow,
  CardBody,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/card";
import { osioSivu, ratkaiseOsioSivu } from "@/lib/osiosivut";
import { buildMetadata, resolveDescription } from "@/lib/seo";

import {
  PALLOVEIKKAUS_PATH,
  PALLOVEIKKAUS_SLUG,
  fetchVeikkaukset,
  veikkausHref,
  veikkausNav,
} from "./alasivut";

export const revalidate = 3600;

/** Oletustekstit, kun dokumenttia ei ole (lib/osiosivut.ts). */
const OSIO = osioSivu(PALLOVEIKKAUS_SLUG)!;

export async function generateMetadata(): Promise<Metadata> {
  const sivu = await fetchKlubiSivu(PALLOVEIKKAUS_SLUG);
  const s = ratkaiseOsioSivu(sivu, OSIO);
  return buildMetadata({
    title: s.seoTitle,
    description: resolveDescription(s.description),
    path: PALLOVEIKKAUS_PATH,
    image: sivu?.hero,
    sisalto: sivu?.body,
  });
}

export default async function PalloveikkausPage() {
  const [sivu, veikkaukset] = await Promise.all([
    fetchKlubiSivu(PALLOVEIKKAUS_SLUG),
    fetchVeikkaukset(),
  ]);

  return (
    <KlubiSivuPage
      sivu={sivu}
      tekstit={ratkaiseOsioSivu(sivu, OSIO)}
      path={PALLOVEIKKAUS_PATH}
      emptyDescription="Palloveikkauksen säännöt, kierrokset ja tulokset julkaistaan tällä sivulla."
      subNav={
        veikkaukset.length > 0
          ? { items: veikkausNav(veikkaukset), label: "Veikkaukset" }
          : undefined
      }
    >
      {veikkaukset.length > 0 && (
        <section aria-labelledby="veikkaukset-otsikko" className="mt-16">
          <h2 id="veikkaukset-otsikko" className="font-display text-3xl leading-tight">
            Veikkaukset
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {veikkaukset.map((veikkaus) => (
              <li key={veikkaus._id} className="flex">
                <Card href={veikkausHref(veikkaus)} className="flex w-full flex-col">
                  {Boolean(veikkaus.taulukoita) && (
                    <CardEyebrow>
                      {veikkaus.taulukoita} {veikkaus.taulukoita === 1 ? "taulukko" : "taulukkoa"}
                    </CardEyebrow>
                  )}
                  <CardTitle className="mt-2">{veikkaus.title}</CardTitle>
                  {veikkaus.tiivistelma && (
                    <CardBody className="mt-2">{veikkaus.tiivistelma}</CardBody>
                  )}
                  <CardArrow label="Avaa veikkaus" />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </KlubiSivuPage>
  );
}
