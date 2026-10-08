import type { ComponentType } from "react";
import { CheckmarkCircleIcon, ErrorOutlineIcon, HelpCircleIcon, RefreshIcon, WarningOutlineIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Heading, Spinner, Stack, Text, type CardTone } from "@sanity/ui";
import { Link } from "sanity/router";

import { kokonaistila, type Tila, type TilaRivi } from "../../../lib/sivuston-tila";
import { tehtavanPolku } from "../../lib/tehtavat";

/**
 * Sivuston tila liikennevaloina (docs/24 askel 7). Tila näkyy aina sekä
 * tekstinä että ikonina, ei pelkkänä värinä (WCAG 1.4.1).
 */

const TILAN_ESITYS: Record<Tila, { tone: CardTone; nimi: string; Ikoni: ComponentType }> = {
  ok: { tone: "positive", nimi: "Kunnossa", Ikoni: CheckmarkCircleIcon },
  huomio: { tone: "caution", nimi: "Huomio", Ikoni: WarningOutlineIcon },
  virhe: { tone: "critical", nimi: "Vaatii toimia", Ikoni: ErrorOutlineIcon },
  tuntematon: { tone: "neutral", nimi: "Ei vielä tietoa", Ikoni: HelpCircleIcon },
};

const YHTEENVETO: Record<Tila, string> = {
  ok: "Kaikki kunnossa",
  huomio: "Huomioitavaa",
  virhe: "Vaatii toimia",
  tuntematon: "Tilaa ei vielä tiedetä",
};

/** Rivit, joista pääsee suoraan listaan. */
const RIVIN_LINKKI: Record<string, { href: string; teksti: string }> = {
  julkaisemattomat: { href: tehtavanPolku("julkaisemattomat"), teksti: "Avaa julkaisemattomat muutokset" },
};

type Props = { rivit: TilaRivi[] | null; ladataan: boolean; virhe: string | null; lataa: () => void };

export function SivustonTila({ rivit, ladataan, virhe, lataa }: Props) {
  const yhteensa = rivit ? kokonaistila(rivit) : null;

  return (
    <Stack space={4} as="section" aria-labelledby="aloitus-tila">
      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
        <Heading as="h2" size={2} id="aloitus-tila">
          Sivuston tila
        </Heading>
        <Button mode="ghost" icon={RefreshIcon} text="Päivitä" onClick={lataa} disabled={ladataan} />
      </Flex>

      <div aria-live="polite">
        {ladataan ? (
          <Flex align="center" gap={3} paddingY={2}>
            <Spinner muted />
            <Text muted>Tarkistetaan sivuston tilaa…</Text>
          </Flex>
        ) : null}
        {!ladataan && virhe ? (
          <Card tone="critical" border padding={3} radius={2}>
            <Text>{virhe}</Text>
          </Card>
        ) : null}
        {!ladataan && yhteensa ? (
          <Card tone={TILAN_ESITYS[yhteensa].tone} border padding={4} radius={2}>
            <Flex align="center" gap={3}>
              <Text size={3}>
                <YhteenvedonIkoni tila={yhteensa} />
              </Text>
              <Text size={2} weight="semibold">
                {YHTEENVETO[yhteensa]}
              </Text>
            </Flex>
          </Card>
        ) : null}
      </div>

      {rivit ? (
        <Stack space={2} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rivit.map((rivi) => (
            <Box as="li" key={rivi.id}>
              <TilanRivi rivi={rivi} />
            </Box>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function YhteenvedonIkoni({ tila }: { tila: Tila }) {
  const { Ikoni } = TILAN_ESITYS[tila];
  return (
    <span aria-hidden="true">
      <Ikoni />
    </span>
  );
}

function TilanRivi({ rivi }: { rivi: TilaRivi }) {
  const { tone, Ikoni } = TILAN_ESITYS[rivi.tila];
  // Kiintiö on arvio, kunnes laskentatapa on vahvistettu (lib/sivuston-tila.ts).
  const nimi = rivi.id === "kiintio" && rivi.tila === "tuntematon" ? "Arvio" : TILAN_ESITYS[rivi.tila].nimi;
  const linkki = rivi.tila !== "ok" ? RIVIN_LINKKI[rivi.id] : undefined;
  return (
    <Card tone={tone} border padding={3} radius={2}>
      <Flex gap={3} align="flex-start">
        <Text size={2}>
          <span aria-hidden="true">
            <Ikoni />
          </span>
        </Text>
        <Stack space={2} flex={1}>
          <Text weight="semibold">
            {rivi.otsikko}: <span>{nimi}</span>
          </Text>
          <Text size={1}>{rivi.teksti}</Text>
          {rivi.ohje ? (
            <Text size={1} muted>
              {rivi.ohje}
            </Text>
          ) : null}
          {linkki ? (
            <Text size={1}>
              <Link href={linkki.href}>{linkki.teksti}</Link>
            </Text>
          ) : null}
        </Stack>
      </Flex>
    </Card>
  );
}
