import { Box, Button, Card, Checkbox, Dialog, Flex, Radio, Stack, Text, TextArea } from "@sanity/ui";
import { useId, useMemo, useState } from "react";

import {
  arvaaTyyppi,
  jasennaRuudukko,
  naytettavaArvo,
  normalisoiArvo,
  sarakeavain,
  SARAKETYYPIT,
} from "../../../lib/taulukko";
import { uusiAvain, uusiRivi, type Rivi, type Sarake } from "./patchit";

type Tila = "lisaa" | "korvaa";

interface Props {
  sarakkeet: Sarake[];
  rivienMaara: number;
  onPeru: () => void;
  onKorvaa: (sarakkeet: Sarake[], rivit: Rivi[]) => void;
  onLisaa: (rivit: Rivi[]) => void;
}

const tyypinNimi = (t: string | undefined) => SARAKETYYPIT.find((x) => x.value === t)?.title ?? "Teksti";
const vertailtava = (s: string) => s.trim().toLocaleLowerCase("fi");

/**
 * Taulukon tuonti Excelistä, Google Sheetsistä tai CSV:stä.
 *
 * - "Lisää rivit": liitetyt rivit nykyisen taulukon loppuun. Jos liitetyssä on
 *   otsikkorivi, sarakkeet yhdistetään nimen perusteella, muuten järjestyksessä.
 * - "Korvaa koko taulukko": sarakkeet ja rivit liitetystä. Samannimiset
 *   sarakkeet säilyttävät avaimensa ja tyyppinsä; uusien tyyppi arvataan.
 */
export function TuontiDialogi({ sarakkeet, rivienMaara, onPeru, onKorvaa, onLisaa }: Props) {
  const id = useId();
  const onTaulukko = sarakkeet.length > 0;
  const [teksti, setTeksti] = useState("");
  const [otsikkorivi, setOtsikkorivi] = useState(true);
  const [tila, setTila] = useState<Tila>(onTaulukko ? "lisaa" : "korvaa");

  const { otsikot, data, leveys } = useMemo(() => {
    const ruudukko = teksti.trim() ? jasennaRuudukko(teksti) : [];
    return {
      otsikot: otsikkorivi ? (ruudukko[0] ?? []) : [],
      data: otsikkorivi ? ruudukko.slice(1) : ruudukko,
      leveys: ruudukko[0]?.length ?? 0,
    };
  }, [teksti, otsikkorivi]);

  /** Korvauksen sarakkeet: samanniminen olemassa oleva sarake säilyy. */
  const uudetSarakkeet = useMemo<Sarake[]>(() => {
    const kaytetyt = new Set<string>();
    const avaimet = new Set<string>();
    return Array.from({ length: leveys }, (_, i) => {
      const label = otsikot[i]?.trim() || `Sarake ${i + 1}`;
      const vanha = sarakkeet.find((s) => !kaytetyt.has(s._key) && vertailtava(s.label) === vertailtava(label));
      if (vanha && !avaimet.has(vanha.key)) {
        kaytetyt.add(vanha._key);
        avaimet.add(vanha.key);
        return { ...vanha, label };
      }
      const key = sarakeavain(label, [...avaimet, ...sarakkeet.map((s) => s.key)]);
      avaimet.add(key);
      return { _key: uusiAvain(), key, label, type: arvaaTyyppi(data.map((r) => r[i] ?? "")) };
    });
  }, [otsikot, data, leveys, sarakkeet]);

  /** Lisäyksen sarakekartta: liitetyn sarakkeen indeksi → taulukon sarake. */
  const kartta = useMemo<(Sarake | null)[]>(() => {
    if (!onTaulukko) return [];
    const nimella = otsikot.map((o) => sarakkeet.find((s) => vertailtava(s.label) === vertailtava(o)) ?? null);
    const osumia = nimella.filter(Boolean).length;
    // Otsikkorivillä ja vähintään puolet nimistä täsmää → nimen mukaan; muuten järjestyksessä.
    if (otsikkorivi && osumia > 0 && osumia >= Math.min(leveys, sarakkeet.length) / 2) return nimella;
    return Array.from({ length: leveys }, (_, i) => sarakkeet[i] ?? null);
  }, [otsikot, otsikkorivi, leveys, sarakkeet, onTaulukko]);

  const pois = kartta.filter((s) => s === null).length;
  const nimenMukaan = onTaulukko && otsikkorivi && kartta.some((s, i) => s && vertailtava(s.label) === vertailtava(otsikot[i] ?? ""));

  const tuo = () => {
    if (tila === "korvaa") {
      onKorvaa(uudetSarakkeet, data.map((arvot) => uusiRivi(uudetSarakkeet, arvot)));
      return;
    }
    const rivit = data.map((arvot) => {
      const kohdistetut = sarakkeet.map((s) => {
        const i = kartta.findIndex((k) => k?._key === s._key);
        return i >= 0 ? (arvot[i] ?? "") : "";
      });
      return uusiRivi(sarakkeet, kohdistetut);
    });
    onLisaa(rivit.filter((r) => (r.cells?.length ?? 0) > 0));
  };

  const esikatselunSarakkeet = tila === "korvaa" ? uudetSarakkeet : sarakkeet;
  const esikatselunRivit = (tila === "korvaa" ? data : data.map((arvot) => sarakkeet.map((s) => {
    const i = kartta.findIndex((k) => k?._key === s._key);
    return i >= 0 ? (arvot[i] ?? "") : "";
  }))).slice(0, 5);

  const voiTuoda = data.length > 0 && (tila === "korvaa" || kartta.some(Boolean));
  const painike =
    tila === "korvaa"
      ? `Korvaa taulukko (${data.length} riviä, ${uudetSarakkeet.length} saraketta)`
      : `Lisää ${data.length} riviä loppuun`;

  return (
    <Dialog
      id={`tuonti-${id}`}
      header="Tuo taulukko Excelistä"
      onClose={onPeru}
      width={3}
      footer={
        <Flex gap={2} justify="flex-end" padding={3}>
          <Button mode="bleed" text="Peru" onClick={onPeru} />
          <Button
            tone={tila === "korvaa" && rivienMaara > 0 ? "critical" : "primary"}
            text={voiTuoda ? painike : "Tuo"}
            disabled={!voiTuoda}
            onClick={tuo}
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={5}>
          <Stack space={3}>
            <Text as="label" htmlFor={`teksti-${id}`} size={1} weight="semibold">
              Liitä solut tähän
            </Text>
            <Text size={1} muted>
              Valitse solut Excelissä, Google Sheetsissä tai Numbersissa, kopioi (Ctrl+C) ja liitä tähän
              (Ctrl+V). Myös CSV-tiedoston sisältö käy.
            </Text>
            <TextArea
              id={`teksti-${id}`}
              rows={7}
              value={teksti}
              autoFocus
              onChange={(e) => setTeksti(e.currentTarget.value)}
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}
            />
          </Stack>

          <Flex as="label" gap={3} align="center" style={{ cursor: "pointer" }}>
            <Checkbox checked={otsikkorivi} onChange={(e) => setOtsikkorivi(e.currentTarget.checked)} />
            <Text size={1}>Ensimmäinen rivi on sarakkeiden nimet</Text>
          </Flex>

          {onTaulukko && (
            <Stack space={2} as="fieldset" style={{ border: 0, margin: 0, padding: 0 }}>
              <Text as="legend" size={1} weight="semibold">
                Mitä tehdään?
              </Text>
              <Stack space={2} marginTop={3}>
                <Flex as="label" gap={3} align="center" style={{ cursor: "pointer" }}>
                  <Radio name={`tila-${id}`} checked={tila === "lisaa"} onChange={() => setTila("lisaa")} />
                  <Text size={1}>Lisää rivit taulukon loppuun</Text>
                </Flex>
                <Flex as="label" gap={3} align="center" style={{ cursor: "pointer" }}>
                  <Radio name={`tila-${id}`} checked={tila === "korvaa"} onChange={() => setTila("korvaa")} />
                  <Text size={1}>Korvaa koko taulukko (sarakkeet ja rivit)</Text>
                </Flex>
              </Stack>
            </Stack>
          )}

          {data.length > 0 && tila === "lisaa" && (
            <Card padding={3} radius={2} tone={pois > 0 ? "caution" : "transparent"} border>
              <Text size={1}>
                {nimenMukaan
                  ? "Sarakkeet yhdistetään nimen perusteella."
                  : "Sarakkeet yhdistetään järjestyksessä: ensimmäinen liitetty sarake taulukon ensimmäiseen jne."}
                {pois > 0 && ` ${pois} liitettyä saraketta ei vastaa mitään taulukon saraketta, ja ne jätetään pois.`}
              </Text>
            </Card>
          )}

          {data.length > 0 && tila === "korvaa" && rivienMaara > 0 && (
            <Card padding={3} radius={2} tone="critical" border>
              <Text size={1}>
                Taulukon nykyiset {rivienMaara} riviä korvataan. Jos korvaus oli virhe, edellisen version saa
                takaisin versiohistoriasta (kellokuvake).
              </Text>
            </Card>
          )}

          {data.length > 0 && (
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Esikatselu
              </Text>
              <Card border radius={2} overflow="auto" style={{ maxHeight: 280 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
                  <thead>
                    <tr>
                      {esikatselunSarakkeet.map((s) => (
                        <th
                          key={s._key}
                          scope="col"
                          style={{
                            textAlign: "left",
                            padding: "6px 10px",
                            borderBottom: "1px solid var(--card-border-color)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div>{s.label}</div>
                          <div style={{ fontWeight: 400, opacity: 0.65 }}>{tyypinNimi(s.type)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {esikatselunRivit.map((arvot, r) => (
                      <tr key={r}>
                        {esikatselunSarakkeet.map((s, c) => (
                          <td
                            key={s._key}
                            style={{
                              padding: "6px 10px",
                              borderBottom: "1px solid var(--card-border-color)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {naytettavaArvo(normalisoiArvo(arvot[c] ?? "", s.type), s.type)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              {data.length > 5 && (
                <Text size={1} muted>
                  … ja {data.length - 5} riviä lisää
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
