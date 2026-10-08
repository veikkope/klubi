import { Card, Grid, Heading, Stack, Text } from "@sanity/ui";
import { Link } from "sanity/router";

import { TEHTAVAT, tehtavanPolku } from "../../lib/tehtavat";

/**
 * "Odottaa sinua": Tehtävät sinulle -listojen laskurit (docs/24 askel 7).
 * Kortti vie samaan listaan kuin Studion valikko (sanity/lib/tehtavat.ts).
 */
export function Odottaa({ laskurit }: { laskurit: Record<string, number> | null }) {
  return (
    <Stack space={4} as="section" aria-labelledby="aloitus-odottaa">
      <Heading as="h2" size={2} id="aloitus-odottaa">
        Odottaa sinua
      </Heading>
      <Grid columns={[1, 2, 3]} gap={3} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {TEHTAVAT.map((t) => {
          const n = laskurit?.[t.id];
          const tiedossa = typeof n === "number";
          const odottaa = tiedossa && n > 0;
          return (
            <li key={t.id}>
              <Link
                href={tehtavanPolku(t.id)}
                aria-label={tiedossa ? `${t.otsikko}: ${n}` : t.otsikko}
                style={{ display: "block", height: "100%", textDecoration: "none", color: "inherit" }}
              >
                <Card tone={odottaa ? "primary" : "neutral"} border padding={3} radius={2} style={{ height: "100%" }}>
                  <Stack space={3}>
                    <Text size={4} weight="bold" aria-hidden="true">
                      {tiedossa ? n : "–"}
                    </Text>
                    <Text weight="semibold" aria-hidden="true">
                      {t.otsikko}
                    </Text>
                    <Text size={1} muted aria-hidden="true">
                      {tiedossa && n === 0 ? "Ei odottavia" : t.kuvaus}
                    </Text>
                  </Stack>
                </Card>
              </Link>
            </li>
          );
        })}
      </Grid>
    </Stack>
  );
}
