import { ArrowRightIcon, HelpCircleIcon } from "@sanity/icons";
import { Card, Flex, Stack, Text } from "@sanity/ui";
import type { MouseEvent } from "react";
import { useRouter } from "sanity/router";

import { OHJEET_TYOKALU } from "../../../lib/ohje/tyypit";

/** Aloituksen pieni linkki Ohjeet-työkaluun (docs/25). */
export function OhjeetLinkki() {
  const router = useRouter();
  return (
    <Card
      as="a"
      href={OHJEET_TYOKALU}
      padding={3}
      radius={2}
      border
      data-ohje="aloitus-ohjeet"
      style={{ display: "block", textDecoration: "none" }}
      onClick={(e: MouseEvent<HTMLElement>) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        router.navigateUrl({ path: OHJEET_TYOKALU });
      }}
    >
      <Flex align="center" gap={3}>
        <Text size={3}>
          <HelpCircleIcon />
        </Text>
        <Stack space={2} flex={1}>
          <Text weight="semibold">Ohjeet</Text>
          <Text size={1} muted>
            Pikaopas ja ohje jokaiseen tehtävään. Löydät ohjeet myös yläpalkista.
          </Text>
        </Stack>
        <Text muted>
          <ArrowRightIcon />
        </Text>
      </Flex>
    </Card>
  );
}
