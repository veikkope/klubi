import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { litmanenNav, rootCrumb } from "@/lib/nav-sections";
import { LITMANEN_PATH } from "@/lib/path";
import { buildMetadata, resolveDescription } from "@/lib/seo";

import { PelaajaProfiili } from "../_pelaaja/pelaaja-profiili";
import { haeLitmanen } from "./hae";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const pelaaja = await haeLitmanen();
  return buildMetadata({
    title: pelaaja?.seoTitle || pelaaja?.name || "Jari Litmanen",
    description: resolveDescription(pelaaja?.seoDescription, pelaaja?.tiivistelma),
    path: LITMANEN_PATH,
    image: pelaaja?.kuvat?.[0],
    modifiedAt: pelaaja?._updatedAt,
  });
}

export default async function LitmanenPage() {
  const pelaaja = await haeLitmanen();
  if (!pelaaja) notFound();

  return (
    <PelaajaProfiili
      pelaaja={pelaaja}
      path={LITMANEN_PATH}
      trail={[
        rootCrumb,
        { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
        { label: pelaaja.name },
      ]}
      subNav={{ items: litmanenNav, label: "Litmanen-osion sivut" }}
      naytaTilastot={false}
    />
  );
}
