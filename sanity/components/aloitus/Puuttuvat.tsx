import { Card, Heading, Stack, Text } from "@sanity/ui";
import { IntentLink, Link } from "sanity/router";

import type { PuuttuvaTieto } from "../../../lib/sivuston-tila";

/**
 * "Täydennä perustiedot" (docs/24 askel 7): näkyy vain, kun jotain puuttuu.
 * Yhteystiedot ja etusivu avataan muokattavaksi suoraan (IntentLink),
 * hallitus Studion Klubi-ryhmästä (kiinteät tunnukset, docs/24 §2.6).
 */
const HALLITUS = "/studio/structure/klubi;hallitus";

const KOHTEET: Record<PuuttuvaTieto["kohde"], { id: string; type: string } | null> = {
  yhteystiedot: { id: "yhteystiedot", type: "yhteystiedot" },
  etusivu: { id: "etusivu", type: "etusivu" },
  hallitus: null,
};

export function Puuttuvat({ puuttuvat }: { puuttuvat: PuuttuvaTieto[] }) {
  if (puuttuvat.length === 0) return null;
  return (
    <Stack space={4} as="section" aria-labelledby="aloitus-puuttuvat">
      <Heading as="h2" size={2} id="aloitus-puuttuvat">
        Täydennä perustiedot
      </Heading>
      <Card border padding={3} radius={2}>
        <Stack space={3} as="ul" style={{ margin: 0, paddingLeft: "1.25rem" }}>
          {puuttuvat.map((p) => {
            const kohde = KOHTEET[p.kohde];
            return (
              <li key={p.id}>
                <Text>
                  {kohde ? (
                    <IntentLink intent="edit" params={kohde}>
                      {p.teksti}
                    </IntentLink>
                  ) : (
                    <Link href={HALLITUS}>{p.teksti}</Link>
                  )}
                </Text>
              </li>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
}
