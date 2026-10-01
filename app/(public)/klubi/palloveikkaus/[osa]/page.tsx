import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { KlubiSivuPage, fetchKlubiSivu } from "../../_components/klubi-sivu";
import { buildMetadata, resolveDescription } from "@/lib/seo";

import {
  PALLOVEIKKAUS_PATH,
  PALLOVEIKKAUS_SLUG,
  PALLOVEIKKAUS_TITLE,
  fetchVeikkaukset,
  veikkausNav,
} from "../alasivut";

export const revalidate = 3600;

type Params = { osa: string };

export async function generateStaticParams(): Promise<Params[]> {
  const veikkaukset = await fetchVeikkaukset();
  return veikkaukset.map((veikkaus) => ({
    osa: veikkaus.slug.slice(PALLOVEIKKAUS_SLUG.length + 1),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { osa } = await params;
  const path = `${PALLOVEIKKAUS_PATH}/${osa}`;
  const sivu = await fetchKlubiSivu(`${PALLOVEIKKAUS_SLUG}/${osa}`);

  if (!sivu) {
    return buildMetadata({
      title: "Veikkausta ei löytynyt",
      description:
        "Pyydettyä veikkausta ei löytynyt. Katso klubin kaikki veikkaukset Palloveikkaus-sivulta.",
      path,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: sivu.seoTitle || sivu.title,
    description: resolveDescription(sivu.seoDescription, sivu.tiivistelma, sivu.ingress),
    path,
    image: sivu.hero,
  });
}

export default async function VeikkausPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { osa } = await params;
  const [sivu, veikkaukset] = await Promise.all([
    fetchKlubiSivu(`${PALLOVEIKKAUS_SLUG}/${osa}`),
    fetchVeikkaukset(),
  ]);
  if (!sivu) notFound();

  return (
    <KlubiSivuPage
      sivu={sivu}
      path={`${PALLOVEIKKAUS_PATH}/${osa}`}
      fallbackTitle={sivu.title}
      emptyDescription="Veikkauksen säännöt ja tulokset julkaistaan tällä sivulla."
      parent={{ label: PALLOVEIKKAUS_TITLE, href: PALLOVEIKKAUS_PATH }}
      subNav={{ items: veikkausNav(veikkaukset), label: "Veikkaukset" }}
    />
  );
}
