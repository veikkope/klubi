import type { Metadata } from "next";

import { KlubiSivuPage, fetchKlubiSivu } from "../_components/klubi-sivu";
import { buildMetadata, resolveDescription } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/klubi/saannot";
const SIVU_SLUG = "klubi/saannot";
const FALLBACK_TITLE = "Säännöt";

export async function generateMetadata(): Promise<Metadata> {
  const sivu = await fetchKlubiSivu(SIVU_SLUG);
  return buildMetadata({
    title: sivu?.seoTitle || sivu?.title || FALLBACK_TITLE,
    description: resolveDescription(
      sivu?.seoDescription,
      sivu?.tiivistelma,
      sivu?.ingress,
    ),
    path: PATH,
    image: sivu?.hero,
  });
}

export default async function SaannotPage() {
  const sivu = await fetchKlubiSivu(SIVU_SLUG);

  return (
    <KlubiSivuPage
      sivu={sivu}
      path={PATH}
      fallbackTitle={FALLBACK_TITLE}
      emptyDescription="Yhdistyksen säännöt lisätään Sanity Studiossa sivulle, jonka polku on “klubi/saannot”."
    />
  );
}
