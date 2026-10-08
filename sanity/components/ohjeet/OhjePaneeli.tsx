import { ArrowLeftIcon, CloseIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useMemo, useState } from "react";
import type { DocumentInspectorProps } from "sanity";

import type { OhjeKortti } from "../../../lib/ohje/tyypit";
import { OHJE } from "../../ohje/sisalto.generated";
import { KorttiNakyma } from "./KorttiNakyma";

const KAIKKI: OhjeKortti[] = OHJE.osiot.flatMap((o) => o.kortit);

/**
 * Dokumentin Ohje-paneeli (inspector, docs/25): kortit, joiden frontmatterin
 * `tyypit` sisältää tämän dokumentin tyypin. Yksi kortti avautuu suoraan,
 * useampi näytetään listana. Korttilinkit avautuvat paneelissa, jotta lomake
 * pysyy näkyvissä; "Avaa Ohjeissa" vie Ohjeet-työkaluun.
 */
export default function OhjePaneeli({ documentType, onClose }: DocumentInspectorProps) {
  const kortit = useMemo(() => KAIKKI.filter((k) => k.tyypit.includes(documentType)), [documentType]);
  const [valittu, setValittu] = useState<{ id: string; ankkuri: string | null } | null>(
    kortit.length === 1 ? { id: kortit[0].id, ankkuri: null } : null,
  );
  const kortti = valittu ? KAIKKI.find((k) => k.id === valittu.id) : undefined;
  // Takaisin: listaan, tai ainoaan korttiin, jos linkki vei toiseen korttiin.
  const alku = kortit.length === 1 ? { id: kortit[0].id, ankkuri: null } : null;
  const takaisin = Boolean(kortti) && (kortit.length > 1 || kortti?.id !== alku?.id);

  return (
    <Flex direction="column" height="fill" data-ohje="ohjepaneeli">
      <Card borderBottom paddingX={3} paddingY={2} flex="none">
        <Flex align="center" gap={2}>
          {takaisin ? (
            <Button mode="bleed" icon={ArrowLeftIcon} aria-label="Takaisin" onClick={() => setValittu(alku)} />
          ) : null}
          <Box flex={1} paddingLeft={takaisin ? 0 : 2}>
            <Text as="h1" size={1} weight="semibold">
              Ohje
            </Text>
          </Box>
          <Button mode="bleed" icon={CloseIcon} aria-label="Sulje ohje" onClick={onClose} />
        </Flex>
      </Card>
      <Box flex={1} padding={4} style={{ overflowY: "auto" }} data-ohje-vieritys="">
        {kortti ? (
          <KorttiNakyma
            kortti={kortti}
            paneelissa
            ankkuri={valittu?.ankkuri ?? null}
            onAvaaKortti={(id, ankkuri) => setValittu({ id, ankkuri })}
          />
        ) : kortit.length === 0 ? (
          <Text muted>Tälle sisällölle ei ole omaa ohjetta. Katso yläpalkin Ohjeet.</Text>
        ) : (
          <Stack space={2}>
            <Box paddingBottom={2}>
              <Text size={1} muted>
                Valitse ohje:
              </Text>
            </Box>
            {kortit.map((k) => (
              <Card
                key={k.id}
                as="button"
                type="button"
                padding={3}
                radius={2}
                onClick={() => setValittu({ id: k.id, ankkuri: null })}
                style={{ textAlign: "left", width: "100%" }}
              >
                <Stack space={2}>
                  <Text size={2}>{k.otsikko}</Text>
                  {k.kesto ? (
                    <Text size={1} muted>
                      {k.kesto}
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Flex>
  );
}
