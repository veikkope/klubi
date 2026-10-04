import { AddIcon } from "@sanity/icons";
import { Box, Button, Card, Checkbox, Flex, Grid, Spinner, Stack, Text } from "@sanity/ui";
import { useEffect, useState } from "react";
import { insert, setIfMissing, unset, useClient, type ArrayOfObjectsInputProps } from "sanity";
import { IntentLink } from "sanity/router";

/**
 * Uutisen kategoriat valintaruutuina (docs/09). Vaihtoehdot ovat
 * Uutiskategoria-dokumentit, joten sihteerin lisäämä uusi kategoria
 * ilmestyy listaan heti (kuuntelu). Arvo on lista viittauksia.
 *
 * Valintaruudut viittauslistan "Lisää"-haun sijaan: kategorioita on kymmenkunta,
 * ja kaikki näkyvät kerralla kuten ennen (docs/16 §5).
 */

type Kategoria = { _id: string; nimi: string };
type Viittaus = { _key: string; _ref?: string };

const KYSELY = `*[_type == "uutisKategoria" && !(_id in path("drafts.**")) && defined(nimi)]
  | order(coalesce(jarjestys, 9999) asc, lower(nimi) asc){ _id, nimi }`;

const avain = () => Math.random().toString(36).slice(2, 14);

// Tyyppi ilman tarkennusta, jotta komponentti kelpaa skeeman `components.input`-kenttään.
export function KategoriatInput(props: ArrayOfObjectsInputProps) {
  const { value, onChange, readOnly } = props;
  const client = useClient({ apiVersion: "2025-08-15" });
  const [kategoriat, setKategoriat] = useState<Kategoria[] | null>(null);

  useEffect(() => {
    let voimassa = true;
    const hae = () =>
      client.fetch<Kategoria[]>(KYSELY).then((rivit) => {
        if (voimassa) setKategoriat(rivit);
      });
    hae().catch(() => voimassa && setKategoriat([]));
    // Uusi tai uudelleennimetty kategoria näkyy ilman sivun latausta.
    const tilaus = client
      .listen(`*[_type == "uutisKategoria"]`, {}, { visibility: "query", events: ["mutation"] })
      .subscribe(() => void hae().catch(() => undefined));
    return () => {
      voimassa = false;
      tilaus.unsubscribe();
    };
  }, [client]);

  const valitut = (Array.isArray(value) ? (value as Viittaus[]) : []).filter((v) => v._ref);
  const valittuIdt = new Set(valitut.map((v) => v._ref));

  const vaihda = (id: string, paalle: boolean) => {
    if (paalle) {
      onChange([setIfMissing([]), insert([{ _type: "reference", _ref: id, _key: avain() }], "after", [-1])]);
    } else {
      onChange(valitut.filter((v) => v._ref === id).map((v) => unset([{ _key: v._key }])));
    }
  };

  // Viittaus kategoriaan, jota ei ole listassa (esim. julkaisematon): näytetään, jotta sen voi poistaa.
  const tuntemattomat = kategoriat ? valitut.filter((v) => !kategoriat.some((k) => k._id === v._ref)) : [];

  if (kategoriat === null) {
    return (
      <Flex align="center" gap={2} padding={2}>
        <Spinner muted />
        <Text muted size={1}>Haetaan kategorioita…</Text>
      </Flex>
    );
  }

  return (
    <Stack space={3}>
      <Grid columns={[1, 2, 3]} gap={2}>
        {kategoriat.map((k) => {
          const id = `kategoria-${k._id}`;
          return (
            <Card key={k._id} padding={2} radius={2} border tone={valittuIdt.has(k._id) ? "primary" : "default"}>
              <Flex as="label" htmlFor={id} align="center" gap={2} style={{ cursor: readOnly ? "default" : "pointer" }}>
                <Checkbox
                  id={id}
                  checked={valittuIdt.has(k._id)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(e) => vaihda(k._id, e.currentTarget.checked)}
                />
                <Text size={1}>{k.nimi}</Text>
              </Flex>
            </Card>
          );
        })}
      </Grid>

      {tuntemattomat.map((v) => (
        <Card key={v._key} padding={2} radius={2} tone="caution" border>
          <Flex align="center" justify="space-between" gap={2}>
            <Text size={1}>Valittu kategoria on julkaisematon tai poistettu.</Text>
            {!readOnly && (
              <Button mode="ghost" fontSize={1} text="Poista valinta" onClick={() => onChange(unset([{ _key: v._key }]))} />
            )}
          </Flex>
        </Card>
      ))}

      <Box>
        <Text size={1} muted>
          Puuttuuko sopiva kategoria?{" "}
          <IntentLink intent="create" params={{ type: "uutisKategoria" }} target="_blank" rel="noopener">
            <AddIcon style={{ verticalAlign: "middle" }} /> Lisää uusi kategoria
          </IntentLink>{" "}
          (aukeaa uuteen välilehteen; julkaise se, niin se ilmestyy tähän).
        </Text>
      </Box>
    </Stack>
  );
}
