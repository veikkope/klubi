import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import type { Crumb } from "@/components/layout/breadcrumbs";
import { arkistoNav } from "@/lib/nav-sections";

/**
 * Arkistosivun yhteinen runko: murupolku, otsikko, osionavigaatio, sisältö.
 *
 * Yhtenäinen runko on sekä käytettävyys- että SEO-vaatimus: jokainen
 * arkistosivu linkittyy osionavigaation kautta hubiinsa ja sisariinsa,
 * jolloin syvällä oleva sivu ei jää linkittömäksi saarekkeeksi.
 */

interface ArkistoPageProps {
  title: string;
  lead?: string | null;
  eyebrow?: string;
  breadcrumbs: Crumb[];
  meta?: React.ReactNode;
  size?: "narrow" | "default" | "wide";
  children: React.ReactNode;
}

export function ArkistoPage({
  title,
  lead,
  eyebrow = "Jalkapalloarkisto",
  breadcrumbs,
  meta,
  size = "wide",
  children,
}: ArkistoPageProps) {
  return (
    <>
      <Container size={size} className="pt-12">
        <PageHeader
          title={title}
          lead={lead}
          eyebrow={eyebrow}
          breadcrumbs={breadcrumbs}
          meta={meta}
        />
      </Container>

      <Container size={size} className="pt-8">
        <SectionNav items={arkistoNav} label="Jalkapalloarkiston osiot" />
      </Container>

      <Container size={size} className="py-12">
        {children}
      </Container>
    </>
  );
}
