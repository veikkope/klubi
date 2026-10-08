import { Box, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { Component, Suspense, lazy, type ReactNode } from "react";
import type { DocumentInspectorProps } from "sanity";

import { OHJE_PDF } from "../../../lib/ohje/tyypit";

/**
 * Ohjeiden latauskääreet (docs/25). Sisältö (kaikki kortit HTML:nä) ladataan
 * vasta, kun Ohjeet tai Ohje-paneeli avataan, joten Studion käynnistys ei hidastu.
 * Virheraja pitää vian ohjeessa: muu Studio toimii, vaikka ohje kaatuisi.
 */

const OhjeetTyokalu = lazy(() => import("./OhjeetTyokalu"));
const OhjePaneeli = lazy(() => import("./OhjePaneeli"));

class Virheraja extends Component<{ children: ReactNode }, { virhe: Error | null }> {
  state: { virhe: Error | null } = { virhe: null };

  static getDerivedStateFromError(virhe: Error) {
    return { virhe };
  }

  componentDidCatch(virhe: Error) {
    console.error("Ohjeen näyttäminen epäonnistui", virhe);
  }

  render() {
    if (!this.state.virhe) return this.props.children;
    return (
      <Box padding={4}>
        <Card tone="critical" padding={4} radius={2} border>
          <Stack space={3}>
            <Text weight="semibold">Ohjetta ei voitu näyttää.</Text>
            <Text size={1}>
              Lataa sivu uudelleen. Jos vika jatkuu, avaa{" "}
              <a href={OHJE_PDF} target="_blank" rel="noopener noreferrer">
                ohje PDF-tiedostona
              </a>{" "}
              ja kerro tukihenkilölle. Muu Studio toimii normaalisti.
            </Text>
          </Stack>
        </Card>
      </Box>
    );
  }
}

function Ladataan() {
  return (
    <Flex align="center" justify="center" padding={5} height="fill">
      <Spinner muted />
    </Flex>
  );
}

export function OhjeetTyokaluLadattava() {
  return (
    <Virheraja>
      <Suspense fallback={<Ladataan />}>
        <OhjeetTyokalu />
      </Suspense>
    </Virheraja>
  );
}

export function OhjePaneeliLadattava(props: DocumentInspectorProps) {
  return (
    <Virheraja>
      <Suspense fallback={<Ladataan />}>
        <OhjePaneeli {...props} />
      </Suspense>
    </Virheraja>
  );
}
