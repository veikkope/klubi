import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { arkistoNav, litmanenNav, rootCrumb } from "@/lib/nav-sections";
import { LITMANEN_LOUKKAANTUMISET_PATH, LITMANEN_PATH } from "@/lib/path";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";

import { StatSections } from "../../_tilastot/stat-sections";
import { haeLitmanen } from "../hae";

export const revalidate = 3600;

const TITLE = "Litmasen loukkaantumiset";

export async function generateMetadata(): Promise<Metadata> {
  const tilasto = (await haeLitmanen())?.tilastot?.find(Boolean);
  return buildMetadata({
    title: TITLE,
    description: resolveDescription(tilasto?.tiivistelma, tilasto?.title),
    path: LITMANEN_LOUKKAANTUMISET_PATH,
    modifiedAt: tilasto?._updatedAt,
  });
}

export default async function LitmasenLoukkaantumisetPage() {
  const pelaaja = await haeLitmanen();
  const tilastot = (pelaaja?.tilastot ?? []).filter(Boolean);
  const trail = [
    rootCrumb,
    { label: "Jalkapalloarkisto", href: "/jalkapalloarkisto" },
    { label: pelaaja?.name ?? "Jari Litmanen", href: LITMANEN_PATH },
    { label: TITLE },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd schema={[breadcrumbSchema(trail)]} />

      <PageHeader
        eyebrow="Litmanen"
        title={TITLE}
        lead={tilastot[0]?.tiivistelma}
        breadcrumbs={trail}
      />

      <SectionNav
        items={arkistoNav}
        label="Jalkapalloarkiston osiot"
        className="mt-8"
      />
      <SectionNav items={litmanenNav} label="Litmanen-osion sivut" className="mt-3" />

      <StatSections
        tilastot={tilastot}
        emptyMessage="Loukkaantumistaulukkoa ei ole vielä lisätty Studiossa Jari Litmasen pelaajasivulle."
        className="mt-10"
      />
    </Container>
  );
}
