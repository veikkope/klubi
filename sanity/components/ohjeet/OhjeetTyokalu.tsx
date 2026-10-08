import { SearchIcon } from "@sanity/icons";
import { Box, Button, Card, Container, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useDeferredValue, useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "sanity/router";

import { haeOhjeista } from "../../../lib/ohje/haku";
import { korttiPolku } from "../../../lib/ohje/linkit";
import type { OhjeKortti } from "../../../lib/ohje/tyypit";
import { OHJE } from "../../ohje/sisalto.generated";
import { KorttiNakyma } from "./KorttiNakyma";
import { Asettelu, OhjeJuuri } from "./tyylit";

const KAIKKI: OhjeKortti[] = OHJE.osiot.flatMap((o) => o.kortit);
const OSION_OTSIKKO = new Map(OHJE.osiot.map((o) => [o.id, o.otsikko]));

function onTavallinenKlikkaus(e: MouseEvent<HTMLElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/** Sisällysluettelon tai hakutuloksen rivi: koko rivi on linkki (iso klikkausalue, toimii näppäimistöllä). */
function KorttiLinkki({
  kortti,
  valittu,
  ote,
  avaa,
}: {
  kortti: OhjeKortti;
  valittu: boolean;
  ote?: string;
  avaa: (id: string) => void;
}) {
  return (
    <Card
      as="a"
      href={korttiPolku(kortti.id)}
      padding={3}
      radius={2}
      tone={valittu ? "primary" : "default"}
      selected={valittu}
      aria-current={valittu ? "page" : undefined}
      onClick={(e: MouseEvent<HTMLElement>) => {
        if (!onTavallinenKlikkaus(e)) return;
        e.preventDefault();
        avaa(kortti.id);
      }}
      style={{ display: "block", textDecoration: "none" }}
    >
      <Stack space={2}>
        <Text size={2} weight={valittu ? "semibold" : "regular"}>
          {kortti.otsikko}
        </Text>
        {ote ? (
          <Text size={1} muted>
            {ote}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

/**
 * Studion Ohjeet-työkalu (docs/25): vasemmalla haku ja sisällysluettelo
 * osioittain, oikealla valittu kortti. Osoite /studio/ohjeet/<kortti>, joten
 * kortin voi linkittää ja selaimen takaisin-painike toimii.
 */
export default function OhjeetTyokalu() {
  const router = useRouter();
  const tila = router.state as { kortti?: string };
  const [haku, setHaku] = useState("");
  const [ankkuri, setAnkkuri] = useState<string | null>(null);
  const viivastetty = useDeferredValue(haku);
  const tulokset = useMemo(() => haeOhjeista(KAIKKI, viivastetty), [viivastetty]);

  const valittu = KAIKKI.find((k) => k.id === tila.kortti) ?? KAIKKI[0] ?? null;

  const avaa = useCallback(
    (id: string, kohta: string | null = null) => {
      setAnkkuri(kohta);
      router.navigate({ kortti: id });
    },
    [router],
  );

  const enter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tulokset[0]) avaa(tulokset[0].kortti.id);
    if (e.key === "Escape") setHaku("");
  };

  if (!valittu) {
    return (
      <Card padding={5} height="fill">
        <Container width={1}>
          <Text>Ohjeessa ei ole vielä kortteja.</Text>
        </Container>
      </Card>
    );
  }

  return (
    <Card height="fill" style={{ overflowY: "auto" }} data-ohje="ohjeet">
      <OhjeJuuri as={Asettelu} data-kortti-valittu={tila.kortti ? "1" : undefined}>
        <Card borderRight paddingX={3} paddingY={4} as="nav" aria-label="Ohjeiden sisällys" data-ohje="sisallys">
          <Stack space={4}>
            <TextInput
              icon={SearchIcon}
              type="search"
              placeholder="Hae ohjeista, esim. kuva tai julkaise"
              aria-label="Hae ohjeista"
              value={haku}
              onChange={(e) => setHaku(e.currentTarget.value)}
              onKeyDown={enter}
              clearButton={haku.length > 0}
              onClear={() => setHaku("")}
              fontSize={2}
              padding={3}
              data-ohje="haku"
            />
            {haku.trim() ? (
              <Stack space={1} role="region" aria-live="polite" aria-label="Hakutulokset">
                <Box paddingX={3} paddingBottom={2}>
                  <Text size={1} muted>
                    {tulokset.length === 0
                      ? "Ei osumia. Kokeile toista sanaa."
                      : tulokset.length === 1
                        ? "1 ohje"
                        : `${tulokset.length} ohjetta`}
                  </Text>
                </Box>
                {tulokset.map((t) => (
                  <KorttiLinkki
                    key={t.kortti.id}
                    kortti={t.kortti}
                    ote={t.ote}
                    valittu={t.kortti.id === valittu.id}
                    avaa={avaa}
                  />
                ))}
              </Stack>
            ) : (
              <Stack space={4}>
                {OHJE.osiot.map((osio) => (
                  <Stack key={osio.id} space={1} as="section" aria-labelledby={`ohje-osio-${osio.id}`}>
                    <Box paddingX={3} paddingBottom={1}>
                      <Text as="h2" size={1} weight="semibold" muted id={`ohje-osio-${osio.id}`}>
                        {osio.otsikko}
                      </Text>
                    </Box>
                    {osio.kortit.map((k) => (
                      <KorttiLinkki key={k.id} kortti={k} valittu={k.id === valittu.id} avaa={avaa} />
                    ))}
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
        <Box padding={[4, 4, 5]} data-ohje-vieritys="">
          <Box className="vain-kapea" paddingBottom={4}>
            <Button
              mode="ghost"
              icon={SearchIcon}
              text="Haku ja kaikki ohjeet"
              onClick={() => {
                const kentta = document.querySelector<HTMLInputElement>('[data-ohje="sisallys"] input');
                kentta?.scrollIntoView({ block: "start" });
                kentta?.focus({ preventScroll: true });
              }}
            />
          </Box>
          <KorttiNakyma
            kortti={valittu}
            osionOtsikko={OSION_OTSIKKO.get(valittu.osio)}
            onAvaaKortti={avaa}
            ankkuri={ankkuri}
          />
          <Flex paddingTop={5}>
            <Text size={1} muted>
              Ohjeen versio {OHJE.versio}
              {valittu.paivitetty
                ? ` · kortti päivitetty ${valittu.paivitetty.split("-").reverse().map(Number).join(".")}`
                : ""}
            </Text>
          </Flex>
        </Box>
      </OhjeJuuri>
    </Card>
  );
}
