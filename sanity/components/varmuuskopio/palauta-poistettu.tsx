import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Spinner, Stack, Text, TextInput, useToast } from "@sanity/ui";
import { useClient, useSchema } from "sanity";
import { IntentLink } from "sanity/router";

import { apiVersion } from "../../env";
import {
  etsiDokumentti,
  julkaistuId,
  osuuHakuun,
  poistetutDokumentit,
  type PoistettuDokumentti,
} from "../../../lib/palautus";
import { lataaVarmuuskopio, paivaSuomeksi, palautettavaLuonnos } from "../../lib/varmuuskopiot";

/**
 * Varmuuskopion "Palauta poistettu" -välilehti (sanity/structure.ts, docs/23 Y32).
 *
 * Listaa kopion dokumentit, joita datasetissä ei enää ole, ja palauttaa valitun
 * luonnokseksi. Muutettujen (ei poistettujen) dokumenttien palautus tehdään itse
 * dokumentista: ⋯ → Palauta varmuuskopiosta.
 */

const NAYTETAAN = 50;

type Props = { document: { displayed: { _id?: string; paiva?: string } } };

export function PalautaPoistettu({ document }: Props) {
  const client = useClient({ apiVersion });
  const schema = useSchema();
  const toast = useToast();
  const kopioId = document.displayed._id ? julkaistuId(document.displayed._id) : null;
  const paiva = document.displayed.paiva;

  const [aineisto, setAineisto] = useState<{ ndjson: string; poistetut: PoistettuDokumentti[] } | null>(null);
  const [virhe, setVirhe] = useState<string | null>(null);
  const [haku, setHaku] = useState("");
  const [palautetut, setPalautetut] = useState<Set<string>>(new Set());
  const [kesken, setKesken] = useState<string | null>(null);

  useEffect(() => {
    if (!kopioId) return;
    let peruttu = false;
    (async () => {
      try {
        const url = await client.fetch<string | null>(`*[_id == $id][0].tiedosto.asset->url`, { id: kopioId });
        if (!url) throw new Error("Kopiolla ei ole tiedostoa.");
        // Kaikki nykyiset tunnisteet luonnokset mukaan lukien: luonnoksena oleva
        // dokumentti ei ole poistettu.
        const [ndjson, idt] = await Promise.all([
          lataaVarmuuskopio(url),
          client.withConfig({ perspective: "raw" }).fetch<string[]>(`*[!(_id in path("_.**"))]._id`),
        ]);
        if (peruttu) return;
        setAineisto({ ndjson, poistetut: poistetutDokumentit(ndjson, new Set(idt.map(julkaistuId))) });
      } catch (error) {
        console.error("[Palauta poistettu]", error);
        if (!peruttu) setVirhe("Varmuuskopion lataus epäonnistui. Yritä uudelleen hetken kuluttua.");
      }
    })();
    return () => {
      peruttu = true;
    };
  }, [client, kopioId]);

  const osumat = useMemo(
    () => (aineisto?.poistetut ?? []).filter((d) => !haku.trim() || osuuHakuun(d.nimi, haku)),
    [aineisto, haku],
  );

  async function palauta(kohde: PoistettuDokumentti) {
    if (!aineisto) return;
    const doc = etsiDokumentti(aineisto.ndjson, kohde.id);
    if (!doc) return;
    setKesken(kohde.id);
    try {
      await client.createOrReplace(await palautettavaLuonnos(client, doc));
      setPalautetut((vanhat) => new Set(vanhat).add(kohde.id));
      toast.push({
        status: "success",
        title: `${kohde.nimi} palautettu luonnokseksi`,
        description: "Avaa dokumentti, tarkista se ja paina Julkaise.",
        duration: 10_000,
      });
    } catch (error) {
      console.error("[Palauta poistettu]", error);
      toast.push({ status: "error", title: "Palautus epäonnistui", description: "Yritä uudelleen hetken kuluttua." });
    } finally {
      setKesken(null);
    }
  }

  const tyypinNimi = (tyyppi: string) => schema.get(tyyppi)?.title ?? tyyppi;

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Text size={1} muted>
          Tässä ovat dokumentit, jotka olivat sivustolla {paiva ? paivaSuomeksi(paiva) : "kopion päivänä"}, mutta
          jotka on sen jälkeen poistettu. Palautettu dokumentti tulee luonnokseksi: avaa se, tarkista ja paina
          Julkaise. Jos haluat palauttaa olemassa olevan dokumentin vanhan version, avaa dokumentti ja valitse ⋯ →
          Palauta varmuuskopiosta.
        </Text>

        {virhe && <Text size={1}>{virhe}</Text>}
        {!virhe && !aineisto && (
          <Flex align="center" gap={3}>
            <Spinner muted />
            <Text size={1} muted>Ladataan varmuuskopiota…</Text>
          </Flex>
        )}

        {aineisto && aineisto.poistetut.length === 0 && (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1}>Kopion jälkeen ei ole poistettu yhtään dokumenttia.</Text>
          </Card>
        )}

        {aineisto && aineisto.poistetut.length > 0 && (
          <>
            <TextInput
              icon={SearchIcon}
              placeholder="Hae nimellä, esim. vuosikokous"
              value={haku}
              onChange={(e) => setHaku(e.currentTarget.value)}
              aria-label="Hae poistettua dokumenttia"
            />
            <Text size={1} muted>
              {osumat.length === aineisto.poistetut.length
                ? `${osumat.length} poistettua dokumenttia`
                : `${osumat.length} / ${aineisto.poistetut.length} poistettua dokumenttia`}
              {osumat.length > NAYTETAAN && `, näytetään ${NAYTETAAN} ensimmäistä. Tarkenna hakua.`}
            </Text>
            <Stack space={2}>
              {osumat.slice(0, NAYTETAAN).map((kohde) => {
                const palautettu = palautetut.has(kohde.id);
                return (
                  <Card key={kohde.id} padding={3} radius={2} border tone={palautettu ? "positive" : "default"}>
                    <Flex align="center" gap={3}>
                      <Box flex={1}>
                        <Stack space={2}>
                          <Text size={1} weight="semibold">{kohde.nimi}</Text>
                          <Text size={1} muted>{tyypinNimi(kohde.tyyppi)}</Text>
                        </Stack>
                      </Box>
                      {palautettu ? (
                        <Button
                          as={IntentLink}
                          intent="edit"
                          params={{ id: julkaistuId(kohde.id), type: kohde.tyyppi }}
                          text="Avaa"
                          mode="ghost"
                        />
                      ) : (
                        <Button
                          text={kesken === kohde.id ? "Palautetaan…" : "Palauta"}
                          tone="primary"
                          mode="ghost"
                          disabled={kesken !== null}
                          onClick={() => palauta(kohde)}
                        />
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}
