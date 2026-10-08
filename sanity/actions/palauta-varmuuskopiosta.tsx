import { useEffect, useState } from "react";
import { RestoreIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Spinner, Stack, Text, useToast } from "@sanity/ui";
import { useClient, type DocumentActionComponent, type SanityClient } from "sanity";

import { apiVersion } from "../env";
import {
  dokumentinNimi,
  etsiDokumentti,
  puuttuvienTiedostojenViesti,
  tiedostojenNimet,
  voiPalauttaa,
  type VarmuuskopionDokumentti,
} from "../../lib/palautus";
import { haeVarmuuskopiot, lataaVarmuuskopio, paivaSuomeksi, palautettavaLuonnos } from "../lib/varmuuskopiot";

/**
 * "Palauta varmuuskopiosta" jokaisen sisältödokumentin valikkoon (docs/23 Y32).
 *
 * Näyttää viikkokopiot uusin ensin ja kertoo, millainen dokumentti kussakin
 * oli. Valittu versio kirjoitetaan luonnokseksi: sihteeri näkee sen lomakkeella,
 * vertaa ja julkaisee, tai hylkää luonnoksen, jolloin mikään ei muutu.
 */

type Rivi =
  | { paiva: string; tila: "ladataan" | "puuttuu" | "virhe" }
  | { paiva: string; tila: "loytyi"; doc: VarmuuskopionDokumentti; samaKuin: string | null; nimet: Record<string, string> };

const muokattu = (doc: VarmuuskopionDokumentti) =>
  doc._updatedAt ? `muokattu ${new Date(doc._updatedAt).toLocaleDateString("fi-FI")}` : "";

function Versiot({
  client,
  id,
  julkaistuRev,
  onLuonnos,
  onPalauta,
}: {
  client: SanityClient;
  id: string;
  julkaistuRev: string | undefined;
  onLuonnos: boolean;
  onPalauta: (doc: VarmuuskopionDokumentti, paiva: string, nimet?: Record<string, string>) => Promise<void>;
}) {
  const [rivit, setRivit] = useState<Rivi[] | null>(null);
  const [virhe, setVirhe] = useState<string | null>(null);
  const [palautetaan, setPalautetaan] = useState<string | null>(null);

  useEffect(() => {
    let peruttu = false;
    (async () => {
      try {
        const kopiot = await haeVarmuuskopiot(client);
        if (peruttu) return;
        const tulos: Rivi[] = kopiot.map((k) => ({ paiva: k.paiva, tila: "ladataan" }));
        setRivit([...tulos]);
        // Yksi kerrallaan uusimmasta alkaen: tärkein tieto näkyy heti, eikä
        // selain lataa kymmentä kahden megatavun tiedostoa yhtä aikaa.
        const nahdyt = new Map<string, string>();
        if (julkaistuRev) nahdyt.set(julkaistuRev, "nykyinen");
        for (const [i, kopio] of kopiot.entries()) {
          try {
            if (!kopio.url) throw new Error("tiedosto puuttuu");
            const ndjson = await lataaVarmuuskopio(kopio.url);
            const doc = etsiDokumentti(ndjson, id);
            if (!doc) {
              tulos[i] = { paiva: kopio.paiva, tila: "puuttuu" };
            } else {
              const samaKuin = (doc._rev && nahdyt.get(doc._rev)) || null;
              if (doc._rev && !samaKuin) nahdyt.set(doc._rev, paivaSuomeksi(kopio.paiva));
              tulos[i] = { paiva: kopio.paiva, tila: "loytyi", doc, samaKuin, nimet: tiedostojenNimet(doc, ndjson) };
            }
          } catch (error) {
            console.error("[Palauta varmuuskopiosta]", kopio.paiva, error);
            tulos[i] = { paiva: kopio.paiva, tila: "virhe" };
          }
          if (peruttu) return;
          setRivit([...tulos]);
        }
      } catch (error) {
        console.error("[Palauta varmuuskopiosta]", error);
        if (!peruttu) setVirhe("Varmuuskopioiden haku epäonnistui. Yritä uudelleen hetken kuluttua.");
      }
    })();
    return () => {
      peruttu = true;
    };
  }, [client, id, julkaistuRev]);

  if (virhe) return <Text size={1}>{virhe}</Text>;
  if (!rivit) {
    return (
      <Flex align="center" gap={3}>
        <Spinner muted />
        <Text size={1} muted>Haetaan varmuuskopioita…</Text>
      </Flex>
    );
  }
  if (rivit.length === 0) return <Text size={1}>Varmuuskopioita ei vielä ole. Ensimmäinen syntyy maanantaiyönä.</Text>;

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Varmuuskopio otetaan joka maanantaiyö, ja 12 viikkoa säilyy. Valittu versio tulee luonnokseksi: tarkista se
        lomakkeelta ja paina Julkaise. Jos muutat mielesi, hylkää luonnos, niin mikään ei muutu.
      </Text>
      {onLuonnos && (
        <Card padding={3} radius={2} tone="caution">
          <Text size={1}>Dokumentissa on julkaisematon muutos. Palautus korvaa sen.</Text>
        </Card>
      )}
      <Stack space={2}>
        {rivit.map((rivi) => (
          <Card key={rivi.paiva} padding={3} radius={2} border>
            <Flex align="center" gap={3}>
              <Box flex={1}>
                <Stack space={2}>
                  <Text size={1} weight="semibold">{paivaSuomeksi(rivi.paiva)}</Text>
                  <Text size={1} muted>
                    {rivi.tila === "ladataan" && "Ladataan…"}
                    {rivi.tila === "puuttuu" && "Ei mukana: dokumenttia ei silloin ollut julkaistuna."}
                    {rivi.tila === "virhe" && "Tämän kopion lataus epäonnistui."}
                    {rivi.tila === "loytyi" &&
                      [
                        dokumentinNimi(rivi.doc),
                        muokattu(rivi.doc),
                        rivi.samaKuin === "nykyinen"
                          ? "sama kuin nykyinen julkaistu"
                          : rivi.samaKuin
                            ? `sama kuin ${rivi.samaKuin}`
                            : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                  </Text>
                </Stack>
              </Box>
              {rivi.tila === "ladataan" && <Spinner muted />}
              {rivi.tila === "loytyi" && !rivi.samaKuin && (
                <Button
                  text={palautetaan === rivi.paiva ? "Palautetaan…" : "Palauta"}
                  tone="primary"
                  mode="ghost"
                  disabled={palautetaan !== null}
                  onClick={async () => {
                    setPalautetaan(rivi.paiva);
                    try {
                      await onPalauta(rivi.doc, rivi.paiva, rivi.nimet);
                    } finally {
                      setPalautetaan(null);
                    }
                  }}
                />
              )}
            </Flex>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export const PalautaVarmuuskopiosta: DocumentActionComponent = ({ id, type, draft, published, onComplete }) => {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [auki, setAuki] = useState(false);

  if (!voiPalauttaa(type) || (!draft && !published)) return null;

  async function palauta(doc: VarmuuskopionDokumentti, paiva: string, nimet?: Record<string, string>) {
    try {
      // Julkaistun version aiemmat osoitteet säilyvät (docs/24 askel 8).
      const { luonnos, puuttuvat } = await palautettavaLuonnos(client, doc, nimet, published);
      await client.createOrReplace(luonnos);
      // Poistettu tiedosto tai kuva ei palaudu varmuuskopiosta: kerrotaan, ei hiljaa.
      const puute = puuttuvienTiedostojenViesti(puuttuvat);
      toast.push({
        status: puute ? "warning" : "success",
        title: `Versio ${paivaSuomeksi(paiva)} palautettu luonnokseksi`,
        description: puute
          ? `${puute} Tarkista sisältö ja paina Julkaise. Sivusto ei muutu ennen julkaisua.`
          : "Tarkista sisältö ja paina Julkaise. Sivusto ei muutu ennen julkaisua.",
        duration: puute ? 30_000 : 10_000,
        closable: true,
      });
      setAuki(false);
      onComplete();
    } catch (error) {
      console.error("[Palauta varmuuskopiosta]", error);
      toast.push({ status: "error", title: "Palautus epäonnistui", description: "Yritä uudelleen hetken kuluttua." });
    }
  }

  return {
    label: "Palauta varmuuskopiosta",
    icon: RestoreIcon,
    title: "Hae dokumentin vanha versio viikoittaisesta varmuuskopiosta",
    onHandle: () => setAuki(true),
    dialog: auki && {
      type: "dialog",
      header: "Palauta varmuuskopiosta",
      width: "medium",
      onClose: () => {
        setAuki(false);
        onComplete();
      },
      content: (
        <Versiot
          client={client}
          id={id}
          julkaistuRev={published?._rev}
          onLuonnos={Boolean(draft)}
          onPalauta={palauta}
        />
      ),
    },
  };
};
