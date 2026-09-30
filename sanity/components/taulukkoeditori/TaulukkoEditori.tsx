import {
  AddIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CopyIcon,
  EditIcon,
  EllipsisVerticalIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import {
  memo,
  useLayoutEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useFormValue, type ArrayOfObjectsInputProps, type FormPatch } from "sanity";
import { styled } from "styled-components";

import {
  jasennaRuudukko,
  naytettavaArvo,
  normalisoiArvo,
  NUMEERISET,
  onRuudukko,
  ruudukkoTekstiksi,
  sarakeavain,
  SARAKETYYPIT,
  tyyppivaroitus,
} from "../../../lib/taulukko";
import { useDokumenttiPatch } from "./konteksti";
import {
  asetaSolu,
  korvaaTaulukko,
  lisaaRivit,
  lisaaSarake,
  muokkaaSaraketta,
  poistaRivi,
  poistaSarake,
  siirraRivi,
  siirraSaraketta,
  soluArvo,
  uusiAvain,
  uusiRivi,
  type Rivi,
  type Sarake,
  type Sijainti,
} from "./patchit";
import { SarakeDialogi } from "./SarakeDialogi";
import { TuontiDialogi } from "./TuontiDialogi";

/**
 * Tilastotaulukon editori (docs/19): taulukkolaskennan kaltainen ruudukko
 * `jalkapalloTilasto`-dokumentin `columns`- ja `rows`-kentille.
 *
 * Tietomalli on ennallaan (sarakkeet + rivien avain–arvo-solut), joten
 * sivuston kyselyt ja taulukko toimivat sellaisenaan. Editori piilottaa
 * mallin: sihteeri näkee sarakeotsikot ja solut kuten Excelissä.
 */
export function TaulukkoEditori(props: ArrayOfObjectsInputProps) {
  const patch = useDokumenttiPatch();
  const sarakkeet = useFormValue(["columns"]) as Sarake[] | undefined;
  // Ilman dokumentin juurisyötettä (konteksti) ei voi muokata sarakkeita:
  // näytetään Sanityn oletussyöte, jotta data on silti muokattavissa.
  if (!patch) return props.renderDefault(props);
  return (
    <Editori
      rivit={(props.value ?? []) as Rivi[]}
      sarakkeet={sarakkeet ?? []}
      readOnly={Boolean(props.readOnly)}
      patch={patch}
    />
  );
}

type Dialogi =
  | { tyyppi: "uusiSarake"; sijainti: Sijainti }
  | { tyyppi: "muokkaaSaraketta"; sarake: Sarake }
  | { tyyppi: "poistaSarake"; sarake: Sarake }
  | { tyyppi: "tuonti" };

interface EditoriProps {
  rivit: Rivi[];
  sarakkeet: Sarake[];
  readOnly: boolean;
  patch: (patchit: FormPatch[]) => void;
}

interface Tila {
  rivit: Rivi[];
  sarakkeet: Sarake[];
  naytettavat: { rivi: Rivi; numero: number }[];
  haku: string;
  patch: (patchit: FormPatch[]) => void;
  toast: ReturnType<typeof useToast>;
}

interface Asettajat {
  setHaku: (haku: string) => void;
  setDialogi: (dialogi: Dialogi | null) => void;
}

type SarakeToiminto = "muokkaa" | "vasemmalle" | "oikealle" | "lisaaVasemmalle" | "lisaaOikealle" | "poista";
type RiviToiminto = "ylle" | "alle" | "ylos" | "alas" | "poista";

/**
 * Editorin toiminnot. Luodaan kerran, ja ne lukevat tuoreen tilan vasta
 * tapahtumahetkellä, joten niiden identiteetti ei muutu ja muistetut rivit
 * renderöidään uudelleen vain, kun rivin oma data muuttuu. Komponentti
 * päivittää tilan jokaisen renderöinnin jälkeen (`paivita`).
 */
function luoToiminnot({ setHaku, setDialogi }: Asettajat) {
  const tila = { current: null as unknown as Tila };
  let kehys: HTMLDivElement | null = null;
  /** Uusi rivi, jonka ensimmäinen solu saa fokuksen, kun rivi on renderöity. */
  let fokusoitava: string | null = null;

  const paivita = (uusi: Tila) => {
    tila.current = uusi;
    if (fokusoitava && fokusoiRivi(fokusoitava)) fokusoitava = null;
  };
  const asetaKehys = (el: HTMLDivElement | null) => {
    kehys = el;
  };

  const siirry = (r: number, c: number): boolean => {
    const syote = kehys?.querySelector<HTMLInputElement>(`input[data-r="${r}"][data-c="${c}"]`);
    if (!syote) return false;
    syote.focus();
    syote.select();
    return true;
  };

  /** Fokus rivin ensimmäiseen soluun. Palauttaa false, jos riviä ei ole vielä renderöity. */
  function fokusoiRivi(riviKey: string): boolean {
    const syote = kehys?.querySelector<HTMLInputElement>(`input[data-rivi="${riviKey}"][data-c="0"]`);
    if (!syote) return false;
    syote.focus();
    syote.scrollIntoView({ block: "nearest", inline: "nearest" });
    return true;
  }

  const tallennaSolu = (riviKey: string, sarakeKey: string, syote: string) => {
    const { rivit, sarakkeet, patch } = tila.current;
    const rivi = rivit.find((r) => r._key === riviKey);
    const sarake = sarakkeet.find((s) => s._key === sarakeKey);
    if (!rivi || !sarake) return;
    const arvo = normalisoiArvo(syote, sarake.type);
    if (arvo === soluArvo(rivi, sarake)) return;
    patch(asetaSolu(rivi, sarake, arvo));
  };

  /** Useamman solun alue Excelistä: täytetään kohdasta (r, c) alkaen, rivejä lisätään tarvittaessa. */
  const liita = (r: number, c: number, teksti: string): boolean => {
    if (!onRuudukko(teksti)) return false;
    const { sarakkeet, naytettavat, haku, patch, toast } = tila.current;
    const ruudukko = jasennaRuudukko(teksti);
    const kohdeSarakkeet = sarakkeet.slice(c, c + (ruudukko[0]?.length ?? 0));
    const pois = (ruudukko[0]?.length ?? 0) - kohdeSarakkeet.length;
    const patchit: FormPatch[] = [];
    const uudet: Rivi[] = [];
    let ohitetut = 0;

    ruudukko.forEach((arvot, i) => {
      const kohde = naytettavat[r + i]?.rivi;
      if (!kohde) {
        // Haun aikana uusia rivejä ei lisätä: ne eivät näkyisi, ja järjestys olisi epäselvä.
        if (haku.trim()) {
          ohitetut += 1;
          return;
        }
        uudet.push(uusiRivi(sarakkeet, [...Array<string>(c).fill(""), ...arvot]));
        return;
      }
      kohdeSarakkeet.forEach((sarake, j) => {
        const arvo = normalisoiArvo(arvot[j] ?? "", sarake.type);
        if (arvo !== soluArvo(kohde, sarake)) patchit.push(...asetaSolu(kohde, sarake, arvo));
      });
    });
    if (uudet.length > 0) patchit.push(...lisaaRivit(uudet, "loppuun"));
    if (patchit.length > 0) patch(patchit);

    const huomiot = [
      uudet.length > 0 && `${uudet.length} uutta riviä lisättiin loppuun.`,
      pois > 0 && `${pois} saraketta jäi taulukon ulkopuolelle eikä niitä liitetty.`,
      ohitetut > 0 && `${ohitetut} riviä jätettiin pois, koska haku on päällä.`,
    ].filter(Boolean);
    toast.push({
      status: pois > 0 || ohitetut > 0 ? "warning" : "success",
      title: `Liitettiin ${ruudukko.length} × ${kohdeSarakkeet.length} solua`,
      description: huomiot.join(" ") || undefined,
    });
    return true;
  };

  const lisaaRiviLoppuun = () => {
    const { sarakkeet, patch } = tila.current;
    const rivi = uusiRivi(sarakkeet);
    setHaku("");
    patch(lisaaRivit([rivi], "loppuun"));
    fokusoitava = rivi._key;
  };

  const riviToiminto = (riviKey: string, toiminto: RiviToiminto) => {
    const { rivit, sarakkeet, patch, toast } = tila.current;
    const indeksi = rivit.findIndex((r) => r._key === riviKey);
    const rivi = rivit[indeksi];
    if (!rivi) return;
    switch (toiminto) {
      case "ylle":
      case "alle": {
        const uusi = uusiRivi(sarakkeet);
        patch(lisaaRivit([uusi], toiminto === "ylle" ? { ennen: riviKey } : { jalkeen: riviKey }));
        fokusoitava = uusi._key;
        return;
      }
      case "ylos":
      case "alas":
        patch(siirraRivi(rivit, rivi, toiminto === "ylos" ? -1 : 1));
        return;
      case "poista": {
        patch(poistaRivi(rivi));
        // Kumoa palauttaa rivin samaan kohtaan: edellisen rivin perään, tai
        // ensimmäiseksi, jos poistettu oli ensimmäinen.
        const edellinen = rivit[indeksi - 1]?._key;
        const kumoa = () => {
          const nyt = tila.current.rivit;
          if (nyt.some((r) => r._key === rivi._key)) return;
          let sijainti: Sijainti = "loppuun";
          if (edellinen && nyt.some((r) => r._key === edellinen)) sijainti = { jalkeen: edellinen };
          else if (indeksi === 0 && nyt[0]) sijainti = { ennen: nyt[0]._key };
          tila.current.patch(lisaaRivit([rivi], sijainti));
          tila.current.toast.push({ status: "success", title: `Rivi ${indeksi + 1} palautettu` });
        };
        toast.push({
          status: "info",
          title: `Rivi ${indeksi + 1} poistettu`,
          duration: 8000,
          closable: true,
          description: (
            <Box marginTop={2}>
              <Button mode="ghost" fontSize={1} padding={2} text="Kumoa" onClick={kumoa} />
            </Box>
          ),
        });
        return;
      }
    }
  };

  const sarakeToiminto = (sarake: Sarake, toiminto: SarakeToiminto) => {
    const { sarakkeet, patch } = tila.current;
    switch (toiminto) {
      case "muokkaa":
        return setDialogi({ tyyppi: "muokkaaSaraketta", sarake });
      case "vasemmalle":
      case "oikealle":
        return patch(siirraSaraketta(sarakkeet, sarake, toiminto === "vasemmalle" ? -1 : 1));
      case "lisaaVasemmalle":
        return setDialogi({ tyyppi: "uusiSarake", sijainti: { ennen: sarake._key } });
      case "lisaaOikealle":
        return setDialogi({ tyyppi: "uusiSarake", sijainti: { jalkeen: sarake._key } });
      case "poista":
        return setDialogi({ tyyppi: "poistaSarake", sarake });
    }
  };

  return {
    paivita,
    asetaKehys,
    siirry,
    tallennaSolu,
    liita,
    lisaaRiviLoppuun,
    riviToiminto,
    sarakeToiminto,
  };
}

const tyypinNimi = (t: string | undefined) => SARAKETYYPIT.find((x) => x.value === t)?.title ?? "Teksti";

function Editori({ rivit, sarakkeet, readOnly, patch }: EditoriProps) {
  const toast = useToast();
  const [haku, setHaku] = useState("");
  const [dialogi, setDialogi] = useState<Dialogi | null>(null);

  const naytettavat = useMemo(() => {
    const kaikki = rivit.map((rivi, indeksi) => ({ rivi, numero: indeksi + 1 }));
    const h = haku.trim().toLocaleLowerCase("fi");
    if (!h) return kaikki;
    return kaikki.filter(({ rivi }) =>
      sarakkeet.some((s) => naytettavaArvo(soluArvo(rivi, s), s.type).toLocaleLowerCase("fi").includes(h)),
    );
  }, [rivit, sarakkeet, haku]);


  const [toiminnot] = useState(() => luoToiminnot({ setHaku, setDialogi }));
  const { asetaKehys, siirry, tallennaSolu, liita, lisaaRiviLoppuun, riviToiminto, sarakeToiminto } = toiminnot;
  useLayoutEffect(() => {
    toiminnot.paivita({ rivit, sarakkeet, naytettavat, haku, patch, toast });
  });

  // Syötekentän leveys sarakkeen pisimmän arvon mukaan (4–40 merkkiä). Taulukko
  // pidetään samana, kun leveydet eivät muutu, jotta muistetut rivit eivät
  // renderöidy uudelleen jokaisen solun tallennuksen jälkeen.
  const leveysAvain = useMemo(
    () =>
      sarakkeet
        .map((s) => {
          let pisin = s.label.length;
          for (const rivi of rivit) pisin = Math.max(pisin, naytettavaArvo(soluArvo(rivi, s), s.type).length);
          return Math.min(40, Math.max(NUMEERISET.has(s.type ?? "text") ? 4 : 8, pisin + 1));
        })
        .join(","),
    [rivit, sarakkeet],
  );
  const leveydet = useMemo(() => leveysAvain.split(",").map(Number), [leveysAvain]);



  const kopioi = async () => {
    const ruudukko = [
      sarakkeet.map((s) => s.label),
      ...rivit.map((rivi) => sarakkeet.map((s) => naytettavaArvo(soluArvo(rivi, s), s.type))),
    ];
    try {
      await navigator.clipboard.writeText(ruudukkoTekstiksi(ruudukko));
      toast.push({
        status: "success",
        title: "Taulukko kopioitu",
        description: "Liitä se Exceliin tai Google Sheetsiin (Ctrl+V). Muokattu taulukko tuodaan takaisin Tuo Excelistä -painikkeella.",
      });
    } catch {
      toast.push({ status: "error", title: "Kopiointi ei onnistunut", description: "Selain esti leikepöydän käytön." });
    }
  };

  const sulje = () => setDialogi(null);
  const hakuPaalla = haku.trim() !== "";

  return (
    <Stack space={3}>
      <Flex gap={2} wrap="wrap" align="center">
        <Box flex={1} style={{ minWidth: 200 }}>
          <TextInput
            icon={SearchIcon}
            placeholder="Etsi taulukosta"
            aria-label="Etsi taulukosta"
            value={haku}
            onChange={(e) => setHaku(e.currentTarget.value)}
            clearButton={hakuPaalla}
            onClear={() => setHaku("")}
            fontSize={1}
          />
        </Box>
        <Button
          icon={AddIcon}
          text="Lisää sarake"
          mode="ghost"
          fontSize={1}
          disabled={readOnly}
          onClick={() => setDialogi({ tyyppi: "uusiSarake", sijainti: "loppuun" })}
        />
        <Button
          icon={UploadIcon}
          text="Tuo Excelistä"
          mode="ghost"
          fontSize={1}
          disabled={readOnly}
          onClick={() => setDialogi({ tyyppi: "tuonti" })}
        />
        <Button
          icon={CopyIcon}
          text="Kopioi Exceliin"
          mode="ghost"
          fontSize={1}
          disabled={rivit.length === 0}
          onClick={kopioi}
        />
      </Flex>

      {sarakkeet.length === 0 ? (
        <Card padding={5} radius={2} border tone="transparent">
          <Stack space={4}>
            <Text align="center" size={1} weight="semibold">
              Taulukossa ei ole vielä sarakkeita
            </Text>
            <Text align="center" size={1} muted>
              Lisää sarakkeet yksi kerrallaan tai tuo koko taulukko Excelistä.
            </Text>
            <Flex gap={2} justify="center" wrap="wrap">
              <Button
                icon={AddIcon}
                text="Lisää sarake"
                tone="primary"
                disabled={readOnly}
                onClick={() => setDialogi({ tyyppi: "uusiSarake", sijainti: "loppuun" })}
              />
              <Button
                icon={UploadIcon}
                text="Tuo Excelistä"
                mode="ghost"
                disabled={readOnly}
                onClick={() => setDialogi({ tyyppi: "tuonti" })}
              />
            </Flex>
          </Stack>
        </Card>
      ) : (
        <>
          <Kehys ref={asetaKehys}>
            <Taulu>
              <thead>
                <tr>
                  <th className="reunus" scope="col">
                    <span className="piilossa">Rivi</span>
                  </th>
                  {sarakkeet.map((sarake, c) => (
                    <th key={sarake._key} scope="col" className={c === 0 ? "eka" : undefined}>
                      <Flex align="center" gap={1} paddingLeft={2}>
                        <Stack space={2} flex={1} paddingY={2}>
                          <Text size={1} weight="semibold" textOverflow="ellipsis">
                            {sarake.label}
                          </Text>
                          <Text size={0} muted>
                            {tyypinNimi(sarake.type)}
                          </Text>
                        </Stack>
                        {!readOnly && (
                          <SarakeValikko
                            sarake={sarake}
                            ensimmainen={c === 0}
                            viimeinen={c === sarakkeet.length - 1}
                            onToiminto={sarakeToiminto}
                          />
                        )}
                      </Flex>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {naytettavat.map(({ rivi, numero }, r) => (
                  <RiviKomponentti
                    key={rivi._key}
                    rivi={rivi}
                    numero={numero}
                    r={r}
                    sarakkeet={sarakkeet}
                    leveydet={leveydet}
                    readOnly={readOnly}
                    ensimmainen={numero === 1}
                    viimeinen={numero === rivit.length}
                    siirrettava={!hakuPaalla}
                    onTallenna={tallennaSolu}
                    onSiirry={siirry}
                    onLiita={liita}
                    onToiminto={riviToiminto}
                  />
                ))}
              </tbody>
            </Taulu>
            {naytettavat.length === 0 && (
              <Box padding={4}>
                <Text size={1} muted align="center">
                  {hakuPaalla ? `Haulla "${haku.trim()}" ei löytynyt rivejä.` : "Taulukossa ei ole vielä rivejä."}
                </Text>
              </Box>
            )}
          </Kehys>

          <Flex gap={3} align="center" wrap="wrap" justify="space-between">
            <Button icon={AddIcon} text="Lisää rivi" mode="ghost" fontSize={1} disabled={readOnly} onClick={lisaaRiviLoppuun} />
            <Text size={1} muted>
              {hakuPaalla
                ? `Näytetään ${naytettavat.length} / ${rivit.length} riviä`
                : `${rivit.length} riviä · ${sarakkeet.length} saraketta`}
            </Text>
          </Flex>
          <Text size={1} muted>
            Liitä soluja suoraan Excelistä: napsauta solua ja paina Ctrl+V. Enter siirtää alas, nuolinäppäimet
            solusta toiseen ja Esc peruu muutoksen. Muutokset tallentuvat, kun siirryt pois solusta.
          </Text>
        </>
      )}

      {dialogi?.tyyppi === "uusiSarake" && (
        <SarakeDialogi
          otsikko="Uusi sarake"
          onPeru={sulje}
          onTallenna={({ label, type }) => {
            const varatut = [
              ...sarakkeet.map((s) => s.key),
              ...rivit.flatMap((r) => (r.cells ?? []).map((c) => c.key)),
            ];
            patch(lisaaSarake({ _key: uusiAvain(), key: sarakeavain(label, varatut), label, type }, dialogi.sijainti));
            sulje();
          }}
        />
      )}

      {dialogi?.tyyppi === "muokkaaSaraketta" && (
        <SarakeDialogi
          otsikko="Muokkaa saraketta"
          muokkaus
          alku={{ label: dialogi.sarake.label, type: dialogi.sarake.type ?? "text" }}
          onPeru={sulje}
          onTallenna={(uusi) => {
            const patchit = muokkaaSaraketta(rivit, dialogi.sarake, uusi);
            if (patchit.length > 0) patch(patchit);
            sulje();
          }}
        />
      )}

      {dialogi?.tyyppi === "poistaSarake" && (
        <PoistaSarakeDialogi
          sarake={dialogi.sarake}
          taytettyja={rivit.filter((r) => soluArvo(r, dialogi.sarake) !== "").length}
          onPeru={sulje}
          onPoista={() => {
            patch(poistaSarake(rivit, dialogi.sarake));
            sulje();
          }}
        />
      )}

      {dialogi?.tyyppi === "tuonti" && (
        <TuontiDialogi
          sarakkeet={sarakkeet}
          rivienMaara={rivit.length}
          onPeru={sulje}
          onKorvaa={(uudetSarakkeet, uudetRivit) => {
            patch(korvaaTaulukko(uudetSarakkeet, uudetRivit));
            setHaku("");
            sulje();
            toast.push({ status: "success", title: `Taulukko korvattu: ${uudetRivit.length} riviä` });
          }}
          onLisaa={(uudetRivit) => {
            if (uudetRivit.length > 0) patch(lisaaRivit(uudetRivit, "loppuun"));
            setHaku("");
            sulje();
            toast.push({ status: "success", title: `${uudetRivit.length} riviä lisätty loppuun` });
          }}
        />
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Rivi ja solu
// ---------------------------------------------------------------------------

interface RiviProps {
  rivi: Rivi;
  numero: number;
  r: number;
  sarakkeet: Sarake[];
  leveydet: number[];
  readOnly: boolean;
  ensimmainen: boolean;
  viimeinen: boolean;
  siirrettava: boolean;
  onTallenna: (riviKey: string, sarakeKey: string, arvo: string) => void;
  onSiirry: (r: number, c: number) => boolean;
  onLiita: (r: number, c: number, teksti: string) => boolean;
  onToiminto: (riviKey: string, toiminto: RiviToiminto) => void;
}

/** Rivi renderöidään uudelleen vain, kun sen oma data muuttuu (Sanity säilyttää muuttumattomat oliot). */
const RiviKomponentti = memo(function RiviKomponentti({
  rivi,
  numero,
  r,
  sarakkeet,
  leveydet,
  readOnly,
  ensimmainen,
  viimeinen,
  siirrettava,
  onTallenna,
  onSiirry,
  onLiita,
  onToiminto,
}: RiviProps) {
  return (
    <tr>
      <th scope="row" className="reunus">
        <Flex align="center" justify="space-between" paddingLeft={2}>
          <Text size={0} muted>
            {numero}
          </Text>
          {!readOnly && (
            <MenuButton
              id={`rivi-${rivi._key}`}
              button={<Button icon={EllipsisVerticalIcon} mode="bleed" padding={2} fontSize={1} aria-label={`Rivin ${numero} toiminnot`} />}
              popover={{ portal: true, placement: "right-start" }}
              menu={
                <Menu>
                  <MenuItem icon={InsertAboveIcon} text="Lisää rivi yläpuolelle" onClick={() => onToiminto(rivi._key, "ylle")} />
                  <MenuItem icon={InsertBelowIcon} text="Lisää rivi alapuolelle" onClick={() => onToiminto(rivi._key, "alle")} />
                  <MenuDivider />
                  <MenuItem icon={ArrowUpIcon} text="Siirrä ylös" disabled={!siirrettava || ensimmainen} onClick={() => onToiminto(rivi._key, "ylos")} />
                  <MenuItem icon={ArrowDownIcon} text="Siirrä alas" disabled={!siirrettava || viimeinen} onClick={() => onToiminto(rivi._key, "alas")} />
                  <MenuDivider />
                  <MenuItem icon={TrashIcon} tone="critical" text="Poista rivi" onClick={() => onToiminto(rivi._key, "poista")} />
                </Menu>
              }
            />
          )}
        </Flex>
      </th>
      {sarakkeet.map((sarake, c) => {
        const arvo = soluArvo(rivi, sarake);
        return (
          <td key={sarake._key} className={c === 0 ? "eka" : undefined}>
            <Solu
              // Avain vaihtuu, kun tallennettu arvo muuttuu: syöte näyttää aina tuoreen arvon.
              key={arvo}
              arvo={arvo}
              tyyppi={sarake.type}
              riviKey={rivi._key}
              sarakeKey={sarake._key}
              r={r}
              c={c}
              leveys={leveydet[c] ?? 8}
              label={`${sarake.label}, rivi ${numero}`}
              readOnly={readOnly}
              onTallenna={onTallenna}
              onSiirry={onSiirry}
              onLiita={onLiita}
            />
          </td>
        );
      })}
    </tr>
  );
});

interface SoluProps {
  arvo: string;
  tyyppi: Sarake["type"];
  riviKey: string;
  sarakeKey: string;
  r: number;
  c: number;
  leveys: number;
  label: string;
  readOnly: boolean;
  onTallenna: RiviProps["onTallenna"];
  onSiirry: RiviProps["onSiirry"];
  onLiita: RiviProps["onLiita"];
}

/**
 * Yksi solu. Syöte on hallitsematon: kirjoittaminen ei renderöi taulukkoa
 * uudelleen, ja arvo tallennetaan vasta, kun solusta poistutaan.
 */
function Solu({ arvo, tyyppi, riviKey, sarakeKey, r, c, leveys, label, readOnly, onTallenna, onSiirry, onLiita }: SoluProps) {
  const naytto = naytettavaArvo(arvo, tyyppi);
  const varoitus = tyyppivaroitus(arvo, tyyppi);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const alussa = el.selectionStart === 0 && el.selectionEnd === 0;
    const lopussa = el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!onSiirry(r + (e.shiftKey ? -1 : 1), c)) el.blur();
        return;
      case "ArrowDown":
        e.preventDefault();
        onSiirry(r + 1, c);
        return;
      case "ArrowUp":
        e.preventDefault();
        onSiirry(r - 1, c);
        return;
      case "ArrowLeft":
        if (alussa && onSiirry(r, c - 1)) e.preventDefault();
        return;
      case "ArrowRight":
        if (lopussa && onSiirry(r, c + 1)) e.preventDefault();
        return;
      case "Escape":
        // Peru kirjoitettu muutos; ei suljeta Studion paneelia.
        e.stopPropagation();
        el.value = naytto;
        el.select();
        return;
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (onLiita(r, c, e.clipboardData.getData("text/plain"))) e.preventDefault();
  };

  return (
    <SoluSyote
      defaultValue={naytto}
      readOnly={readOnly}
      size={leveys}
      aria-label={label}
      aria-invalid={varoitus ? true : undefined}
      title={varoitus ?? undefined}
      data-r={r}
      data-c={c}
      data-rivi={riviKey}
      data-numeerinen={NUMEERISET.has(tyyppi ?? "text") || undefined}
      data-varoitus={varoitus ? true : undefined}
      spellCheck={false}
      autoComplete="off"
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onBlur={(e) => {
        if (e.currentTarget.value !== naytto) onTallenna(riviKey, sarakeKey, e.currentTarget.value);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Sarakkeen valikko ja poisto
// ---------------------------------------------------------------------------

function SarakeValikko({
  sarake,
  ensimmainen,
  viimeinen,
  onToiminto,
}: {
  sarake: Sarake;
  ensimmainen: boolean;
  viimeinen: boolean;
  onToiminto: (sarake: Sarake, toiminto: SarakeToiminto) => void;
}) {
  return (
    <MenuButton
      id={`sarake-${sarake._key}`}
      button={<Button icon={EllipsisVerticalIcon} mode="bleed" padding={2} fontSize={1} aria-label={`Sarakkeen ${sarake.label} toiminnot`} />}
      popover={{ portal: true, placement: "bottom-end" }}
      menu={
        <Menu>
          <MenuItem icon={EditIcon} text="Muokkaa nimeä ja tyyppiä" onClick={() => onToiminto(sarake, "muokkaa")} />
          <MenuDivider />
          <MenuItem icon={AddIcon} text="Lisää sarake vasemmalle" onClick={() => onToiminto(sarake, "lisaaVasemmalle")} />
          <MenuItem icon={AddIcon} text="Lisää sarake oikealle" onClick={() => onToiminto(sarake, "lisaaOikealle")} />
          <MenuDivider />
          <MenuItem icon={ArrowLeftIcon} text="Siirrä vasemmalle" disabled={ensimmainen} onClick={() => onToiminto(sarake, "vasemmalle")} />
          <MenuItem icon={ArrowRightIcon} text="Siirrä oikealle" disabled={viimeinen} onClick={() => onToiminto(sarake, "oikealle")} />
          <MenuDivider />
          <MenuItem icon={TrashIcon} tone="critical" text="Poista sarake" onClick={() => onToiminto(sarake, "poista")} />
        </Menu>
      }
    />
  );
}

function PoistaSarakeDialogi({
  sarake,
  taytettyja,
  onPeru,
  onPoista,
}: {
  sarake: Sarake;
  taytettyja: number;
  onPeru: () => void;
  onPoista: () => void;
}) {
  return (
    <Dialog
      id={`poista-sarake-${sarake._key}`}
      header={`Poistetaanko sarake "${sarake.label}"?`}
      onClose={onPeru}
      width={1}
      footer={
        <Flex gap={2} justify="flex-end" padding={3}>
          <Button mode="bleed" text="Peru" onClick={onPeru} />
          <Button tone="critical" text="Poista sarake" onClick={onPoista} />
        </Flex>
      }
    >
      <Box padding={4}>
        <Text size={1}>
          {taytettyja > 0
            ? `Sarakkeessa on ${taytettyja} täytettyä solua. Ne poistetaan kaikilta riveiltä. Poiston voi perua versiohistoriasta (kellokuvake).`
            : "Sarake on tyhjä."}
        </Text>
      </Box>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tyylit: Sanity UI:n teeman värit, joten vaalea ja tumma tila toimivat.
// ---------------------------------------------------------------------------

const REUNUS = "3.75rem";

const Kehys = styled.div`
  max-height: min(70vh, 720px);
  overflow: auto;
  border: 1px solid var(--card-border-color);
  border-radius: 6px;
  background: var(--card-bg-color);
`;

const Taulu = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  min-width: 100%;
  font-size: 0.8125rem;

  th,
  td {
    padding: 0;
    background: var(--card-bg-color);
    border-right: 1px solid var(--card-hairline-soft-color, var(--card-border-color));
    border-bottom: 1px solid var(--card-hairline-soft-color, var(--card-border-color));
    text-align: left;
    vertical-align: middle;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--card-muted-bg-color, var(--card-bg-color));
    border-bottom: 1px solid var(--card-hairline-hard-color, var(--card-border-color));
    font-weight: inherit;
    max-width: 22rem;
  }

  .reunus {
    position: sticky;
    left: 0;
    z-index: 1;
    width: ${REUNUS};
    min-width: ${REUNUS};
    background: var(--card-muted-bg-color, var(--card-bg-color));
  }

  /* Ensimmäinen sarake (yleensä nimi tai vuosi) pysyy näkyvissä vieritettäessä. */
  .eka {
    position: sticky;
    left: ${REUNUS};
    z-index: 1;
    border-right: 1px solid var(--card-hairline-hard-color, var(--card-border-color));
  }

  thead .reunus,
  thead .eka {
    z-index: 3;
  }

  tbody tr:hover td,
  tbody tr:hover th {
    background: var(--card-muted-bg-color, var(--card-bg-color));
  }

  .piilossa {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

const SoluSyote = styled.input`
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0.5rem 0.625rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--card-fg-color);
  font: inherit;
  line-height: 1.25;

  &[data-numeerinen] {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  &[data-varoitus] {
    text-decoration: underline wavy var(--card-badge-caution-dot-color, #d9a400);
    text-underline-offset: 3px;
  }

  &:focus {
    outline: 2px solid var(--card-focus-ring-color);
    outline-offset: -2px;
    background: var(--card-bg-color);
    position: relative;
    z-index: 1;
  }

  &[readonly] {
    cursor: default;
  }
`;
