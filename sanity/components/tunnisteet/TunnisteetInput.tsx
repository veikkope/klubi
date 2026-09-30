import { AddIcon, CloseIcon } from "@sanity/icons";
import { Autocomplete, Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { insert, set, setIfMissing, unset, useClient, type ArrayOfPrimitivesInputProps } from "sanity";

import { siistiTunniste, suosituimmat, tunnisteSlug, type Tunniste } from "../../../lib/tunnisteet";
import {
  etsiEhdotukset,
  haeKaytetytTunnisteet,
  hylkayksenSyy,
  tarkistaLisattava,
  uutistenMaara,
} from "./tunnisteet";

/** Ehdotuslistan pituus kirjoitettaessa. */
const EHDOTUKSIA = 20;
/** "Suosituimmat"-pikapainikkeiden määrä kentän alla. */
const PIKAVALINTOJA = 8;

type Ehdotus = { value: string; maara: number };
type Viesti = { teksti: string; savy: "info" | "varoitus" } | null;

/**
 * Uutisen tunnisteet (docs/09): lisätyt tunnisteet poistettavina "merkkeinä"
 * ja kirjoituskenttä, joka ehdottaa muissa uutisissa jo käytettyjä
 * tunnisteita käyttömäärineen ("Huuhkajat · 117 uutista").
 *
 * Tavoite on yhtenäinen kirjoitusasu: jos kirjoitettu tunniste on jo
 * käytössä eri kirjainkoolla ("huuhkajat"), lisätään vakiintunut muoto
 * ("Huuhkajat"). Tyhjä syöte ja uutisessa jo oleva tunniste eivät lisää
 * mitään, vaan kentän alle tulee lyhyt selitys.
 *
 * Lisätään Enterillä, pilkulla, ehdotuksen valinnalla tai poistumalla
 * kentästä (kirjoitettu teksti ei katoa huomaamatta). Muutokset ovat pieniä
 * patcheja (lisäys listan loppuun, poisto indeksillä); viimeisen poisto
 * poistaa koko kentän.
 */
// Tyyppi ilman tarkennusta, jotta komponentti kelpaa skeeman `components.input`-kenttään.
export function TunnisteetInput(props: ArrayOfPrimitivesInputProps) {
  const { value, onChange, readOnly } = props;
  const { id, onFocus, onBlur, ref: studioRef, "aria-describedby": kuvaus } = props.elementProps;
  const client = useClient({ apiVersion: "2025-08-15" });
  const [kaikki, setKaikki] = useState<Tunniste[]>([]);
  const [kysely, setKysely] = useState("");
  const [viesti, setViesti] = useState<Viesti>(null);
  // Autocomplete ei tyhjennä itseään valinnan jälkeen: uusi avain luo kentän uudelleen tyhjänä.
  const [kenttaAvain, setKenttaAvain] = useState(0);
  const kohdistaKenttaan = useRef(false);
  const kenttaRef = useRef<HTMLDivElement>(null);
  // Viimeisin kirjoitettu teksti. Autocomplete ilmoittaa tyhjän kyselyn jo ennen
  // blur-tapahtumaa, joten poistuttaessa kirjoitettu teksti luetaan tästä.
  const kesken = useRef("");
  // Arvo omine muutoksineen: peräkkäiset muutokset samassa tapahtumassa
  // (esim. blur-lisäys ja painikkeen klikkaus) eivät perustu vanhaan arvoon.
  const nykyiset = useRef<string[]>([]);
  const tunnisteet = useMemo(() => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []), [value]);
  useEffect(() => {
    nykyiset.current = tunnisteet;
  }, [tunnisteet]);

  useEffect(() => {
    let voimassa = true;
    haeKaytetytTunnisteet(client).then((lista) => {
      if (voimassa) setKaikki(lista);
    });
    return () => {
      voimassa = false;
    };
  }, [client]);

  const slugista = useMemo(() => new Map(kaikki.map((t) => [t.slug, t])), [kaikki]);
  const kaytossa = useMemo(() => new Set(tunnisteet.map(tunnisteSlug)), [tunnisteet]);

  const ehdotukset = useMemo<Ehdotus[]>(
    () => etsiEhdotukset(kaikki, kysely, kaytossa, EHDOTUKSIA).map((t) => ({ value: t.nimi, maara: t.maara })),
    [kaikki, kysely, kaytossa],
  );
  const pikavalinnat = useMemo(
    () => suosituimmat(kaikki.filter((t) => !kaytossa.has(t.slug)), PIKAVALINTOJA),
    [kaikki, kaytossa],
  );

  // Kentän luominen uudelleen vie kohdistuksen; palautetaan se uuteen kenttään.
  useEffect(() => {
    if (kohdistaKenttaan.current) {
      kohdistaKenttaan.current = false;
      kenttaRef.current?.querySelector("input")?.focus();
    }
  }, [kenttaAvain]);

  /** Lisää syötteet. Palauttaa true, jos kentän voi tyhjentää. */
  function lisaa(syotteet: string[]): boolean {
    if (readOnly) return false;
    const lisatyt: string[] = [];
    const huomiot: Viesti[] = [];
    let tyhjenna = true;
    for (const syote of syotteet) {
      const tulos = tarkistaLisattava(syote, slugista, [...nykyiset.current, ...lisatyt]);
      if (tulos.ok) {
        lisatyt.push(tulos.nimi);
        if (tulos.muutettu) {
          huomiot.push({ teksti: `Lisätty “${tulos.nimi}” samassa muodossa kuin muissa uutisissa.`, savy: "info" });
        }
      } else if (tulos.syy !== "tyhja" || syotteet.length === 1) {
        huomiot.push({ teksti: hylkayksenSyy(tulos), savy: "varoitus" });
        // Virheellinen teksti jää kenttään korjattavaksi; päällekkäinen voi kadota.
        if (tulos.syy !== "kaytossa") tyhjenna = false;
      }
    }
    if (lisatyt.length > 0) {
      nykyiset.current = [...nykyiset.current, ...lisatyt];
      onChange([setIfMissing([]), insert(lisatyt, "after", [-1])]);
    }
    const varoitus = huomiot.find((h) => h?.savy === "varoitus");
    setViesti(
      varoitus ??
        huomiot[0] ??
        (lisatyt.length > 0 ? { teksti: `Lisätty: ${lisatyt.map((n) => `“${n}”`).join(", ")}.`, savy: "info" } : null),
    );
    return tyhjenna && lisatyt.length + huomiot.length > 0;
  }

  function lisaaKentasta(syotteet: string[], kohdista = true) {
    if (lisaa(syotteet)) {
      kesken.current = "";
      setKysely("");
      kohdistaKenttaan.current = kohdista;
      setKenttaAvain((a) => a + 1);
    }
  }

  function poista(indeksi: number) {
    if (readOnly) return;
    const nimi = nykyiset.current[indeksi];
    const jaljella = nykyiset.current.filter((_, i) => i !== indeksi);
    nykyiset.current = jaljella;
    // Viimeisen poisto jättää tyhjän listan (ei unset): `patch:tunnisteet`
    // täyttää vain uutiset, joilta kenttä puuttuu, eikä palauta tarkoituksella
    // tyhjennettyjä blogin tunnisteita.
    onChange(jaljella.length === 0 ? set([]) : unset([indeksi]));
    setViesti(nimi ? { teksti: `Poistettu “${siistiTunniste(nimi)}”.`, savy: "info" } : null);
    // Poistettu painike katoaa: kohdistus kirjoituskenttään, ettei se putoa sivun alkuun.
    kenttaRef.current?.querySelector("input")?.focus();
  }

  function kyselyMuuttui(uusi: string | null) {
    if (uusi === null) return; // tyhjennys valinnan, Escin tai poistumisen yhteydessä
    if (uusi.includes(",")) {
      // Pilkulla erotettu lista (esim. liitetty): lisätään kaikki osat.
      lisaaKentasta(uusi.split(","));
      return;
    }
    kesken.current = uusi;
    setKysely(uusi);
    if (uusi.trim()) setViesti(null);
  }

  function nappain(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      lisaaKentasta([kesken.current]);
    }
  }

  function peruutus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      kesken.current = "";
      setKysely("");
    }
  }

  function poistuttiin(event: FocusEvent<HTMLInputElement>) {
    if (kesken.current.trim()) lisaaKentasta([kesken.current], false);
    onBlur(event);
  }

  return (
    <Stack space={3}>
      {tunnisteet.length > 0 && (
        <Flex as="ul" wrap="wrap" gap={2} style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Uutisen tunnisteet">
          {tunnisteet.map((nimi, indeksi) => (
            <Card as="li" key={`${indeksi}-${nimi}`} border radius={2} tone="primary" paddingLeft={2}>
              <Flex align="center" gap={1}>
                <Text size={1} weight="medium">
                  {nimi}
                </Text>
                {!readOnly && (
                  <Button
                    icon={CloseIcon}
                    mode="bleed"
                    padding={2}
                    fontSize={1}
                    aria-label={`Poista tunniste ${nimi}`}
                    title={`Poista tunniste ${nimi}`}
                    onClick={() => poista(indeksi)}
                  />
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      {!readOnly && (
        <Stack space={2}>
          {/* Esc peruu kirjoitetun tekstin (myös ehdotuslistassa), jottei se lisäydy poistuttaessa. */}
          <div ref={kenttaRef} onKeyDownCapture={peruutus}>
            <Autocomplete<Ehdotus>
              key={kenttaAvain}
              id={id}
              // Studio kohdistaa kenttään tämän kautta (esim. validointivirheestä).
              ref={studioRef}
              aria-label="Lisää tunniste"
              aria-describedby={kuvaus}
              placeholder="Kirjoita tunniste ja paina Enter"
              options={ehdotukset}
              filterOption={() => true}
              onQueryChange={kyselyMuuttui}
              onSelect={(nimi) => lisaaKentasta([nimi])}
              onKeyDown={nappain}
              onFocus={onFocus}
              onBlur={poistuttiin}
              renderOption={(ehdotus) => (
                <Card as="button" padding={3} radius={2}>
                  <Flex align="center" gap={2}>
                    <Box flex={1}>
                      <Text size={1} textOverflow="ellipsis">
                        {ehdotus.value}
                      </Text>
                    </Box>
                    <Text size={1} muted>
                      · {uutistenMaara(ehdotus.maara)}
                    </Text>
                  </Flex>
                </Card>
              )}
            />
          </div>
          <Box role="status" aria-live="polite">
            {viesti?.savy === "varoitus" && (
              <Card tone="caution" border radius={2} padding={2}>
                <Text size={1}>{viesti.teksti}</Text>
              </Card>
            )}
            {viesti?.savy === "info" && (
              <Text size={1} muted>
                {viesti.teksti}
              </Text>
            )}
          </Box>
          {pikavalinnat.length > 0 && (
            <Flex wrap="wrap" gap={2} align="center">
              <Text size={1} muted>
                Suosituimmat:
              </Text>
              {pikavalinnat.map((t) => (
                <Button
                  key={t.slug}
                  mode="ghost"
                  icon={AddIcon}
                  text={t.nimi}
                  fontSize={1}
                  padding={2}
                  aria-label={`Lisää tunniste ${t.nimi} (${uutistenMaara(t.maara)})`}
                  title={uutistenMaara(t.maara)}
                  onClick={() => lisaaKentasta([t.nimi])}
                />
              ))}
            </Flex>
          )}
        </Stack>
      )}
    </Stack>
  );
}
