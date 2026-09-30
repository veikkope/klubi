import { Box, Button, Card, Dialog, Flex, Radio, Stack, Text, TextInput } from "@sanity/ui";
import { useId, useState, type FormEvent } from "react";

import { SARAKETYYPIT, type SarakeTyyppi } from "../../../lib/taulukko";

export interface SarakeLomake {
  label: string;
  type: SarakeTyyppi;
}

interface Props {
  otsikko: string;
  alku?: SarakeLomake;
  /** Kun tyyppi vaihtuu olemassa olevassa sarakkeessa, kerrotaan mitä arvoille tapahtuu. */
  muokkaus?: boolean;
  onPeru: () => void;
  onTallenna: (arvot: SarakeLomake) => void;
}

/** Sarakkeen lisäys ja muokkaus: nimi ja tyyppi. */
export function SarakeDialogi({ otsikko, alku, muokkaus, onPeru, onTallenna }: Props) {
  const id = useId();
  const [label, setLabel] = useState(alku?.label ?? "");
  const [type, setType] = useState<SarakeTyyppi>(alku?.type ?? "text");
  const [virhe, setVirhe] = useState<string | null>(null);

  const tallenna = (event?: FormEvent) => {
    event?.preventDefault();
    const nimi = label.trim();
    if (!nimi) {
      setVirhe("Anna sarakkeelle nimi. Se näkyy taulukon otsikkorivillä.");
      return;
    }
    onTallenna({ label: nimi, type });
  };

  return (
    <Dialog
      id={`sarake-${id}`}
      header={otsikko}
      onClose={onPeru}
      width={1}
      footer={
        <Flex gap={2} justify="flex-end" padding={3}>
          <Button mode="bleed" text="Peru" onClick={onPeru} />
          <Button tone="primary" text="Tallenna" onClick={() => tallenna()} />
        </Flex>
      }
    >
      <Box as="form" padding={4} onSubmit={tallenna}>
        <Stack space={5}>
          <Stack space={3}>
            <Text as="label" htmlFor={`nimi-${id}`} size={1} weight="semibold">
              Sarakkeen nimi
            </Text>
            <TextInput
              id={`nimi-${id}`}
              value={label}
              autoFocus
              onChange={(e) => {
                setLabel(e.currentTarget.value);
                setVirhe(null);
              }}
              customValidity={virhe ?? undefined}
            />
            {virhe && (
              <Text size={1} style={{ color: "var(--card-badge-critical-fg-color, #c4314b)" }}>
                {virhe}
              </Text>
            )}
          </Stack>

          <Stack space={3} as="fieldset" style={{ border: 0, margin: 0, padding: 0 }}>
            <Text as="legend" size={1} weight="semibold">
              Mitä sarakkeessa on?
            </Text>
            <Stack space={2} marginTop={3}>
              {SARAKETYYPIT.map((t) => (
                <Card
                  key={t.value}
                  as="label"
                  padding={3}
                  radius={2}
                  border
                  tone={type === t.value ? "primary" : "default"}
                  style={{ cursor: "pointer" }}
                >
                  <Flex gap={3} align="flex-start">
                    <Radio
                      name={`tyyppi-${id}`}
                      value={t.value}
                      checked={type === t.value}
                      onChange={() => setType(t.value)}
                    />
                    <Stack space={2}>
                      <Text size={1} weight="medium">
                        {t.title}
                      </Text>
                      <Text size={1} muted>
                        {t.ohje}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>
            {muokkaus && alku && alku.type !== type && (
              <Card padding={3} radius={2} tone="caution">
                <Text size={1}>
                  Sarakkeen arvot muunnetaan uuteen muotoon siltä osin kuin ne tunnistetaan. Muut arvot
                  jäävät ennalleen.
                </Text>
              </Card>
            )}
          </Stack>
          {/* Enter lähettää lomakkeen. */}
          <button type="submit" hidden />
        </Stack>
      </Box>
    </Dialog>
  );
}
