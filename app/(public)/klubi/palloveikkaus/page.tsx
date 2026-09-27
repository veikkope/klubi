import type { Metadata } from "next";

import { KlubiSivuPage, fetchKlubiSivu } from "../_components/klubi-sivu";
import { buildMetadata, resolveDescription } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/klubi/palloveikkaus";
const SIVU_SLUG = "klubi/palloveikkaus";
const FALLBACK_TITLE = "Palloveikkaus";

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

export default async function PalloveikkausPage() {
  const sivu = await fetchKlubiSivu(SIVU_SLUG);

  return (
    <KlubiSivuPage
      sivu={sivu}
      path={PATH}
      fallbackTitle={FALLBACK_TITLE}
      emptyDescription="Palloveikkauksen säännöt, kierrokset ja tulokset julkaistaan tällä sivulla."
    />
  );
}
