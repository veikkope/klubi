import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionNav } from "@/components/layout/section-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { loukkaantumisYhteenveto } from "@/lib/loukkaantumiset";
import { arkistoNav } from "@/lib/nav-sections";
import { LITMANEN_LOUKKAANTUMISET_PATH } from "@/lib/path";
import { breadcrumbSchema } from "@/lib/schema-org";
import { buildMetadata, resolveDescription } from "@/lib/seo";

import { LeikeLista } from "../../_pelaaja/leike-lista";
import { Loukkaantumiskooste } from "../../_pelaaja/loukkaantumiskooste";
import { StatSections } from "../../_tilastot/stat-sections";
import { haeLehtileikkeet, haeLitmanen, litmanenSubNav, litmanenTrail } from "../hae";

export const revalidate = 3600;

const TITLE = "Litmasen loukkaantumiset";
const osioOtsikko = "font-display text-2xl text-foreground sm:text-3xl";

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
  const leikkeet = pelaaja ? await haeLehtileikkeet(pelaaja._id, "terveys") : [];
  const ensimmainen = tilastot[0];
  const yhteenveto = ensimmainen ? loukkaantumisYhteenveto(ensimmainen.columns ?? [], ensimmainen.rows ?? []) : null;
  const trail = litmanenTrail(pelaaja?.name, TITLE);

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd schema={[breadcrumbSchema(trail)]} />

      {/* Ei ingressiä: taulukon tiivistelmä näkyy taulukon otsikon alla, ja tunnusluvut kertovat saman tiiviimmin. */}
      <PageHeader eyebrow="Litmanen" title={TITLE} breadcrumbs={trail} />

      <SectionNav items={arkistoNav} label="Jalkapalloarkiston osiot" className="mt-8" />
      <SectionNav items={litmanenSubNav.items} label={litmanenSubNav.label} className="mt-3" />

      {yhteenveto && (
        <div className="mt-12">
          <Loukkaantumiskooste yhteenveto={yhteenveto} />
        </div>
      )}

      <section aria-labelledby="loukkaantumiset-taulukko" className="mt-16">
        <h2 id="loukkaantumiset-taulukko" className={osioOtsikko}>
          Kaikki vammat
        </h2>
        <StatSections
          tilastot={tilastot}
          headingLevel="h3"
          emptyMessage="Loukkaantumistaulukkoa ei ole vielä lisätty Studiossa Jari Litmasen pelaajasivulle."
          className="mt-6"
        />
      </section>

      {leikkeet.length > 0 && (
        <section aria-labelledby="terveys-lehtileikkeissa" className="mt-16">
          <h2 id="terveys-lehtileikkeissa" className={osioOtsikko}>
            Terveys ja loukkaantumiset lehtileikkeissä
          </h2>
          <p className="mt-2 text-muted">{leikkeet.length} juttua, uusin ensin.</p>
          <div className="mt-8">
            <LeikeLista leikkeet={leikkeet} idEtuliite="terveys" otsikkotaso={3} />
          </div>
        </section>
      )}
    </Container>
  );
}
