import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { vuosivali } from "@/lib/lehtileikkeet";
import { arkistoNav } from "@/lib/nav-sections";
import { LITMANEN_LEHTILEIKKEET_PATH } from "@/lib/path";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata } from "@/lib/seo";

import { ArkistoEmpty } from "../../_tilastot/stat-sections";
import { LeikeLista } from "../../_pelaaja/leike-lista";
import { haeLehtileikkeet, haeLitmanen, litmanenSubNav, litmanenTrail } from "../hae";

export const revalidate = 3600;

const TITLE = "Lehtileikkeet";

async function hae() {
  const pelaaja = await haeLitmanen();
  const leikkeet = pelaaja ? await haeLehtileikkeet(pelaaja._id, "lehtileikkeet") : [];
  const vali = vuosivali(leikkeet.at(-1)?.julkaistu, leikkeet[0]?.julkaistu);
  const lead =
    leikkeet.length > 0
      ? `${leikkeet.length} lehtijuttua Jari Litmasesta${vali ? ` vuosilta ${vali}` : ""}: ura, valmentaminen ja elämä jalkapallon jälkeen. Uusin ensin.`
      : null;
  return { pelaaja, leikkeet, lead };
}

export async function generateMetadata(): Promise<Metadata> {
  const { pelaaja, lead } = await hae();
  return buildMetadata({
    title: `${pelaaja?.name ?? "Jari Litmanen"}: ${TITLE.toLowerCase()}`,
    description: lead ?? undefined,
    path: LITMANEN_LEHTILEIKKEET_PATH,
  });
}

export default async function LitmanenLehtileikkeetPage() {
  const { pelaaja, leikkeet, lead } = await hae();
  const trail = litmanenTrail(pelaaja?.name, TITLE);

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd schema={[breadcrumbSchema(trail)]} />
      <PageHeader eyebrow="Litmanen" title={TITLE} lead={lead} breadcrumbs={trail} />
      <SectionNav items={arkistoNav} label="Jalkapalloarkiston osiot" className="mt-8" />
      <SectionNav items={litmanenSubNav.items} label={litmanenSubNav.label} className="mt-3" />

      <div className="mt-12">
        {leikkeet.length > 0 ? (
          <LeikeLista leikkeet={leikkeet} />
        ) : (
          <ArkistoEmpty title="Ei vielä lehtileikkeitä" message="Lehtileikkeet lisätään Studiossa kohdassa Jalkapalloarkisto → Lehtileikkeet." />
        )}
      </div>
    </Container>
  );
}
