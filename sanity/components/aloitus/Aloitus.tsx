import { Card, Container, Heading, Stack, Text } from "@sanity/ui";

import { OhjeetLinkki } from "../ohjeet/OhjeetLinkki";
import { Odottaa } from "./Odottaa";
import { Puuttuvat } from "./Puuttuvat";
import { SivustonTila } from "./SivustonTila";
import { useSivustonTila } from "./useSivustonTila";

/**
 * Studion Aloitus-näkymä (docs/24 askel 7, docs/23 Y33 ja Y35): Studio avautuu
 * tähän. Sivuston tila, odottavat tehtävät ja puuttuvat perustiedot.
 * Sähköpostia tai muita hälytyksiä ei lähetetä (päätökset 7.10. ja 8.10.2026):
 * tila näkyy, kun Studio avataan.
 */
export function Aloitus() {
  const { rivit, laskurit, puuttuvat, virhe, ladataan, lataa } = useSivustonTila();
  return (
    <Card padding={[3, 4, 5]} sizing="border" style={{ height: "100%", overflowY: "auto" }}>
      <Container width={2}>
        <Stack space={5}>
          <Stack space={3}>
            <Heading as="h1" size={3}>
              Hei! Tästä pääset alkuun
            </Heading>
            <Text muted>Tällä sivulla näet, onko sivustolla kaikki kunnossa ja mikä odottaa sinua.</Text>
          </Stack>
          <SivustonTila rivit={rivit} ladataan={ladataan} virhe={virhe} lataa={lataa} />
          <Odottaa laskurit={laskurit} />
          <Puuttuvat puuttuvat={puuttuvat} />
          <OhjeetLinkki />
        </Stack>
      </Container>
    </Card>
  );
}
